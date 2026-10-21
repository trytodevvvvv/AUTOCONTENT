/**
 * AutoContent Studio - Client Controller
 * Multi-Provider AI Scriptwriter Desktop App
 */

// Application State
const state = {
  settings: {
    activeProviderId: '',
    activeModelId: '',
    providers: [],
    preferences: {}
  },
  preferences: {
    lineSpacing: 'tight'
  },
  currentEditingProviderId: null,
  isGenerating: false,
  abortController: null,
  rawOutputScript: '',
  stats: {
    words: 0,
    chars: 0,
    estimatedSeconds: 0
  }
};

// Sample text for instant demonstration
const SAMPLE_INPUT_TEXT = `Tại sao DeepSeek lại tạo nên cơn địa chấn trong giới công nghệ toàn cầu?

Đầu năm 2025, DeepSeek - một startup AI đến từ Trung Quốc đã gây sốc toàn thế giới khi tung ra mô hình DeepSeek-R1 và V3 với sức mạnh tương đương hoặc vượt trội GPT-4o của OpenAI, nhưng chi phí huấn luyện chỉ bằng một phần rất nhỏ (chưa tới 6 triệu USD so với hàng trăm triệu USD của các ông lớn Thung lũng Silicon).

Bí quyết nằm ở kiến trúc Mixture of Experts (MoE) cực kỳ tối ưu, thuật toán Multi-Head Latent Attention (MLA), và phương pháp học tăng cường không cần dữ liệu gắn nhãn tốn kém. Không chỉ vậy, DeepSeek còn mở mã nguồn mở hoàn toàn mô hình, cho phép cộng đồng phát triển tự do tải về và triển khai cục bộ.

Điều này chứng minh rằng: Cuộc đua AI không chỉ là câu chuyện dùng tiền đè người với hàng trăm nghìn card GPU đắt đỏ, mà trí tuệ tối ưu hóa thuật toán mới là chìa khóa mở ra tương lai AI giá rẻ cho nhân loại.`;

