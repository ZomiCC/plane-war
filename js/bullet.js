class Bullet {
    constructor(x, y, speed, type = 'normal', isEnemy = false) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.type = type;
        this.isEnemy = isEnemy;
        this.width = 2;
        this.height = isEnemy ? 14 : 16;
        this.alive = true;
    }

    update() {
        if (this.isEnemy) this.y += this.speed;
        else this.y -= this.speed;
        if (this.y < -20 || this.y > 740) this.alive = false;
    }

    draw(ctx) {
        if (!this.alive) return;
        if (this.isEnemy) { this.drawEnemyBullet(ctx); return; }
        switch (this.type) {
            case 'double': this.drawDoubleBullet(ctx); break;
            case 'power': this.drawPowerBullet(ctx); break;
            default: this.drawNormalBullet(ctx);
        }
    }

    drawNormalBullet(ctx) {
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(this.x - 1, this.y - this.height / 2, 2, this.height);
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(this.x - 1.5, this.y - this.height / 2, 3, 4);
    }

    drawDoubleBullet(ctx) {
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(this.x - 1, this.y - this.height / 2, 2, this.height);
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(this.x - 1, this.y - this.height / 2, 2, 5);
    }

    drawPowerBullet(ctx) {
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(this.x - 2, this.y - this.height / 2, 4, this.height);
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(this.x - 2.5, this.y - this.height / 2, 5, 6);
    }

    drawEnemyBullet(ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 2);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 1.5, this.y - this.height / 2, 3, 3);
    }
}