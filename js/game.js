class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 480;
        this.canvas.height = 720;

        this.ui = new UI();
        this.state = 'theme'; // 初始状态改为主题选择

        // 主题系统
        this.themeManager = themeManager;
        this.themeSelector = new ThemeSelector();
        this.renderers = null; // 在主题确认后初始化

        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.props = [];
        this.explosions = [];
        this.stars = [];
        this.floatingTexts = [];
        this.glitchChars = [];
        this.shootingStars = [];

        this.keys = {};
        this.mouseX = null;
        this.mouseY = null;
        this.useMouse = false;
        this.mouseDown = false;
        this.autoFire = true;

        this.frameCount = 0;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.bossSpawned = false;
        this.nextBossScore = 500;
        this.bestScore = parseInt(localStorage.getItem('planeWarBest') || '0');

        this.spawnRate = 60;
        this.enemySpeedMult = 1;
        this.killCount = 0;
        this.propCount = 0;
        this.combo = 0;
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.bossWarning = { active: false, timer: 0, alpha: 0 };

        this.scanlineCanvas = null;
        this.vignetteCanvas = null;

        this.initStars();
        this.initPostFX();
        this.bindEvents();

        // 启动：先显示主题选择
        this.showThemeSelection();
    }

    // ========== 主题选择流程 ==========

    async showThemeSelection() {
        this.state = 'theme';
        this.ui.hideAll();

        // 等待用户选择主题
        const selectedThemeId = await this.themeSelector.show();

        // 应用主题
        this.themeManager.switchTheme(selectedThemeId);
        this.themeManager.applyThemeToDOM();

        // 初始化渲染器
        this.renderers = this.themeManager.getRenderers();

        // 重新生成后处理效果（因为主题可能改变参数）
        this.initPostFX();

        // 进入菜单
        this.state = 'menu';
        this.ui.showMenu();
        this.menuLoop();
    }

    // ========== 后处理效果 ==========

    initPostFX() {
        const theme = this.themeManager.getCurrentTheme();
        const effectParams = theme ? theme.effectParams : { scanlineEnabled: true, scanlineIntensity: 0.04, vignetteEnabled: true };

        // 扫描线
        this.scanlineCanvas = document.createElement('canvas');
        this.scanlineCanvas.width = 480;
        this.scanlineCanvas.height = 720;
        const slCtx = this.scanlineCanvas.getContext('2d');
        if (effectParams.scanlineEnabled) {
            slCtx.fillStyle = 'rgba(0, 0, 0, ' + (effectParams.scanlineIntensity || 0.04) + ')';
            for (let y = 0; y < 720; y += 3) {
                slCtx.fillRect(0, y, 480, 1);
            }
        }

        // 暗角
        this.vignetteCanvas = document.createElement('canvas');
        this.vignetteCanvas.width = 480;
        this.vignetteCanvas.height = 720;
        const vCtx = this.vignetteCanvas.getContext('2d');
        if (effectParams.vignetteEnabled) {
            const intensity = effectParams.vignetteIntensity || 0.3;
            const vg = vCtx.createRadialGradient(240, 360, 200, 240, 360, 420);
            vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vg.addColorStop(0.75, 'rgba(0, 0, 0, ' + (intensity * 0.5) + ')');
            vg.addColorStop(1, 'rgba(0, 0, 0, ' + intensity + ')');
            vCtx.fillStyle = vg;
            vCtx.fillRect(0, 0, 480, 720);
        }
    }

    // ========== 星空初始化 ==========

    initStars() {
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * 480, y: Math.random() * 720,
                size: Math.random() * 1 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                brightness: Math.random() * 0.3 + 0.1,
                flicker: Math.random() * 10
            });
        }
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * 480, y: Math.random() * 720,
                size: Math.random() * 1.5 + 0.8,
                speed: Math.random() * 1 + 0.8,
                brightness: Math.random() * 0.4 + 0.3,
                flicker: Math.random() * 10
            });
        }
        for (let i = 0; i < 20; i++) {
            this.stars.push({
                x: Math.random() * 480, y: Math.random() * 720,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1.5 + 1.5,
                brightness: Math.random() * 0.5 + 0.5,
                flicker: Math.random() * 10
            });
        }
    }

    // ========== 事件绑定 ==========

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // 主题选择界面的键盘导航
            if (this.state === 'theme' && this.themeSelector) {
                this.themeSelector.handleKey(e.key);
                return;
            }

            if (e.key === 'p' || e.key === 'P') {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            }
            if (e.key === ' ' && this.state === 'playing') e.preventDefault();
        });
        document.addEventListener('keyup', (e) => { this.keys[e.key] = false; });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.useMouse = true;
        });
        this.canvas.addEventListener('mousedown', () => { this.mouseDown = true; this.useMouse = true; });
        this.canvas.addEventListener('mouseup', () => { this.mouseDown = false; });
        this.canvas.addEventListener('mouseleave', () => { this.mouseX = null; this.mouseY = null; });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
            this.useMouse = true;
        }, { passive: false });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
            this.useMouse = true;
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => { this.mouseDown = false; });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        const restartBtnPause = document.getElementById('restartBtnPause');
        if (restartBtnPause) restartBtnPause.addEventListener('click', () => this.restart());
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.resume());
    }

    // ========== 游戏状态控制 ==========

    start() {
        this.player = new Player(240, 580);
        this.bullets = [];
        this.enemies = [];
        this.props = [];
        this.explosions = [];
        this.floatingTexts = [];
        this.glitchChars = [];
        this.shootingStars = [];
        this.frameCount = 0;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.bossSpawned = false;
        this.nextBossScore = 500;
        this.spawnRate = 60;
        this.enemySpeedMult = 1;
        this.killCount = 0;
        this.propCount = 0;
        this.combo = 0;
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.bossWarning = { active: false, timer: 0, alpha: 0 };
        this.state = 'playing';
        this.ui.hideAll();
        this.loop();
    }

    restart() { this.start(); }

    pause() {
        this.state = 'paused';
        this.ui.showPause();
    }

    resume() {
        this.state = 'playing';
        this.ui.hidePause();
        this.loop();
    }

    gameOver() {
        this.state = 'gameover';
        if (this.player.score > this.bestScore) {
            this.bestScore = this.player.score;
            localStorage.setItem('planeWarBest', this.bestScore);
        }
        const seconds = Math.floor(this.gameTime / 60);
        this.ui.showGameOver(this.player.score, this.bestScore, this.killCount, this.propCount, seconds);
    }

    // ========== 游戏循环 ==========

    menuLoop() {
        if (this.state !== 'menu') return;
        this.frameCount++;
        this.updateStars();
        this.drawBackground();
        requestAnimationFrame(() => this.menuLoop());
    }

    loop() {
        if (this.state !== 'playing') return;
        this.frameCount++;
        this.gameTime++;

        this.updateDifficulty();
        this.updateScreenShake();
        this.updateBossWarning();
        this.updateFloatingTexts();
        this.updateGlitchChars();

        if (this.player && this.player.alive) {
            this.player.update(this.keys, this.mouseX, this.mouseY, this.useMouse);
            if ((this.autoFire || this.mouseDown || this.keys[' '] || this.keys['Space']) && this.player.canFire()) {
                this.bullets.push(...this.player.fire());
            }
        }

        this.spawnEnemies();
        this.bullets.forEach(b => b.update());
        this.bullets = this.bullets.filter(b => b.alive);
        this.enemies.forEach(e => e.update());
        this.enemies.forEach(e => { const eb = e.tryShoot(); if (eb) this.bullets.push(...eb); });
        this.enemies = this.enemies.filter(e => e.alive);
        this.props.forEach(p => p.update());
        this.props = this.props.filter(p => p.alive);
        this.explosions = this.explosions.filter(exp => { exp.timer++; return exp.timer < exp.maxTimer; });
        this.updateStars();
        this.updateShootingStars();
        this.checkCollisions();

        if (this.player && !this.player.alive) {
            this.addScreenShake(12, 15);
            this.createExplosion(this.player.x, this.player.y, 'large');
            this.gameOver();
        }

        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    // ========== 更新逻辑 ==========

    updateDifficulty() {
        const level = Math.floor(this.gameTime / 1800) + 1;
        this.spawnRate = Math.max(15, 60 - level * 5);
        this.enemySpeedMult = 1 + (level - 1) * 0.15;
    }

    spawnEnemies() {
        this.spawnTimer++;
        if (this.player.score >= this.nextBossScore && !this.bossSpawned) {
            if (!this.bossWarning.active) {
                this.bossWarning = { active: true, timer: 80, alpha: 0 };
            }
            this.bossWarning.timer--;
            this.bossWarning.alpha = Math.abs(Math.sin(this.frameCount * 0.15)) * 0.4;
            if (this.bossWarning.timer <= 0) {
                const boss = new Enemy('boss');
                boss.speed *= this.enemySpeedMult;
                this.enemies.push(boss);
                this.bossSpawned = true;
                this.bossWarning.active = false;
                this.addScreenShake(8, 15);
            }
            return;
        }
        if (this.bossSpawned && !this.enemies.some(e => e.type === 'boss' && e.alive)) {
            this.bossSpawned = false;
            this.nextBossScore += 500 + Math.floor(this.gameTime / 1800) * 200;
        }
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            const rand = Math.random();
            let type;
            if (rand < 0.55) type = 'small';
            else if (rand < 0.8) type = 'medium';
            else type = 'large';
            const enemy = new Enemy(type);
            enemy.speed *= this.enemySpeedMult;
            this.enemies.push(enemy);
        }
    }

    checkCollisions() {
        const player = this.player;
        if (!player) return;

        this.bullets.forEach(bullet => {
            if (!bullet.alive || bullet.isEnemy) return;
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                if (this.rectCollide(
                    bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height,
                    enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height
                )) {
                    bullet.alive = false;
                    const destroyed = enemy.hit();
                    if (destroyed) {
                        player.score += enemy.score;
                        this.killCount++;
                        this.combo++;
                        const expType = enemy.type === 'boss' ? 'boss' : enemy.type;
                        this.createExplosion(enemy.x, enemy.y, expType);
                        this.addScreenShake(enemy.type === 'boss' ? 12 : enemy.type === 'large' ? 5 : 2, 8);
                        this.addFloatingText(enemy.x, enemy.y, '+' + enemy.score, '#00ff41');
                        if (this.combo > 1) {
                            this.addFloatingText(enemy.x, enemy.y - 25, this.combo + 'x COMBO', '#39ff14');
                        }
                        if (Math.random() < 0.3) this.props.push(PropFactory.create(enemy.x, enemy.y));
                    }
                }
            });
        });
        this.bullets.forEach(bullet => {
            if (!bullet.alive || !bullet.isEnemy) return;
            if (this.rectCollide(
                bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height,
                player.x - player.width / 4, player.y - player.height / 4, player.width / 2, player.height / 2
            )) {
                bullet.alive = false;
                if (!player.hit()) {
                    this.createExplosion(player.x, player.y, 'tiny');
                    this.addScreenShake(3, 6);
                    this.combo = 0;
                }
            }
        });
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            if (this.rectCollide(
                enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height,
                player.x - player.width / 4, player.y - player.height / 4, player.width / 2, player.height / 2
            )) {
                enemy.alive = false;
                this.createExplosion(enemy.x, enemy.y, enemy.type);
                this.addScreenShake(6, 8);
                player.score += enemy.score;
                player.hit();
                this.combo = 0;
            }
        });
        this.props.forEach(prop => {
            if (!prop.alive) return;
            if (this.rectCollide(
                prop.x - prop.width / 2, prop.y - prop.height / 2, prop.width, prop.height,
                player.x - player.width / 2, player.y - player.height / 2, player.width, player.height
            )) {
                prop.alive = false;
                this.propCount++;
                const result = prop.applyTo(player);
                this.addFloatingText(prop.x, prop.y, prop.type.toUpperCase(), '#00ff41');
                if (result === 'bomb') {
                    this.enemies.forEach(e => {
                        if (e.alive) { e.alive = false; player.score += e.score; this.createExplosion(e.x, e.y, 'small'); }
                    });
                    this.addScreenShake(10, 20);
                }
                this.createExplosion(prop.x, prop.y, 'prop');
            }
        });
    }

    rectCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    createExplosion(x, y, type) {
        const explosion = { x, y, particles: [], rings: [], timer: 0, maxTimer: 20 };
        const count = type === 'boss' ? 40 : type === 'large' ? 25 : type === 'medium' ? 18 : type === 'small' ? 12 : 6;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
            const speed = (2 + Math.random() * 3) * (type === 'boss' ? 1.5 : 1);
            explosion.particles.push({
                x: 0, y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2,
                color: '#00ff41',
                glitch: Math.random() > 0.5
            });
        }
        if (type !== 'tiny') {
            explosion.rings.push({
                radius: 0,
                maxRadius: type === 'boss' ? 80 : type === 'large' ? 50 : type === 'medium' ? 40 : 30,
                speed: type === 'boss' ? 3 : 2,
                alpha: 0.5
            });
        }
        this.explosions.push(explosion);
        this.addGlitchChars(x, y);
    }

    addFloatingText(x, y, text, color) {
        this.floatingTexts.push({ x, y, text, color, life: 40, maxLife: 40 });
    }

    addGlitchChars(x, y) {
        if (Math.random() > 0.3) return;
        const chars = ['0', '1', 'A', 'B', 'C', 'X', 'Y', 'Z', '#', '@'];
        for (let i = 0; i < 8; i++) {
            this.glitchChars.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                char: chars[Math.floor(Math.random() * chars.length)],
                life: 10 + Math.random() * 15,
                maxLife: 25,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1
            });
        }
    }

    updateFloatingTexts() {
        this.floatingTexts = this.floatingTexts.filter(t => { t.y -= 1.5; t.life--; return t.life > 0; });
    }

    updateGlitchChars() {
        this.glitchChars = this.glitchChars.filter(g => { g.x += g.vx; g.y += g.vy; g.life--; return g.life > 0; });
    }

    addScreenShake(intensity, duration) {
        if (intensity > this.screenShake.intensity || duration > this.screenShake.duration) {
            this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
            this.screenShake.duration = Math.max(this.screenShake.duration, duration);
        }
    }

    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            const decay = this.screenShake.duration / (this.screenShake.duration + 1);
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * decay;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * decay;
            this.screenShake.duration--;
            this.screenShake.intensity *= 0.9;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }

    updateBossWarning() {}

    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > 722) { star.y = -2; star.x = Math.random() * 480; }
        });
        // 流星
        if (Math.random() < 0.003) {
            this.shootingStars.push({
                x: Math.random() * 480, y: -10,
                vx: (Math.random() - 0.5) * 5, vy: 8 + Math.random() * 6,
                length: 20 + Math.random() * 40,
                life: 40 + Math.random() * 30, maxLife: 70
            });
        }
    }

    updateShootingStars() {
        this.shootingStars = this.shootingStars.filter(s => {
            s.x += s.vx; s.y += s.vy; s.life--;
            return s.life > 0 && s.y < 740;
        });
    }

    // ========== 绘制（委托给主题渲染器）==========

    draw() {
        const ctx = this.ctx;
        ctx.save();
        if (this.screenShake.x !== 0 || this.screenShake.y !== 0) {
            ctx.translate(this.screenShake.x, this.screenShake.y);
        }

        // 使用主题渲染器绘制
        if (this.renderers) {
            this.renderers.background.draw(ctx, this.stars, this.shootingStars, this.frameCount);
            this.drawProps();
            this.drawBullets();
            this.drawEnemies();
            this.drawPlayer();
            this.renderers.effect.draw(ctx, this.explosions);
            this.drawFloatingTexts();
            this.drawGlitchChars();
            this.renderers.ui.drawHUD(ctx, this.player, this.gameTime);
        } else {
            // 降级：无渲染器时使用基础绘制
            this.drawBackground();
            this.drawProps();
            this.drawBullets();
            this.drawEnemies();
            this.drawPlayer();
            this.drawExplosions();
            this.drawFloatingTexts();
            this.drawGlitchChars();
            this.drawHUD();
        }

        // Boss 警告
        if (this.bossWarning.active) {
            ctx.fillStyle = 'rgba(255, 0, 0, ' + (this.bossWarning.alpha * 0.3) + ')';
            ctx.fillRect(0, 0, 480, 720);
            const pulse = Math.abs(Math.sin(this.frameCount * 0.12));
            ctx.fillStyle = 'rgba(255, 50, 50, ' + (0.7 + pulse * 0.3) + ')';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ WARNING ⚠', 240, 320);
            ctx.font = '14px monospace';
            ctx.fillText('BOSS APPROACHING', 240, 350);
        }

        ctx.restore();

        // 后处理
        if (this.scanlineCanvas) ctx.drawImage(this.scanlineCanvas, 0, 0);
        if (this.vignetteCanvas) ctx.drawImage(this.vignetteCanvas, 0, 0);
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 480, 720);

        ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < 480; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke();
        }
        for (let y = 0; y < 720; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(480, y); ctx.stroke();
        }

        this.stars.forEach(star => {
            const flicker = Math.sin(this.frameCount * 0.02 + star.flicker) * 0.3 + 0.7;
            ctx.fillStyle = 'rgba(0, 255, 65, ' + (flicker * star.brightness) + ')';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    drawPlayer() {
        if (!this.player) return;
        if (this.renderers) {
            this.renderers.player.draw(this.ctx, this.player);
        } else {
            this.player.draw(this.ctx);
        }
    }

    drawBullets() {
        if (this.renderers) {
            this.bullets.forEach(b => this.renderers.bullet.draw(this.ctx, b));
        } else {
            this.bullets.forEach(b => b.draw(this.ctx));
        }
    }

    drawEnemies() {
        if (this.renderers) {
            this.enemies.forEach(e => this.renderers.enemy.draw(this.ctx, e));
        } else {
            this.enemies.forEach(e => e.draw(this.ctx));
        }
    }

    drawProps() {
        if (this.renderers) {
            this.props.forEach(p => this.renderers.prop.draw(this.ctx, p));
        } else {
            this.props.forEach(p => p.draw(this.ctx));
        }
    }

    drawExplosions() {
        const ctx = this.ctx;
        this.explosions.forEach(exp => {
            const progress = exp.timer / exp.maxTimer;
            exp.rings.forEach(ring => {
                ring.radius += ring.speed;
                ring.alpha *= 0.93;
                if (ring.alpha > 0.01) {
                    ctx.strokeStyle = 'rgba(0, 255, 65, ' + ring.alpha + ')';
                    ctx.lineWidth = 2 * (1 - progress);
                    ctx.beginPath();
                    ctx.arc(exp.x, exp.y, ring.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
            exp.particles.forEach(p => {
                if (exp.timer > 15) return;
                p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95;
                const alpha = 1 - exp.timer / 15;
                ctx.globalAlpha = alpha;
                if (p.glitch && Math.random() > 0.5) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(exp.x + p.x - 3, exp.y + p.y - 1, 6, 2);
                } else {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(exp.x + p.x - p.size, exp.y + p.y - p.size, p.size * 2, p.size * 2);
                }
            });
            ctx.globalAlpha = 1;
        });
    }

    drawFloatingTexts() {
        const ctx = this.ctx;
        this.floatingTexts.forEach(t => {
            const alpha = t.life / t.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.color;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
        });
        ctx.globalAlpha = 1;
    }

    drawGlitchChars() {
        const ctx = this.ctx;
        ctx.font = '10px monospace';
        this.glitchChars.forEach(g => {
            const alpha = g.life / g.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#00ff41';
            ctx.fillText(g.char, g.x, g.y);
        });
        ctx.globalAlpha = 1;
    }

    drawHUD() {
        if (this.player && this.state === 'playing') {
            this.ui.drawHUD(this.ctx, this.player, this.gameTime);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
