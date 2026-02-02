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
    history: []
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
    initTextControls();
    initPreviewControls();
    initGenerateControls();
    initBatchControls();
    initTemplates();
    initHistory();
    initModals();

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

// ===== Canvas Controls =====
function initCanvasControls() {
    // Width & Height
    $('#canvasWidth').addEventListener('input', (e) => {
        state.canvas.width = parseInt(e.target.value) || 1080;
        $('#presetSize').value = 'custom';
        updatePreview();
    });

    $('#canvasHeight').addEventListener('input', (e) => {
        state.canvas.height = parseInt(e.target.value) || 1920;
        $('#presetSize').value = 'custom';
        updatePreview();
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

        // Advanced effects - Primary section only for now
        if (section === 'primary') {
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
    });

    // Output filename
    $('#outputFilename').addEventListener('input', (e) => {
        state.output.filename = e.target.value || 'output.png';
    });
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
    element.style.left = '0';
    element.style.right = '0';

    // Font
    element.style.fontSize = `${config.size}px`;
    element.style.color = config.color;
    element.style.fontWeight = config.bold ? 'bold' : 'normal';
    element.style.fontStyle = config.italic ? 'italic' : 'normal';

    // Align
    element.style.textAlign = config.align;
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
        element.style.left = '50%';
        element.style.right = 'auto';
        element.style.transform = 'translateX(-50%)';
    } else {
        element.style.backgroundColor = 'transparent';
        element.style.padding = '0';
        element.style.borderRadius = '0';
        element.style.transform = 'none';
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

    $('#createTemplateBtn').addEventListener('click', () => {
        // Switch to single tab and save
        $('.nav-item[data-tab="single"]').click();
        setTimeout(() => $('#saveTemplateBtn').click(), 100);
    });
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
    $('#primaryEnabled').checked = state.primary.enabled;
    $('#primaryText').value = state.primary.text;
    $('#primaryFont').value = state.primary.font;
    $('#primarySize').value = state.primary.size;
    $('#primaryColor').value = state.primary.color;
    $('#primaryColorText').value = state.primary.color;
    $('#primaryY').value = state.primary.y;

    // Secondary
    $('#secondaryEnabled').checked = state.secondary.enabled;
    $('#secondaryText').value = state.secondary.text;
    $('#secondaryFont').value = state.secondary.font;
    $('#secondarySize').value = state.secondary.size;
    $('#secondaryColor').value = state.secondary.color;
    $('#secondaryColorText').value = state.secondary.color;
    $('#secondaryY').value = state.secondary.y;

    // Tertiary
    $('#tertiaryEnabled').checked = state.tertiary.enabled;
    $('#tertiaryText').value = state.tertiary.text;

    // Body
    $('#bodyEnabled').checked = state.body.enabled;
    $('#bodyText').value = state.body.text;
    $('#bodyFont').value = state.body.font;
    $('#bodySize').value = state.body.size;
    $('#bodyColor').value = state.body.color;
    $('#bodyColorText').value = state.body.color;
    $('#bodyY').value = state.body.y;

    // Output
    $('#outputFilename').value = state.output.filename;
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
