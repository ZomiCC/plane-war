// 游戏主控制器
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 480;
        this.canvas.height = 720;

        this.ui = new UI();
        this.state = 'menu';

        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.props = [];
        this.explosions = [];
        this.stars = [];
        this.nebulaClouds = [];
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

        this.initStars();
        this.initNebula();
        this.bindEvents();
        this.ui.showMenu();
        this.menuLoop();
    }

    initStars() {
        // 多层星空（远、中、近）
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * 480,
                y: Math.random() * 720,
                size: Math.random() * 1 + 0.3,
                speed: Math.random() * 0.5 + 0.2,
                brightness: Math.random() * 0.3 + 0.1,
                layer: 0 // 远景
            });
        }
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * 480,
                y: Math.random() * 720,
                size: Math.random() * 1.5 + 0.8,
                speed: Math.random() * 1 + 0.8,
                brightness: Math.random() * 0.4 + 0.3,
                layer: 1 // 中景
            });
        }
        for (let i = 0; i < 20; i++) {
            this.stars.push({
                x: Math.random() * 480,
                y: Math.random() * 720,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1.5 + 1.5,
                brightness: Math.random() * 0.5 + 0.5,
                layer: 2 // 近景
            });
        }
    }

    initNebula() {
        // 星云团
        const colors = [
            { r: 30, g: 10, b: 80 },
            { r: 10, g: 30, b: 70 },
            { r: 50, g: 10, b: 40 },
            { r: 10, g: 40, b: 50 },
            { r: 20, g: 20, b: 60 }
        ];
        for (let i = 0; i < 5; i++) {
            const c = colors[i % colors.length];
            this.nebulaClouds.push({
                x: Math.random() * 480,
                y: Math.random() * 720,
                radius: 80 + Math.random() * 120,
                color: c,
                speed: 0.15 + Math.random() * 0.1,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
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
            this.mouseDown = true;
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => { this.mouseDown = false; });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resume());
        document.getElementById('restartBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtnPause').addEventListener('click', () => this.start());
    }

    start() {
        this.player = new Player(240, 620);
        this.bullets = [];
        this.enemies = [];
        this.props = [];
        this.explosions = [];
        this.frameCount = 0;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.bossSpawned = false;
        this.nextBossScore = 500;
        this.spawnRate = 60;
        this.enemySpeedMult = 1;
        this.state = 'playing';
        this.ui.hideAll();
        this.gameLoop();
    }

    pause() { this.state = 'paused'; this.ui.showPause(); }
    resume() { this.state = 'playing'; this.ui.hidePause(); this.gameLoop(); }

    gameOver() {
        this.state = 'gameover';
        if (this.player.score > this.bestScore) {
            this.bestScore = this.player.score;
            localStorage.setItem('planeWarBest', this.bestScore.toString());
        }
        this.ui.showGameOver(this.player.score, this.bestScore);
    }

    menuLoop() {
        if (this.state !== 'menu' && this.state !== 'gameover') return;
        this.frameCount++;
        this.updateStars();
        this.updateNebula();
        this.drawBackground();
        requestAnimationFrame(() => this.menuLoop());
    }

    gameLoop() {
        if (this.state !== 'playing') return;
        this.frameCount++;
        this.gameTime++;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateDifficulty();
        this.player.update(this.keys, this.mouseX, this.mouseY, this.useMouse);

        if (this.autoFire || this.keys[' '] || this.mouseDown) {
            if (this.player.canFire()) {
                this.bullets.push(...this.player.fire());
            }
        }

        this.spawnEnemies();
        this.bullets.forEach(b => b.update());
        this.bullets = this.bullets.filter(b => b.alive);
        this.enemies.forEach(e => e.update());
        this.enemies.forEach(e => {
            const eb = e.tryShoot();
            if (eb) this.bullets.push(...eb);
        });
        this.enemies = this.enemies.filter(e => e.alive);
        this.props.forEach(p => p.update());
        this.props = this.props.filter(p => p.alive);
        this.explosions = this.explosions.filter(exp => { exp.timer++; return exp.timer < exp.maxTimer; });
        this.updateStars();
        this.updateNebula();
        this.updateShootingStars();
        this.checkCollisions();

        if (!this.player.alive) {
            this.createExplosion(this.player.x, this.player.y, 'large');
            this.gameOver();
        }
    }

    updateDifficulty() {
        const level = Math.floor(this.gameTime / 1800) + 1;
        this.spawnRate = Math.max(15, 60 - level * 5);
        this.enemySpeedMult = 1 + (level - 1) * 0.15;
    }

    spawnEnemies() {
        this.spawnTimer++;
        if (this.player.score >= this.nextBossScore && !this.bossSpawned) {
            const boss = new Enemy('boss');
            boss.speed *= this.enemySpeedMult;
            this.enemies.push(boss);
            this.bossSpawned = true;
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
        this.bullets.forEach(bullet => {
            if (!bullet.alive || bullet.isEnemy) return;
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                if (this.rectCollide(
                    bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height,
                    enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height
                )) {
                    bullet.alive = false;
                    if (enemy.hit()) {
                        player.score += enemy.score;
                        this.createExplosion(enemy.x, enemy.y, enemy.type === 'boss' ? 'boss' : enemy.type);
                        if (enemy.type === 'boss' || Math.random() < 0.2) this.props.push(PropFactory.create(enemy.x, enemy.y));
                        if (enemy.type === 'boss') {
                            this.props.push(PropFactory.create(enemy.x - 30, enemy.y));
                            this.props.push(PropFactory.create(enemy.x + 30, enemy.y));
                        }
                    } else {
                        this.createExplosion(bullet.x, bullet.y, 'tiny');
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
                if (!player.hit()) this.createExplosion(player.x, player.y, 'tiny');
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
                player.score += enemy.score;
                player.hit();
            }
        });
        this.props.forEach(prop => {
            if (!prop.alive) return;
            if (this.rectCollide(
                prop.x - prop.width / 2, prop.y - prop.height / 2, prop.width, prop.height,
                player.x - player.width / 2, player.y - player.height / 2, player.width, player.height
            )) {
                prop.alive = false;
                const result = prop.applyTo(player);
                if (result === 'bomb') {
                    this.enemies.forEach(e => {
                        if (e.alive) { e.alive = false; player.score += e.score; this.createExplosion(e.x, e.y, 'small'); }
                    });
                }
                this.createExplosion(prop.x, prop.y, 'prop');
            }
        });
    }

    rectCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    createExplosion(x, y, type) {
        const colors = {
            tiny: ['#ffcc44', '#ff8822'],
            small: ['#ff6644', '#ffaa22', '#ffdd44', '#ffffff'],
            medium: ['#ff4422', '#ff8822', '#ffcc22', '#ffee66', '#ffffff'],
            large: ['#ff2222', '#ff6622', '#ffaa22', '#ffdd44', '#ffffff'],
            boss: ['#ff0022', '#ff4444', '#ff8822', '#ffcc22', '#ffffff', '#ff66ff'],
            prop: ['#00ffaa', '#00ccff', '#ffffff']
        };
        const counts = { tiny: 5, small: 14, medium: 22, large: 32, boss: 50, prop: 10 };
        const sizes = { tiny: 2, small: 3.5, medium: 4.5, large: 5.5, boss: 7, prop: 3 };
        const speeds = { tiny: 1.5, small: 2.5, medium: 3.5, large: 4.5, boss: 5.5, prop: 2.5 };
        const timers = { tiny: 12, small: 22, medium: 28, large: 35, boss: 45, prop: 18 };

        const explosion = { x, y, particles: [], rings: [], timer: 0, maxTimer: timers[type] || 22 };

        const count = counts[type] || 14;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
            const speed = (speeds[type] || 2.5) * (0.4 + Math.random() * 0.8);
            explosion.particles.push({
                x: 0, y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: (sizes[type] || 3) * (0.5 + Math.random()),
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                life: (timers[type] || 22) * (0.5 + Math.random() * 0.5),
                maxLife: timers[type] || 22
            });
        }

        // 冲击波环
        if (type !== 'tiny') {
            explosion.rings.push({
                radius: 0,
                maxRadius: type === 'boss' ? 80 : type === 'large' ? 50 : type === 'medium' ? 40 : 30,
                speed: type === 'boss' ? 3 : 2,
                alpha: 0.6
            });
        }

        this.explosions.push(explosion);
    }

    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > 722) {
                star.y = -2;
                star.x = Math.random() * 480;
            }
        });
        // 偶尔产生流星
        if (Math.random() < 0.003) {
            this.shootingStars.push({
                x: Math.random() * 480,
                y: -10,
                vx: (Math.random() - 0.3) * 3,
                vy: 6 + Math.random() * 4,
                life: 40 + Math.random() * 30,
                maxLife: 40 + Math.random() * 30,
                length: 30 + Math.random() * 20
            });
        }
    }

    updateNebula() {
        this.nebulaClouds.forEach(cloud => {
            cloud.y += cloud.speed;
            cloud.phase += 0.003;
            if (cloud.y > 720 + cloud.radius) {
                cloud.y = -cloud.radius;
                cloud.x = Math.random() * 480;
            }
        });
    }

    updateShootingStars() {
        this.shootingStars = this.shootingStars.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life--;
            return s.life > 0 && s.y < 740;
        });
    }

    draw() {
        this.drawBackground();
        this.drawProps();
        this.drawBullets();
        this.drawEnemies();
        this.drawPlayer();
        this.drawExplosions();
        this.drawHUD();
    }

    drawBackground() {
        const ctx = this.ctx;

        // 深空渐变
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 720);
        bgGrad.addColorStop(0, '#030518');
        bgGrad.addColorStop(0.3, '#060822');
        bgGrad.addColorStop(0.6, '#0a0a2a');
        bgGrad.addColorStop(1, '#050820');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 480, 720);

        // 星云
        this.nebulaClouds.forEach(cloud => {
            const pulse = Math.sin(cloud.phase) * 0.15 + 0.85;
            const r = cloud.color.r;
            const g = cloud.color.g;
            const b = cloud.color.b;
            const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius * pulse);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
            grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.04)`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius * pulse, 0, Math.PI * 2);
            ctx.fill();
        });

        // 星星
        this.stars.forEach(star => {
            const flicker = Math.sin(this.frameCount * 0.015 + star.x * 0.5 + star.y * 0.3) * 0.2 + 0.8;
            const alpha = star.brightness * flicker;
            // 近景星星有十字光芒
            if (star.layer === 2 && star.size > 2) {
                ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(star.x - star.size * 2, star.y);
                ctx.lineTo(star.x + star.size * 2, star.y);
                ctx.moveTo(star.x, star.y - star.size * 2);
                ctx.lineTo(star.x, star.y + star.size * 2);
                ctx.stroke();
            }
            ctx.fillStyle = star.layer === 2
                ? `rgba(220, 235, 255, ${alpha})`
                : star.layer === 1
                    ? `rgba(180, 200, 240, ${alpha})`
                    : `rgba(140, 160, 200, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 流星
        this.shootingStars.forEach(s => {
            const alpha = s.life / s.maxLife;
            const tailX = s.x - s.vx * (s.length / s.vy);
            const tailY = s.y - s.length;
            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(220, 240, 255, ${alpha * 0.8})`);
            grad.addColorStop(1, `rgba(150, 180, 255, 0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            // 流星头部发光
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawPlayer() { if (this.player) this.player.draw(this.ctx); }
    drawBullets() { this.bullets.forEach(b => b.draw(this.ctx)); }
    drawEnemies() { this.enemies.forEach(e => e.draw(this.ctx)); }
    drawProps() { this.props.forEach(p => p.draw(this.ctx)); }

    drawExplosions() {
        const ctx = this.ctx;
        this.explosions.forEach(exp => {
            const progress = exp.timer / exp.maxTimer;

            // 冲击波环
            exp.rings.forEach(ring => {
                ring.radius += ring.speed;
                ring.alpha *= 0.95;
                if (ring.alpha > 0.01) {
                    ctx.strokeStyle = `rgba(255, 200, 100, ${ring.alpha})`;
                    ctx.lineWidth = 2 * (1 - progress);
                    ctx.beginPath();
                    ctx.arc(exp.x, exp.y, ring.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            // 中心闪光
            if (exp.timer < 5) {
                const flashAlpha = (1 - exp.timer / 5) * 0.6;
                const flashGrad = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, 20);
                flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flashAlpha})`);
                flashGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(exp.x, exp.y, 20, 0, Math.PI * 2);
                ctx.fill();
            }

            // 粒子
            exp.particles.forEach(p => {
                if (exp.timer > p.life) return;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                const lifeRatio = 1 - exp.timer / p.life;
                const alpha = lifeRatio;
                const size = p.size * (1 - progress * 0.4);
                ctx.globalAlpha = Math.max(0, alpha);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(exp.x + p.x, exp.y + p.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        });
    }

    drawHUD() {
        if (this.player && this.state === 'playing') {
            this.ui.drawHUD(this.ctx, this.player, this.gameTime);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => { new Game(); });
