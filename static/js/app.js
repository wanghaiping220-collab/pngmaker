/**
 * PNG Batch Generator - Frontend Application
 */

// ===== State Management =====
const state = {
    canvas: {
        width: 1080,
        height: 1920,
        backgroundColor: null
    },
    primary: {
        enabled: true,
        text: '小鹏P7+挑战多米诺车位',
        font: 'msyh',
        size: 64,
        color: '#FF6600',
        x: null,
        y: 100,
        align: 'center',
        bold: true,
        italic: false,
        stroke: { enabled: false, color: '#000000', width: 2 },
        shadow: { enabled: false, color: '#333333', blur: 2, x: 3, y: 3 },
        bgBlock: { enabled: false, color: '#FFFF00', opacity: 200, paddingX: 20, paddingY: 10, radius: 8 }
    },
    secondary: {
        enabled: true,
        text: '从一穷二白到反客为主\n只用了几十年',
        font: 'msyh',
        size: 52,
        color: '#1E90FF',
        x: null,
        y: 200,
        align: 'center',
        bold: true,
        italic: true,
        stroke: { enabled: false, color: '#000000', width: 2 },
        shadow: { enabled: false, color: '#333333', blur: 2, x: 3, y: 3 },
        bgBlock: { enabled: false, color: '#FFFF00', opacity: 200, paddingX: 20, paddingY: 10, radius: 8 }
    },
    tertiary: {
        enabled: false,
        text: '',
        font: 'msyh',
        size: 42,
        color: '#1E90FF',
        x: null,
        y: 350,
        align: 'center',
        bold: false,
        italic: false,
        stroke: { enabled: false, color: '#000000', width: 2 },
        shadow: { enabled: false, color: '#333333', blur: 2, x: 3, y: 3 },
        bgBlock: { enabled: false, color: '#FFFF00', opacity: 200, paddingX: 20, paddingY: 10, radius: 8 }
    },
    body: {
        enabled: true,
        text: '以前觉得这种高科技离我们很远，\n现在看着老外惊叹的表情，\n才发现轻舟已过万重山了。',
        font: 'msyh',
        size: 42,
        color: '#FF6600',
        x: null,
        y: 1400,
        align: 'center',
        bold: false,
        italic: true,
        stroke: { enabled: false, color: '#000000', width: 2 },
        shadow: { enabled: false, color: '#333333', blur: 2, x: 3, y: 3 },
        bgBlock: { enabled: false, color: '#FFFF00', opacity: 200, paddingX: 20, paddingY: 10, radius: 8 }
    },
    output: {
        filename: 'output.png'
    },
    zoom: 0.5,
    batchData: [],
    templates: [],
    presetTemplates: [],
    systemFonts: [],
    history: [],
    safeZone: {
        enabled: false,
        platform: 'douyin',
        config: null
    }
};

// Safe zone configurations
const SAFE_ZONES = {
    douyin: {
        name: '抖音',
        width: 1080,
        height: 1920,
        topBar: 150,
        bottomBar: 200,
        rightIcons: 100,
        safeTop: 200,
        safeBottom: 300,
        safeRight: 120
    },
    shipinhao: {
        name: '视频号',
        width: 1080,
        height: 1920,
        topBar: 120,
        bottomBar: 180,
        rightIcons: 80,
        safeTop: 180,
        safeBottom: 280,
        safeRight: 100
    },
    xiaohongshu: {
        name: '小红书',
        width: 1080,
        height: 1440,
        topBar: 100,
        bottomBar: 160,
        rightIcons: 60,
        safeTop: 150,
        safeBottom: 220,
        safeRight: 80
    },
    kuaishou: {
        name: '快手',
        width: 1080,
        height: 1920,
        topBar: 140,
        bottomBar: 190,
        rightIcons: 90,
        safeTop: 190,
        safeBottom: 290,
        safeRight: 110
    },
    bilibili: {
        name: 'B站',
        width: 1080,
        height: 1920,
        topBar: 130,
        bottomBar: 170,
        rightIcons: 70,
        safeTop: 180,
        safeBottom: 250,
        safeRight: 90
    },
    tiktok: {
        name: 'TikTok',
        width: 1080,
        height: 1920,
        topBar: 150,
        bottomBar: 200,
        rightIcons: 100,
        safeTop: 200,
        safeBottom: 300,
        safeRight: 120
    },
    instagram_story: {
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        topBar: 120,
        bottomBar: 150,
        rightIcons: 60,
        safeTop: 180,
        safeBottom: 220,
        safeRight: 80
    },
    instagram_post: {
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        topBar: 0,
        bottomBar: 100,
        rightIcons: 0,
        safeTop: 50,
        safeBottom: 150,
        safeRight: 50
    },
    youtube_shorts: {
        name: 'YouTube Shorts',
        width: 1080,
        height: 1920,
        topBar: 100,
        bottomBar: 200,
        rightIcons: 80,
        safeTop: 150,
        safeBottom: 280,
        safeRight: 100
    },
    wechat_moments: {
        name: '朋友圈',
        width: 1080,
        height: 1440,
        topBar: 0,
        bottomBar: 80,
        rightIcons: 0,
        safeTop: 50,
        safeBottom: 120,
        safeRight: 50
    }
};

// ===== API Configuration =====
const API_BASE = '';

// ===== DOM Elements =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCanvasControls();
    initPlatformPresets();
    initSafeZoneControls();
    initTextControls();
    initPreviewControls();
    initGenerateControls();
    initBatchControls();
    initTemplates();
    initHistory();
    initModals();
    loadSystemFonts();
    loadPresetTemplates();

    // Initial preview update
    updatePreview();

    // Load saved templates and history
    loadTemplates();
    loadHistory();
});

