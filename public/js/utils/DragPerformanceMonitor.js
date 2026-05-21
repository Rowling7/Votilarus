/**
 * 拖拽性能监控工具
 * 用于监控和优化拖拽性能
 */

class DragPerformanceMonitor {
    constructor() {
        this.metrics = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0,
            dragStart: null,
            dragEnd: null,
            reflowCount: 0,
            repaintCount: 0
        };

        this.isEnabled = false;
        this.observer = null;
    }

    /**
     * 启用性能监控
     */
    enable() {
        if (this.isEnabled) return;

        this.isEnabled = true;
        this.metrics.lastTime = performance.now();

        // 使用 Performance Observer 监控长任务
        if ('PerformanceObserver' in window) {
            try {
                this.observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) { // 超过50ms的任务视为长任务
                            console.warn('[Performance] Long task detected:', entry.duration.toFixed(2), 'ms');
                        }
                    }
                });

                this.observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('[Performance] PerformanceObserver not supported');
            }
        }

        // 监听拖拽事件
        document.addEventListener('dragstart', () => this.onDragStart());
        document.addEventListener('dragend', () => this.onDragEnd());

        // 开始FPS监控
        this.monitorFPS();

        console.log('[Performance] Drag performance monitoring enabled');
    }

    /**
     * 禁用性能监控
     */
    disable() {
        if (!this.isEnabled) return;

        this.isEnabled = false;

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        console.log('[Performance] Drag performance monitoring disabled');
        console.log('[Performance] Final metrics:', this.getMetrics());
    }

    /**
     * 拖拽开始
     */
    onDragStart() {
        this.metrics.dragStart = performance.now();
        this.metrics.frameCount = 0;
        console.log('[Performance] Drag started');
    }

    /**
     * 拖拽结束
     */
    onDragEnd() {
        this.metrics.dragEnd = performance.now();

        const duration = this.metrics.dragEnd - this.metrics.dragStart;
        const avgFps = this.metrics.frameCount / (duration / 1000);

        console.log('[Performance] Drag ended');
        console.log('[Performance] Duration:', duration.toFixed(2), 'ms');
        console.log('[Performance] Average FPS:', avgFps.toFixed(2));
        console.log('[Performance] Total frames:', this.metrics.frameCount);

        // 性能评估
        if (avgFps >= 50) {
            console.log('[Performance] ✅ Excellent performance');
        } else if (avgFps >= 30) {
            console.log('[Performance] ⚠️ Acceptable performance');
        } else {
            console.log('[Performance] ❌ Poor performance - optimization needed');
        }
    }

    /**
     * 监控FPS
     */
    monitorFPS() {
        if (!this.isEnabled) return;

        const now = performance.now();
        const delta = now - this.metrics.lastTime;

        if (delta >= 1000) { // 每秒更新一次
            this.metrics.fps = Math.round((this.metrics.frameCount * 1000) / delta);
            this.metrics.frameCount = 0;
            this.metrics.lastTime = now;

            // 只在拖拽时显示FPS
            if (this.metrics.dragStart && !this.metrics.dragEnd) {
                console.log('[Performance] Current FPS:', this.metrics.fps);
            }
        }

        this.metrics.frameCount++;

        requestAnimationFrame(() => this.monitorFPS());
    }

    /**
     * 获取当前指标
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * 重置指标
     */
    reset() {
        this.metrics = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0,
            dragStart: null,
            dragEnd: null,
            reflowCount: 0,
            repaintCount: 0
        };
    }
}

// 创建全局实例
window.DragPerformanceMonitor = new DragPerformanceMonitor();

// 提供便捷的启用/禁用方法
window.enableDragMonitoring = () => window.DragPerformanceMonitor.enable();
window.disableDragMonitoring = () => window.DragPerformanceMonitor.disable();

console.log('[Performance] DragPerformanceMonitor loaded. Use enableDragMonitoring() to start.');
