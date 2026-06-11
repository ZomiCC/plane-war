/**
 * 基础渲染器类
 * 为所有具体渲染器提供通用方法
 */

class BaseRenderer {
  constructor(theme) {
    this.theme = theme;
    this.colors = theme.colors;
    this.params = theme.renderParams;
    this.effects = theme.effectParams;
  }

  /**
   * 更新主题
   */
  updateTheme(theme) {
    this.theme = theme;
    this.colors = theme.colors;
    this.params = theme.renderParams;
    this.effects = theme.effectParams;
  }

  /**
   * 应用发光效果
   */
  applyGlow(ctx, color, intensity = null) {
    if (!this.params.glowEnabled) return;

    const glowIntensity = intensity || this.params.glowIntensity;
    ctx.shadowColor = color;
    ctx.shadowBlur = glowIntensity;
  }

  /**
   * 清除发光效果
   */
  clearGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  /**
   * 绘制像素化矩形
   */
  drawPixelRect(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
  }

  /**
   * 绘制几何线条
   */
  drawGeometricLine(ctx, x1, y1, x2, y2, color, lineWidth = null) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || this.params.lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  /**
   * 绘制发光矩形
   */
  drawGlowingRect(ctx, x, y, width, height, color, fill = true) {
    const halfW = width / 2;
    const halfH = height / 2;

    if (fill) {
      ctx.fillStyle = color.replace(')', `, ${this.params.fillOpacity})`).replace('rgb', 'rgba');
      ctx.fillRect(x - halfW, y - halfH, width, height);
    }

    if (this.params.glowEnabled) {
      this.applyGlow(ctx, this.colors.greenPrimary);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = this.params.lineWidth;
    ctx.strokeRect(x - halfW, y - halfH, width, height);

    this.clearGlow(ctx);
  }

  /**
   * 获取闪烁效果
   */
  getFlashAlpha(flashTimer, maxFlash = 5) {
    if (flashTimer <= 0) return 0;
    return flashTimer / maxFlash;
  }

  /**
   * 应用闪烁效果
   */
  applyFlash(ctx, flashTimer, baseColor) {
    const alpha = this.getFlashAlpha(flashTimer);
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.colors.whitePure;
      return true;
    }
    ctx.fillStyle = baseColor;
    return false;
  }

  /**
   * 绘制带纹理的形状
   */
  drawTexturedShape(ctx, shape, x, y, width, height, color, texture = 'solid') {
    ctx.save();
    ctx.translate(x, y);

    const halfW = width / 2;
    const halfH = height / 2;

    switch (texture) {
      case 'striped':
        this.drawStripedShape(ctx, shape, halfW, halfH, color);
        break;
      case 'grid':
        this.drawGridShape(ctx, shape, halfW, halfH, color);
        break;
      case 'dotted':
        this.drawDottedShape(ctx, shape, halfW, halfH, color);
        break;
      case 'wireframe':
        this.drawWireframeShape(ctx, shape, halfW, halfH, color);
        break;
      default:
        this.drawSolidShape(ctx, shape, halfW, halfH, color);
    }

    ctx.restore();
  }

