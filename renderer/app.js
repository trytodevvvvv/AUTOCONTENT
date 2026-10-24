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
  activeWorkspaceView: 'script',
  preferences: {
    scriptwriter: {
      lineSpacing: 'tight'
    },
    titleGenerator: {
      defaultLanguage: 'last_used'
    },
    system: {
      autoCheckUpdate: true
    },
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
  },
  pendingUpdate: null,
  titleState: {
    targetLanguage: 'vi',
    isGenerating: false,
    titles: [],
    abortController: null
  },
  descriptionState: {
    mode: 'plain',
    targetLanguage: 'vi',
    isUserManualLang: false,
    isGenerating: false,
    tags: [],
    descriptionText: '',
    abortController: null
  }
};

// Sample text for instant demonstration
const SAMPLE_INPUT_TEXT = `Tại sao DeepSeek lại tạo nên cơn địa chấn trong giới công nghệ toàn cầu?

Đầu năm 2025, DeepSeek - một startup AI đến từ Trung Quốc đã gây sốc toàn thế giới khi tung ra mô hình DeepSeek-R1 và V3 với sức mạnh tương đương hoặc vượt trội GPT-4o của OpenAI, nhưng chi phí huấn luyện chỉ bằng một phần rất nhỏ (chưa tới 6 triệu USD so với hàng trăm triệu USD của các ông lớn Thung lũng Silicon).

Bí quyết nằm ở kiến trúc Mixture of Experts (MoE) cực kỳ tối ưu, thuật toán Multi-Head Latent Attention (MLA), và phương pháp học tăng cường không cần dữ liệu gắn nhãn tốn kém. Không chỉ vậy, DeepSeek còn mở mã nguồn mở hoàn toàn mô hình, cho phép cộng đồng phát triển tự do tải về và triển khai cục bộ.

Điều này chứng minh rằng: Cuộc đua AI không chỉ là câu chuyện dùng tiền đè người với hàng trăm nghìn card GPU đắt đỏ, mà trí tuệ tối ưu hóa thuật toán mới là chìa khóa mở ra tương lai AI giá rẻ cho nhân loại.`;

// Sample titles for viral title generator demonstration
const SAMPLE_TITLES = [
  "Tại sao người ta lại sợ mua xe điện?",
  "Bí mật đằng sau sự trỗi dậy của DeepSeek",
  "Lý do khiến 90% nhà đầu tư thua lỗ trên thị trường tài chính",
  "Sự thật giật mình về thói quen thức khuya mỗi ngày",
  "Cách người giàu âm thầm bảo vệ tài sản trong thời kỳ khủng hoảng",
  "Tại sao các đế chế công nghệ lại sa thải hàng loạt kỹ sư?"
];

// Sample data for Description & Tags demonstration
const SAMPLE_DESC_DATA = [
  {
    mode: 'plain',
    title: 'Tại sao 90% người dùng iPhone đang sạc pin sai cách?',
    content: `Hầu hết mọi người khi mua iPhone về đều có thói quen cắm sạc qua đêm hoặc để pin tụt xuống dưới 10% thậm chí sập nguồn mới cuống cuồng đi tìm cục sạc. Tuy nhiên, theo các chuyên gia kỹ thuật pin lithium-ion, thói quen này đang âm thầm làm giảm tuổi thọ pin iPhone của bạn nhanh gấp 3 lần bình thường.

Trong video này, chúng ta sẽ cùng bóc tách toàn bộ:
1. Quy tắc vàng 20% - 80% giúp pin iPhone bền bỉ sau 3 năm sử dụng.
2. Sạc nhanh 20W hay 30W có thực sự gây chai pin nhanh hơn sạc 5W truyền thống không?
3. Tính năng Sạc pin được tối ưu hóa (Optimized Battery Charging) trên iOS hoạt động ra sao?
4. Nhiệt độ - kẻ thù số 1 của pin và những lưu ý sống còn khi vừa sạc vừa lướt TikTok/chơi game.

Hãy xem hết video để bảo vệ chiếc dế yêu đắt tiền của bạn ngay hôm nay!`
  },
  {
    mode: 'plain',
    title: 'Why 90% of iPhone Users Are Charging Their Phones Wrong!',
    content: `Most people plug in their iPhone overnight or let it drop below 10% before panicking to find a charger. According to battery engineers, these common daily habits are degrading your lithium-ion battery health three times faster than normal.

In this video, we break down:
1. The 20% - 80% golden rule to keep your iPhone battery healthy for 3+ years.
2. Does 20W or 30W fast charging really destroy battery health faster than slow 5W chargers?
3. How Optimized Battery Charging and Clean Energy Charging on iOS actually work.
4. Heat: The #1 battery killer and why you should NEVER game while fast charging.

Watch until the end to protect your device battery health today!`
  },
  {
    mode: 'srt',
    title: 'Sự thật đằng sau cú sốc DeepSeek: Trí tuệ nhân tạo sẽ thay đổi thế giới ra sao?',
    content: `1
00:00:00,000 --> 00:00:18,500
Đầu năm 2025, cả Thung lũng Silicon đã chấn động khi startup AI Trung Quốc ra mắt DeepSeek R1.

2
00:00:18,500 --> 00:01:25,000
Chi phí huấn luyện chỉ 6 triệu USD, bằng 1 phần 50 so với OpenAI hay Google, nhưng hiệu năng ngang ngửa GPT-4o.

3
00:01:25,000 --> 00:02:50,000
Bí mật nằm ở kiến trúc Mixture of Experts và thuật toán MLA tối ưu bộ nhớ GPU siêu phàm.

4
00:02:50,000 --> 00:04:40,000
Tác động khủng khiếp tới cổ phiếu Nvidia và cuộc đua bán dẫn toàn cầu trong thập kỷ tới.

5
00:04:40,000 --> 00:06:20,000
Người dùng bình thường sẽ được hưởng lợi gì khi AI đỉnh cao trở nên hoàn toàn miễn phí và mã nguồn mở?

6
00:06:20,000 --> 00:07:35,000
Tổng kết và dự đoán tương lai AI trong 5 năm tới. Đừng quên bấm Đăng ký kênh để không bỏ lỡ!`
  }
];

// Target languages configuration for title generator
const TITLE_TARGET_LANGUAGES = {
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', promptDesc: 'Tiếng Việt tự nhiên, chuẩn phong cách YouTube Creator Việt Nam' },
  en: { name: 'English', flag: '🇺🇸', promptDesc: 'High-CTR viral English for US/Global YouTube audience' },
  zh: { name: '中文 (Tiếng Trung)', flag: '🇨🇳', promptDesc: 'Chuyên nghiệp, lôi cuốn, đúng văn phong người xem YouTube tiếng Trung (Mandarin)' },
  ja: { name: '日本語 (Tiếng Nhật)', flag: '🇯🇵', promptDesc: 'Chuẩn phong cách tiêu đề YouTube Nhật Bản, cuốn hút và kích thích tò mò' },
  ko: { name: '한국어 (Tiếng Hàn)', flag: '🇰🇷', promptDesc: 'Chuẩn phong cách YouTube Hàn Quốc, giật gân, cuốn hút' },
  es: { name: 'Español (Tây Ban Nha)', flag: '🇪🇸', promptDesc: 'Español nativo, estilo viral de YouTube para España y Latinoamérica' },
  pt: { name: 'Português (Bồ Đào Nha)', flag: '🇵🇹', promptDesc: 'Português de Portugal natural, estilo envolvente para YouTube' },
  br: { name: 'Português do Brasil', flag: '🇧🇷', promptDesc: 'Português brasileiro nativo, altamente viral e dinâmico para YouTube Brasil' }
};

// Gemini API Constants
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_DEFAULT_MODELS = [
  { id: 'gemini-3.8-flash-lite', name: 'Gemini 3.8 Flash Lite (Ưu tiên cao nhất)' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Dự phòng)' }
];

function resolveBaseUrl(provider) {
  let baseUrl = (provider.baseUrl || '').trim().replace(/\/+$/, '');
  const apiKey = (provider.apiKey || '').trim();
  const isKeyOnly = (provider.providerType === 'gemini');

  if (isKeyOnly || !baseUrl || baseUrl.includes('your-provider.com')) {
    if (apiKey.startsWith('AIzaSy')) {
      return GEMINI_BASE_URL;
    } else if (apiKey.startsWith('gsk_')) {
      return 'https://api.groq.com/openai/v1';
    } else if (apiKey.startsWith('sk-or-')) {
      return 'https://openrouter.ai/api/v1';
    } else if (isKeyOnly) {
      return GEMINI_BASE_URL;
    }
  }
  return baseUrl;
}

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
  headerUpdateBadgeDot: document.getElementById('headerUpdateBadgeDot'),

  // Studio Sidebar & Multi-Module Routing
  btnNavScript: document.getElementById('btnNavScript'),
  btnNavDescription: document.getElementById('btnNavDescription'),
  btnNavTitle: document.getElementById('btnNavTitle'),
  btnNavSettings: document.getElementById('btnNavSettings'),
  sidebarStatusDot: document.getElementById('sidebarStatusDot'),
  sidebarUpdateDot: document.getElementById('sidebarUpdateDot'),
  viewScriptwriter: document.getElementById('viewScriptwriter'),
  viewDescriptionGenerator: document.getElementById('viewDescriptionGenerator'),
  viewTitleGenerator: document.getElementById('viewTitleGenerator'),
  viewSettings: document.getElementById('viewSettings'),
  btnBackToScript: document.getElementById('btnBackToScript'),
  btnBackToScriptText: document.getElementById('btnBackToScriptText'),
  headerSubtitleText: document.getElementById('headerSubtitleText'),
  tabNavGeneral: document.getElementById('tabNavGeneral'),
  tabNavApiKeys: document.getElementById('tabNavApiKeys'),
  tabNavUpdates: document.getElementById('tabNavUpdates'),
  tabUpdateDot: document.getElementById('tabUpdateDot'),
  panelSettingsGeneral: document.getElementById('panelSettingsGeneral'),
  panelSettingsApiKeys: document.getElementById('panelSettingsApiKeys'),
  panelSettingsUpdates: document.getElementById('panelSettingsUpdates'),
  selTitleDefaultLang: document.getElementById('selTitleDefaultLang'),
  chkAutoCheckUpdateStartup: document.getElementById('chkAutoCheckUpdateStartup'),

  // Module: Description & vidIQ Tags Generator Elements
  btnSampleDesc: document.getElementById('btnSampleDesc'),
  btnClearDesc: document.getElementById('btnClearDesc'),
  inputDescTitle: document.getElementById('inputDescTitle'),
  btnPasteDescTitle: document.getElementById('btnPasteDescTitle'),
  btnClearDescTitle: document.getElementById('btnClearDescTitle'),
  descTitleCharCount: document.getElementById('descTitleCharCount'),
  btnModePlain: document.getElementById('btnModePlain'),
  btnModeSrt: document.getElementById('btnModeSrt'),
  inputDescContent: document.getElementById('inputDescContent'),
  btnPasteDescContent: document.getElementById('btnPasteDescContent'),
  btnClearDescContent: document.getElementById('btnClearDescContent'),
  descContentCharCount: document.getElementById('descContentCharCount'),
  descContentWordCount: document.getElementById('descContentWordCount'),
  descLangGrid: document.getElementById('descLangGrid'),
  descLangAutoBadge: document.getElementById('descLangAutoBadge'),
  btnGenerateDesc: document.getElementById('btnGenerateDesc'),
  btnGenerateDescText: document.getElementById('btnGenerateDescText'),
  descOutputStatusDesc: document.getElementById('descOutputStatusDesc'),
  descStatusBadge: document.getElementById('descStatusBadge'),
  descStatusText: document.getElementById('descStatusText'),
  descOutputBody: document.getElementById('descOutputBody'),
  descEmptyState: document.getElementById('descEmptyState'),
  descLoadingState: document.getElementById('descLoadingState'),
  descLoadingText: document.getElementById('descLoadingText'),
  descResultsWrapper: document.getElementById('descResultsWrapper'),
  descCharCountPill: document.getElementById('descCharCountPill'),
  btnCopyDescOnly: document.getElementById('btnCopyDescOnly'),
  descOutputText: document.getElementById('descOutputText'),
  descTagsCharCountPill: document.getElementById('descTagsCharCountPill'),
  btnCopyTagsOnly: document.getElementById('btnCopyTagsOnly'),
  descTagsCloud: document.getElementById('descTagsCloud'),
  inputAddCustomTag: document.getElementById('inputAddCustomTag'),
  btnAddCustomTag: document.getElementById('btnAddCustomTag'),
  btnCopyAllDescAndTags: document.getElementById('btnCopyAllDescAndTags'),
  btnRegenerateDesc: document.getElementById('btnRegenerateDesc'),

  // Module 2: Title Generator Elements
  btnSampleTitle: document.getElementById('btnSampleTitle'),
  btnPasteTitle: document.getElementById('btnPasteTitle'),
  btnClearTitle: document.getElementById('btnClearTitle'),
  inputOriginalTitle: document.getElementById('inputOriginalTitle'),
  titleCharCount: document.getElementById('titleCharCount'),
  titleWordCount: document.getElementById('titleWordCount'),
  titleSelectedLangBadge: document.getElementById('titleSelectedLangBadge'),
  titleLangGrid: document.getElementById('titleLangGrid'),
  btnGenerateTitles: document.getElementById('btnGenerateTitles'),
  btnGenerateTitlesText: document.getElementById('btnGenerateTitlesText'),
  btnCopyAllTitles: document.getElementById('btnCopyAllTitles'),
  btnRegenerateTitles: document.getElementById('btnRegenerateTitles'),
  titleOutputStatusDesc: document.getElementById('titleOutputStatusDesc'),
  titleOutputBody: document.getElementById('titleOutputBody'),
  titleEmptyState: document.getElementById('titleEmptyState'),
  titleLoadingState: document.getElementById('titleLoadingState'),
  titleLoadingText: document.getElementById('titleLoadingText'),
  titleResultsList: document.getElementById('titleResultsList'),
  titleCountPill: document.getElementById('titleCountPill'),
  titleStatusBadge: document.getElementById('titleStatusBadge'),
  titleStatusText: document.getElementById('titleStatusText'),
  titleMetaLang: document.getElementById('titleMetaLang'),
  titleCountStat: document.getElementById('titleCountStat'),

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
  chkAutoRotateModal: document.getElementById('chkAutoRotateModal'),
  failoverSettingBox: document.getElementById('failoverSettingBox'),
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
  outCharCount: document.getElementById('outCharCount') || document.getElementById('outWordCount'),
  outWordCount: document.getElementById('outCharCount') || document.getElementById('outWordCount'),
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

  // Provider Connection Types (Cách 1 & Cách 2)
  cardTypeOpenAI: document.getElementById('cardTypeOpenAI'),
  cardTypeGemini: document.getElementById('cardTypeGemini'),
  radioTypeOpenAI: document.getElementById('radioTypeOpenAI'),
  radioTypeGemini: document.getElementById('radioTypeGemini'),
  groupBaseUrl: document.getElementById('groupBaseUrl'),
  geminiAutoNotice: document.getElementById('geminiAutoNotice'),
  linkGetGeminiKey: document.getElementById('linkGetGeminiKey'),
  lblApiKey: document.getElementById('lblApiKey'),
  tooltipApiKey: document.getElementById('tooltipApiKey'),

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

  // Version & Update System Elements
  currentAppVersionDisplay: document.getElementById('currentAppVersionDisplay'),
  appVersionStatusText: document.getElementById('appVersionStatusText'),
  btnCheckUpdateManual: document.getElementById('btnCheckUpdateManual'),
  btnCheckUpdateText: document.getElementById('btnCheckUpdateText'),
  iconRefreshUpdate: document.getElementById('iconRefreshUpdate'),
  updateNotificationModal: document.getElementById('updateNotificationModal'),
  updateNewVersionBadge: document.getElementById('updateNewVersionBadge'),
  updateCurrentVersionNote: document.getElementById('updateCurrentVersionNote'),
  updateDescText: document.getElementById('updateDescText'),
  updateChangelogContent: document.getElementById('updateChangelogContent'),
  btnCloseUpdateModal: document.getElementById('btnCloseUpdateModal'),
  btnPostponeUpdate: document.getElementById('btnPostponeUpdate'),
  btnAcceptUpdate: document.getElementById('btnAcceptUpdate'),
  btnAcceptUpdateText: document.getElementById('btnAcceptUpdateText'),
  updateDownloadProgress: document.getElementById('updateDownloadProgress'),

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
  checkTitleReadiness();
  checkDescReadiness();
  initUpdateSystem();
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
            const baseUrl = resolveBaseUrl(p);
            p.verifiedSignature = `${p.apiKey || ''}@@${baseUrl}@@${p.providerType || 'openai'}`;
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

      // Backward compatibility: migrate legacy lineSpacing
      if (parsed.lineSpacing && (!parsed.scriptwriter || !parsed.scriptwriter.lineSpacing)) {
        state.preferences.scriptwriter = state.preferences.scriptwriter || {};
        state.preferences.scriptwriter.lineSpacing = parsed.lineSpacing;
      }
    }
  } catch (e) {}

  // Apply Title Module default language preference if configured
  const titlePrefLang = state.preferences?.titleGenerator?.defaultLanguage;
  if (titlePrefLang && titlePrefLang !== 'last_used' && TITLE_TARGET_LANGUAGES[titlePrefLang]) {
    selectTargetLanguage(titlePrefLang);
  }

  const isAutoRotate = state.preferences?.autoRotateModels !== false;
  if (DOM.chkAutoRotateModal) DOM.chkAutoRotateModal.checked = isAutoRotate;
}

