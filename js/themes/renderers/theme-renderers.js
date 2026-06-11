/**
 * 具体渲染器实现
 * 每个游戏元素对应一个渲染器，根据主题配置进行差异化绘制
 */

// hex → rgba 工具函数（全局共用）
function hexRGBA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==================== 玩家渲染器 ====================
class PlayerRenderer extends BaseRenderer {
  draw(ctx, player) {
    if (!player.alive || !player.visible) return;
    const t = this.theme.id;

    this.drawEngineTrail(ctx, player);

    ctx.save();
    ctx.translate(player.x, player.y);

    switch (t) {
      case 'terminal': this.drawTerminal(ctx, player); break;
      case 'brutal':   this.drawBrutal(ctx, player); break;
      case 'matrix':   this.drawMatrix(ctx, player); break;
      case 'glitch':   this.drawGlitch(ctx, player); break;
      case 'minimal':  this.drawMinimal(ctx, player); break;
      default:         this.drawTerminal(ctx, player);
    }

    if (player.shield) this.drawShield(ctx, player);
    ctx.restore();
  }

  /* --- 引擎尾焰 --- */
  drawEngineTrail(ctx, player) {
    player.engineTrail.forEach(t => {
      const alpha = t.life / t.maxLife;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = this.colors.greenPrimary;
      if (this.theme.id === 'brutal') {
        // 粗野风：粗方块尾焰
        ctx.fillRect(t.x - t.width, t.y, t.width * 2, t.width * 3);
      } else {
        ctx.fillRect(t.x - t.width / 2, t.y, t.width, t.width * 2);
      }
    });
    ctx.globalAlpha = 1;
  }