// DOM Elements
const DOM = {
  // Navigation & Quick API Switcher
  btnOpenModelPicker: document.getElementById('btnOpenModelPicker'),
  headerStatusDot: document.getElementById('headerStatusDot'),
  headerProviderName: document.getElementById('headerProviderName'),
  headerModelName: document.getElementById('headerModelName'),
  pillChevron: document.getElementById('pillChevron'),
  quickApiMenu: document.getElementById('quickApiMenu'),
  quickMenuList: document.getElementById('quickMenuList'),
  btnQuickManageApis: document.getElementById('btnQuickManageApis'),
  btnOpenSettings: document.getElementById('btnOpenSettings'),
  btnOpenGeneralSettings: document.getElementById('btnOpenGeneralSettings'),

  // Left Panel (Input & Options)
  inputOriginal: document.getElementById('inputOriginal'),
  inputCharCount: document.getElementById('inputCharCount'),
  inputWordCount: document.getElementById('inputWordCount'),
  btnLoadSample: document.getElementById('btnLoadSample'),
  btnUploadFile: document.getElementById('btnUploadFile'),
  btnPasteInput: document.getElementById('btnPasteInput'),
  btnClearInput: document.getElementById('btnClearInput'),

  // Feature Options
  optKeepOriginal: document.getElementById('optKeepOriginal'),
  optEnhanceScript: document.getElementById('optEnhanceScript'),
  optTranslate: document.getElementById('optTranslate'),
  langSelectorPanel: document.getElementById('langSelectorPanel'),
  selectTargetLanguage: document.getElementById('selectTargetLanguage'),

  // Advanced Options
  btnToggleAdvanced: document.getElementById('btnToggleAdvanced'),
  advancedChevron: document.getElementById('advancedChevron'),
  advancedBody: document.getElementById('advancedBody'),
  selectFormat: document.getElementById('selectFormat'),
  selectTone: document.getElementById('selectTone'),

  // Hero Generate Button & Hint
  btnGenerate: document.getElementById('btnGenerate'),
  btnGenerateText: document.getElementById('btnGenerateText'),
  apiRequiredHint: document.getElementById('apiRequiredHint'),
  apiRequiredHintText: document.getElementById('apiRequiredHintText'),

  // Right Panel (Output)
  outputStatusBadge: document.getElementById('outputStatusBadge'),
  outputStatusText: document.getElementById('outputStatusText'),
  outputStatusSubtitle: document.getElementById('outputStatusSubtitle'),
  outWordCount: document.getElementById('outWordCount'),
  outEstimatedTime: document.getElementById('outEstimatedTime'),
  outLangLabel: document.getElementById('outLangLabel'),
  outputContainer: document.getElementById('outputContainer'),
  emptyState: document.getElementById('emptyState'),
  scriptContent: document.getElementById('scriptContent'),
  streamCursor: document.getElementById('streamCursor'),

  // Output Actions
  btnCopyScript: document.getElementById('btnCopyScript'),
  btnExportTxt: document.getElementById('btnExportTxt'),
  btnRegenerate: document.getElementById('btnRegenerate'),

  // Settings Modal
  settingsModal: document.getElementById('settingsModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  modalProviderTitle: document.getElementById('modalProviderTitle'),
  modalHeaderStatusDot: document.getElementById('modalHeaderStatusDot'),
  btnAddNewProviderHeader: document.getElementById('btnAddNewProviderHeader'),
  btnDeleteProvider: document.getElementById('btnDeleteProvider'),
  providerTabs: document.getElementById('providerTabs'),
  cfgApiKey: document.getElementById('cfgApiKey'),
  btnToggleApiKeyVisibility: document.getElementById('btnToggleApiKeyVisibility'),
  eyeIcon: document.getElementById('eyeIcon'),
  btnToggleCustomized: document.getElementById('btnToggleCustomized'),
  customizedChevron: document.getElementById('customizedChevron'),
  customizedContent: document.getElementById('customizedContent'),
  cfgDisplayName: document.getElementById('cfgDisplayName'),
  cfgBaseUrl: document.getElementById('cfgBaseUrl'),
  cfgProtocol: document.getElementById('cfgProtocol'),
  modelsList: document.getElementById('modelsList'),
  btnAddModel: document.getElementById('btnAddModel'),
  btnRestoreDefaults: document.getElementById('btnRestoreDefaults'),
  btnFetchModels: document.getElementById('btnFetchModels'),

  // Dedicated Test Connection Box (Top of Apply)
  testConnectionCard: document.getElementById('testConnectionCard'),
  testConnDot: document.getElementById('testConnDot'),
  testConnStatusTitle: document.getElementById('testConnStatusTitle'),
  testConnStatusDesc: document.getElementById('testConnStatusDesc'),
  btnTestConnection: document.getElementById('btnTestConnection'),
  btnTestConnText: document.getElementById('btnTestConnText'),

  modalStatusMsg: document.getElementById('modalStatusMsg'),
  btnCancelSettings: document.getElementById('btnCancelSettings'),
  btnApplySettings: document.getElementById('btnApplySettings'),

  // Delete Confirmation Modal
  deleteConfirmModal: document.getElementById('deleteConfirmModal'),
  deleteTargetProviderName: document.getElementById('deleteTargetProviderName'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),

  // General Settings Modal
  generalSettingsModal: document.getElementById('generalSettingsModal'),
  btnCloseGeneralSettings: document.getElementById('btnCloseGeneralSettings'),
  btnCancelGeneralSettings: document.getElementById('btnCancelGeneralSettings'),
  btnSaveGeneralSettings: document.getElementById('btnSaveGeneralSettings'),
  optSpacingTight: document.getElementById('optSpacingTight'),
  optSpacingNormal: document.getElementById('optSpacingNormal'),
  cardSpacingTight: document.getElementById('cardSpacingTight'),
  cardSpacingNormal: document.getElementById('cardSpacingNormal'),

  // Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toastIcon'),
  toastMsg: document.getElementById('toastMsg')
};

// ===================================================================
// INITIALIZATION
// ===================================================================
async function initApp() {
  bindEvents();
  await loadSettings();
  updateHeaderActiveModel();
  checkReadiness();
}

async function loadSettings() {
  try {
    if (window.api && window.api.getSavedApis) {
      const saved = await window.api.getSavedApis();
      if (saved && Array.isArray(saved.providers) && saved.providers.length > 0) {
        state.settings.providers = saved.providers;
        state.settings.activeProviderId = saved.activeProviderId || saved.providers[0].id;
        state.settings.activeModelId = saved.activeModelId || (saved.providers[0].models && saved.providers[0].models[0]?.id) || '';
        state.connectionVerified = state.connectionVerified || {};
        saved.providers.forEach(p => {
          if (p.isVerified) {
            state.connectionVerified[p.id] = true;
          }
        });
        loadSavedPreferences();
        return;
      }
    }
  } catch (err) {
    console.warn('Error loading saved APIs:', err);
  }

  // Initial clean state: no pre-saved APIs
  state.settings.providers = [];
  state.settings.activeProviderId = '';
  state.settings.activeModelId = '';
  loadSavedPreferences();
}

function loadSavedPreferences() {
  try {
    const rawPref = localStorage.getItem('autocontent_preferences');
    if (rawPref) {
      const parsed = JSON.parse(rawPref);
      state.preferences = { ...state.preferences, ...parsed };
    }
  } catch (e) {}
}

// Bind all UI Event Listeners
function bindEvents() {
  // Quick API Switcher & Settings
  DOM.btnOpenModelPicker.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQuickApiMenu();
  });

  DOM.btnQuickManageApis.addEventListener('click', (e) => {
    e.stopPropagation();
    if (DOM.quickApiMenu) DOM.quickApiMenu.classList.add('hidden');
    if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');
    openSettingsModal();
  });

  DOM.btnOpenSettings.addEventListener('click', () => {
    if (state.isGenerating) return;
    openSettingsModal();
  });

  if (DOM.btnOpenGeneralSettings) {
    DOM.btnOpenGeneralSettings.addEventListener('click', () => {
      if (state.isGenerating) return;
      openGeneralSettingsModal();
    });
  }

  // Close Quick Switcher Menu when clicking outside
  document.addEventListener('click', (e) => {
    if (DOM.quickApiMenu && !DOM.quickApiMenu.classList.contains('hidden')) {
      if (!DOM.quickApiMenu.contains(e.target) && !DOM.btnOpenModelPicker.contains(e.target)) {
        DOM.quickApiMenu.classList.add('hidden');
        if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');
      }
    }
  });

  // Input events
  DOM.inputOriginal.addEventListener('input', () => {
    updateInputMetrics();
    checkReadiness();
  });

  DOM.btnLoadSample.addEventListener('click', () => {
    if (state.isGenerating) return;
    DOM.inputOriginal.value = SAMPLE_INPUT_TEXT;
    updateInputMetrics();
    checkReadiness();
    showToast('Đã dán nội dung mẫu thành công!', 'success');
  });

  // Import file (.txt, .md, .docx, .srt)
  DOM.btnUploadFile.addEventListener('click', async () => {
    if (state.isGenerating) return;
    try {
      if (window.api && window.api.openFileDialog) {
        const res = await window.api.openFileDialog();
        if (res && res.canceled) return;
        if (res && res.success && res.content) {
          DOM.inputOriginal.value = res.content;
          updateInputMetrics();
          checkReadiness();
          showToast(`Đã nhập file "${res.filename || 'kịch bản'}" thành công!`, 'success');
        } else if (res && res.error) {
          showToast(`Lỗi nhập file: ${res.error}`, 'danger');
        }
      }
    } catch (err) {
      showToast(`Không thể đọc file: ${err.message}`, 'danger');
    }
  });

  DOM.btnPasteInput.addEventListener('click', async () => {
    if (state.isGenerating) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        DOM.inputOriginal.value = text;
        updateInputMetrics();
        checkReadiness();
        showToast('Đã dán từ clipboard!', 'success');
      } else {
        showToast('Clipboard trống!', 'warning');
      }
    } catch (e) {
      DOM.inputOriginal.focus();
      showToast('Hãy dùng phím Ctrl + V để dán!', 'info');
    }
  });

  DOM.btnClearInput.addEventListener('click', () => {
    if (state.isGenerating) return;
    DOM.inputOriginal.value = '';
    updateInputMetrics();
    checkReadiness();
    DOM.inputOriginal.focus();
  });

  // Feature Options Checkboxes
  DOM.optTranslate.addEventListener('change', () => {
    if (DOM.optTranslate.checked) {
      DOM.langSelectorPanel.classList.add('visible');
    } else {
      DOM.langSelectorPanel.classList.remove('visible');
    }
  });

  // Advanced Options Accordion
  DOM.btnToggleAdvanced.addEventListener('click', () => {
    if (state.isGenerating) return;
    const isOpen = DOM.advancedBody.classList.toggle('open');
    DOM.advancedChevron.classList.toggle('rotate', isOpen);
  });

  // Generate / Stop Button
  DOM.btnGenerate.addEventListener('click', () => {
    if (state.isGenerating) {
      stopGeneration();
    } else {
      startGeneration();
    }
  });

  // API Required Hint click
  DOM.apiRequiredHint.addEventListener('click', () => {
    if (state.isGenerating) return;
    openSettingsModal(state.settings.activeProviderId);
  });

  // Output Actions
  DOM.btnCopyScript.addEventListener('click', () => {
    if (!state.isGenerating) copyScriptToClipboard();
  });
  DOM.btnExportTxt.addEventListener('click', () => {
    if (!state.isGenerating) exportScript('txt');
  });
  DOM.btnRegenerate.addEventListener('click', () => {
    if (!state.isGenerating && checkReadiness()) startGeneration();
  });

  // Settings Modal Controls
  DOM.btnCloseModal.addEventListener('click', closeSettingsModal);
  DOM.btnCancelSettings.addEventListener('click', closeSettingsModal);
  DOM.btnApplySettings.addEventListener('click', saveAndApplySettings);

  DOM.btnToggleApiKeyVisibility.addEventListener('click', toggleApiKeyVisibility);
  DOM.btnToggleCustomized.addEventListener('click', () => {
    const isCollapsed = DOM.customizedContent.classList.toggle('collapsed');
    DOM.customizedChevron.classList.toggle('rotate', !isCollapsed);
  });

  DOM.btnAddModel.addEventListener('click', () => {
    addModelRow('', '');
  });

  DOM.btnRestoreDefaults.addEventListener('click', restoreCurrentProviderDefaults);
  DOM.btnFetchModels.addEventListener('click', fetchModelsFromProvider);

  // Dedicated Test Connection Button (Top of Apply)
  DOM.btnTestConnection.addEventListener('click', testProviderConnection);

  // Delete Provider Button -> Opens Confirmation Modal
  DOM.btnDeleteProvider.addEventListener('click', promptDeleteProvider);

  // Add New Provider Button in Modal Header
  if (DOM.btnAddNewProviderHeader) {
    DOM.btnAddNewProviderHeader.addEventListener('click', () => addNewProvider());
  }

  // Delete Confirmation Modal Actions
  DOM.btnCancelDelete.addEventListener('click', closeDeleteConfirmModal);
  DOM.btnConfirmDelete.addEventListener('click', confirmDeleteProvider);
  DOM.deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === DOM.deleteConfirmModal) closeDeleteConfirmModal();
  });

  // Live Display Name Sync (Instantly updates title and tab pill as you type)
  DOM.cfgDisplayName.addEventListener('input', () => {
    const newName = DOM.cfgDisplayName.value.trim();
    DOM.modalProviderTitle.textContent = newName || 'Cấu hình API';
    const activeTab = DOM.providerTabs.querySelector('.provider-tab-pill.active');
    if (activeTab) {
      const nameSpan = activeTab.querySelector('.tab-name') || activeTab;
      nameSpan.textContent = newName || '(Chưa đặt tên)';
    }
    const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
    if (provider) provider.displayName = newName;
  });

  // API Key input live listener (Clear error and mark unverified on key edit)
  DOM.cfgApiKey.addEventListener('input', () => {
    DOM.cfgApiKey.classList.remove('input-error');
    if (state.connectionVerified) {
      state.connectionVerified[state.currentEditingProviderId] = false;
    }
    const curProv = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
    if (curProv) curProv.isVerified = false;
    if (DOM.modalHeaderStatusDot) {
      DOM.modalHeaderStatusDot.className = 'status-indicator-dot offline';
      DOM.modalHeaderStatusDot.title = 'Chưa xác thực kết nối (Offline)';
    }
    renderProviderTabs();
  });

  // General Settings Modal Controls
  if (DOM.btnCloseGeneralSettings) DOM.btnCloseGeneralSettings.addEventListener('click', closeGeneralSettingsModal);
  if (DOM.btnCancelGeneralSettings) DOM.btnCancelGeneralSettings.addEventListener('click', closeGeneralSettingsModal);
  if (DOM.btnSaveGeneralSettings) DOM.btnSaveGeneralSettings.addEventListener('click', saveGeneralSettings);

  // Line spacing option card clicks
  if (DOM.cardSpacingTight) {
    DOM.cardSpacingTight.addEventListener('click', () => {
      DOM.optSpacingTight.checked = true;
      DOM.cardSpacingTight.classList.add('active');
      if (DOM.cardSpacingNormal) DOM.cardSpacingNormal.classList.remove('active');
    });
  }

  if (DOM.cardSpacingNormal) {
    DOM.cardSpacingNormal.addEventListener('click', () => {
      DOM.optSpacingNormal.checked = true;
      DOM.cardSpacingNormal.classList.add('active');
      if (DOM.cardSpacingTight) DOM.cardSpacingTight.classList.remove('active');
    });
  }

  // Note: Backdrop click dismissal removed to prevent accidental closure when scrolling or dragging
}