function setAutoRotatePreference(enabled) {
  state.preferences = state.preferences || {};
  state.preferences.autoRotateModels = enabled;
  if (DOM.chkAutoRotateModal) DOM.chkAutoRotateModal.checked = enabled;
  try {
    localStorage.setItem('autocontent_preferences', JSON.stringify(state.preferences));
  } catch (e) {}
}

// ===================================================================
// STUDIO MULTI-MODULE VIEW ROUTER
// ===================================================================
function switchMainView(viewName, settingsTab = 'general') {
  if (state.isGenerating && viewName !== 'script') {
    showToast('Đang tạo kịch bản, vui lòng đợi hoàn tất trước khi chuyển trang!', 'warning');
    return;
  }
  if (state.titleState?.isGenerating && viewName !== 'title') {
    showToast('Đang tạo tiêu đề, vui lòng đợi hoàn tất trước khi chuyển trang!', 'warning');
    return;
  }
  if (state.descriptionState?.isGenerating && viewName !== 'description') {
    showToast('Đang tối ưu mô tả & tags, vui lòng đợi hoàn tất trước khi chuyển trang!', 'warning');
    return;
  }

  // Hide popover if open
  if (DOM.quickApiMenu) DOM.quickApiMenu.classList.add('hidden');
  if (DOM.pillChevron) DOM.pillChevron.classList.remove('rotate');

  // Reset active tabs & views
  [DOM.btnNavScript, DOM.btnNavDescription, DOM.btnNavTitle, DOM.btnNavSettings].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  [DOM.viewScriptwriter, DOM.viewDescriptionGenerator, DOM.viewTitleGenerator, DOM.viewSettings].forEach(view => {
    if (view) view.classList.add('hidden');
  });

  if (viewName === 'script') {
    state.activeWorkspaceView = 'script';
    if (DOM.viewScriptwriter) DOM.viewScriptwriter.classList.remove('hidden');
    if (DOM.btnNavScript) DOM.btnNavScript.classList.add('active');
    if (DOM.headerSubtitleText) DOM.headerSubtitleText.textContent = 'AI Scriptwriter & YouTube Content Studio';
    checkReadiness();
  } else if (viewName === 'description') {
    state.activeWorkspaceView = 'description';
    if (DOM.viewDescriptionGenerator) DOM.viewDescriptionGenerator.classList.remove('hidden');
    if (DOM.btnNavDescription) DOM.btnNavDescription.classList.add('active');
    if (DOM.headerSubtitleText) DOM.headerSubtitleText.textContent = 'AI SEO Description & YouTube Tags Studio (vidIQ Style)';
    checkDescReadiness();
  } else if (viewName === 'title') {
    state.activeWorkspaceView = 'title';
    if (DOM.viewTitleGenerator) DOM.viewTitleGenerator.classList.remove('hidden');
    if (DOM.btnNavTitle) DOM.btnNavTitle.classList.add('active');
    if (DOM.headerSubtitleText) DOM.headerSubtitleText.textContent = 'AI Viral Title Generator & YouTube CTR Studio';
    checkTitleReadiness();
  } else if (viewName === 'settings') {
    if (DOM.viewSettings) DOM.viewSettings.classList.remove('hidden');
    if (DOM.btnNavSettings) DOM.btnNavSettings.classList.add('active');
    if (DOM.headerSubtitleText) DOM.headerSubtitleText.textContent = 'Trung tâm Cài đặt & Cấu hình API';

    // Dynamic back button label according to current active workspace
    let backText = 'Quay lại Kịch bản';
    if (state.activeWorkspaceView === 'description') {
      backText = 'Quay lại Mô tả';
    } else if (state.activeWorkspaceView === 'title') {
      backText = 'Quay lại Tiêu đề';
    }
    if (DOM.btnBackToScriptText) DOM.btnBackToScriptText.textContent = backText;
    if (DOM.btnBackToScript) {
      const workspaceLabel = state.activeWorkspaceView === 'description' ? 'Mô tả' : (state.activeWorkspaceView === 'title' ? 'Tiêu đề' : 'Kịch bản');
      DOM.btnBackToScript.title = `Quay lại bàn làm việc ${workspaceLabel}`;
    }

    switchSettingsTab(settingsTab);
  }
}

function switchSettingsTab(tabName) {
  const tabs = [
    { name: 'general', btn: DOM.tabNavGeneral, panel: DOM.panelSettingsGeneral },
    { name: 'apikeys', btn: DOM.tabNavApiKeys, panel: DOM.panelSettingsApiKeys },
    { name: 'updates', btn: DOM.tabNavUpdates, panel: DOM.panelSettingsUpdates }
  ];

  tabs.forEach(t => {
    if (t.name === tabName) {
      if (t.btn) t.btn.classList.add('active');
      if (t.panel) t.panel.classList.remove('hidden');
    } else {
      if (t.btn) t.btn.classList.remove('active');
      if (t.panel) t.panel.classList.add('hidden');
    }
  });

  if (tabName === 'apikeys') {
    if (!state.currentEditingProviderId) {
      state.currentEditingProviderId = state.settings.activeProviderId || (state.settings.providers[0] && state.settings.providers[0].id);
    }
    renderProviderTabs();
    loadEditingProviderIntoModal();
  } else if (tabName === 'general') {
    // 1. Scriptwriter Module settings
    const currentSpacing = (state.preferences?.scriptwriter?.lineSpacing) || state.preferences?.lineSpacing || 'tight';
    if (currentSpacing === 'normal') {
      if (DOM.optSpacingNormal) DOM.optSpacingNormal.checked = true;
      if (DOM.cardSpacingNormal) DOM.cardSpacingNormal.classList.add('active');
      if (DOM.cardSpacingTight) DOM.cardSpacingTight.classList.remove('active');
    } else {
      if (DOM.optSpacingTight) DOM.optSpacingTight.checked = true;
      if (DOM.cardSpacingTight) DOM.cardSpacingTight.classList.add('active');
      if (DOM.cardSpacingNormal) DOM.cardSpacingNormal.classList.remove('active');
    }

    // 2. Title Generator Module settings
    const titleDefaultLang = state.preferences?.titleGenerator?.defaultLanguage || 'last_used';
    if (DOM.selTitleDefaultLang) {
      DOM.selTitleDefaultLang.value = titleDefaultLang;
    }

    // 3. System Preferences
    const autoCheckUpdate = state.preferences?.system?.autoCheckUpdate !== false;
    if (DOM.chkAutoCheckUpdateStartup) {
      DOM.chkAutoCheckUpdateStartup.checked = autoCheckUpdate;
    }
  }
}