  /* --- 护盾 --- */
  drawShield(ctx, player) {
    const pulse = Math.sin(player.animTimer * 0.1) * 0.2 + 0.8;
    if (this.theme.id === 'brutal') {
      // 粗野风：粗方块护盾
      ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, pulse * 0.6);
      ctx.lineWidth = 3;
      ctx.strokeRect(-26, -26, 52, 52);
      ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, pulse * 0.3);
      ctx.strokeRect(-22, -22, 44, 44);
    } else {
      ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, pulse * 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, pulse * 0.25);
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* --- Terminal 风格：尖角三角 + 发光 --- */
  drawTerminal(ctx, player) {
    const w = player.width, h = player.height;
    this.applyGlow(ctx, this.colors.greenPrimary);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.lineWidth = 2;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.2);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(0, h / 2 - 8);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.clearGlow(ctx);
  }

  /* --- BRUTAL 风格：重型方块组合飞机 --- */
  drawBrutal(ctx, player) {
    const w = player.width, h = player.height;

    // 主体厚方块
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.4);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.lineWidth = 3;
    const bw = w * 0.55, bh = h * 0.55;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    // 机头：上方粗三角
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.5);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-w / 3.5, -bh / 2 + 2);
    ctx.lineTo(w / 3.5, -bh / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 两侧粗翼
    ctx.lineWidth = 2;
    const wingW = w * 0.22, wingH = h * 0.28;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.3);
    // 左翼
    ctx.fillRect(-w / 2, 2, wingW, wingH);
    ctx.strokeRect(-w / 2, 2, wingW, wingH);
    // 右翼
    ctx.fillRect(w / 2 - wingW, 2, wingW, wingH);
    ctx.strokeRect(w / 2 - wingW, 2, wingW, wingH);

    // 中心十字铆钉
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(-1, -bh / 2 + 2, 2, bh - 4);
    ctx.fillRect(-bw / 2 + 2, -1, bw - 4, 2);

    // 四角铆钉点
    const inset = 5;
    ctx.fillRect(-bw / 2 + inset, -bh / 2 + inset, 2, 2);
    ctx.fillRect(bw / 2 - inset - 2, -bh / 2 + inset, 2, 2);
    ctx.fillRect(-bw / 2 + inset, bh / 2 - inset - 2, 2, 2);
    ctx.fillRect(bw / 2 - inset - 2, bh / 2 - inset - 2, 2, 2);
  }

  /* --- Matrix 风格：数字填充三角 --- */
  drawMatrix(ctx, player) {
    const w = player.width, h = player.height;
    this.applyGlow(ctx, this.colors.greenPrimary, 4);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.lineWidth = 1;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.15);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(0, h / 2 - 8);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.clearGlow(ctx);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = this.colors.whiteCode || '#c8ffc8';
    ctx.font = '7px monospace';
    ctx.globalAlpha = 0.4;
    const chars = '01';
    for (let row = -h / 2; row < h / 2; row += 8) {
      for (let col = -w / 2; col < w / 2; col += 8) {
        ctx.fillText(chars[Math.floor(Math.random() * 2)], col, row + 7);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* --- Glitch 风格：RGB 分离 --- */
  drawGlitch(ctx, player) {
    const w = player.width, h = player.height;
    const offset = Math.random() < 0.05 ? (Math.random() - 0.5) * 6 : 0;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(offset - 2, -h / 2);
    ctx.lineTo(-w / 2 + offset - 2, h / 2);
    ctx.lineTo(offset - 2, h / 2 - 8);
    ctx.lineTo(w / 2 + offset - 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(offset + 2, -h / 2);
    ctx.lineTo(-w / 2 + offset + 2, h / 2);
    ctx.lineTo(offset + 2, h / 2 - 8);
    ctx.lineTo(w / 2 + offset + 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    this.applyGlow(ctx, this.colors.greenPrimary, 10);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.lineWidth = 2;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.2);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(0, h / 2 - 8);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.clearGlow(ctx);
  }

  /* --- Minimal 风格：纯线条 --- */
  drawMinimal(ctx, player) {
    const w = player.width, h = player.height;
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(0, h / 2 - 8);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.stroke();
  }
}


// ==================== 敌人渲染器 ====================
class EnemyRenderer extends BaseRenderer {
  draw(ctx, enemy) {
    if (!enemy.alive) return;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const flash = enemy.flashTimer > 0;

    switch (this.theme.id) {
      case 'terminal': this.drawTerminal(ctx, enemy, flash); break;
      case 'brutal':   this.drawBrutal(ctx, enemy, flash); break;
      case 'matrix':   this.drawMatrix(ctx, enemy, flash); break;
      case 'glitch':   this.drawGlitch(ctx, enemy, flash); break;
      case 'minimal':  this.drawMinimal(ctx, enemy, flash); break;
      default:         this.drawTerminal(ctx, enemy, flash);
    }

    if (enemy.type !== 'small') this.drawHpBar(ctx, enemy);
    ctx.restore();
  }

  /* --- Terminal --- */
  drawTerminal(ctx, enemy, flash) {
    const color = flash ? this.colors.whitePure : this.getEnemyColor(enemy.type);
    if (this.params.glowEnabled && !flash) this.applyGlow(ctx, color);
    ctx.strokeStyle = color;
    ctx.fillStyle = hexRGBA(color, this.params.fillOpacity);
    ctx.lineWidth = this.params.lineWidth;

    switch (enemy.type) {
      case 'small': {
        const s = enemy.width - 4;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      }
      case 'medium':
        ctx.beginPath();
        ctx.arc(0, 0, enemy.width / 2 - 2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      case 'large': {
        const d = enemy.width / 2 - 2;
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'boss':
        this.drawBossTerminal(ctx, enemy);
        break;
    }
    this.clearGlow(ctx);
  }

  drawBossTerminal(ctx, enemy) {
    const w = enemy.width / 2, h = enemy.height / 2;
    this.applyGlow(ctx, this.colors.greenPrimary, 6);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.15);
    ctx.lineWidth = 2;
    ctx.strokeRect(-w, -h, w * 2, h * 2);
    ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.6, 0); ctx.lineTo(w * 0.6, 0);
    ctx.moveTo(0, -h * 0.6); ctx.lineTo(0, h * 0.6);
    ctx.stroke();
    const cs = 8;
    ctx.strokeRect(-w + 2, -h + 2, cs, cs);
    ctx.strokeRect(w - cs - 2, -h + 2, cs, cs);
    ctx.strokeRect(-w + 2, h - cs - 2, cs, cs);
    ctx.strokeRect(w - cs - 2, h - cs - 2, cs, cs);
    this.clearGlow(ctx);
  }

  /* --- BRUTAL：混凝土色 + 粗线 + 厚重块体 --- */
  drawBrutal(ctx, enemy, flash) {
    const white = this.colors.whiteConcrete || '#d4d4c8';
    const green = this.colors.greenPrimary;
    const isBoss = enemy.type === 'boss';
    const baseColor = flash ? '#ffffff' : (isBoss ? green : white);

    ctx.lineWidth = 3;

    switch (enemy.type) {
      case 'small': {
        // 厚实方块
        const s = enemy.width;
        ctx.fillStyle = hexRGBA(baseColor, 0.35);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.strokeStyle = baseColor;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        // 内部十字钢筋
        ctx.strokeStyle = hexRGBA(baseColor, 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s / 2, 0); ctx.lineTo(s / 2, 0);
        ctx.moveTo(0, -s / 2); ctx.lineTo(0, s / 2);
        ctx.stroke();
        break;
      }
      case 'medium': {
        // 厚环 + 内环 + 十字
        const r = enemy.width / 2;
        ctx.fillStyle = hexRGBA(baseColor, 0.3);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        // 重型内环
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        // 十字钢筋
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 0.8, 0);
        ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8);
        ctx.stroke();
        break;
      }
      case 'large': {
        // 厚菱形 + 内部 X 筋
        const d = enemy.width / 2;
        ctx.fillStyle = hexRGBA(baseColor, 0.35);
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        // 内部 X
        ctx.strokeStyle = hexRGBA(baseColor, 0.5);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-d * 0.5, -d * 0.5); ctx.lineTo(d * 0.5, d * 0.5);
        ctx.moveTo(d * 0.5, -d * 0.5); ctx.lineTo(-d * 0.5, d * 0.5);
        ctx.stroke();
        break;
      }
      case 'boss':
        this.drawBossBrutal(ctx, enemy, flash);
        break;
    }
  }

  drawBossBrutal(ctx, enemy, flash) {
    const w = enemy.width / 2, h = enemy.height / 2;
    const green = this.colors.greenPrimary;
    const color = flash ? '#ffffff' : green;

    // 外层厚框
    ctx.fillStyle = hexRGBA(color, 0.25);
    ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(-w, -h, w * 2, h * 2);

    // 内层菱形
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    const inset = 12;
    ctx.beginPath();
    ctx.moveTo(0, -h + inset);
    ctx.lineTo(w - inset, 0);
    ctx.lineTo(0, h - inset);
    ctx.lineTo(-w + inset, 0);
    ctx.closePath();
    ctx.stroke();

    // 粗十字
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.65, 0); ctx.lineTo(w * 0.65, 0);
    ctx.moveTo(0, -h * 0.65); ctx.lineTo(0, h * 0.65);
    ctx.stroke();

    // 四角重型铆钉
    ctx.fillStyle = color;
    const rSize = 5;
    [[-w + 6, -h + 6], [w - 6 - rSize, -h + 6], [-w + 6, h - 6 - rSize], [w - 6 - rSize, h - 6 - rSize]].forEach(([rx, ry]) => {
      ctx.fillRect(rx, ry, rSize, rSize);
    });

    // 中心脉冲核心
    const pulse = Math.sin(enemy.animTimer * 0.06) * 0.3 + 0.7;
    ctx.fillStyle = hexRGBA(color, pulse * 0.5);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-6, -6, 12, 12);
  }

  /* --- Matrix --- */
  drawMatrix(ctx, enemy, flash) {
    const color = flash ? this.colors.whitePure : this.colors.greenPrimary;
    this.applyGlow(ctx, color, 4);
    ctx.strokeStyle = color;
    ctx.fillStyle = hexRGBA(color, 0.15);
    ctx.lineWidth = 1;
    switch (enemy.type) {
      case 'small': {
        const s = enemy.width - 4;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      }
      case 'medium':
        ctx.beginPath(); ctx.arc(0, 0, enemy.width / 2 - 2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      case 'large': {
        const d = enemy.width / 2 - 2;
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'boss':
        this.drawBossMatrix(ctx, enemy);
        break;
    }
    this.clearGlow(ctx);
  }

  drawBossMatrix(ctx, enemy) {
    const w = enemy.width / 2, h = enemy.height / 2;
    this.applyGlow(ctx, this.colors.greenPrimary, 8);
    ctx.strokeStyle = this.colors.greenPrimary;
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.15);
    ctx.lineWidth = 1;
    ctx.strokeRect(-w, -h, w * 2, h * 2);
    ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.save();
    ctx.beginPath(); ctx.rect(-w, -h, w * 2, h * 2); ctx.clip();
    ctx.fillStyle = this.colors.whiteCode || '#c8ffc8';
    ctx.font = '8px monospace';
    ctx.globalAlpha = 0.35;
    for (let row = -h; row < h; row += 10) {
      for (let col = -w; col < w; col += 10) {
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', col, row + 8);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    this.clearGlow(ctx);
  }

  /* --- Glitch --- */
  drawGlitch(ctx, enemy, flash) {
    const offset = Math.random() < 0.03 ? (Math.random() - 0.5) * 8 : 0;
    if (offset !== 0) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ff0000';
      this.drawEnemyShape(ctx, enemy, offset - 2);
      ctx.fillStyle = '#0000ff';
      this.drawEnemyShape(ctx, enemy, offset + 2);
      ctx.globalAlpha = 1;
    }
    const color = flash ? this.colors.whitePure : this.colors.greenPrimary;
    ctx.strokeStyle = color;
    ctx.fillStyle = hexRGBA(color, 0.2);
    ctx.lineWidth = 2;
    this.drawEnemyShape(ctx, enemy, offset);
  }

  drawEnemyShape(ctx, enemy, offsetX) {
    ctx.save();
    ctx.translate(offsetX, 0);
    switch (enemy.type) {
      case 'small': {
        const s = enemy.width - 4;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      }
      case 'medium':
        ctx.beginPath(); ctx.arc(0, 0, enemy.width / 2 - 2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        break;
      case 'large': {
        const d = enemy.width / 2 - 2;
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'boss': {
        const w = enemy.width / 2, h = enemy.height / 2;
        ctx.fillRect(-w, -h, w * 2, h * 2);
        ctx.strokeRect(-w, -h, w * 2, h * 2);
        break;
      }
    }
    ctx.restore();
  }

  /* --- Minimal --- */
  drawMinimal(ctx, enemy, flash) {
    const color = flash ? this.colors.whitePure : this.getEnemyColor(enemy.type);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    switch (enemy.type) {
      case 'small': {
        const s = enemy.width - 4;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        break;
      }
      case 'medium':
        ctx.beginPath(); ctx.arc(0, 0, enemy.width / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'large': {
        const d = enemy.width / 2 - 2;
        ctx.beginPath();
        ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d); ctx.lineTo(-d, 0);
        ctx.closePath(); ctx.stroke();
        break;
      }
      case 'boss': {
        const w = enemy.width / 2, h = enemy.height / 2;
        ctx.strokeRect(-w, -h, w * 2, h * 2);
        ctx.beginPath();
        ctx.moveTo(-w * 0.6, 0); ctx.lineTo(w * 0.6, 0);
        ctx.moveTo(0, -h * 0.6); ctx.lineTo(0, h * 0.6);
        ctx.stroke();
        break;
      }
    }
  }

  /* --- HP 条 --- */
  drawHpBar(ctx, enemy) {
    const barW = enemy.width - 4;
    const barH = this.theme.id === 'brutal' ? 4 : 3;
    const barY = -enemy.height / 2 - 10;
    const hpRatio = enemy.hp / enemy.maxHp;
    const isBoss = enemy.type === 'boss';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(-barW / 2, barY, barW, barH);

    if (this.theme.id === 'brutal') {
      ctx.fillStyle = hpRatio > 0.3 ? this.colors.greenPrimary : '#ff3300';
      ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);
      // 粗边框
      ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, 0.4);
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2, barY, barW, barH);
    } else {
      ctx.fillStyle = hpRatio > 0.3 ? this.colors.greenPrimary : '#ff3300';
      ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);
    }
  }

  getEnemyColor(type) {
    switch (type) {
      case 'boss': return this.colors.greenPrimary;
      default: return this.colors.whitePure || '#ffffff';
    }
  }
}