// ===================================================================
// BUSINESS LOGIC: READINESS CHECK (ENABLE / DISABLE GENERATE BUTTON)
// ===================================================================
function checkReadiness() {
  if (state.isGenerating) return false;

  const currentProvider = state.settings.providers.find(p => p.id === state.settings.activeProviderId) 
    || state.settings.providers[0];

  if (!currentProvider) {
    DOM.btnGenerate.disabled = true;
    DOM.btnGenerate.classList.add('disabled');
    DOM.apiRequiredHint.classList.remove('hidden');
    DOM.apiRequiredHintText.textContent = 'Chưa có cấu hình API. Bấm vào đây để thêm API Key.';
    return false;
  }

  const hasApiKey = !!(currentProvider && currentProvider.apiKey && currentProvider.apiKey.trim().length > 0);
  const isVerified = !!(hasApiKey && (currentProvider.isVerified || state.connectionVerified?.[currentProvider.id]));
  const text = (DOM.inputOriginal.value || '').trim();

  if (!hasApiKey) {
    DOM.btnGenerate.disabled = true;
    DOM.btnGenerate.classList.add('disabled');
    DOM.apiRequiredHint.classList.remove('hidden');
    DOM.apiRequiredHintText.textContent = `Chưa có API Key cho ${currentProvider.displayName || 'Provider'}. Bấm vào đây để cấu hình & test kết nối.`;
    return false;
  }

  if (!isVerified) {
    DOM.btnGenerate.disabled = true;
    DOM.btnGenerate.classList.add('disabled');
    DOM.apiRequiredHint.classList.remove('hidden');
    DOM.apiRequiredHintText.textContent = `API Key của ${currentProvider.displayName || 'Provider'} chưa được xác thực kết nối. Bấm vào đây để kiểm tra & lưu.`;
    return false;
  }

  if (text.length === 0) {
    DOM.btnGenerate.disabled = true;
    DOM.btnGenerate.classList.add('disabled');
    DOM.apiRequiredHint.classList.add('hidden');
    return false;
  }

  // Ready to generate!
  DOM.btnGenerate.disabled = false;
  DOM.btnGenerate.classList.remove('disabled');
  DOM.apiRequiredHint.classList.add('hidden');
  return true;
}

// ===================================================================
// INPUT METRICS
// ===================================================================
function updateInputMetrics() {
  const text = DOM.inputOriginal.value || '';
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  DOM.inputCharCount.textContent = `${chars.toLocaleString()} ký tự`;
  DOM.inputWordCount.textContent = `${words.toLocaleString()} từ`;
}

// ===================================================================
// HEADER DISPLAY
// ===================================================================
function updateHeaderActiveModel() {
  const currentProvider = state.settings.providers.find(p => p.id === state.settings.activeProviderId) 
    || state.settings.providers[0];

  if (!currentProvider) {
    DOM.headerProviderName.textContent = 'Chưa chọn API';
    DOM.headerModelName.textContent = 'Bấm để thêm API Key';
    if (DOM.headerStatusDot) {
      DOM.headerStatusDot.className = 'status-indicator-dot offline';
      DOM.headerStatusDot.title = 'Chưa cấu hình API Key';
    }
    return;
  }

  const activeModel = (currentProvider.models || []).find(m => m.id === state.settings.activeModelId)
    || (currentProvider.models && currentProvider.models[0]);

  DOM.headerProviderName.textContent = currentProvider.displayName || currentProvider.id;
  DOM.headerModelName.textContent = activeModel ? (activeModel.name || activeModel.id) : 'Chọn model';

  if (DOM.headerStatusDot) {
    const isOnline = !!(currentProvider.apiKey && currentProvider.apiKey.trim().length > 5 && (currentProvider.isVerified || state.connectionVerified?.[currentProvider.id]));
    DOM.headerStatusDot.className = `status-indicator-dot ${isOnline ? 'online' : 'offline'}`;
    DOM.headerStatusDot.title = isOnline ? 'Đã xác thực kết nối máy chủ (Online)' : 'Chưa kết nối hoặc Key không hợp lệ (Offline)';
  }
}

// ===================================================================
// SCRIPT GENERATION & AI ORCHESTRATION (PURE READY-TO-USE SCRIPT)
// ===================================================================
async function startGeneration() {
  const rawInput = DOM.inputOriginal.value.trim();
  if (!rawInput) {
    showToast('Vui lòng nhập nội dung gốc trước khi tạo kịch bản!', 'warning');
    DOM.inputOriginal.focus();
    return;
  }

  // Get active provider & model
  const provider = state.settings.providers.find(p => p.id === state.settings.activeProviderId);
  if (!provider || !provider.apiKey) {
    showToast(`Vui lòng nhập API Key cho ${provider ? provider.displayName : 'Provider'}!`, 'warning');
    openSettingsModal(provider ? provider.id : null);
    return;
  }

  const modelId = state.settings.activeModelId || (provider.models[0] && provider.models[0].id);
  if (!modelId) {
    showToast('Chưa chọn model AI nào!', 'warning');
    openSettingsModal(provider.id);
    return;
  }

  // Build Prompts with strict PURE SCRIPT requirements (matching user Image 4)
  const keepOriginal = DOM.optKeepOriginal.checked;
  const enhance = DOM.optEnhanceScript.checked;
  const translate = DOM.optTranslate.checked;
  const targetLanguage = DOM.selectTargetLanguage.value;
  const format = DOM.selectFormat.value;
  const tone = DOM.selectTone.value;

  const { systemPrompt, userPrompt } = buildPrompts({
    originalText: rawInput,
    keepOriginal,
    enhance,
    translate,
    targetLanguage,
    format,
    tone
  });

  // Prepare UI for generation
  setGeneratingUIState(true);
  state.rawOutputScript = '';
  DOM.scriptContent.innerHTML = '';
  DOM.emptyState.classList.add('hidden');
  DOM.scriptContent.classList.remove('hidden');
  DOM.streamCursor.classList.remove('hidden');

  DOM.outLangLabel.textContent = translate ? targetLanguage.split(' ')[0] : 'Gốc';

  state.abortController = new AbortController();

  try {
    const baseUrl = (provider.baseUrl || '').replace(/\/+$/, '');
    const endpoint = `${baseUrl}/chat/completions`;

    const payload = {
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      stream: true
    };

    DOM.outputStatusText.textContent = 'Đang kết nối API...';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(payload),
      signal: state.abortController.signal
    });

    if (!response.ok) {
      let errDetails = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.error && errJson.error.message) {
          errDetails = errJson.error.message;
        }
      } catch (e) {}
      throw new Error(errDetails);
    }

    DOM.outputStatusText.textContent = 'Đang viết kịch bản...';

    // Handle Streaming Response (Server-Sent Events)
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep last unfinished line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;

          // Extract content or reasoning_content
          const content = delta?.content || delta?.text || '';
          if (content) {
            appendOutputChunk(content);
          }
        } catch (err) {
          // ignore incomplete json chunk
        }
      }
    }

    // Finished
    DOM.outputStatusBadge.className = 'output-status-pill completed';
    DOM.outputStatusText.textContent = 'Hoàn thành';
    DOM.outputStatusSubtitle.textContent = 'Kịch bản đã sẵn sàng sử dụng ngay!';
    showToast('Tạo kịch bản thành công!', 'success');

  } catch (err) {
    if (err.name === 'AbortError') {
      DOM.outputStatusBadge.className = 'output-status-pill';
      DOM.outputStatusText.textContent = 'Đã dừng';
      DOM.outputStatusSubtitle.textContent = 'Quá trình tạo kịch bản đã được dừng.';
      showToast('Đã dừng tạo kịch bản.', 'info');
    } else {
      console.error('Generation Error:', err);
      DOM.outputStatusBadge.className = 'output-status-pill';
      DOM.outputStatusText.textContent = 'Lỗi kết nối';
      DOM.outputStatusSubtitle.textContent = 'Đã có lỗi xảy ra trong quá trình gọi API.';
      
      const errorCard = document.createElement('div');
      errorCard.style.cssText = 'background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; padding:14px; border-radius:10px; margin-top:12px; font-size:13px; line-height:1.5;';
      errorCard.innerHTML = `<strong>⚠️ Lỗi API:</strong> ${escapeHtml(err.message)}<br><br><small>Kiểm tra lại API Key, Base URL hoặc Test kết nối trong phần Cài đặt.</small>`;
      DOM.scriptContent.appendChild(errorCard);

      showToast(`Lỗi: ${err.message}`, 'danger');
    }
  } finally {
    setGeneratingUIState(false);
  }
}

