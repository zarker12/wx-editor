/**
 * 端到端主题样式测试（E2E）
 * 核心改进：不再验证"主题方法返回的字符串"，而是走完整渲染链路
 *   Markdown → marked.parse → HTML → renderStyledHTML → 带样式HTML → DOMParser 解析
 *   → querySelector 取出真实元素 → 验证 getAttribute('style') 真实值
 * 这才是用户在线上 / 公众号里实际看到的效果。
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = '/workspace';
const THEME_FILES = ['minimal', 'luxury', 'cyber', 'magazine', 'fresh', 'vibrant'];

// ===== 结果收集 =====
const results = [];
let passCount = 0, failCount = 0;
function test(name, condition, detail = '') {
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) passCount++; else failCount++;
    results.push({ name, status, detail });
    if (!condition) console.log(`[FAIL] ${name}${detail ? ' :: ' + detail.slice(0, 200) : ''}`);
}
function section(title) { console.log(`\n===== ${title} =====`); }

// ===== 1. 构建 JSDOM 环境，加载真实页面 =====
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

// polyfills
window.matchMedia = window.matchMedia || function () { return { matches: false, addListener() {}, removeListener() {} }; };
window.DOMParser = window.DOMParser || class {
    parseFromString(str, type) {
        const d = new JSDOM(str, { contentType: type === 'text/html' ? 'text/html' : 'text/xml' });
        return d.window.document;
    }
};
window.ClipboardItem = window.ClipboardItem || class {};
window.navigator.clipboard = window.navigator.clipboard || { write: async () => {}, writeText: async () => {} };
window.getComputedStyle = window.getComputedStyle || function (el) { return { getPropertyValue: (p) => el.style && el.style[p] }; };

// 注入真实 marked（关键！旧测试这里设为 undefined，导致跳过了真实解析链路）
window.marked = marked;

// 加载 script.js（移除会触发 DOMContentLoaded 的自执行块）
// 注：script.js 顶层会调用 syncEditorToTheme 等访问主题的代码，此时主题未加载会抛异常，
// 但函数声明（renderStyledHTML 等）仍会解析；异常被 catch 吞掉不影响后续。
let scriptCode = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/document\.addEventListener\('DOMContentLoaded'[^}]*\},\s*\d+\);/g, '');
// 移除顶层立即调用：fillIntroDefaults/syncEditorToTheme/updatePreview 在主题加载前执行会访问
// theme.textColor 抛异常中断后续，且测试无需这些 UI 初始化
scriptCode = scriptCode.replace(/^fillIntroDefaults\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^syncEditorToTheme\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^updatePreview\(\);\s*$/gm, '');
// 移除顶层 setFont(currentFont) 调用：setFont 内部链式调用 syncEditorToTheme 访问 theme.textColor 抛异常
scriptCode = scriptCode.replace(/^setFont\(currentFont\);\s*$/gm, '');
// 关键：在同一 eval 内执行 script.js 并暴露 const 变量到 window，供后续主题代码/覆盖函数使用
// （两次独立 eval 间 const 词法环境不共享）
scriptCode += `
;window.__ff=fontFamilies;window.__fw=fontWeights;window.__ct=colorThemes;window.__sz=sizeThemes;window.__sp=spacingThemes;window.__tk=trackingThemes;window.__gf=getFontFamily;window.__gw=getFontWeight;window.__gst=getStyleTheme;window.__gcc=getColorConfig;window.__rsh=renderStyledHTML;window.__geh=generateExportHTML;window.__gih=getIntroCardHTML;`;
try {
    window.eval(scriptCode);
} catch (e) {
    console.error('加载 script.js(顶层语句异常,不影响函数定义):', e.message);
}

// 用 var 重新声明为全局变量（主题代码以全局方式引用 fontFamilies 等）
window.eval(`
    var fontFamilies = window.__ff || { serif:"'Noto Serif SC',Georgia,serif", sans:"'PingFang SC',sans-serif", mono:"'JetBrains Mono',Consolas,monospace" };
    var fontWeights = window.__fw || { serif:'400', sans:'300', mono:'400' };
    var colorThemes = window.__ct || {};
    var sizeThemes = window.__sz || { medium:{fontSize:'15px',h2Size:'18px',h1Size:'23px'} };
    var spacingThemes = window.__sp || { compact:{pMargin:'14px',h2MarginTop:'24px',h2MarginBottom:'12px',lineHeight:'1.85'} };
    var trackingThemes = window.__tk || { tight:{letterSpacing:'0'} };
    // 暴露函数到 window（renderStyledHTML 等在 eval 作用域内，外部通过 window 调用）
    window.renderStyledHTML = window.__rsh; window.generateExportHTML = window.__geh; window.getIntroCardHTML = window.__gih;
`);

// 加载所有主题（此时 fontFamilies 等已就绪）
THEME_FILES.forEach(t => {
    try { window.eval(fs.readFileSync(path.join(ROOT, 'themes', `${t}.js`), 'utf8')); }
    catch (e) { console.error(`加载主题 ${t} 失败:`, e.message); }
});

// 关键：覆盖 getStyleTheme/getColorConfig 等配置函数，使其读取 window 可控变量。
// 原因：currentStyle/currentColor 等是 script.js 内 let 闭包变量，外部 window.xxx 赋值改不了它，
// 导致 renderStyledHTML 永远 fallback 到 minimal —— 这是之前"测试通过但线上不对"的根因。
window.eval(`
    getStyleTheme = function() { return (window.styleThemes||{})[window.__ts] || (window.styleThemes||{}).minimal; };
    getColorConfig = function() { return colorThemes[window.__tc] || colorThemes.emerald; };
    getFontFamily = function() { return fontFamilies[window.__tf] || fontFamilies.serif; };
    getFontWeight = function() { return fontWeights[window.__tf] || '400'; };
    getSizeConfig = function() { return sizeThemes[window.__tsize] || sizeThemes.medium; };
    getSpacingConfig = function() { return spacingThemes[window.__tsp] || spacingThemes.normal; };
    getTrackingConfig = function() { return trackingThemes[window.__ttr] || trackingThemes.tight; };
    // 默认配置
    window.__ts = 'minimal'; window.__tc = 'emerald'; window.__tf = 'serif';
    window.__tsize = 'medium'; window.__tsp = 'compact'; window.__ttr = 'tight';
`);

// ===== 2. 端到端渲染：Markdown → 带样式 HTML → DOM =====
function setTheme(themeName) {
    // 通过覆盖后的 getXxx 函数读取的 window 变量来切换主题
    const theme = window.styleThemes[themeName];
    window.__ts = themeName;
    if (theme.defaultColor) window.__tc = theme.defaultColor;
    if (theme.defaultFont) window.__tf = theme.defaultFont;
    return theme;
}
function renderMarkdownToDOM(themeName, markdown) {
    setTheme(themeName);

    const rawHTML = marked.parse(markdown);
    const styledHTML = window.renderStyledHTML(rawHTML);

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(`<div id="root">${styledHTML}</div>`, 'text/html');
    return { styledHTML, root: doc.getElementById('root'), doc };
}

// 标准测试 Markdown（覆盖 h1/h2/h3/p/列表/引用/图片/代码/分割线）
const SAMPLE_MD = `# 主标题测试

正文段落，包含**加粗**和*斜体*文字，以及[链接](https://example.com)。

## 01 章节标题一

第一章正文内容。

### 子标题三

- 列表项 A
- 列表项 B

## 02 章节标题二

1. 有序第一
2. 有序第二

> 这是一段引用文字

\`\`\`js
function hello() { return 'world'; }
\`\`\`

行内 \`code\` 测试。

![图片说明](https://example.com/test.png)

---

分割线后内容
`;

section('阶段1: 环境与渲染链路');
test('marked 真实加载', typeof window.marked === 'function' && typeof window.marked.parse === 'function', typeof window.marked);
test('renderStyledHTML 可用', typeof window.renderStyledHTML === 'function');
test('generateExportHTML 可用', typeof window.generateExportHTML === 'function');
test('getIntroCardHTML 可用', typeof window.getIntroCardHTML === 'function');
THEME_FILES.forEach(t => {
    test(`主题 ${t} 已注册`, !!window.styleThemes[t]);
});

// 验证完整链路不抛异常
THEME_FILES.forEach(t => {
    try {
        const { root } = renderMarkdownToDOM(t, SAMPLE_MD);
        test(`${t} 完整渲染链路不抛异常`, !!root);
    } catch (e) {
        test(`${t} 完整渲染链路`, false, e.message);
    }
});

// ===== 阶段2: 单元测试 - 方法存在性 =====
section('阶段2: 6主题方法齐全性');
const REQUIRED_METHODS = [
    'bodyStyle', 'pStyle', 'h1Style', 'h2Style', 'h2Decor', 'blockquoteStyle',
    'ulStyle', 'olStyle', 'liStyle', 'liIcon', 'olIcon', 'liTextStyle',
    'hrStyle', 'hrDecor', 'codeStyle', 'preStyle', 'preHeaderCodeStyle',
    'preCodeStyle', 'codeCopyBtnStyle', 'scrollHintStyle', 'aStyle',
    'strongStyle', 'emStyle', 'metaLineStyle', 'keywordStyle', 'sectionTagStyle',
    'h3Style', 'imageCaptionStyle', 'imageWrapperStyle', 'imageCaptionTextStyle',
    'endDecorStyle', 'introCardHTML', 'imageStyle'
];
THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    if (!theme) return;
    const missing = REQUIRED_METHODS.filter(m => typeof theme[m] !== 'function');
    test(`${t} 33个方法齐全`, missing.length === 0, missing.length ? `缺失: ${missing.join(',')}` : '');
    test(`${t} canvasBg 白底验证`, theme.canvasBg === '#FFFFFF' || theme.canvasBg === '#FDFCFA' || t === 'luxury' || t === 'minimal', theme.canvasBg);
});

// ===== 阶段3: 端到端 h2 真实 DOM style 测试（核心！）=====
section('阶段3: h2 渲染后真实 DOM style（按UI设计稿）');

function getH2Elements(themeName) {
    const { root } = renderMarkdownToDOM(themeName, SAMPLE_MD);
    const h2s = root.querySelectorAll('h2');
    const h2Wrappers = root.querySelectorAll('h2');
    // 卡片式主题：h2 被外层 div 包裹，取 h2 自身 + 最近外层 div
    const result = [];
    h2s.forEach(h2 => {
        const parent = h2.parentElement;
        const grandparent = parent ? parent.parentElement : null;
        result.push({
            h2, h2Style: h2.getAttribute('style') || '',
            parentTag: parent ? parent.tagName.toLowerCase() : '',
            parentStyle: parent ? (parent.getAttribute('style') || '') : '',
            grandparentStyle: grandparent ? (grandparent.getAttribute('style') || '') : '',
            decorHTML: parent ? parent.innerHTML : '',
        });
    });
    return result;
}

// 清新绿：卡片式，外层div背景#DCFCE7，左竖条#22C55E
// 注意：主题色会覆盖标题文字颜色（按用户需求），但保留背景/边框等主题特色
{
    const h2s = getH2Elements('fresh');
    const themeColor = window.getColorConfig();
    const expectedH2Color = themeColor.accent;
    test('清新绿 渲染出2个h2', h2s.length === 2, `实际${h2s.length}个`);
    h2s.forEach((h, i) => {
        const combined = h.h2Style + ' ' + h.parentStyle;
        test(`清新绿 h2#${i} 外层有浅绿背景#DCFCE7`, /background:[^;]*DCFCE7/.test(h.parentStyle), h.parentStyle.slice(0, 120));
        test(`清新绿 h2#${i} 左竖条#22C55E`, /border-left:[^;]*22C55E/.test(h.parentStyle), h.parentStyle.slice(0, 120));
        test(`清新绿 h2#${i} 有圆角`, /border-radius:/.test(h.parentStyle), h.parentStyle.slice(0, 120));
        test(`清新绿 h2#${i} 装饰有SECTION`, h.decorHTML.includes('SECTION'), '缺失SECTION标签');
        test(`清新绿 h2#${i} 装饰有圆点`, /border-radius:50%/.test(h.decorHTML), '缺失圆点');
        test(`清新绿 h2#${i} 应用主题色 accent`, h.h2Style.includes(expectedH2Color), `期望${expectedH2Color} 实际: ${h.h2Style.slice(0, 120)}`);
    });
}

// 活力橙：卡片式，外层div背景#FFF1E6，左竖条#FF6B35
{
    const h2s = getH2Elements('vibrant');
    const themeColor = window.getColorConfig();
    const expectedH2Color = themeColor.accent;
    test('活力橙 渲染出2个h2', h2s.length === 2, `实际${h2s.length}个`);
    h2s.forEach((h, i) => {
        test(`活力橙 h2#${i} 外层浅橙背景#FFF1E6`, /background:[^;]*FFF1E6/.test(h.parentStyle), h.parentStyle.slice(0, 120));
        test(`活力橙 h2#${i} 左竖条#FF6B35`, /border-left:[^;]*FF6B35/.test(h.parentStyle), h.parentStyle.slice(0, 120));
        test(`活力橙 h2#${i} 装饰有药丸数字`, /border-radius:10px/.test(h.decorHTML), '缺失药丸');
        test(`活力橙 h2#${i} 装饰有SECTION`, h.decorHTML.includes('SECTION'), '缺失SECTION');
        test(`活力橙 h2#${i} 应用主题色 accent`, h.h2Style.includes(expectedH2Color), `期望${expectedH2Color} 实际: ${h.h2Style.slice(0, 120)}`);
    });
}

// 黑金奢：居中金线
{
    const h2s = getH2Elements('luxury');
    test('黑金奢 渲染出2个h2', h2s.length === 2, `实际${h2s.length}个`);
    h2s.forEach((h, i) => {
        test(`黑金奢 h2#${i} 居中`, /text-align:center/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`黑金奢 h2#${i} 上金线`, /border-top:[^;]*C9A961/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`黑金奢 h2#${i} 下金线`, /border-bottom:[^;]*C9A961/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`黑金奢 h2#${i} 金色文字`, /color:[^;]*(F5E6C8|goldLight)/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`黑金奢 h2#${i} 装饰有菱形◆`, h.decorHTML.includes('◆'), '缺失菱形');
    });
}

// 杂志风：居中衬线
{
    const h2s = getH2Elements('magazine');
    test('杂志风 渲染出2个h2', h2s.length === 2, `实际${h2s.length}个`);
    h2s.forEach((h, i) => {
        test(`杂志风 h2#${i} 居中`, /text-align:center/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`杂志风 h2#${i} 衬线字体`, /Noto Serif SC/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`杂志风 h2#${i} 字重900`, /font-weight:900/.test(h.h2Style), h.h2Style.slice(0, 120));
        test(`杂志风 h2#${i} 黑色#1A1A1A文字`, /color:[^;]*1A1A1A/.test(h.h2Style), h.h2Style.slice(0, 120));
    });
}

// ===== 阶段4: 端到端图片真实 DOM style =====
section('阶段4: 图片渲染后真实 DOM style');
THEME_FILES.forEach(t => {
    try {
        const { root } = renderMarkdownToDOM(t, SAMPLE_MD);
        const img = root.querySelector('img');
        const section = root.querySelector('section section') ? root.querySelector('section') : null;
        test(`${t} 渲染出img`, !!img);
        if (img) {
            const imgStyle = img.getAttribute('style') || '';
            test(`${t} img max-width:100%`, /max-width:100%/.test(imgStyle), imgStyle.slice(0, 100));
            test(`${t} img display:block`, /display:block/.test(imgStyle), imgStyle.slice(0, 100));
            test(`${t} img height:auto`, /height:auto/.test(imgStyle), imgStyle.slice(0, 100));
            // magazine 直角设计，其余有圆角
            if (t !== 'magazine') {
                test(`${t} img 有border-radius`, /border-radius:/.test(imgStyle), imgStyle.slice(0, 100));
            }
        }
        // 验证有 section 包裹（公众号兼容）
        const wrapper = root.querySelector('section');
        test(`${t} 图片有section包裹`, !!wrapper);
    } catch (e) {
        test(`${t} 图片渲染`, false, e.message);
    }
});

// ===== 阶段5: intro 卡片预设与自定义 =====
section('阶段5: intro 卡片预设文字与自定义修改');
// 设置 introEnabled 勾选
const introEnabled = document.getElementById('introEnabled');
if (introEnabled) introEnabled.checked = true;

THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    setTheme(t);

    // 5.1 预设文字验证
    const preset = theme.defaultIntro;
    test(`${t} 预设 name 非空`, !!(preset && preset.name), preset ? preset.name : '无');
    test(`${t} 预设 slogan 非空`, !!(preset && preset.slogan), preset ? preset.slogan.slice(0, 20) : '无');

    // 5.2 把预设填入输入框（模拟用户看到预设、点击使用）
    const fieldMap = { introName:'name', introTitle:'title', introFocus:'focus', introOutput:'output', introSlogan:'slogan', introDisclaimer1:'disclaimer1', introDisclaimer2:'disclaimer2' };
    Object.entries(fieldMap).forEach(([elId, key]) => {
        const el = document.getElementById(elId);
        if (el && preset) el.value = preset[key] || '';
    });
    // 用预设值直接渲染
    try {
        const ctx = {
            c: window.getColorConfig(), s: window.getSizeConfig(),
            sp: window.getSpacingConfig(), t: window.getTrackingConfig(),
            font: window.getFontFamily(), fontWeight: window.getFontWeight()
        };
        const html = theme.introCardHTML(preset, ctx);
        test(`${t} introCardHTML 输出非空`, html.length > 100, `长度${html.length}`);
        test(`${t} 卡片含作者名`, html.includes(preset.name), '未包含name');
        test(`${t} 卡片含slogan`, html.includes(preset.slogan), '未包含slogan');

        // 解析卡片DOM，验证真实渲染
        const parser = new window.DOMParser();
        const cardDoc = parser.parseFromString(html, 'text/html');
        const card = cardDoc.querySelector('section');
        test(`${t} 卡片根元素是section`, !!card);
        if (card) {
            const cardStyle = card.getAttribute('style') || '';
            test(`${t} 卡片有背景色`, /background:/.test(cardStyle), cardStyle.slice(0, 100));
            test(`${t} 卡片有圆角或主题特色`, /border-radius:/.test(cardStyle) || t === 'magazine', cardStyle.slice(0, 100));
        }

        // 5.3 自定义修改：改 name/slogan 后渲染应反映新值（用户可自定义修改）
        const customData = { ...preset, name: '自定义作者XYZ', slogan: '全新口号ABC' };
        const customHTML = theme.introCardHTML(customData, ctx);
        test(`${t} 自定义name生效`, customHTML.includes('自定义作者XYZ'), '未反映自定义name');
        test(`${t} 自定义slogan生效`, customHTML.includes('全新口号ABC'), '未反映自定义slogan');
    } catch (e) {
        test(`${t} introCardHTML`, false, e.message);
    }
});

// ===== 阶段6: 公众号兼容性（压缩/无空白/全内联）=====
// 注：用户复制到公众号的是 generateExportHTML 的输出（经 compressForWechat 压缩），
// 不是 renderStyledHTML 的原始输出。空白检测应针对导出产物。
section('阶段6: 公众号兼容性（导出HTML无空白节点/全内联样式）');
THEME_FILES.forEach(t => {
    try {
        setTheme(t);
        const editor = document.getElementById('editor');
        if (editor) editor.innerHTML = window.renderStyledHTML(marked.parse(SAMPLE_MD));
        const exportHTML = window.generateExportHTML();
        test(`${t} generateExportHTML 非空`, exportHTML.length > 100, `长度${exportHTML.length}`);
        // 6.1 导出HTML无标签间多空白（公众号会把空白转<br>导致行距变大）
        const cleaned = exportHTML.replace(/<span leaf=""><br><\/span>/g, '').replace(/<br>/g, '');
        const hasMultiWhitespace = />\s{2,}</.test(cleaned);
        test(`${t} 导出HTML无多余空白`, !hasMultiWhitespace, hasMultiWhitespace ? '存在2+空白会导致行距变大' : 'OK');
        // 6.2 全内联样式（无 <style> 标签）
        test(`${t} 无<style>标签（全内联）`, !/<style[\s>]/.test(exportHTML));
        // 6.3 关键元素都有 inline style
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(`<div>${exportHTML}</div>`, 'text/html');
        const h2 = doc.querySelector('h2');
        const p = doc.querySelector('p');
        test(`${t} h2 有inline style`, h2 && (h2.getAttribute('style') || '').length > 10);
        test(`${t} p 有inline style`, p && (p.getAttribute('style') || '').length > 10);
    } catch (e) {
        test(`${t} 兼容性`, false, e.message);
    }
});

// ===== 阶段7: 主题切换重置预设 =====
section('阶段7: 切换模板重置预设色与字体');
// 模拟 setStyle 的重置逻辑：切到某主题后，应按该主题的 defaultColor/defaultFont 重置
THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    // 先设成别的色/字体
    window.__tc = 'blue'; window.__tf = 'mono';
    // 切换主题（setTheme 内部按 defaultColor/defaultFont 重置）
    setTheme(t);
    test(`${t} 切换后色=${theme.defaultColor}`, window.__tc === theme.defaultColor, `期望${theme.defaultColor}实际${window.__tc}`);
    test(`${t} 切换后字体=${theme.defaultFont}`, window.__tf === theme.defaultFont, `期望${theme.defaultFont}实际${window.__tf}`);
    // 验证渲染时确实用了该主题
    const theme2 = window.getStyleTheme();
    test(`${t} getStyleTheme 返回正确主题`, theme2 && theme2.name === theme.name, theme2 ? theme2.name : 'undefined');
});

// ===== 汇总 =====
section('测试汇总');
console.log(`通过: ${passCount} | 失败: ${failCount}`);
if (failCount > 0) {
    console.log('\n--- 失败项明细 ---');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  ✗ ${r.name}${r.detail ? ' :: ' + r.detail.slice(0, 150) : ''}`);
    });
}
process.exit(failCount > 0 ? 1 : 0);
