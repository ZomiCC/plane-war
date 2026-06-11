class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 36;
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
        this.engineTrail = [];
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
            if (this.invincibleTimer <= 0) { this.invincible = false; this.visible = true; this.flickerCount = 0; }
        }

        if (this.propTimer > 0) {
            this.propTimer--;
            if (this.propTimer <= 0) { this.bulletType = 'normal'; this.fireRate = 12; }
        }

        this.bulletTimer++;

        if (Math.random() > 0.2) {
            this.engineTrail.push({
                x: this.x + (Math.random() - 0.5) * 6,
                y: this.y + this.height / 2,
                life: 10,
                maxLife: 10,
                width: 2 + Math.random() * 2
            });
        }
        this.engineTrail = this.engineTrail.filter(t => {
            t.y += 2;
            t.life--;
            t.width *= 0.9;
            return t.life > 0;
        });
    }

    canFire() { return this.bulletTimer >= this.fireRate; }

    fire() {
        this.bulletTimer = 0;
        const bullets = [];
        const speed = 10;
        switch (this.bulletType) {
            case 'double':
                bullets.push(new Bullet(this.x - 10, this.y - this.height / 2 + 4, speed, 'double'));
                bullets.push(new Bullet(this.x + 10, this.y - this.height / 2 + 4, speed, 'double'));
                break;
            case 'power':
                bullets.push(new Bullet(this.x - 5, this.y - this.height / 2, speed, 'power'));
                bullets.push(new Bullet(this.x + 5, this.y - this.height / 2, speed, 'power'));
                break;
            default:
                bullets.push(new Bullet(this.x, this.y - this.height / 2, speed, 'normal'));
        }
        return bullets;
    }

    hit() {
        if (this.invincible) return false;
        if (this.shield) { this.shield = false; this.invincible = true; this.invincibleTimer = 60; return false; }
        this.lives--;
        if (this.lives <= 0) { this.alive = false; return true; }
        this.invincible = true;
        this.invincibleTimer = 120;
        return false;
    }

    draw(ctx) {
        if (!this.alive || !this.visible) return;

        this.engineTrail.forEach(t => {
            const alpha = t.life / t.maxLife;
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(t.x - t.width / 2, t.y, t.width, t.width * 2);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
        
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(0, this.height / 2 - 8);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (this.shield) {
            const pulse = Math.sin(this.animTimer * 0.1) * 0.2 + 0.8;
            ctx.strokeStyle = 'rgba(0, 255, 65, ' + (pulse * 0.5) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 255, 65, ' + (pulse * 0.25) + ')';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}