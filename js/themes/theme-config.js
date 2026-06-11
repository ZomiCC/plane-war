/**
 * 主题配置系统
 * 定义每个主题的配色、渲染参数、特效参数
 */

const THEMES = {
  // 终端美学风格
  terminal: {
    id: 'terminal',
    name: '终端美学',
    description: '极简的黑白绿终端风格',
    preview: 'terminal', // 预览图片

    // 配色方案
    colors: {
      bgPure: '#000000',
      bgNoise: '#080808',
      greenPrimary: '#00ff41',
      greenDim: '#008f11',
      greenBright: '#39ff14',
      whitePure: '#ffffff',
      grayDim: '#333333',
      grayMedium: '#666666',
      accentColor: '#00ff41'
    },

    // 渲染参数
    renderParams: {
      lineWidth: 1,
      cornerSharp: true, // 尖角
      fillOpacity: 0.1,
      glowEnabled: true,
      glowIntensity: 8,
      pixelPerfect: true
    },

    // 特效参数
    effectParams: {
      scanlineEnabled: true,
      scanlineIntensity: 0.08,
      vignetteEnabled: true,
      vignetteIntensity: 0.3,
      noiseEnabled: true,
      noiseIntensity: 0.02
    },

    // 爆炸效果参数
    explosionParams: {
      particleCount: { small: 8, medium: 12, large: 20, boss: 30 },
      particleType: 'pixel', // pixel, geometric, debris
      particleColors: ['#00ff41', '#00cc33', '#39ff14'],
      ringEnabled: true,
      ringColor: '#00ff41'
    },

    // 背景效果
    backgroundParams: {
      type: 'terminal', // terminal, matrix, geometric, brutal
      scanlineSpeed: 0.5,
      codeRainEnabled: false,
      gridEnabled: true,
      gridColor: 'rgba(0, 255, 65, 0.03)'
    },

    // UI 参数
    uiParams: {
      fontFamily: 'monospace',
      fontSize: '12px',
      borderStyle: 'terminal',
      buttonStyle: 'minimal',
      hudStyle: 'compact'
    }
  },

  // 粗野建构风格
  brutal: {
    id: 'brutal',
    name: '粗野建构',
    description: '厚重的几何体块与工业质感',

    colors: {
      bgPure: '#050505',
      bgNoise: '#0a0a08',
      greenPrimary: '#39ff14',
      greenBright: '#39ff14',
      greenDim: '#6b7c00',
      greenToxic: '#aaff00',
      greenOlive: '#6b7c00',
      greenMilitary: '#4a5d00',
      whitePure: '#d4d4c8',
      whiteConcrete: '#d4d4c8',
      grayDim: '#1a1a1a',
      grayMetallic: '#3a3a3a',
      rustAccent: '#8b6914',
      accentColor: '#39ff14'
    },

    renderParams: {
      lineWidth: 3,
      cornerSharp: false,
      fillOpacity: 0.35,
      glowEnabled: false,
      glowIntensity: 0,
      pixelPerfect: false,
      blockShadow: true
    },

    effectParams: {
      scanlineEnabled: true,
      scanlineIntensity: 0.04,
      vignetteEnabled: true,
      vignetteIntensity: 0.35,
      noiseEnabled: true,
      noiseIntensity: 0.05
    },

    explosionParams: {
      particleCount: { small: 6, medium: 10, large: 18, boss: 28 },
      particleType: 'block',
      particleColors: ['#39ff14', '#6b7c00', '#d4d4c8', '#ffffff'],
      ringEnabled: true,
      ringColor: '#39ff14'
    },

    backgroundParams: {
      type: 'brutal',
      scanlineSpeed: 0.3,
      codeRainEnabled: false,
      gridEnabled: true,
      gridColor: 'rgba(57, 255, 20, 0.06)',
      wireMesh: true,
      diagLines: true
    },

    uiParams: {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '14px',
      borderStyle: 'thick',
      buttonStyle: 'brutal',
      hudStyle: 'heavy'
    }
  },

  // 矩阵流变风格
  matrix: {
    id: 'matrix',
    name: '矩阵流变',
    description: '黑客帝国的数字雨美学',

    colors: {
      bgPure: '#001100',
      bgNoise: '#002200',
      greenPrimary: '#00ff41',
      greenBright: '#39ff14',
      greenDim: '#003b00',
      greenMatrix: '#00ff41',
      greenFade: '#003b00',
      whitePure: '#c8ffc8',
      whiteCode: '#c8ffc8'
    },

    renderParams: {
      lineWidth: 1,
      cornerSharp: true,
      fillOpacity: 0.15,
      glowEnabled: true,
      glowIntensity: 6,
      pixelPerfect: true
    },

    effectParams: {
      scanlineEnabled: true,
      scanlineIntensity: 0.06,
      vignetteEnabled: true,
      vignetteIntensity: 0.25,
      noiseEnabled: true,
      noiseIntensity: 0.03
    },

    explosionParams: {
      particleCount: { small: 10, medium: 15, large: 25, boss: 40 },
      particleType: 'code', // 数字粒子
      particleColors: ['#00ff41', '#00cc33', '#c8ffc8'],
      ringEnabled: true,
      ringColor: '#00ff41'
    },

    backgroundParams: {
      type: 'matrix',
      scanlineSpeed: 0.7,
      codeRainEnabled: true,
      gridEnabled: false,
      gridColor: 'rgba(0, 255, 65, 0.05)'
    },

    uiParams: {
      fontFamily: 'monospace',
      fontSize: '13px',
      borderStyle: 'terminal',
      buttonStyle: 'minimal',
      hudStyle: 'compact'
    }
  },

  // 赛博故障风格
  glitch: {
    id: 'glitch',
    name: '赛博故障',
    description: '数字故障与视觉错位',

    colors: {
      bgPure: '#050505',
      bgNoise: '#080808',
      greenPrimary: '#39ff14',
      greenBright: '#39ff14',
      greenDim: '#00cc33',
      greenAcid: '#39ff14',
      greenError: '#ff3300',
      whitePure: '#ffffff',
      whiteStatic: '#ffffff'
    },

    renderParams: {
      lineWidth: 2,
      cornerSharp: true,
      fillOpacity: 0.2,
      glowEnabled: true,
      glowIntensity: 10,
      pixelPerfect: false
    },

    effectParams: {
      scanlineEnabled: true,
      scanlineIntensity: 0.12,
      vignetteEnabled: true,
      vignetteIntensity: 0.4,
      noiseEnabled: true,
      noiseIntensity: 0.06
    },

    explosionParams: {
      particleCount: { small: 12, medium: 18, large: 28, boss: 45 },
      particleType: 'glitch', // 故障方块
      particleColors: ['#39ff14', '#ff3300', '#ffffff'],
      ringEnabled: true,
      ringColor: '#39ff14'
    },

    backgroundParams: {
      type: 'glitch',
      scanlineSpeed: 1.0,
      codeRainEnabled: false,
      gridEnabled: true,
      gridColor: 'rgba(57, 255, 20, 0.06)'
    },

    uiParams: {
      fontFamily: 'monospace',
      fontSize: '12px',
      borderStyle: 'glitch',
      buttonStyle: 'glitch',
      hudStyle: 'compact'
    }
  },

  // 极简几何风格
  minimal: {
    id: 'minimal',
    name: '极简几何',
    description: '纯粹的几何形状，优雅克制',

    colors: {
      bgPure: '#000000',
      bgNoise: '#000000',
      greenPrimary: '#00ff41',
      greenBright: '#39ff14',
      greenDim: '#00cc33',
      greenAccent: '#00cc33',
      whitePure: '#ffffff',
      whiteMinimal: '#ffffff',
      graySubtle: '#1a1a1a'
    },

    renderParams: {
      lineWidth: 1,
      cornerSharp: true,
      fillOpacity: 0.05,
      glowEnabled: false,
      glowIntensity: 0,
      pixelPerfect: true
    },

    effectParams: {
      scanlineEnabled: false,
      scanlineIntensity: 0,
      vignetteEnabled: true,
      vignetteIntensity: 0.15,
      noiseEnabled: false,
      noiseIntensity: 0
    },

    explosionParams: {
      particleCount: { small: 5, medium: 8, large: 12, boss: 20 },
      particleType: 'geometric',
      particleColors: ['#00ff41', '#00cc33'],
      ringEnabled: false,
      ringColor: '#00ff41'
    },

    backgroundParams: {
      type: 'minimal',
      scanlineSpeed: 0,
      codeRainEnabled: false,
      gridEnabled: false,
      gridColor: 'rgba(0, 255, 65, 0.02)'
    },

    uiParams: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      borderStyle: 'minimal',
      buttonStyle: 'minimal',
      hudStyle: 'minimal'
    }
  }
};

// 主题分类（用于组织主题选择界面）
const THEME_CATEGORIES = {
  highContrast: ['terminal', 'minimal'], // 高对比度
  heavy: ['brutal'], // 厚重风格
  digital: ['matrix', 'glitch'] // 数字风格
};

// 主题渲染顺序（影响层级）
const RENDER_ORDER = {
  background: 0,
  grid: 1,
  effects: 2,
  bullets: 3,
  enemies: 4,
  player: 5,
  foreground: 6,
  ui: 7
};

// 导出主题配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES, THEME_CATEGORIES, RENDER_ORDER };
}
