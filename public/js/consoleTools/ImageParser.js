// ==================== 图片解析工具 ====================

/**
 * 图片解析工具 - 用于控制台模态框
 * 功能：拖拽/选择图片 → 展示预览 + EXIF/尺寸/大小信息 → 下载原图
 */
class ImageParserTool {
    constructor() {
        this._currentFile = null;
        this._currentDataUrl = null;
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        // 重置状态
        this._currentFile = null;
        this._currentDataUrl = null;

        container.innerHTML = `
            <div class="image-parser">
                <h2 class="image-parser-title">🖼️ 图片解析</h2>
                <p class="image-parser-desc">拖放图片到下方区域，或点击选择文件，即可查看图片信息并下载。</p>
                
                <div class="image-parser-body">
                    <!-- 左侧：拖拽区域 -->
                    <div class="image-parser-dropzone" id="imageParserDropzone">
                        <div class="image-parser-dropzone-inner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="image-parser-dropzone-icon">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span class="image-parser-dropzone-text">拖放图片到此区域</span>
                            <span class="image-parser-dropzone-hint">或点击此处选择文件</span>
                            <input type="file" accept="image/*" id="imageParserFileInput" style="display:none;">
                        </div>
                    </div>

                    <!-- 右侧：预览 + 信息 -->
                    <div class="image-parser-preview" id="imageParserPreview">
                        <div class="image-parser-preview-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="image-parser-preview-empty-icon">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>预览区</span>
                        </div>
                        <div class="image-parser-info-panel" id="imageParserInfoPanel" style="display:none;">
                            <!-- 图片信息将动态填充 -->
                        </div>
                    </div>
                </div>

                <!-- 底部操作栏 -->
                <div class="image-parser-actions" id="imageParserActions" style="display:none;">
                    <button class="image-parser-btn-download" id="imageParserDownloadBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="image-parser-btn-icon">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        下载原图
                    </button>
                    <button class="image-parser-btn-clear" id="imageParserClearBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="image-parser-btn-icon">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        清除
                    </button>
                </div>
            </div>
        `;

        this._bindEvents(container);
    }

