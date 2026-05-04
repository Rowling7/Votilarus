// ==================== SettingsModal Web Component ====================

class SettingsModal extends HTMLElement {
    static get observedAttributes() {
        return ['visible'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.settings = {};
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'visible') {
            this.updateVisibility(newValue === 'true');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    z-index: 9998;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }

                .modal-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .modal-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
                    background: var(--bg-primary, #1a1a1a);
                    border-radius: 1rem;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .modal-container.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .modal-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                }

                .modal-close-btn {
                    width: 2rem;
                    height: 2rem;
                    border: none;
                    background: transparent;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    border-radius: 0.5rem;
                    transition: background 0.2s ease;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .settings-section {
                    margin-bottom: 2rem;
                }

                .section-title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: var(--theme-color, #667eea);
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--theme-color, #667eea);
                }

                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .setting-label {
                    color: white;
                    font-size: 0.95rem;
                }

                .setting-control {
                    display: flex;
                    gap: 0.5rem;
                }

                .setting-input {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: white;
                    outline: none;
                }

                .setting-input:focus {
                    border-color: var(--theme-color, #667eea);
                }

                .setting-select {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: white;
                    outline: none;
                    cursor: pointer;
                }

                .setting-button {
                    padding: 0.5rem 1.5rem;
                    background: var(--theme-color, #667eea);
                    border: none;
                    border-radius: 0.25rem;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .setting-button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .setting-button.danger {
                    background: #ef4444;
                }

                .modal-footer {
                    padding: 1.5rem 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
            </style>
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">⚙️ 设置</h2>
                    <button class="modal-close-btn" aria-label="关闭">×</button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <button class="setting-button danger" id="reset-settings-btn">恢复默认</button>
                    <button class="setting-button" id="export-settings-btn">导出配置</button>
                    <button class="setting-button" id="import-settings-btn">导入配置</button>
                    <button class="setting-button" id="save-settings-btn">保存</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        const closeBtn = this.shadowRoot.querySelector('.modal-close-btn');
        const saveBtn = this.shadowRoot.querySelector('#save-settings-btn');
        const resetBtn = this.shadowRoot.querySelector('#reset-settings-btn');
        const exportBtn = this.shadowRoot.querySelector('#export-settings-btn');
        const importBtn = this.shadowRoot.querySelector('#import-settings-btn');

        // 关闭按钮
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getAttribute('visible') === 'true') {
                this.close();
            }
        });

        // 保存按钮
        saveBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        // 恢复默认按钮
        resetBtn.addEventListener('click', () => {
            if (confirm('确定要恢复默认设置吗？')) {
                this.resetSettings();
            }
        });

        // 导出配置按钮
        exportBtn.addEventListener('click', () => {
            this.exportSettings();
        });

        // 导入配置按钮
        importBtn.addEventListener('click', () => {
            this.importSettings();
        });
    }

    updateVisibility(visible) {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        const container = this.shadowRoot.querySelector('.modal-container');

        if (visible) {
            overlay.classList.add('visible');
            container.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
            container.classList.remove('visible');
        }
    }

    open() {
        this.setAttribute('visible', 'true');
        
        // 派发打开事件
        this.dispatchEvent(new CustomEvent('modal-open', {
            bubbles: true
        }));
    }

    close() {
        this.setAttribute('visible', 'false');
        
        // 派发关闭事件
        this.dispatchEvent(new CustomEvent('modal-close', {
            bubbles: true
        }));
    }

    // 公共方法：加载设置
    loadSettings(settings) {
        this.settings = settings || {};
        this.renderSettingsForm();
    }

    // 渲染设置表单（由子类或外部实现）
    renderSettingsForm() {
        // 这个方法应该被覆盖，或者通过 slot 传入内容
        console.log('Settings loaded:', this.settings);
    }

    // 保存设置
    async saveSettings() {
        // 收集表单数据
        const formData = this.collectFormData();
        
        // 派发保存事件
        this.dispatchEvent(new CustomEvent('settings-save', {
            bubbles: true,
            detail: { settings: formData }
        }));

        alert('设置已保存！');
        this.close();
    }

    // 收集表单数据
    collectFormData() {
        const inputs = this.shadowRoot.querySelectorAll('.setting-input, .setting-select');
        const data = {};
        
        inputs.forEach(input => {
            if (input.dataset.settingKey) {
                data[input.dataset.settingKey] = input.value;
            }
        });

        return data;
    }

    // 恢复默认设置
    async resetSettings() {
        // 派发重置事件
        this.dispatchEvent(new CustomEvent('settings-reset', {
            bubbles: true
        }));

        alert('已恢复默认设置！');
        this.close();
    }

    // 导出设置
    async exportSettings() {
        // 派发导出事件
        this.dispatchEvent(new CustomEvent('settings-export', {
            bubbles: true
        }));
    }

    // 导入设置
    async importSettings() {
        // 创建文件输入
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        // 派发导入事件
                        this.dispatchEvent(new CustomEvent('settings-import', {
                            bubbles: true,
                            detail: { data }
                        }));
                        
                        alert('配置导入成功！');
                    } catch (error) {
                        alert('配置文件格式错误');
                    }
                };
                reader.readAsText(file);
            }
        });

        fileInput.click();
    }
}

// 注册自定义元素
customElements.define('settings-modal', SettingsModal);

export default SettingsModal;
