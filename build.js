/**
 * 构建脚本：混淆压缩 JS / CSS / HTML → 输出到 dist/
 */

const fs = require('fs');
const path = require('path');

// 动态导入（terser 等 ESM 模块兼容）
async function build() {
  const { minify: terserMinify } = require('terser');
  const CleanCSS = require('clean-css');
  const { minify: htmlMinify } = require('html-minifier-terser');

  const cleanCSS = new CleanCSS({ level: 2 });

  const SRC = __dirname;
  const DIST = path.join(__dirname, 'dist');

  // 清空 dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 要处理的文件扩展名
  const JS_FILES = [];
  const CSS_FILES = [];
  const HTML_FILES = [];

  // 收集所有文件
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      // 跳过不需要的目录
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', '.git', '.claude'].includes(entry.name)) continue;
        walkDir(fullPath);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      const relPath = path.relative(SRC, fullPath);
      if (ext === '.js') JS_FILES.push(relPath);
      else if (ext === '.css') CSS_FILES.push(relPath);
      else if (ext === '.html') HTML_FILES.push(relPath);
    }
  }
  walkDir(SRC);

  console.log('=== 构建开始 ===\n');

  // 处理 JS 文件
  for (const relPath of JS_FILES) {
    const srcPath = path.join(SRC, relPath);
    const distPath = path.join(DIST, relPath);
    const code = fs.readFileSync(srcPath, 'utf8');

    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    try {
      const result = await terserMinify(code, {
        compress: {
          dead_code: true,
          drop_debugger: true,
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          if_return: true,
          join_vars: true,
          side_effects: true,
        },
        mangle: {
          toplevel: false,    // 不混淆顶层类名（避免 class 注册名冲突）
          properties: false,  // 不混淆属性（避免 this.xxx 访问出错）
          keep_classnames: true,  // 保留类名（避免 new Player() 等引用断掉）
        },
        format: {
          comments: false,    // 移除所有注释
        },
      });
      fs.writeFileSync(distPath, result.code);
      const ratio = ((1 - Buffer.byteLength(result.code) / Buffer.byteLength(code)) * 100).toFixed(1);
      console.log(`[JS]  ${relPath}  →  ${ratio}% smaller`);
    } catch (e) {
      console.error(`[JS]  ${relPath}  ERROR: ${e.message}`);
      // 混淆失败时复制原文件（防止构建中断）
      fs.writeFileSync(distPath, code);
    }
  }

  // 处理 CSS 文件
  for (const relPath of CSS_FILES) {
    const srcPath = path.join(SRC, relPath);
    const distPath = path.join(DIST, relPath);
    const code = fs.readFileSync(srcPath, 'utf8');

    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    const result = cleanCSS.minify(code);
    if (result.errors.length > 0) {
      console.error(`[CSS] ${relPath} ERROR: ${result.errors.join(', ')}`);
      fs.writeFileSync(distPath, code);
    } else {
      fs.writeFileSync(distPath, result.styles);
      const ratio = ((1 - Buffer.byteLength(result.styles) / Buffer.byteLength(code)) * 100).toFixed(1);
      console.log(`[CSS] ${relPath}  →  ${ratio}% smaller`);
    }
  }

  // 处理 HTML 文件
  for (const relPath of HTML_FILES) {
    const srcPath = path.join(SRC, relPath);
    const distPath = path.join(DIST, relPath);
    const code = fs.readFileSync(srcPath, 'utf8');

    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    try {
      const result = await htmlMinify(code, {
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: false, // JS 已经单独处理
      });
      fs.writeFileSync(distPath, result);
      const ratio = ((1 - Buffer.byteLength(result) / Buffer.byteLength(code)) * 100).toFixed(1);
      console.log(`[HTML] ${relPath}  →  ${ratio}% smaller`);
    } catch (e) {
      console.error(`[HTML] ${relPath} ERROR: ${e.message}`);
      fs.writeFileSync(distPath, code);
    }
  }

  console.log('\n=== 构建完成 ===');
  console.log(`输出目录: ${DIST}`);
}

build().catch(e => {
  console.error('构建失败:', e);
  process.exit(1);
});
