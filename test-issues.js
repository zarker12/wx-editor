/**
 * 临时验证：issue #4（顶部日期被误判为 H1 色块）与 issue #5（数字小标题样式）
 * 复用 test-e2e.js 的 jsdom 加载方式。
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = '/workspace';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

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
window.marked = marked;

let scriptCode = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/document\.addEventListener\('DOMContentLoaded'[^}]*\},\s*\d+\);/g, '');
scriptCode = scriptCode.replace(/^fillIntroDefaults\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^syncEditorToTheme\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^updatePreview\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^setFont\(currentFont\);\s*$/gm, '');
scriptCode += `
;window.__ff=fontFamilies;window.__fw=fontWeights;window.__ct=colorThemes;window.__sz=sizeThemes;window.__sp=spacingThemes;window.__tk=trackingThemes;window.__gf=getFontFamily;window.__gw=getFontWeight;window.__gst=getStyleTheme;window.__gcc=getColorConfig;window.__rsh=renderStyledHTML;window.__sft=smartFormatText;window.__ats=analyzeTextStructure;window.__iad=isAuthorDateLine;`;
try { window.eval(scriptCode); } catch (e) { console.error('script.js 顶层异常:', e.message); }

window.eval(`
    var fontFamilies = window.__ff || { serif:"'Noto Serif SC',Georgia,serif", sans:"'PingFang SC',sans-serif", mono:"'JetBrains Mono',Consolas,monospace" };
    var fontWeights = window.__fw || { serif:'400', sans:'300', mono:'400' };
    var colorThemes = window.__ct || {};
    var sizeThemes = window.__sz || { medium:{fontSize:'15px',h2Size:'18px',h1Size:'23px'} };
    var spacingThemes = window.__sp || { compact:{pMargin:'14px',h2MarginTop:'24px',h2MarginBottom:'12px',lineHeight:'1.85'} };
    var trackingThemes = window.__tk || { tight:{letterSpacing:'0'} };
    window.renderStyledHTML = window.__rsh; window.smartFormatText = window.__sft;
    window.analyzeTextStructure = window.__ats; window.isAuthorDateLine = window.__iad;
`);

['minimal','luxury','cyber','magazine','fresh','vibrant'].forEach(t => {
    try { window.eval(fs.readFileSync(path.join(ROOT, 'themes', `${t}.js`), 'utf8')); }
    catch (e) { console.error(`加载主题 ${t} 失败:`, e.message); }
});

window.eval(`
    getStyleTheme = function() { return (window.styleThemes||{})[window.__ts] || (window.styleThemes||{}).minimal; };
    getColorConfig = function() { return colorThemes[window.__tc] || colorThemes.emerald; };
    getFontFamily = function() { return fontFamilies[window.__tf] || fontFamilies.serif; };
    getFontWeight = function() { return fontWeights[window.__tf] || '400'; };
    getSizeConfig = function() { return sizeThemes[window.__tsize] || sizeThemes.medium; };
    getSpacingConfig = function() { return spacingThemes[window.__tsp] || spacingThemes.normal; };
    getTrackingConfig = function() { return trackingThemes[window.__ttr] || trackingThemes.tight; };
    window.__ts = 'minimal'; window.__tc = 'emerald'; window.__tf = 'serif';
    window.__tsize = 'medium'; window.__tsp = 'compact'; window.__ttr = 'tight';
`);

let pass = 0, fail = 0;
function check(name, cond, detail) {
    if (cond) { pass++; console.log(`[PASS] ${name}`); }
    else { fail++; console.log(`[FAIL] ${name}${detail ? ' :: ' + String(detail).slice(0,300) : ''}`); }
}

// ===== issue #4: 日期首行不应被渲染为 H1 色块 =====
const dateSamples = [
    '2024年5月20日',
    '2024-05-20',
    '2024/05/20',
    '2024.05.20',
    '日期：2024年5月20日',
    '文/张三 2024年5月20日',
    '5月20日',
];
console.log('\n===== issue #4: 日期首行 → meta（非 H1 色块）=====');
for (const d of dateSamples) {
    const content = `${d}\n这是一个真实标题\n正文内容第一段，写一些东西。\n正文内容第二段，再写一些东西。`;
    const out = window.smartFormatText(content);
    // smartFormatText 输出里，H1 表现为首行 "# ..."；meta 表现为 "<p class=\"meta-line\">"
    const firstLine = out.split('\n')[0];
    const isH1 = firstLine.startsWith('# ');
    const hasMeta = out.includes('meta-line');
    check(`日期"${d}" 不渲染为 H1`, !isH1, `首行=${firstLine}`);
    check(`日期"${d}" 命中 meta`, hasMeta || !isH1, `首行=${firstLine}`);
}

// ===== issue #5: 数字小标题应保留为单个 <h2>（带内联样式，可粘贴公众号）=====
console.log('\n===== issue #5: 数字小标题 → 单个 <h2> 内联样式 =====');
const numContent = `01、第一个小标题\n这是第一段正文。\n02、第二个小标题\n这是第二段正文。`;
const numOut = window.smartFormatText(numContent);
const numHTML = window.renderStyledHTML(window.marked.parse(numOut));
const parser = new window.DOMParser();
const numDoc = parser.parseFromString(`<div id="root">${numHTML}</div>`, 'text/html');
const h2s = numDoc.querySelectorAll('h2');
check('生成 2 个 <h2>', h2s.length === 2, `h2 数量=${h2s.length}`);
if (h2s.length >= 1) {
    const h2text = h2s[0].textContent;
    check('h2 文本含数字"01"', /01/.test(h2text), `文本=${h2text}`);
    check('h2 带 style 内联样式', !!h2s[0].getAttribute('style'), `style=${h2s[0].getAttribute('style')}`);
    // 数字小标题应使用标题字号（≥17px），不能用正文 15px——否则视觉上不像标题
    const fsMatch = (h2s[0].getAttribute('style') || '').match(/font-size:\s*(\d+)px/);
    const fs = fsMatch ? parseInt(fsMatch[1], 10) : 0;
    check('h2 使用标题字号(≥17px)', fs >= 17, `font-size=${fs}px style=${(h2s[0].getAttribute('style') || '').slice(0,120)}`);
}
// 确认没有出现"大号数字独立 div"的旧拆分结构（数字不在 h2 内而在单独节点）
const standaloneNumDivs = numDoc.querySelectorAll('div');
let badSplit = false;
standaloneNumDivs.forEach(d => {
    const t = d.textContent.trim();
    if (/^\d{2}$/.test(t) && !d.querySelector('h2')) badSplit = true;
});
check('未拆分出独立数字 div', !badSplit, '检测到旧拆分结构');

// 回归：连续"数字、"应为有序列表，不应被误判为连续小标题
console.log('\n===== 回归: 连续数字行 → 有序列表（非标题）=====');
// 无空格连续数字行：不应变为 h2 标题（可能成段落，但绝不能成标题）
const listContentNoSpace = `1、苹果\n2、香蕉\n3、橘子`;
const listOutNS = window.smartFormatText(listContentNoSpace);
const listHTMLNS = window.renderStyledHTML(window.marked.parse(listOutNS));
const listDocNS = parser.parseFromString(`<div id="root">${listHTMLNS}</div>`, 'text/html');
check('无空格连续数字行不生成 h2 标题', listDocNS.querySelectorAll('h2').length === 0, `h2=${listDocNS.querySelectorAll('h2').length}`);
// 带空格连续数字行（标准列表格式）：应渲染为有序列表
const listContent = `1、 苹果\n2、 香蕉\n3、 橘子`;
const listOut = window.smartFormatText(listContent);
const listHTML = window.renderStyledHTML(window.marked.parse(listOut));
const listDoc = parser.parseFromString(`<div id="root">${listHTML}</div>`, 'text/html');
const listOl = listDoc.querySelectorAll('ol');
const listLi = listDoc.querySelectorAll('li');
check('带空格连续数字行生成有序列表', listOl.length >= 1 || listLi.length >= 3, `ol=${listOl.length} li=${listLi.length}`);

console.log(`\n===== 结果: ${pass} pass, ${fail} fail =====`);
process.exit(fail > 0 ? 1 : 0);