    /**
     * 绑定事件
     * @param {HTMLElement} container
     * @private
     */
    _bindEvents(container) {
        const dropzone = container.querySelector('#imageParserDropzone');
        const fileInput = container.querySelector('#imageParserFileInput');
        const downloadBtn = container.querySelector('#imageParserDownloadBtn');
        const clearBtn = container.querySelector('#imageParserClearBtn');

        // 点击 dropzone 触发文件选择
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择变化
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this._handleFile(e.target.files[0], container);
            }
        });

        // 拖拽事件
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this._handleFile(e.dataTransfer.files[0], container);
            }
        });

        // 粘贴事件（支持 Ctrl+V 粘贴图片）
        container.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        this._handleFile(file, container);
                        break;
                    }
                }
            }
        });

        // 下载按钮
        downloadBtn.addEventListener('click', () => this._download());

        // 清除按钮
        clearBtn.addEventListener('click', () => this._clear(container));
    }

    /**
     * 处理选中的文件
     * @param {File} file
     * @param {HTMLElement} container
     * @private
     */
    _handleFile(file, container) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        this._currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            this._currentDataUrl = e.target.result;
            this._displayPreview(e.target.result, file, container);
            this._parseExif(file, container);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 显示预览和基本信息
     * @param {string} dataUrl
     * @param {File} file
     * @param {HTMLElement} container
     * @private
     */
    _displayPreview(dataUrl, file, container) {
        const img = new Image();
        img.onload = () => {
            const previewArea = container.querySelector('#imageParserPreview');
            const infoPanel = container.querySelector('#imageParserInfoPanel');
            const actionsBar = container.querySelector('#imageParserActions');
            const dropzone = container.querySelector('#imageParserDropzone');

            // 显示预览
            previewArea.innerHTML = `
                <div class="image-parser-preview-image">
                    <img src="${dataUrl}" alt="预览图片">
                </div>
                <div class="image-parser-info-panel" id="imageParserInfoPanel">
                    <div class="image-parser-info-section">
                        <h4 class="image-parser-info-heading">📐 基本信息</h4>
                        <div class="image-parser-info-grid">
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label">文件名</span>
                                <span class="image-parser-info-value" title="${this._escapeHtml(file.name)}">${this._escapeHtml(file.name)}</span>
                            </div>
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label">文件大小</span>
                                <span class="image-parser-info-value">${this._formatFileSize(file.size)}</span>
                            </div>
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label">尺寸</span>
                                <span class="image-parser-info-value">${img.naturalWidth} × ${img.naturalHeight} px</span>
                            </div>
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label">类型</span>
                                <span class="image-parser-info-value">${file.type}</span>
                            </div>
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label">最后修改</span>
                                <span class="image-parser-info-value">${this._formatDate(file.lastModified)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="image-parser-info-section" id="imageParserExifSection">
                        <h4 class="image-parser-info-heading">📷 EXIF 信息</h4>
                        <div class="image-parser-info-grid" id="imageParserExifGrid">
                            <div class="image-parser-info-item">
                                <span class="image-parser-info-label" style="color:var(--text-tertiary,#999)">正在解析...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 缩小 dropzone 的高度，让预览更突出
            dropzone.classList.add('has-image');
            dropzone.querySelector('.image-parser-dropzone-inner').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="image-parser-dropzone-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span class="image-parser-dropzone-text">更换图片</span>
                <span class="image-parser-dropzone-hint">拖放或点击</span>
            `;

            // 显示操作栏
            actionsBar.style.display = 'flex';
        };
        img.src = dataUrl;
    }

    /**
     * 解析 EXIF 信息
     * @param {File} file
     * @param {HTMLElement} container
     * @private
     */
    _parseExif(file, container) {
        // 只对 JPEG 文件尝试解析 EXIF
        if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
            this._renderExifDisplay(container, [], true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = new Uint8Array(e.target.result);
            const exifData = this._extractExif(buffer);
            this._renderExifDisplay(container, exifData);
        };
        reader.onerror = () => {
            this._renderExifDisplay(container, [], true);
        };
        // 只读取前 64KB（EXIF 通常在此范围内）
        reader.readAsArrayBuffer(file.slice(0, 65536));
    }

    /**
     * 简单的 EXIF 数据提取
     * @param {Uint8Array} buffer
     * @returns {Array<{label:string, value:string}>}
     * @private
     */
    _extractExif(buffer) {
        const data = [];
        const view = new DataView(buffer.buffer);

        // 检查 JPEG SOI 标记
        if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
            return data;
        }

        let offset = 2;
        let foundExif = false;

        while (offset < buffer.length - 8) {
            if (buffer[offset] !== 0xFF) break;
            const marker = buffer[offset + 1];

            // EXIF APP1 marker
            if (marker === 0xE1 && buffer[offset + 4] === 0x45 && buffer[offset + 5] === 0x78 &&
                buffer[offset + 6] === 0x69 && buffer[offset + 7] === 0x66) {
                offset += 4; // skip FF E1 length
                const length = view.getUint16(offset, false);
                offset += 2;
                offset += 6; // skip "Exif\0\0"
                foundExif = true;

                try {
                    this._parseExifIFD(buffer, view, offset, data);
                } catch (err) {
                    console.warn('[ImageParser] EXIF parse error:', err);
                }
                break;
            } else {
                offset += 2;
                if (offset >= buffer.length - 1) break;
                const length = view.getUint16(offset, false);
                offset += length;
            }
        }

        if (!foundExif && data.length === 0) {
            data.push({ label: '提示', value: '未检测到 EXIF 数据' });
        }

        return data;
    }

    /**
     * 解析 EXIF IFD 条目
     * @param {Uint8Array} buffer
     * @param {DataView} view
     * @param {number} startOffset
     * @param {Array} data
     * @private
     */
    _parseExifIFD(buffer, view, startOffset, data) {
        // TIFF 字节序
        const byteAlign = view.getUint16(startOffset, false);
        const isLittle = byteAlign === 0x4949;

        const EXIF_TAGS = {
            0x010F: '相机品牌',
            0x0110: '相机型号',
            0x0112: '方向',
            0x0131: '软件',
            0x0132: '修改时间',
            0x9003: '拍摄时间',
            0x9004: '数字化时间',
            0x829A: '曝光时间',
            0x829D: '光圈值',
            0x8827: 'ISO',
            0x920A: '焦距',
            0x013B: '作者',
            0x8298: '版权',
            0x8769: 'EXIF 子IFD',
            0x9286: '用户备注',
            0xA002: '图片宽度',
            0xA003: '图片高度',
            0xA420: '图片唯一ID',
            0xA430: '相机所有者',
            0xA431: '机身序列号',
            0xA434: '镜头型号'
        };

        const ORIENTATION_MAP = {
            1: '标准',
            2: '水平翻转',
            3: '旋转180°',
            4: '垂直翻转',
            5: '逆时针90° + 垂直翻转',
            6: '顺时针90°',
            7: '顺时针90° + 垂直翻转',
            8: '逆时针90°'
        };

        let tagOffset = startOffset + 4; // skip TIFF header
        const numEntries = view.getUint16(tagOffset, isLittle);
        tagOffset += 2;

        for (let i = 0; i < numEntries; i++) {
            if (tagOffset + 12 > buffer.length) break;

            const tagId = view.getUint16(tagOffset, isLittle);
            const tagFormat = view.getUint16(tagOffset + 2, isLittle);
            const tagComponents = view.getUint32(tagOffset + 4, isLittle);
            const tagValueOffset = view.getUint32(tagOffset + 8, isLittle);

            const label = EXIF_TAGS[tagId];
            if (label) {
                let value = this._readExifValue(view, tagOffset, tagFormat, tagComponents, tagValueOffset, isLittle);

                // 特殊处理
                if (tagId === 0x0112 && ORIENTATION_MAP[value]) {
                    value = ORIENTATION_MAP[value];
                }
                if (tagId === 0x829A && value !== undefined) {
                    // 曝光时间：显示为分数
                    value = `1/${Math.round(1 / value)} 秒`;
                }
                if (tagId === 0x829D && value !== undefined) {
                    value = `f/${value.toFixed(1)}`;
                }
                if (tagId === 0x8827 && value !== undefined) {
                    value = `ISO ${value}`;
                }
                if (tagId === 0x920A && value !== undefined) {
                    value = `${value}mm`;
                }

                data.push({ label, value: String(value) });
            }

            tagOffset += 12;
        }
    }

    /**
     * 读取 EXIF 值
     * @param {DataView} view
     * @param {number} offset
     * @param {number} format
     * @param {number} components
     * @param {number} valueOffset
     * @param {boolean} isLittle
     * @private
     */
    _readExifValue(view, offset, format, components, valueOffset, isLittle) {
        // 根据 EXIF 格式类型读取
        const formats = {
            1: { bytes: 1, read: (o) => view.getUint8(o) },           // BYTE
            2: { bytes: 1, read: (o) => String.fromCharCode(view.getUint8(o)) }, // ASCII
            3: { bytes: 2, read: (o) => view.getUint16(o, isLittle) },  // SHORT
            4: { bytes: 4, read: (o) => view.getUint32(o, isLittle) },  // LONG
            5: { bytes: 8, read: (o) => view.getUint32(o, isLittle) / view.getUint32(o + 4, isLittle) }, // RATIONAL (简化)
            7: { bytes: 1 },   // UNDEFINED
            9: { bytes: 4, read: (o) => view.getInt32(o, isLittle) },   // SLONG
            10: { bytes: 8, read: (o) => view.getInt32(o, isLittle) / view.getInt32(o + 4, isLittle) }   // SRATIONAL (简化)
        };

        const fmt = formats[format];
        if (!fmt) return '?';

        const totalBytes = fmt.bytes * components;

        if (totalBytes <= 4) {
            // 数据内联在 value offset 字段中
            if (format === 2) {
                // ASCII
                let str = '';
                for (let i = 0; i < components && i < 4; i++) {
                    const ch = String.fromCharCode(view.getUint8(offset + 8 + i));
                    if (ch === '\0') break;
                    str += ch;
                }
                return str;
            }
            if (fmt.read) {
                return fmt.read(offset + 8);
            }
            return '?';
        }

        // 需要跳转到 offset 读取
        if (format === 2) {
            // ASCII 字符串
            let str = '';
            const dataStart = 12; // TIFF header start
            const strOffset = dataStart + valueOffset;
            for (let i = 0; i < components; i++) {
                const idx = strOffset + i;
                if (idx >= view.byteLength) break;
                const ch = String.fromCharCode(view.getUint8(idx));
                if (ch === '\0') break;
                str += ch;
            }
            return str;
        }
        if (fmt.read && components === 1) {
            const dataStart = 12;
            return fmt.read(dataStart + valueOffset);
        }

        return '?';
    }

    /**
     * 渲染 EXIF 显示
     * @param {HTMLElement} container
     * @param {Array<{label:string, value:string}>} exifData
     * @param {boolean} [notApplicable=false]
     * @private
     */
    _renderExifDisplay(container, exifData, notApplicable) {
        const exifGrid = container.querySelector('#imageParserExifGrid');
        if (!exifGrid) return;

        if (notApplicable && exifData.length === 0) {
            exifGrid.innerHTML = `
                <div class="image-parser-info-item">
                    <span class="image-parser-info-label">提示</span>
                    <span class="image-parser-info-value" style="color:var(--text-tertiary,#999)">非 JPEG 格式，不支持 EXIF 解析</span>
                </div>
            `;
        } else if (exifData.length === 0) {
            exifGrid.innerHTML = `
                <div class="image-parser-info-item">
                    <span class="image-parser-info-label">提示</span>
                    <span class="image-parser-info-value" style="color:var(--text-tertiary,#999)">未检测到 EXIF 数据</span>
                </div>
            `;
        } else {
            exifGrid.innerHTML = exifData.map(d => `
                <div class="image-parser-info-item">
                    <span class="image-parser-info-label">${this._escapeHtml(d.label)}</span>
                    <span class="image-parser-info-value">${this._escapeHtml(d.value)}</span>
                </div>
            `).join('');
        }
    }

    /**
     * 下载原图
     * @private
     */
    _download() {
        if (!this._currentFile || !this._currentDataUrl) {
            alert('请先选择一张图片');
            return;
        }

        const a = document.createElement('a');
        a.href = this._currentDataUrl;
        a.download = this._currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * 清除当前图片
     * @param {HTMLElement} container
     * @private
     */
    _clear(container) {
        if (!container) return;

        this._currentFile = null;
        this._currentDataUrl = null;

        const previewArea = container.querySelector('#imageParserPreview');
        const actionsBar = container.querySelector('#imageParserActions');
        const dropzone = container.querySelector('#imageParserDropzone');

        // 重置预览区
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="image-parser-preview-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="image-parser-preview-empty-icon">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>预览区</span>
                </div>
            `;
        }

        // 重置 dropzone
        if (dropzone) {
            dropzone.classList.remove('has-image');
            dropzone.querySelector('.image-parser-dropzone-inner').innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="image-parser-dropzone-icon">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span class="image-parser-dropzone-text">拖放图片到此区域</span>
                <span class="image-parser-dropzone-hint">或点击此处选择文件</span>
            `;
        }

        // 隐藏操作栏
        if (actionsBar) {
            actionsBar.style.display = 'none';
        }

        // 重置文件选择器
        const fileInput = container.querySelector('#imageParserFileInput');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /* ========== 工具函数 ========== */

    _formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    }

    _formatDate(timestamp) {
        const d = new Date(timestamp);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

export default ImageParserTool;