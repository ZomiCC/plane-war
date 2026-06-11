class Prop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 24;
        this.speed = 1.8;
        this.alive = true;
        this.animTimer = 0;
        this.rotation = 0;
    }

    update() {
        this.y += this.speed;
        this.animTimer++;
        this.rotation += 0.02;
        if (this.y > 740) this.alive = false;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const pulse = Math.sin(this.animTimer * 0.08) * 0.3 + 0.7;
        
        // 六边形外框
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const x = Math.cos(angle) * 11;
            const y = Math.sin(angle) * 11;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // 内部填充
        ctx.fillStyle = 'rgba(0, 255, 65, ' + (pulse * 0.15) + ')';
        ctx.fill();
        
        // 中心符号
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbols = { double: 'D', shield: 'S', bomb: 'B', life: '+' };
        ctx.fillText(symbols[this.type] || '?', 0, 0);
        
        ctx.restore();
    }

    applyTo(player) {
        switch (this.type) {
            case 'double': player.bulletType = 'double'; player.fireRate = 8; player.propTimer = 600; break;
            case 'shield': player.shield = true; break;
            case 'bomb': return 'bomb';
            case 'life': if (player.lives < 5) player.lives++; break;
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