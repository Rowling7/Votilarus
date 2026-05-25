// ==================== 小恐龙跳跃游戏工具 ====================

/**
 * 小恐龙跳跃游戏 - 类似 Google Chrome 离线小恐龙
 * 分数存入 IndexedDB
 */
class DinoGameTool {
    constructor() {
        this._container = null;
        this._canvas = null;
        this._ctx = null;
        this._animationFrameId = null;

        // 游戏状态
        this._gameRunning = false;
        this._gameOver = false;
        this._score = 0;
        this._highScore = 0;
        this._speed = 6;
        this._baseSpeed = 6;
        this._frameCount = 0;
        this._groundOffset = 0;

        // 恐龙
        this._dino = {
            x: 50,
            y: 0,
            width: 28,
            height: 34,
            vy: 0,
            gravity: 0.6,
            jumpForce: -12,
            grounded: true,
            legFrame: 0,
            legTimer: 0
        };

        // 障碍物
        this._obstacles = [];
        this._spawnTimer = 0;
        this._minSpawnInterval = 60;
        this._maxSpawnInterval = 120;

        // 地面线
        this._groundY = 0;

        // IndexedDB
        this._dbName = 'DinoGameDB';
        this._dbVersion = 1;
        this._storeName = 'highscores';
        this._db = null;

        this._initDB();
    }

    /**
     * 初始化 IndexedDB
     */
    _initDB() {
        const request = indexedDB.open(this._dbName, this._dbVersion);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(this._storeName)) {
                const store = db.createObjectStore(this._storeName, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('score', 'score', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (e) => {
            this._db = e.target.result;
            this._loadHighScores();
        };

        request.onerror = (e) => {
            console.error('[DinoGame] IndexedDB 打开失败:', e.target.error);
        };
    }

    /**
     * 保存分数到 IndexedDB
     * @param {number} score
     */
    _saveScore(score) {
        if (!this._db) return;

        const transaction = this._db.transaction([this._storeName], 'readwrite');
        const store = transaction.objectStore(this._storeName);

        const record = {
            score: score,
            timestamp: Date.now()
        };

        store.add(record);

        transaction.oncomplete = () => {
            this._loadHighScores();
        };

        transaction.onerror = (e) => {
            console.error('[DinoGame] 保存分数失败:', e.target.error);
        };
    }

    /**
     * 加载最高分列表
     */
    _loadHighScores() {
        if (!this._db) return;

        const transaction = this._db.transaction([this._storeName], 'readonly');
        const store = transaction.objectStore(this._storeName);
        const index = store.index('score');
        const request = index.openCursor(null, 'prev');

        const scores = [];

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                scores.push(cursor.value);
                if (scores.length < 10) {
                    cursor.continue();
                } else {
                    this._renderHighScores(scores);
                }
            } else {
                this._renderHighScores(scores);
            }
        };
    }