// ==================== 子弹渲染器 ====================
class BulletRenderer extends BaseRenderer {
  draw(ctx, bullet) {
    if (!bullet.alive) return;
    if (bullet.isEnemy) { this.drawEnemy(ctx, bullet); return; }
    switch (this.theme.id) {
      case 'terminal': this.drawPlayerTerminal(ctx, bullet); break;
      case 'brutal':   this.drawPlayerBrutal(ctx, bullet); break;
      case 'matrix':   this.drawPlayerMatrix(ctx, bullet); break;
      case 'glitch':   this.drawPlayerGlitch(ctx, bullet); break;
      case 'minimal':  this.drawPlayerMinimal(ctx, bullet); break;
      default:         this.drawPlayerTerminal(ctx, bullet);
    }
  }

  drawPlayerTerminal(ctx, b) {
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(b.x - 1, b.y - b.height / 2, 2, b.height);
    ctx.fillStyle = this.colors.greenBright || '#39ff14';
    ctx.fillRect(b.x - 1.5, b.y - b.height / 2, 3, 4);
  }

  drawPlayerBrutal(ctx, b) {
    // 粗野风：粗方块弹
    const w = b.type === 'power' ? 5 : 4;
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(b.x - w / 2, b.y - b.height / 2, w, b.height);
    // 弹头高亮
    ctx.fillStyle = hexRGBA(this.colors.greenPrimary, 0.6);
    ctx.fillRect(b.x - w / 2 - 1, b.y - b.height / 2, w + 2, 5);
  }

