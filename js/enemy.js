// 敌机类
class Enemy {
    constructor(type) {
        this.type = type;
        this.alive = true;
        this.flashTimer = 0;
        this.animTimer = Math.random() * 100;

        switch (type) {
            case 'small':
                this.width = 32;
                this.height = 32;
                this.hp = 1;
                this.maxHp = 1;
                this.speed = 2.5 + Math.random() * 1.5;
                this.score = 10;
                this.canShoot = false;
                break;
            case 'medium':
                this.width = 48;
                this.height = 48;
                this.hp = 3;
                this.maxHp = 3;
                this.speed = 1.5 + Math.random() * 1;
                this.score = 30;
                this.canShoot = true;
                this.shootRate = 120;
                this.shootTimer = Math.random() * 60;
                break;
            case 'large':
                this.width = 64;
                this.height = 60;
                this.hp = 6;
                this.maxHp = 6;
                this.speed = 1 + Math.random() * 0.5;
                this.score = 50;
                this.canShoot = true;
                this.shootRate = 80;
                this.shootTimer = Math.random() * 40;
                break;
            case 'boss':
                this.width = 110;
                this.height = 88;
                this.hp = 60;
                this.maxHp = 60;
                this.speed = 0.8;
                this.score = 500;
                this.canShoot = true;
                this.shootRate = 30;
                this.shootTimer = 0;
                this.movePattern = 0;
                this.moveTimer = 0;
                break;
        }

        this.x = this.width / 2 + Math.random() * (480 - this.width);
        this.y = -this.height;
    }

