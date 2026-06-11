/**
 * 主题管理器
 * 负责主题的加载、切换、应用和持久化
 */

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.defaultTheme = 'terminal';
    this.observers = []; // 主题变更监听器

    // 从 localStorage 加载用户主题偏好
    this.loadUserPreference();

    // 如果没有保存的主题偏好，使用默认主题
    if (!this.currentTheme) {
      this.currentTheme = this.defaultTheme;
    }
  }

  /**
   * 加载用户的主题偏好
   */
  loadUserPreference() {
    try {
      const savedTheme = localStorage.getItem('planeWarTheme');
      if (savedTheme && THEMES[savedTheme]) {
        this.currentTheme = savedTheme;
      }
    } catch (e) {
      console.warn('无法加载主题偏好:', e);
    }
  }

  /**
   * 保存用户的主题偏好
   */
  saveUserPreference() {
    try {
      localStorage.setItem('planeWarTheme', this.currentTheme);
    } catch (e) {
      console.warn('无法保存主题偏好:', e);
    }
  }

  /**
   * 获取当前主题配置
   */
  getCurrentTheme() {
    return THEMES[this.currentTheme];
  }

  /**
   * 获取主题配置
   */
  getTheme(themeId) {
    return THEMES[themeId];
  }

  /**
   * 获取所有可用主题
   */
  getAllThemes() {
    return Object.values(THEMES);
  }

  /**
   * 切换主题
   */
  switchTheme(themeId) {
    if (!THEMES[themeId]) {
      console.warn(`主题 "${themeId}" 不存在`);
      return false;
    }

    const oldTheme = this.currentTheme;
    this.currentTheme = themeId;
    this.saveUserPreference();

    // 通知所有观察者
    this.notifyObservers(themeId, oldTheme);

    return true;
  }

  /**
   * 应用主题到页面
   */
  applyThemeToDOM() {
    const theme = this.getCurrentTheme();
    if (!theme) return;

    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme.id);

    // 更新 CSS 变量
    this.updateCSSVariables(theme);

    // 更新 meta 主题色
    this.updateMetaThemeColor(theme);
  }

  /**
   * 更新 CSS 变量
   */
  updateCSSVariables(theme) {
    const root = document.documentElement;

    // 更新颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${this.toKebabCase(key)}`;
      root.style.setProperty(cssVarName, value);
    });

    // 更新渲染参数变量
    Object.entries(theme.renderParams).forEach(([key, value]) => {
      const cssVarName = `--render-${this.toKebabCase(key)}`;
      root.style.setProperty(cssVarName, String(value));
    });

    // 更新特效参数变量
    Object.entries(theme.effectParams).forEach(([key, value]) => {
      const cssVarName = `--effect-${this.toKebabCase(key)}`;
      root.style.setProperty(cssVarName, String(value));
    });
  }

  /**
   * 更新 meta 主题色
   */
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme.colors.bgPure;
  }

  /**
   * 获取当前主题的渲染器
   */
  getRenderers() {
    const theme = this.getCurrentTheme();
    if (!theme) return null;

    // 动态加载对应主题的渲染器
    return {
      player: new PlayerRenderer(theme),
      enemy: new EnemyRenderer(theme),
      bullet: new BulletRenderer(theme),
      prop: new PropRenderer(theme),
      effect: new EffectRenderer(theme),
      background: new BackgroundRenderer(theme),
      ui: new UIRenderer(theme)
    };
  }

  /**
   * 添加主题变更监听器
   */
  subscribe(callback) {
    this.observers.push(callback);
  }

  /**
   * 移除主题变更监听器
   */
  unsubscribe(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  /**
   * 通知所有观察者
   */
  notifyObservers(newThemeId, oldThemeId) {
    this.observers.forEach(callback => {
      try {
        callback(newThemeId, oldThemeId);
      } catch (e) {
        console.error('主题观察者回调出错:', e);
      }
    });
  }

  /**
   * 工具方法：转换为 kebab-case
   */
  toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * 获取主题的预览颜色（用于主题选择界面）
   */
  getPreviewColors(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return ['#000000', '#00ff41'];

    return [
      theme.colors.bgPure,
      theme.colors.greenPrimary,
      theme.colors.whitePure
    ];
  }

  /**
   * 比较两个主题的差异
   */
  compareThemes(themeId1, themeId2) {
    const theme1 = THEMES[themeId1];
    const theme2 = THEMES[themeId2];

    const differences = [];

    // 比较颜色
    Object.keys(theme1.colors).forEach(key => {
      if (theme1.colors[key] !== theme2.colors[key]) {
        differences.push({
          type: 'color',
          key: key,
          value1: theme1.colors[key],
          value2: theme2.colors[key]
        });
      }
    });

    return differences;
  }

  /**
   * 获取主题统计信息
   */
  getThemeStats() {
    const themes = this.getAllThemes();
    return {
      total: themes.length,
      categories: Object.keys(THEME_CATEGORIES).length,
      currentId: this.currentTheme,
      currentName: this.getCurrentTheme().name
    };
  }
}

// 创建全局主题管理器实例
const themeManager = new ThemeManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, themeManager };
}