  drawPlayerMatrix(ctx, b) {
    this.applyGlow(ctx, this.colors.greenPrimary, 3);
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(b.x - 1, b.y - b.height / 2, 2, b.height);
    ctx.fillStyle = this.colors.whiteCode || '#c8ffc8';
    ctx.fillRect(b.x - 1, b.y - b.height / 2, 2, 3);
    this.clearGlow(ctx);
  }

  drawPlayerGlitch(ctx, b) {
    this.applyGlow(ctx, this.colors.greenPrimary, 6);
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(b.x - 1, b.y - b.height / 2, 2, b.height);
    if (Math.random() < 0.1) {
      ctx.fillRect(b.x - 1 + (Math.random() - 0.5) * 4, b.y - b.height / 2, 2, b.height);
    }
    this.clearGlow(ctx);
  }

  drawPlayerMinimal(ctx, b) {
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.fillRect(b.x - 1, b.y - b.height / 2, 2, b.height);
  }

  drawEnemy(ctx, b) {
    if (this.theme.id === 'brutal') {
      // 粗野风：白实心粗弹
      ctx.fillStyle = this.colors.whiteConcrete || '#d4d4c8';
      ctx.fillRect(b.x - 2, b.y - b.height / 2, 4, b.height);
    } else {
      ctx.strokeStyle = this.colors.whitePure || '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - b.height / 2);
      ctx.lineTo(b.x, b.y + b.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = this.colors.whitePure || '#ffffff';
      ctx.fillRect(b.x - 1.5, b.y - b.height / 2, 3, 3);
    }
  }
}


// ==================== 道具渲染器 ====================
class PropRenderer extends BaseRenderer {
  draw(ctx, prop) {
    if (!prop.alive) return;
    ctx.save();
    ctx.translate(prop.x, prop.y);
    ctx.rotate(prop.rotation);

    const pulse = Math.sin(prop.animTimer * 0.08) * 0.3 + 0.7;
    const color = this.colors.greenPrimary;
    const isBrutal = this.theme.id === 'brutal';

    if (isBrutal) {
      // 粗野风：粗方块道具，不用六边形
      const size = 22;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.fillStyle = hexRGBA(color, pulse * 0.2);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      // 内框
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6);
    } else {
      // 六边形外框
      if (this.params.glowEnabled) this.applyGlow(ctx, color);
      ctx.strokeStyle = color;
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
      ctx.fillStyle = hexRGBA(color, pulse * 0.15);
      ctx.fill();
      ctx.stroke();
      this.clearGlow(ctx);
    }