// ===================================================================
// PURE SCRIPT PROMPT BUILDER (STRICTLY NO TIMELINE / NO VISUAL CUES)
// EXACTLY MATCHING USER'S SCREENSHOT 4
// ===================================================================
function buildPrompts({ originalText, keepOriginal, enhance, translate, targetLanguage, format, tone }) {
  const toneDescriptions = {
    lively_hook: 'Hào hứng, cuốn hút, tràn đầy năng lượng, giữ chân người nghe cao nhất.',
    humorous: 'Hài hước, dí dỏm, châm biếm thông minh, tạo tiếng cười tự nhiên.',
    dramatic: 'Kịch tính, hồi hộp, gay cấn như một câu chuyện điện ảnh ly kỳ.',
    authoritative: 'Chuyên gia phân tích, điềm đạm, uy tín, giàu tính thuyết phục.',
    inspiring: 'Truyền cảm hứng, tích cực, thắp sáng động lực mạnh mẽ.'
  };

  const formatDescriptions = {
    youtube_standard: `CẤU TRÚC ĐỊNH DẠNG: YOUTUBE CHUẨN THUẦN LỜI BÌNH (PURE VOICEOVER - MẶC ĐỊNH):
- Mở đầu: Hook 3-5 giây đầu cực kỳ cuốn hút, đánh trúng tâm lý tò mò.
- Thân bài: Các đoạn văn xuôi dẫn giải mượt mà, phân tích logic, ngắt nhịp giữ chân người xem đều đặn.
- Kết bài: Đúc kết thông điệp đắt giá, khơi gợi người xem để lại bình luận và suy ngẫm.`,

    geopolitics: `CẤU TRÚC ĐỊNH DẠNG: PHÂN TÍCH ĐỊA CHÍNH TRỊ / QUÂN SỰ / THỜI SỰ QUỐC TẾ (GEOPOLITICS & STRATEGY ANALYSIS):
- Mở đầu: Khởi đầu bằng một động thái bất ngờ, một nước đi chiến lược hoặc sự kiện nóng trên bàn cờ quyền lực quốc tế.
- Bóc tách đa chiều: Phân tích sâu sắc toan tính chiến lược, lợi ích cốt lõi của các cường quốc, đòn bẩy địa kinh tế, an ninh quốc phòng và thế cân bằng quyền lực.
- Chiều sâu chiến lược: Sử dụng ngôn từ đanh thép, sắc bén, bản lĩnh, phân tích nguyên nhân - hậu quả có tính liên kết lịch sử.
- Dự báo tương lai: Đưa ra nhận định sắc sảo về các kịch bản tiếp theo và tác động trực tiếp tới cục diện khu vực cũng như thế giới.`,

    youtube_story: `CẤU TRÚC ĐỊNH DẠNG: KỂ CHUYỆN / PHIM / TÀI LIỆU DOCUMENTARY (STORYTELLING):
- Dẫn dắt theo mạch tự sự điện ảnh liền mạch, tạo bối cảnh, khắc họa tâm lý nhân vật và tình huống.
- Đẩy cao trào cảm xúc qua các bước ngoặt bất ngờ, tạo nút thắt - mở nút kịch tính, gợi hình ảnh sống động thuần túy bằng ngôn từ kể chuyện.`,

    shorts_tiktok: `CẤU TRÚC ĐỊNH DẠNG: VIDEO NGẮN SHORTS / TIKTOK / REELS (DƯỚI 60 GIÂY):
- Độ dài tối ưu: Khoảng 130 - 160 từ để đọc trọn vẹn trong vòng 60 giây.
- Tiết tấu: Siêu nhanh, dồn dập, câu ngắn gãy gọn, giật hook cực mạnh ngay từ 1 giây đầu tiên, không dông dài mở bài, đi thẳng vào điểm mấu chốt gây sốc.`,

    news_explainer: `CẤU TRÚC ĐỊNH DẠNG: BẢN TIN / GIẢI MÃ KIẾN THỨC TỔNG HỢP (EXPLAINER):
- Trình bày thông tin lớp lang rõ ràng: Hiện tượng tiêu điểm ➔ Dữ liệu thực tế ➔ Bóc tách nguyên nhân cốt lõi ➔ Đánh giá tác động ➔ Bài học đúc kết. Lối hành văn khách quan, thuyết phục.`,

    podcast_talk: `CẤU TRÚC ĐỊNH DẠNG: PODCAST / RADIO / TALKSHOW (TÂM TÌNH):
- Văn phong tự nhiên, ấm áp như đang trò chuyện 1-1 với người nghe trong một không gian yên tĩnh.
- Câu từ mềm mại, có những khoảng ngắt tinh tế để người nghe thẩm thấu cảm xúc và suy tưởng.`
  };

  let systemPrompt = `BẠN LÀ CHUYÊN GIA BIÊN TẬP VÀ VIẾT KỊCH BẢN THOẠI / LỜI DẪN YOUTUBE & CONTENT CREATOR HÀNG ĐẦU.
NHIỆM VỤ: Chuyển hóa toàn bộ nội dung gốc thành một KỊCH BẢN THUẦN LỜI ĐỌC (PURE VOICEOVER SCRIPT) HOÀN CHỈNH, CHUYÊN NGHIỆP, DÙNG ĐỂ THU ÂM HOẶC LỒNG TIẾNG ĐƯỢC NGAY LẬP TỨC.

QUY TẮC CẤM TUYỆT ĐỐI (KHÔNG BAO GIỜ ĐƯỢC XUẤT HIỆN):
1. TUYỆT ĐỐI KHÔNG ghi timeline thời gian (Cấm: 00:00, 01:30, [0:00 - 0:05],...).
2. TUYỆT ĐỐI KHÔNG chèn hướng dẫn quay, chỉ đạo hình ảnh, hiệu ứng (Cấm: [Cảnh quay], [Hình ảnh], [Visual], [B-Roll], [Góc máy], [Meme], [Chèn video],...).
3. TUYỆT ĐỐI KHÔNG xuất hiện dàn ý, phân cảnh, gạch đầu dòng liệt kê, bảng biểu hay mục lục.
4. TUYỆT ĐỐI KHÔNG có lời chào hỏi hoặc ghi chú ngoài lề của AI (Cấm: "Dưới đây là kịch bản...", "Chúc bạn thành công", "Hy vọng kịch bản này giúp ích...").
5. TUYỆT ĐỐI KHÔNG dùng các dấu ngoặc vuông [] hay ngoặc đơn () để chú thích hành động hay cảm xúc.

YÊU CẦU ĐỊNH DẠNG VÀ PHONG CÁCH (XUẤT RA NHƯ MỘT BÀI ĐỌC THUẦN TÚY):
- Toàn bộ kịch bản được viết thành CÁC ĐOẠN VĂN XUÔI LIỀN MẠCH, ngắt đoạn tự nhiên, giàu nhịp điệu để người đọc hoặc phần mềm đọc giọng AI (Text-to-Speech) đọc mượt mà không bị vấp.
- Câu mở đầu phải là một HOOK CỰC KỲ CUỐN HÚT, đánh trúng tâm lý tò mò, giật mình của người nghe ngay từ 3 giây đầu tiên.
- Nhịp văn biến hóa linh hoạt, ngôn từ giàu tính biểu cảm, tạo sự kịch tính và giữ chân người nghe từ đầu tới cuối.
- Giọng điệu chủ đạo: ${toneDescriptions[tone] || toneDescriptions.lively_hook}

${formatDescriptions[format] || formatDescriptions.youtube_standard}`;

  if (keepOriginal) {
    systemPrompt += `\n- BẢO TOÀN DỮ LIỆU CỐT LÕI: Phải giữ đúng mọi thông điệp chính, tên riêng, sự kiện và số liệu cốt lõi của nội dung gốc. Không tự tiện bịa đặt sai sự thật.`;
  } else {
    systemPrompt += `\n- SÁNG TẠO MỞ RỘNG: Được phép lấy cảm hứng từ nội dung gốc để phát triển thêm các chi tiết, tình tiết hấp dẫn, kịch tính hơn.`;
  }

  if (enhance) {
    systemPrompt += `\n- NÂNG CẤP VĂN PHONG ĐỈNH CAO: Tối ưu cấu trúc câu từ lôi cuốn, ngắt nhịp hồi hộp, dùng kỹ thuật gợi mở thắc mắc (Open Loops) để người nghe không thể rời tai đến câu cuối cùng.`;
  }

  if (translate) {
    systemPrompt += `\n- CHUYỂN ĐỔI NGÔN NGỮ (TRANSCREATION): Viết lại toàn bộ kịch bản bằng ${targetLanguage}. Phải dịch thoát ý, sử dụng cách hành văn tự nhiên, mượt mà chuẩn người bản xứ sáng tạo nội dung YouTube, tuyệt đối không dịch máy từng từ.`;
  } else {
    systemPrompt += `\n- NGUYÊN TẮC BẢO TOÀN VÀ TỐI ƯU HÓA NGÔN NGỮ GỐC (STRICT SAME-LANGUAGE OUTPUT):
+ Hãy tự động nhận diện ngôn ngữ của nội dung gốc (tiếng Hàn, tiếng Nhật, tiếng Anh, tiếng Việt, tiếng Trung, tiếng Tây Ban Nha, tiếng Pháp,...).
+ TUYỆT ĐỐI 100% viết kịch bản bằng CHÍNH XÁC ngôn ngữ gốc của đầu vào. KHÔNG ĐƯỢC tự ý dịch sang tiếng Việt hay bất kỳ ngôn ngữ nào khác.
+ Ví dụ: Đầu vào là tiếng Hàn ➔ Toàn bộ kịch bản xuất ra 100% bằng tiếng Hàn (한국어).
+ Ví dụ: Đầu vào là tiếng Anh ➔ Toàn bộ kịch bản xuất ra 100% bằng tiếng Anh (English).
+ Ví dụ: Đầu vào là tiếng Nhật ➔ Toàn bộ kịch bản xuất ra 100% bằng tiếng Nhật (日本語).
+ Tối ưu hóa sâu sắc ngữ pháp, cách ngắt nhịp và từ vựng lôi cuốn chuyên biệt cho chính ngôn ngữ đó.`;
  }

  systemPrompt += `\n\nCHỈ TRẢ VỀ DUY NHẤT VĂN BẢN KỊCH BẢN THUẦN LỜI ĐỌC (KHÔNG KÈM BẤT KỲ LỜI CHÚ THÍCH NÀO KHÁC).`;

  const userPrompt = `Dưới đây là nội dung gốc cần chuyển hóa thành kịch bản thuần lời đọc dùng được ngay:\n\n${originalText}`;

  return { systemPrompt, userPrompt };
}

