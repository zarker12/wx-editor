// 完整的主题渲染测试 - 使用 JSDOM 加载真实页面
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const ROOT = '/workspace';
const THEME_FILES = ['minimal', 'luxury', 'cyber', 'magazine', 'fresh', 'vibrant'];

// 测试结果收集
const results = [];
let passCount = 0;
let failCount = 0;

function test(name, condition, detail = '') {
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) passCount++;
    else failCount++;
    results.push({ name, status, detail });
    console.log(`[${status}] ${name}${detail ? ' :: ' + detail : ''}`);
}

// 读取所有主题文件
const themeCodes = {};
THEME_FILES.forEach(t => {
    themeCodes[t] = fs.readFileSync(path.join(ROOT, 'themes', `${t}.js`), 'utf8');
});

// 读取 script.js（需要移除浏览器特有的部分）
let scriptCode = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
// 移除 DOMContentLoaded 包裹和事件监听器，避免 JSDOM 不支持
scriptCode = scriptCode.replace(/document\.addEventListener\('DOMContentLoaded'[^}]*\},\s*\d+\);/g, '');

// 创建 JSDOM 环境
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    resources: 'usable'
});

const { window } = dom;
const { document } = window;

// 注入必要的 polyfills
window.matchMedia = window.matchMedia || function() {
    return { matches: false, addListener() {}, removeListener() {} };
};

window.DOMParser = window.DOMParser || class {
    parseFromString(str, type) {
        const d = new JSDOM(str, { contentType: type === 'text/html' ? 'text/html' : 'text/xml' });
        return d.window.document;
    }
};

window.ClipboardItem = window.ClipboardItem || class {};
window.navigator.clipboard = window.navigator.clipboard || { write: async () => {} };

// 标记 marked 为未加载
window.marked = undefined;

// 注入主题代码（必须在 script.js 之后加载，因为主题依赖 fontFamilies）
try {
    window.eval(scriptCode);
    // script.js 中 fontFamilies 用 const 声明，在 eval 作用域中不暴露到 window
    // 手动暴露给后续主题代码使用
    window.eval('window.__ff = fontFamilies; window.__fw = fontWeights; window.__cf = currentFont || "serif";');
} catch (e) {
    console.error('加载 script.js 失败:', e.message);
    console.error(e.stack);
}

// 注入一个 fontFamilies 别名供主题代码使用
window.eval(`
    var fontFamilies = window.__ff || {
        serif: "'Noto Serif SC',Georgia,serif",
        sans: "'PingFang SC','Microsoft YaHei',sans-serif",
        mono: "'JetBrains Mono',Consolas,monospace"
    };
    var fontWeights = window.__fw || { serif: '400', sans: '300', mono: '400' };
    var currentFont = window.__cf || 'serif';
    var currentStyle = 'minimal';
    var currentColor = 'emerald';
    var currentSize = 'medium';
    var currentSpacing = 'compact';
    var currentTracking = 'tight';
`);

// 注入主题代码（此时 fontFamilies 已定义）
THEME_FILES.forEach(t => {
    try {
        window.eval(themeCodes[t]);
    } catch (e) {
        console.error(`加载主题 ${t} 失败:`, e.message);
    }
});

console.log('\n========================================');
console.log('  主题渲染完整测试');
console.log('========================================\n');

// 检查主题对象是否加载成功
THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    test(`主题 ${t} 已加载`, !!theme, theme ? '' : 'styleThemes.' + t + ' is undefined');
});

console.log('\n--- 阶段1: 主题基础配置测试 ---\n');

// 测试每个主题的必需配置
THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    if (!theme) return;

    test(`${t} has name`, typeof theme.name === 'string');
    test(`${t} has canvasBg`, typeof theme.canvasBg === 'string');
    test(`${t} has textColor`, typeof theme.textColor === 'string');
    test(`${t} has defaultColor`, typeof theme.defaultColor === 'string', theme.defaultColor);
    test(`${t} has defaultFont`, typeof theme.defaultFont === 'string', theme.defaultFont);
    test(`${t} has defaultIntro`, typeof theme.defaultIntro === 'object');
    test(`${t} defaultIntro.name`, theme.defaultIntro && typeof theme.defaultIntro.name === 'string');
    test(`${t} defaultIntro.slogan`, theme.defaultIntro && typeof theme.defaultIntro.slogan === 'string');
});

console.log('\n--- 阶段2: 主题样式方法存在性测试 ---\n');