    // 中心符号
    ctx.fillStyle = isBrutal ? (this.colors.whiteConcrete || '#d4d4c8') : (this.colors.whitePure || '#ffffff');
    ctx.font = `bold ${isBrutal ? 13 : 10}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbols = { double: 'D', shield: 'S', bomb: 'B', life: '+' };
    ctx.fillText(symbols[prop.type] || '?', 0, 0);

    ctx.restore();
  }
}


// ==================== 爆炸/特效渲染器 ====================
class EffectRenderer extends BaseRenderer {
  draw(ctx, explosions) {
    const isBrutal = this.theme.id === 'brutal';

    explosions.forEach(exp => {
      const progress = exp.timer / exp.maxTimer;

      // 光环
      exp.rings.forEach(ring => {
        ring.radius += ring.speed;
        ring.alpha *= 0.93;
        if (ring.alpha > 0.01) {
          if (isBrutal) {
            // 粗野风：方块光环
            ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, ring.alpha);
            ctx.lineWidth = 3 * (1 - progress);
            const r = ring.radius;
            ctx.strokeRect(-r, -r, r * 2, r * 2);
          } else {
            ctx.strokeStyle = hexRGBA(this.colors.greenPrimary, ring.alpha);
            ctx.lineWidth = 2 * (1 - progress);
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // 闪光
      if (exp.timer < 4) {
        ctx.globalAlpha = (1 - exp.timer / 4) * (isBrutal ? 0.7 : 0.5);
        ctx.fillStyle = this.colors.whitePure || '#ffffff';
        if (isBrutal) {
          ctx.fillRect(exp.x - 18, exp.y - 18, 36, 36);
        } else {
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // 粒子
      const particleColors = isBrutal
        ? ['#39ff14', '#6b7c00', '#d4d4c8', '#ffffff']
        : [this.colors.greenPrimary, '#00cc33', '#39ff14'];

      exp.particles.forEach(p => {
        if (exp.timer > (p.life || 15)) return;
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        const alpha = 1 - exp.timer / (p.life || 15);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particleColors[Math.floor(Math.random() * particleColors.length)];

        if (isBrutal) {
          // 粗野风：方块碎片
          const s = (p.size || 2) * (1 - progress * 0.3);
          ctx.fillRect(exp.x + p.x - s, exp.y + p.y - s, s * 2, s * 2);
        } else {
          ctx.beginPath();
          ctx.arc(exp.x + p.x, exp.y + p.y, (p.size || 2) * (1 - progress * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    });
  }
}


// ==================== 背景渲染器 ====================
class BackgroundRenderer extends BaseRenderer {
  draw(ctx, stars, shootingStars, frameCount) {
    ctx.fillStyle = this.colors.bgPure;
    ctx.fillRect(0, 0, 480, 720);

    switch (this.theme.id) {
      case 'terminal': this.drawBgTerminal(ctx, stars, shootingStars, frameCount); break;
      case 'brutal':   this.drawBgBrutal(ctx, stars, shootingStars, frameCount); break;
      case 'matrix':   this.drawBgMatrix(ctx, stars, shootingStars, frameCount); break;
      case 'glitch':   this.drawBgGlitch(ctx, stars, shootingStars, frameCount); break;
      case 'minimal':  this.drawBgMinimal(ctx, stars, shootingStars, frameCount); break;
      default:         this.drawBgTerminal(ctx, stars, shootingStars, frameCount);
    }
  }

  drawBgTerminal(ctx, stars, shootingStars, frameCount) {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 480; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke();
    }
    for (let y = 0; y < 720; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(480, y); ctx.stroke();
    }
    this.drawStars(ctx, stars, frameCount);
    this.drawShootingStars(ctx, shootingStars);
  }

  /* --- BRUTAL 背景：铁丝网 + 对角线 + 粗网格 --- */
  drawBgBrutal(ctx, stars, shootingStars, frameCount) {
    const green = this.colors.greenPrimary;

    // 粗网格 — 间距大、线粗
    ctx.strokeStyle = hexRGBA(green, 0.06);
    ctx.lineWidth = 1;
    for (let x = 0; x < 480; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke();
    }
    for (let y = 0; y < 720; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(480, y); ctx.stroke();
    }

    // 铁丝网对角线
    ctx.strokeStyle = hexRGBA(green, 0.035);
    ctx.lineWidth = 1;
    for (let x = -720; x < 480 + 720; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 720, 720);
      ctx.stroke();
    }

    // 中心十字骨架线
    ctx.strokeStyle = hexRGBA(green, 0.04);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(240, 0); ctx.lineTo(240, 720);
    ctx.moveTo(0, 360); ctx.lineTo(480, 360);
    ctx.stroke();

    // 随机闪烁的「铆钉」点
    ctx.fillStyle = hexRGBA(green, 0.15);
    for (let x = 24; x < 480; x += 48) {
      for (let y = 24; y < 720; y += 48) {
        const flicker = Math.sin(frameCount * 0.008 + x * 0.3 + y * 0.2) * 0.5 + 0.5;
        if (flicker > 0.7) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    }

    this.drawStars(ctx, stars, frameCount, 'brutal');
    this.drawShootingStars(ctx, shootingStars, 'brutal');
  }

  drawBgMatrix(ctx, stars, shootingStars, frameCount) {
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, 480, 720);
    this.drawStars(ctx, stars, frameCount, 'matrix');
    this.drawShootingStars(ctx, shootingStars, 'matrix');
  }

  drawBgGlitch(ctx, stars, shootingStars, frameCount) {
    if (Math.random() < 0.008) {
      const y = Math.random() * 720;
      const h = Math.random() * 30 + 5;
      const offset = (Math.random() - 0.5) * 20;
      ctx.drawImage(ctx.canvas, 0, y, 480, h, offset, y, 480, h);
    }
    this.drawStars(ctx, stars, frameCount);
    this.drawShootingStars(ctx, shootingStars);
  }

  drawBgMinimal(ctx, stars, shootingStars, frameCount) {
    this.drawStars(ctx, stars, frameCount, 'minimal');
    this.drawShootingStars(ctx, shootingStars, 'minimal');
  }

  drawStars(ctx, stars, frameCount, style = 'default') {
    stars.forEach(star => {
      const flicker = Math.sin(frameCount * 0.015 + star.x * 0.5 + star.y * 0.3) * 0.2 + 0.8;
      const alpha = (star.brightness || star.flicker || 0.3) * flicker;

      if (style === 'brutal') {
        // 粗野风：方块星
        ctx.fillStyle = hexRGBA(this.colors.greenPrimary, alpha * 0.6);
        ctx.fillRect(star.x - 1, star.y - 1, 2, 2);
      } else if (style === 'matrix') {
        ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === 'minimal') {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const layer = star.layer || 0;
        ctx.fillStyle = layer === 2
          ? `rgba(0, 255, 65, ${alpha})`
          : `rgba(200, 200, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  drawShootingStars(ctx, shootingStars, style = 'default') {
    shootingStars.forEach(s => {
      const alpha = s.life / s.maxLife;
      ctx.globalAlpha = alpha;
      if (style === 'brutal') {
        // 粗野风：粗线流星
        ctx.strokeStyle = this.colors.greenPrimary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.length / s.vy), s.y - s.length);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.length / s.vy), s.y - s.length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }
}


// ==================== UI 渲染器 ====================
class UIRenderer extends BaseRenderer {
  drawHUD(ctx, player, gameTime) {
    const level = Math.floor(gameTime / 1800) + 1;
    const t = this.theme.id;
    const isBrutal = t === 'brutal';
    const green = this.colors.greenPrimary;

    if (isBrutal) {
      // === BRUTAL HUD ===
      // 粗边框顶栏
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, 480, 52);
      ctx.strokeStyle = green;
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 476, 48);
      // 底部分割线
      ctx.strokeStyle = hexRGBA(green, 0.4);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(480, 52); ctx.stroke();

