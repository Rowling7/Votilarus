// ==================== 亲戚计算器工具 ====================

/**
 * 亲戚计算器 - 用于控制台模态框
 * 功能：根据关系链计算亲戚称呼
 */
class RelativeCalculator {
    constructor() {
        this._container = null;
        this._feedbackTimer = null;

        // 基础关系映射表
        this._relations = {
            // 直系
            '爸爸': { male: true, parent: true, label: '父亲' },
            '妈妈': { male: false, parent: true, label: '母亲' },
            '儿子': { male: true, parent: false, label: '儿子' },
            '女儿': { male: false, parent: false, label: '女儿' },
            '爷爷': { male: true, parent: true, label: '祖父' },
            '奶奶': { male: false, parent: true, label: '祖母' },
            '外公': { male: true, parent: true, label: '外祖父' },
            '外婆': { male: false, parent: true, label: '外祖母' },
            '孙子': { male: true, parent: false, label: '孙子' },
            '孙女': { male: false, parent: false, label: '孙女' },
            // 兄弟姊妹
            '哥哥': { male: true, sibling: true, older: true, label: '哥哥' },
            '弟弟': { male: true, sibling: true, older: false, label: '弟弟' },
            '姐姐': { male: false, sibling: true, older: true, label: '姐姐' },
            '妹妹': { male: false, sibling: true, older: false, label: '妹妹' },
            // 配偶
            '老公': { male: true, spouse: true, label: '丈夫' },
            '老婆': { male: false, spouse: true, label: '妻子' },
        };
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container
     */
    render(container) {
        this._container = container;

        container.innerHTML = `
            <div class="relative-tool">
                <h2 class="relative-title">👨‍👩‍👧‍👦 亲戚计算器</h2>
                <p class="relative-desc">计算两个亲戚之间的关系称呼</p>

                <!-- 输入区域 -->
                <div class="relative-section">
                    <div class="relative-field">
                        <label class="relative-label">我是</label>
                        <div class="relative-relation-selects">
                            <select class="relative-select" id="relMyGender">
                                <option value="male">男生</option>
                                <option value="female">女生</option>
                            </select>
                        </div>
                    </div>

                    <div class="relative-field">
                        <label class="relative-label">对方的亲戚关系链</label>
                        <div class="relative-chain-box" id="relChainBox">
                            <div class="relative-chain-placeholder">请从下方添加关系</div>
                        </div>
                    </div>

                    <div class="relative-field">
                        <label class="relative-label">添加关系</label>
                        <div class="relative-quick-btns" id="relQuickBtns">
                            <button class="relative-quick-btn" data-rel="爸爸">爸爸</button>
                            <button class="relative-quick-btn" data-rel="妈妈">妈妈</button>
                            <button class="relative-quick-btn" data-rel="爷爷">爷爷</button>
                            <button class="relative-quick-btn" data-rel="奶奶">奶奶</button>
                            <button class="relative-quick-btn" data-rel="外公">外公</button>
                            <button class="relative-quick-btn" data-rel="外婆">外婆</button>
                            <button class="relative-quick-btn" data-rel="哥哥">哥哥</button>
                            <button class="relative-quick-btn" data-rel="弟弟">弟弟</button>
                            <button class="relative-quick-btn" data-rel="姐姐">姐姐</button>
                            <button class="relative-quick-btn" data-rel="妹妹">妹妹</button>
                            <button class="relative-quick-btn" data-rel="老公">老公</button>
                            <button class="relative-quick-btn" data-rel="老婆">老婆</button>
                            <button class="relative-quick-btn" data-rel="儿子">儿子</button>
                            <button class="relative-quick-btn" data-rel="女儿">女儿</button>
                            <button class="relative-quick-btn" data-rel="孙子">孙子</button>
                            <button class="relative-quick-btn" data-rel="孙女">孙女</button>
                        </div>
                    </div>

                    <div class="relative-actions">
                        <button class="relative-btn" id="relClearBtn">🗑️ 清除</button>
                        <button class="relative-btn primary" id="relCalcBtn">🔍 计算称呼</button>
                    </div>
                </div>

                <!-- 预设常见关系 -->
                <div class="relative-section">
                    <h3 class="relative-section-title">📋 常见关系查询</h3>
                    <div class="relative-preset-list" id="relPresetList">
                        <button class="relative-preset-btn" data-preset="爸爸的爸爸">爸爸的爸爸</button>
                        <button class="relative-preset-btn" data-preset="妈妈的妈妈">妈妈的妈妈</button>
                        <button class="relative-preset-btn" data-preset="爸爸的哥哥">爸爸的哥哥</button>
                        <button class="relative-preset-btn" data-preset="爸爸的弟弟">爸爸的弟弟</button>
                        <button class="relative-preset-btn" data-preset="爸爸的姐姐">爸爸的姐姐</button>
                        <button class="relative-preset-btn" data-preset="爸爸的妹妹">爸爸的妹妹</button>
                        <button class="relative-preset-btn" data-preset="妈妈的哥哥">妈妈的哥哥</button>
                        <button class="relative-preset-btn" data-preset="妈妈的弟弟">妈妈的弟弟</button>
                        <button class="relative-preset-btn" data-preset="妈妈的姐姐">妈妈的姐姐</button>
                        <button class="relative-preset-btn" data-preset="妈妈的妹妹">妈妈的妹妹</button>
                        <button class="relative-preset-btn" data-preset="哥哥的老婆">哥哥的老婆</button>
                        <button class="relative-preset-btn" data-preset="姐姐的老公">姐姐的老公</button>
                        <button class="relative-preset-btn" data-preset="爸爸的爸爸的儿子">爸爸的爸爸的儿子</button>
                    </div>
                </div>

                <!-- 结果区域 -->
                <div class="relative-result" id="relResult">
                    <div class="relative-result-card">
                        <div class="relative-result-title">📖 计算结果</div>
                        <div class="relative-result-detail">
                            <span class="relative-result-label">关系链：</span>
                            <span class="relative-result-chain" id="relResultChain"></span>
                        </div>
                        <div class="relative-result-detail">
                            <span class="relative-result-label">你应该称呼对方：</span>
                            <span class="relative-result-name" id="relResultName">——</span>
                        </div>
                    </div>
                    <div class="relative-result-hint" id="relResultHint"></div>
                </div>

                <!-- 反馈消息 -->
                <div class="relative-feedback" id="relFeedback">
                    <p class="relative-feedback-text" id="relFeedbackText"></p>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        const container = this._container;
        if (!container) return;

        // 添加关系按钮
        container.querySelectorAll('[data-rel]').forEach(btn => {
            btn.addEventListener('click', () => {
                const rel = btn.dataset.rel;
                this._addToChain(rel);
            });
        });

        // 清除按钮
        const clearBtn = container.querySelector('#relClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearChain());
        }

        // 计算按钮
        const calcBtn = container.querySelector('#relCalcBtn');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => this._doCalc());
        }

        // 预设按钮
        container.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                const chain = preset.split('的');
                this._clearChain();
                chain.forEach(rel => this._addToChain(rel));
                this._doCalc();
            });
        });
    }

    /**
     * 添加到关系链
     * @param {string} rel
     */
    _addToChain(rel) {
        const chainBox = this._container?.querySelector('#relChainBox');
        if (!chainBox) return;

        // 移除占位符
        const placeholder = chainBox.querySelector('.relative-chain-placeholder');
        if (placeholder) placeholder.remove();

        const tag = document.createElement('span');
        tag.className = 'relative-chain-tag';
        tag.textContent = rel;
        tag.title = '点击移除';
        tag.addEventListener('click', () => {
            tag.remove();
            // 如果空了，显示占位符
            if (chainBox.children.length === 0) {
                chainBox.innerHTML = '<div class="relative-chain-placeholder">请从下方添加关系</div>';
            }
        });
        chainBox.appendChild(tag);
    }

    /**
     * 清除关系链
     */
    _clearChain() {
        const chainBox = this._container?.querySelector('#relChainBox');
        if (!chainBox) return;
        chainBox.innerHTML = '<div class="relative-chain-placeholder">请从下方添加关系</div>';
        
        const resultEl = this._container?.querySelector('#relResult');
        if (resultEl) resultEl.classList.remove('visible');
        const hintEl = this._container?.querySelector('#relResultHint');
        if (hintEl) hintEl.textContent = '';
    }

    /**
     * 执行计算
     */
    _doCalc() {
        const container = this._container;
        if (!container) return;

        const chainBox = container.querySelector('#relChainBox');
        const myGender = container.querySelector('#relMyGender').value;
        const resultEl = container.querySelector('#relResult');
        const resultChain = container.querySelector('#relResultChain');
        const resultName = container.querySelector('#relResultName');
        const resultHint = container.querySelector('#relResultHint');

        if (!chainBox || !resultEl || !resultChain || !resultName) return;

        // 获取关系链
        const tags = chainBox.querySelectorAll('.relative-chain-tag');
        if (tags.length === 0) {
            this._showFeedback('请添加至少一个亲戚关系', false);
            return;
        }

        const chain = Array.from(tags).map(t => t.textContent);
        resultChain.textContent = chain.join(' → ');

        // 计算称呼
        let result = this._computeCalling(chain, myGender);
        if (result) {
            resultName.textContent = result.name;
            if (result.detail) {
                resultHint.textContent = `💡 ${result.detail}`;
            } else {
                resultHint.textContent = '';
            }
            resultEl.classList.add('visible');
            this._showFeedback('✅ 计算完成', true);
        } else {
            resultName.textContent = '未知称呼';
            resultHint.textContent = '💡 暂未收录该关系链，请尝试其他组合';
            resultEl.classList.add('visible');
            this._showFeedback('⚠️ 未能计算出准确称呼', false);
        }
    }

    /**
     * 计算称呼
     * @param {string[]} chain - 关系链数组
     * @param {string} myGender - 'male' | 'female'
     * @returns {object|null}
     */
    _computeCalling(chain, myGender) {
        // 简化版亲戚计算逻辑
        // 按关系链长度匹配
        const key = chain.join('的');

        // 常见关系完整映射表
        const callMap = {
            // ---- 一级关系 ----
            '爸爸': { name: '爸爸 / 父亲', detail: '直系血亲，上一代男性长辈' },
            '妈妈': { name: '妈妈 / 母亲', detail: '直系血亲，上一代女性长辈' },
            '儿子': { name: '儿子', detail: '直系血亲，下一代男性晚辈' },
            '女儿': { name: '女儿', detail: '直系血亲，下一代女性晚辈' },
            '哥哥': { name: '哥哥', detail: '同辈男性亲属，年长者' },
            '弟弟': { name: '弟弟', detail: '同辈男性亲属，年幼者' },
            '姐姐': { name: '姐姐', detail: '同辈女性亲属，年长者' },
            '妹妹': { name: '妹妹', detail: '同辈女性亲属，年幼者' },
            '老公': { name: '老公 / 丈夫', detail: '婚姻关系中的配偶（男）' },
            '老婆': { name: '老婆 / 妻子', detail: '婚姻关系中的配偶（女）' },

            // ---- 二级关系 ----
            '爸爸的爸爸': { name: '爷爷', detail: '父亲的父亲，祖父' },
            '爸爸的妈妈': { name: '奶奶', detail: '父亲的母亲，祖母' },
            '妈妈的爸爸': { name: '外公', detail: '母亲的父亲，外祖父' },
            '妈妈的妈妈': { name: '外婆', detail: '母亲的母亲，外祖母' },
            '爸爸的哥哥': { name: '伯父 / 伯伯', detail: '父亲的哥哥' },
            '爸爸的弟弟': { name: '叔叔 / 叔叔', detail: '父亲的弟弟' },
            '爸爸的姐姐': { name: '姑姑 / 姑妈', detail: '父亲的姐姐' },
            '爸爸的妹妹': { name: '姑姑 / 姑妈', detail: '父亲的妹妹' },
            '妈妈的哥哥': { name: '舅舅 / 大舅', detail: '母亲的哥哥' },
            '妈妈的弟弟': { name: '舅舅 / 小舅', detail: '母亲的弟弟' },
            '妈妈的姐姐': { name: '姨妈 / 大姨', detail: '母亲的姐姐' },
            '妈妈的妹妹': { name: '姨妈 / 小姨', detail: '母亲的妹妹' },
            '哥哥的老婆': { name: '嫂子', detail: '哥哥的妻子' },
            '弟弟的老婆': { name: '弟媳', detail: '弟弟的妻子' },
            '姐姐的老公': { name: '姐夫', detail: '姐姐的丈夫' },
            '妹妹的老公': { name: '妹夫', detail: '妹妹的丈夫' },
            '爸爸的儿子': { name: '哥哥 或 弟弟', detail: '父亲的儿子，即你的兄弟（取决于年龄）' },
            '妈妈的女儿': { name: '姐姐 或 妹妹', detail: '母亲的女儿，即你的姐妹（取决于年龄）' },
            '妈妈的丈夫': { name: '爸爸', detail: '母亲的丈夫' },
            '爸爸的老婆': { name: '妈妈', detail: '父亲的妻子' },
            '爷爷的爸爸': { name: '曾祖父', detail: '祖父的父亲，上三代' },
            '爷爷的妈妈': { name: '曾祖母', detail: '祖父的母亲，上三代' },
            '外婆的爸爸': { name: '外曾祖父', detail: '外祖父的父亲，上三代' },
            '外婆的妈妈': { name: '外曾祖母', detail: '外祖父的母亲，上三代' },
            '丈夫的爸爸': { name: '公公', detail: '丈夫的父亲' },
            '丈夫的妈妈': { name: '婆婆', detail: '丈夫的母亲' },
            '妻子的爸爸': { name: '岳父', detail: '妻子的父亲' },
            '妻子的妈妈': { name: '岳母', detail: '妻子的母亲' },

            // ---- 三级关系 ----
            '爸爸的爸爸的爸爸': { name: '曾祖父 / 太爷爷', detail: '上三代男性祖先' },
            '爸爸的爸爸的妈妈': { name: '曾祖母 / 太奶奶', detail: '上三代女性祖先' },
            '爸爸的爸爸的儿子': { name: '伯父 / 叔叔 或 爸爸', detail: '爷爷的儿子，即你的爸爸或伯父/叔叔' },
            '爸爸的妈妈的女儿': { name: '姑姑 或 爸爸的姐姐/妹妹', detail: '奶奶的女儿' },
            '爸爸的哥哥的老婆': { name: '伯母 / 伯娘', detail: '伯父的妻子' },
            '爸爸的弟弟的老婆': { name: '婶婶 / 婶子', detail: '叔叔的妻子' },
            '爸爸的姐姐的老公': { name: '姑父 / 姑丈', detail: '姑姑的丈夫' },
            '爸爸的妹妹的老公': { name: '姑父 / 姑丈', detail: '姑姑的丈夫' },
            '妈妈的哥哥的老婆': { name: '舅妈 / 舅母', detail: '舅舅的妻子' },
            '妈妈的弟弟的老婆': { name: '舅妈 / 舅母', detail: '舅舅的妻子' },
            '妈妈的姐姐的老公': { name: '姨父 / 姨丈', detail: '姨妈的丈夫' },
            '妈妈的妹妹的老公': { name: '姨父 / 姨丈', detail: '姨妈的丈夫' },
            '哥哥的哥哥': { name: '哥哥', detail: '同辈' },
            '哥哥的弟弟': { name: '弟弟 或 自己', detail: '同辈' },
            '姐姐的姐姐': { name: '姐姐', detail: '同辈' },
            '姐姐的妹妹': { name: '妹妹 或 自己', detail: '同辈' },
            '爸爸的哥哥的儿子': { name: '堂哥 / 堂弟', detail: '伯父的儿子，堂兄弟' },
            '爸爸的哥哥的女儿': { name: '堂姐 / 堂妹', detail: '伯父的女儿，堂姐妹' },
            '爸爸的姐姐的儿子': { name: '表哥 / 表弟', detail: '姑姑的儿子，表兄弟' },
            '爸爸的姐姐的女儿': { name: '表姐 / 表妹', detail: '姑姑的女儿，表姐妹' },
            '妈妈的哥哥的儿子': { name: '表哥 / 表弟', detail: '舅舅的儿子，表兄弟' },
            '妈妈的哥哥的女儿': { name: '表姐 / 表妹', detail: '舅舅的女儿，表姐妹' },
        };

        if (callMap[key]) {
            return callMap[key];
        }

        return null;
    }

    /**
     * 显示操作反馈
     */
    _showFeedback(message, success = true) {
        const feedback = this._container?.querySelector('#relFeedback');
        const feedbackText = this._container?.querySelector('#relFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'relative-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'relative-feedback';
            }, 3000);
        }
    }
}

export default RelativeCalculator;