// Append streaming text to output and update metrics
function appendOutputChunk(chunk) {
  state.rawOutputScript += chunk;
  
  // Format pure paragraphs cleanly without brackets
  DOM.scriptContent.innerHTML = formatCleanScript(state.rawOutputScript);

  // Auto-scroll to bottom of output
  DOM.outputContainer.scrollTop = DOM.outputContainer.scrollHeight;

  // Update output statistics
  updateOutputStats();
}

function updateOutputStats() {
  const text = state.rawOutputScript || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  state.stats.words = words;

  // Average reading speed: ~160 words per minute
  const totalSeconds = Math.round((words / 160) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  DOM.outWordCount.textContent = words.toLocaleString();

  if (totalSeconds < 60) {
    DOM.outEstimatedTime.textContent = `~${totalSeconds} giây`;
  } else {
    DOM.outEstimatedTime.textContent = `~${minutes} phút ${seconds > 0 ? seconds + 's' : ''}`;
  }
}

// Stop generation
function stopGeneration() {
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }
}

// UI State toggle during generation - STRICT LOCKDOWN OF CORE FEATURES
function setGeneratingUIState(generating) {
  state.isGenerating = generating;

  // Elements to strictly disable during generation to prevent misclicks
  const lockableControls = [
    DOM.btnOpenModelPicker,
    DOM.btnOpenSettings,
    DOM.btnLoadSample,
    DOM.btnUploadFile,
    DOM.btnPasteInput,
    DOM.btnClearInput,
    DOM.optKeepOriginal,
    DOM.optEnhanceScript,
    DOM.optTranslate,
    DOM.selectTargetLanguage,
    DOM.selectFormat,
    DOM.selectTone,
    DOM.btnToggleAdvanced,
    DOM.btnCopyScript,
    DOM.btnExportTxt,
    DOM.btnRegenerate
  ];

  if (generating) {
    // Hide Quick API Menu if open
    if (DOM.quickApiMenu) DOM.quickApiMenu.classList.add('hidden');
    if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');

    // Lock all core controls
    lockableControls.forEach(ctrl => {
      if (!ctrl) return;
      ctrl.disabled = true;
      ctrl.classList.add('disabled-during-gen');
    });

    // Lock Textarea
    DOM.inputOriginal.readOnly = true;
    DOM.inputOriginal.classList.add('textarea-locked');

    // Lock Feature cards visually
    document.querySelectorAll('.feature-card').forEach(card => {
      card.classList.add('disabled-during-gen');
    });

    // Set Hero button into STOP mode (Active so user can abort)
    DOM.btnGenerate.classList.remove('disabled');
    DOM.btnGenerate.disabled = false;
    DOM.btnGenerate.classList.add('generating', 'stop-mode');
    DOM.btnGenerateText.textContent = 'DỪNG TẠO (STOP)';
    DOM.outputStatusBadge.className = 'output-status-pill generating';
    DOM.outputStatusText.textContent = 'Đang xử lý...';
  } else {
    // Unlock all core controls
    lockableControls.forEach(ctrl => {
      if (!ctrl) return;
      ctrl.disabled = false;
      ctrl.classList.remove('disabled-during-gen');
    });

    // Unlock Textarea
    DOM.inputOriginal.readOnly = false;
    DOM.inputOriginal.classList.remove('textarea-locked');

    // Unlock Feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
      card.classList.remove('disabled-during-gen');
    });

    // Reset Hero button
    DOM.btnGenerate.classList.remove('generating', 'stop-mode');
    DOM.btnGenerateText.textContent = 'TẠO KỊCH BẢN TỰ ĐỘNG';
    DOM.streamCursor.classList.add('hidden');
    checkReadiness();
  }
}

// OUTPUT UTILITIES (COPY, EXPORT, REGENERATE)
// ===================================================================
function getExportableScriptText() {
  if (!state.rawOutputScript) return '';
  const isTight = (state.preferences && state.preferences.lineSpacing !== 'normal');
  if (isTight) {
    // Tight mode: collapse multiple blank lines into single line breaks
    return state.rawOutputScript.replace(/\n\s*\n+/g, '\n').trim();
  }
  return state.rawOutputScript.trim();
}

async function copyScriptToClipboard() {
  if (!state.rawOutputScript) {
    showToast('Chưa có kịch bản để sao chép!', 'warning');
    return;
  }

  const textToCopy = getExportableScriptText();
  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast('Đã sao chép kịch bản vào clipboard!', 'success');
  } catch (err) {
    showToast('Không thể sao chép tự động!', 'danger');
  }
}

