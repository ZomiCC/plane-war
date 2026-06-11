// 道具类
class Prop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 28;
        this.height = 28;
        this.speed = 1.8;
        this.alive = true;
        this.animTimer = 0;

        switch (type) {
            case 'double':
                this.color = '#00ffaa';
                this.colorRgb = '0, 255, 170';
                this.icon = 'D';
                this.label = '双发';
                break;
            case 'shield':
                this.color = '#00ccff';
                this.colorRgb = '0, 204, 255';
                this.icon = 'S';
                this.label = '护盾';
                break;
            case 'bomb':
                this.color = '#ff6644';
                this.colorRgb = '255, 102, 68';
                this.icon = 'B';
                this.label = '炸弹';
                break;
            case 'life':
                this.color = '#ff66aa';
                this.colorRgb = '255, 102, 170';
                this.icon = '+';
                this.label = '加命';
                break;
        }
    }

    update() {
        this.y += this.speed;
        this.animTimer++;
        if (this.y > 740) this.alive = false;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        const pulse = Math.sin(this.animTimer * 0.1) * 0.3 + 0.7;
        const rotate = this.animTimer * 0.02;

        // 外层光晕
        const outerGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 22);
        outerGlow.addColorStop(0, `rgba(${this.colorRgb}, ${0.3 * pulse})`);
        outerGlow.addColorStop(1, `rgba(${this.colorRgb}, 0)`);
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // 六角形外框
        ctx.save();
        ctx.rotate(rotate);
        ctx.strokeStyle = `rgba(${this.colorRgb}, ${0.6 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const px = Math.cos(angle) * 14;
            const py = Math.sin(angle) * 14;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        // 内部填充
        ctx.fillStyle = `rgba(${this.colorRgb}, ${0.12 * pulse})`;
        ctx.fill();
        ctx.restore();

        // 内层六角形
        ctx.save();
        ctx.rotate(-rotate * 0.5);
        ctx.strokeStyle = `rgba(${this.colorRgb}, ${0.3 * pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const px = Math.cos(angle) * 9;
            const py = Math.sin(angle) * 9;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // 中心发光点
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 * pulse;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 图标文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0.5);

        ctx.restore();
    }

    applyTo(player) {
        switch (this.type) {
            case 'double':
                player.bulletType = 'double';
                player.fireRate = 8;
                player.propTimer = 600;
                break;
            case 'shield':
                player.shield = true;
                break;
            case 'bomb':
                return 'bomb';
            case 'life':
                if (player.lives < 5) player.lives++;
                break;
        }
        return this.type;
    }
}

class PropFactory {
    static create(x, y) {
        const rand = Math.random();
        let type;
        if (rand < 0.35) type = 'double';
        else if (rand < 0.6) type = 'shield';
        else if (rand < 0.85) type = 'bomb';
        else type = 'life';
        return new Prop(x, y, type);
    }
}
