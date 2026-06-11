// 子弹类
class Bullet {
    constructor(x, y, speed, type = 'normal', isEnemy = false) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.type = type;
        this.isEnemy = isEnemy;
        this.width = isEnemy ? 5 : 6;
        this.height = isEnemy ? 12 : 16;
        this.alive = true;
        this.trail = [];
    }

    update() {
        // 保存尾迹
        if (this.trail.length > 6) this.trail.shift();
        this.trail.push({ x: this.x, y: this.y });

        if (this.isEnemy) {
            this.y += this.speed;
        } else {
            this.y -= this.speed;
        }
        if (this.y < -20 || this.y > 740) {
            this.alive = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        if (this.isEnemy) {
            this.drawEnemyBullet(ctx);
            return;
        }

        switch (this.type) {
            case 'double':
                this.drawDoubleBullet(ctx);
                break;
            case 'power':
                this.drawPowerBullet(ctx);
                break;
            default:
                this.drawNormalBullet(ctx);
        }
    }

    drawNormalBullet(ctx) {
        // 尾迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.3;
            ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
            const size = 2 + (i / this.trail.length) * 2;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 弹体发光
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
        glow.addColorStop(0, 'rgba(100, 220, 255, 0.6)');
        glow.addColorStop(0.5, 'rgba(0, 180, 255, 0.2)');
        glow.addColorStop(1, 'rgba(0, 100, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        // 弹体
        const grad = ctx.createLinearGradient(this.x, this.y - this.height / 2, this.x, this.y + this.height / 2);
        grad.addColorStop(0, '#aaeeff');
        grad.addColorStop(0.4, '#44ccff');
        grad.addColorStop(1, '#0088cc');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x - this.width / 2, this.y + 2);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + 2);
        ctx.closePath();
        ctx.fill();
    }

    drawDoubleBullet(ctx) {
        // 尾迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.25;
            ctx.fillStyle = `rgba(0, 255, 170, ${alpha})`;
            const size = 2 + (i / this.trail.length) * 2;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 发光
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
        glow.addColorStop(0, 'rgba(0, 255, 170, 0.5)');
        glow.addColorStop(1, 'rgba(0, 200, 120, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // 弹体
        const grad = ctx.createLinearGradient(this.x, this.y - 8, this.x, this.y + 8);
        grad.addColorStop(0, '#aaffdd');
        grad.addColorStop(0.5, '#00ffaa');
        grad.addColorStop(1, '#009966');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 9);
        ctx.lineTo(this.x - 3, this.y + 1);
        ctx.lineTo(this.x, this.y + 9);
        ctx.lineTo(this.x + 3, this.y + 1);
        ctx.closePath();
        ctx.fill();
    }

    drawPowerBullet(ctx) {
        // 尾迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.3;
            ctx.fillStyle = `rgba(255, 100, 255, ${alpha})`;
            const size = 3 + (i / this.trail.length) * 4;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 发光
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 14);
        glow.addColorStop(0, 'rgba(255, 120, 255, 0.6)');
        glow.addColorStop(0.5, 'rgba(200, 50, 200, 0.2)');
        glow.addColorStop(1, 'rgba(150, 0, 150, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();
        // 弹体
        const grad = ctx.createLinearGradient(this.x, this.y - 10, this.x, this.y + 10);
        grad.addColorStop(0, '#ffaaff');
        grad.addColorStop(0.5, '#ff44ff');
        grad.addColorStop(1, '#aa00aa');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // 内核
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEnemyBullet(ctx) {
        // 尾迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.25;
            ctx.fillStyle = `rgba(255, 80, 40, ${alpha})`;
            const size = 1.5 + (i / this.trail.length) * 1.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        // 发光
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
        glow.addColorStop(0, 'rgba(255, 100, 50, 0.5)');
        glow.addColorStop(1, 'rgba(255, 40, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // 弹体
        const grad = ctx.createLinearGradient(this.x, this.y - 6, this.x, this.y + 6);
        grad.addColorStop(0, '#ff6644');
        grad.addColorStop(0.5, '#ff4422');
        grad.addColorStop(1, '#cc2200');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // 内核
        ctx.fillStyle = 'rgba(255, 200, 150, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