// ===== Navigation =====
function initNavigation() {
    $$('.nav-item[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            // Update nav buttons
            $$('.nav-item[data-tab]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update tab content
            $$('.tab-content').forEach(content => content.classList.remove('active'));
            $(`#tab-${tab}`).classList.add('active');
        });
    });

    // Section collapse
    $$('.section-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't collapse if clicking on toggle switch
            if (e.target.closest('.switch')) return;

            const section = header.nextElementSibling;
            if (section && section.classList.contains('section-content')) {
                section.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            }
        });
    });
}

// ===== Platform Presets =====
function initPlatformPresets() {
    const platformSelect = $('#platformPreset');
    if (platformSelect) {
        platformSelect.addEventListener('change', (e) => {
            const platform = e.target.value;
            if (SAFE_ZONES[platform]) {
                const config = SAFE_ZONES[platform];
                state.canvas.width = config.width;
                state.canvas.height = config.height;
                state.safeZone.platform = platform;
                state.safeZone.config = config;

                // Update UI
                $('#canvasWidth').value = config.width;
                $('#canvasHeight').value = config.height;
                $('#presetSize').value = 'custom';

                updatePreview();
                updateSafeZoneOverlay();
            }
        });
    }
}

// ===== Safe Zone Controls =====
function initSafeZoneControls() {
    const showSafeZone = $('#showSafeZone');
    if (showSafeZone) {
        showSafeZone.addEventListener('change', (e) => {
            state.safeZone.enabled = e.target.checked;
            updateSafeZoneOverlay();
        });
    }

    // Initialize with default platform
    state.safeZone.config = SAFE_ZONES['douyin'];
}

function updateSafeZoneOverlay() {
    const overlay = $('#safeZoneOverlay');
    if (!overlay) return;

    if (state.safeZone.enabled && state.safeZone.config) {
        overlay.classList.add('active');
        const config = state.safeZone.config;
        const { width, height } = state.canvas;

        // Calculate percentages for the safe zones
        const topPercent = (config.safeTop / height) * 100;
        const bottomPercent = (config.safeBottom / height) * 100;
        const rightPercent = (config.safeRight / width) * 100;

        // Update safe zone elements
        const szTop = $('#szTop');
        const szBottom = $('#szBottom');
        const szRight = $('#szRight');

        if (szTop) {
            szTop.style.top = '0';
            szTop.style.left = '0';
            szTop.style.right = '0';
            szTop.style.height = `${topPercent}%`;
        }

        if (szBottom) {
            szBottom.style.bottom = '0';
            szBottom.style.left = '0';
            szBottom.style.right = '0';
            szBottom.style.height = `${bottomPercent}%`;
        }

        if (szRight) {
            szRight.style.top = `${topPercent}%`;
            szRight.style.right = '0';
            szRight.style.width = `${rightPercent}%`;
            szRight.style.bottom = `${bottomPercent}%`;
        }
    } else {
        overlay.classList.remove('active');
    }
}

// ===== Canvas Controls =====
function initCanvasControls() {
    // Width & Height
    $('#canvasWidth').addEventListener('input', (e) => {
        state.canvas.width = parseInt(e.target.value) || 1080;
        $('#presetSize').value = 'custom';
        updatePreview();
        updateSafeZoneOverlay();
    });

    $('#canvasHeight').addEventListener('input', (e) => {
        state.canvas.height = parseInt(e.target.value) || 1920;
        $('#presetSize').value = 'custom';
        updatePreview();
        updateSafeZoneOverlay();
    });

    // Preset sizes
    $('#presetSize').addEventListener('change', (e) => {
        if (e.target.value !== 'custom') {
            const [w, h] = e.target.value.split('x').map(Number);
            state.canvas.width = w;
            state.canvas.height = h;
            $('#canvasWidth').value = w;
            $('#canvasHeight').value = h;
            updatePreview();
            updateSafeZoneOverlay();
        }
    });

    // Background toggle
    $$('.bg-option').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.bg-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.bg === 'transparent') {
                state.canvas.backgroundColor = null;
                $('#bgColor').classList.add('hidden');
            } else {
                state.canvas.backgroundColor = $('#bgColor').value;
                $('#bgColor').classList.remove('hidden');
            }
            updatePreview();
        });
    });

    $('#bgColor').addEventListener('input', (e) => {
        state.canvas.backgroundColor = e.target.value;
        updatePreview();
    });
}

// ===== System Fonts =====
async function loadSystemFonts() {
    try {
        const response = await fetch(`${API_BASE}/fonts/scan`);
        const data = await response.json();

        if (data.fonts && data.fonts.length > 0) {
            state.systemFonts = data.fonts;
            updateFontSelects();
        }
    } catch (error) {
        console.error('Failed to load system fonts:', error);
    }
}

function updateFontSelects() {
    const sections = ['primary', 'secondary', 'tertiary', 'body'];

    sections.forEach(section => {
        const select = $(`#${section}Font`);
        if (!select) return;

        // Clear existing options except built-in ones
        const builtInOptions = select.querySelectorAll('optgroup:first-child option, option:not(optgroup option)');

        // Add system fonts optgroup
        let systemGroup = select.querySelector('optgroup[label="系统字体"]');
        if (!systemGroup) {
            systemGroup = document.createElement('optgroup');
            systemGroup.label = '系统字体';
            select.appendChild(systemGroup);
        }

        // Clear and repopulate system fonts
        systemGroup.innerHTML = '';

        // Separate CJK and other fonts
        const cjkFonts = state.systemFonts.filter(f => f.has_cjk);
        const otherFonts = state.systemFonts.filter(f => !f.has_cjk);

        // Add CJK fonts first
        if (cjkFonts.length > 0) {
            const cjkGroup = document.createElement('optgroup');
            cjkGroup.label = '中文字体';
            cjkFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font.path;
                option.textContent = font.name;
                cjkGroup.appendChild(option);
            });
            select.appendChild(cjkGroup);
        }

        // Add other fonts
        if (otherFonts.length > 0) {
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = '其他字体';
            otherFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font.path;
                option.textContent = font.name;
                otherGroup.appendChild(option);
            });
            select.appendChild(otherGroup);
        }
    });
}

