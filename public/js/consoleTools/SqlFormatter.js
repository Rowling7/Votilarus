// ==================== SQL 格式化工具 ====================

/**
 * SQL 格式化工具 - 用于控制台模态框
 * 支持格式化 MSSQL、MySQL、SQLite3 三种方言的 SQL 语句
 */
class SqlFormatter {
    constructor() {
        this._container = null;
        this._feedbackTimer = null;
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        this._container = container;

        container.innerHTML = `
            <div class="sqlfmt-tool">
                <h2 class="sqlfmt-title">🗄️ SQL 格式化</h2>
                <p class="sqlfmt-desc">格式化 SQL 语句，支持 MSSQL / MySQL / SQLite3 方言</p>

                <!-- SQL 方言选择 -->
                <div class="sqlfmt-section">
                    <div class="sqlfmt-field">
                        <label class="sqlfmt-label">数据库方言</label>
                        <div class="sqlfmt-radio-group" id="sqlfmtDialect">
                            <label class="sqlfmt-radio">
                                <input type="radio" name="dialect" value="mysql" checked>
                                <span>MySQL</span>
                            </label>
                            <label class="sqlfmt-radio">
                                <input type="radio" name="dialect" value="mssql">
                                <span>MSSQL</span>
                            </label>
                            <label class="sqlfmt-radio">
                                <input type="radio" name="dialect" value="sqlite3">
                                <span>SQLite3</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 选项 -->
                <div class="sqlfmt-section">
                    <div class="sqlfmt-options-row">
                        <label class="sqlfmt-checkbox">
                            <input type="checkbox" id="sqlfmtUppercase" checked>
                            <span>关键字大写</span>
                        </label>
                        <label class="sqlfmt-checkbox">
                            <input type="checkbox" id="sqlfmtIndent" checked>
                            <span>缩进子句</span>
                        </label>
                        <label class="sqlfmt-checkbox">
                            <input type="checkbox" id="sqlfmtNewlineBeforeAnd" checked>
                            <span>AND/OR 换行</span>
                        </label>
                    </div>
                </div>

                <!-- 输入 -->
                <div class="sqlfmt-section">
                    <div class="sqlfmt-field">
                        <label class="sqlfmt-label">输入 SQL</label>
                        <textarea class="sqlfmt-textarea" id="sqlfmtInput" placeholder="在此粘贴或输入 SQL 语句..." spellcheck="false"></textarea>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="sqlfmt-actions">
                    <button class="sqlfmt-btn sqlfmt-btn-primary" id="sqlfmtFormatBtn">⚡ 格式化</button>
                    <button class="sqlfmt-btn" id="sqlfmtClearBtn">🗑️ 清空</button>
                    <button class="sqlfmt-btn" id="sqlfmtCopyBtn">📋 复制结果</button>
                </div>

                <!-- 输出 -->
                <div class="sqlfmt-section">
                    <div class="sqlfmt-field">
                        <label class="sqlfmt-label">格式化结果</label>
                        <div class="sqlfmt-output-wrap">
                            <textarea class="sqlfmt-textarea sqlfmt-output" id="sqlfmtOutput" readonly placeholder="格式化后的 SQL 将显示在此..." spellcheck="false"></textarea>
                            <div class="sqlfmt-line-numbers" id="sqlfmtLineNumbers">1</div>
                        </div>
                    </div>
                </div>

                <!-- 统计信息 -->
                <div class="sqlfmt-stats" id="sqlfmtStats"></div>

                <!-- 示例 -->
                <div class="sqlfmt-section">
                    <details class="sqlfmt-details">
                        <summary class="sqlfmt-details-summary">📖 查看示例 SQL</summary>
                        <div class="sqlfmt-examples" id="sqlfmtExamples">
                            <button class="sqlfmt-example-btn" data-example="simple">简单查询</button>
                            <button class="sqlfmt-example-btn" data-example="join">多表 JOIN</button>
                            <button class="sqlfmt-example-btn" data-example="complex">复杂语句</button>
                            <button class="sqlfmt-example-btn" data-example="mssql">MSSQL 语法</button>
                        </div>
                    </details>
                </div>

                <!-- 反馈消息 -->
                <div class="sqlfmt-feedback" id="sqlfmtFeedback">
                    <p class="sqlfmt-feedback-text" id="sqlfmtFeedbackText"></p>
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

        // 格式化按钮
        const formatBtn = container.querySelector('#sqlfmtFormatBtn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this._formatSql());
        }

        // 清空按钮
        const clearBtn = container.querySelector('#sqlfmtClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this._clearAll());
        }

        // 复制按钮
        const copyBtn = container.querySelector('#sqlfmtCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this._copyResult());
        }

        // 输入框 Ctrl+Enter 触发格式化
        const input = container.querySelector('#sqlfmtInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this._formatSql();
                }
            });
            // 输入框自动调整高度
            input.addEventListener('input', () => {
                this._autoResize(input);
            });
        }

        // 示例按钮
        container.querySelectorAll('[data-example]').forEach(btn => {
            btn.addEventListener('click', () => {
                const example = btn.dataset.example;
                this._loadExample(example);
            });
        });
    }

    /**
     * 自动调整 textarea 高度
     * @param {HTMLTextAreaElement} el
     */
    _autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 400) + 'px';
    }

    /**
     * 加载示例
     * @param {string} example
     */
    _loadExample(example) {
        const examples = {
            simple: `SELECT u.id, u.name, u.email, u.created_at
FROM users u
WHERE u.status = 'active'
  AND u.created_at >= '2024-01-01'
ORDER BY u.created_at DESC
LIMIT 10;`,
            join: `SELECT
  o.id AS order_id,
  o.order_date,
  c.name AS customer_name,
  c.email,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS total_amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('pending', 'shipped')
  AND o.order_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY o.order_date DESC, o.id ASC;`,
            complex: `SELECT
  department_id,
  d.name AS department_name,
  COUNT(e.id) AS employee_count,
  ROUND(AVG(e.salary), 2) AS avg_salary,
  MAX(e.salary) AS max_salary,
  MIN(e.salary) AS min_salary,
  SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_count
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE e.hire_date >= '2020-01-01'
  AND (e.salary BETWEEN 5000 AND 30000)
GROUP BY department_id, d.name
HAVING COUNT(e.id) >= 3
ORDER BY avg_salary DESC
LIMIT 10 OFFSET 0;`,
            mssql: `SELECT TOP 10
  p.id,
  p.product_name,
  p.category_id,
  c.category_name,
  ISNULL(p.stock, 0) AS stock,
  ISNULL(p.price, 0.00) AS price,
  GETDATE() AS query_time
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.price > 0
  AND (p.stock IS NOT NULL)
ORDER BY p.price DESC;`
        };

        const input = container.querySelector('#sqlfmtInput');
        if (input && examples[example]) {
            input.value = examples[example];
            this._autoResize(input);
            this._showFeedback(`✅ 已加载 ${example} 示例`, true);
        }
    }

    /**
     * 清空所有
     */
    _clearAll() {
        const container = this._container;
        if (!container) return;

        const input = container.querySelector('#sqlfmtInput');
        const output = container.querySelector('#sqlfmtOutput');
        const lineNumbers = container.querySelector('#sqlfmtLineNumbers');
        const stats = container.querySelector('#sqlfmtStats');

        if (input) { input.value = ''; input.style.height = 'auto'; }
        if (output) { output.value = ''; }
        if (lineNumbers) { lineNumbers.textContent = '1'; }
        if (stats) { stats.innerHTML = ''; stats.className = 'sqlfmt-stats'; }

        this._showFeedback('✅ 已清空', true);
    }

    /**
     * 复制结果到剪贴板
     */
    async _copyResult() {
        const container = this._container;
        if (!container) return;

        const output = container.querySelector('#sqlfmtOutput');
        if (!output || !output.value.trim()) {
            this._showFeedback('没有可复制的内容', false);
            return;
        }

        try {
            await navigator.clipboard.writeText(output.value);
            this._showFeedback('✅ 已复制到剪贴板', true);
        } catch {
            // 降级方案
            output.select();
            document.execCommand('copy');
            this._showFeedback('✅ 已复制到剪贴板', true);
        }
    }

    /**
     * 获取选中的方言
     * @returns {string}
     */
    _getDialect() {
        const container = this._container;
        if (!container) return 'mysql';

        const checked = container.querySelector('input[name="dialect"]:checked');
        return checked ? checked.value : 'mysql';
    }

    /**
     * 获取格式化选项
     * @returns {Object}
     */
    _getOptions() {
        const container = this._container;
        if (!container) return { uppercase: true, indent: true, newlineBeforeAnd: true };

        return {
            uppercase: container.querySelector('#sqlfmtUppercase')?.checked ?? true,
            indent: container.querySelector('#sqlfmtIndent')?.checked ?? true,
            newlineBeforeAnd: container.querySelector('#sqlfmtNewlineBeforeAnd')?.checked ?? true
        };
    }

    // ==================== SQL 格式化核心逻辑 ====================

    /**
     * SQL 关键字列表（大写形式）
     */
    static _KEYWORDS = new Set([
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL',
        'AS', 'ON', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
        'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING',
        'LIMIT', 'OFFSET', 'TOP', 'DISTINCT', 'ALL', 'UNION', 'ALL',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW',
        'IF', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
        'CASCADE', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'ROUND', 'ISNULL', 'COALESCE',
        'LIKE', 'BETWEEN', 'EXISTS', 'ANY', 'SOME',
        'WITH', 'RECURSIVE', 'CAST', 'CONVERT',
        'NULLS', 'FIRST', 'LAST', 'FETCH', 'NEXT', 'ROWS', 'ONLY',
        'EXCEPT', 'INTERSECT', 'MINUS',
        'REPLACE', 'TRUNCATE', 'USE', 'DATABASE', 'SCHEMA',
        'GETDATE', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
        'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
        'DECLARE', 'SET', 'PRINT', 'RAISERROR', 'THROW',
        'GO', 'EXEC', 'EXECUTE', 'SP_', 'WAITFOR', 'DELAY',
        'OUTPUT', 'INSERTED', 'DELETED',
        'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'OVER', 'PARTITION',
        'MATERIALIZED', 'TEMPORARY', 'TEMP', 'IFNULL',
        // 聚合窗口函数
        'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE',
        // 类型
        'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT',
        'VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR',
        'TEXT', 'NTEXT', 'CLOB',
        'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'MONEY',
        'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR',
        'BOOLEAN', 'BIT', 'BLOB', 'BINARY', 'VARBINARY',
        'JSON', 'ENUM', 'SET', 'UUID',
        'AUTO_INCREMENT', 'IDENTITY', 'SERIAL', 'ROWID',
        'NOT', 'NULL',
        'COLLATE', 'CHARACTER', 'SET',
        'ENGINE', 'CHARSET', 'COLLATE', 'AUTO_INCREMENT',
        'ROW', 'ROWS', 'RANGE', 'UNBOUNDED', 'PRECEDING', 'FOLLOWING',
        'CURRENT', 'DELIMITER', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
        'BEGIN', 'END', 'LOOP', 'WHILE', 'REPEAT', 'UNTIL',
        'DO', 'CURSOR', 'FETCH', 'INTO', 'CLOSE', 'DEALLOCATE',
        'LANGUAGE', 'DETERMINISTIC', 'MODIFIES', 'READS', 'SQL',
        'DEFINER', 'INVOKER', 'SECURITY',
        'INFILE', 'OUTFILE', 'FIELDS', 'TERMINATED', 'ENCLOSED', 'ESCAPED',
        'LINES', 'STARTING', 'IGNORE', 'LOAD', 'DATA', 'LOCAL',
        'PURGE', 'BINARY', 'OPTIMIZE', 'ANALYZE', 'CHECK', 'REPAIR',
        'FLUSH', 'RESET', 'SHOW', 'DESCRIBE', 'EXPLAIN',
        'KILL', 'PROCESSLIST'
    ]);

    /**
     * 主要子句关键字（需要换行的）
     */
    static _CLAUSE_KEYWORDS = new Set([
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
        'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'SET', 'UPDATE',
        'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
        'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT',
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
        'CROSS JOIN', 'JOIN',
        'ON', 'AND', 'OR'
    ]);

    /**
     * JOIN 相关关键字
     */
    static _JOIN_KEYWORDS = new Set([
        'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
        'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
        'CROSS JOIN'
    ]);

    /**
     * 格式化 SQL 主入口
     */
    _formatSql() {
        const container = this._container;
        if (!container) return;

        const input = container.querySelector('#sqlfmtInput');
        const output = container.querySelector('#sqlfmtOutput');
        const lineNumbers = container.querySelector('#sqlfmtLineNumbers');
        const stats = container.querySelector('#sqlfmtStats');

        if (!input || !output) return;

        const sql = input.value.trim();
        if (!sql) {
            this._showFeedback('请输入 SQL 语句', false);
            return;
        }

        try {
            const options = this._getOptions();
            const dialect = this._getDialect();
            const result = this._formatSqlText(sql, options, dialect);

            output.value = result;

            // 更新行号
            const lines = result.split('\n');
            const lineCount = lines.length;
            lineNumbers.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

            // 更新统计
            const charCount = result.length;
            stats.innerHTML = `
                <span class="sqlfmt-stat-item">📏 ${lineCount} 行</span>
                <span class="sqlfmt-stat-item">📝 ${charCount} 字符</span>
                <span class="sqlfmt-stat-item">🗄️ ${dialect.toUpperCase()}</span>
            `;
            stats.className = 'sqlfmt-stats visible';

            // 自动调整输出框高度
            const outputArea = output;
            outputArea.style.height = 'auto';
            outputArea.style.height = Math.min(outputArea.scrollHeight, 500) + 'px';

            this._showFeedback(`✅ 格式化成功 (${lineCount} 行, ${charCount} 字符)`, true);
        } catch (err) {
            this._showFeedback(`❌ 格式化失败: ${err.message}`, false);
        }
    }

    /**
     * SQL 格式化核心方法
     * @param {string} sql - 原始 SQL
     * @param {Object} options - 格式化选项
     * @param {boolean} options.uppercase - 关键字是否大写
     * @param {boolean} options.indent - 是否缩进子句
     * @param {boolean} options.newlineBeforeAnd - AND/OR 是否换行
     * @param {string} dialect - 数据库方言
     * @returns {string} 格式化后的 SQL
     */
    _formatSqlText(sql, options, dialect) {
        const { uppercase, indent, newlineBeforeAnd } = options;

        // 预处理：清理多余空白，保留字符串字面量
        const cleaned = this._preprocessSql(sql);

        // 分词
        const tokens = this._tokenize(cleaned);

        // 格式化
        const formatted = this._buildFormatted(tokens, {
            uppercase,
            indent,
            newlineBeforeAnd,
            dialect
        });

        return formatted;
    }

    /**
     * 预处理 SQL
     */
    _preprocessSql(sql) {
        // 移除行内注释（-- 到行末）
        let result = sql.replace(/--.*$/gm, '');
        // 移除块注释
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        // 规范化空白
        result = result.replace(/\r\n/g, '\n');
        result = result.replace(/\r/g, '\n');
        // 将换行替换为空格（保留字符串内的换行）
        result = result.replace(/\n/g, ' ');
        // 合并多个空白
        result = result.replace(/[ \t]+/g, ' ');
        // 逗号前加空格（如 "a,b" -> "a, b"）
        result = result.replace(/,([^\s])/g, ', $1');
        // 括号周围加空格
        result = result.replace(/\(/g, ' ( ');
        result = result.replace(/\)/g, ' ) ');
        result = result.replace(/\)\s*\(/g, ') (');
        // 操作符周围加空格
        result = result.replace(/([=<>!]+)/g, ' $1 ');
        // 清理多余空格
        result = result.replace(/\s+/g, ' ').trim();

        return result;
    }

    /**
     * 分词
     * @param {string} sql
     * @returns {Array<{type: string, value: string}>}
     */
    _tokenize(sql) {
        const tokens = [];
        const len = sql.length;
        let i = 0;

        const keywords = SqlFormatter._KEYWORDS;

        while (i < len) {
            const ch = sql[i];

            // 跳过空白
            if (/\s/.test(ch)) {
                i++;
                continue;
            }

            // 字符串字面量（单引号或双引号）
            if (ch === "'" || ch === '"') {
                const quote = ch;
                let str = quote;
                i++;
                while (i < len) {
                    const c = sql[i];
                    str += c;
                    if (c === quote && sql[i - 1] !== '\\') {
                        i++;
                        break;
                    }
                    i++;
                }
                tokens.push({ type: 'string', value: str });
                continue;
            }

            // 反引号（MySQL 引号标识符）
            if (ch === '`') {
                let str = '`';
                i++;
                while (i < len && sql[i] !== '`') {
                    str += sql[i];
                    i++;
                }
                str += '`';
                i++;
                tokens.push({ type: 'identifier', value: str });
                continue;
            }