      // SCORE — 粗体
      ctx.textAlign = 'left';
      ctx.fillStyle = green;
      ctx.font = 'bold 11px Impact, Arial Black, sans-serif';
      ctx.fillText('SCORE', 14, 18);
      ctx.fillStyle = this.colors.whiteConcrete || '#d4d4c8';
      ctx.font = 'bold 22px Impact, Arial Black, sans-serif';
      ctx.fillText(player.score.toString(), 14, 42);

      // LEVEL — 粗体
      ctx.textAlign = 'center';
      ctx.fillStyle = green;
      ctx.font = 'bold 11px Impact, Arial Black, sans-serif';
      ctx.fillText('LEVEL', 240, 18);
      ctx.fillStyle = green;
      ctx.font = 'bold 20px Impact, Arial Black, sans-serif';
      ctx.fillText(level.toString(), 240, 42);

      // LIFE — 方块心
      ctx.textAlign = 'right';
      ctx.fillStyle = green;
      ctx.font = 'bold 11px Impact, Arial Black, sans-serif';
      ctx.fillText('LIFE', 480 - 14, 18);
      for (let i = 0; i < player.lives; i++) {
        ctx.fillStyle = green;
        ctx.fillRect(480 - 18 - i * 18, 28, 12, 12);
      }

      // 增益状态
      if (player.shield) {
        ctx.fillStyle = green;
        ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('SHIELD', 14, 48);
      }
      if (player.propTimer > 0) {
        const sec = Math.ceil(player.propTimer / 60);
        ctx.fillStyle = green;
        ctx.font = 'bold 12px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(player.bulletType === 'double' ? 'DOUBLE ' + sec + 's' : 'POWER ' + sec + 's', 110, 48);
      }
    } else {
      // === 其他主题 HUD ===
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, 480, 50);
      ctx.strokeStyle = hexRGBA(green, 0.15);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(480, 50); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = hexRGBA(green, 0.5);
      ctx.font = '10px monospace';
      ctx.fillText('SCORE', 14, 16);
      ctx.fillStyle = this.colors.whitePure || '#ffffff';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(player.score.toString(), 14, 36);