// ===== Preset Templates =====
async function loadPresetTemplates() {
    try {
        const response = await fetch(`${API_BASE}/templates/presets`);
        const data = await response.json();

        if (data.presets && data.presets.length > 0) {
            state.presetTemplates = data.presets;
            renderPresetTemplates();
        }
    } catch (error) {
        console.error('Failed to load preset templates:', error);
    }
}

function renderPresetTemplates() {
    const container = $('#presetList');
    if (!container) return;

    if (state.presetTemplates.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无预设模板</div>';
        return;
    }

    container.innerHTML = state.presetTemplates.map((preset, index) => `
        <div class="preset-item" onclick="applyPresetTemplate(${index})">
            <div class="preset-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
            </div>
            <div class="preset-info">
                <div class="preset-name">${preset.name}</div>
                <div class="preset-desc">${preset.description || ''}</div>
            </div>
        </div>
    `).join('');
}

window.applyPresetTemplate = function(index) {
    const preset = state.presetTemplates[index];
    if (!preset || !preset.config) return;

    const config = preset.config;

    // Apply canvas settings
    if (config.canvas) {
        state.canvas.width = config.canvas.width || 1080;
        state.canvas.height = config.canvas.height || 1920;
        state.canvas.backgroundColor = config.canvas.background_color || null;
    }

    // Apply text sections
    applyPresetTextConfig('primary', config.title_primary);
    applyPresetTextConfig('secondary', config.title_secondary);
    applyPresetTextConfig('tertiary', config.title_tertiary);
    applyPresetTextConfig('body', config.body_text);

    // Update UI
    syncUIFromState();
    updatePreview();

    // Switch to single tab
    const singleTab = $('.nav-item[data-tab="single"]');
    if (singleTab) singleTab.click();

    showToast(`已应用预设: ${preset.name}`, 'success');
};

function applyPresetTextConfig(section, config) {
    if (!config) {
        state[section].enabled = false;
        return;
    }

    state[section].enabled = true;
    state[section].text = config.text || '';
    state[section].font = config.font_family || 'msyh';
    state[section].size = config.font_size || 48;
    state[section].color = config.color || '#000000';
    state[section].x = config.position_x || null;
    state[section].y = config.position_y || 100;
    state[section].align = config.align || 'center';
    state[section].bold = config.font_weight === 'bold';
    state[section].italic = config.italic || false;

    // Stroke
    if (config.stroke) {
        state[section].stroke = {
            enabled: config.stroke.enabled || false,
            color: config.stroke.color || '#000000',
            width: config.stroke.width || 2
        };
    }

    // Shadow
    if (config.shadow) {
        state[section].shadow = {
            enabled: config.shadow.enabled || false,
            color: config.shadow.color || '#333333',
            blur: config.shadow.blur || 2,
            x: config.shadow.offset_x || 3,
            y: config.shadow.offset_y || 3
        };
    }

    // Background block
    if (config.background_block) {
        state[section].bgBlock = {
            enabled: config.background_block.enabled || false,
            color: config.background_block.color || '#FFFF00',
            opacity: config.background_block.opacity || 200,
            paddingX: config.background_block.padding_x || 20,
            paddingY: config.background_block.padding_y || 10,
            radius: config.background_block.border_radius || 8
        };
    }
}

// ===== Text Controls =====
function initTextControls() {
    const sections = ['primary', 'secondary', 'tertiary', 'body'];

    sections.forEach(section => {
        // Enable toggle
        const enableCheckbox = $(`#${section}Enabled`);
        if (enableCheckbox) {
            enableCheckbox.addEventListener('change', (e) => {
                state[section].enabled = e.target.checked;
                updatePreview();
            });
        }

        // Text content
        const textArea = $(`#${section}Text`);
        if (textArea) {
            textArea.addEventListener('input', (e) => {
                state[section].text = e.target.value;
                updatePreview();
            });
        }

        // Font
        const fontSelect = $(`#${section}Font`);
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                state[section].font = e.target.value;
                updatePreview();
            });
        }

        // Size
        const sizeInput = $(`#${section}Size`);
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                state[section].size = parseInt(e.target.value) || 48;
                updatePreview();
            });
        }

        // Color
        const colorInput = $(`#${section}Color`);
        const colorText = $(`#${section}ColorText`);
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                state[section].color = e.target.value.toUpperCase();
                if (colorText) colorText.value = e.target.value.toUpperCase();
                updatePreview();
            });
        }
        if (colorText) {
            colorText.addEventListener('input', (e) => {
                const color = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                    state[section].color = color.toUpperCase();
                    if (colorInput) colorInput.value = color;
                    updatePreview();
                }
            });
        }

        // X position
        const xInput = $(`#${section}X`);
        if (xInput) {
            xInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                state[section].x = val === '' ? null : parseInt(val);
                updatePreview();
            });
        }

        // Y position
        const yInput = $(`#${section}Y`);
        if (yInput) {
            yInput.addEventListener('input', (e) => {
                state[section].y = parseInt(e.target.value) || 0;
                updatePreview();
            });
        }

        // Align buttons
        $$(`[data-target="${section}"][data-align]`).forEach(btn => {
            btn.addEventListener('click', () => {
                $$(`[data-target="${section}"][data-align]`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[section].align = btn.dataset.align;
                updatePreview();
            });
        });

        // Style buttons
        $$(`[data-target="${section}"][data-style]`).forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const style = btn.dataset.style;
                state[section][style] = btn.classList.contains('active');
                updatePreview();
            });
        });

        // Advanced effects - Initialize for ALL sections
        initAdvancedEffects(section);
    });

    // Output filename
    $('#outputFilename').addEventListener('input', (e) => {
        state.output.filename = e.target.value || 'output.png';
    });
}

