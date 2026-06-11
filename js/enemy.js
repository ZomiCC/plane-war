// 终端风格敌人 - 几何图形
class Enemy {
    constructor(type) {
        this.type = type;
        this.alive = true;
        this.flashTimer = 0;
        this.animTimer = Math.random() * 100;

        switch (type) {
            case 'small':
                this.width = 24; this.height = 24; this.hp = 1; this.maxHp = 1;
                this.speed = 3 + Math.random(); this.score = 10; this.canShoot = false;
                break;
            case 'medium':
                this.width = 36; this.height = 36; this.hp = 3; this.maxHp = 3;
                this.speed = 2 + Math.random(); this.score = 30;
                this.canShoot = true; this.shootRate = 120; this.shootTimer = Math.random() * 60;
                break;
            case 'large':
                this.width = 48; this.height = 48; this.hp = 6; this.maxHp = 6;
                this.speed = 1.2 + Math.random() * 0.5; this.score = 50;
                this.canShoot = true; this.shootRate = 80; this.shootTimer = Math.random() * 40;
                break;
            case 'boss':
                this.width = 100; this.height = 80; this.hp = 60; this.maxHp = 60;
                this.speed = 0.6; this.score = 500;
                this.canShoot = true; this.shootRate = 30; this.shootTimer = 0;
                this.movePattern = 0; this.moveTimer = 0;
                break;
        }
        this.x = this.width / 2 + Math.random() * (480 - this.width);
        this.y = -this.height;
    }

    update() {
        if (!this.alive) return;
        this.animTimer++;
        if (this.type === 'boss') {
            if (this.y < 60) { this.y += this.speed; }
            else {
                this.moveTimer++;
                this.x += Math.sin(this.moveTimer * 0.02) * 2;
                this.x = Math.max(this.width / 2, Math.min(480 - this.width / 2, this.x));
            }
        } else {
            this.y += this.speed;
            if (this.type === 'small') this.x += Math.sin(this.animTimer * 0.05) * 0.5;
        }
        if (this.flashTimer > 0) this.flashTimer--;
        if (this.y > 760) this.alive = false;
    }

    tryShoot() {
        if (!this.alive || !this.canShoot) return null;
        this.shootTimer++;
        if (this.shootTimer >= this.shootRate) {
            this.shootTimer = 0;
            if (this.type === 'boss') {
                return [
                    new Bullet(this.x, this.y + this.height / 2, 5, 'normal', true),
                    new Bullet(this.x - 25, this.y + this.height / 2 - 5, 4, 'normal', true),
                    new Bullet(this.x + 25, this.y + this.height / 2 - 5, 4, 'normal', true)
                ];
            }
            return [new Bullet(this.x, this.y + this.height / 2, 4, 'normal', true)];
        }
        return null;
    }

    hit() {
        this.hp--;
        this.flashTimer = 5;
        if (this.hp <= 0) { this.alive = false; return true; }
        return false;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        const flash = this.flashTimer > 0;
        switch (this.type) {
            case 'small': this.drawSquare(ctx, flash); break;
            case 'medium': this.drawCircle(ctx, flash); break;
            case 'large': this.drawDiamond(ctx, flash); break;
            case 'boss': this.drawBoss(ctx, flash); break;
        }
        if (this.type !== 'small') this.drawHpBar(ctx);
        ctx.restore();
    }

    drawSquare(ctx, flash) {
        const size = this.width - 4;
        ctx.strokeStyle = flash ? '#ffffff' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(-size / 2, -size / 2, size, size);
    }

    drawCircle(ctx, flash) {
        const r = this.width / 2 - 2;
        ctx.strokeStyle = flash ? '#ffffff' : '#999999';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(153, 153, 153, 0.15)';
        ctx.fill();
    }

    drawDiamond(ctx, flash) {
        const s = this.width / 2 - 3;
        ctx.strokeStyle = flash ? '#ffffff' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fill();
    }

    drawBoss(ctx, flash) {
        const s = this.width / 2;
        const pulse = Math.sin(this.animTimer * 0.05) * 0.3 + 0.7;
        
        // 主体 - 绿色几何组合
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        
        // 外方框
        ctx.strokeRect(-s + 4, -s + 5, this.width - 8, this.height - 10);
        
        // 内菱形
        ctx.beginPath();
        ctx.moveTo(0, -s + 15);
        ctx.lineTo(s - 15, 0);
        ctx.lineTo(0, s - 15);
        ctx.lineTo(-s + 15, 0);
        ctx.closePath();
        ctx.stroke();
        
        // 核心十字
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -s + 25);
        ctx.lineTo(0, s - 25);
        ctx.moveTo(-s + 25, 0);
        ctx.lineTo(s - 25, 0);
        ctx.stroke();
        
        // 装饰角
        const cornerSize = 8;
        [
            [-s + 8, -s + 13],
            [s - 8, -s + 13],
            [-s + 8, s - 13],
            [s - 8, s - 13]
        ].forEach(([x, y]) => {
            ctx.fillRect(x - 2, y - 2, 4, 4);
        });

        // 发光核心
        ctx.fillStyle = 'rgba(0, 255, 65, ' + (pulse * 0.3) + ')';
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 8 + pulse * 2, 0, Math.PI * 2); ctx.stroke();
    }

    drawHpBar(ctx) {
        const barW = this.width * 0.85;
        const barH = 3;
        const y = -this.height / 2 - 8;
        const hpRatio = this.hp / this.maxHp;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barW / 2, y, barW, barH);
        ctx.fillStyle = this.type === 'boss' ? '#00ff41' : '#ffffff';
        ctx.fillRect(-barW / 2, y, barW * hpRatio, barH);
    }
}