async function exportScript(ext) {
  if (!state.rawOutputScript) {
    showToast('Chưa có kịch bản để lưu!', 'warning');
    return;
  }

  const textToSave = getExportableScriptText();
  if (window.api && window.api.saveFileDialog) {
    const filename = `kich-ban-youtube-${new Date().toISOString().slice(0, 10)}.${ext}`;
    const res = await window.api.saveFileDialog({
      content: textToSave,
      defaultFilename: filename,
      ext: ext
    });

    if (res && res.success) {
      showToast(`Đã lưu file thành công tại: ${res.filePath}`, 'success');
    }
  } else {
    // Web fallback download
    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kich-ban-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã tải xuống file .${ext.toUpperCase()}`, 'success');
  }
}

// Format clean script as readable paragraphs (default: tight / no big blank gap)
function formatCleanScript(text) {
  if (!text) return '';

  const escaped = escapeHtml(text);
  const isTight = (state.preferences && state.preferences.lineSpacing !== 'normal');
  const paragraphs = escaped.split(/\n\s*\n/);

  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      const formatted = trimmed.replace(/\n/g, '<br>');
      // In tight mode: minimal margin (3px) so paragraphs sit right below each other without big blank gaps!
      const mb = isTight ? '3px' : '16px';
      return `<p style="margin-bottom: ${mb}; font-size: 15px; line-height: 1.75; color: #1E293B; letter-spacing: -0.01em;">${formatted}</p>`;
    })
    .join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===================================================================
// SETTINGS MODAL & DEDICATED TEST CONNECTION BOX (TOP OF APPLY)
// ===================================================================
function openSettingsModal(targetProviderId = null) {
  if (state.isGenerating) return; // Prevent opening during generation!

  // Hide quick menu if open
  if (DOM.quickApiMenu) DOM.quickApiMenu.classList.add('hidden');
  if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');

  // If no providers exist yet, create initial one automatically
  if (!state.settings.providers || state.settings.providers.length === 0) {
    addNewProvider();
    return;
  }

  state.currentEditingProviderId = targetProviderId 
    || state.settings.activeProviderId 
    || (state.settings.providers[0] && state.settings.providers[0].id);

  renderProviderTabs();
  loadEditingProviderIntoModal();
  updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút bên phải để kiểm tra API Key và máy chủ trước khi lưu.');
  DOM.settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  DOM.settingsModal.classList.add('hidden');
  checkReadiness();
}

function renderProviderTabs() {
  DOM.providerTabs.innerHTML = '';

  state.settings.providers.forEach(p => {
    const isOnline = !!(p.apiKey && (p.isVerified || state.connectionVerified?.[p.id]));
    const btn = document.createElement('button');
    btn.className = `provider-tab-pill ${p.id === state.currentEditingProviderId ? 'active' : ''}`;
    btn.type = 'button';
    btn.innerHTML = `
      <span class="tab-status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Đang hoạt động' : 'Chưa kết nối / Lỗi'}"></span>
      <span class="tab-name">${escapeHtml(p.displayName || '(Chưa đặt tên)')}</span>
    `;
    btn.addEventListener('click', () => {
      saveModalInputsIntoEditingProvider();
      state.currentEditingProviderId = p.id;
      renderProviderTabs();
      loadEditingProviderIntoModal();
    });
    DOM.providerTabs.appendChild(btn);
  });
}

function loadEditingProviderIntoModal() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  DOM.modalProviderTitle.textContent = provider.displayName || 'Cấu hình API';
  DOM.cfgApiKey.value = provider.apiKey || '';
  DOM.cfgDisplayName.value = provider.displayName || '';
  DOM.cfgBaseUrl.value = provider.baseUrl || '';
  DOM.cfgProtocol.value = provider.apiProtocol || 'OpenAI Chat Completions';

  DOM.cfgApiKey.classList.remove('input-error');

  const isOnline = !!(provider.apiKey && (provider.isVerified || state.connectionVerified?.[provider.id]));
  if (DOM.modalHeaderStatusDot) {
    DOM.modalHeaderStatusDot.className = `status-indicator-dot ${isOnline ? 'online' : 'offline'}`;
    DOM.modalHeaderStatusDot.title = isOnline ? 'Đã xác thực kết nối máy chủ (Online)' : 'Chưa kết nối hoặc Key không hợp lệ (Offline)';
  }

  if (isOnline) {
    updateTestConnectionCard('success', '✓ Kết nối thành công!', 'API Key và máy chủ hoạt động tốt.');
  } else {
    updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút "Kiểm tra kết nối" hoặc bấm "Apply" để tự động kiểm tra trước khi lưu.');
  }

  // Render Models list
  renderModelsCatalog(provider.models || []);
}

function saveModalInputsIntoEditingProvider() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  provider.apiKey = DOM.cfgApiKey.value.trim();
  provider.displayName = DOM.cfgDisplayName.value.trim() || 'API Provider';
  provider.baseUrl = DOM.cfgBaseUrl.value.trim();
  provider.apiProtocol = DOM.cfgProtocol.value;
  provider.models = collectModelsFromUI();
}

function renderModelsCatalog(models) {
  DOM.modelsList.innerHTML = '';

  if (!models || models.length === 0) {
    addModelRow('', '');
    return;
  }

  models.forEach(m => {
    addModelRow(m.id, m.name || m.id);
  });
}

function addModelRow(id = '', name = '') {
  const row = document.createElement('div');
  row.className = 'model-row-item';

  const inputId = document.createElement('input');
  inputId.type = 'text';
  inputId.placeholder = 'Model ID (VD: chib/deepseek-v4.1-flash)';
  inputId.value = id;
  inputId.dataset.field = 'id';

  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.placeholder = 'Display Name (VD: deepseek-v4.1-flash)';
  inputName.value = name || id;
  inputName.dataset.field = 'name';

  const btnDel = document.createElement('button');
  btnDel.className = 'btn-delete-row';
  btnDel.type = 'button';
  btnDel.title = 'Xóa model này';
  btnDel.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;

  btnDel.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(inputId);
  row.appendChild(inputName);
  row.appendChild(btnDel);

  DOM.modelsList.appendChild(row);
}

function collectModelsFromUI() {
  const rows = DOM.modelsList.querySelectorAll('.model-row-item');
  const models = [];

  rows.forEach(row => {
    const idInput = row.querySelector('input[data-field="id"]');
    const nameInput = row.querySelector('input[data-field="name"]');
    const id = idInput ? idInput.value.trim() : '';
    const name = nameInput ? nameInput.value.trim() : id;

    if (id) {
      models.push({ id, name: name || id });
    }
  });

  return models;
}

// Toggle Show/Hide API Key
function toggleApiKeyVisibility() {
  if (DOM.cfgApiKey.type === 'password') {
    DOM.cfgApiKey.type = 'text';
    DOM.eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    DOM.cfgApiKey.type = 'password';
    DOM.eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
}

// Reusable Real Server Verification Helper
async function performTestConnection(providerData) {
  const apiKey = (providerData.apiKey || '').trim();
  const baseUrl = (providerData.baseUrl || '').trim();

  if (!apiKey) {
    return { success: false, error: 'Chưa nhập API Key. Vui lòng dán API Key trước khi kiểm tra.' };
  }
  if (!baseUrl) {
    return { success: false, error: 'Chưa nhập Base URL máy chủ API.' };
  }

  try {
    if (window.api && window.api.testConnection) {
      return await window.api.testConnection(providerData);
    } else {
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const testRes = await fetch(`${cleanUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (testRes.ok) {
        return { success: true, message: 'Xác thực thành công với máy chủ (200 OK)!' };
      } else {
        let msg = `HTTP ${testRes.status}: ${testRes.statusText}`;
        try {
          const errData = await testRes.json();
          if (errData.error?.message) msg = errData.error.message;
        } catch (e) {}
        return { success: false, error: msg };
      }
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Dedicated Test Connection Box Handler (Real Server Verification 100%)
async function testProviderConnection() {
  saveModalInputsIntoEditingProvider();
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  const apiKey = (DOM.cfgApiKey.value || '').trim();
  const baseUrl = (DOM.cfgBaseUrl.value || '').trim();

  if (!apiKey) {
    DOM.cfgApiKey.classList.add('input-error');
    updateTestConnectionCard('error', 'Chưa nhập API Key', 'Vui lòng dán API Key thật của bạn vào ô phía trên trước khi kiểm tra.');
    showToast('Vui lòng nhập API Key trước!', 'warning');
    DOM.cfgApiKey.focus();
    return;
  }

  DOM.cfgApiKey.classList.remove('input-error');
  updateTestConnectionCard('loading', 'Đang kiểm tra kết nối...', `Đang gửi yêu cầu xác thực tới máy chủ ${baseUrl}...`);
  DOM.btnTestConnection.disabled = true;

  try {
    const res = await performTestConnection({ ...provider, apiKey, baseUrl });

    if (res && res.success) {
      state.connectionVerified = state.connectionVerified || {};
      state.connectionVerified[provider.id] = true;
      provider.isVerified = true;
      updateTestConnectionCard('success', '✓ Kết nối thành công!', res.message || 'API Key và máy chủ hoạt động tốt.');
      if (DOM.modalHeaderStatusDot) {
        DOM.modalHeaderStatusDot.className = 'status-indicator-dot online';
        DOM.modalHeaderStatusDot.title = 'Đã xác thực kết nối máy chủ (Online)';
      }
      renderProviderTabs();
      showToast('Kết nối API thành công (200 OK)!', 'success');
      updateHeaderActiveModel();
    } else {
      state.connectionVerified = state.connectionVerified || {};
      state.connectionVerified[provider.id] = false;
      provider.isVerified = false;
      DOM.cfgApiKey.classList.add('input-error');
      const errText = (res && res.error) ? res.error : 'Máy chủ từ chối kết nối hoặc sai API Key.';
      updateTestConnectionCard('error', '✗ Kết nối thất bại', errText);
      if (DOM.modalHeaderStatusDot) {
        DOM.modalHeaderStatusDot.className = 'status-indicator-dot offline';
        DOM.modalHeaderStatusDot.title = 'Chưa kết nối hoặc Key không hợp lệ (Offline)';
      }
      renderProviderTabs();
      showToast(`Lỗi kết nối: ${errText}`, 'danger');
      updateHeaderActiveModel();
    }
  } catch (err) {
    state.connectionVerified = state.connectionVerified || {};
    state.connectionVerified[provider.id] = false;
    provider.isVerified = false;
    DOM.cfgApiKey.classList.add('input-error');
    updateTestConnectionCard('error', '✗ Lỗi kết nối mạng', err.message);
    if (DOM.modalHeaderStatusDot) DOM.modalHeaderStatusDot.className = 'status-indicator-dot offline';
    renderProviderTabs();
    showToast(`Lỗi kết nối: ${err.message}`, 'danger');
    updateHeaderActiveModel();
  } finally {
    DOM.btnTestConnection.disabled = false;
    checkReadiness();
  }
}

function updateTestConnectionCard(status, title, desc) {
  DOM.testConnectionCard.className = `test-connection-card ${status}`;
  DOM.testConnDot.className = `status-indicator-dot ${status === 'success' ? 'online' : (status === 'loading' ? 'loading' : 'offline')}`;
  DOM.testConnStatusTitle.textContent = title;
  DOM.testConnStatusDesc.textContent = desc;
  DOM.btnTestConnText.textContent = status === 'loading' ? 'Đang test...' : 'Kiểm tra kết nối';
}

// Fetch Available Models (Real Server 100%)
async function fetchModelsFromProvider() {
  saveModalInputsIntoEditingProvider();
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  if (!provider.apiKey || !provider.apiKey.trim()) {
    showToast('Vui lòng nhập API Key trước khi lấy danh sách model!', 'warning');
    DOM.cfgApiKey.focus();
    return;
  }

  updateTestConnectionCard('loading', 'Đang tải danh sách models...', `Đang gọi /models từ ${provider.baseUrl}...`);
  DOM.btnFetchModels.disabled = true;

  try {
    if (window.api && window.api.fetchModels) {
      const res = await window.api.fetchModels(provider);
      if (res.success && res.models && res.models.length > 0) {
        updateTestConnectionCard('success', `✓ Đã tìm thấy ${res.models.length} models`, 'Đã cập nhật danh sách models từ máy chủ vào bảng.');
        renderModelsCatalog(res.models);
        showToast(`Đã tải thành công ${res.models.length} models!`, 'success');
      } else {
        updateTestConnectionCard('error', '✗ Không lấy được models', res.error || 'Máy chủ không trả về danh sách model.');
        showToast(res.error ? `Lỗi: ${res.error}` : 'Không tìm thấy models!', 'danger');
      }
    } else {
      showToast('Cần chạy trên desktop để fetch tự động.', 'info');
    }
  } catch (err) {
    updateTestConnectionCard('error', '✗ Lỗi kết nối', err.message);
    showToast(`Lỗi: ${err.message}`, 'danger');
  } finally {
    DOM.btnFetchModels.disabled = false;
  }
}

// Restore Provider Defaults
function restoreCurrentProviderDefaults() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  provider.models = [];
  loadEditingProviderIntoModal();
  updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút bên phải để kiểm tra API Key và máy chủ trước khi lưu.');
  showToast('Đã làm mới danh sách Models!', 'info');
}

// ===================================================================
// QUICK API SWITCHER & PROVIDER MANAGEMENT
// ===================================================================
function toggleQuickApiMenu() {
  if (state.isGenerating) return; // Strict lock during generation!

  const isHidden = DOM.quickApiMenu.classList.contains('hidden');
  if (isHidden) {
    renderQuickApiMenu();
    DOM.quickApiMenu.classList.remove('hidden');
    if (DOM.pillChevron) DOM.pillChevron.classList.add('rotate');
  } else {
    DOM.quickApiMenu.classList.add('hidden');
    if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');
  }
}

function renderQuickApiMenu() {
  DOM.quickMenuList.innerHTML = '';

  const providers = state.settings.providers || [];
  if (providers.length === 0) {
    DOM.quickMenuList.innerHTML = `
      <div class="quick-menu-empty">
        <p><strong>Chưa có cấu hình API nào.</strong></p>
        <p style="margin-top: 4px; font-size: 11px;">Bấm nút bên dưới để thêm và cấu hình API Key của bạn.</p>
      </div>
    `;
    return;
  }

  providers.forEach(prov => {
    const group = document.createElement('div');
    group.className = 'quick-provider-group';

    const isOnline = !!(prov.apiKey && (prov.isVerified || state.connectionVerified?.[prov.id]));
    const header = document.createElement('div');
    header.className = 'quick-provider-title';
    header.innerHTML = `
      <span>${escapeHtml(prov.displayName || prov.id)}</span>
      <span style="font-size: 10px; font-weight: 600; color: ${isOnline ? '#10B981' : '#EF4444'};">
        ${isOnline ? '🟢 Đang hoạt động' : '🔴 Chưa kết nối / Lỗi'}
      </span>
    `;
    group.appendChild(header);

    const models = (prov.models && prov.models.length > 0)
      ? prov.models 
      : [{ id: 'default', name: 'Model mặc định' }];

    models.forEach(model => {
      const isCurrentActive = (state.settings.activeProviderId === prov.id && state.settings.activeModelId === model.id);

      const item = document.createElement('div');
      item.className = `quick-model-item ${isCurrentActive ? 'active' : ''}`;
      item.innerHTML = `
        <div class="quick-model-left">
          <span class="quick-model-dot"></span>
          <span>${escapeHtml(model.name || model.id)}</span>
        </div>
        ${isCurrentActive ? '<span class="quick-model-active-badge">Đang dùng</span>' : ''}
      `;

      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (state.isGenerating) return;

        state.settings.activeProviderId = prov.id;
        state.settings.activeModelId = model.id;

        // Persist to saved_apis.json
        if (window.api && window.api.saveSavedApis) {
          await window.api.saveSavedApis({
            activeProviderId: state.settings.activeProviderId,
            activeModelId: state.settings.activeModelId,
            providers: state.settings.providers
          });
        }

        updateHeaderActiveModel();
        DOM.quickApiMenu.classList.add('hidden');
        if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');
        checkReadiness();
        showToast(`Đã chuyển sang ${prov.displayName || prov.id} (${model.name || model.id})`, 'success');
      });

      group.appendChild(item);
    });

    DOM.quickMenuList.appendChild(group);
  });
}