const REQUIRED_METHODS = [
    'bodyStyle', 'pStyle', 'h1Style', 'h2Style', 'h2Decor',
    'blockquoteStyle', 'ulStyle', 'olStyle', 'liStyle', 'liIcon',
    'olIcon', 'liTextStyle', 'hrStyle', 'hrDecor',
    'codeStyle', 'preStyle', 'preHeaderCodeStyle', 'preCodeStyle',
    'codeCopyBtnStyle', 'scrollHintStyle',
    'aStyle', 'strongStyle', 'emStyle', 'metaLineStyle',
    'keywordStyle', 'sectionTagStyle', 'h3Style',
    'imageCaptionStyle', 'imageWrapperStyle', 'imageCaptionTextStyle',
    'endDecorStyle', 'introCardHTML', 'imageStyle'
];

THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    if (!theme) return;

    REQUIRED_METHODS.forEach(method => {
        const isFn = typeof theme[method] === 'function';
        if (!isFn) {
            test(`${t}.${method}()`, false, `不是函数: ${typeof theme[method]}`);
        }
    });
    test(`${t} 所有 ${REQUIRED_METHODS.length} 个方法齐全`, REQUIRED_METHODS.every(m => typeof theme[m] === 'function'));
});

console.log('\n--- 阶段3: h2 小标题渲染测试（按 UI 设计）---\n');

// 模拟 renderStyledHTML 渲染 h2
function renderH2(themeName) {
    const theme = window.styleThemes[themeName];
    if (!theme) return null;

    const c = { accent: '#10B981', accentLight: '#34D399', accentDark: '#059669', accentBorder: 'rgba(16,185,129,0.2)', accentSoft: 'rgba(16,185,129,0.08)' };
    const s = { fontSize: '15px', h1Size: '22px', h2Size: '19px' };
    const sp = { lineHeight: '1.9', pMargin: '24px', h2MarginTop: '36px', h2MarginBottom: '18px' };
    const t = { letterSpacing: '0.3px' };

    const style = theme.h2Style(c, s, sp, t);
    const decor = theme.h2Decor ? theme.h2Decor(c) : '';
    const hasTitleStyle = typeof theme.h2TitleStyle === 'function';

    return { style, decor, hasTitleStyle, theme };
}

// 极简白：左竖条 + 深色文字
{
    const r = renderH2('minimal');
    if (r) {
        test('极简白 h2 有 border-left', r.style.includes('border-left:4px solid'), r.style);
        test('极简白 h2 颜色为深色 #1F2937', r.style.includes('#1F2937'), r.style);
        test('极简白 h2 字重800', r.style.includes('font-weight:800'), r.style);
        test('极简白 h2 字号18px', r.style.includes('font-size:18px'), r.style);
        test('极简白 h2 没有卡片式结构', !r.hasTitleStyle);
    }
}

// 黑金奢：金色双线 + 居中
{
    const r = renderH2('luxury');
    if (r) {
        test('黑金奢 h2 居中', r.style.includes('text-align:center'), r.style);
        test('黑金奢 h2 上下金线', r.style.includes('border-top:1px solid') && r.style.includes('border-bottom:1px solid'), r.style);
        test('黑金奢 h2 金色文字', r.style.includes('#F5E6C8') || r.style.includes('goldLight'), r.style);
        test('黑金奢 h2Decor 有菱形', r.decor.includes('◆'), r.decor);
    }
}

// 科技感：青色方块编号 + SECTION 标签 + 渐变线
{
    const r = renderH2('cyber');
    if (r) {
        test('科技感 h2 深色文字 #0F172A', r.style.includes('#0F172A'), r.style);
        test('科技感 h2 字重800', r.style.includes('font-weight:800'), r.style);
        test('科技感 h2Decor 有渐变线', r.decor.includes('linear-gradient'), r.decor);
        test('科技感 h2 有 h2NumberStyle', typeof r.theme.h2NumberStyle === 'function');
        // 检查数字方块样式
        if (typeof r.theme.h2NumberStyle === 'function') {
            const ns = r.theme.h2NumberStyle({ accent: '#0891B2' }, { h2Size: '19px' }, {}, {});
            test('科技感 数字方块背景青色 #0891B2', ns.includes('background:#0891B2'), ns);
            test('科技感 数字方块白色文字', ns.includes('color:#FFFFFF'), ns);
            test('科技感 数字方块等宽字体', ns.includes('Mono') || ns.includes('mono'), ns);
        }
    }
}