function initAdvancedEffects(section) {
    // Stroke
    const strokeEnabled = $(`#${section}StrokeEnabled`);
    if (strokeEnabled) {
        strokeEnabled.addEventListener('change', (e) => {
            state[section].stroke.enabled = e.target.checked;
            updatePreview();
        });
    }

    const strokeColor = $(`#${section}StrokeColor`);
    if (strokeColor) {
        strokeColor.addEventListener('input', (e) => {
            state[section].stroke.color = e.target.value;
            updatePreview();
        });
    }

    const strokeWidth = $(`#${section}StrokeWidth`);
    if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
            state[section].stroke.width = parseInt(e.target.value) || 2;
            updatePreview();
        });
    }

    // Shadow
    const shadowEnabled = $(`#${section}ShadowEnabled`);
    if (shadowEnabled) {
        shadowEnabled.addEventListener('change', (e) => {
            state[section].shadow.enabled = e.target.checked;
            updatePreview();
        });
    }

    const shadowColor = $(`#${section}ShadowColor`);
    if (shadowColor) {
        shadowColor.addEventListener('input', (e) => {
            state[section].shadow.color = e.target.value;
            updatePreview();
        });
    }

    const shadowBlur = $(`#${section}ShadowBlur`);
    if (shadowBlur) {
        shadowBlur.addEventListener('input', (e) => {
            state[section].shadow.blur = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }

    const shadowX = $(`#${section}ShadowX`);
    if (shadowX) {
        shadowX.addEventListener('input', (e) => {
            state[section].shadow.x = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }

    const shadowY = $(`#${section}ShadowY`);
    if (shadowY) {
        shadowY.addEventListener('input', (e) => {
            state[section].shadow.y = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }

    // Background block
    const bgBlockEnabled = $(`#${section}BgBlockEnabled`);
    if (bgBlockEnabled) {
        bgBlockEnabled.addEventListener('change', (e) => {
            state[section].bgBlock.enabled = e.target.checked;
            updatePreview();
        });
    }

    const bgBlockColor = $(`#${section}BgBlockColor`);
    if (bgBlockColor) {
        bgBlockColor.addEventListener('input', (e) => {
            state[section].bgBlock.color = e.target.value;
            updatePreview();
        });
    }

    const bgBlockOpacity = $(`#${section}BgBlockOpacity`);
    if (bgBlockOpacity) {
        bgBlockOpacity.addEventListener('input', (e) => {
            state[section].bgBlock.opacity = parseInt(e.target.value);
            updatePreview();
        });
    }

    const bgBlockPaddingX = $(`#${section}BgBlockPaddingX`);
    if (bgBlockPaddingX) {
        bgBlockPaddingX.addEventListener('input', (e) => {
            state[section].bgBlock.paddingX = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }

    const bgBlockPaddingY = $(`#${section}BgBlockPaddingY`);
    if (bgBlockPaddingY) {
        bgBlockPaddingY.addEventListener('input', (e) => {
            state[section].bgBlock.paddingY = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }

    const bgBlockRadius = $(`#${section}BgBlockRadius`);
    if (bgBlockRadius) {
        bgBlockRadius.addEventListener('input', (e) => {
            state[section].bgBlock.radius = parseInt(e.target.value) || 0;
            updatePreview();
        });
    }
}

// ===== Preview Controls =====
function initPreviewControls() {
    // Zoom controls
    $('#zoomIn').addEventListener('click', () => {
        state.zoom = Math.min(state.zoom + 0.1, 2);
        updatePreviewZoom();
    });

    $('#zoomOut').addEventListener('click', () => {
        state.zoom = Math.max(state.zoom - 0.1, 0.1);
        updatePreviewZoom();
    });

    $('#resetView').addEventListener('click', () => {
        state.zoom = 0.5;
        updatePreviewZoom();
    });

    // Refresh preview button
    $('#previewBtn').addEventListener('click', updatePreview);
}

function updatePreviewZoom() {
    const canvas = $('#previewCanvas');
    canvas.style.transform = `scale(${state.zoom})`;
    $('#zoomLevel').textContent = `${Math.round(state.zoom * 100)}%`;
}

function updatePreview() {
    const canvas = $('#previewCanvas');
    const { width, height, backgroundColor } = state.canvas;

    // Update canvas size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Update background
    if (backgroundColor) {
        canvas.classList.remove('transparent');
        canvas.style.backgroundColor = backgroundColor;
    } else {
        canvas.classList.add('transparent');
        canvas.style.backgroundColor = '';
    }

    // Update dimensions display
    $('#previewDimensions').textContent = `${width} × ${height}`;

    // Update text elements
    updateTextPreview('primary', '#preview-primary');
    updateTextPreview('secondary', '#preview-secondary');
    updateTextPreview('tertiary', '#preview-tertiary');
    updateTextPreview('body', '#preview-body');

    // Update safe zone overlay
    updateSafeZoneOverlay();

    // Auto-fit zoom
    fitPreviewToContainer();
}

function updateTextPreview(sectionKey, elementSelector) {
    const element = $(elementSelector);
    const config = state[sectionKey];

    if (!config.enabled || !config.text) {
        element.style.display = 'none';
        return;
    }

    element.style.display = 'block';
    element.textContent = config.text;

    // Position
    element.style.top = `${config.y}px`;

    // Handle X position
    if (config.x !== null && config.x !== undefined) {
        element.style.left = `${config.x}px`;
        element.style.right = 'auto';
        element.style.transform = 'none';
    } else {
        element.style.left = '0';
        element.style.right = '0';
    }

    // Font
    element.style.fontSize = `${config.size}px`;
    element.style.color = config.color;
    element.style.fontWeight = config.bold ? 'bold' : 'normal';
    element.style.fontStyle = config.italic ? 'italic' : 'normal';

    // Align
    element.style.textAlign = config.align;
    if (config.x === null || config.x === undefined) {
        if (config.align === 'left') {
            element.style.paddingLeft = '50px';
            element.style.paddingRight = '0';
        } else if (config.align === 'right') {
            element.style.paddingLeft = '0';
            element.style.paddingRight = '50px';
        } else {
            element.style.paddingLeft = '0';
            element.style.paddingRight = '0';
        }
    } else {
        element.style.paddingLeft = '0';
        element.style.paddingRight = '0';
    }

    // Effects
    let textShadow = [];

    if (config.shadow && config.shadow.enabled) {
        textShadow.push(`${config.shadow.x}px ${config.shadow.y}px ${config.shadow.blur}px ${config.shadow.color}`);
    }

    if (config.stroke && config.stroke.enabled) {
        // Simulate stroke with multiple shadows
        const w = config.stroke.width;
        const c = config.stroke.color;
        textShadow.push(
            `${w}px 0 0 ${c}`,
            `-${w}px 0 0 ${c}`,
            `0 ${w}px 0 ${c}`,
            `0 -${w}px 0 ${c}`
        );
    }

    element.style.textShadow = textShadow.join(', ') || 'none';

    // Background block (simplified for preview)
    if (config.bgBlock && config.bgBlock.enabled) {
        const opacity = Math.round(config.bgBlock.opacity / 255 * 100) / 100;
        const rgb = hexToRgb(config.bgBlock.color);
        element.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        element.style.padding = `${config.bgBlock.paddingY}px ${config.bgBlock.paddingX}px`;
        element.style.borderRadius = `${config.bgBlock.radius}px`;
        element.style.display = 'inline-block';

        if (config.x === null || config.x === undefined) {
            element.style.left = '50%';
            element.style.right = 'auto';
            element.style.transform = 'translateX(-50%)';
        }
    } else {
        element.style.backgroundColor = 'transparent';
        element.style.padding = '0';
        element.style.borderRadius = '0';
        if (config.x === null || config.x === undefined) {
            element.style.transform = 'none';
        }
    }
}

function fitPreviewToContainer() {
    const container = $('#previewContainer');
    const canvas = $('#previewCanvas');

    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / state.canvas.width;
    const scaleY = containerHeight / state.canvas.height;
    const scale = Math.min(scaleX, scaleY, 1);

    state.zoom = scale;
    updatePreviewZoom();
}

// ===== Generate Controls =====
function initGenerateControls() {
    $('#generateBtn').addEventListener('click', generateImage);
}

async function generateImage() {
    showLoading('生成图片中...');

    try {
        const config = buildConfig();
        const response = await fetch(`${API_BASE}/generate/base64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const result = await response.json();

        if (result.success) {
            // Create download
            downloadBase64Image(result.image_base64, state.output.filename);

            // Add to history
            addToHistory({
                filename: state.output.filename,
                thumbnail: result.image_base64,
                config: config,
                timestamp: new Date().toISOString()
            });

            showToast('图片生成成功！', 'success');
        } else {
            showToast('生成失败: ' + (result.detail || '未知错误'), 'error');
        }
    } catch (error) {
        console.error('Generate error:', error);
        showToast('生成失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function buildConfig() {
    const config = {
        canvas: {
            width: state.canvas.width,
            height: state.canvas.height,
            background_color: state.canvas.backgroundColor
        },
        output_filename: state.output.filename
    };

    // Primary title
    if (state.primary.enabled && state.primary.text) {
        config.title_primary = buildTextConfig(state.primary);
    }

    // Secondary title
    if (state.secondary.enabled && state.secondary.text) {
        config.title_secondary = buildTextConfig(state.secondary);
    }

    // Tertiary title
    if (state.tertiary.enabled && state.tertiary.text) {
        config.title_tertiary = buildTextConfig(state.tertiary);
    }

    // Body
    if (state.body.enabled && state.body.text) {
        config.body_text = buildTextConfig(state.body);
    }

    return config;
}

function buildTextConfig(textState) {
    const config = {
        text: textState.text,
        font_family: textState.font,
        font_size: textState.size,
        font_weight: textState.bold ? 'bold' : 'normal',
        color: textState.color,
        position_y: textState.y,
        align: textState.align,
        italic: textState.italic
    };

    // X position
    if (textState.x !== null && textState.x !== undefined) {
        config.position_x = textState.x;
    }

    // Stroke
    if (textState.stroke && textState.stroke.enabled) {
        config.stroke = {
            enabled: true,
            color: textState.stroke.color,
            width: textState.stroke.width
        };
    }

    // Shadow
    if (textState.shadow && textState.shadow.enabled) {
        config.shadow = {
            enabled: true,
            color: textState.shadow.color,
            blur: textState.shadow.blur,
            offset_x: textState.shadow.x,
            offset_y: textState.shadow.y
        };
    }

    // Background block
    if (textState.bgBlock && textState.bgBlock.enabled) {
        config.background_block = {
            enabled: true,
            color: textState.bgBlock.color,
            opacity: textState.bgBlock.opacity,
            padding_x: textState.bgBlock.paddingX,
            padding_y: textState.bgBlock.paddingY,
            border_radius: textState.bgBlock.radius
        };
    }

    return config;
}

// ===== Batch Controls =====
function initBatchControls() {
    // Input tabs
    $$('.input-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.input-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            $$('.input-content').forEach(c => c.classList.remove('active'));
            $(`#${tab.dataset.input}-input`).classList.add('active');
        });
    });

    // Parse data
    $('#parseDataBtn').addEventListener('click', parseData);

    // Batch generate
    $('#batchGenerateBtn').addEventListener('click', batchGenerate);
}

function parseData() {
    const activeTab = $('.input-tab.active').dataset.input;

    try {
        if (activeTab === 'csv') {
            parseCsvData();
        } else {
            parseJsonData();
        }
    } catch (error) {
        showToast('解析失败: ' + error.message, 'error');
    }
}

function parseCsvData() {
    const csvText = $('#csvData').value.trim();
    if (!csvText) {
        showToast('请输入CSV数据', 'warning');
        return;
    }

    const lines = csvText.split('\n').filter(line => line.trim());
    const prefix = $('#batchPrefix').value || 'batch_';

    state.batchData = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        return {
            title_primary: parts[0] || '',
            title_secondary: parts[1] || '',
            title_tertiary: parts[2] || '',
            body: parts[3] || '',
            filename: parts[4] || `${prefix}${String(index + 1).padStart(3, '0')}.png`
        };
    });

    renderBatchList();
}

function parseJsonData() {
    const jsonText = $('#jsonData').value.trim();
    if (!jsonText) {
        showToast('请输入JSON数据', 'warning');
        return;
    }

    const data = JSON.parse(jsonText);
    if (!Array.isArray(data)) {
        throw new Error('JSON必须是数组格式');
    }

    const prefix = $('#batchPrefix').value || 'batch_';

    state.batchData = data.map((item, index) => ({
        title_primary: item.title_primary || item.title || '',
        title_secondary: item.title_secondary || item.subtitle || '',
        title_tertiary: item.title_tertiary || '',
        body: item.body || item.content || '',
        filename: item.filename || `${prefix}${String(index + 1).padStart(3, '0')}.png`
    }));

    renderBatchList();
}

function renderBatchList() {
    const list = $('#batchList');

    if (state.batchData.length === 0) {
        list.innerHTML = `
            <div class="batch-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <p>在左侧输入数据后点击"解析数据"</p>
            </div>
        `;
        $('#batchCount').textContent = '0 张图片待生成';
        $('#batchGenerateBtn').disabled = true;
        return;
    }

    list.innerHTML = state.batchData.map((item, index) => `
        <div class="batch-item">
            <div class="batch-item-number">${index + 1}</div>
            <div class="batch-item-content">
                <div class="batch-item-title">${item.title_primary || '(无标题)'}</div>
                <div class="batch-item-filename">${item.filename}</div>
            </div>
        </div>
    `).join('');

    $('#batchCount').textContent = `${state.batchData.length} 张图片待生成`;
    $('#batchGenerateBtn').disabled = false;
}

async function batchGenerate() {
    if (state.batchData.length === 0) {
        showToast('请先解析数据', 'warning');
        return;
    }

    showLoading(`批量生成中... 0/${state.batchData.length}`);

    try {
        const baseConfig = buildConfig();
        const results = [];

        for (let i = 0; i < state.batchData.length; i++) {
            const item = state.batchData[i];
            $('#loadingText').textContent = `批量生成中... ${i + 1}/${state.batchData.length}`;

            // Build config for this item
            const config = JSON.parse(JSON.stringify(baseConfig));

            if (item.title_primary) {
                config.title_primary = config.title_primary || buildTextConfig(state.primary);
                config.title_primary.text = item.title_primary;
            }

            if (item.title_secondary) {
                config.title_secondary = config.title_secondary || buildTextConfig(state.secondary);
                config.title_secondary.text = item.title_secondary;
            }

            if (item.title_tertiary) {
                config.title_tertiary = config.title_tertiary || buildTextConfig(state.tertiary);
                config.title_tertiary.text = item.title_tertiary;
            }

            if (item.body) {
                config.body_text = config.body_text || buildTextConfig(state.body);
                config.body_text.text = item.body;
            }

            config.output_filename = item.filename;

            // Generate
            const response = await fetch(`${API_BASE}/generate/base64`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const result = await response.json();

            if (result.success) {
                results.push({
                    filename: item.filename,
                    base64: result.image_base64
                });
            }
        }

        // Download all as zip or individually
        if (results.length === 1) {
            downloadBase64Image(results[0].base64, results[0].filename);
        } else if (results.length > 1) {
            // Download each file with a small delay
            for (const result of results) {
                downloadBase64Image(result.base64, result.filename);
                await sleep(200);
            }
        }

        showToast(`成功生成 ${results.length} 张图片！`, 'success');
    } catch (error) {
        console.error('Batch generate error:', error);
        showToast('批量生成失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ===== Templates =====
function initTemplates() {
    $('#saveTemplateBtn').addEventListener('click', () => {
        showModal('保存模板', `
            <div class="form-group">
                <label>模板名称</label>
                <input type="text" id="templateName" placeholder="输入模板名称...">
            </div>
        `, [
            { text: '取消', class: 'btn-secondary', action: hideModal },
            { text: '保存', class: 'btn-primary', action: saveTemplate }
        ]);
    });

    $('#loadTemplateBtn').addEventListener('click', () => {
        if (state.templates.length === 0) {
            showToast('暂无保存的模板', 'warning');
            return;
        }

        const options = state.templates.map((t, i) =>
            `<option value="${i}">${t.name}</option>`
        ).join('');

        showModal('加载模板', `
            <div class="form-group">
                <label>选择模板</label>
                <select id="templateSelect">
                    ${options}
                </select>
            </div>
        `, [
            { text: '取消', class: 'btn-secondary', action: hideModal },
            { text: '加载', class: 'btn-primary', action: loadTemplate }
        ]);
    });

    // Download template button
    const downloadBtn = $('#downloadTemplateBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCurrentTemplate);
    }

    // Upload template button
    const uploadBtn = $('#uploadTemplateBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    uploadTemplate(file);
                }
            };
            input.click();
        });
    }

    $('#createTemplateBtn').addEventListener('click', () => {
        // Switch to single tab and save
        $('.nav-item[data-tab="single"]').click();
        setTimeout(() => $('#saveTemplateBtn').click(), 100);
    });
}

function downloadCurrentTemplate() {
    const template = {
        name: state.output.filename.replace('.png', ''),
        config: {
            canvas: { ...state.canvas },
            primary: { ...state.primary },
            secondary: { ...state.secondary },
            tertiary: { ...state.tertiary },
            body: { ...state.body },
            output: { ...state.output }
        },
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('模板已下载', 'success');
}

async function uploadTemplate(file) {
    try {
        const text = await file.text();
        const template = JSON.parse(text);

        if (!template.config) {
            throw new Error('无效的模板文件格式');
        }

        // Apply the template
        if (template.config.canvas) {
            Object.assign(state.canvas, template.config.canvas);
        }
        if (template.config.primary) {
            Object.assign(state.primary, template.config.primary);
        }
        if (template.config.secondary) {
            Object.assign(state.secondary, template.config.secondary);
        }
        if (template.config.tertiary) {
            Object.assign(state.tertiary, template.config.tertiary);
        }
        if (template.config.body) {
            Object.assign(state.body, template.config.body);
        }
        if (template.config.output) {
            Object.assign(state.output, template.config.output);
        }

        // Save to templates list
        state.templates.push(template);
        localStorage.setItem('pnggen_templates', JSON.stringify(state.templates));

        // Update UI
        syncUIFromState();
        updatePreview();
        renderTemplates();

        showToast(`模板 "${template.name}" 已导入`, 'success');
    } catch (error) {
        showToast('导入失败: ' + error.message, 'error');
    }
}

function saveTemplate() {
    const name = $('#templateName').value.trim();
    if (!name) {
        showToast('请输入模板名称', 'warning');
        return;
    }

    const template = {
        name,
        config: JSON.parse(JSON.stringify(state)),
        timestamp: new Date().toISOString()
    };

    state.templates.push(template);
    localStorage.setItem('pnggen_templates', JSON.stringify(state.templates));

    renderTemplates();
    hideModal();
    showToast('模板保存成功！', 'success');
}

function loadTemplate() {
    const index = parseInt($('#templateSelect').value);
    const template = state.templates[index];

    if (template) {
        // Restore state
        Object.assign(state.canvas, template.config.canvas);
        Object.assign(state.primary, template.config.primary);
        Object.assign(state.secondary, template.config.secondary);
        Object.assign(state.tertiary, template.config.tertiary);
        Object.assign(state.body, template.config.body);
        Object.assign(state.output, template.config.output);

        // Update UI
        syncUIFromState();
        updatePreview();

        hideModal();
        showToast('模板加载成功！', 'success');
    }
}

function loadTemplates() {
    const saved = localStorage.getItem('pnggen_templates');
    if (saved) {
        state.templates = JSON.parse(saved);
        renderTemplates();
    }
}

function renderTemplates() {
    const grid = $('#templatesGrid');

    if (state.templates.length === 0) {
        grid.innerHTML = `
            <div class="batch-empty" style="grid-column: 1/-1; height: 300px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6"/>
                </svg>
                <p>暂无保存的模板</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = state.templates.map((template, index) => `
        <div class="template-card">
            <div class="template-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64" style="color: var(--text-muted)">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
            </div>
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <div class="template-date">${formatDate(template.timestamp)}</div>
                <div class="template-actions">
                    <button class="btn btn-secondary" onclick="applyTemplate(${index})">应用</button>
                    <button class="btn btn-ghost" onclick="deleteTemplate(${index})">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.applyTemplate = function(index) {
    const template = state.templates[index];
    if (template) {
        Object.assign(state.canvas, template.config.canvas);
        Object.assign(state.primary, template.config.primary);
        Object.assign(state.secondary, template.config.secondary);
        Object.assign(state.tertiary, template.config.tertiary);
        Object.assign(state.body, template.config.body);
        Object.assign(state.output, template.config.output);

        syncUIFromState();
        updatePreview();

        $('.nav-item[data-tab="single"]').click();
        showToast('模板已应用！', 'success');
    }
};

window.deleteTemplate = function(index) {
    if (confirm('确定要删除此模板吗？')) {
        state.templates.splice(index, 1);
        localStorage.setItem('pnggen_templates', JSON.stringify(state.templates));
        renderTemplates();
        showToast('模板已删除', 'success');
    }
};

function syncUIFromState() {
    // Canvas
    $('#canvasWidth').value = state.canvas.width;
    $('#canvasHeight').value = state.canvas.height;

    // Primary
    syncSectionUI('primary');

    // Secondary
    syncSectionUI('secondary');

    // Tertiary
    syncSectionUI('tertiary');

    // Body
    syncSectionUI('body');

    // Output
    $('#outputFilename').value = state.output.filename;
}

function syncSectionUI(section) {
    const s = state[section];

    const enabled = $(`#${section}Enabled`);
    if (enabled) enabled.checked = s.enabled;

    const text = $(`#${section}Text`);
    if (text) text.value = s.text;

    const font = $(`#${section}Font`);
    if (font) font.value = s.font;

    const size = $(`#${section}Size`);
    if (size) size.value = s.size;

    const color = $(`#${section}Color`);
    if (color) color.value = s.color;

    const colorText = $(`#${section}ColorText`);
    if (colorText) colorText.value = s.color;

    const x = $(`#${section}X`);
    if (x) x.value = s.x !== null ? s.x : '';

    const y = $(`#${section}Y`);
    if (y) y.value = s.y;

    // Align buttons
    $$(`[data-target="${section}"][data-align]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === s.align);
    });

    // Style buttons
    const boldBtn = $(`[data-target="${section}"][data-style="bold"]`);
    if (boldBtn) boldBtn.classList.toggle('active', s.bold);

    const italicBtn = $(`[data-target="${section}"][data-style="italic"]`);
    if (italicBtn) italicBtn.classList.toggle('active', s.italic);

    // Stroke
    const strokeEnabled = $(`#${section}StrokeEnabled`);
    if (strokeEnabled) strokeEnabled.checked = s.stroke?.enabled || false;

    const strokeColor = $(`#${section}StrokeColor`);
    if (strokeColor) strokeColor.value = s.stroke?.color || '#000000';

    const strokeWidth = $(`#${section}StrokeWidth`);
    if (strokeWidth) strokeWidth.value = s.stroke?.width || 2;

    // Shadow
    const shadowEnabled = $(`#${section}ShadowEnabled`);
    if (shadowEnabled) shadowEnabled.checked = s.shadow?.enabled || false;

    const shadowColor = $(`#${section}ShadowColor`);
    if (shadowColor) shadowColor.value = s.shadow?.color || '#333333';

    const shadowBlur = $(`#${section}ShadowBlur`);
    if (shadowBlur) shadowBlur.value = s.shadow?.blur || 2;

    const shadowX = $(`#${section}ShadowX`);
    if (shadowX) shadowX.value = s.shadow?.x || 3;

    const shadowY = $(`#${section}ShadowY`);
    if (shadowY) shadowY.value = s.shadow?.y || 3;

    // Background block
    const bgBlockEnabled = $(`#${section}BgBlockEnabled`);
    if (bgBlockEnabled) bgBlockEnabled.checked = s.bgBlock?.enabled || false;

    const bgBlockColor = $(`#${section}BgBlockColor`);
    if (bgBlockColor) bgBlockColor.value = s.bgBlock?.color || '#FFFF00';

    const bgBlockOpacity = $(`#${section}BgBlockOpacity`);
    if (bgBlockOpacity) bgBlockOpacity.value = s.bgBlock?.opacity || 200;

    const bgBlockPaddingX = $(`#${section}BgBlockPaddingX`);
    if (bgBlockPaddingX) bgBlockPaddingX.value = s.bgBlock?.paddingX || 20;

    const bgBlockPaddingY = $(`#${section}BgBlockPaddingY`);
    if (bgBlockPaddingY) bgBlockPaddingY.value = s.bgBlock?.paddingY || 10;

    const bgBlockRadius = $(`#${section}BgBlockRadius`);
    if (bgBlockRadius) bgBlockRadius.value = s.bgBlock?.radius || 8;
}

// ===== History =====
function initHistory() {
    $('#clearHistoryBtn').addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            state.history = [];
            localStorage.setItem('pnggen_history', JSON.stringify(state.history));
            renderHistory();
            showToast('历史已清空', 'success');
        }
    });
}

function loadHistory() {
    const saved = localStorage.getItem('pnggen_history');
    if (saved) {
        state.history = JSON.parse(saved);
        renderHistory();
    }
}

function addToHistory(item) {
    state.history.unshift(item);
    // Keep only last 50 items
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    localStorage.setItem('pnggen_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    const list = $('#historyList');

    if (state.history.length === 0) {
        list.innerHTML = `
            <div class="batch-empty" style="height: 300px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>暂无生成记录</p>
            </div>
        `;
        return;
    }

    list.innerHTML = state.history.map((item, index) => `
        <div class="history-item">
            <div class="history-thumbnail">
                <img src="data:image/png;base64,${item.thumbnail}" alt="${item.filename}">
            </div>
            <div class="history-details">
                <div class="history-filename">${item.filename}</div>
                <div class="history-meta">${formatDate(item.timestamp)}</div>
                <div class="history-actions">
                    <button class="btn btn-secondary" onclick="downloadHistoryItem(${index})">下载</button>
                    <button class="btn btn-ghost" onclick="reuseHistoryConfig(${index})">复用配置</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.downloadHistoryItem = function(index) {
    const item = state.history[index];
    if (item) {
        downloadBase64Image(item.thumbnail, item.filename);
    }
};

window.reuseHistoryConfig = function(index) {
    const item = state.history[index];
    if (item && item.config) {
        // This is simplified - in full implementation, restore the full config
        showToast('配置已复用', 'success');
        $('.nav-item[data-tab="single"]').click();
    }
};

// ===== Modal =====
function initModals() {
    $('#modalClose').addEventListener('click', hideModal);
    $('#modalOverlay').addEventListener('click', (e) => {
        if (e.target === $('#modalOverlay')) {
            hideModal();
        }
    });
}

function showModal(title, content, buttons = []) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = content;

    const footer = $('#modalFooter');
    footer.innerHTML = '';
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class}`;
        button.textContent = btn.text;
        button.addEventListener('click', btn.action);
        footer.appendChild(button);
    });

    $('#modalOverlay').classList.add('active');
}

function hideModal() {
    $('#modalOverlay').classList.remove('active');
}

// ===== Toast =====
function showToast(message, type = 'info') {
    const container = $('#toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Loading =====
function showLoading(text = '加载中...') {
    $('#loadingText').textContent = text;
    $('#loadingOverlay').classList.add('active');
}

function hideLoading() {
    $('#loadingOverlay').classList.remove('active');
}

// ===== Utility Functions =====
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function downloadBase64Image(base64, filename) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
