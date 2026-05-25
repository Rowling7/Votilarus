// ==================== 数字大写转换工具 ====================

/**
 * 数字大写转换工具 - 用于控制台模态框
 * 功能：阿拉伯数字与中文大写金额互转
 */
class NumberToChinese {
    constructor() {
        this._container = null;
        this._feedbackTimer = null;

        // 中文大写数字
        this._cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        // 中文小写数字
        this._cnSmallNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        // 单位
        this._cnUnits = ['', '拾', '佰', '仟'];
        this._cnBigUnits = ['', '万', '亿', '万亿'];
        // 金额单位
        this._cnMoneyUnits = ['角', '分', '厘'];
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container
     */
    render(container) {
        this._container = container;

        container.innerHTML = `
            <div class="n2c-tool">
                <h2 class="n2c-title">🔢 数字大写转换</h2>
                <p class="n2c-desc">阿拉伯数字与中文大写金额相互转换</p>

                <!-- 数字 → 大写 -->
                <div class="n2c-section">
                    <h3 class="n2c-section-title">📌 数字 → 中文大写</h3>
                    <div class="n2c-field">
                        <label class="n2c-label">输入阿拉伯数字</label>
                        <div class="n2c-input-group">
                            <input type="text" class="n2c-input" id="n2cInput" placeholder="例如: 12345.67" value="12345.67">
                            <button class="n2c-btn" id="n2cConvertBtn">转换为大写</button>
                        </div>
                    </div>
                    <div class="n2c-result-box" id="n2cResult">
                        <div class="n2c-result-row">
                            <span class="n2c-result-key">大写金额：</span>
                            <span class="n2c-result-val" id="n2cMoneyResult">——</span>
                        </div>
                        <div class="n2c-result-row">
                            <span class="n2c-result-key">中文读数：</span>
                            <span class="n2c-result-val" id="n2cReadResult">——</span>
                        </div>
                    </div>
                </div>

                <!-- 快捷示例 -->
                <div class="n2c-section">
                    <h3 class="n2c-section-title">⚡ 快捷示例</h3>
                    <div class="n2c-quick-btns">
                        <button class="n2c-quick-btn" data-example="100">100</button>
                        <button class="n2c-quick-btn" data-example="10086">10086</button>
                        <button class="n2c-quick-btn" data-example="123456789">123,456,789</button>
                        <button class="n2c-quick-btn" data-example="9999.99">9,999.99</button>
                        <button class="n2c-quick-btn" data-example="0.01">0.01</button>
                        <button class="n2c-quick-btn" data-example="100000000">100,000,000</button>
                        <button class="n2c-quick-btn" data-example="5002000.30">5,002,000.30</button>
                    </div>
                </div>

                <!-- 历史记录 -->
                <div class="n2c-section">
                    <h3 class="n2c-section-title">📋 转换记录</h3>
                    <div class="n2c-history" id="n2cHistory">
                        <p class="n2c-history-empty">暂无记录</p>
                    </div>
                    <button class="n2c-clear-btn" id="n2cClearHistory">🗑️ 清空记录</button>
                </div>

                <!-- 反馈消息 -->
                <div class="n2c-feedback" id="n2cFeedback">
                    <p class="n2c-feedback-text" id="n2cFeedbackText"></p>
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

        // 转换按钮
        const convertBtn = container.querySelector('#n2cConvertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this._doConvert());
        }

        // 快捷示例
        container.querySelectorAll('[data-example]').forEach(btn => {
            btn.addEventListener('click', () => {
                const example = btn.dataset.example.replace(/,/g, '');
                const input = container.querySelector('#n2cInput');
                if (input) {
                    input.value = example;
                    this._doConvert();
                }
            });
        });

        // 清空历史
        const clearBtn = container.querySelector('#n2cClearHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const history = container.querySelector('#n2cHistory');
                if (history) {
                    history.innerHTML = '<p class="n2c-history-empty">暂无记录</p>';
                }
            });
        }

        // Enter 键
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'n2cInput') {
                this._doConvert();
            }
        });
    }

    /**
     * 执行转换
     */
    _doConvert() {
        const container = this._container;
        if (!container) return;

        const input = container.querySelector('#n2cInput');
        const resultBox = container.querySelector('#n2cResult');
        const moneyResult = container.querySelector('#n2cMoneyResult');
        const readResult = container.querySelector('#n2cReadResult');

        if (!input || !resultBox || !moneyResult || !readResult) return;

        let raw = input.value.trim().replace(/,/g, '').replace(/[　\s]/g, '');

        if (!raw) {
            this._showFeedback('请输入数字', false);
            return;
        }

        // 校验格式
        if (!/^-?\d+(\.\d+)?$/.test(raw)) {
            this._showFeedback('请输入有效的数字（例如: 12345.67）', false);
            return;
        }

        // 处理负数
        let negative = false;
        if (raw.startsWith('-')) {
            negative = true;
            raw = raw.substring(1);
        }

        const num = parseFloat(raw);
        if (isNaN(num)) {
            this._showFeedback('数字格式无效', false);
            return;
        }

        // 限制范围（防止过大数字）
        if (num > 999999999999999.99) {
            this._showFeedback('数字过大，请控制在 999,999,999,999,999.99 以内', false);
            return;
        }

        try {
            // 中文大写金额
            let moneyStr = this._numberToMoney(raw, negative);
            // 中文读数
            let readStr = this._numberToRead(raw, negative);

            moneyResult.textContent = negative ? '负 ' + moneyStr : moneyStr;
            readResult.textContent = negative ? '负 ' + readStr : readStr;

            resultBox.classList.add('visible');
            this._showFeedback('✅ 转换成功', true);

            // 添加到历史记录
            this._addHistory(raw, moneyStr, readStr, negative);

            // 滚动到结果
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            this._showFeedback('转换出错: ' + err.message, false);
        }
    }

    /**
     * 数字转大写金额
     * @param {string} numStr - 数字字符串
     * @param {boolean} negative
     * @returns {string}
     */
    _numberToMoney(numStr, negative) {
        // 分离整数和小数部分
        let parts = numStr.split('.');
        let integerPart = parts[0];
        let decimalPart = parts[1] || '';

        // 去掉整数部分前导零（除非整个数字就是0）
        integerPart = integerPart.replace(/^0+/, '');
        if (integerPart === '') integerPart = '0';

        let result = '';

        // 处理整数部分
        if (integerPart === '0') {
            result = '零';
        } else {
            result = this._convertIntegerToMoney(integerPart);
            result += '圆';
        }

        // 处理小数部分
        if (decimalPart.length > 0) {
            // 补齐到至少2位
            while (decimalPart.length < 2) decimalPart += '0';
            // 最多取3位（厘）
            if (decimalPart.length > 3) decimalPart = decimalPart.substring(0, 3);

            const jiao = parseInt(decimalPart[0] || '0');
            const fen = parseInt(decimalPart[1] || '0');
            const li = decimalPart.length > 2 ? parseInt(decimalPart[2] || '0') : 0;

            if (jiao > 0) {
                result += this._cnNums[jiao] + '角';
            } else if (integerPart !== '0' && (fen > 0 || li > 0)) {
                result += '零';
            }

            if (fen > 0) {
                result += this._cnNums[fen] + '分';
            }

            if (li > 0) {
                result += this._cnNums[li] + '厘';
            }

            // 如果小数部分全为零
            if (jiao === 0 && fen === 0 && li === 0) {
                result += '整';
            }
        } else {
            result += '整';
        }

        return result;
    }

    /**
     * 整数部分转大写金额格式
     * @param {string} numStr
     * @returns {string}
     */
    _convertIntegerToMoney(numStr) {
        const len = numStr.length;
        let result = '';
        let lastZero = false;

        for (let i = 0; i < len; i++) {
            const digit = parseInt(numStr[i]);
            const pos = len - 1 - i;  // 从低位开始的位置

            // 确定当前位所在的段（万、亿）
            const segment = Math.floor(pos / 4);
            const posInSegment = pos % 4;

            if (digit === 0) {
                lastZero = true;
                // 如果当前位是段的开始（千、百、十），且下一位不为零，需要补零
                if (posInSegment === 0) {
                    // 处理万、亿等大单位
                    if (segment > 0 && pos >= 0) {
                        // 检查后面是否还有非零数字
                        let hasNonZero = false;
                        for (let j = i + 1; j < len; j++) {
                            if (parseInt(numStr[j]) !== 0) {
                                hasNonZero = true;
                                break;
                            }
                        }
                        if (hasNonZero) {
                            result += this._cnBigUnits[segment];
                            lastZero = false;
                        }
                    }
                }
            } else {
                if (lastZero) {
                    result += '零';
                    lastZero = false;
                }
                result += this._cnNums[digit];
                result += this._cnUnits[posInSegment];

                // 如果当前位是一个段的末尾（个位），添加段单位
                if (posInSegment === 0 && segment > 0) {
                    result += this._cnBigUnits[segment];
                }
            }
        }

        return result;
    }

    /**
     * 数字转中文读数
     * @param {string} numStr
     * @param {boolean} negative
     * @returns {string}
     */
    _numberToRead(numStr, negative) {
        let parts = numStr.split('.');
        let integerPart = parts[0];
        let decimalPart = parts[1] || '';

        // 去掉前导零
        integerPart = integerPart.replace(/^0+/, '');
        if (integerPart === '') integerPart = '0';

        let result = '';

        // 整数部分
        if (integerPart === '0') {
            result = '零';
        } else {
            result = this._convertIntegerToRead(integerPart);
        }

        // 小数部分
        if (decimalPart.length > 0) {
            result += '点';
            for (let i = 0; i < decimalPart.length; i++) {
                const digit = parseInt(decimalPart[i]);
                result += this._cnSmallNums[digit];
            }
        }

        return result;
    }

    /**
     * 整数部分转中文读数
     * @param {string} numStr
     * @returns {string}
     */
    _convertIntegerToRead(numStr) {
        const len = numStr.length;
        let result = '';
        let lastZero = false;

        const units = ['', '十', '百', '千'];
        const bigUnits = ['', '万', '亿', '万亿'];

        for (let i = 0; i < len; i++) {
            const digit = parseInt(numStr[i]);
            const pos = len - 1 - i;
            const segment = Math.floor(pos / 4);
            const posInSegment = pos % 4;

            if (digit === 0) {
                lastZero = true;
                if (posInSegment === 0 && segment > 0) {
                    let hasNonZero = false;
                    for (let j = i + 1; j < len; j++) {
                        if (parseInt(numStr[j]) !== 0) {
                            hasNonZero = true;
                            break;
                        }
                    }
                    if (hasNonZero) {
                        result += bigUnits[segment];
                        lastZero = false;
                    }
                }
            } else {
                if (lastZero) {
                    result += '零';
                    lastZero = false;
                }
                result += this._cnSmallNums[digit];
                result += units[posInSegment];
                if (posInSegment === 0 && segment > 0) {
                    result += bigUnits[segment];
                }
            }
        }

        return result;
    }

    /**
     * 添加到历史记录
     */
    _addHistory(input, money, read, negative) {
        const history = this._container?.querySelector('#n2cHistory');
        if (!history) return;

        // 移除空状态
        const empty = history.querySelector('.n2c-history-empty');
        if (empty) empty.remove();

        const prefix = negative ? '负 ' : '';

        const item = document.createElement('div');
        item.className = 'n2c-history-item';
        item.innerHTML = `
            <div class="n2c-history-input">${input} = </div>
            <div class="n2c-history-result">${prefix}${money}</div>
        `;
        item.title = '点击再次转换';
        item.addEventListener('click', () => {
            const inputEl = this._container?.querySelector('#n2cInput');
            if (inputEl) {
                inputEl.value = input;
                this._doConvert();
            }
        });

        // 限制最多10条
        while (history.children.length >= 10) {
            history.removeChild(history.lastChild);
        }

        history.insertBefore(item, history.firstChild);
    }

    /**
     * 显示操作反馈
     */
    _showFeedback(message, success = true) {
        const feedback = this._container?.querySelector('#n2cFeedback');
        const feedbackText = this._container?.querySelector('#n2cFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'n2c-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'n2c-feedback';
            }, 3000);
        }
    }
}

export default NumberToChinese;