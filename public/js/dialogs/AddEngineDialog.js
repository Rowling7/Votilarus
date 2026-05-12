/**
 * 添加搜索引擎对话框
 */
import ToastNotification from '../utils/ToastNotification.js';

class AddEngineDialog {
    constructor() {
        this.modal = null;
        this.form = null;
    }

    /**
     * 显示添加搜索引擎对话框
     * @param {Function} onSuccess - 成功回调函数
     */
    show(onSuccess) {
        // 先移除已存在的对话框
        this.hide();

        // 创建遮罩层
        this.modal = document.createElement('div');
        this.modal.id = 'add-engine-modal';
        this.modal.style.position = 'fixed';
        this.modal.style.top = '0';
        this.modal.style.left = '0';
        this.modal.style.width = '100vw';
        this.modal.style.height = '100vh';
        this.modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.modal.style.display = 'flex';
        this.modal.style.justifyContent = 'center';
        this.modal.style.alignItems = 'center';
        this.modal.style.zIndex = '100000';
        this.modal.style.backdropFilter = 'blur(4px)';

        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.style.backgroundColor = '#ffffff';
        dialog.style.borderRadius = '12px';
        dialog.style.padding = '24px';
        dialog.style.width = '450px';
        dialog.style.maxWidth = '90%';
        dialog.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        dialog.style.position = 'relative';

        // 对话框内容
        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                添加搜索引擎
            </h3>
            <form id="add-engine-form">
                <div style="margin-bottom: 16px;">
                    <label for="engine-name" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333; font-size: 14px;">
                        名称 <span style="color: #ff4d4f;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="engine-name" 
                        required 
                        placeholder="例如：百度"
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
                    >
                </div>
                <div style="margin-bottom: 16px;">
                    <label for="engine-key" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333; font-size: 14px;">
                        标识符 <span style="color: #ff4d4f;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="engine-key" 
                        required 
                        pattern="[a-zA-Z0-9_-]+"
                        title="只能包含字母、数字、下划线和连字符"
                        placeholder="例如：baidu"
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
                    >
                </div>
                <div style="margin-bottom: 16px;">
                    <label for="engine-url" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333; font-size: 14px;">
                        搜索URL <span style="color: #ff4d4f;">*</span>
                    </label>
                    <input 
                        type="url" 
                        id="engine-url" 
                        required 
                        placeholder="例如：https://www.baidu.com/s?wd="
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
                    >
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="engine-icon" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333; font-size: 14px;">
                        图标路径
                    </label>
                    <input 
                        type="text" 
                        id="engine-icon" 
                        placeholder="例如：static/ico/baidu.png"
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s;"
                    >
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button 
                        type="button" 
                        id="cancel-add-engine"
                        style="padding: 8px 20px; border: 1px solid #d9d9d9; background: #ffffff; border-radius: 6px; cursor: pointer; font-size: 14px; color: #333; transition: all 0.3s;"
                    >
                        取消
                    </button>
                    <button 
                        type="submit"
                        style="padding: 8px 20px; border: none; background: #1890ff; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s;"
                    >
                        添加
                    </button>
                </div>
            </form>
        `;

        this.modal.appendChild(dialog);
        document.body.appendChild(this.modal);

        // 获取表单元素
        this.form = document.getElementById('add-engine-form');
        const cancelBtn = document.getElementById('cancel-add-engine');

        // 绑定取消按钮事件
        cancelBtn.addEventListener('click', () => {
            this.hide();
        });

        // 绑定表单提交事件
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('engine-name').value.trim();
            const key = document.getElementById('engine-key').value.trim();
            const url = document.getElementById('engine-url').value.trim();
            const icon = document.getElementById('engine-icon').value.trim();

            if (!name || !key || !url) {
                ToastNotification.warning('请填写所有必填字段');
                return;
            }

            try {
                const response = await fetch('/api/search-engines', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: name,
                        title_en: key,
                        url: url,
                        icon_path: icon || null
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    this.hide();
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess();
                    }
                    ToastNotification.success('搜索引擎添加成功！');
                } else {
                    ToastNotification.error('添加失败: ' + result.error);
                }
            } catch (error) {
                console.error('Error adding search engine:', error);
                ToastNotification.error('添加过程中发生错误');
            }
        });

        // 点击遮罩层关闭对话框
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // 按 ESC 键关闭对话框
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 聚焦到第一个输入框
        setTimeout(() => {
            document.getElementById('engine-name').focus();
        }, 100);
    }

    /**
     * 隐藏对话框
     */
    hide() {
        if (this.modal && document.body.contains(this.modal)) {
            document.body.removeChild(this.modal);
            this.modal = null;
            this.form = null;
        }
    }
}

// 导出单例
export default new AddEngineDialog();