    /**
     * 渲染高分榜
     * @param {Array} scores
     */
    _renderHighScores(scores) {
        if (!this._container) return;
        const listEl = this._container.querySelector('.dino-highscores-list');
        if (!listEl) return;

        if (scores.length === 0) {
            listEl.innerHTML = '<li style="opacity:0.5;width:100%;justify-content:center;">暂无记录</li>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        listEl.innerHTML = scores.map((s, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const medal = i < 3 ? medals[i] : '';
            const date = new Date(s.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            return `<li>
                <span class="dino-highscore-rank ${rankClass}">${medal || `#${i + 1}`}</span>
                <span class="dino-highscore-score">${s.score}</span>
                <span style="opacity:0.5">${dateStr}</span>
            </li>`;
        }).join('');
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container
     */
    render(container) {
        this._container = container;

        container.innerHTML = `
            <div class="dino-tool">
                <h2 class="dino-tool-title">🦖 小恐龙跳跃</h2>
                <p class="dino-tool-desc">类 Chrome 离线小恐龙游戏，点击/空格/↑ 跳跃，分数自动存入 IndexedDB</p>

                <div class="dino-game-wrapper">
                    <div class="dino-game-container" id="dinoGameContainer">
                        <canvas class="dino-canvas" id="dinoGameCanvas"></canvas>
                        <div class="dino-overlay" id="dinoGameOverlay">
                            <div class="dino-overlay-title" id="dinoOverlayTitle">🦖</div>
                            <div class="dino-overlay-sub" id="dinoOverlaySub">点击或按空格开始</div>
                            <div class="dino-overlay-score" id="dinoOverlayScore"></div>
                        </div>
                    </div>

                    <div class="dino-scoreboard">
                        <div class="dino-score-current">
                            <span class="dino-score-label">🏆 当前</span>
                            <span id="dinoScoreDisplay">0</span>
                        </div>
                        <div class="dino-score-current">
                            <span class="dino-score-label">⭐ 最高</span>
                            <span id="dinoHighScoreDisplay">0</span>
                        </div>
                    </div>

                    <div class="dino-actions">
                        <button class="dino-btn dino-btn-start" id="dinoStartBtn">▶ 开始游戏</button>
                        <button class="dino-btn dino-btn-reset" id="dinoResetBtn">↺ 重置</button>
                    </div>

                    <div class="dino-highscores">
                        <p class="dino-highscores-title">📋 历史高分榜（Top 10）</p>
                        <ul class="dino-highscores-list">
                            <li style="opacity:0.5;width:100%;justify-content:center;">加载中...</li>
                        </ul>
                    </div>

                    <p class="dino-controls-hint">🔼 按 空格 / ↑ / 点击游戏区域 跳跃</p>
                </div>
            </div>
        `;

        this._bindEvents();
        this._setupCanvas();
        this._loadHighScores();
    }

    /**
     * 设置 Canvas
     */
    _setupCanvas() {
        this._canvas = this._container.querySelector('#dinoGameCanvas');
        if (!this._canvas) return;

        const containerEl = this._container.querySelector('#dinoGameContainer');
        if (!containerEl) return;

        const rect = containerEl.getBoundingClientRect();
        this._canvas.width = rect.width || 560;
        this._canvas.height = rect.height || 200;
        this._ctx = this._canvas.getContext('2d');

        // 地面线（从底部向上偏移）
        this._groundY = this._canvas.height - 18;

        // 恐龙初始 Y
        this._dino.y = this._groundY - this._dino.height;

        this._drawIdle();
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        if (!this._container) return;

        const containerEl = this._container.querySelector('#dinoGameContainer');
        const startBtn = this._container.querySelector('#dinoStartBtn');
        const resetBtn = this._container.querySelector('#dinoResetBtn');

        // 游戏区域点击跳跃
        if (containerEl) {
            containerEl.addEventListener('click', () => {
                if (!this._gameRunning && !this._gameOver) {
                    this._startGame();
                } else if (this._gameRunning) {
                    this._jump();
                } else if (this._gameOver) {
                    this._startGame();
                }
            });
        }

        // 开始按钮
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this._startGame();
            });
        }

        // 重置按钮
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this._resetGame();
            });
        }

        // 键盘事件 - 挂载到 document 上，但只在工具激活时处理
        this._keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!this._gameRunning && !this._gameOver) {
                    this._startGame();
                } else if (this._gameRunning) {
                    this._jump();
                } else if (this._gameOver) {
                    this._startGame();
                }
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    /**
     * 开始游戏
     */
    _startGame() {
        if (this._gameRunning) return;

        // 重置游戏状态
        this._gameOver = false;
        this._gameRunning = true;
        this._score = 0;
        this._speed = this._baseSpeed;
        this._frameCount = 0;
        this._obstacles = [];
        this._spawnTimer = 0;
        this._dino.y = this._groundY - this._dino.height;
        this._dino.vy = 0;
        this._dino.grounded = true;
        this._dino.legFrame = 0;
        this._dino.legTimer = 0;
        this._groundOffset = 0;

        // 隐藏覆盖层
        const overlay = this._container.querySelector('#dinoGameOverlay');
        if (overlay) overlay.classList.remove('visible');

        // 更新按钮
        const startBtn = this._container.querySelector('#dinoStartBtn');
        if (startBtn) startBtn.textContent = '⏸ 游戏中...';

        // 更新分数显示
        this._updateScoreDisplay();

        // 开始游戏循环
        this._gameLoop();
    }

    /**
     * 游戏结束
     */
    _gameEnd() {
        this._gameRunning = false;
        this._gameOver = true;

        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        // 显示覆盖层
        const overlay = this._container.querySelector('#dinoGameOverlay');
        const overlayTitle = this._container.querySelector('#dinoOverlayTitle');
        const overlaySub = this._container.querySelector('#dinoOverlaySub');
        const overlayScore = this._container.querySelector('#dinoOverlayScore');

        if (overlay) overlay.classList.add('visible');
        if (overlayTitle) overlayTitle.textContent = '💀 游戏结束';
        if (overlaySub) overlaySub.textContent = '点击或按空格重新开始';
        if (overlayScore) overlayScore.textContent = `得分: ${this._score}`;

        // 更新按钮
        const startBtn = this._container.querySelector('#dinoStartBtn');
        if (startBtn) startBtn.textContent = '▶ 重新开始';

        // 保存分数
        if (this._score > 0) {
            this._saveScore(this._score);
        }

        // 更新最高分
        if (this._score > this._highScore) {
            this._highScore = this._score;
            const highScoreEl = this._container.querySelector('#dinoHighScoreDisplay');
            if (highScoreEl) highScoreEl.textContent = this._highScore;
        }
    }

    /**
     * 重置游戏
     */
    _resetGame() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        this._gameRunning = false;
        this._gameOver = false;
        this._score = 0;
        this._speed = this._baseSpeed;
        this._frameCount = 0;
        this._obstacles = [];
        this._spawnTimer = 0;
        this._dino.y = this._groundY - this._dino.height;
        this._dino.vy = 0;
        this._dino.grounded = true;
        this._dino.legFrame = 0;
        this._dino.legTimer = 0;
        this._groundOffset = 0;

        // 隐藏覆盖层
        const overlay = this._container.querySelector('#dinoGameOverlay');
        if (overlay) {
            overlay.classList.remove('visible');
            const title = overlay.querySelector('#dinoOverlayTitle');
            const sub = overlay.querySelector('#dinoOverlaySub');
            const score = overlay.querySelector('#dinoOverlayScore');
            if (title) title.textContent = '🦖';
            if (sub) sub.textContent = '点击或按空格开始';
            if (score) score.textContent = '';
        }

        // 更新按钮
        const startBtn = this._container.querySelector('#dinoStartBtn');
        if (startBtn) startBtn.textContent = '▶ 开始游戏';

        // 更新分数
        this._updateScoreDisplay();

        // 重绘
        this._drawIdle();
    }

    /**
     * 跳跃
     */
    _jump() {
        if (!this._dino.grounded) return;
        this._dino.vy = this._dino.jumpForce;
        this._dino.grounded = false;
    }

    /**
     * 游戏主循环
     */
    _gameLoop() {
        if (!this._gameRunning || this._gameOver) return;

        this._update();
        this._draw();

        this._animationFrameId = requestAnimationFrame(() => this._gameLoop());
    }

    /**
     * 更新游戏逻辑
     */
    _update() {
        this._frameCount++;

        // 速度随分数增加
        this._speed = this._baseSpeed + Math.floor(this._score / 100) * 0.5;
        if (this._speed > 15) this._speed = 15;

        // 分数增加
        if (this._frameCount % 5 === 0) {
            this._score++;
            this._updateScoreDisplay();
        }

        // 地面滚动
        this._groundOffset = (this._groundOffset - this._speed) % 20;

        // 恐龙物理
        if (!this._dino.grounded) {
            this._dino.vy += this._dino.gravity;
            this._dino.y += this._dino.vy;

            if (this._dino.y >= this._groundY - this._dino.height) {
                this._dino.y = this._groundY - this._dino.height;
                this._dino.vy = 0;
                this._dino.grounded = true;
            }
        }

        // 恐龙腿部动画
        if (this._dino.grounded) {
            this._dino.legTimer++;
            if (this._dino.legTimer > 6) {
                this._dino.legTimer = 0;
                this._dino.legFrame = this._dino.legFrame === 0 ? 1 : 0;
            }
        } else {
            this._dino.legFrame = 0;
        }

        // 生成障碍物
        this._spawnTimer++;
        if (this._spawnTimer > this._minSpawnInterval + Math.random() * (this._maxSpawnInterval - this._minSpawnInterval)) {
            this._spawnTimer = 0;
            this._spawnObstacle();
            // 动态调整生成间隔
            this._minSpawnInterval = Math.max(40, 60 - Math.floor(this._score / 200));
            this._maxSpawnInterval = Math.max(80, 120 - Math.floor(this._score / 200));
        }

        // 更新障碍物
        for (let i = this._obstacles.length - 1; i >= 0; i--) {
            const obs = this._obstacles[i];
            obs.x -= this._speed;

            if (obs.x + obs.width < 0) {
                this._obstacles.splice(i, 1);
                continue;
            }

            // 碰撞检测
            if (this._checkCollision(obs)) {
                this._gameEnd();
                return;
            }
        }
    }

    /**
     * 生成障碍物（仙人掌）
     */
    _spawnObstacle() {
        const width = 12 + Math.random() * 8;
        const height = 22 + Math.random() * 12;
        this._obstacles.push({
            x: this._canvas.width,
            y: this._groundY - height,
            width: width,
            height: height,
            type: Math.floor(Math.random() * 3) // 0,1,2 不同样式
        });
    }

    /**
     * 碰撞检测
     * @param {Object} obs
     * @returns {boolean}
     */
    _checkCollision(obs) {
        // 缩小碰撞盒，让游戏更友好
        const shrink = 4;
        const dinoLeft = this._dino.x + shrink;
        const dinoRight = this._dino.x + this._dino.width - shrink;
        const dinoTop = this._dino.y + shrink;
        const dinoBottom = this._dino.y + this._dino.height - shrink;

        const obsLeft = obs.x + shrink;
        const obsRight = obs.x + obs.width - shrink;
        const obsTop = obs.y + shrink;
        const obsBottom = obs.y + obs.height - shrink;

        return dinoLeft < obsRight && dinoRight > obsLeft && dinoTop < obsBottom && dinoBottom > obsTop;
    }

    /**
     * 更新分数显示
     */
    _updateScoreDisplay() {
        const scoreEl = this._container?.querySelector('#dinoScoreDisplay');
        if (scoreEl) scoreEl.textContent = this._score;
    }

    /**
     * 绘制游戏画面
     */
    _draw() {
        const ctx = this._ctx;
        const canvas = this._canvas;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 地面线
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this._groundY);
        ctx.lineTo(canvas.width, this._groundY);
        ctx.stroke();

        // 地面纹理（小点）
        ctx.fillStyle = '#757575';
        for (let x = this._groundOffset; x < canvas.width; x += 20) {
            ctx.fillRect(x, this._groundY + 4, 4, 4);
        }

        // 绘制障碍物（仙人掌）
        this._obstacles.forEach(obs => {
            ctx.fillStyle = '#535353';
            // 仙人掌主体
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // 仙人掌分支
            if (obs.type === 0) {
                // 左侧分支
                ctx.fillRect(obs.x - 6, obs.y + 4, 6, 4);
                ctx.fillRect(obs.x - 4, obs.y + 12, 4, 5);
            } else if (obs.type === 1) {
                // 右侧分支
                ctx.fillRect(obs.x + obs.width, obs.y + 4, 6, 4);
                ctx.fillRect(obs.x + obs.width, obs.y + 12, 4, 5);
            } else {
                // 双分支
                ctx.fillRect(obs.x - 6, obs.y + 4, 6, 4);
                ctx.fillRect(obs.x + obs.width, obs.y + 4, 6, 4);
            }
        });

        // 绘制恐龙
        this._drawDino(ctx);
    }

    /**
     * 绘制恐龙
     * @param {CanvasRenderingContext2D} ctx
     */
    _drawDino(ctx) {
        const d = this._dino;
        const x = d.x;
        const y = d.y;

        ctx.fillStyle = '#535353';

        // 身体
        ctx.fillRect(x + 6, y + 10, 16, 16);

        // 头
        ctx.fillRect(x + 14, y, 14, 12);

        // 眼睛
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(x + 22, y + 3, 4, 4);
        ctx.fillStyle = '#535353';
        ctx.fillRect(x + 24, y + 3, 2, 4);

        // 嘴巴
        ctx.fillStyle = '#535353';
        ctx.fillRect(x + 26, y + 8, 4, 2);

        // 尾巴
        ctx.fillRect(x, y + 14, 6, 4);
        ctx.fillRect(x - 4, y + 16, 4, 2);

        // 腿（根据动画帧）
        ctx.fillStyle = '#535353';
        if (d.grounded) {
            if (d.legFrame === 0) {
                // 左腿前右腿后
                ctx.fillRect(x + 8, y + 26, 4, 8);
                ctx.fillRect(x + 16, y + 26, 4, 6);
            } else {
                // 右腿前左腿后
                ctx.fillRect(x + 8, y + 26, 4, 6);
                ctx.fillRect(x + 16, y + 26, 4, 8);
            }
        } else {
            // 空中腿收起
            ctx.fillRect(x + 8, y + 26, 4, 4);
            ctx.fillRect(x + 16, y + 26, 4, 4);
        }

        // 手臂
        ctx.fillRect(x + 16, y + 12, 4, 6);
    }

    /**
     * 绘制空闲状态
     */
    _drawIdle() {
        const ctx = this._ctx;
        const canvas = this._canvas;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 地面线
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this._groundY);
        ctx.lineTo(canvas.width, this._groundY);
        ctx.stroke();

        // 地面纹理
        ctx.fillStyle = '#757575';
        ctx.fillRect(20, this._groundY + 4, 4, 4);
        ctx.fillRect(60, this._groundY + 4, 4, 4);
        ctx.fillRect(100, this._groundY + 4, 4, 4);
        ctx.fillRect(140, this._groundY + 4, 4, 4);
        ctx.fillRect(180, this._groundY + 4, 4, 4);

        // 绘制静态恐龙
        this._drawDino(ctx);
    }

    /**
     * 清理
     */
    dispose() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        this._gameRunning = false;
        this._container = null;
        this._canvas = null;
        this._ctx = null;
    }
}

export default DinoGameTool;