      ctx.textAlign = 'center';
      ctx.fillStyle = hexRGBA(green, 0.5);
      ctx.font = '10px monospace';
      ctx.fillText('LEVEL', 240, 16);
      ctx.fillStyle = green;
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(level.toString(), 240, 36);

      ctx.textAlign = 'right';
      ctx.fillStyle = hexRGBA(green, 0.5);
      ctx.font = '10px monospace';
      ctx.fillText('LIFE', 480 - 14, 16);
      for (let i = 0; i < player.lives; i++) {
        this.drawMiniHeart(ctx, 480 - 18 - i * 22, 28);
      }

      if (player.shield) {
        ctx.fillStyle = green;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SHIELD', 14, 48);
      }
      if (player.propTimer > 0) {
        const sec = Math.ceil(player.propTimer / 60);
        ctx.fillStyle = green;
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(player.bulletType === 'double' ? 'DOUBLE ' + sec + 's' : 'POWER ' + sec + 's', 100, 48);
      }
    }

    // BOSS 血条（所有主题通用）
    var game = window.gameInstance;
    var boss = game ? game.enemies.find(e => e.type === 'boss' && e.alive) : null;
    if (boss) {
      var barW = 300, barH = isBrutal ? 6 : 5, barX = (480 - barW) / 2, barY = isBrutal ? 58 : 56;
      var hpRatio = boss.hp / boss.maxHp;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(barX, barY, barW, barH);
      if (isBrutal) {
        ctx.strokeStyle = hexRGBA(green, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
      }
      ctx.fillStyle = hpRatio > 0.3 ? green : '#ff3300';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.fillStyle = hexRGBA(green, 0.6);
      ctx.font = isBrutal ? 'bold 10px Impact, Arial Black, sans-serif' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', 240, barY - 3);
    }
  }

  drawMiniHeart(ctx, x, y) {
    ctx.fillStyle = this.colors.greenPrimary;
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.bezierCurveTo(x, y, x - 4, y - 3, x - 7, y + 1);
    ctx.bezierCurveTo(x - 11, y + 6, x, y + 13, x, y + 13);
    ctx.bezierCurveTo(x, y + 13, x + 11, y + 6, x + 7, y + 1);
    ctx.bezierCurveTo(x + 4, y - 3, x, y, x, y + 3);
    ctx.fill();
  }
}