            // 方括号（MSSQL 引号标识符）
            if (ch === '[') {
                let str = '[';
                i++;
                while (i < len && sql[i] !== ']') {
                    str += sql[i];
                    i++;
                }
                str += ']';
                i++;
                tokens.push({ type: 'identifier', value: str });
                continue;
            }

            // 括号
            if (ch === '(' || ch === ')') {
                tokens.push({ type: 'paren', value: ch });
                i++;
                continue;
            }

            // 逗号
            if (ch === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }

            // 分号
            if (ch === ';') {
                tokens.push({ type: 'semicolon', value: ';' });
                i++;
                continue;
            }

            // 操作符
            if ('=<>!+-*/%'.includes(ch)) {
                let op = ch;
                i++;
                // 双字符操作符：>=, <=, <>, !=, => (for JSON), ::
                if (i < len && '=>'.includes(sql[i])) {
                    op += sql[i];
                    i++;
                }
                tokens.push({ type: 'operator', value: op });
                continue;
            }

            // 点号（表名.列名）
            if (ch === '.') {
                tokens.push({ type: 'dot', value: '.' });
                i++;
                continue;
            }

            // 星号（SELECT *）
            if (ch === '*') {
                tokens.push({ type: 'star', value: '*' });
                i++;
                continue;
            }