// Bind all UI Event Listeners
function bindEvents() {
  // Studio Sidebar & Multi-Module Routing
  if (DOM.btnNavScript) {
    DOM.btnNavScript.addEventListener('click', () => switchMainView('script'));
  }
  if (DOM.btnNavDescription) {
    DOM.btnNavDescription.addEventListener('click', () => switchMainView('description'));
  }
  if (DOM.btnNavTitle) {
    DOM.btnNavTitle.addEventListener('click', () => switchMainView('title'));
  }
  if (DOM.btnNavSettings) {
    DOM.btnNavSettings.addEventListener('click', () => switchMainView('settings', 'general'));
  }
  if (DOM.btnBackToScript) {
    DOM.btnBackToScript.addEventListener('click', () => switchMainView(state.activeWorkspaceView || 'script'));
  }

  // Module: Description & vidIQ Tags Generator Event Bindings
  if (DOM.inputDescTitle) {
    DOM.inputDescTitle.addEventListener('input', updateDescInputCounts);
  }
  if (DOM.inputDescContent) {
    DOM.inputDescContent.addEventListener('input', updateDescInputCounts);
  }
  if (DOM.btnSampleDesc) {
    DOM.btnSampleDesc.addEventListener('click', loadSampleDescription);
  }
  if (DOM.btnClearDesc) {
    DOM.btnClearDesc.addEventListener('click', clearAllDescInputs);
  }
  if (DOM.btnPasteDescTitle) {
    DOM.btnPasteDescTitle.addEventListener('click', pasteDescTitle);
  }
  if (DOM.btnClearDescTitle) {
    DOM.btnClearDescTitle.addEventListener('click', clearDescTitle);
  }
  if (DOM.btnPasteDescContent) {
    DOM.btnPasteDescContent.addEventListener('click', pasteDescContent);
  }
  if (DOM.btnClearDescContent) {
    DOM.btnClearDescContent.addEventListener('click', clearDescContent);
  }
  if (DOM.btnModePlain) {
    DOM.btnModePlain.addEventListener('click', () => setDescMode('plain'));
  }
  if (DOM.btnModeSrt) {
    DOM.btnModeSrt.addEventListener('click', () => setDescMode('srt'));
  }
  if (DOM.descLangGrid) {
    const descPills = DOM.descLangGrid.querySelectorAll('.desc-lang-pill');
    descPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lang = pill.getAttribute('data-lang');
        if (lang) selectDescTargetLanguage(lang, false);
      });
    });
  }
  if (DOM.btnGenerateDesc) {
    DOM.btnGenerateDesc.addEventListener('click', () => {
      if (state.descriptionState.isGenerating) {
        stopDescriptionGeneration();
      } else {
        startDescriptionGeneration();
      }
    });
  }
  if (DOM.btnCopyDescOnly) {
    DOM.btnCopyDescOnly.addEventListener('click', copyDescriptionOnly);
  }
  if (DOM.btnCopyTagsOnly) {
    DOM.btnCopyTagsOnly.addEventListener('click', copyTagsOnly);
  }
  if (DOM.btnCopyAllDescAndTags) {
    DOM.btnCopyAllDescAndTags.addEventListener('click', copyAllDescAndTags);
  }
  if (DOM.btnRegenerateDesc) {
    DOM.btnRegenerateDesc.addEventListener('click', () => {
      if (!state.descriptionState.isGenerating) {
        startDescriptionGeneration();
      }
    });
  }
  if (DOM.btnAddCustomTag) {
    DOM.btnAddCustomTag.addEventListener('click', addCustomTagFromInput);
  }
  if (DOM.inputAddCustomTag) {
    DOM.inputAddCustomTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTagFromInput();
      }
    });
  }
  if (DOM.descOutputText) {
    DOM.descOutputText.addEventListener('input', updateDescOutputCharCount);
  }

  // Module 2: Title Generator Event Bindings
  if (DOM.inputOriginalTitle) {
    DOM.inputOriginalTitle.addEventListener('input', updateTitleInputCounts);
  }
  if (DOM.btnSampleTitle) {
    DOM.btnSampleTitle.addEventListener('click', loadSampleTitle);
  }
  if (DOM.btnPasteTitle) {
    DOM.btnPasteTitle.addEventListener('click', pasteTitleInput);
  }
  if (DOM.btnClearTitle) {
    DOM.btnClearTitle.addEventListener('click', clearTitleInput);
  }
  if (DOM.titleLangGrid) {
    const langPills = DOM.titleLangGrid.querySelectorAll('.title-lang-pill');
    langPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lang = pill.getAttribute('data-lang');
        if (lang) selectTitleTargetLanguage(lang);
      });
    });
  }
  if (DOM.btnGenerateTitles) {
    DOM.btnGenerateTitles.addEventListener('click', () => {
      if (state.titleState.isGenerating) {
        stopTitleGeneration();
      } else {
        startTitleGeneration();
      }
    });
  }
  if (DOM.btnCopyAllTitles) {
    DOM.btnCopyAllTitles.addEventListener('click', copyAllTitlesToClipboard);
  }
  if (DOM.btnRegenerateTitles) {
    DOM.btnRegenerateTitles.addEventListener('click', () => {
      if (!state.titleState.isGenerating) {
        startTitleGeneration();
      }
    });
  }

  // Settings Tabs Navigation
  if (DOM.tabNavGeneral) {
    DOM.tabNavGeneral.addEventListener('click', () => switchSettingsTab('general'));
  }
  if (DOM.tabNavApiKeys) {
    DOM.tabNavApiKeys.addEventListener('click', () => switchSettingsTab('apikeys'));
  }
  if (DOM.tabNavUpdates) {
    DOM.tabNavUpdates.addEventListener('click', () => switchSettingsTab('updates'));
  }

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

  if (DOM.chkAutoRotateModal) {
    DOM.chkAutoRotateModal.addEventListener('change', () => {
      setAutoRotatePreference(DOM.chkAutoRotateModal.checked);
    });
  }

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

  // Connection Type Switchers (Cách 1 vs Cách 2)
  if (DOM.cardTypeOpenAI) {
    DOM.cardTypeOpenAI.addEventListener('click', (e) => {
      e.preventDefault();
      if (DOM.cardTypeOpenAI.classList.contains('disabled')) return;
      const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
      if (provider) provider.providerType = 'openai';
      setProviderType('openai', true);
    });
  }
  if (DOM.cardTypeGemini) {
    DOM.cardTypeGemini.addEventListener('click', (e) => {
      e.preventDefault();
      if (DOM.cardTypeGemini.classList.contains('disabled')) return;
      const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
      if (provider) provider.providerType = 'gemini';
      setProviderType('gemini', true);
    });
  }
  if (DOM.linkGetGeminiKey) {
    DOM.linkGetGeminiKey.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.api && window.api.openExternal) {
        window.api.openExternal('https://aistudio.google.com/apikey');
      } else {
        window.open('https://aistudio.google.com/apikey', '_blank');
      }
    });
  }

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

  // API Key input live listener (Auto-detects Gemini key, clears error, marks unverified on key edit)
  DOM.cfgApiKey.addEventListener('input', () => {
    DOM.cfgApiKey.classList.remove('input-error');
    const keyVal = DOM.cfgApiKey.value.trim();

    // Smart auto-detection: If key starts with AIzaSy (Google Gemini), auto-switch to Cách 2!
    if (keyVal.startsWith('AIzaSy') && DOM.radioTypeOpenAI && DOM.radioTypeOpenAI.checked) {
      setProviderType('gemini', true);
      showToast('✨ Đã tự động nhận diện khóa Google Gemini!', 'info');
    }

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

  // Update System Controls
  if (DOM.btnCheckUpdateManual) {
    DOM.btnCheckUpdateManual.addEventListener('click', triggerManualUpdateCheck);
  }
  if (DOM.btnPostponeUpdate) {
    DOM.btnPostponeUpdate.addEventListener('click', postponeUpdate);
  }
  if (DOM.btnCloseUpdateModal) {
    DOM.btnCloseUpdateModal.addEventListener('click', postponeUpdate);
  }
  if (DOM.btnAcceptUpdate) {
    DOM.btnAcceptUpdate.addEventListener('click', acceptUpdate);
  }

  // Click toast to dismiss instantly
  if (DOM.toast) {
    DOM.toast.addEventListener('click', dismissToast);
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
    if (DOM.sidebarStatusDot) {
      DOM.sidebarStatusDot.className = 'status-indicator-dot offline';
      DOM.sidebarStatusDot.title = 'Chưa cấu hình API Key';
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
    if (DOM.sidebarStatusDot) {
      DOM.sidebarStatusDot.className = DOM.headerStatusDot.className;
      DOM.sidebarStatusDot.title = DOM.headerStatusDot.title;
    }
  }

  checkTitleReadiness();
  checkDescReadiness();
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

  const isGemini = (provider.providerType === 'gemini')
    || (provider.apiKey && provider.apiKey.trim().startsWith('AIzaSy'))
    || (provider.baseUrl && provider.baseUrl.includes('googleapis.com'));

  // Collect candidate models for failover/rotation
  let candidateModels = [];
  if (provider.models && provider.models.length > 0) {
    candidateModels = provider.models.map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean);
  } else if (isGemini) {
    candidateModels = GEMINI_DEFAULT_MODELS.map(m => m.id);
  }

  const initialModelId = state.settings.activeModelId || candidateModels[0];
  if (!initialModelId && candidateModels.length === 0) {
    showToast('Chưa chọn model AI nào!', 'warning');
    openSettingsModal(provider.id);
    return;
  }

  // Order candidate models starting from the selected model, followed by the rest
  if (candidateModels.length > 1 && initialModelId) {
    const idx = candidateModels.indexOf(initialModelId);
    if (idx > 0) {
      candidateModels = [...candidateModels.slice(idx), ...candidateModels.slice(0, idx)];
    }
  } else if (candidateModels.length === 0) {
    candidateModels = [initialModelId];
  }

  // Smart Failover ONLY applies to Google Gemini (Cách 2)
  const isAutoRotateEnabled = isGemini 
    && (DOM.chkAutoRotateModal ? DOM.chkAutoRotateModal.checked : true)
    && (state.preferences?.autoRotateModels !== false);

  if (!isAutoRotateEnabled) {
    // Rotation disabled OR not Google Gemini: strictly stick to the single selected model!
    candidateModels = [initialModelId];
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
  updateOutputStats();

  state.abortController = new AbortController();

  try {
    const baseUrl = resolveBaseUrl(provider);
    const endpoint = `${baseUrl}/chat/completions`;

    let lastError = null;
    let generationSucceeded = false;

    // Failover Loop: Try candidate models from highest priority down
    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];
      if (state.abortController?.signal?.aborted) break;

      // Sync active model state & UI
      state.settings.activeModelId = currentModel;
      updateHeaderActiveModel();

      if (mIdx > 0) {
        DOM.outputStatusText.textContent = `Đang chuyển sang ${currentModel}...`;
        showToast(`🔄 Model trước hết token/bận, tự động chuyển sang ${currentModel}...`, 'info');
      } else {
        DOM.outputStatusText.textContent = `Đang kết nối API (${currentModel})...`;
      }

      const payload = {
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        stream: true
      };

      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify(payload),
          signal: state.abortController.signal
        });
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') throw fetchErr;
        lastError = fetchErr;
        if (mIdx < candidateModels.length - 1) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw fetchErr;
      }

      if (!response.ok) {
        let errDetails = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.error && errJson.error.message) {
            errDetails = errJson.error.message;
          }
        } catch (e) {}

        // If unauthorized, stop immediately (wrong API Key won't be fixed by changing model)
        if (response.status === 401 || (response.status === 403 && !errDetails.toLowerCase().includes('quota'))) {
          throw new Error(`API Key không hợp lệ hoặc bị từ chối (${errDetails}).`);
        }

        // Recoverable failover errors: 429 (Rate Limit / Quota), 502/503/504 (Overload), 404 (Model unavail)
        const isRecoverable = (response.status === 429 || response.status === 503 || response.status === 502 || response.status === 504 || response.status === 404)
          || /quota|rate.?limit|resource_exhausted|overloaded|capacity|tokens|exhausted/i.test(errDetails);

        if (isRecoverable && mIdx < candidateModels.length - 1) {
          console.warn(`Model ${currentModel} gặp lỗi (${errDetails}), xoay vòng sang model tiếp theo...`);
          lastError = new Error(`Model ${currentModel}: ${errDetails}`);
          await new Promise(r => setTimeout(r, 400));
          continue; // Try next model in sequence
        } else {
          if (mIdx > 0 && isRecoverable) {
            throw new Error(`Toàn bộ danh sách ${candidateModels.length} model trong API Key này đều đã hết hạn ngạch token (${errDetails}).`);
          }
          throw new Error(errDetails);
        }
      }

      DOM.outputStatusText.textContent = `Đang viết kịch bản (${currentModel})...`;

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

      // Flush any pending frame to guarantee 100% of generated content is rendered
      flushStreamRender();
      generationSucceeded = true;
      break; // Successfully generated! Exit loop
    }

    if (!generationSucceeded && lastError) {
      throw lastError;
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
    flushStreamRender();
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

// ===================================================================
// HIGH-PERFORMANCE STREAM BUFFERING & RAF THROTTLING (60/120 FPS)
// ===================================================================
let streamRafId = null;

function scheduleStreamRender() {
  if (streamRafId) return;
  streamRafId = requestAnimationFrame(() => {
    streamRafId = null;
    DOM.scriptContent.innerHTML = formatCleanScript(state.rawOutputScript);
    DOM.outputContainer.scrollTop = DOM.outputContainer.scrollHeight;
    updateOutputStats();
  });
}

function flushStreamRender() {
  if (streamRafId) {
    cancelAnimationFrame(streamRafId);
    streamRafId = null;
  }
  DOM.scriptContent.innerHTML = formatCleanScript(state.rawOutputScript);
  DOM.outputContainer.scrollTop = DOM.outputContainer.scrollHeight;
  updateOutputStats();
}

// Append streaming text to output and schedule silky-smooth render
function appendOutputChunk(chunk) {
  state.rawOutputScript += chunk;
  scheduleStreamRender();
}

function updateOutputStats() {
  const text = state.rawOutputScript || '';
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  state.stats.chars = chars;
  state.stats.words = words;

  // Average reading speed: ~160 words per minute (YouTube standard voiceover)
  const totalSeconds = Math.round((words / 160) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const targetCountEl = DOM.outCharCount || DOM.outWordCount;
  if (targetCountEl) {
    targetCountEl.textContent = chars.toLocaleString();
  }

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
  flushStreamRender();
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

  switchMainView('settings', 'apikeys');
  updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút bên phải để kiểm tra API Key và máy chủ trước khi lưu.');
}

function closeSettingsModal() {
  switchMainView('script');
}

function renderProviderTabs() {
  DOM.providerTabs.innerHTML = '';

  state.settings.providers.forEach(p => {
    const isOnline = !!(p.apiKey && (p.isVerified || state.connectionVerified?.[p.id]));
    const isGemini = (p.providerType === 'gemini') || (p.apiKey && p.apiKey.startsWith('AIzaSy'));
    const typeLabel = isGemini ? 'Cách 2' : 'Cách 1';
    const btn = document.createElement('button');
    btn.className = `provider-tab-pill ${p.id === state.currentEditingProviderId ? 'active' : ''}`;
    btn.type = 'button';
    btn.innerHTML = `
      <span class="tab-status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Đang hoạt động' : 'Chưa kết nối / Lỗi'}"></span>
      <span class="tab-name">${escapeHtml(p.displayName || '(Chưa đặt tên)')}</span>
      <span class="tab-type-tag ${isGemini ? 'gemini' : 'openai'}">${typeLabel}</span>
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

function setProviderType(type, autoFillDefaults = false) {
  const isGemini = (type === 'gemini');
  if (DOM.radioTypeGemini) DOM.radioTypeGemini.checked = isGemini;
  if (DOM.radioTypeOpenAI) DOM.radioTypeOpenAI.checked = !isGemini;

  if (DOM.cardTypeGemini) DOM.cardTypeGemini.classList.toggle('active', isGemini);
  if (DOM.cardTypeOpenAI) DOM.cardTypeOpenAI.classList.toggle('active', !isGemini);

  if (DOM.groupBaseUrl) DOM.groupBaseUrl.classList.toggle('hidden', isGemini);
  if (DOM.geminiAutoNotice) DOM.geminiAutoNotice.classList.toggle('hidden', !isGemini);
  if (DOM.linkGetGeminiKey) DOM.linkGetGeminiKey.classList.toggle('hidden', !isGemini);
  if (DOM.failoverSettingBox) DOM.failoverSettingBox.classList.toggle('hidden', !isGemini);

  if (isGemini) {
    DOM.cfgApiKey.placeholder = 'Dán API Key (Google Gemini, OpenAI, Groq, OpenRouter...)';
    if (DOM.tooltipApiKey) DOM.tooltipApiKey.title = 'Khóa API độc lập, không yêu cầu Base URL';
    if (autoFillDefaults) {
      if (!DOM.cfgDisplayName.value || DOM.cfgDisplayName.value.startsWith('API Provider') || DOM.cfgDisplayName.value.startsWith('Vilao')) {
        DOM.cfgDisplayName.value = 'Google Gemini';
        DOM.modalProviderTitle.textContent = 'Google Gemini';
      }
      DOM.cfgBaseUrl.value = '';
      // Fill Gemini default models if switching to Cách 2
      renderModelsCatalog(GEMINI_DEFAULT_MODELS);
    }
  } else {
    DOM.cfgApiKey.placeholder = 'sk-... hoặc API Key của nhà cung cấp';
    if (DOM.tooltipApiKey) DOM.tooltipApiKey.title = 'Khóa API từ nhà cung cấp (Vilao, DeepSeek, OpenRouter...)';
    if (autoFillDefaults) {
      if (!DOM.cfgDisplayName.value || DOM.cfgDisplayName.value === 'Google Gemini') {
        DOM.cfgDisplayName.value = '';
        DOM.modalProviderTitle.textContent = 'Cấu hình API';
      }
      // If switching back to Cách 1 and current models are Gemini, clear them to prevent mixing!
      const currentModels = collectModelsFromUI();
      if (currentModels.some(m => m.id && m.id.includes('gemini'))) {
        renderModelsCatalog([]);
      }
    }
  }
}

function loadEditingProviderIntoModal() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  const isGemini = (provider.providerType === 'gemini')
    || (provider.apiKey && provider.apiKey.trim().startsWith('AIzaSy'))
    || (provider.baseUrl && provider.baseUrl.includes('googleapis.com'));

  setProviderType(isGemini ? 'gemini' : 'openai', false);

  // DISABLE the other method if this is already an existing/saved provider!
  const isExistingProvider = !provider.isNew;
  if (isExistingProvider) {
    if (isGemini) {
      if (DOM.cardTypeGemini) DOM.cardTypeGemini.classList.remove('disabled');
      if (DOM.cardTypeOpenAI) DOM.cardTypeOpenAI.classList.add('disabled');
    } else {
      if (DOM.cardTypeOpenAI) DOM.cardTypeOpenAI.classList.remove('disabled');
      if (DOM.cardTypeGemini) DOM.cardTypeGemini.classList.add('disabled');
    }
  } else {
    // Brand new provider: Both cards enabled so user can freely choose!
    if (DOM.cardTypeOpenAI) DOM.cardTypeOpenAI.classList.remove('disabled');
    if (DOM.cardTypeGemini) DOM.cardTypeGemini.classList.remove('disabled');
  }

  DOM.modalProviderTitle.textContent = provider.displayName || (isGemini ? 'Google Gemini' : 'Cấu hình API');
  DOM.cfgApiKey.value = provider.apiKey || '';
  DOM.cfgDisplayName.value = provider.displayName || '';
  DOM.cfgBaseUrl.value = (isGemini && (!provider.baseUrl || provider.baseUrl === GEMINI_BASE_URL)) ? '' : (provider.baseUrl || '');
  DOM.cfgProtocol.value = provider.apiProtocol || 'OpenAI Chat Completions';

  DOM.cfgApiKey.classList.remove('input-error');

  const isOnline = !!(provider.apiKey && (provider.isVerified || state.connectionVerified?.[provider.id]));
  if (isOnline && !provider.verifiedSignature) {
    const rawBaseUrl = (DOM.cfgBaseUrl.value || provider.baseUrl || '').trim();
    const resolvedUrl = resolveBaseUrl({ ...provider, baseUrl: rawBaseUrl });
    provider.verifiedSignature = `${provider.apiKey}@@${resolvedUrl}@@${provider.providerType || (isGemini ? 'gemini' : 'openai')}`;
  }
  if (DOM.modalHeaderStatusDot) {
    DOM.modalHeaderStatusDot.className = `status-indicator-dot ${isOnline ? 'online' : 'offline'}`;
    DOM.modalHeaderStatusDot.title = isOnline ? 'Đã xác thực kết nối máy chủ (Online)' : 'Chưa kết nối hoặc Key không hợp lệ (Offline)';
  }

  if (isOnline) {
    updateTestConnectionCard('success', '✓ Kết nối thành công!', 'API Key và máy chủ hoạt động tốt.');
  } else {
    updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút "Kiểm tra kết nối" hoặc bấm "Apply" để tự động kiểm tra trước khi lưu.');
  }

  // Render Models list (strictly isolated: if Gemini, load Gemini models; if OpenAI, keep OpenAI models)
  let modelsToRender = provider.models || [];
  if (isGemini && (modelsToRender.length === 0 || modelsToRender.some(m => m.id === 'gemini-2.0-flash' || m.id === 'gemini-1.5-flash'))) {
    modelsToRender = [...GEMINI_DEFAULT_MODELS];
    provider.models = modelsToRender;
  }
  renderModelsCatalog(modelsToRender);
}

function saveModalInputsIntoEditingProvider() {
  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  const isGemini = DOM.radioTypeGemini && DOM.radioTypeGemini.checked;
  provider.providerType = isGemini ? 'gemini' : 'openai';
  provider.apiKey = DOM.cfgApiKey.value.trim();
  provider.displayName = DOM.cfgDisplayName.value.trim() || (isGemini ? 'Google Gemini' : 'API Provider');
  
  if (isGemini) {
    provider.baseUrl = resolveBaseUrl({ ...provider, apiKey: provider.apiKey });
  } else {
    provider.baseUrl = DOM.cfgBaseUrl.value.trim();
  }

  provider.apiProtocol = DOM.cfgProtocol.value;
  let models = collectModelsFromUI();
  if (isGemini && models.length === 0) {
    models = [...GEMINI_DEFAULT_MODELS];
  }
  provider.models = models;
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
  const baseUrl = resolveBaseUrl(providerData);

  if (!apiKey) {
    return { success: false, error: 'Chưa nhập API Key. Vui lòng dán API Key trước khi kiểm tra.' };
  }
  if (!baseUrl) {
    return { success: false, error: 'Chưa nhập Base URL máy chủ API.' };
  }

  try {
    if (window.api && window.api.testConnection) {
      return await window.api.testConnection({ ...providerData, apiKey, baseUrl });
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

  const isGemini = (provider.providerType === 'gemini') || (DOM.radioTypeGemini && DOM.radioTypeGemini.checked);
  const apiKey = (DOM.cfgApiKey.value || '').trim();
  const rawBaseUrl = (DOM.cfgBaseUrl.value || '').trim();
  const baseUrl = resolveBaseUrl({ ...provider, apiKey, baseUrl: rawBaseUrl });
  provider.baseUrl = baseUrl;

  if (!apiKey) {
    DOM.cfgApiKey.classList.add('input-error');
    updateTestConnectionCard('error', 'Chưa nhập API Key', 'Vui lòng dán API Key thật của bạn vào ô phía trên trước khi kiểm tra.');
    showToast('Vui lòng nhập API Key trước!', 'warning');
    DOM.cfgApiKey.focus();
    return;
  }

  if (!isGemini && !rawBaseUrl) {
    DOM.cfgBaseUrl.classList.add('input-error');
    updateTestConnectionCard('error', 'Chưa nhập Base URL', 'Cách 1 yêu cầu nhập Base URL máy chủ API (Ví dụ: https://api.vilao.ai/v1).');
    showToast('Vui lòng nhập Base URL trước!', 'warning');
    DOM.cfgBaseUrl.focus();
    return;
  }

  DOM.cfgApiKey.classList.remove('input-error');
  DOM.cfgBaseUrl.classList.remove('input-error');

  const serverName = isGemini 
    ? (apiKey.startsWith('AIzaSy') ? 'Google Gemini' : (apiKey.startsWith('gsk_') ? 'Groq' : (apiKey.startsWith('sk-or-') ? 'OpenRouter' : 'máy chủ API')))
    : (rawBaseUrl || 'máy chủ API');

  updateTestConnectionCard('loading', 'Đang kiểm tra kết nối...', `Đang gửi yêu cầu xác thực tới ${serverName}...`);
  DOM.btnTestConnection.disabled = true;

  try {
    const res = await performTestConnection({ ...provider, apiKey, baseUrl });

    if (res && res.success) {
      state.connectionVerified = state.connectionVerified || {};
      state.connectionVerified[provider.id] = true;
      provider.isVerified = true;
      provider.verifiedSignature = `${apiKey}@@${baseUrl}@@${provider.providerType}`;
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

  const isGemini = (provider.providerType === 'gemini') || (DOM.radioTypeGemini && DOM.radioTypeGemini.checked);
  provider.baseUrl = resolveBaseUrl(provider);
  const displayUrl = isGemini ? 'Google Gemini' : provider.baseUrl;

  updateTestConnectionCard('loading', 'Đang tải danh sách models...', `Đang gọi /models từ ${displayUrl}...`);
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

  const isGemini = (provider.providerType === 'gemini') || (DOM.radioTypeGemini && DOM.radioTypeGemini.checked);
  provider.models = isGemini ? [...GEMINI_DEFAULT_MODELS] : [];
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
        showToast(`Đã chuyển sang ${prov.displayName || prov.id} (${model.name || model.id})`, 'success', 1500);
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
async function addNewProvider(type = 'openai') {
  const isGemini = (type === 'gemini');
  const newProv = {
    id: 'provider_' + Date.now(),
    isNew: true, // Brand new unsaved provider
    providerType: isGemini ? 'gemini' : 'openai',
    displayName: '',
    apiKey: '',
    baseUrl: isGemini ? GEMINI_BASE_URL : '',
    apiProtocol: 'OpenAI Chat Completions',
    models: isGemini ? [...GEMINI_DEFAULT_MODELS] : []
  };

  state.settings.providers.push(newProv);
  state.currentEditingProviderId = newProv.id;

  renderProviderTabs();
  loadEditingProviderIntoModal();
  updateTestConnectionCard('default', 'Trạng thái kết nối API', 'Bấm nút bên phải để kiểm tra API Key và máy chủ trước khi lưu.');
  switchMainView('settings', 'apikeys');

  DOM.cfgApiKey.focus();
  showToast('Đã tạo API mới. Bạn có thể chọn Cách 1 hoặc Cách 2 rồi dán API Key!', 'info');
}

// Save & Apply Settings (Auto-validates connection with real server before saving)
async function saveAndApplySettings() {
  saveModalInputsIntoEditingProvider();

  const provider = state.settings.providers.find(p => p.id === state.currentEditingProviderId);
  if (!provider) return;

  const isGemini = (provider.providerType === 'gemini') || (DOM.radioTypeGemini && DOM.radioTypeGemini.checked);
  const apiKey = (DOM.cfgApiKey.value || '').trim();
  const rawBaseUrl = (DOM.cfgBaseUrl.value || '').trim();
  const baseUrl = resolveBaseUrl({ ...provider, apiKey, baseUrl: rawBaseUrl });
  provider.baseUrl = baseUrl;

  // Validate API Key presence
  if (!apiKey) {
    DOM.cfgApiKey.classList.add('input-error');
    DOM.cfgApiKey.focus();
    updateTestConnectionCard('error', 'Chưa nhập API Key', 'Vui lòng dán API Key thật của bạn trước khi lưu.');
    showToast('Vui lòng nhập API Key trước khi lưu!', 'warning');
    return;
  }

  // Validate Base URL presence (only required for Cách 1 / non-Gemini)
  if (!isGemini && !rawBaseUrl) {
    DOM.cfgBaseUrl.focus();
    updateTestConnectionCard('error', 'Chưa nhập Base URL', 'Vui lòng nhập Base URL máy chủ API.');
    showToast('Vui lòng nhập Base URL trước khi lưu!', 'warning');
    return;
  }

  // Calculate current configuration signature to check if verification is still valid
  const currentSignature = `${apiKey}@@${baseUrl}@@${provider.providerType}`;
  const isAlreadyVerified = (provider.isVerified || state.connectionVerified?.[provider.id]) 
    && (provider.verifiedSignature === currentSignature);

  // If already verified with this exact key & base URL, skip network test and save instantly!
  if (isAlreadyVerified) {
    delete provider.isNew;
    provider.isVerified = true;
    state.connectionVerified = state.connectionVerified || {};
    state.connectionVerified[provider.id] = true;
    provider.verifiedSignature = currentSignature;

    state.settings.activeProviderId = state.currentEditingProviderId;
    if (provider.models && provider.models.length > 0) {
      if (!provider.models.some(m => m.id === state.settings.activeModelId)) {
        state.settings.activeModelId = provider.models[0].id;
      }
    }

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

    renderProviderTabs();
    updateHeaderActiveModel();
    closeSettingsModal();
    checkReadiness();
    showToast('✓ Đã lưu cấu hình API thành công!', 'success');
    return;
  }

  // Otherwise (new key or changed URL): Automatic connection verification before saving
  DOM.btnApplySettings.disabled = true;
  const originalApplyText = DOM.btnApplySettings.textContent;
  DOM.btnApplySettings.innerHTML = '<span class="spinner-sm" style="display:inline-block;width:13px;height:13px;margin-right:6px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:-2px;"></span> Đang kiểm tra...';
  
  const serverName = isGemini 
    ? (apiKey.startsWith('AIzaSy') ? 'Google Gemini' : (apiKey.startsWith('gsk_') ? 'Groq' : (apiKey.startsWith('sk-or-') ? 'OpenRouter' : 'máy chủ API')))
    : (rawBaseUrl || 'máy chủ API');

  updateTestConnectionCard('loading', 'Đang kiểm tra kết nối...', `Đang xác thực API Key với ${serverName}...`);

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

  // Verification SUCCEEDED -> Lock in provider type permanently
  delete provider.isNew;
  state.connectionVerified = state.connectionVerified || {};
  state.connectionVerified[provider.id] = true;
  provider.isVerified = true;
  provider.verifiedSignature = currentSignature;

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
  switchMainView('settings', 'general');
}

function closeGeneralSettingsModal() {
  switchMainView(state.activeWorkspaceView || 'script');
}

function saveGeneralSettings() {
  const isTight = DOM.optSpacingTight ? DOM.optSpacingTight.checked : true;
  const newSpacing = isTight ? 'tight' : 'normal';

  // Modular scoped state preferences
  state.preferences = state.preferences || {};

  // 1. Scriptwriter Module
  state.preferences.scriptwriter = state.preferences.scriptwriter || {};
  state.preferences.scriptwriter.lineSpacing = newSpacing;
  state.preferences.lineSpacing = newSpacing; // Legacy alias for backward compatibility

  // 2. Title Generator Module
  state.preferences.titleGenerator = state.preferences.titleGenerator || {};
  if (DOM.selTitleDefaultLang) {
    state.preferences.titleGenerator.defaultLanguage = DOM.selTitleDefaultLang.value;
    if (DOM.selTitleDefaultLang.value !== 'last_used' && TITLE_TARGET_LANGUAGES[DOM.selTitleDefaultLang.value]) {
      selectTargetLanguage(DOM.selTitleDefaultLang.value);
    }
  }

  // 3. System Preferences
  state.preferences.system = state.preferences.system || {};
  if (DOM.chkAutoCheckUpdateStartup) {
    state.preferences.system.autoCheckUpdate = DOM.chkAutoCheckUpdateStartup.checked;
  }

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
  showToast('✓ Đã lưu cấu hình các mô-đun thành công!', 'success');
}

// ===================================================================
// SYSTEM UPDATE MANAGEMENT (NON-INTRUSIVE & USER-OPTIONAL)
// ===================================================================
async function initUpdateSystem() {
  try {
    if (window.api && window.api.getAppVersion) {
      const ver = await window.api.getAppVersion();
      if (ver && DOM.currentAppVersionDisplay) {
        DOM.currentAppVersionDisplay.textContent = `v${ver}`;
      }
    }

    if (window.api && window.api.onUpdateAvailable) {
      window.api.onUpdateAvailable((updateData) => {
        handleUpdateDetected(updateData, false);
      });
    }
  } catch (err) {
    console.warn('Could not initialize update system:', err);
  }
}

function handleUpdateDetected(updateData, isManual = false) {
  if (!updateData || !updateData.hasUpdate) return;
  if (!isManual && state.preferences?.system?.autoCheckUpdate === false) return;
  state.pendingUpdate = updateData;

  if (DOM.currentAppVersionDisplay) {
    DOM.currentAppVersionDisplay.textContent = updateData.currentVersion || 'v1.1.0';
  }
  if (DOM.appVersionStatusText) {
    DOM.appVersionStatusText.textContent = `Đã có bản cập nhật mới ${updateData.latestVersion}!`;
    DOM.appVersionStatusText.className = 'version-status-text has-update';
  }

  const dismissedKey = 'dismissed_update_' + updateData.latestVersion;
  const isDismissed = sessionStorage.getItem(dismissedKey) === 'true';

  // Always show subtle badge dot on header & sidebar settings button
  if (DOM.headerUpdateBadgeDot) {
    DOM.headerUpdateBadgeDot.classList.remove('hidden');
  }
  if (DOM.sidebarUpdateDot) {
    DOM.sidebarUpdateDot.classList.remove('hidden');
  }
  if (DOM.tabUpdateDot) {
    DOM.tabUpdateDot.classList.remove('hidden');
  }

  // If auto-detected on startup and previously postponed in this session, do NOT pop up
  if (!isManual && isDismissed) {
    return;
  }

  // Show polite update notification modal
  if (DOM.updateNewVersionBadge) {
    DOM.updateNewVersionBadge.textContent = updateData.latestVersion;
  }
  if (DOM.updateCurrentVersionNote) {
    DOM.updateCurrentVersionNote.textContent = `Phiên bản bạn đang dùng: ${updateData.currentVersion}`;
  }
  if (DOM.updateChangelogContent) {
    DOM.updateChangelogContent.textContent = updateData.releaseNotes || 'Phiên bản cải tiến hiệu năng và độ ổn định hệ thống.';
  }

  if (DOM.updateNotificationModal) {
    DOM.updateNotificationModal.classList.remove('hidden');
  }
}

async function triggerManualUpdateCheck() {
  if (!window.api || !window.api.checkForUpdates) {
    showToast('Chức năng chỉ hoạt động trên ứng dụng Desktop.', 'info');
    return;
  }

  DOM.btnCheckUpdateManual.disabled = true;
  if (DOM.iconRefreshUpdate) DOM.iconRefreshUpdate.classList.add('rotating');
  if (DOM.btnCheckUpdateText) DOM.btnCheckUpdateText.textContent = 'Đang kiểm tra...';
  if (DOM.appVersionStatusText) {
    DOM.appVersionStatusText.textContent = 'Đang kết nối GitHub kiểm tra phiên bản mới...';
    DOM.appVersionStatusText.className = 'version-status-text';
  }

  try {
    const res = await window.api.checkForUpdates(true);

    if (res && res.hasUpdate) {
      handleUpdateDetected(res, true);
      showToast(`✓ Tìm thấy bản cập nhật mới ${res.latestVersion}!`, 'success');
    } else {
      if (DOM.appVersionStatusText) {
        DOM.appVersionStatusText.textContent = res?.message || 'Bạn đang sử dụng phiên bản mới nhất!';
        DOM.appVersionStatusText.className = 'version-status-text latest';
      }
      showToast(res?.message || 'Bạn đang sử dụng phiên bản mới nhất!', 'info');
    }
  } catch (err) {
    if (DOM.appVersionStatusText) {
      DOM.appVersionStatusText.textContent = `Lỗi kiểm tra cập nhật: ${err.message}`;
      DOM.appVersionStatusText.className = 'version-status-text';
    }
    showToast(`Không thể kiểm tra cập nhật: ${err.message}`, 'warning');
  } finally {
    DOM.btnCheckUpdateManual.disabled = false;
    if (DOM.iconRefreshUpdate) DOM.iconRefreshUpdate.classList.remove('rotating');
    if (DOM.btnCheckUpdateText) DOM.btnCheckUpdateText.textContent = 'Kiểm tra cập nhật';
  }
}

function postponeUpdate() {
  if (state.pendingUpdate && state.pendingUpdate.latestVersion) {
    sessionStorage.setItem('dismissed_update_' + state.pendingUpdate.latestVersion, 'true');
  }

  if (DOM.updateNotificationModal) {
    DOM.updateNotificationModal.classList.add('hidden');
  }

  // Keep badge dot visible so user knows they can check later
  if (DOM.headerUpdateBadgeDot) {
    DOM.headerUpdateBadgeDot.classList.remove('hidden');
  }

  showToast('Đã tạm hoãn cập nhật. Bạn có thể kiểm tra lại bất kỳ lúc nào trong phần Cài đặt!', 'info');
}

async function acceptUpdate() {
  if (!state.pendingUpdate) return;

  // If running inside Electron desktop and applyHotUpdate is available
  if (window.api && window.api.applyHotUpdate) {
    if (DOM.btnAcceptUpdate) DOM.btnAcceptUpdate.disabled = true;
    if (DOM.btnPostponeUpdate) DOM.btnPostponeUpdate.disabled = true;
    if (DOM.btnAcceptUpdateText) DOM.btnAcceptUpdateText.textContent = 'Đang tải mã nguồn...';
    if (DOM.updateDownloadProgress) {
      DOM.updateDownloadProgress.classList.remove('hidden');
      DOM.updateDownloadProgress.style.color = '#4338CA';
      DOM.updateDownloadProgress.textContent = '⚡ Đang tải mã nguồn siêu nhẹ (625 KB) và cập nhật hệ thống...';
    }

    try {
      const zipUrl = state.pendingUpdate.zipUrl;
      const res = await window.api.applyHotUpdate(zipUrl);
      if (res && res.success) {
        if (DOM.btnAcceptUpdateText) DOM.btnAcceptUpdateText.textContent = '✓ Hoàn tất! Đang khởi động lại...';
        if (DOM.updateDownloadProgress) {
          DOM.updateDownloadProgress.style.color = '#059669';
          DOM.updateDownloadProgress.textContent = '✓ Đã cập nhật thành công! Ứng dụng sẽ tự động mở lại ngay...';
        }
        showToast('Cập nhật thành công! Ứng dụng đang khởi động lại...', 'success');
        return;
      } else {
        throw new Error(res?.error || 'Không thể giải nén hoặc áp dụng gói mã nguồn.');
      }
    } catch (err) {
      console.error('Hot Update Error:', err);
      showToast(`Không thể cập nhật tự động: ${err.message}. Đang mở trang tải bộ cài .exe...`, 'warning');
      if (DOM.btnAcceptUpdate) DOM.btnAcceptUpdate.disabled = false;
      if (DOM.btnPostponeUpdate) DOM.btnPostponeUpdate.disabled = false;
      if (DOM.btnAcceptUpdateText) DOM.btnAcceptUpdateText.textContent = 'Cập nhật siêu tốc (2s)';
      if (DOM.updateDownloadProgress) DOM.updateDownloadProgress.classList.add('hidden');
    }
  }

  // Fallback: Open external download link
  const targetUrl = state.pendingUpdate.downloadUrl || state.pendingUpdate.releaseUrl;
  if (targetUrl && window.api && window.api.openExternal) {
    try {
      await window.api.openExternal(targetUrl);
      showToast('Đang mở trang tải bản cập nhật mới...', 'success');
    } catch (e) {
      window.open(targetUrl, '_blank');
    }
  }

  if (DOM.updateNotificationModal) {
    DOM.updateNotificationModal.classList.add('hidden');
  }
  if (DOM.headerUpdateBadgeDot) {
    DOM.headerUpdateBadgeDot.classList.add('hidden');
  }
}

// ===================================================================
// TOAST NOTIFICATIONS
// ===================================================================
let toastTimeout = null;
function showToast(message, type = 'success', duration = 1500) {
  if (toastTimeout) clearTimeout(toastTimeout);

  DOM.toastMsg.textContent = message;

  DOM.toast.classList.remove('success', 'warning', 'danger', 'info', 'hiding');
  DOM.toast.classList.add(type);

  if (type === 'success') {
    DOM.toastIcon.textContent = '✓';
    DOM.toastIcon.style.background = 'rgba(16, 185, 129, 0.35)';
  } else if (type === 'warning') {
    DOM.toastIcon.textContent = '!';
    DOM.toastIcon.style.background = 'rgba(245, 158, 11, 0.35)';
  } else if (type === 'danger') {
    DOM.toastIcon.textContent = '✕';
    DOM.toastIcon.style.background = 'rgba(239, 68, 68, 0.35)';
  } else {
    DOM.toastIcon.textContent = 'i';
    DOM.toastIcon.style.background = 'rgba(99, 102, 241, 0.35)';
  }

  DOM.toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    dismissToast();
  }, duration);
}

function dismissToast() {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  if (DOM.toast && !DOM.toast.classList.contains('hidden')) {
    DOM.toast.classList.add('hiding');
    setTimeout(() => {
      DOM.toast.classList.add('hidden');
      DOM.toast.classList.remove('hiding');
    }, 200);
  }
}

// ===================================================================
// MODULE 2: VIRAL TITLE AI GENERATOR CONTROLLER
// ===================================================================

function updateTitleInputCounts() {
  const text = (DOM.inputOriginalTitle?.value || '').trim();
  const charCount = text.length;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  if (DOM.titleCharCount) DOM.titleCharCount.textContent = `${charCount} ký tự`;
  if (DOM.titleWordCount) DOM.titleWordCount.textContent = `${wordCount} từ`;

  checkTitleReadiness();
}

function checkTitleReadiness() {
  const provider = state.settings.providers.find(p => p.id === state.settings.activeProviderId);
  const hasProvider = Boolean(provider && provider.apiKey);
  const text = (DOM.inputOriginalTitle?.value || '').trim();

  if (DOM.btnGenerateTitles && !state.titleState.isGenerating) {
    if (!hasProvider) {
      DOM.btnGenerateTitles.disabled = true;
      DOM.btnGenerateTitles.classList.add('disabled');
      DOM.btnGenerateTitles.title = 'Vui lòng cấu hình API Key trong Cài đặt trước!';
    } else {
      DOM.btnGenerateTitles.disabled = false;
      DOM.btnGenerateTitles.classList.remove('disabled');
      DOM.btnGenerateTitles.title = text ? 'Bấm để tạo 10 tiêu đề YouTube viral' : 'Vui lòng nhập tiêu đề gốc';
    }
  }
}

function selectTitleTargetLanguage(langKey) {
  if (state.titleState.isGenerating) return;

  const langObj = TITLE_TARGET_LANGUAGES[langKey];
  if (!langObj) return;

  state.titleState.targetLanguage = langKey;

  // Update pills active state
  if (DOM.titleLangGrid) {
    const pills = DOM.titleLangGrid.querySelectorAll('.title-lang-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-lang') === langKey) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  // Update badge and meta stat bar
  if (DOM.titleSelectedLangBadge) {
    DOM.titleSelectedLangBadge.textContent = `Đang chọn: ${langObj.flag} ${langObj.name}`;
  }
  if (DOM.titleMetaLang) {
    DOM.titleMetaLang.textContent = langObj.name;
  }
}

function loadSampleTitle() {
  if (state.titleState.isGenerating) return;
  const current = (DOM.inputOriginalTitle?.value || '').trim();
  let next = SAMPLE_TITLES[0];
  const idx = SAMPLE_TITLES.indexOf(current);
  if (idx >= 0 && idx < SAMPLE_TITLES.length - 1) {
    next = SAMPLE_TITLES[idx + 1];
  } else if (idx === SAMPLE_TITLES.length - 1) {
    next = SAMPLE_TITLES[0];
  }

  if (DOM.inputOriginalTitle) {
    DOM.inputOriginalTitle.value = next;
    updateTitleInputCounts();
    DOM.inputOriginalTitle.focus();
    showToast('Đã điền tiêu đề mẫu!', 'info', 1000);
  }
}

async function pasteTitleInput() {
  if (state.titleState.isGenerating) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text && DOM.inputOriginalTitle) {
      DOM.inputOriginalTitle.value = text.trim();
      updateTitleInputCounts();
      DOM.inputOriginalTitle.focus();
      showToast('Đã dán tiêu đề từ clipboard!', 'success', 1000);
    } else {
      showToast('Bộ nhớ tạm trống!', 'warning', 1000);
    }
  } catch (err) {
    showToast('Không thể truy cập Clipboard!', 'danger', 1200);
  }
}

function clearTitleInput() {
  if (state.titleState.isGenerating) return;
  if (DOM.inputOriginalTitle) {
    DOM.inputOriginalTitle.value = '';
    updateTitleInputCounts();
    DOM.inputOriginalTitle.focus();
  }
}

function setTitleGeneratingUIState(isGenerating) {
  state.titleState.isGenerating = isGenerating;

  if (DOM.btnGenerateTitles) {
    if (isGenerating) {
      DOM.btnGenerateTitles.classList.add('stop-mode');
      if (DOM.btnGenerateTitlesText) DOM.btnGenerateTitlesText.textContent = 'DỪNG TẠO (STOP)';
    } else {
      DOM.btnGenerateTitles.classList.remove('stop-mode');
      if (DOM.btnGenerateTitlesText) DOM.btnGenerateTitlesText.textContent = 'TẠO 5 TIÊU ĐỀ TINH HOA ĐỘT PHÁ';
    }
  }

  if (DOM.inputOriginalTitle) {
    DOM.inputOriginalTitle.disabled = isGenerating;
  }

  if (DOM.btnSampleTitle) DOM.btnSampleTitle.disabled = isGenerating;
  if (DOM.btnPasteTitle) DOM.btnPasteTitle.disabled = isGenerating;
  if (DOM.btnClearTitle) DOM.btnClearTitle.disabled = isGenerating;

  if (DOM.titleLangGrid) {
    const pills = DOM.titleLangGrid.querySelectorAll('.title-lang-pill');
    pills.forEach(p => {
      p.disabled = isGenerating;
      p.style.pointerEvents = isGenerating ? 'none' : 'auto';
      p.style.opacity = isGenerating ? '0.7' : '1';
    });
  }

  if (isGenerating) {
    if (DOM.titleEmptyState) DOM.titleEmptyState.classList.add('hidden');
    if (DOM.titleResultsList) DOM.titleResultsList.classList.add('hidden');
    if (DOM.titleLoadingState) DOM.titleLoadingState.classList.remove('hidden');
    if (DOM.btnCopyAllTitles) DOM.btnCopyAllTitles.disabled = true;
    if (DOM.btnRegenerateTitles) DOM.btnRegenerateTitles.disabled = true;
    if (DOM.titleStatusText) DOM.titleStatusText.textContent = 'Đang tạo...';
    if (DOM.titleStatusBadge) DOM.titleStatusBadge.className = 'output-status-pill in-progress';
  } else {
    if (DOM.titleLoadingState) DOM.titleLoadingState.classList.add('hidden');
    if (state.titleState.titles && state.titleState.titles.length > 0) {
      if (DOM.titleStatusText) DOM.titleStatusText.textContent = 'Hoàn tất';
      if (DOM.titleStatusBadge) DOM.titleStatusBadge.className = 'output-status-pill completed';
      if (DOM.btnCopyAllTitles) DOM.btnCopyAllTitles.disabled = false;
      if (DOM.btnRegenerateTitles) DOM.btnRegenerateTitles.disabled = false;
    } else {
      if (DOM.titleStatusText) DOM.titleStatusText.textContent = 'Sẵn sàng';
      if (DOM.titleStatusBadge) DOM.titleStatusBadge.className = 'output-status-pill';
    }
    checkTitleReadiness();
  }
}

function stopTitleGeneration() {
  if (state.titleState.abortController) {
    state.titleState.abortController.abort();
    state.titleState.abortController = null;
  }
  setTitleGeneratingUIState(false);
  if (DOM.titleOutputStatusDesc) DOM.titleOutputStatusDesc.textContent = 'Đã dừng tạo tiêu đề.';
  showToast('Đã dừng tạo tiêu đề!', 'warning', 1200);

  if (!state.titleState.titles || state.titleState.titles.length === 0) {
    if (DOM.titleEmptyState) DOM.titleEmptyState.classList.remove('hidden');
  } else {
    if (DOM.titleResultsList) DOM.titleResultsList.classList.remove('hidden');
  }
}

async function startTitleGeneration() {
  const rawInput = (DOM.inputOriginalTitle?.value || '').trim();
  if (!rawInput) {
    showToast('Vui lòng nhập tiêu đề gốc trước khi tạo!', 'warning');
    DOM.inputOriginalTitle?.focus();
    return;
  }

  // Active provider & model
  const provider = state.settings.providers.find(p => p.id === state.settings.activeProviderId);
  if (!provider || !provider.apiKey) {
    showToast(`Vui lòng cấu hình API Key cho ${provider ? provider.displayName : 'hệ thống'}!`, 'warning');
    switchMainView('settings', 'apikeys');
    return;
  }

  const isGemini = (provider.providerType === 'gemini')
    || (provider.apiKey && provider.apiKey.trim().startsWith('AIzaSy'))
    || (provider.baseUrl && provider.baseUrl.includes('googleapis.com'));

  let candidateModels = [];
  if (provider.models && provider.models.length > 0) {
    candidateModels = provider.models.map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean);
  } else if (isGemini) {
    candidateModels = GEMINI_DEFAULT_MODELS.map(m => m.id);
  }

  const initialModelId = state.settings.activeModelId || candidateModels[0];
  if (!initialModelId && candidateModels.length === 0) {
    showToast('Chưa chọn model AI nào!', 'warning');
    switchMainView('settings', 'apikeys');
    return;
  }

  if (candidateModels.length > 1 && initialModelId) {
    const idx = candidateModels.indexOf(initialModelId);
    if (idx > 0) {
      candidateModels = [...candidateModels.slice(idx), ...candidateModels.slice(0, idx)];
    }
  } else if (candidateModels.length === 0) {
    candidateModels = [initialModelId];
  }

  const isAutoRotateEnabled = isGemini 
    && (DOM.chkAutoRotateModal ? DOM.chkAutoRotateModal.checked : true)
    && (state.preferences?.autoRotateModels !== false);

  if (!isAutoRotateEnabled) {
    candidateModels = [initialModelId];
  }

  const targetLangKey = state.titleState.targetLanguage || 'vi';
  const targetLangObj = TITLE_TARGET_LANGUAGES[targetLangKey] || TITLE_TARGET_LANGUAGES.vi;

  const now = new Date();
  const dateStr = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const systemPrompt = `Bạn là Chuyên gia hàng đầu thế giới về Tối ưu hóa Tiêu đề YouTube (YouTube Title Strategist & CTR Master) với hơn 10 năm kinh nghiệm nghiên cứu thuật toán đề xuất và tâm lý học người xem YouTube (YouTube Viewer Psychology).
NGỮ CẢNH THỜI GIAN THỰC HIỆN TẠI: ${dateStr}.

Nhiệm vụ của bạn: Từ tiêu đề gốc duy nhất do người dùng cung cấp, hãy đào sâu bóc tách khoảng trống tò mò (Curiosity Gap) và tâm lý người xem ở thời điểm hiện tại (${dateStr}) để sáng tạo đúng 5 TIÊU ĐỀ YOUTUBE TINH HOA ĐỘT PHÁ NHẤT bằng ngôn ngữ mục tiêu: ${targetLangObj.name}.

QUY TẮC BẮT BUỘC (MA TRẬN 5 VŨ KHÍ CTR CHIỀU SÂU):
Toàn bộ tiêu đề tạo ra phải bằng 100% ${targetLangObj.name} (${targetLangObj.promptDesc}), độ dài tối ưu chuẩn YouTube Mobile (40 - 65 ký tự, không bị cắt dấu ba chấm).
Mỗi tiêu đề đại diện cho đúng 1 vũ khí tâm lý độc lập:
1. Tiêu đề 1 [Tò mò tột độ - Curiosity Gap]: Khoảng trống thông tin cực đại, thôi thúc bấm xem ngay. Đặt "isTopPick": true và cung cấp "pickReason" (1 câu giải thích lý do thuật toán chọn).
2. Tiêu đề 2 [Nghịch lý & Xung đột - The Paradox]: Đặt 2 sự thật mâu thuẫn để tạo tranh luận và kích thích người xem click để kiểm chứng. Đặt "isTopPick": false.
3. Tiêu đề 3 [Con số & Bằng chứng - Proof & Data]: Con số cụ thể, dữ liệu thực tế tạo độ tin cậy và tò mò logic. Đặt "isTopPick": false.
4. Tiêu đề 4 [Cảnh báo / Chống số đông - Contrarian & FOMO]: Phản biện lại định kiến thông thường hoặc cảnh báo sai lầm. Đặt "isTopPick": false.
5. Tiêu đề 5 [Bền vững xuyên thời gian - Evergreen]: Bản chất vấn đề, giữ lượt xem trường tồn theo năm tháng. Đặt "isTopPick": false.

VIRAL SCORE (88 - 99): Chấm điểm tiềm năng CTR ước tính cho từng tiêu đề theo thang 100.
PHÂN LOẠI THỜI ĐIỂM ("timing"): "Trending Hot" (thời sự bùng nổ) hoặc "Evergreen" (bền vững).

ĐỊNH DẠNG ĐẦU RA (OUTPUT FORMAT):
BẮT BUỘC trả về đúng định dạng mảng JSON thuần túy gồm ĐÚNG 5 PHẦN TỬ (không viết văn xuôi hay chào hỏi ngoài JSON):
[
  {
    "angle": "Tò mò tột độ",
    "title": "Tiêu đề số 1...",
    "viralScore": 98,
    "timing": "Trending Hot",
    "isTopPick": true,
    "pickReason": "Khoảng trống thông tin kích thích người xem click ngay trong 3 giây đầu."
  },
  {
    "angle": "Nghịch lý & Xung đột",
    "title": "Tiêu đề số 2...",
    "viralScore": 95,
    "timing": "Evergreen",
    "isTopPick": false
  },
  {
    "angle": "Con số & Bằng chứng",
    "title": "Tiêu đề số 3...",
    "viralScore": 93,
    "timing": "Evergreen",
    "isTopPick": false
  },
  {
    "angle": "Cảnh báo / Chống số đông",
    "title": "Tiêu đề số 4...",
    "viralScore": 91,
    "timing": "Trending Hot",
    "isTopPick": false
  },
  {
    "angle": "Bền vững xuyên thời gian",
    "title": "Tiêu đề số 5...",
    "viralScore": 89,
    "timing": "Evergreen",
    "isTopPick": false
  }
]`;

  const userPrompt = `Thời điểm hiện tại: ${dateStr}. Tiêu đề gốc / Chủ đề video: "${rawInput}".
Hãy phân tích tâm lý người xem và tạo đúng 5 TIÊU ĐỀ YOUTUBE TINH HOA NHẤT bằng ${targetLangObj.name} theo đúng định dạng JSON yêu cầu. Chọn ra đúng 1 tiêu đề "isTopPick": true với "pickReason".`;

  setTitleGeneratingUIState(true);
  state.titleState.abortController = new AbortController();

  if (DOM.titleOutputStatusDesc) {
    DOM.titleOutputStatusDesc.textContent = `Đang phân tích tâm lý người xem (${targetLangObj.name})...`;
  }

  try {
    const baseUrl = resolveBaseUrl(provider);
    const endpoint = `${baseUrl}/chat/completions`;

    let rawText = '';

    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];
      if (state.titleState.abortController?.signal?.aborted) break;

      state.settings.activeModelId = currentModel;
      updateHeaderActiveModel();

      if (DOM.titleLoadingText) {
        DOM.titleLoadingText.textContent = mIdx > 0
          ? `🔄 Chuyển sang ${currentModel}: Đang tạo 10 tiêu đề tối ưu...`
          : `Đang kết nối ${currentModel} & bóc tách tâm lý YouTube...`;
      }

      const payload = {
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.75,
        stream: false
      };

      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify(payload),
          signal: state.titleState.abortController.signal
        });
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') throw fetchErr;
        if (mIdx < candidateModels.length - 1) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw fetchErr;
      }

      if (!response.ok) {
        let errDetails = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.error && errJson.error.message) {
            errDetails = errJson.error.message;
          }
        } catch (e) {}

        if (response.status === 401 || (response.status === 403 && !errDetails.toLowerCase().includes('quota'))) {
          throw new Error(`API Key không hợp lệ hoặc bị từ chối (${errDetails}).`);
        }

        const isRecoverable = (response.status === 429 || response.status === 503 || response.status === 502 || response.status === 504 || response.status === 404)
          || /quota|rate.?limit|resource_exhausted|overloaded|capacity|tokens|exhausted/i.test(errDetails);

        if (isRecoverable && mIdx < candidateModels.length - 1) {
          console.warn(`Model ${currentModel} gặp lỗi (${errDetails}), xoay vòng model...`);
          await new Promise(r => setTimeout(r, 400));
          continue;
        } else {
          throw new Error(errDetails);
        }
      }

      const data = await response.json();
      rawText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      break;
    }

    if (!rawText) {
      throw new Error('Máy chủ AI không trả về dữ liệu!');
    }

    // Parse titles from JSON or robust fallback
    const parsedTitles = parseTitlesFromResponse(rawText);

    if (!parsedTitles || parsedTitles.length === 0) {
      throw new Error('Không thể phân tích định dạng tiêu đề từ AI!');
    }

    state.titleState.titles = parsedTitles;
    renderTitleResults(parsedTitles);

    if (DOM.titleOutputStatusDesc) {
      DOM.titleOutputStatusDesc.textContent = `Đã tạo 5 tiêu đề tinh hoa theo chuẩn CTR (${targetLangObj.name})`;
    }

    if (DOM.btnCopyAllTitles) DOM.btnCopyAllTitles.disabled = false;
    if (DOM.btnRegenerateTitles) DOM.btnRegenerateTitles.disabled = false;

    showToast(`Đã tạo thành công ${parsedTitles.length} tiêu đề tinh hoa!`, 'success');

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Title generation aborted by user.');
    } else {
      console.error('Title generation failed:', err);
      showToast(`Lỗi tạo tiêu đề: ${err.message}`, 'danger', 3500);
      if (DOM.titleOutputStatusDesc) {
        DOM.titleOutputStatusDesc.textContent = `Lỗi: ${err.message}`;
      }
      if (!state.titleState.titles || state.titleState.titles.length === 0) {
        if (DOM.titleEmptyState) DOM.titleEmptyState.classList.remove('hidden');
      }
    }
  } finally {
    setTitleGeneratingUIState(false);
    state.titleState.abortController = null;
  }
}

function parseTitlesFromResponse(rawText) {
  let cleanText = rawText.trim();

  // Try extracting JSON from markdown code block ```json ... ```
  const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleanText = jsonMatch[1].trim();
  }

  // Attempt 1: Standard JSON parse
  try {
    const parsed = JSON.parse(cleanText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let hasTopPick = false;
      const list = parsed.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            angle: 'Tối ưu CTR',
            title: cleanTitleString(item),
            viralScore: Math.max(88, 98 - Math.min(idx * 2, 10)),
            timing: idx % 2 === 0 ? 'Trending Hot' : 'Evergreen',
            isTopPick: idx === 0,
            pickReason: idx === 0 ? 'Đánh trúng khoảng trống tò mò lớn nhất và kích thích nhấp chuột mạnh mẽ.' : ''
          };
        }

        const isTop = Boolean(item.isTopPick);
        if (isTop) hasTopPick = true;

        let score = parseInt(item.viralScore, 10);
        if (isNaN(score) || score < 50 || score > 100) {
          score = Math.max(88, 98 - Math.min(idx, 9));
        }

        let timing = item.timing;
        if (timing !== 'Trending Hot' && timing !== 'Evergreen') {
          timing = idx % 2 === 0 ? 'Trending Hot' : 'Evergreen';
        }

        return {
          angle: item.angle || item.type || item.style || 'Tối ưu CTR',
          title: cleanTitleString(item.title || item.text || item.content || ''),
          viralScore: score,
          timing: timing,
          isTopPick: isTop,
          pickReason: item.pickReason || ''
        };
      }).filter(t => Boolean(t.title));

      if (!hasTopPick && list.length > 0) {
        list[0].isTopPick = true;
        if (!list[0].pickReason) {
          list[0].pickReason = 'Đánh trúng khoảng trống tò mò lớn nhất và kích thích nhấp chuột mạnh mẽ.';
        }
      }

      return list.slice(0, 5);
    }
  } catch (e) {
    // Proceed to fallback
  }

  // Attempt 2: Regex Fallback - match numbered lines like:
  // 1. [Tò mò] Tiêu đề...
  // 1. "Tiêu đề..."
  // 1. Tiêu đề...
  const fallbackList = [];
  const lines = rawText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern: 1. [Angle] Title or 1. Title
    const match = trimmed.match(/^(\d+)[\.\-\)]\s*(?:\[([^\]]+)\])?\s*(.*)$/);
    if (match) {
      const angle = match[2] ? match[2].trim() : 'Tối ưu CTR';
      const title = cleanTitleString(match[3]);
      if (title) {
        const idx = fallbackList.length;
        fallbackList.push({
          angle,
          title,
          viralScore: Math.max(88, 98 - idx * 2),
          timing: idx % 2 === 0 ? 'Trending Hot' : 'Evergreen',
          isTopPick: idx === 0,
          pickReason: idx === 0 ? 'Đánh trúng khoảng trống tò mò lớn nhất và kích thích nhấp chuột mạnh mẽ.' : ''
        });
      }
    }
  }

  if (fallbackList.length > 0) {
    return fallbackList.slice(0, 5);
  }

  // Attempt 3: Any non-empty lines
  const rawLines = lines
    .map(l => cleanTitleString(l))
    .filter(l => l && l.length > 10 && !l.startsWith('{') && !l.startsWith('[') && !l.startsWith('`'));

  return rawLines.slice(0, 5).map((t, idx) => ({
    angle: 'Tối ưu CTR',
    title: t,
    viralScore: Math.max(88, 98 - idx * 2),
    timing: idx % 2 === 0 ? 'Trending Hot' : 'Evergreen',
    isTopPick: idx === 0,
    pickReason: idx === 0 ? 'Đánh trúng khoảng trống tò mò lớn nhất và kích thích nhấp chuột mạnh mẽ.' : ''
  }));
}

function cleanTitleString(str) {
  if (!str) return '';
  return str
    .replace(/^["'“”«»]+|["'“”«»]+$/g, '')
    .replace(/^\d+[\.\-\)]\s*/, '')
    .trim();
}

function renderTitleResults(titles) {
  if (!DOM.titleResultsList) return;

  DOM.titleResultsList.innerHTML = '';

  titles.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'title-card-item' + (item.isTopPick ? ' is-top-pick' : '');

    const num = index + 1;
    const titleText = item.title;
    const charLen = titleText.length;
    const score = item.viralScore || Math.max(88, 98 - index);
    const timing = item.timing || (index % 2 === 0 ? 'Trending Hot' : 'Evergreen');

    // Safe-zone badge calculation
    let safeClass = 'green';
    let safeLabel = `${charLen} KT • Chuẩn Mobile`;
    if (charLen > 70) {
      safeClass = 'red';
      safeLabel = `${charLen} KT • Dài`;
    } else if (charLen > 60) {
      safeClass = 'yellow';
      safeLabel = `${charLen} KT • Vừa vặn`;
    }

    // Score badge class
    let scoreClass = 'high';
    if (score < 90) scoreClass = 'good';
    else if (score < 95) scoreClass = 'medium';

    // Timing label
    const timingClass = timing === 'Trending Hot' ? 'trending' : 'evergreen';
    const timingLabel = timing === 'Trending Hot' ? '⚡ Bắt Trend' : '🌱 Bền Vững';

    // Card Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'title-card-header';

    const cardMeta = document.createElement('div');
    cardMeta.className = 'title-card-meta';

    if (item.isTopPick) {
      const topBadge = document.createElement('span');
      topBadge.className = 'title-top-pick-badge';
      topBadge.innerHTML = '<span>👑</span> TOP 1 ĐỀ XUẤT VIRAL';
      cardMeta.appendChild(topBadge);
    }

    const numBadge = document.createElement('span');
    numBadge.className = 'title-num-badge';
    numBadge.textContent = `#${num}`;
    cardMeta.appendChild(numBadge);

    const angleBadge = document.createElement('span');
    angleBadge.className = 'title-angle-badge';
    angleBadge.textContent = item.angle || 'Tối ưu CTR';
    cardMeta.appendChild(angleBadge);

    const scoreBadge = document.createElement('span');
    scoreBadge.className = `title-score-badge ${scoreClass}`;
    scoreBadge.textContent = `⭐ ${score}/100 CTR`;
    cardMeta.appendChild(scoreBadge);

    const timingBadge = document.createElement('span');
    timingBadge.className = `title-timing-badge ${timingClass}`;
    timingBadge.textContent = timingLabel;
    cardMeta.appendChild(timingBadge);

    const safeBadge = document.createElement('span');
    safeBadge.className = `title-safe-badge ${safeClass}`;
    safeBadge.textContent = safeLabel;

    cardHeader.appendChild(cardMeta);
    cardHeader.appendChild(safeBadge);

    // Card Body
    const cardBody = document.createElement('div');
    cardBody.className = 'title-card-body';

    const textWrap = document.createElement('div');
    textWrap.style.flex = '1';
    textWrap.style.minWidth = '0';

    const textP = document.createElement('p');
    textP.className = 'title-text-content';
    textP.textContent = titleText;
    textWrap.appendChild(textP);

    if (item.isTopPick && item.pickReason) {
      const reasonBox = document.createElement('div');
      reasonBox.className = 'title-pick-reason';
      reasonBox.innerHTML = `
        <span class="reason-icon">💡</span>
        <span><strong>Lý do chọn #1:</strong> ${item.pickReason}</span>
      `;
      textWrap.appendChild(reasonBox);
    }

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn-copy-single-title';
    copyBtn.title = 'Sao chép tiêu đề này';
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>Sao chép</span>
    `;

    copyBtn.addEventListener('click', async () => {
      try {
        await (navigator.clipboard?.writeText ? navigator.clipboard.writeText(titleText) : null);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Đã chép!</span>
        `;
        showToast(`Đã sao chép tiêu đề #${num}!`, 'success', 1000);
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Sao chép</span>
          `;
        }, 1600);
      } catch (e) {
        showToast('Không thể sao chép!', 'danger', 1200);
      }
    });

    cardBody.appendChild(textWrap);
    cardBody.appendChild(copyBtn);

    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    DOM.titleResultsList.appendChild(card);
  });

  if (DOM.titleEmptyState) DOM.titleEmptyState.classList.add('hidden');
  if (DOM.titleLoadingState) DOM.titleLoadingState.classList.add('hidden');
  if (DOM.titleResultsList) DOM.titleResultsList.classList.remove('hidden');

  if (DOM.titleCountPill) {
    DOM.titleCountPill.textContent = `${titles.length} / 5 tiêu đề`;
  }
  if (DOM.titleCountStat) {
    DOM.titleCountStat.textContent = `${titles.length} tiêu đề`;
  }
  if (DOM.titleStatusText) DOM.titleStatusText.textContent = 'Hoàn tất';
  if (DOM.titleStatusBadge) DOM.titleStatusBadge.className = 'output-status-pill completed';
  if (DOM.btnCopyAllTitles) DOM.btnCopyAllTitles.disabled = false;
  if (DOM.btnRegenerateTitles) DOM.btnRegenerateTitles.disabled = false;
}

async function copyAllTitlesToClipboard() {
  if (!state.titleState.titles || state.titleState.titles.length === 0) {
    showToast('Chưa có danh sách tiêu đề để sao chép!', 'warning');
    return;
  }

  const formatted = state.titleState.titles
    .map((item, idx) => {
      const topMark = item.isTopPick ? ' [👑 TOP 1 ĐỀ XUẤT]' : '';
      const scoreMark = item.viralScore ? ` (CTR: ${item.viralScore}/100)` : '';
      return `${idx + 1}.${topMark} [${item.angle}] ${item.title}${scoreMark}`;
    })
    .join('\n');

  try {
    await navigator.clipboard.writeText(formatted);
    showToast('Đã sao chép toàn bộ danh sách 5 tiêu đề vào Clipboard!', 'success', 2000);
  } catch (err) {
    showToast('Lỗi khi sao chép toàn bộ!', 'danger', 1500);
  }
}

// ===================================================================
// MODULE 3: YOUTUBE SEO DESCRIPTION & VIDIQ TAGS CONTROLLER
// ===================================================================

function updateDescInputCounts() {
  const titleText = (DOM.inputDescTitle?.value || '').trim();
  const contentText = (DOM.inputDescContent?.value || '').trim();

  if (DOM.descTitleCharCount) {
    DOM.descTitleCharCount.textContent = `${titleText.length} ký tự`;
  }

  const contentCharCount = contentText.length;
  const contentWordCount = contentText ? contentText.split(/\s+/).filter(Boolean).length : 0;

  if (DOM.descContentCharCount) {
    DOM.descContentCharCount.textContent = `${contentCharCount.toLocaleString('vi-VN')} ký tự`;
  }
  if (DOM.descContentWordCount) {
    DOM.descContentWordCount.textContent = `${contentWordCount.toLocaleString('vi-VN')} từ`;
  }

  // Tự động nhận diện ngôn ngữ theo nội dung đầu vào (Input)
  autoDetectDescLanguage();

  checkDescReadiness();
}

// Thuật toán nhận diện ngôn ngữ siêu nhanh và chính xác từ văn bản đầu vào (Đạt chuẩn 100% cho 8 ngôn ngữ)
function detectLanguageFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (clean.length < 3) return null;

  // 1. Tiếng Nhật: Nhận diện chữ Hiragana hoặc Katakana đặc trưng
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(clean)) return 'ja';

  // 2. Tiếng Hàn: Nhận diện khối chữ Hangul
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(clean)) return 'ko';

  // 3. Tiếng Trung: Nhận diện chữ Hán CJK (khi không chứa chữ Nhật)
  if (/[\u4E00-\u9FFF]/.test(clean)) return 'zh';

  // 4. Tiếng Việt: Nhận diện nguyên âm có dấu đặc thù chỉ có trong tiếng Việt
  if (/[đĐăĂơƠưƯạảầấậẩẫằắặẳẵẹẻềếệểễịỉọỏồốộổỗờớợởỡụủừứựửữỵỷ]/i.test(clean)) return 'vi';

  // Tách từ Unicode chuẩn xác
  const tokens = new Set(clean.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter(Boolean));

  // Kiểm tra từ khóa tiếng Việt không dấu hoặc phổ biến
  if (tokens.has('và') || tokens.has('của') || tokens.has('không') || tokens.has('được') || tokens.has('người') || tokens.has('tại') || tokens.has('sao') || tokens.has('kịch') || tokens.has('bản')) return 'vi';

  // 5. Tiếng Bồ Đào Nha / Brasil (Kiểm tra trước tiếng Tây Ban Nha để tránh nhầm lẫn)
  if (/[çÇãõ]/.test(clean) || tokens.has('você') || tokens.has('voce') || tokens.has('não') || tokens.has('nao') || tokens.has('são') || tokens.has('obrigado') || tokens.has('muito') || tokens.has('ecrã')) {
    if (tokens.has('você') || tokens.has('voce') || tokens.has('legal') || tokens.has('cara') || tokens.has('beleza')) return 'br';
    return 'pt';
  }

  // 6. Tiếng Tây Ban Nha
  if (/[¿¡ñÑ]/.test(clean) || tokens.has('el') || tokens.has('la') || tokens.has('los') || tokens.has('las') || tokens.has('del') || tokens.has('como') || tokens.has('pero') || tokens.has('más') || tokens.has('estos') || tokens.has('estas')) return 'es';

  // 7. Tiếng Anh: Các từ khóa phổ biến trong tiêu đề / kịch bản tiếng Anh
  if (tokens.has('the') || tokens.has('and') || tokens.has('is') || tokens.has('are') || tokens.has('in') || tokens.has('on') || tokens.has('at') || tokens.has('to') || tokens.has('for') || tokens.has('with') || tokens.has('this') || tokens.has('that') || tokens.has('from') || tokens.has('how') || tokens.has('why') || tokens.has('what') || tokens.has('when') || tokens.has('where') || tokens.has('your') || tokens.has('you')) return 'en';

  return null;
}

function selectDescTargetLanguage(langKey, isAuto = false) {
  if (state.descriptionState.isGenerating) return;
  if (!TITLE_TARGET_LANGUAGES[langKey]) return;

  state.descriptionState.targetLanguage = langKey;

  if (!isAuto) {
    state.descriptionState.isUserManualLang = true;
  }

  if (DOM.descLangGrid) {
    const descPills = DOM.descLangGrid.querySelectorAll('.desc-lang-pill');
    descPills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-lang') === langKey);
    });
  }

  const langObj = TITLE_TARGET_LANGUAGES[langKey] || TITLE_TARGET_LANGUAGES.vi;

  if (DOM.descLangAutoBadge) {
    if (isAuto) {
      DOM.descLangAutoBadge.textContent = `⚡ Nhận diện: ${langObj.name}`;
      DOM.descLangAutoBadge.classList.add('detected');
      clearTimeout(state.descriptionState._autoBadgeTimer);
      state.descriptionState._autoBadgeTimer = setTimeout(() => {
        if (DOM.descLangAutoBadge) {
          DOM.descLangAutoBadge.textContent = '⚡ Tự động nhận diện';
          DOM.descLangAutoBadge.classList.remove('detected');
        }
      }, 2500);
    } else {
      DOM.descLangAutoBadge.textContent = `🔒 Đã chọn: ${langObj.name}`;
      DOM.descLangAutoBadge.classList.remove('detected');
    }
  }

  if (DOM.descOutputStatusDesc && !state.descriptionState.isGenerating) {
    DOM.descOutputStatusDesc.textContent = `Tối ưu điểm hiển thị thuật toán YouTube & vidIQ (${langObj.name})`;
  }
}

function autoDetectDescLanguage() {
  const titleText = (DOM.inputDescTitle?.value || '').trim();
  const contentText = (DOM.inputDescContent?.value || '').trim();
  const combinedText = titleText + ' ' + contentText;

  if (!combinedText.trim()) {
    state.descriptionState.isUserManualLang = false;
    return;
  }

  const detected = detectLanguageFromText(combinedText);
  if (detected && detected !== state.descriptionState.targetLanguage) {
    selectDescTargetLanguage(detected, true);
  }
}

function checkDescReadiness() {
  const provider = state.settings.providers.find(p => p.id === state.settings.activeProviderId);
  const hasProvider = Boolean(provider && provider.apiKey);
  const titleText = (DOM.inputDescTitle?.value || '').trim();
  const currentLang = state.descriptionState.targetLanguage || 'vi';
  const langObj = TITLE_TARGET_LANGUAGES[currentLang] || TITLE_TARGET_LANGUAGES.vi;

  if (DOM.btnGenerateDesc && !state.descriptionState.isGenerating) {
    if (!hasProvider) {
      DOM.btnGenerateDesc.disabled = true;
      DOM.btnGenerateDesc.classList.add('disabled');
      DOM.btnGenerateDesc.title = 'Vui lòng cấu hình API Key trong Cài đặt trước!';
    } else {
      DOM.btnGenerateDesc.disabled = false;
      DOM.btnGenerateDesc.classList.remove('disabled');
      DOM.btnGenerateDesc.title = titleText ? `Bấm để tạo Mô tả SEO & Tags YouTube (${langObj.name})` : 'Vui lòng nhập tiêu đề video trước';
    }
  }
}

function setDescMode(mode) {
  if (state.descriptionState.isGenerating) return;
  state.descriptionState.mode = mode;

  if (mode === 'plain') {
    if (DOM.btnModePlain) DOM.btnModePlain.classList.add('active');
    if (DOM.btnModeSrt) DOM.btnModeSrt.classList.remove('active');
    if (DOM.inputDescContent) {
      DOM.inputDescContent.placeholder = '';
    }
  } else if (mode === 'srt') {
    if (DOM.btnModeSrt) DOM.btnModeSrt.classList.add('active');
    if (DOM.btnModePlain) DOM.btnModePlain.classList.remove('active');
    if (DOM.inputDescContent) {
      DOM.inputDescContent.placeholder = '';
    }
  }
}

function loadSampleDescription() {
  if (state.descriptionState.isGenerating) return;
  const currentTitle = (DOM.inputDescTitle?.value || '').trim();

  let nextSample = SAMPLE_DESC_DATA[0];
  const idx = SAMPLE_DESC_DATA.findIndex(s => s.title === currentTitle);
  if (idx >= 0 && idx < SAMPLE_DESC_DATA.length - 1) {
    nextSample = SAMPLE_DESC_DATA[idx + 1];
  } else if (idx === SAMPLE_DESC_DATA.length - 1) {
    nextSample = SAMPLE_DESC_DATA[0];
  }

  setDescMode(nextSample.mode);

  if (DOM.inputDescTitle) {
    DOM.inputDescTitle.value = nextSample.title;
  }
  if (DOM.inputDescContent) {
    DOM.inputDescContent.value = nextSample.content;
  }

  updateDescInputCounts();
  showToast(`Đã nạp mẫu: "${nextSample.title.slice(0, 42)}..."`, 'success', 1800);
}

async function pasteDescTitle() {
  if (state.descriptionState.isGenerating) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text && DOM.inputDescTitle) {
      DOM.inputDescTitle.value = text.trim();
      updateDescInputCounts();
      showToast('Đã dán tiêu đề!', 'success', 1200);
    }
  } catch (e) {
    showToast('Không thể truy cập Clipboard!', 'danger');
  }
}

function clearDescTitle() {
  if (state.descriptionState.isGenerating) return;
  if (DOM.inputDescTitle) {
    DOM.inputDescTitle.value = '';
    updateDescInputCounts();
    DOM.inputDescTitle.focus();
  }
}

async function pasteDescContent() {
  if (state.descriptionState.isGenerating) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text && DOM.inputDescContent) {
      DOM.inputDescContent.value = text;
      // Auto-detect if user pastes SRT format (has "-->" or timestamp digits)
      if (/-->\s*\d{2}:\d{2}/.test(text) && state.descriptionState.mode !== 'srt') {
        setDescMode('srt');
        showToast('Đã phát hiện định dạng SRT: Tự động chuyển sang chế độ Phụ đề SRT!', 'info', 2200);
      }
      updateDescInputCounts();
      showToast('Đã dán nội dung kịch bản!', 'success', 1200);
    }
  } catch (e) {
    showToast('Không thể truy cập Clipboard!', 'danger');
  }
}

function clearDescContent() {
  if (state.descriptionState.isGenerating) return;
  if (DOM.inputDescContent) {
    DOM.inputDescContent.value = '';
    updateDescInputCounts();
    DOM.inputDescContent.focus();
  }
}

function clearAllDescInputs() {
  if (state.descriptionState.isGenerating) return;
  clearDescTitle();
  clearDescContent();
  state.descriptionState.isUserManualLang = false;
  state.descriptionState.descriptionText = '';
  state.descriptionState.tags = [];
  selectDescTargetLanguage('vi', false);
  if (DOM.descLangAutoBadge) {
    DOM.descLangAutoBadge.textContent = '⚡ Tự động nhận diện';
    DOM.descLangAutoBadge.classList.remove('detected');
  }
  if (DOM.descOutputText) DOM.descOutputText.value = '';
  if (DOM.descTagsCloud) DOM.descTagsCloud.innerHTML = '';
  if (DOM.descResultsWrapper) DOM.descResultsWrapper.classList.add('hidden');
  if (DOM.descEmptyState) DOM.descEmptyState.classList.remove('hidden');
  if (DOM.descStatusText) DOM.descStatusText.textContent = 'Sẵn sàng';
  if (DOM.descStatusBadge) DOM.descStatusBadge.className = 'output-status-pill';
  if (DOM.descOutputStatusDesc) DOM.descOutputStatusDesc.textContent = 'Tối ưu điểm hiển thị thuật toán YouTube & vidIQ (Tiếng Việt)';
  if (DOM.btnCopyAllDescAndTags) DOM.btnCopyAllDescAndTags.disabled = true;
  if (DOM.btnRegenerateDesc) DOM.btnRegenerateDesc.disabled = true;
  updateDescOutputCharCount();
  updateDescTagsCharCount();
  showToast('Đã xóa tất cả ô nhập liệu!', 'info', 1200);
}

function setDescGeneratingUIState(isGen) {
  state.descriptionState.isGenerating = isGen;

  if (DOM.btnGenerateDesc) {
    if (isGen) {
      DOM.btnGenerateDesc.classList.add('danger-stop');
      if (DOM.btnGenerateDescText) DOM.btnGenerateDescText.textContent = 'DỪNG TẠO MÔ TẢ';
      DOM.btnGenerateDesc.title = 'Bấm để hủy tiến trình tạo';
    } else {
      DOM.btnGenerateDesc.classList.remove('danger-stop');
      if (DOM.btnGenerateDescText) DOM.btnGenerateDescText.textContent = 'TẠO MÔ TẢ SEO & TAGS YOUTUBE';
      checkDescReadiness();
    }
  }

  if (DOM.inputDescTitle) DOM.inputDescTitle.disabled = isGen;
  if (DOM.inputDescContent) DOM.inputDescContent.disabled = isGen;
  if (DOM.btnSampleDesc) DOM.btnSampleDesc.disabled = isGen;
  if (DOM.btnClearDesc) DOM.btnClearDesc.disabled = isGen;
  if (DOM.btnPasteDescTitle) DOM.btnPasteDescTitle.disabled = isGen;
  if (DOM.btnClearDescTitle) DOM.btnClearDescTitle.disabled = isGen;
  if (DOM.btnPasteDescContent) DOM.btnPasteDescContent.disabled = isGen;
  if (DOM.btnClearDescContent) DOM.btnClearDescContent.disabled = isGen;

  if (isGen) {
    if (DOM.descEmptyState) DOM.descEmptyState.classList.add('hidden');
    if (DOM.descResultsWrapper) DOM.descResultsWrapper.classList.add('hidden');
    if (DOM.descLoadingState) DOM.descLoadingState.classList.remove('hidden');

    if (DOM.descStatusText) DOM.descStatusText.textContent = 'Đang xử lý';
    if (DOM.descStatusBadge) DOM.descStatusBadge.className = 'output-status-pill running';
    if (DOM.btnCopyAllDescAndTags) DOM.btnCopyAllDescAndTags.disabled = true;
    if (DOM.btnRegenerateDesc) DOM.btnRegenerateDesc.disabled = true;
  }
}

function stopDescriptionGeneration() {
  if (state.descriptionState.abortController) {
    state.descriptionState.abortController.abort();
    state.descriptionState.abortController = null;
  }
  setDescGeneratingUIState(false);
  showToast('Đã dừng tiến trình tạo mô tả!', 'info');

  if (DOM.descLoadingState) DOM.descLoadingState.classList.add('hidden');
  if (state.descriptionState.tags && state.descriptionState.tags.length > 0) {
    if (DOM.descResultsWrapper) DOM.descResultsWrapper.classList.remove('hidden');
  } else {
    if (DOM.descEmptyState) DOM.descEmptyState.classList.remove('hidden');
  }

  if (DOM.descStatusText) DOM.descStatusText.textContent = 'Đã dừng';
  if (DOM.descStatusBadge) DOM.descStatusBadge.className = 'output-status-pill';
  if (DOM.descOutputStatusDesc) DOM.descOutputStatusDesc.textContent = 'Tiến trình đã bị dừng bởi người dùng';
}

async function startDescriptionGeneration() {
  const title = (DOM.inputDescTitle?.value || '').trim();
  if (!title) {
    showToast('Vui lòng nhập tiêu đề video trước khi tạo!', 'warning');
    DOM.inputDescTitle?.focus();
    return;
  }

  const content = (DOM.inputDescContent?.value || '').trim();

  // Active provider & model
  const provider = state.settings.providers.find(p => p.id === state.settings.activeProviderId);
  if (!provider || !provider.apiKey) {
    showToast(`Vui lòng cấu hình API Key cho ${provider ? provider.displayName : 'hệ thống'}!`, 'warning');
    switchMainView('settings', 'apikeys');
    return;
  }

  const isGemini = (provider.providerType === 'gemini')
    || (provider.apiKey && provider.apiKey.trim().startsWith('AIzaSy'))
    || (provider.baseUrl && provider.baseUrl.includes('googleapis.com'));

  let candidateModels = [];
  if (provider.models && provider.models.length > 0) {
    candidateModels = provider.models.map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean);
  } else if (isGemini) {
    candidateModels = GEMINI_DEFAULT_MODELS.map(m => m.id);
  }

  const initialModelId = state.settings.activeModelId || candidateModels[0];
  if (!initialModelId && candidateModels.length === 0) {
    showToast('Chưa chọn model AI nào!', 'warning');
    switchMainView('settings', 'apikeys');
    return;
  }

  if (candidateModels.length > 1 && initialModelId) {
    const idx = candidateModels.indexOf(initialModelId);
    if (idx > 0) {
      candidateModels = [...candidateModels.slice(idx), ...candidateModels.slice(0, idx)];
    }
  } else if (candidateModels.length === 0) {
    candidateModels = [initialModelId];
  }

  const isAutoRotateEnabled = isGemini 
    && (DOM.chkAutoRotateModal ? DOM.chkAutoRotateModal.checked : true)
    && (state.preferences?.autoRotateModels !== false);

  if (!isAutoRotateEnabled) {
    candidateModels = [initialModelId];
  }

  const targetLangKey = state.descriptionState.targetLanguage || 'vi';
  const targetLangObj = TITLE_TARGET_LANGUAGES[targetLangKey] || TITLE_TARGET_LANGUAGES.vi;

  const isSrtMode = state.descriptionState.mode === 'srt';
  const now = new Date();
  const dateStr = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const systemPrompt = `Bạn là Chuyên gia hàng đầu thế giới về Tối ưu hóa SEO YouTube và Chuyên gia thuật toán vidIQ (Senior YouTube SEO Specialist & vidIQ Algorithm Master).
NGỮ CẢNH THỜI GIAN THỰC HIỆN TẠI: ${dateStr}.
NGÔN NGỮ MỤC TIÊU BẮT BUỘC (100% STRICT TARGET LANGUAGE): ${targetLangObj.name} (${targetLangObj.promptDesc}).

HIẾN PHÁP NGÔN NGỮ TỐI THƯỢNG (ZERO-LEAKAGE LANGUAGE POLICY):
1. BẮT BUỘC 100% mọi câu chữ trong bản MÔ TẢ (SEO Description) - từ câu hook mở đầu, tóm tắt, tên các chapters/timestamps, lời kêu gọi CTA, đến các hashtags - ĐỀU PHẢI VIẾT HOÀN TOÀN BẰNG ${targetLangObj.name}.
2. TUYỆT ĐỐI NGHIÊM CẤM pha trộn tiếng Việt hoặc bất kỳ ngôn ngữ nào khác nếu ngôn ngữ mục tiêu không phải là tiếng Việt.
3. BẮT BUỘC 100% toàn bộ danh sách TAGS YOUTUBE (vidIQ style) phải là các từ khóa bản địa (Native Search Queries) bằng ${targetLangObj.name} mà người dùng tại quốc gia đó thực sự tìm kiếm trên YouTube.

Nhiệm vụ của bạn: Từ Tiêu đề video và Kịch bản nội dung được cung cấp, hãy tạo ra:
1. Một bản MÔ TẢ YOUTUBE (SEO Description) đỉnh cao bằng ${targetLangObj.name} tối ưu hóa điểm đề xuất thuật toán YouTube.
2. Một danh sách TAGS YOUTUBE (vidIQ style) bằng ${targetLangObj.name} có điểm số SEO cao ngất ngưởng, TỔNG ĐỘ DÀI KHI NỐI DẤU PHẨY BẮT BUỘC DƯỚI 500 KÝ TỰ.

QUY TẮC BẮT BUỘC CHO MÔ TẢ (SEO DESCRIPTION) BẰNG ${targetLangObj.name}:
- Phần 1 (2 dòng đầu tiên, < 150 ký tự): Câu hook/mở đầu cực kỳ cuốn hút bằng ${targetLangObj.name}, đánh trúng khoảng trống tò mò (Curiosity Gap) và chứa tự nhiên từ khóa chính.
- Phần 2 (Tóm tắt & Nội dung cốt lõi): 2-3 đoạn văn cô đọng, sắc bén bằng ${targetLangObj.name}, chia sẻ giá trị người xem sẽ nhận được.
- Phần 3 (Mốc thời gian / Timestamps / Chapters bằng ${targetLangObj.name}):
  * NẾU CHẾ ĐỘ SRT (${isSrtMode ? 'ĐANG BẬT' : 'KHÔNG BẬT'}): Bạn BẮT BUỘC phải phân tích các mốc thời gian thực trong phụ đề SRT do người dùng cung cấp và tạo ra 4 đến 8 chapters logic bắt đầu BẮT BUỘC bằng mốc "00:00 - Introduction/Giới thiệu...". Tiêu đề các chapters BẮT BUỘC phải viết bằng ${targetLangObj.name}.
  * Nếu không có SRT hoặc chế độ văn bản thường: Tạo các mốc nội dung nổi bật bằng ${targetLangObj.name}.
- Phần 4 (Kêu gọi hành động & Liên kết): Kêu gọi người xem Like, Đăng ký kênh và bấm chuông thông báo (🔔) bằng ${targetLangObj.name}.
- Phần 5 (DƯỚI CÙNG BẮT BUỘC): Đặt từ 3 đến 5 Hashtags SEO thịnh hành nhất bằng ${targetLangObj.name} bắt đầu bằng dấu #.

QUY TẮC BẮT BUỘC CHO TAGS YOUTUBE (VIDIQ STYLE) BẰNG ${targetLangObj.name}:
- Số lượng: Khoảng 18 đến 26 tags chất lượng cao hoàn toàn bằng ${targetLangObj.name}.
- Phân bổ từ khóa toàn diện:
  * Từ khóa khớp chính xác tiêu đề
  * Từ khóa hạt nhân / chủ đề rộng
  * Từ khóa tìm kiếm dạng câu hỏi / Long-tail keywords bằng ${targetLangObj.name}
  * Các biến thể tìm kiếm thịnh hành của khán giả bản địa
- CHẤM ĐIỂM VIDIQ (score: 65 - 96): Ước tính điểm SEO tiềm năng cho từng tag theo tỷ lệ Lượt tìm kiếm cao & Mức độ cạnh tranh vừa phải.
- Tags YouTube là từ khóa thuần (KHÔNG có dấu #).
- GIỚI HẠN TUYỆT ĐỐI VỀ KÝ TỰ: Tổng độ dài của tất cả các tag khi nối lại bằng dấu phẩy và khoảng trắng ", " BẮT BUỘC KHÔNG ĐƯỢC VƯỢT QUÁ 500 KÝ TỰ (mục tiêu lý tưởng: 420 - 485 ký tự) để người dùng có thể bấm Copy và dán ăn ngay 100% vào ô Tags của YouTube Studio mà không bị lỗi đỏ.

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC (JSON SCHEMA):
BẮT BUỘC chỉ trả về duy nhất 1 đối tượng JSON thuần túy (không chào hỏi hay viết thêm chữ nào ngoài JSON):
{
  "description": "Nội dung toàn bộ mô tả video bằng ${targetLangObj.name} gồm hook, tóm tắt, chapters (nếu có srt), CTA và hashtags...",
  "tags": [
    { "text": "tag 1 in ${targetLangObj.name}", "score": 92 },
    { "text": "tag 2 in ${targetLangObj.name}", "score": 88 },
    { "text": "tag 3 in ${targetLangObj.name}", "score": 85 }
  ]
}`;

  const userPrompt = `Thời điểm: ${dateStr}.
NGÔN NGỮ MỤC TIÊU BẮT BUỘC: ${targetLangObj.name} (Toàn bộ mô tả và tags BẮT BUỘC 100% bằng ${targetLangObj.name}).
TIÊU ĐỀ VIDEO: "${title}"
CHẾ ĐỘ KỊCH BẢN: ${isSrtMode ? 'Phụ đề SRT (Hãy trích xuất Timestamps chính xác bắt đầu từ 00:00)' : 'Kịch bản văn bản thuần'}
NỘI DUNG KỊCH BẢN CUNG CẤP:
"""
${content || '(Người dùng chỉ cung cấp tiêu đề, hãy phân tích tiêu đề và suy luận toàn diện để tạo mô tả và tags xuất sắc)'}
"""

Hãy tạo Mô tả SEO tối ưu và danh sách Tags phong cách vidIQ theo đúng JSON Schema đã quy định, TOÀN BỘ 100% BẰNG ${targetLangObj.name}. Lưu ý tổng độ dài chuỗi tags nối dấu phẩy phải nhỏ hơn hoặc bằng 500 ký tự.`;

  setDescGeneratingUIState(true);
  state.descriptionState.abortController = new AbortController();

  if (DOM.descOutputStatusDesc) {
    DOM.descOutputStatusDesc.textContent = `Đang phân tích từ khóa & tối ưu điểm SEO YouTube (${targetLangObj.name})...`;
  }

  try {
    const baseUrl = resolveBaseUrl(provider);
    const endpoint = `${baseUrl}/chat/completions`;

    let rawText = '';

    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const currentModel = candidateModels[mIdx];
      if (state.descriptionState.abortController?.signal?.aborted) break;

      state.settings.activeModelId = currentModel;
      updateHeaderActiveModel();

      if (DOM.descLoadingText) {
        DOM.descLoadingText.textContent = mIdx > 0
          ? `🔄 Chuyển sang ${currentModel}: Đang tối ưu mô tả & tính điểm tags...`
          : `Đang kết nối ${currentModel} & tối ưu SEO YouTube vidIQ...`;
      }

      const payload = {
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        stream: false
      };

      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify(payload),
          signal: state.descriptionState.abortController.signal
        });
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') throw fetchErr;
        if (mIdx < candidateModels.length - 1) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw fetchErr;
      }

      if (!response.ok) {
        let errDetails = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.error && errJson.error.message) {
            errDetails = errJson.error.message;
          }
        } catch (e) {}

        if (response.status === 401 || (response.status === 403 && !errDetails.toLowerCase().includes('quota'))) {
          throw new Error(`API Key không hợp lệ hoặc bị từ chối (${errDetails}).`);
        }

        const isRecoverable = (response.status === 429 || response.status === 503 || response.status === 502 || response.status === 504 || response.status === 404)
          || /quota|rate.?limit|resource_exhausted|overloaded|capacity|tokens|exhausted/i.test(errDetails);

        if (isRecoverable && mIdx < candidateModels.length - 1) {
          console.warn(`Model ${currentModel} gặp lỗi (${errDetails}), xoay vòng model...`);
          await new Promise(r => setTimeout(r, 400));
          continue;
        } else {
          throw new Error(errDetails);
        }
      }

      const data = await response.json();
      rawText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      break;
    }

    if (!rawText) {
      throw new Error('Máy chủ AI không trả về dữ liệu!');
    }

    const parsedResult = parseDescriptionAndTagsFromResponse(rawText);
    if (!parsedResult || !parsedResult.description) {
      throw new Error('Không thể phân tích định dạng Mô tả & Tags từ phản hồi AI!');
    }

    state.descriptionState.descriptionText = parsedResult.description;
    state.descriptionState.tags = parsedResult.tags || [];

    renderDescriptionResults(parsedResult);

    if (DOM.descOutputStatusDesc) {
      DOM.descOutputStatusDesc.textContent = `Đã tối ưu Mô tả SEO & Tags YouTube chuẩn thuật toán vidIQ (${targetLangObj.name})`;
    }

    showToast('Tạo Mô tả SEO & Tags YouTube thành công!', 'success');

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Description generation aborted by user.');
    } else {
      console.error('Description generation failed:', err);
      showToast(`Lỗi tạo mô tả: ${err.message}`, 'danger', 3500);
      if (DOM.descOutputStatusDesc) {
        DOM.descOutputStatusDesc.textContent = `Lỗi: ${err.message}`;
      }
      if (!state.descriptionState.descriptionText) {
        if (DOM.descEmptyState) DOM.descEmptyState.classList.remove('hidden');
      }
      if (DOM.descLoadingState) DOM.descLoadingState.classList.add('hidden');
      if (DOM.descStatusText) DOM.descStatusText.textContent = 'Lỗi kết nối';
      if (DOM.descStatusBadge) DOM.descStatusBadge.className = 'output-status-pill';
    }
  } finally {
    setDescGeneratingUIState(false);
    state.descriptionState.abortController = null;
  }
}

function parseDescriptionAndTagsFromResponse(rawText) {
  let cleanText = rawText.trim();

  // Extract from markdown ```json ... ``` block if present
  const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleanText = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    if (parsed && typeof parsed === 'object') {
      let desc = parsed.description || parsed.seo_description || parsed.desc || '';
      let tagsRaw = parsed.tags || parsed.youtube_tags || parsed.vidiq_tags || [];

      let cleanTags = [];
      if (Array.isArray(tagsRaw)) {
        cleanTags = tagsRaw.map((t, idx) => {
          if (typeof t === 'string') {
            return {
              text: t.replace(/^#/, '').trim(),
              score: Math.max(65, 96 - Math.min(idx * 2, 30))
            };
          }
          const text = (t.text || t.tag || t.name || '').replace(/^#/, '').trim();
          let score = parseInt(t.score || t.points, 10);
          if (isNaN(score) || score < 50 || score > 100) {
            score = Math.max(65, 96 - Math.min(idx, 28));
          }
          return { text, score };
        }).filter(t => t.text.length > 0);
      }

      // Enforce 500-char limit for YouTube Studio tags
      let validTags = [];
      let accumulatedLength = 0;
      for (const tagObj of cleanTags) {
        const addedLen = validTags.length === 0 ? tagObj.text.length : (tagObj.text.length + 2);
        if (accumulatedLength + addedLen <= 500) {
          validTags.push(tagObj);
          accumulatedLength += addedLen;
        }
      }

      return {
        description: desc.trim(),
        tags: validTags
      };
    }
  } catch (jsonErr) {
    console.warn('Direct JSON parse failed for description/tags, attempting resilient fallback extraction...', jsonErr);
  }

  // Resilient text fallback parser
  let descFallback = cleanText;
  let tagsFallback = [];

  const tagSplitMatch = cleanText.match(/(?:Tags|TAGS|Từ khóa|Từ khoá|vidiq tags|YouTube Tags)[:\n\r]+([\s\S]+)$/i);
  if (tagSplitMatch) {
    descFallback = cleanText.substring(0, tagSplitMatch.index).trim();
    const tagPart = tagSplitMatch[1].trim();
    const rawTokens = tagPart.split(/[,;\n\r]+/).map(t => t.replace(/^#|^\d+[\.\-\)]\s*/, '').trim()).filter(Boolean);

    let accumulatedLength = 0;
    rawTokens.forEach((tok, idx) => {
      const addedLen = tagsFallback.length === 0 ? tok.length : (tok.length + 2);
      if (accumulatedLength + addedLen <= 500) {
        tagsFallback.push({
          text: tok,
          score: Math.max(65, 95 - Math.min(idx * 2, 28))
        });
        accumulatedLength += addedLen;
      }
    });
  }

  return {
    description: descFallback.trim(),
    tags: tagsFallback
  };
}

function renderDescriptionResults(data) {
  if (DOM.descOutputText) {
    DOM.descOutputText.value = data.description || '';
  }

  updateDescOutputCharCount();
  renderTagsCloud();

  if (DOM.descEmptyState) DOM.descEmptyState.classList.add('hidden');
  if (DOM.descLoadingState) DOM.descLoadingState.classList.add('hidden');
  if (DOM.descResultsWrapper) DOM.descResultsWrapper.classList.remove('hidden');

  if (DOM.descStatusText) DOM.descStatusText.textContent = 'Hoàn tất';
  if (DOM.descStatusBadge) DOM.descStatusBadge.className = 'output-status-pill completed';

  if (DOM.btnCopyAllDescAndTags) DOM.btnCopyAllDescAndTags.disabled = false;
  if (DOM.btnRegenerateDesc) DOM.btnRegenerateDesc.disabled = false;
}

function renderTagsCloud() {
  if (!DOM.descTagsCloud) return;
  DOM.descTagsCloud.innerHTML = '';

  const tags = state.descriptionState.tags || [];

  tags.forEach((tagItem, idx) => {
    const pill = document.createElement('div');
    pill.className = 'vidiq-tag-pill';
    pill.setAttribute('data-tag-index', idx);

    const scoreClass = tagItem.score >= 70 ? 'high' : 'medium';
    pill.innerHTML = `
      <span class="tag-score ${scoreClass}">${tagItem.score}</span>
      <span class="tag-label">${escapeHtml(tagItem.text)}</span>
      <button class="btn-tag-remove" title="Xóa tag này" type="button">✕</button>
    `;

    const removeBtn = pill.querySelector('.btn-tag-remove');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTagByIndex(idx);
    });

    DOM.descTagsCloud.appendChild(pill);
  });

  updateDescTagsCharCount();
}

function removeTagByIndex(idx) {
  if (!state.descriptionState.tags || idx < 0 || idx >= state.descriptionState.tags.length) return;
  const removed = state.descriptionState.tags.splice(idx, 1);
  renderTagsCloud();
  if (removed && removed[0]) {
    showToast(`Đã xóa tag "${removed[0].text}"`, 'info', 1000);
  }
}

function addCustomTagFromInput() {
  if (!DOM.inputAddCustomTag) return;
  const rawTag = DOM.inputAddCustomTag.value.trim().replace(/^#/, '');
  if (!rawTag) {
    DOM.inputAddCustomTag.focus();
    return;
  }

  state.descriptionState.tags = state.descriptionState.tags || [];

  // Check duplicate
  const exists = state.descriptionState.tags.some(t => t.text.toLowerCase() === rawTag.toLowerCase());
  if (exists) {
    showToast(`Tag "${rawTag}" đã tồn tại trong danh sách!`, 'warning', 1800);
    DOM.inputAddCustomTag.focus();
    return;
  }

  // Calculate new length
  const currentJoined = state.descriptionState.tags.map(t => t.text).join(', ');
  const newLength = currentJoined ? (currentJoined.length + 2 + rawTag.length) : rawTag.length;

  if (newLength > 500) {
    showToast(`Không thể thêm! Tổng ký tự sẽ vượt quá 500 (${newLength}/500 ký tự). Vui lòng xóa bớt tag khác!`, 'danger', 2500);
    return;
  }

  state.descriptionState.tags.push({
    text: rawTag,
    score: 75
  });

  DOM.inputAddCustomTag.value = '';
  renderTagsCloud();
  showToast(`Đã thêm tag: "${rawTag}"`, 'success', 1200);
  DOM.inputAddCustomTag.focus();
}

function updateDescOutputCharCount() {
  const text = (DOM.descOutputText?.value || '');
  const len = text.length;
  if (DOM.descCharCountPill) {
    DOM.descCharCountPill.textContent = `${len.toLocaleString('vi-VN')} / 5.000 ký tự`;
    if (len > 5000) {
      DOM.descCharCountPill.classList.add('over-limit');
    } else {
      DOM.descCharCountPill.classList.remove('over-limit');
    }
  }
}

function updateDescTagsCharCount() {
  const tags = state.descriptionState.tags || [];
  const joinedStr = tags.map(t => t.text).join(', ');
  const charLen = joinedStr.length;

  if (DOM.descTagsCharCountPill) {
    DOM.descTagsCharCountPill.textContent = `${charLen} / 500 ký tự`;
    if (charLen > 500) {
      DOM.descTagsCharCountPill.classList.add('over-limit');
    } else {
      DOM.descTagsCharCountPill.classList.remove('over-limit');
    }
  }
}

async function copyDescriptionOnly() {
  const desc = (DOM.descOutputText?.value || '').trim();
  if (!desc) {
    showToast('Chưa có nội dung mô tả để sao chép!', 'warning');
    return;
  }

  try {
    await navigator.clipboard.writeText(desc);
    if (DOM.btnCopyDescOnly) {
      DOM.btnCopyDescOnly.classList.add('copied');
      const span = DOM.btnCopyDescOnly.querySelector('span');
      const originalText = span ? span.textContent : 'Sao chép mô tả';
      if (span) span.textContent = '✓ ĐÃ CHÉP';
      setTimeout(() => {
        DOM.btnCopyDescOnly.classList.remove('copied');
        if (span) span.textContent = originalText;
      }, 1500);
    }
    showToast('Đã sao chép Mô tả SEO vào Clipboard!', 'success', 1500);
  } catch (e) {
    showToast('Không thể sao chép mô tả!', 'danger');
  }
}

async function copyTagsOnly() {
  const tags = state.descriptionState.tags || [];
  if (tags.length === 0) {
    showToast('Chưa có tags để sao chép!', 'warning');
    return;
  }

  const tagsString = tags.map(t => t.text).join(', ');

  try {
    await navigator.clipboard.writeText(tagsString);
    if (DOM.btnCopyTagsOnly) {
      DOM.btnCopyTagsOnly.classList.add('copied');
      const span = DOM.btnCopyTagsOnly.querySelector('span');
      const originalText = span ? span.textContent : 'COPY';
      if (span) span.textContent = '✓ COPIED';
      setTimeout(() => {
        DOM.btnCopyTagsOnly.classList.remove('copied');
        if (span) span.textContent = originalText;
      }, 1500);
    }
    showToast(`Đã sao chép ${tags.length} Tags (${tagsString.length}/500 ký tự - chuẩn YouTube Studio)!`, 'success', 2000);
  } catch (e) {
    showToast('Không thể sao chép danh sách tags!', 'danger');
  }
}

async function copyAllDescAndTags() {
  const desc = (DOM.descOutputText?.value || '').trim();
  const tags = state.descriptionState.tags || [];

  if (!desc && tags.length === 0) {
    showToast('Chưa có kết quả để sao chép!', 'warning');
    return;
  }

  const tagsString = tags.map(t => t.text).join(', ');
  const fullContent = `--- MÔ TẢ YOUTUBE (SEO DESCRIPTION) ---
${desc}

--- TAGS YOUTUBE VIDIQ (${tagsString.length}/500 KÝ TỰ) ---
${tagsString}`;

  try {
    await navigator.clipboard.writeText(fullContent);
    if (DOM.btnCopyAllDescAndTags) {
      DOM.btnCopyAllDescAndTags.classList.add('copied');
      const span = DOM.btnCopyAllDescAndTags.querySelector('span');
      const orig = span ? span.textContent : 'Sao chép toàn bộ';
      if (span) span.textContent = '✓ ĐÃ SAO CHÉP TOÀN BỘ';
      setTimeout(() => {
        DOM.btnCopyAllDescAndTags.classList.remove('copied');
        if (span) span.textContent = orig;
      }, 1800);
    }
    showToast('Đã sao chép toàn bộ Mô tả & Tags vào Clipboard!', 'success', 2000);
  } catch (e) {
    showToast('Không thể sao chép toàn bộ!', 'danger');
  }
}

// Start Application
window.addEventListener('DOMContentLoaded', initApp);