// Delete Confirmation Modal Triggers
function promptDeleteProvider() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  DOM.deleteTargetProviderName.textContent = provider.displayName || provider.id;
  DOM.deleteConfirmModal.classList.remove('hidden');
}

function closeDeleteConfirmModal() {
  DOM.deleteConfirmModal.classList.add('hidden');
}

// Confirm Delete Handler (Deletes and saves to saved_apis.json)
async function confirmDeleteProvider() {
  const deletedProvider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  const deletedName = deletedProvider ? (deletedProvider.displayName || deletedProvider.id) : 'Provider';

  state.settings.providers = state.settings.providers.filter(p => p.id !== state.currentEditingProviderId);
  
  if (state.settings.providers.length > 0) {
    state.currentEditingProviderId = state.settings.providers[0].id;
    if (state.settings.activeProviderId === deletedProvider?.id) {
      state.settings.activeProviderId = state.settings.providers[0].id;
      state.settings.activeModelId = (state.settings.providers[0].models && state.settings.providers[0].models[0]?.id) || '';
    }
  } else {
    state.currentEditingProviderId = null;
    state.settings.activeProviderId = '';
    state.settings.activeModelId = '';
  }

  // Persist deletion to saved_apis.json
  if (window.api && window.api.saveSavedApis) {
    await window.api.saveSavedApis({
      activeProviderId: state.settings.activeProviderId,
      activeModelId: state.settings.activeModelId,
      providers: state.settings.providers
    });
  }

  closeDeleteConfirmModal();

  if (state.settings.providers.length > 0) {
    renderProviderTabs();
    loadEditingProviderIntoModal();
  } else {
    closeSettingsModal();
  }

  updateHeaderActiveModel();
  checkReadiness();
  showToast(`Đã xóa cấu hình API "${deletedName}" thành công!`, 'info');
}