            // 数字
            if (/\d/.test(ch) || (ch === '-' && i + 1 < len && /\d/.test(sql[i + 1]))) {
                let num = ch;
                i++;
                while (i < len && /[\d.eE+\-]/.test(sql[i])) {
                    num += sql[i];
                    i++;
                }
                tokens.push({ type: 'number', value: num });
                continue;
            }

            // 单词（关键字或标识符）
            if (/[a-zA-Z_]/.test(ch)) {
                let word = '';
                while (i < len && /[a-zA-Z0-9_#@$]/.test(sql[i])) {
                    word += sql[i];
                    i++;
                }
                const upper = word.toUpperCase();
                // 检查是否是复合关键字（如 LEFT JOIN, GROUP BY 等）
                // 先处理当前单独的 token
                if (keywords.has(upper)) {
                    tokens.push({ type: 'keyword', value: word });
                } else {
                    tokens.push({ type: 'identifier', value: word });
                }
                continue;
            }

            // 其他字符
            tokens.push({ type: 'other', value: ch });
            i++;
        }

        return tokens;
    }

    /**
     * 构建格式化后的 SQL
     */
    _buildFormatted(tokens, options) {
        const { uppercase, indent, newlineBeforeAnd } = options;

        const lines = [];
        let currentLine = '';
        let indentLevel = 0;
        let parenDepth = 0;
        let inSelectList = false; // 是否在 SELECT 的字段列表中
        let inWhereClause = false; // 是否在 WHERE 中
        let lastKeyword = '';
        let nextTokenIsKeyword = true;
        let prevTokenWasComma = false;

        const clauseKeywords = SqlFormatter._CLAUSE_KEYWORDS;
        const joinKeywords = SqlFormatter._JOIN_KEYWORDS;

        /**
         * 添加新行
         */
        const addLine = (text = '') => {
            if (currentLine.trim() || text) {
                lines.push(currentLine);
            }
            currentLine = text ? ' '.repeat(indentLevel * 4) + text : '';
        };

        /**
         * 判断是否是主要子句关键字
         */
        const isClauseKeyword = (token, nextToken) => {
            const val = token.value.toUpperCase();
            // 检查复合关键字
            if (val === 'LEFT' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'RIGHT' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'FULL' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'INNER' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'CROSS' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'OUTER' && nextToken && nextToken.value.toUpperCase() === 'JOIN') return true;
            if (val === 'GROUP' && nextToken && nextToken.value.toUpperCase() === 'BY') return true;
            if (val === 'ORDER' && nextToken && nextToken.value.toUpperCase() === 'BY') return true;
            if (val === 'UNION' && nextToken && nextToken.value.toUpperCase() === 'ALL') return true;
            if (val === 'INSERT' && nextToken && nextToken.value.toUpperCase() === 'INTO') return true;
            if (val === 'DELETE' && nextToken && nextToken.value.toUpperCase() === 'FROM') return true;
            if (val === 'CREATE' && nextToken && nextToken.value.toUpperCase() === 'TABLE') return true;
            if (val === 'ALTER' && nextToken && nextToken.value.toUpperCase() === 'TABLE') return true;
            if (val === 'DROP' && nextToken && nextToken.value.toUpperCase() === 'TABLE') return true;
            if (val === 'LEFT' || val === 'RIGHT' || val === 'INNER' || val === 'OUTER' || val === 'CROSS' || val === 'FULL') return false;
            if (val === 'GROUP' || val === 'ORDER' || val === 'UNION' || val === 'INSERT' || val === 'DELETE' || val === 'CREATE' || val === 'ALTER' || val === 'DROP') return false;
            return clauseKeywords.has(val);
        };

        /**
         * 获取下一个有意义 token 的索引
         */
        const peekNext = (idx) => {
            let j = idx + 1;
            while (j < tokens.length && tokens[j].type === 'space') j++;
            return j < tokens.length ? tokens[j] : null;
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = peekNext(i);
            const val = token.value;
            const upper = val.toUpperCase();

            // 处理字符串
            if (token.type === 'string') {
                currentLine += val;
                prevTokenWasComma = false;
                continue;
            }

            // 处理标识符（包括引号标识符）
            if (token.type === 'identifier') {
                if (currentLine && !currentLine.endsWith(' ') && !currentLine.endsWith('\t')) {
                    // 如果前一个是标识符或关键字，加空格
                    const lastLinePart = currentLine.trimEnd().slice(-1);
                    if (/[a-zA-Z0-9_\]`)]/.test(lastLinePart)) {
                        currentLine += ' ';
                    }
                }
                currentLine += val;
                prevTokenWasComma = false;
                continue;
            }

            // 处理关键字
            if (token.type === 'keyword') {
                const upperVal = uppercase ? upper : val.toLowerCase();

                // 处理 AND/OR 换行
                if (newlineBeforeAnd && (upper === 'AND' || upper === 'OR') && inWhereClause) {
                    addLine();
                    currentLine += upperVal;
                    prevTokenWasComma = false;
                    continue;
                }

                // AND 在 ON 后面作为连接条件时不换行（在 JOIN 的 ON 子句中）
                if (upper === 'AND' && lastKeyword === 'ON') {
                    // 检查是否在 JOIN 上下文中
                    currentLine += ` ${upperVal}`;
                    prevTokenWasComma = false;
                    continue;
                }

                // 如果是主要子句关键字，换行
                if (isClauseKeyword(token, nextToken)) {
                    // 特殊处理 SELECT
                    if (upper === 'SELECT') {
                        inSelectList = true;
                        if (lines.length > 0 || currentLine.trim()) {
                            addLine();
                        }
                        indentLevel = 1;
                        currentLine = upperVal;
                        lastKeyword = 'SELECT';
                        prevTokenWasComma = false;
                        continue;
                    }

                    // 处理 JOIN
                    if (joinKeywords.has(upper) ||
                        (upper === 'LEFT' && nextToken?.value.toUpperCase() === 'JOIN') ||
                        (upper === 'RIGHT' && nextToken?.value.toUpperCase() === 'JOIN') ||
                        (upper === 'INNER' && nextToken?.value.toUpperCase() === 'JOIN') ||
                        (upper === 'CROSS' && nextToken?.value.toUpperCase() === 'JOIN') ||
                        (upper === 'FULL' && nextToken?.value.toUpperCase() === 'JOIN') ||
                        (upper === 'OUTER' && nextToken?.value.toUpperCase() === 'JOIN')) {
                        addLine();
                        if (upper === 'OUTER') {
                            // OUTER JOIN 时，OUTER 是前一行的部分
                            // 实际不会到这里，会由前面的 LEFT/RIGHT/FULL 处理
                            currentLine += ' ' + upperVal;
                        } else {
                            currentLine = upperVal;
                            // 检查后续是否有 OUTER
                            if (nextToken && nextToken.value.toUpperCase() === 'OUTER') {
                                // 跳过，由 OUTER 自己处理
                            }
                        }
                        indentLevel = 1;
                        lastKeyword = 'JOIN';
                        inWhereClause = false;
                        prevTokenWasComma = false;
                        continue;
                    }

                    // 其他子句
                    if (upper === 'FROM') {
                        addLine();
                        currentLine = upperVal;
                        indentLevel = 1;
                        inSelectList = false;
                        inWhereClause = false;
                        lastKeyword = 'FROM';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'WHERE') {
                        addLine();
                        currentLine = upperVal;
                        indentLevel = 1;
                        inWhereClause = true;
                        lastKeyword = 'WHERE';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'GROUP BY' || (upper === 'GROUP' && nextToken?.value.toUpperCase() === 'BY')) {
                        addLine();
                        currentLine = 'GROUP BY';
                        indentLevel = 1;
                        inWhereClause = false;
                        lastKeyword = 'GROUP BY';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'ORDER BY' || (upper === 'ORDER' && nextToken?.value.toUpperCase() === 'BY')) {
                        addLine();
                        currentLine = 'ORDER BY';
                        indentLevel = 1;
                        inWhereClause = false;
                        lastKeyword = 'ORDER BY';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'HAVING') {
                        addLine();
                        currentLine = upperVal;
                        indentLevel = 1;
                        inWhereClause = false;
                        lastKeyword = 'HAVING';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'LIMIT' || upper === 'OFFSET') {
                        addLine();
                        currentLine = upperVal;
                        indentLevel = 1;
                        lastKeyword = upper;
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'ON') {
                        addLine();
                        currentLine = upperVal;
                        indentLevel = 2;
                        lastKeyword = 'ON';
                        prevTokenWasComma = false;
                        continue;
                    }

                    if (upper === 'UNION' || (upper === 'UNION' && nextToken?.value.toUpperCase() === 'ALL')) {
                        addLine();
                        currentLine = 'UNION';
                        if (nextToken?.value.toUpperCase() === 'ALL') {
                            currentLine += ' ALL';
                        }
                        indentLevel = 0;
                        lastKeyword = 'UNION';
                        prevTokenWasComma = false;
                        continue;
                    }

                    // 通用子句
                    addLine();
                    currentLine = upperVal;
                    indentLevel = 1;
                    lastKeyword = upper;
                    prevTokenWasComma = false;
                    continue;
                }

                // 普通关键字
                if (currentLine && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                }
                currentLine += upperVal;
                lastKeyword = upper;
                prevTokenWasComma = false;

                // 检查是否是复合关键字的一部分
                if (upper === 'GROUP' && nextToken?.value.toUpperCase() === 'BY') {
                    // 由 GROUP 处理，跳过 BY
                }
                continue;
            }

            // 处理逗号
            if (token.type === 'comma') {
                if (inSelectList || lastKeyword === 'GROUP BY' || lastKeyword === 'ORDER BY') {
                    currentLine += ',';
                    addLine();
                    prevTokenWasComma = true;
                } else {
                    currentLine += ',';
                    prevTokenWasComma = true;
                }
                continue;
            }

            // 处理左括号
            if (token.type === 'paren' && val === '(') {
                parenDepth++;
                if (currentLine && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                }
                currentLine += '(';
                indentLevel++;
                // 函数调用后面的括号不换行
                if (lastKeyword && SqlFormatter._KEYWORDS.has(lastKeyword)) {
                    // 括号紧跟关键字，是子查询，需要换行
                    addLine();
                }
                prevTokenWasComma = false;
                continue;
            }

            // 处理右括号
            if (token.type === 'paren' && val === ')') {
                parenDepth = Math.max(0, parenDepth - 1);
                indentLevel = Math.max(0, indentLevel - 1);
                // 如果当前行有内容但括号在开头，合并到上一行
                if (!currentLine.trim()) {
                    // 移除空行，把 ) 加到上一行末尾
                    if (lines.length > 0) {
                        const lastLine = lines.pop();
                        currentLine = lastLine + ' )';
                    } else {
                        currentLine = ')';
                    }
                } else {
                    if (!currentLine.endsWith(' ')) currentLine += ' ';
                    currentLine += ')';
                }
                prevTokenWasComma = false;
                continue;
            }

            // 处理分号
            if (token.type === 'semicolon') {
                currentLine += ';';
                addLine();
                prevTokenWasComma = false;
                continue;
            }

            // 处理操作符
            if (token.type === 'operator') {
                if (currentLine && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                }
                currentLine += val;
                if (currentLine && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                }
                prevTokenWasComma = false;
                continue;
            }

            // 处理点号
            if (token.type === 'dot') {
                // 紧跟前一个 token，不加空格
                currentLine += '.';
                prevTokenWasComma = false;
                continue;
            }

            // 处理星号
            if (token.type === 'star') {
                if (currentLine && !currentLine.endsWith(' ') && !currentLine.endsWith('.')) {
                    currentLine += ' ';
                }
                currentLine += '*';
                prevTokenWasComma = false;
                continue;
            }

            // 处理数字
            if (token.type === 'number') {
                if (currentLine && !currentLine.endsWith(' ')) {
                    // 检查是否需要空格
                    const lastChar = currentLine.trimEnd().slice(-1);
                    if (/[a-zA-Z0-9_\]`)]/.test(lastChar)) {
                        currentLine += ' ';
                    }
                }
                currentLine += val;
                prevTokenWasComma = false;
                continue;
            }

            // 其他
            currentLine += val;
            prevTokenWasComma = false;
        }

        // 添加最后一行
        if (currentLine.trim()) {
            lines.push(currentLine);
        }

        // 后处理：清理多余空白
        return lines.map(line => {
            // 修复多个空格
            return line.replace(/\s{2,}/g, ' ').trimEnd();
        }).join('\n');
    }

    /**
     * 显示操作反馈
     * @param {string} message
     * @param {boolean} success
     */
    _showFeedback(message, success = true) {
        const feedback = this._container?.querySelector('#sqlfmtFeedback');
        const feedbackText = this._container?.querySelector('#sqlfmtFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'sqlfmt-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'sqlfmt-feedback';
            }, 3000);
        }
    }
}

export default SqlFormatter;