  /**
   * 绘制条纹形状
   */
  drawStripedShape(ctx, shape, halfW, halfH, color) {
    // 先填充基础色
    this.drawSolidShape(ctx, shape, halfW, halfH, color);

    // 添加条纹
    ctx.save();
    this.clipToShape(ctx, shape, halfW, halfH);

    ctx.strokeStyle = this.colors.whitePure;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;

    const spacing = 4;
    for (let i = -halfH; i < halfH; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(-halfW, i);
      ctx.lineTo(halfW, i + spacing);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 绘制网格形状
   */
  drawGridShape(ctx, shape, halfW, halfH, color) {
    this.drawSolidShape(ctx, shape, halfW, halfH, color);

    ctx.save();
    this.clipToShape(ctx, shape, halfW, halfH);

    ctx.strokeStyle = this.colors.whitePure;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.08;

    const spacing = 6;
    for (let x = -halfW; x < halfW; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, -halfH);
      ctx.lineTo(x, halfH);
      ctx.stroke();
    }
    for (let y = -halfH; y < halfH; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 绘制点状形状
   */
  drawDottedShape(ctx, shape, halfW, halfH, color) {
    this.drawSolidShape(ctx, shape, halfW, halfH, color);

    ctx.save();
    this.clipToShape(ctx, shape, halfW, halfH);

    ctx.fillStyle = this.colors.whitePure;
    ctx.globalAlpha = 0.15;

    const spacing = 4;
    for (let x = -halfW + 2; x < halfW - 2; x += spacing) {
      for (let y = -halfH + 2; y < halfH - 2; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * 绘制线框形状
   */
  drawWireframeShape(ctx, shape, halfW, halfH, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = this.params.lineWidth;
    ctx.globalAlpha = 0.8;

    this.drawShapePath(ctx, shape, halfW, halfH);
    ctx.stroke();

    // 添加内部细节
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;

    const detailSize = 0.7;
    this.drawShapePath(ctx, shape, halfW * detailSize, halfH * detailSize);
    ctx.stroke();
  }

  /**
   * 绘制实心形状
   */
  drawSolidShape(ctx, shape, halfW, halfH, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = this.params.fillOpacity;
    this.drawShapePath(ctx, shape, halfW, halfH);
    ctx.fill();
  }

  /**
   * 绘制形状路径
   */
  drawShapePath(ctx, shape, halfW, halfH) {
    ctx.beginPath();
    switch (shape) {
      case 'rect':
      case 'square':
        ctx.rect(-halfW, -halfH, halfW * 2, halfH * 2);
        break;
      case 'circle':
        ctx.arc(0, 0, Math.min(halfW, halfH), 0, Math.PI * 2);
        break;
      case 'diamond':
        ctx.moveTo(0, -halfH);
        ctx.lineTo(halfW, 0);
        ctx.lineTo(0, halfH);
        ctx.lineTo(-halfW, 0);
        ctx.closePath();
        break;
      case 'triangle':
        ctx.moveTo(0, -halfH);
        ctx.lineTo(halfW, halfH);
        ctx.lineTo(-halfW, halfH);
        ctx.closePath();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = Math.cos(angle) * halfW;
          const y = Math.sin(angle) * halfH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
    }
  }

  /**
   * 裁剪到形状
   */
  clipToShape(ctx, shape, halfW, halfH) {
    ctx.beginPath();
    this.drawShapePath(ctx, shape, halfW, halfH);
    ctx.clip();
  }

  /**
   * 绘制故障效果
   */
  applyGlitchEffect(ctx, x, y, width, height) {
    const shouldGlitch = Math.random() < 0.02; // 2% 概率
    if (!shouldGlitch) return;

    const glitchAmount = (Math.random() - 0.5) * 4;
    const glitchHeight = Math.random() * height;

    ctx.save();
    ctx.translate(glitchAmount, 0);
    ctx.drawImage(
      ctx.canvas,
      x - width / 2, y + glitchHeight - height / 2, width, glitchHeight,
      x - width / 2 + glitchAmount, y + glitchHeight - height / 2, width, glitchHeight
    );
    ctx.restore();
  }

  /**
   * 绘制代码矩阵效果
   */
  drawCodeMatrix(ctx, x, y, width, height, chars = '01') {
    const charSize = 8;
    const cols = Math.floor(width / charSize);
    const rows = Math.floor(height / charSize);

    ctx.fillStyle = this.colors.greenPrimary;
    ctx.font = `${charSize}px monospace`;
    ctx.globalAlpha = 0.3;

    for (let i = 0; i < cols * rows * 0.3; i++) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(
        char,
        x - width / 2 + col * charSize,
        y - height / 2 + row * charSize
      );
    }

    ctx.globalAlpha = 1;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BaseRenderer };
}
