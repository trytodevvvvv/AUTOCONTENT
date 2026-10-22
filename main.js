const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme, session } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// Helper to compare semantic versions (e.g., '1.1.0' > '1.0.0')
function compareVersions(v1, v2) {
  const clean1 = (v1 || '').replace(/^v/i, '').trim();
  const clean2 = (v2 || '').replace(/^v/i, '').trim();
  const parts1 = clean1.split('.').map(Number);
  const parts2 = clean2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// ===================================================================
// HOT-UPDATE BUNDLE HANDOFF (LOADS LATEST CODE FROM USER DATA IF PRESENT)
// ===================================================================
let USER_DATA_DIR = '';
try {
  USER_DATA_DIR = app.getPath('userData');
} catch (e) {
  USER_DATA_DIR = __dirname;
}

const CURRENT_BUNDLE_DIR = path.join(USER_DATA_DIR, 'current_bundle');
const BUNDLE_MAIN = path.join(CURRENT_BUNDLE_DIR, 'main.js');
const BUNDLE_PKG = path.join(CURRENT_BUNDLE_DIR, 'package.json');

// Check if current context is already executing inside the bundle (prevents self-require recursion)
const isAlreadyRunningBundle = path.resolve(__dirname).toLowerCase() === path.resolve(CURRENT_BUNDLE_DIR).toLowerCase();

if (!isAlreadyRunningBundle && fs.existsSync(BUNDLE_MAIN) && fs.existsSync(BUNDLE_PKG)) {
  try {
    const bundlePkg = JSON.parse(fs.readFileSync(BUNDLE_PKG, 'utf-8'));
    const basePkgPath = path.join(__dirname, 'package.json');
    const basePkg = fs.existsSync(basePkgPath) ? JSON.parse(fs.readFileSync(basePkgPath, 'utf-8')) : { version: '0.0.0' };
    if (compareVersions(bundlePkg.version, basePkg.version) >= 0) {
      process.env.AUTOCONTENT_APP_PATH = CURRENT_BUNDLE_DIR;
      require(BUNDLE_MAIN);
      return;
    }
  } catch (err) {
    console.error('Failed to load hot-update bundle, falling back to base application:', err);
    try {
      fs.rmSync(CURRENT_BUNDLE_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
}

// Active root directory (either updated bundle or base app)
const APP_ROOT = isAlreadyRunningBundle ? __dirname : (process.env.AUTOCONTENT_APP_PATH || __dirname);

let mainWindow;

function getSavedApisPath() {
  if (app.isPackaged) {
    return path.join(USER_DATA_DIR, 'saved_apis.json');
  }
  return path.join(__dirname, 'saved_apis.json');
}

function loadSavedApis() {
  const filePath = getSavedApisPath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading saved_apis.json:', err);
  }

  // Initial clean state if user has not saved any API yet
  return {
    activeProviderId: '',
    activeModelId: '',
    providers: []
  };
}

function saveSavedApis(data) {
  const filePath = getSavedApisPath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving saved_apis.json:', err);
    return { success: false, error: err.message };
  }
}

function createWindow() {
  const iconPath = path.join(APP_ROOT, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
  const fallbackIcon = path.join(APP_ROOT, 'assets', 'icon.png');

  const isWindows = process.platform === 'win32';

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1080,
    minHeight: 700,
    title: 'AutoContent Studio - AI Scriptwriter',
    backgroundColor: '#FAF5FF',
    icon: fs.existsSync(iconPath) ? iconPath : fallbackIcon,
    autoHideMenuBar: true,
    titleBarStyle: isWindows ? 'hidden' : 'default',
    titleBarOverlay: isWindows ? {
      color: '#FAF5FF',
      symbolColor: '#334155',
      height: 32
    } : false,
    show: false,
    webPreferences: {
      preload: path.join(APP_ROOT, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Completely remove and hide the default File, Edit, View, Window menu
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  if (mainWindow.webContents && mainWindow.webContents.session) {
    mainWindow.webContents.session.clearCache().catch(() => {});
  }

  mainWindow.loadFile(path.join(APP_ROOT, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Safe IPC Registration Helper to prevent duplicate channel registration conflicts
function registerIpcHandler(channel, handler) {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, handler);
}

// IPC Handlers
registerIpcHandler('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

registerIpcHandler('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

registerIpcHandler('window-close', () => {
  if (mainWindow) mainWindow.close();
});

registerIpcHandler('get-saved-apis', () => {
  return loadSavedApis();
});

registerIpcHandler('save-saved-apis', (event, data) => {
  return saveSavedApis(data);
});

registerIpcHandler('get-settings', () => {
  return loadSavedApis();
});

registerIpcHandler('save-settings', (event, settings) => {
  return saveSavedApis(settings);
});

registerIpcHandler('open-file-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Chọn file kịch bản hoặc văn bản gốc',
      properties: ['openFile'],
      filters: [
        { name: 'Văn bản kịch bản (*.txt, *.md, *.docx, *.srt)', extensions: ['txt', 'md', 'docx', 'srt'] },
        { name: 'Tất cả các tệp (*.*)', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath);

    if (ext === '.docx') {
      try {
        const { execSync } = require('child_process');
        const pyScript = `import zipfile, xml.etree.ElementTree as ET, sys
try:
    with zipfile.ZipFile(r'''${filePath}''') as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        texts = [node.text for node in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
        print('\\n'.join(texts))
except Exception as e:
    sys.exit(1)
`;
        const output = execSync(`python -c "${pyScript.replace(/\n/g, ' ')}"`, { encoding: 'utf-8' });
        return { success: true, content: output.trim(), filename };
      } catch (docErr) {
        return { success: false, error: 'Không thể trích xuất file .docx: ' + docErr.message };
      }
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filename };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

function resolveBaseUrl(provider) {
  let baseUrl = (provider.baseUrl || '').trim().replace(/\/+$/, '');
  const apiKey = (provider.apiKey || '').trim();
  const isKeyOnly = (provider.providerType === 'gemini');

  if (isKeyOnly || !baseUrl || baseUrl.includes('your-provider.com')) {
    if (apiKey.startsWith('AIzaSy')) {
      return 'https://generativelanguage.googleapis.com/v1beta/openai';
    } else if (apiKey.startsWith('gsk_')) {
      return 'https://api.groq.com/openai/v1';
    } else if (apiKey.startsWith('sk-or-')) {
      return 'https://openrouter.ai/api/v1';
    } else if (isKeyOnly) {
      return 'https://generativelanguage.googleapis.com/v1beta/openai';
    }
  }
  return baseUrl;
}

registerIpcHandler('test-connection', async (event, provider) => {
  try {
    const isGemini = provider.providerType === 'gemini' || (provider.apiKey && provider.apiKey.trim().startsWith('AIzaSy'));
    const baseUrl = resolveBaseUrl(provider);
    const apiKey = (provider.apiKey || '').trim();

    if (!baseUrl) {
      return { success: false, error: 'Chưa cấu hình Base URL máy chủ.' };
    }
    if (!apiKey) {
      return { success: false, error: 'Chưa nhập API Key. Vui lòng dán API Key vào ô phía trên.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let res;
    try {
      res = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
    } catch (netErr) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: `Không thể kết nối tới ${baseUrl}. Vui lòng kiểm tra lại mạng hoặc Base URL (${netErr.message})`
      };
    }
    clearTimeout(timeoutId);

    if (res.status === 401) {
      let serverMsg = 'API Key không chính xác hoặc đã hết hạn';
      try {
        const errJson = await res.json();
        if (errJson.error?.message) serverMsg = errJson.error.message;
      } catch (e) {}
      return { success: false, error: `Lỗi 401 (Unauthorized): ${serverMsg}` };
    }

    if (res.status === 403) {
      let serverMsg = 'Tài khoản không có quyền truy cập hoặc hết số dư';
      try {
        const errJson = await res.json();
        if (errJson.error?.message) serverMsg = errJson.error.message;
      } catch (e) {}
      return { success: false, error: `Lỗi 403 (Forbidden): ${serverMsg}` };
    }

    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data.data) ? data.data.length : (Array.isArray(data) ? data.length : 0);
      return {
        success: true,
        message: `Xác thực thành công! Máy chủ phản hồi 200 OK (${count > 0 ? count + ' models khả dụng' : 'Sẵn sàng'}).`
      };
    }

    // If 404 on /models, attempt a minimal chat test
    if (res.status === 404) {
      const chatController = new AbortController();
      const chatTimeout = setTimeout(() => chatController.abort(), 10000);
      try {
        const testModel = (provider.models && provider.models[0]?.id) || (isGemini ? 'gemini-3.8-flash-lite' : 'default');
        const chatRes = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1
          }),
          signal: chatController.signal
        });
        clearTimeout(chatTimeout);

        if (chatRes.ok) {
          return { success: true, message: 'Xác thực thành công qua /chat/completions (200 OK)!' };
        }
        if (chatRes.status === 401) {
          return { success: false, error: 'Lỗi 401 (Unauthorized): API Key không chính xác.' };
        }
        let errMsg = `HTTP ${chatRes.status}`;
        try {
          const errData = await chatRes.json();
          if (errData.error?.message) errMsg = errData.error.message;
        } catch (e) {}
        return { success: false, error: `Máy chủ từ chối: ${errMsg}` };
      } catch (e) {
        clearTimeout(chatTimeout);
        return { success: false, error: `Lỗi kết nối máy chủ: ${e.message}` };
      }
    }

    let errMsg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.error?.message) errMsg = errJson.error.message;
    } catch (e) {}
    return { success: false, error: `Máy chủ trả về: ${errMsg}` };

  } catch (err) {
    return { success: false, error: err.name === 'AbortError' ? 'Quá thời gian chờ phản hồi từ máy chủ (12s).' : err.message };
  }
});

registerIpcHandler('fetch-models', async (event, provider) => {
  try {
    const baseUrl = resolveBaseUrl(provider);
    const apiKey = provider.apiKey || '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let msg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) msg = errJson.error.message;
      } catch (e) {}
      return { success: false, error: msg };
    }

    const data = await res.json();
    let rawList = [];
    if (Array.isArray(data.data)) {
      rawList = data.data;
    } else if (Array.isArray(data)) {
      rawList = data;
    } else if (data.models && Array.isArray(data.models)) {
      rawList = data.models;
    }

    const models = rawList.map(m => {
      const id = typeof m === 'string' ? m : (m.id || m.name);
      const name = typeof m === 'object' && m.name ? m.name : id;
      return { id, name };
    }).filter(m => m.id);

    return { success: true, models };
  } catch (err) {
    return { success: false, error: err.name === 'AbortError' ? 'Quá thời gian kết nối (15s).' : err.message };
  }
});

registerIpcHandler('save-file-dialog', async (event, { content, defaultFilename, ext = 'txt' }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Lưu Kịch Bản Ra File',
      defaultPath: defaultFilename || `kich-ban-${Date.now()}.${ext}`,
      filters: [
        { name: 'Văn bản (*.' + ext + ')', extensions: [ext] },
        { name: 'Tất cả các tệp (*.*)', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, content, 'utf-8');
      return { success: true, filePath: result.filePath };
    }
    return { canceled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

registerIpcHandler('open-external', async (event, url) => {
  try {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'Invalid URL' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

registerIpcHandler('window-minimize', () => mainWindow?.minimize());
registerIpcHandler('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
registerIpcHandler('window-close', () => mainWindow?.close());

// ===================================================================
// GITHUB AUTO-UPDATE & HOT-CODE UPDATE SYSTEM (LIVE OTA)
// ===================================================================
const GITHUB_OWNER = 'trytodevvvvv';
const GITHUB_REPO = 'AUTOCONTENT';

function getCurrentlyRunningVersion() {
  try {
    const pkgPath = path.join(APP_ROOT, 'package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
    }
  } catch (e) {}
  return app.getVersion();
}

function fetchRemotePackageJson() {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const options = {
      hostname: 'raw.githubusercontent.com',
      path: `/${GITHUB_OWNER}/${GITHUB_REPO}/main/package.json?_t=${timestamp}`,
      method: 'GET',
      headers: {
        'User-Agent': 'AutoContent-Studio-App',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

function fetchLatestGithubTag() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/tags`,
      method: 'GET',
      headers: {
        'User-Agent': 'AutoContent-Studio-App'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const tags = JSON.parse(data);
            if (Array.isArray(tags) && tags.length > 0 && tags[0].name) {
              resolve(tags[0]);
              return;
            }
          } catch (e) {}
        }
        resolve(null);
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

function fetchLatestGithubRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'AutoContent-Studio-App'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Lỗi phân tích dữ liệu cập nhật từ GitHub.'));
          }
        } else if (res.statusCode === 404) {
          resolve(null);
        } else {
          reject(new Error(`GitHub phản hồi mã: ${res.statusCode}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Hết thời gian chờ kết nối GitHub (Timeout)'));
    });
    req.end();
  });
}

async function checkAppUpdates(manual = false) {
  const currentVersion = getCurrentlyRunningVersion();
  try {
    const release = await fetchLatestGithubRelease().catch(() => null);
    let latestVersion = '';
    let releaseName = '';
    let releaseNotes = '';
    let downloadUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
    let zipUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/zipball/main`;

    if (release && release.tag_name) {
      latestVersion = release.tag_name.replace(/^v/i, '');
      releaseName = release.name || `Bản phát hành v${latestVersion}`;
      releaseNotes = release.body || 'Phiên bản cải tiến hiệu năng và tính năng mới.';
      downloadUrl = release.html_url;

      if (Array.isArray(release.assets) && release.assets.length > 0) {
        const exeAsset = release.assets.find(a => a.name && a.name.toLowerCase().endsWith('.exe'));
        if (exeAsset && exeAsset.browser_download_url) {
          downloadUrl = exeAsset.browser_download_url;
        }
      }
      zipUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/zipball/${release.tag_name}`;
    } else {
      // 1st Fallback: Check newest Git Tag directly
      const latestTag = await fetchLatestGithubTag().catch(() => null);
      if (latestTag && latestTag.name) {
        latestVersion = latestTag.name.replace(/^v/i, '');
        releaseName = `Bản cập nhật v${latestVersion}`;
        releaseNotes = 'Cập nhật trực tiếp mã nguồn mới nhất từ kho lưu trữ GitHub.';
        downloadUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${latestTag.name}`;
        zipUrl = latestTag.zipball_url || `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/zipball/${latestTag.name}`;
      } else {
        // 2nd Fallback: Check package.json on main branch directly (cache-busting)
        const remotePkg = await fetchRemotePackageJson();
        if (remotePkg && remotePkg.version) {
          latestVersion = remotePkg.version;
          releaseName = `Bản cập nhật mã nguồn v${latestVersion}`;
          releaseNotes = 'Cập nhật trực tiếp mã nguồn mới nhất từ kho lưu trữ GitHub.';
          downloadUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
          zipUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/zipball/main`;
        }
      }
    }

    if (!latestVersion) {
      return {
        hasUpdate: false,
        currentVersion: `v${currentVersion}`,
        latestVersion: `v${currentVersion}`,
        message: 'Bạn đang sử dụng phiên bản mới nhất!'
      };
    }

    const isNewer = compareVersions(latestVersion, currentVersion) > 0;

    if (isNewer) {
      const updateData = {
        hasUpdate: true,
        currentVersion: `v${currentVersion}`,
        latestVersion: `v${latestVersion}`,
        releaseName: releaseName,
        releaseNotes: releaseNotes,
        downloadUrl: downloadUrl,
        zipUrl: zipUrl
      };

      if (!manual && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-available', updateData);
      }

      return updateData;
    }

    return {
      hasUpdate: false,
      currentVersion: `v${currentVersion}`,
      latestVersion: `v${latestVersion}`,
      message: 'Bạn đang sử dụng phiên bản mới nhất!'
    };
  } catch (err) {
    return {
      hasUpdate: false,
      currentVersion: `v${currentVersion}`,
      error: err.message
    };
  }
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { headers: { 'User-Agent': 'AutoContent-Studio-App' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Tải bản cập nhật thất bại (HTTP ${res.statusCode})`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });

    req.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });

    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('Hết thời gian tải mã nguồn (Timeout)'));
    });
  });
}

function extractZip(zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  try {
    execSync(`tar -xf "${zipPath}" -C "${destDir}"`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    try {
      execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'pipe' });
      return true;
    } catch (err2) {
      throw new Error(`Không thể giải nén bản cập nhật: ${err2.message}`);
    }
  }
}

async function performHotUpdate(zipUrl) {
  const targetZipUrl = zipUrl || `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/zipball/main`;
  const updateTempZip = path.join(USER_DATA_DIR, 'hot_update_temp.zip');
  const updateStagingDir = path.join(USER_DATA_DIR, 'hot_update_staging');
  const targetBundleDir = path.join(USER_DATA_DIR, 'current_bundle');

  try {
    if (fs.existsSync(updateStagingDir)) {
      fs.rmSync(updateStagingDir, { recursive: true, force: true });
    }
    if (fs.existsSync(updateTempZip)) {
      fs.unlinkSync(updateTempZip);
    }

    // Download zip package
    await downloadFile(targetZipUrl, updateTempZip);

    // Extract zip
    extractZip(updateTempZip, updateStagingDir);

    // Locate repository root within extraction
    const entries = fs.readdirSync(updateStagingDir);
    let sourceDir = updateStagingDir;
    for (const entry of entries) {
      const full = path.join(updateStagingDir, entry);
      if (fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'package.json'))) {
        sourceDir = full;
        break;
      }
    }

    if (!fs.existsSync(path.join(sourceDir, 'package.json')) || !fs.existsSync(path.join(sourceDir, 'main.js'))) {
      throw new Error('Gói mã nguồn tải về không hợp lệ (thiếu package.json hoặc main.js).');
    }

    // Deploy to current_bundle
    if (fs.existsSync(targetBundleDir)) {
      fs.rmSync(targetBundleDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetBundleDir, { recursive: true });
    fs.cpSync(sourceDir, targetBundleDir, { recursive: true });

    // Clean temp
    try {
      fs.rmSync(updateStagingDir, { recursive: true, force: true });
      fs.unlinkSync(updateTempZip);
    } catch (e) {}

    return { success: true };
  } catch (err) {
    console.error('Hot Update Error:', err);
    try {
      if (fs.existsSync(updateStagingDir)) fs.rmSync(updateStagingDir, { recursive: true, force: true });
      if (fs.existsSync(updateTempZip)) fs.unlinkSync(updateTempZip);
    } catch (e) {}
    return { success: false, error: err.message };
  }
}

registerIpcHandler('check-for-updates', async (event, args) => {
  return await checkAppUpdates(args?.manual || false);
});

registerIpcHandler('get-app-version', () => {
  return getCurrentlyRunningVersion();
});

registerIpcHandler('apply-hot-update', async (event, args) => {
  const result = await performHotUpdate(args?.zipUrl);
  if (result.success) {
    try {
      if (session && session.defaultSession) {
        await session.defaultSession.clearCache();
        await session.defaultSession.clearStorageData({
          storages: ['serviceworkers', 'cachestorage']
        });
      }
    } catch (e) {
      console.warn('Cache clear error:', e);
    }

    // Clean env flags before relaunch so the new instance starts completely fresh
    delete process.env.AUTOCONTENT_LOADED_BUNDLE;
    delete process.env.AUTOCONTENT_APP_PATH;

    setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, 1200);
  }
  return result;
});

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light';
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.autocontent.studio');
  }
  createWindow();

  // Gentle non-intrusive auto-check after 5 seconds of launch
  setTimeout(() => {
    checkAppUpdates(false);
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
