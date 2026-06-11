// 玩家飞机类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 52;
        this.height = 60;
        this.speed = 6;
        this.lives = 3;
        this.score = 0;
        this.alive = true;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.shield = false;
        this.bulletType = 'normal';
        this.bulletTimer = 0;
        this.fireRate = 12;
        this.propTimer = 0;
        this.visible = true;
        this.flickerCount = 0;
        this.engineParticles = [];
        this.animTimer = 0;
    }

    update(keys, mouseX, mouseY, useMouse) {
        if (!this.alive) return;
        this.animTimer++;

        if (useMouse && mouseX !== null) {
            this.x = mouseX;
            this.y = mouseY;
        } else {
            if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.x -= this.speed;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) this.x += this.speed;
            if (keys['ArrowUp'] || keys['w'] || keys['W']) this.y -= this.speed;
            if (keys['ArrowDown'] || keys['s'] || keys['S']) this.y += this.speed;
        }

        this.x = Math.max(this.width / 2, Math.min(480 - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(720 - this.height / 2, this.y));

        if (this.invincible) {
            this.invincibleTimer--;
            this.flickerCount++;
            this.visible = Math.floor(this.flickerCount / 4) % 2 === 0;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.visible = true;
                this.flickerCount = 0;
            }
        }

        if (this.propTimer > 0) {
            this.propTimer--;
            if (this.propTimer <= 0) {
                this.bulletType = 'normal';
                this.fireRate = 12;
            }
        }

        this.bulletTimer++;

        // 双引擎尾焰粒子
        const engines = [-8, 8];
        engines.forEach(ox => {
            if (Math.random() > 0.15) {
                this.engineParticles.push({
                    x: this.x + ox + (Math.random() - 0.5) * 4,
                    y: this.y + this.height / 2 - 4,
                    size: Math.random() * 3.5 + 1.5,
                    life: 20,
                    maxLife: 20,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: Math.random() * 3 + 1.5,
                    hue: 190 + Math.random() * 40
                });
            }
        });
        this.engineParticles = this.engineParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.93;
            return p.life > 0;
        });
    }

    canFire() {
        return this.bulletTimer >= this.fireRate;
    }

    fire() {
        this.bulletTimer = 0;
        const bullets = [];
        const bulletSpeed = 10;

        switch (this.bulletType) {
            case 'double':
                bullets.push(new Bullet(this.x - 12, this.y - this.height / 2 + 4, bulletSpeed, 'double'));
                bullets.push(new Bullet(this.x + 12, this.y - this.height / 2 + 4, bulletSpeed, 'double'));
                break;
            case 'power':
                bullets.push(new Bullet(this.x - 6, this.y - this.height / 2, bulletSpeed, 'power'));
                bullets.push(new Bullet(this.x + 6, this.y - this.height / 2, bulletSpeed, 'power'));
                break;
            default:
                bullets.push(new Bullet(this.x, this.y - this.height / 2, bulletSpeed, 'normal'));
        }
        return bullets;
    }

    hit() {
        if (this.invincible) return false;

        if (this.shield) {
            this.shield = false;
            this.invincible = true;
            this.invincibleTimer = 60;
            return false;
        }

        this.lives--;
        if (this.lives <= 0) {
            this.alive = false;
            return true;
        }
        this.invincible = true;
        this.invincibleTimer = 120;
        return false;
    }

    draw(ctx) {
        if (!this.alive) return;
        if (!this.visible) return;

        // 引擎尾焰粒子
        this.engineParticles.forEach(p => {
            const alpha = (p.life / p.maxLife) * 0.8;
            const r = Math.floor(128 + 127 * (1 - p.life / p.maxLife));
            const g = Math.floor(200 * (p.life / p.maxLife));
            const b = 255;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.save();
        ctx.translate(this.x, this.y);

        // === 引擎发光 ===
        const engineGlow = Math.sin(this.animTimer * 0.15) * 0.3 + 0.7;
        [-8, 8].forEach(ox => {
            const eg = ctx.createRadialGradient(ox, this.height / 2 - 2, 0, ox, this.height / 2 + 6, 14);
            eg.addColorStop(0, `rgba(100, 200, 255, ${0.8 * engineGlow})`);
            eg.addColorStop(0.4, `rgba(50, 120, 255, ${0.4 * engineGlow})`);
            eg.addColorStop(1, 'rgba(20, 60, 200, 0)');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.ellipse(ox, this.height / 2 + 2, 6, 12 * engineGlow, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // === 主翼（后掠翼设计）===
        const wingGrad = ctx.createLinearGradient(-this.width / 2, 6, this.width / 2, 6);
        wingGrad.addColorStop(0, '#0d3354');
        wingGrad.addColorStop(0.3, '#1a6699');
        wingGrad.addColorStop(0.5, '#2299cc');
        wingGrad.addColorStop(0.7, '#1a6699');
        wingGrad.addColorStop(1, '#0d3354');
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = 'rgba(80, 200, 255, 0.6)';
        ctx.lineWidth = 1;

        // 左翼
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(-this.width / 2, 14);
        ctx.lineTo(-this.width / 2 + 2, 20);
        ctx.lineTo(-14, 14);
        ctx.lineTo(-7, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 右翼
        ctx.beginPath();
        ctx.moveTo(7, -4);
        ctx.lineTo(this.width / 2, 14);
        ctx.lineTo(this.width / 2 - 2, 20);
        ctx.lineTo(14, 14);
        ctx.lineTo(7, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // === 尾翼 ===
        ctx.fillStyle = '#1a5588';
        ctx.beginPath();
        ctx.moveTo(-5, this.height / 2 - 10);
        ctx.lineTo(-16, this.height / 2);
        ctx.lineTo(-12, this.height / 2);
        ctx.lineTo(-4, this.height / 2 - 4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, this.height / 2 - 10);
        ctx.lineTo(16, this.height / 2);
        ctx.lineTo(12, this.height / 2);
        ctx.lineTo(4, this.height / 2 - 4);
        ctx.closePath();
        ctx.fill();

        // === 机身主体 ===
        const bodyGrad = ctx.createLinearGradient(-10, 0, 10, 0);
        bodyGrad.addColorStop(0, '#0e4470');
        bodyGrad.addColorStop(0.3, '#1e88bb');
        bodyGrad.addColorStop(0.5, '#44ccee');
        bodyGrad.addColorStop(0.7, '#1e88bb');
        bodyGrad.addColorStop(1, '#0e4470');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);           // 机头尖端
        ctx.lineTo(-4, -this.height / 2 + 8);
        ctx.lineTo(-8, -this.height / 4);
        ctx.lineTo(-10, 6);
        ctx.lineTo(-8, this.height / 2 - 6);
        ctx.lineTo(-5, this.height / 2);
        ctx.lineTo(5, this.height / 2);
        ctx.lineTo(8, this.height / 2 - 6);
        ctx.lineTo(10, 6);
        ctx.lineTo(8, -this.height / 4);
        ctx.lineTo(4, -this.height / 2 + 8);
        ctx.closePath();
        ctx.fill();

        // 机身描边高光
        ctx.strokeStyle = 'rgba(100, 220, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 机身高光线
        ctx.strokeStyle = 'rgba(150, 230, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2 + 4);
        ctx.lineTo(0, this.height / 2 - 4);
        ctx.stroke();

        // === 驾驶舱 ===
        const cockpitGrad = ctx.createRadialGradient(0, -10, 0, 0, -8, 10);
        cockpitGrad.addColorStop(0, '#aaeeff');
        cockpitGrad.addColorStop(0.5, '#55bbee');
        cockpitGrad.addColorStop(1, '#2277aa');
        ctx.fillStyle = cockpitGrad;
        ctx.beginPath();
        ctx.ellipse(0, -10, 4, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // 驾驶舱反光
        ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-1, -13, 2, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // === 机翼武器挂载点发光 ===
        ctx.fillStyle = `rgba(100, 220, 255, ${0.4 + engineGlow * 0.3})`;
        ctx.shadowColor = '#44ccff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(-20, 14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, 14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === 护盾效果 ===
        if (this.shield) {
            const shieldPulse = Math.sin(this.animTimer * 0.08) * 0.2 + 0.6;
            // 外层
            ctx.strokeStyle = `rgba(0, 255, 200, ${shieldPulse * 0.5})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffc8';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.stroke();
            // 内层
            ctx.strokeStyle = `rgba(0, 255, 200, ${shieldPulse * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 32, 0, Math.PI * 2);
            ctx.stroke();
            // 六角纹路
            ctx.strokeStyle = `rgba(0, 255, 200, ${shieldPulse * 0.15})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6 + this.animTimer * 0.01;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * 34, Math.sin(angle) * 34);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
}