// Add New Provider (Clean blank provider ready for user input)
async function addNewProvider() {
  const newProv = {
    id: 'provider_' + Date.now(),
    displayName: '',
    apiKey: '',
    baseUrl: '',
    apiProtocol: 'OpenAI Chat Completions',
    models: []
  };

  state.settings.providers.push(newProv);
  state.currentEditingProviderId = newProv.id;

  renderProviderTabs();
  loadEditingProviderIntoModal();
  updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút bên phải để kiểm tra API Key và máy chủ trước khi lưu.');
  DOM.settingsModal.classList.remove('hidden');

  DOM.cfgDisplayName.focus();
  showToast('Đã tạo API mới. Hãy nhập Tên, Base URL và dán API Key của bạn!', 'info');
}

// Save & Apply Settings (Auto-validates connection with real server before saving)
async function saveAndApplySettings() {
  saveModalInputsIntoEditingProvider();

  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  const apiKey = (DOM.cfgApiKey.value || '').trim();
  const baseUrl = (DOM.cfgBaseUrl.value || '').trim();

  // Validate API Key presence
  if (!apiKey) {
    DOM.cfgApiKey.classList.add('input-error');
    DOM.cfgApiKey.focus();
    updateTestConnectionCard('error', 'Chưa nhập API Key', 'Vui lòng dán API Key thật của bạn trước khi lưu.');
    showToast('Vui lòng nhập API Key trước khi lưu!', 'warning');
    return;
  }

  // Validate Base URL presence
  if (!baseUrl) {
    DOM.cfgBaseUrl.focus();
    updateTestConnectionCard('error', 'Chưa nhập Base URL', 'Vui lòng nhập Base URL máy chủ API.');
    showToast('Vui lòng nhập Base URL trước khi lưu!', 'warning');
    return;
  }

  // Automatic connection verification before saving
  DOM.btnApplySettings.disabled = true;
  const originalApplyText = DOM.btnApplySettings.textContent;
  DOM.btnApplySettings.textContent = 'Đang kiểm tra kết nối...';
  updateTestConnectionCard('loading', 'Đang kiểm tra kết nối...', `Đang xác thực API Key với máy chủ ${baseUrl}...`);

  let res;
  try {
    res = await performTestConnection({ ...provider, apiKey, baseUrl });
  } catch (err) {
    res = { success: false, error: err.message };
  }

  // Verification FAILED -> DO NOT SAVE, DO NOT CLOSE MODAL
  if (!res || !res.success) {
    DOM.btnApplySettings.disabled = false;
    DOM.btnApplySettings.textContent = originalApplyText;

    state.connectionVerified = state.connectionVerified || {};
    state.connectionVerified[provider.id] = false;
    provider.isVerified = false;

    DOM.cfgApiKey.classList.add('input-error');
    DOM.cfgApiKey.focus();

    const errDetail = res?.error || 'Máy chủ từ chối kết nối hoặc sai API Key.';
    updateTestConnectionCard('error', '✗ Kết nối thất bại', errDetail);
    if (DOM.modalHeaderStatusDot) DOM.modalHeaderStatusDot.className = 'status-indicator-dot offline';
    renderProviderTabs();

    showToast(`API Key hiện tại của bạn chưa đúng, vui lòng thử lại! (${errDetail})`, 'danger');
    return;
  }

  // Verification SUCCEEDED
  state.connectionVerified = state.connectionVerified || {};
  state.connectionVerified[provider.id] = true;
  provider.isVerified = true;

  DOM.cfgApiKey.classList.remove('input-error');
  updateTestConnectionCard('success', '✓ Kết nối thành công!', res.message || 'API Key và máy chủ hoạt động tốt.');
  if (DOM.modalHeaderStatusDot) DOM.modalHeaderStatusDot.className = 'status-indicator-dot online';

  // Set current editing provider and its active model
  state.settings.activeProviderId = state.currentEditingProviderId;
  if (provider.models && provider.models.length > 0) {
    if (!provider.models.some(m => m.id === state.settings.activeModelId)) {
      state.settings.activeModelId = provider.models[0].id;
    }
  }

  // Persist directly to saved_apis.json (including isVerified)
  try {
    if (window.api && window.api.saveSavedApis) {
      await window.api.saveSavedApis({
        activeProviderId: state.settings.activeProviderId,
        activeModelId: state.settings.activeModelId,
        providers: state.settings.providers
      });
    }
  } catch (err) {
    console.error('Failed to save saved_apis:', err);
  }

  DOM.btnApplySettings.disabled = false;
  DOM.btnApplySettings.textContent = originalApplyText;

  renderProviderTabs();
  updateHeaderActiveModel();
  closeSettingsModal();
  checkReadiness();
  showToast('✓ Kết nối thành công! Đã lưu và kích hoạt cấu hình API.', 'success');
}

// ===================================================================
// GENERAL SETTINGS MODAL (LINE SPACING & SYSTEM PREFERENCES)
// ===================================================================
function openGeneralSettingsModal() {
  if (state.isGenerating) return;

  const currentSpacing = (state.preferences && state.preferences.lineSpacing) || 'tight';
  if (currentSpacing === 'normal') {
    DOM.optSpacingNormal.checked = true;
    DOM.cardSpacingNormal.classList.add('active');
    DOM.cardSpacingTight.classList.remove('active');
  } else {
    DOM.optSpacingTight.checked = true;
    DOM.cardSpacingTight.classList.add('active');
    DOM.cardSpacingNormal.classList.remove('active');
  }

  DOM.generalSettingsModal.classList.remove('hidden');
}

function closeGeneralSettingsModal() {
  DOM.generalSettingsModal.classList.add('hidden');
}

function saveGeneralSettings() {
  const isTight = DOM.optSpacingTight.checked;
  const newSpacing = isTight ? 'tight' : 'normal';

  state.preferences = state.preferences || {};
  state.preferences.lineSpacing = newSpacing;

  try {
    localStorage.setItem('autocontent_preferences', JSON.stringify(state.preferences));
  } catch (err) {
    console.warn('Could not save preferences to localStorage:', err);
  }

  // Live update output display if script is loaded
  if (state.rawOutputScript) {
    DOM.scriptContent.innerHTML = formatCleanScript(state.rawOutputScript);
  }

  closeGeneralSettingsModal();
  showToast(`Đã lưu cài đặt! Kịch bản đang ở chế độ: ${isTight ? 'Sát dòng (Không khoảng trống)' : 'Dãn đoạn tiêu chuẩn'}`, 'success');
}

// ===================================================================
// TOAST NOTIFICATIONS
// ===================================================================
let toastTimeout = null;
function showToast(message, type = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout);

  DOM.toastMsg.textContent = message;

  if (type === 'success') {
    DOM.toastIcon.textContent = '✓';
    DOM.toastIcon.style.background = '#10B981';
  } else if (type === 'warning') {
    DOM.toastIcon.textContent = '!';
    DOM.toastIcon.style.background = '#F59E0B';
  } else if (type === 'danger') {
    DOM.toastIcon.textContent = '✕';
    DOM.toastIcon.style.background = '#EF4444';
  } else {
    DOM.toastIcon.textContent = 'i';
    DOM.toastIcon.style.background = '#3B82F6';
  }

  DOM.toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    DOM.toast.classList.add('hidden');
  }, 3500);
}

// Start Application
window.addEventListener('DOMContentLoaded', initApp);