    update() {
        if (!this.alive) return;
        this.animTimer++;

        if (this.type === 'boss') {
            if (this.y < 80) {
                this.y += this.speed;
            } else {
                this.moveTimer++;
                this.x += Math.sin(this.moveTimer * 0.02) * 2;
                this.x = Math.max(this.width / 2, Math.min(480 - this.width / 2, this.x));
            }
        } else {
            this.y += this.speed;
            // 小型敌机有轻微蛇形移动
            if (this.type === 'small') {
                this.x += Math.sin(this.animTimer * 0.06) * 0.8;
            }
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
                const bullets = [];
                bullets.push(new Bullet(this.x, this.y + this.height / 2, 5, 'normal', true));
                bullets.push(new Bullet(this.x - 24, this.y + this.height / 2 - 4, 4, 'normal', true));
                bullets.push(new Bullet(this.x + 24, this.y + this.height / 2 - 4, 4, 'normal', true));
                return bullets;
            }
            return [new Bullet(this.x, this.y + this.height / 2, 4, 'normal', true)];
        }
        return null;
    }

    hit() {
        this.hp--;
        this.flashTimer = 6;
        if (this.hp <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        const flash = this.flashTimer > 0;
        switch (this.type) {
            case 'small': this.drawSmall(ctx, flash); break;
            case 'medium': this.drawMedium(ctx, flash); break;
            case 'large': this.drawLarge(ctx, flash); break;
            case 'boss': this.drawBoss(ctx, flash); break;
        }
        if (this.type !== 'small') this.drawHpBar(ctx);
        ctx.restore();
    }

    // === 小型敌机：红色无人机风格 ===
    drawSmall(ctx, flash) {
        const w = this.width, h = this.height;
        // 引擎发光（向下喷气）
        const glow = Math.sin(this.animTimer * 0.2) * 0.3 + 0.5;
        const eg = ctx.createRadialGradient(0, -h / 2, 0, 0, -h / 2 - 6, 8);
        eg.addColorStop(0, `rgba(255, 80, 30, ${glow})`);
        eg.addColorStop(1, 'rgba(255, 30, 0, 0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.ellipse(0, -h / 2 - 2, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 主体
        const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        if (flash) {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#ffaaaa');
        } else {
            grad.addColorStop(0, '#dd3322');
            grad.addColorStop(0.5, '#bb2211');
            grad.addColorStop(1, '#881100');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);            // 底部尖端（面朝下）
        ctx.lineTo(-w / 2, -2);
        ctx.lineTo(-w / 4, -h / 2);
        ctx.lineTo(0, -h / 2 + 4);
        ctx.lineTo(w / 4, -h / 2);
        ctx.lineTo(w / 2, -2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 120, 80, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 中心光点
        ctx.fillStyle = flash ? '#fff' : '#ff6644';
        ctx.shadowColor = '#ff4422';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // === 中型敌机：金色装甲战斗机 ===
    drawMedium(ctx, flash) {
        const w = this.width, h = this.height;

        // 引擎发光
        const glow = Math.sin(this.animTimer * 0.15) * 0.3 + 0.5;
        [-8, 8].forEach(ox => {
            const eg = ctx.createRadialGradient(ox, -h / 2, 0, ox, -h / 2 - 6, 7);
            eg.addColorStop(0, `rgba(255, 160, 30, ${glow})`);
            eg.addColorStop(1, 'rgba(255, 80, 0, 0)');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.ellipse(ox, -h / 2 - 2, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // 机翼
        const wingGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        if (flash) {
            wingGrad.addColorStop(0, '#ffddaa');
            wingGrad.addColorStop(1, '#ffddaa');
        } else {
            wingGrad.addColorStop(0, '#664400');
            wingGrad.addColorStop(0.5, '#cc8833');
            wingGrad.addColorStop(1, '#664400');
        }
        ctx.fillStyle = wingGrad;
        // 左翼
        ctx.beginPath();
        ctx.moveTo(-6, 2);
        ctx.lineTo(-w / 2, -4);
        ctx.lineTo(-w / 2 + 2, -10);
        ctx.lineTo(-6, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 右翼
        ctx.beginPath();
        ctx.moveTo(6, 2);
        ctx.lineTo(w / 2, -4);
        ctx.lineTo(w / 2 - 2, -10);
        ctx.lineTo(6, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 机身
        const bodyGrad = ctx.createLinearGradient(-8, 0, 8, 0);
        if (flash) {
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(1, '#ffccaa');
        } else {
            bodyGrad.addColorStop(0, '#885522');
            bodyGrad.addColorStop(0.3, '#dd9933');
            bodyGrad.addColorStop(0.5, '#ffbb44');
            bodyGrad.addColorStop(0.7, '#dd9933');
            bodyGrad.addColorStop(1, '#885522');
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-8, h / 4);
        ctx.lineTo(-10, -4);
        ctx.lineTo(-6, -h / 2 + 4);
        ctx.lineTo(0, -h / 2);
        ctx.lineTo(6, -h / 2 + 4);
        ctx.lineTo(10, -4);
        ctx.lineTo(8, h / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 驾驶舱
        const cockpit = ctx.createRadialGradient(0, 4, 0, 0, 4, 6);
        cockpit.addColorStop(0, '#ffdd88');
        cockpit.addColorStop(1, '#aa7722');
        ctx.fillStyle = cockpit;
        ctx.beginPath();
        ctx.ellipse(0, 4, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 180, 80, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // === 大型敌机：暗绿重型轰炸机 ===
    drawLarge(ctx, flash) {
        const w = this.width, h = this.height;

        // 引擎（4个）
        const glow = Math.sin(this.animTimer * 0.12) * 0.3 + 0.5;
        [-18, -8, 8, 18].forEach(ox => {
            const eg = ctx.createRadialGradient(ox, -h / 2, 0, ox, -h / 2 - 5, 6);
            eg.addColorStop(0, `rgba(100, 255, 60, ${glow * 0.6})`);
            eg.addColorStop(1, 'rgba(50, 200, 30, 0)');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.ellipse(ox, -h / 2 - 1, 3, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // 机翼
        const wingGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        if (flash) {
            wingGrad.addColorStop(0, '#ccffcc');
            wingGrad.addColorStop(1, '#ccffcc');
        } else {
            wingGrad.addColorStop(0, '#1a3310');
            wingGrad.addColorStop(0.5, '#2d6622');
            wingGrad.addColorStop(1, '#1a3310');
        }
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-w / 2, 8);
        ctx.lineTo(-w / 2 + 4, 14);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(w / 2, 8);
        ctx.lineTo(w / 2 - 4, 14);
        ctx.lineTo(10, 8);
        ctx.closePath();
        ctx.fill();

        // 机身
        const bodyGrad = ctx.createLinearGradient(-12, 0, 12, 0);
        if (flash) {
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(1, '#aaffaa');
        } else {
            bodyGrad.addColorStop(0, '#1a4415');
            bodyGrad.addColorStop(0.3, '#338833');
            bodyGrad.addColorStop(0.5, '#44aa44');
            bodyGrad.addColorStop(0.7, '#338833');
            bodyGrad.addColorStop(1, '#1a4415');
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-12, h / 4);
        ctx.lineTo(-14, 4);
        ctx.lineTo(-12, -h / 2 + 6);
        ctx.lineTo(-6, -h / 2);
        ctx.lineTo(0, -h / 2 + 4);
        ctx.lineTo(6, -h / 2);
        ctx.lineTo(12, -h / 2 + 6);
        ctx.lineTo(14, 4);
        ctx.lineTo(12, h / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 220, 100, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 驾驶舱
        const cockpit = ctx.createRadialGradient(0, 2, 0, 0, 2, 8);
        cockpit.addColorStop(0, '#88ee55');
        cockpit.addColorStop(1, '#336622');
        ctx.fillStyle = cockpit;
        ctx.beginPath();
        ctx.ellipse(0, 2, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 武器挂点
        ctx.fillStyle = `rgba(100, 255, 100, ${0.4 + glow * 0.3})`;
        ctx.shadowColor = '#44ff44';
        ctx.shadowBlur = 4;
        [-22, 22].forEach(ox => {
            ctx.beginPath();
            ctx.arc(ox, 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    // === Boss：暗红色旗舰 ===
    drawBoss(ctx, flash) {
        const w = this.width, h = this.height;
        const pulse = Math.sin(this.animTimer * 0.06) * 0.3 + 0.7;

        // 引擎（4个大引擎）
        [-30, -14, 14, 30].forEach(ox => {
            const eg = ctx.createRadialGradient(ox, -h / 2, 0, ox, -h / 2 - 8, 12);
            eg.addColorStop(0, `rgba(255, 50, 30, ${0.7 * pulse})`);
            eg.addColorStop(0.5, `rgba(200, 20, 10, ${0.3 * pulse})`);
            eg.addColorStop(1, 'rgba(150, 0, 0, 0)');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.ellipse(ox, -h / 2 - 2, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // 主翼
        const wingGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        if (flash) {
            wingGrad.addColorStop(0, '#ffcccc');
            wingGrad.addColorStop(1, '#ffcccc');
        } else {
            wingGrad.addColorStop(0, '#330000');
            wingGrad.addColorStop(0.3, '#772222');
            wingGrad.addColorStop(0.5, '#993333');
            wingGrad.addColorStop(0.7, '#772222');
            wingGrad.addColorStop(1, '#330000');
        }
        ctx.fillStyle = wingGrad;
        // 左翼
        ctx.beginPath();
        ctx.moveTo(-16, -2);
        ctx.lineTo(-w / 2, 10);
        ctx.lineTo(-w / 2 + 6, 20);
        ctx.lineTo(-20, 14);
        ctx.lineTo(-16, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 80, 60, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // 右翼
        ctx.beginPath();
        ctx.moveTo(16, -2);
        ctx.lineTo(w / 2, 10);
        ctx.lineTo(w / 2 - 6, 20);
        ctx.lineTo(20, 14);
        ctx.lineTo(16, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 机身
        const bodyGrad = ctx.createLinearGradient(-16, 0, 16, 0);
        if (flash) {
            bodyGrad.addColorStop(0, '#ffffff');
            bodyGrad.addColorStop(1, '#ffaaaa');
        } else {
            bodyGrad.addColorStop(0, '#440011');
            bodyGrad.addColorStop(0.3, '#992233');
            bodyGrad.addColorStop(0.5, '#cc3344');
            bodyGrad.addColorStop(0.7, '#992233');
            bodyGrad.addColorStop(1, '#440011');
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-18, h / 4);
        ctx.lineTo(-22, 6);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-14, -h / 2 + 6);
        ctx.lineTo(0, -h / 2 + 2);
        ctx.lineTo(14, -h / 2 + 6);
        ctx.lineTo(20, -10);
        ctx.lineTo(22, 6);
        ctx.lineTo(18, h / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 100, 80, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 装甲板纹路
        ctx.strokeStyle = 'rgba(255, 60, 40, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -h / 2 + 10);
        ctx.lineTo(-12, h / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -h / 2 + 10);
        ctx.lineTo(12, h / 4);
        ctx.stroke();

        // 眼睛（发光）
        const eyeGlow = pulse * 0.8;
        ctx.fillStyle = `rgba(255, 40, 20, ${eyeGlow})`;
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(-10, -6, 5, 7, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, -6, 5, 7, 0.15, 0, Math.PI * 2);
        ctx.fill();
        // 眼睛瞳孔
        ctx.fillStyle = `rgba(255, 200, 150, ${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(-10, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 核心（脉动能量球）
        const coreSize = 6 + Math.sin(this.animTimer * 0.1) * 2;
        const coreGlow = ctx.createRadialGradient(0, 12, 0, 0, 12, coreSize + 8);
        coreGlow.addColorStop(0, `rgba(255, 80, 40, ${pulse * 0.8})`);
        coreGlow.addColorStop(0.5, `rgba(200, 20, 0, ${pulse * 0.3})`);
        coreGlow.addColorStop(1, 'rgba(150, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 12, coreSize + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 150, 100, ${pulse})`;
        ctx.beginPath();
        ctx.arc(0, 12, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // 武器挂点
        ctx.fillStyle = `rgba(255, 100, 50, ${0.4 + pulse * 0.3})`;
        ctx.shadowColor = '#ff4422';
        ctx.shadowBlur = 6;
        [-26, 26].forEach(ox => {
            ctx.beginPath();
            ctx.arc(ox, 12, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    drawHpBar(ctx) {
        const barWidth = this.width * 0.9;
        const barHeight = 5;
        const y = -this.height / 2 - 10;
        const hpRatio = this.hp / this.maxHp;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, y, barWidth, barHeight, 2);
        ctx.fill();

        // 血条
        const hpColor = hpRatio > 0.5 ? '#44ff66' : hpRatio > 0.25 ? '#ffaa22' : '#ff3333';
        const hpGrad = ctx.createLinearGradient(-barWidth / 2, y, -barWidth / 2 + barWidth * hpRatio, y);
        hpGrad.addColorStop(0, hpColor);
        hpGrad.addColorStop(1, hpRatio > 0.5 ? '#22cc44' : hpRatio > 0.25 ? '#cc8811' : '#cc2222');
        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, y, barWidth * hpRatio, barHeight, 2);
        ctx.fill();

        // 边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, y, barWidth, barHeight, 2);
        ctx.stroke();
    }
}