// 杂志风：大罗马数字 + 衬线 + 上下线
{
    const r = renderH2('magazine');
    if (r) {
        test('杂志风 h2 居中', r.style.includes('text-align:center'), r.style);
        test('杂志风 h2 字号', r.style.includes('font-size:'), r.style);
        test('杂志风 h2 衬线字体', r.style.includes('serif'), r.style);
        test('杂志风 h2 有 h2NumberStyle', typeof r.theme.h2NumberStyle === 'function');
    }
}

// 清新绿：绿色圆点 + 左竖条 + 圆角卡片
{
    const r = renderH2('fresh');
    if (r) {
        test('清新绿 h2 是卡片式', r.hasTitleStyle);
        test('清新绿 h2 浅绿背景 #DCFCE7', r.style.includes('background:#DCFCE7'), r.style);
        test('清新绿 h2 左竖条绿色 #22C55E', r.style.includes('border-left:4px solid #22C55E'), r.style);
        test('清新绿 h2 圆角', r.style.includes('border-radius:'), r.style);
        test('清新绿 h2Decor 有圆点', r.decor.includes('border-radius:50%'), r.decor);
        test('清新绿 h2Decor 有 SECTION 标签', r.decor.includes('SECTION'), r.decor);
    }
}

// 活力橙：橙色药丸数字 + 左竖条 + 圆角卡片
{
    const r = renderH2('vibrant');
    if (r) {
        test('活力橙 h2 是卡片式', r.hasTitleStyle);
        test('活力橙 h2 浅橙背景 #FFF1E6', r.style.includes('background:#FFF1E6'), r.style);
        test('活力橙 h2 左竖条橙色 #FF6B35', r.style.includes('border-left:4px solid #FF6B35'), r.style);
        test('活力橙 h2 圆角', r.style.includes('border-radius:'), r.style);
        test('活力橙 h2Decor 有药丸数字', r.decor.includes('border-radius:10px'), r.decor);
        test('活力橙 h2Decor 有 SECTION 标签', r.decor.includes('SECTION'), r.decor);
    }
}

console.log('\n--- 阶段4: 图片样式渲染测试 ---\n');

// 测试每个主题的图片样式
THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    if (!theme) return;

    const c = { accent: '#10B981' };

    test(`${t} imageStyle() 存在`, typeof theme.imageStyle === 'function');
    if (typeof theme.imageStyle === 'function') {
        const imgStyle = theme.imageStyle(c);
        test(`${t} 图片有 max-width:100%`, imgStyle.includes('max-width:100%'), imgStyle);
        test(`${t} 图片 display:block`, imgStyle.includes('display:block'), imgStyle);
        // magazine 是直角设计，border-radius 可选
        if (t !== 'magazine') {
            test(`${t} 图片有 border-radius`, imgStyle.includes('border-radius:'), imgStyle);
        }
    }

    const wrapperStyle = theme.imageWrapperStyle(c);
    test(`${t} imageWrapper 有 border-radius 或直角设计`, wrapperStyle.includes('border-radius:') || t === 'magazine', wrapperStyle);
    // magazine 是直角设计，box-shadow 可选；其他主题应有 box-shadow
    if (t !== 'magazine') {
        test(`${t} imageWrapper 有 box-shadow`, wrapperStyle.includes('box-shadow:'), wrapperStyle);
    }
});

console.log('\n--- 阶段5: intro 卡片预设文字测试 ---\n');

THEME_FILES.forEach(t => {
    const theme = window.styleThemes[t];
    if (!theme || !theme.defaultIntro) return;

    const intro = theme.defaultIntro;
    test(`${t} intro.name 非空`, typeof intro.name === 'string' && intro.name.length > 0);
    test(`${t} intro.title 非空`, typeof intro.title === 'string' && intro.title.length > 0);
    test(`${t} intro.focus 非空`, typeof intro.focus === 'string' && intro.focus.length > 0);
    test(`${t} intro.output 非空`, typeof intro.output === 'string' && intro.output.length > 0);
    test(`${t} intro.slogan 非空`, typeof intro.slogan === 'string' && intro.slogan.length > 0);
    test(`${t} intro.disclaimer1 非空`, typeof intro.disclaimer1 === 'string' && intro.disclaimer1.length > 0);
    test(`${t} intro.disclaimer2 非空`, typeof intro.disclaimer2 === 'string' && intro.disclaimer2.length > 0);

    // 测试 introCardHTML 渲染
    const ctx = {
        sp: { pMargin: '24px' },
        s: { fontSize: '15px' },
        c: { accent: '#10B981', accentBorder: 'rgba(16,185,129,0.2)', accentDark: '#059669' },
        font: '-apple-system,sans-serif'
    };
    const html = theme.introCardHTML(intro, ctx);
    test(`${t} introCardHTML 输出包含 section`, html.includes('<section'));
    test(`${t} introCardHTML 包含作者名`, html.includes(intro.name));
    test(`${t} introCardHTML 包含 slogan`, html.includes(intro.slogan));
    test(`${t} introCardHTML 包含 span leaf`, html.includes('leaf='));
});

