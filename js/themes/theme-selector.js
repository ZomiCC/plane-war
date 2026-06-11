/**
 * 主题选择器
 * 游戏开始前的主题选择界面
 */

class ThemeSelector {
  constructor() {
    this.container = null;
    this.themes = themeManager.getAllThemes();
    this.selectedIndex = this.themes.findIndex(t => t.id === themeManager.currentTheme);
    this.confirmed = false;
    this.animFrame = null;
    this.pulseTimer = 0;
    this.previewCanvas = null;
    this.previewCtx = null;
  }

  /**
   * 显示主题选择界面
   * 返回 Promise，在用户确认选择后 resolve
   */
  show() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.container = document.getElementById('theme-screen');
      this.container.classList.remove('hidden');
      this.container.style.opacity = '1';
      this.container.style.visibility = 'visible';
      this.container.style.pointerEvents = 'auto';
      this.render();
      this.startPreviewLoop();
    });
  }

  /**
   * 隐藏主题选择界面
   */
  hide() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.container.classList.add('hidden');
    this.container.style.opacity = '0';
    this.container.style.visibility = 'hidden';
    this.container.style.pointerEvents = 'none';
  }

  /**
   * 渲染主题选择界面
   */
  render() {
    const cardsContainer = this.container.querySelector('.theme-cards');
    cardsContainer.innerHTML = '';

    this.themes.forEach((theme, index) => {
      const card = document.createElement('div');
      card.className = 'theme-card' + (index === this.selectedIndex ? ' selected' : '');
      card.dataset.themeId = theme.id;

      // 预览画布
      const preview = document.createElement('canvas');
      preview.width = 120;
      preview.height = 80;
      preview.className = 'theme-preview';
      card.appendChild(preview);

      // 主题名称
      const name = document.createElement('div');
      name.className = 'theme-name';
      name.textContent = theme.name;
      card.appendChild(name);

      // 主题描述
      const desc = document.createElement('div');
      desc.className = 'theme-desc';
      desc.textContent = theme.description;
      card.appendChild(desc);

      // 颜色条
      const colorBar = document.createElement('div');
      colorBar.className = 'theme-colors';
      const colors = theme.colors;
      const whiteKey = colors.whitePure || colors.whiteConcrete || colors.whiteMinimal || '#ffffff';
      [colors.bgPure, colors.greenPrimary, whiteKey].forEach(c => {
        const dot = document.createElement('span');
        dot.className = 'color-dot';
        dot.style.background = c;
        if (c === colors.bgPure) dot.style.border = '1px solid #333';
        colorBar.appendChild(dot);
      });
      card.appendChild(colorBar);

      // 点击选择
      card.addEventListener('click', () => {
        this.selectedIndex = index;
        this.updateSelection();
        this.drawPreview(preview, theme);
      });

      // 双击确认
      card.addEventListener('dblclick', () => {
        this.confirm();
      });

      cardsContainer.appendChild(card);

      // 绘制初始预览
      this.drawPreview(preview, theme);
    });

    // 确认按钮
    const confirmBtn = this.container.querySelector('.theme-confirm-btn');
    confirmBtn.onclick = () => this.confirm();

    // 更新选中状态
    this.updateSelection();
  }

  /**
   * 绘制主题预览缩略图
   */
  drawPreview(canvas, theme) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // 背景
    ctx.fillStyle = theme.colors.bgPure;
    ctx.fillRect(0, 0, w, h);

    // 网格
    if (theme.backgroundParams.gridEnabled) {
      ctx.strokeStyle = theme.backgroundParams.gridColor;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 15) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    // 模拟玩家飞机
    const px = w * 0.5, py = h * 0.75;
    ctx.strokeStyle = theme.colors.greenPrimary;
    ctx.fillStyle = theme.colors.greenPrimary.replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', '');
    // 简易飞机预览
    ctx.fillStyle = `rgba(${parseInt(theme.colors.greenPrimary.slice(1,3),16)}, ${parseInt(theme.colors.greenPrimary.slice(3,5),16)}, ${parseInt(theme.colors.greenPrimary.slice(5,7),16)}, 0.2)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px - 10, py + 10);
    ctx.lineTo(px, py + 4);
    ctx.lineTo(px + 10, py + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 模拟敌人
    const enemyWhite = theme.colors.whitePure || theme.colors.whiteConcrete || '#ffffff';
    ctx.strokeStyle = enemyWhite;
    ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;

    const isBrutal = theme.id === 'brutal';
    const lw = isBrutal ? 2.5 : 1.5;
    ctx.lineWidth = lw;

    // 方块敌人
    ctx.strokeRect(w * 0.25 - 5, h * 0.25 - 5, 10, 10);
    ctx.fillRect(w * 0.25 - 5, h * 0.25 - 5, 10, 10);
    // 圆形敌人
    ctx.beginPath();
    ctx.arc(w * 0.65, h * 0.2, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // 菱形敌人
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.4 - 7);
    ctx.lineTo(w * 0.45 + 7, h * 0.4);
    ctx.lineTo(w * 0.45, h * 0.4 + 7);
    ctx.lineTo(w * 0.45 - 7, h * 0.4);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 模拟子弹
    ctx.fillStyle = theme.colors.greenPrimary;
    const bw = isBrutal ? 3 : 2;
    ctx.fillRect(px - bw / 2, py - 22, bw, 10);

    // 模拟爆炸粒子
    ctx.fillStyle = theme.colors.greenPrimary;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const dist = 6 + Math.random() * 3;
      if (isBrutal) {
        ctx.fillRect(w * 0.65 + Math.cos(angle) * dist - 1.5, h * 0.2 + Math.sin(angle) * dist - 1.5, 3, 3);
      } else {
        ctx.beginPath();
        ctx.arc(w * 0.65 + Math.cos(angle) * dist, h * 0.2 + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Brutal 特有：对角线纹理
    if (isBrutal) {
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
      ctx.lineWidth = 0.5;
      for (let d = -h; d < w + h; d += 10) {
        ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + h, h); ctx.stroke();
      }
    }

    // 扫描线
    if (theme.effectParams.scanlineEnabled) {
      ctx.fillStyle = `rgba(0, 0, 0, ${theme.effectParams.scanlineIntensity})`;
      for (let y = 0; y < h; y += 2) {
        ctx.fillRect(0, y, w, 1);
      }
    }
  }

  /**
   * 更新选中状态
   */
  updateSelection() {
    const cards = this.container.querySelectorAll('.theme-card');
    cards.forEach((card, index) => {
      card.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  /**
   * 确认选择
   */
  confirm() {
    if (this.confirmed) return;
    this.confirmed = true;
    const selectedTheme = this.themes[this.selectedIndex];
    themeManager.switchTheme(selectedTheme.id);
    themeManager.applyThemeToDOM();
    this.hide();
    if (this.resolve) this.resolve(selectedTheme.id);
  }

  /**
   * 启动预览动画循环
   */
  startPreviewLoop() {
    this.pulseTimer = 0;
    const animate = () => {
      if (this.confirmed) return;
      this.pulseTimer++;
      // 每120帧刷新一次预览（约2秒），添加微妙的动态感
      if (this.pulseTimer % 120 === 0) {
        const cards = this.container.querySelectorAll('.theme-card');
        cards.forEach((card, i) => {
          const preview = card.querySelector('.theme-preview');
          if (preview) this.drawPreview(preview, this.themes[i]);
        });
      }
      this.animFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * 键盘导航
   */
  handleKey(key) {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateSelection();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.selectedIndex = Math.min(this.themes.length - 1, this.selectedIndex + 1);
        this.updateSelection();
        break;
      case 'Enter':
      case ' ':
        this.confirm();
        break;
    }
  }
}