console.log('\n--- 阶段6: 清新绿/活力橙白底验证 ---\n');

{
    const freshTheme = window.styleThemes.fresh;
    test('清新绿背景为白色 #FFFFFF', freshTheme.canvasBg === '#FFFFFF', freshTheme.canvasBg);
}

{
    const vibrantTheme = window.styleThemes.vibrant;
    test('活力橙背景为白色 #FFFFFF', vibrantTheme.canvasBg === '#FFFFFF', vibrantTheme.canvasBg);
}

console.log('\n--- 阶段7: 完整 renderStyledHTML 集成测试 ---\n');

// 实际调用 renderStyledHTML 渲染完整内容
if (typeof window.renderStyledHTML === 'function') {
    const testHTML = `
        <h1>大标题</h1>
        <p>这是一段正文，包含<strong>加粗</strong>和<em>斜体</em>。</p>
        <h2>01 章节标题</h2>
        <p>章节内容。</p>
        <blockquote>引用内容</blockquote>
        <ul><li>列表项1</li><li>列表项2</li></ul>
        <ol><li>有序1</li><li>有序2</li></ol>
        <pre><code>function test() { return true; }</code></pre>
        <p>行内<code>code</code>和<a href="https://example.com">链接</a></p>
        <img src="https://example.com/img.png" alt="图片">
        <hr>
        <p>分割线后内容</p>
    `;

    THEME_FILES.forEach(t => {
        try {
            // 切换主题
            window.currentStyle = t;
            const result = window.renderStyledHTML(testHTML);

            test(`${t} renderStyledHTML 不抛异常`, typeof result === 'string');

            // 检查关键元素是否保留
            test(`${t} 渲染结果包含 h1`, result.includes('<h1'));
            test(`${t} 渲染结果包含 h2`, result.includes('<h2'));
            test(`${t} 渲染结果包含 img`, result.includes('<img'));
            test(`${t} 渲染结果包含 blockquote`, result.includes('<blockquote'));
            test(`${t} 渲染结果包含 ul`, result.includes('<ul'));
            test(`${t} 渲染结果包含 ol`, result.includes('<ol'));
            test(`${t} 渲染结果包含 pre`, result.includes('<pre'));
            test(`${t} 渲染结果包含 hr`, result.includes('<hr'));
            test(`${t} 图片有 section 包裹`, result.includes('<section') && result.includes('overflow:hidden'));

            // 检查没有空白节点问题
            test(`${t} 渲染结果无多余换行`, !result.includes('\n  <'));
        } catch (e) {
            test(`${t} renderStyledHTML`, false, e.message);
        }
    });
} else {
    test('renderStyledHTML 函数可用', false, '函数未在 window 上暴露');
}

console.log('\n--- 阶段8: 导出 HTML 压缩测试 ---\n');

if (typeof window.generateExportHTML === 'function') {
    // 设置编辑器内容
    const editor = window.document.getElementById('editor');
    if (editor) {
        editor.innerHTML = '<h1>测试标题</h1><p>测试正文</p><h2>01 章节</h2><p>内容</p>';
    }

    THEME_FILES.forEach(t => {
        try {
            window.currentStyle = t;
            const html = window.generateExportHTML();
            test(`${t} generateExportHTML 不抛异常`, typeof html === 'string' && html.length > 0);

            // 检查压缩
            test(`${t} 导出HTML无多余空白`, !html.includes('>  <') && !html.includes('>\n <'), html.includes('>  <') ? '发现多余空白' : 'OK');
            test(`${t} 导出HTML有 articleContent`, html.includes('articleContent'));
            test(`${t} 导出HTML有 canvasBg`, html.includes('background:') );
        } catch (e) {
            test(`${t} generateExportHTML`, false, e.message);
        }
    });
} else {
    test('generateExportHTML 函数可用', false, '函数未在 window 上暴露');
}

console.log('\n========================================');
console.log(`  测试完成: ${passCount} 通过, ${failCount} 失败`);
console.log('========================================\n');

if (failCount > 0) {
    console.log('失败项详情:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  ✗ ${r.name}${r.detail ? ' :: ' + r.detail : ''}`);
    });
}

process.exit(failCount > 0 ? 1 : 0);
