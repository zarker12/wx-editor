const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const articleBody = document.getElementById('articleBody');
const copyBtn = document.getElementById('copyBtn');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');
const clearBtn = document.getElementById('clearBtn');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const parseUrlBtn = document.getElementById('parseUrlBtn');
const smartFormatBtn = document.getElementById('smartFormatBtn');

let currentStyle = 'minimal';
let currentColor = 'emerald';
let currentSize = 'medium';
let currentSpacing = 'normal';
let currentFont = 'serif';
let currentTracking = 'tight';

const styleButtons = document.querySelectorAll('.style-btn');
const colorButtons = document.querySelectorAll('.color-btn');
const sizeButtons = document.querySelectorAll('.size-btn');
const spacingButtons = document.querySelectorAll('.spacing-btn');
const fontButtons = document.querySelectorAll('.font-btn');
const trackingButtons = document.querySelectorAll('.tracking-btn');
const toolButtons = document.querySelectorAll('.tool-btn');

let previewDebounceTimer = null;

// ===== 主题色配置 - 全部作用于文章内容 =====
const colorThemes = {
    emerald: {
        accent: '#10B981',
        accentLight: '#34D399',
        accentDark: '#059669',
        accentSoft: 'rgba(16, 185, 129, 0.08)',
        accentBorder: 'rgba(16, 185, 129, 0.2)',
        gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    },
    blue: {
        accent: '#3B82F6',
        accentLight: '#60A5FA',
        accentDark: '#2563EB',
        accentSoft: 'rgba(59, 130, 246, 0.08)',
        accentBorder: 'rgba(59, 130, 246, 0.2)',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    },
    orange: {
        accent: '#F97316',
        accentLight: '#FB923C',
        accentDark: '#EA580C',
        accentSoft: 'rgba(249, 115, 22, 0.08)',
        accentBorder: 'rgba(249, 115, 22, 0.2)',
        gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
    },
    purple: {
        accent: '#8B5CF6',
        accentLight: '#A78BFA',
        accentDark: '#7C3AED',
        accentSoft: 'rgba(139, 92, 246, 0.08)',
        accentBorder: 'rgba(139, 92, 246, 0.2)',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    },
    brown: {
        accent: '#92400E',
        accentLight: '#B45309',
        accentDark: '#78350F',
        accentSoft: 'rgba(120, 53, 15, 0.08)',
        accentBorder: 'rgba(120, 53, 15, 0.2)',
        gradient: 'linear-gradient(135deg, #78350F 0%, #B45309 100%)',
    },
    black: {
        accent: '#374151',
        accentLight: '#6B7280',
        accentDark: '#1F2937',
        accentSoft: 'rgba(31, 41, 55, 0.06)',
        accentBorder: 'rgba(31, 41, 55, 0.15)',
        gradient: 'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
    },
    beige: {
        accent: '#A89880',
        accentLight: '#C4B5A0',
        accentDark: '#8B7D6B',
        accentSoft: 'rgba(212, 196, 168, 0.15)',
        accentBorder: 'rgba(212, 196, 168, 0.3)',
        gradient: 'linear-gradient(135deg, #D4C4A8 0%, #C4B5A0 100%)',
    }
};

function getColorConfig() {
    return colorThemes[currentColor] || colorThemes.emerald;
}

// ===== 字体配置 =====
// 三种经典字体（均为 OFL 协议免版权），微信端回退系统字体确保可识别
const fontFamilies = {
    serif: "'Noto Serif SC', 'Songti SC', 'SimSun', 'STSong', '华文宋体', 'Source Han Serif SC', Georgia, 'Times New Roman', serif",
    sans: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', '微软雅黑', 'SimHei', 'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Consolas', 'Courier New', 'SF Mono', Menlo, Monaco, monospace"
};

const fontWeights = {
    serif: '400',
    sans: '300',
    mono: '400'
};

function getFontFamily() {
    return fontFamilies[currentFont] || fontFamilies.serif;
}

function getFontWeight() {
    return fontWeights[currentFont] || '400';
}

// ===== 字号配置 =====
const sizeThemes = {
    small: { fontSize: '14px', h2Size: '16px', h1Size: '20px' },
    medium: { fontSize: '15px', h2Size: '18px', h1Size: '23px' },
    large: { fontSize: '17px', h2Size: '20px', h1Size: '26px' }
};

function getSizeConfig() {
    return sizeThemes[currentSize] || sizeThemes.medium;
}

// ===== 间距配置 =====
const spacingThemes = {
    compact: { pMargin: '14px', h2MarginTop: '24px', h2MarginBottom: '12px', lineHeight: '1.85' },
    normal: { pMargin: '20px', h2MarginTop: '32px', h2MarginBottom: '16px', lineHeight: '2.0' },
    loose: { pMargin: '28px', h2MarginTop: '44px', h2MarginBottom: '22px', lineHeight: '2.2' }
};

function getSpacingConfig() {
    return spacingThemes[currentSpacing] || spacingThemes.normal;
}

// ===== 字间距配置 =====
const trackingThemes = {
    tight: { letterSpacing: '0' },
    normal: { letterSpacing: '0.3px' },
    loose: { letterSpacing: '1px' }
};

function getTrackingConfig() {
    return trackingThemes[currentTracking] || trackingThemes.tight;
}

function getStyleTheme() {
    const themes = window.styleThemes || {};
    return themes[currentStyle] || themes.minimal;
}

// ===== Markdown转HTML（基础转换，不带样式） =====
function markdownToHTML(text) {
    // 优先使用 marked.js（更准确的 Markdown 解析，支持嵌套语法、表格、围栏代码块等）
    // 加载失败或异常时降级到原正则方案 _markdownToHTMLLegacy
    if (typeof marked !== 'undefined' && marked.parse) {
        try {
            // marked 配置：与项目原有渲染风格对齐
            // - breaks: true 把单换行转 <br>（贴合原文逻辑）
            // - gfm: true 支持 GFM 表格、删除线等
            // 注：marked v5+ 已移除 headerIds/mangle，默认不给 header 加 id
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            let html = marked.parse(text || '');

            // 公众号兼容：marked 输出的 <a> 缺少 target，原代码也没加，保持一致
            // 原代码会过滤特殊符号列表项（•·▪▸...），marked 不支持这些非标准符号
            // 这里做一次兼容扫描：把以这些符号开头的行转成 <ul><li>
            // 注意：去掉 - 和 *（marked 已识别），只保留真正的非标准符号
            html = html.replace(/<p>([•·▪▸▹►▻◆◇★☆✓✔]+)\s+(.+?)<\/p>/g, '<ul><li>$2</li></ul>');
            // 合并相邻的 </ul><ul>（marked 单行列表会被拆开）
            html = html.replace(/<\/ul>\s*<ul>/g, '');

            // 防止 marked 给 <h1> 等加 id（headerIds:false 已处理，但低版本兜底）
            html = html.replace(/(<h[1-6])[^>]*>/g, '$1>');

            // 安全转义：marked 已经做了，这里无需重复
            html = cleanResidualMarkdown(html);
            return html;
        } catch (e) {
            console.warn('marked 解析失败，降级到正则方案:', e);
        }
    }
    return cleanResidualMarkdown(_markdownToHTMLLegacy(text));
}

// 清理未解析的 Markdown 符号（防止预览界面残留 ** ` _ 等）
// 仅清理 HTML 文本节点中的残留，不影响已正确解析的标签
function cleanResidualMarkdown(html) {
    // 清理 **** （四个或更多星号，AI 输出中常见的残留）
    html = html.replace(/\*{4,}/g, '');
    // 清理 *** （三个星号，可能是加粗+斜体未正确闭合）
    html = html.replace(/\*{3}/g, '');
    // 清理成对的 **xxx** （文本中残留的加粗符号）
    html = html.replace(/\*\*([^*<\n]+?)\*\*/g, '<strong>$1</strong>');
    // 清理成对的 *xxx* （残留的斜体符号，但要避免匹配列表项的 *
    html = html.replace(/(?<![a-zA-Z0-9])\*([^*<\n]+?)\*(?![a-zA-Z0-9])/g, '<em>$1</em>');
    // 清理残留的单个 ** 或 *（未成对闭合的，直接删除符号保留内容）
    html = html.replace(/(?<!\*)\*\*(?!\*)/g, '');
    html = html.replace(/(?<![*\w])\*(?!\*)/g, '');
    // 清理残留的行内代码反引号 `xxx`
    html = html.replace(/`([^`<\n]+?)`/g, '<code>$1</code>');
    html = html.replace(/(?<!`)`(?!`)/g, '');
    // 清理残留的下划线强调
    html = html.replace(/(?<![a-zA-Z0-9])__([^_<\n]+?)__(?![a-zA-Z0-9])/g, '<strong>$1</strong>');
    html = html.replace(/(?<![a-zA-Z0-9])_([^_<\n]+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
    // 清理残留的 Markdown 标题符号（# 后无空格的情况）
    html = html.replace(/(?<![#\w])#{1,6}(?!\s)(?![#<])/g, '');
    return html;
}

// 旧版正则方案（作为 marked 不可用时的兜底）
function _markdownToHTMLLegacy(text) {
    let html = text;

    const codeBlocks = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        const langMatch = code.match(/^(\w+)\n/);
        let codeContent = code;
        if (langMatch) codeContent = code.substring(langMatch[1].length + 1);
        const escaped = codeContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const blockId = `\x01CB${codeBlocks.length}\x01`;
        codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
        return blockId;
    });

    // 修复：允许行首 0-3 个空格/Tab 缩进（兼容 CommonMark 规范），
    // # 后需 1 个或多个空白字符（空格或 Tab），避免 Tab/多空格导致井号泄漏；
    // 使用 (.+?)\s*$ 非贪婪匹配并去除尾部空白，保证标题文本干净
    html = html.replace(/^[ \t]{0,3}######[ \t]+(.+?)\s*$/gim, '<h6>$1</h6>');
    html = html.replace(/^[ \t]{0,3}#####[ \t]+(.+?)\s*$/gim, '<h5>$1</h5>');
    html = html.replace(/^[ \t]{0,3}####[ \t]+(.+?)\s*$/gim, '<h4>$1</h4>');
    html = html.replace(/^[ \t]{0,3}###[ \t]+(.+?)\s*$/gim, '<h3>$1</h3>');
    html = html.replace(/^[ \t]{0,3}##[ \t]+(.+?)\s*$/gim, '<h2>$1</h2>');
    html = html.replace(/^[ \t]{0,3}#[ \t]+(.+?)\s*$/gim, '<h1>$1</h1>');

    // ⚠ 必须在链接替换之前处理图片语法，否则 [alt](src) 会被链接正则吃掉
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '<hr>');

    const lines = html.split('\n');
    const processedLines = [];
    let inUl = false;
    let inOl = false;
    let inBlockquote = false;
    let blockquoteBuffer = [];
    let olCounter = 0;

    function closeLists() {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        if (inOl) { processedLines.push('</ol>'); inOl = false; olCounter = 0; }
    }

    function closeBlockquote() {
        if (inBlockquote && blockquoteBuffer.length > 0) {
            processedLines.push(`<blockquote>${blockquoteBuffer.join('<br>')}</blockquote>`);
            blockquoteBuffer = [];
            inBlockquote = false;
        }
    }

    lines.forEach((line) => {
        const trimmed = line.trim();

        const blockquoteMatch = trimmed.match(/^>\s?(.*)$/);
        if (blockquoteMatch) {
            closeLists();
            inBlockquote = true;
            blockquoteBuffer.push(blockquoteMatch[1]);
            return;
        } else {
            closeBlockquote();
        }

        const ulMatch = trimmed.match(/^[-*•·▪▸▹►▻◆◇★☆✓✔]+\s+(.+)$/);
        const olMatch = trimmed.match(/^(\d+)[.、）)]\s*(.+)$/);

        if (ulMatch) {
            if (inOl) closeLists();
            if (!inUl) { processedLines.push('<ul>'); inUl = true; }
            processedLines.push(`<li>${ulMatch[1]}</li>`);
        } else if (olMatch) {
            if (inUl) closeLists();
            if (!inOl) { processedLines.push('<ol>'); inOl = true; olCounter = 0; }
            olCounter++;
            processedLines.push(`<li>${olMatch[2]}</li>`);
        } else {
            closeLists();
            if (trimmed && !trimmed.match(/^<\/?(ul|ol|li|blockquote|pre|h[1-6]|div|p|hr|a|strong|em|code|span|img|br)/i)
                && !trimmed.includes('\x01')) {
                processedLines.push(`<p>${trimmed}</p>`);
            } else if (trimmed) {
                processedLines.push(trimmed);
            }
        }
    });

    closeLists();
    closeBlockquote();

    let result = processedLines.join('\n');
    codeBlocks.forEach((block, idx) => {
        result = result.replace(`\x01CB${idx}\x01`, block);
    });

    return result;
}

// ===== 渲染带主题样式的HTML =====
function renderStyledHTML(editorHTML) {
    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const fontWeight = getFontWeight();
    const theme = getStyleTheme();

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__root__">${editorHTML}</div>`, 'text/html');
    const root = doc.getElementById('__root__');

    const baseTextStyle = `font-family:${font};font-weight:${fontWeight};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${theme.textColor};${t.letterSpacing ? `letter-spacing:${t.letterSpacing};` : ''}`;

    const appendFont = (style, useMono = false) => {
        const fontFamily = useMono ? fontFamilies.mono : font;
        return style + `font-family:${fontFamily};`;
    };

    const addBaseTextStyles = (style, useMono = false) => {
        const fontFamily = useMono ? fontFamilies.mono : font;
        let result = style;
        if (!result.includes('font-family:')) {
            result += `font-family:${fontFamily};`;
        }
        if (!result.includes('font-size:')) {
            result += `font-size:${s.fontSize};`;
        }
        if (!result.includes('line-height:')) {
            result += `line-height:${sp.lineHeight};`;
        }
        if (!result.includes('letter-spacing:') && t.letterSpacing) {
            result += `letter-spacing:${t.letterSpacing};`;
        }
        return result;
    };

    const applyThemeColor = (style, element) => {
        if (theme.name === '黑金奢' || theme.name === '杂志风') {
            return style;
        }

        let result = style;
        const hasGradientText = /-webkit-background-clip\s*:\s*text/i.test(result);
        const hasTransparentFill = /-webkit-text-fill-color\s*:\s*transparent/i.test(result);

        if (hasGradientText && hasTransparentFill) {
            return result;
        }

        result = result.replace(/color:\s*[^;"]*;?/gi, '');

        let themeColor = c.accentDark;
        switch (element) {
            case 'h1': themeColor = c.accentDark; break;
            case 'h2': themeColor = c.accent; break;
            case 'h3': themeColor = c.accentDark; break;
            case 'strong': themeColor = c.accentDark; break;
            case 'em': themeColor = c.accent; break;
            case 'a': themeColor = c.accent; break;
            case 'blockquote': themeColor = c.accentDark; break;
            default: themeColor = c.accentDark;
        }

        const colorIdx = result.indexOf('font-weight:');
        if (colorIdx >= 0) {
            result = result.slice(0, colorIdx) + `color:${themeColor};` + result.slice(colorIdx);
        } else {
            result = `color:${themeColor};` + result;
        }

        return result;
    };

    function walk(node) {
        if (!node) return '';

        if (node.nodeType === 3) {
            return node.textContent;
        }

        if (node.nodeType !== 1) return '';

        const tag = node.tagName.toLowerCase();
        const children = Array.from(node.childNodes).map(walk).join('');

        switch (tag) {
            case 'h1': {
                let style = theme.h1Style(c, s, sp, t);
                style = applyThemeColor(style, 'h1');
                style = addBaseTextStyles(style);
                return `<h1 style="${style}">${children}</h1>`;
            }
            case 'h2': {
                let style = theme.h2Style(c, s, sp, t);
                style = applyThemeColor(style, 'h2');
                style = addBaseTextStyles(style);
                const h2Decor = theme.h2Decor ? theme.h2Decor(c) : '';
                const hasH2TitleStyle = typeof theme.h2TitleStyle === 'function';

                if (hasH2TitleStyle) {
                    let titleStyle = theme.h2TitleStyle(c, s, sp, t);
                    titleStyle = applyThemeColor(titleStyle, 'h2');
                    titleStyle = addBaseTextStyles(titleStyle);
                    return `<div style="margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;"><div style="${style}">${h2Decor}<h2 style="${titleStyle}">${children}</h2></div></div>`;
                }

                const h2Text = node.textContent.trim();
                const numMatch = h2Text.match(/^(\d+)[\s、.）)]+(.+)$/);
                if (numMatch) {
                    const num = numMatch[1];
                    const title = numMatch[2].trim();
                    const numStyle = theme.h2NumberStyle
                        ? theme.h2NumberStyle(c, s, sp, t)
                        : `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 8px 0;`;
                    const titleStyle = style.replace(/text-align:[^;]+;?/g, '') + 'text-align:center;display:block;margin:0;';
                    return `<div style="margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;text-align:center;"><div style="${numStyle}">${num}</div><h2 style="${titleStyle}">${title}</h2>${h2Decor}</div>`;
                }

                if (h2Decor) {
                    return `<div style="margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;"><h2 style="${style}">${children}</h2>${h2Decor}</div>`;
                }
                return `<h2 style="${style}">${children}</h2>`;
            }
            case 'h3': {
                let style;
                if (theme.h3Style) {
                    style = theme.h3Style(c, s, sp, t);
                } else {
                    style = theme.h2Style(c, s, sp, t);
                    style = style.replace(/font-size:[^;]+;/, `font-size:${parseInt(s.h2Size) - 2}px;`);
                    style = style.replace(/font-weight:[^;]+;/, 'font-weight:500;');
                }
                style = applyThemeColor(style, 'h3');
                style = addBaseTextStyles(style);
                return `<h3 style="${style}">${children}</h3>`;
            }
            case 'p': {
                const isMeta = node.classList && node.classList.contains('meta-line');
                if (isMeta && theme.metaLineStyle) {
                    let style = theme.metaLineStyle(c);
                    style = addBaseTextStyles(style);
                    return `<p style="${style}">${children}</p>`;
                }
                let style = theme.pStyle(c, sp);
                style = addBaseTextStyles(style);
                return `<p style="${style}">${children}</p>`;
            }
            case 'blockquote': {
                let style = theme.blockquoteStyle(c);
                style = applyThemeColor(style, 'blockquote');
                style = addBaseTextStyles(style);
                return `<blockquote style="${style}">${children}</blockquote>`;
            }
            case 'ul': {
                const style = theme.ulStyle(c);
                let liStyle = theme.liStyle(c);
                liStyle = addBaseTextStyles(liStyle);
                const liIcon = theme.liIcon ? theme.liIcon(c) : '';
                let lis = '';
                let idx = 0;
                Array.from(node.children).forEach(li => {
                    if (li.tagName.toLowerCase() === 'li') {
                        idx++;
                        const liChildren = Array.from(li.childNodes).map(walk).join('');
                        lis += `<li style="${liStyle}">${liIcon}${liChildren}</li>`;
                    }
                });
                return `<ul style="${style}">${lis}</ul>`;
            }
            case 'ol': {
                const style = theme.olStyle(c);
                let liStyle = theme.liStyle(c);
                liStyle = addBaseTextStyles(liStyle);
                let lis = '';
                let idx = 0;
                Array.from(node.children).forEach(li => {
                    if (li.tagName.toLowerCase() === 'li') {
                        idx++;
                        const olIcon = theme.olIcon ? theme.olIcon(c, idx) : '';
                        const liChildren = Array.from(li.childNodes).map(walk).join('');
                        lis += `<li style="${liStyle}">${olIcon}${liChildren}</li>`;
                    }
                });
                return `<ol style="${style}">${lis}</ol>`;
            }
            case 'hr': {
                const style = theme.hrStyle(c);
                const hrDecor = theme.hrDecor ? `<span style="display:block;text-align:center;color:${c.accent}80;font-size:18px;letter-spacing:12px;margin:-28px 0 48px 0;font-family:${font};">${theme.hrDecor(c)}</span>` : '';
                return `<hr style="${style}">${hrDecor}`;
            }
            case 'a': {
                let style = theme.aStyle(c);
                style = applyThemeColor(style, 'a');
                style = addBaseTextStyles(style);
                const href = node.getAttribute('href') || '#';
                return `<a href="${href}" style="${style}">${children}</a>`;
            }
            case 'strong':
            case 'b': {
                let style = theme.strongStyle(c);
                style = applyThemeColor(style, 'strong');
                style = addBaseTextStyles(style);
                return `<strong style="${style}">${children}</strong>`;
            }
            case 'em':
            case 'i': {
                let style = theme.emStyle(c);
                style = applyThemeColor(style, 'em');
                style = addBaseTextStyles(style);
                return `<em style="${style}">${children}</em>`;
            }
            case 'code': {
                const parentTag = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
                if (parentTag === 'pre') {
                    return children;
                }
                let style = theme.codeStyle(c);
                style = addBaseTextStyles(style, true);
                return `<code style="${style}">${children}</code>`;
            }
            case 'pre': {
                let preStyle = theme.preStyle(c);
                preStyle = addBaseTextStyles(preStyle, true);
                let codeStyle = theme.preCodeStyle(c);
                codeStyle = addBaseTextStyles(codeStyle, true);
                let copyBtnStyle = theme.codeCopyBtnStyle(c);
                copyBtnStyle = addBaseTextStyles(copyBtnStyle, true);
                let hintStyle = theme.scrollHintStyle(c);
                hintStyle = addBaseTextStyles(hintStyle, true);
                let codeText = '';
                const codeEl = node.querySelector('code');
                if (codeEl) {
                    codeText = codeEl.textContent;
                } else {
                    codeText = node.textContent;
                }
                const escaped = codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const copyBtn = `<button class="code-copy-btn" style="${copyBtnStyle}" onclick="var co=this.parentElement.querySelector('code');var r=document.createRange();r.selectNodeContents(co);var sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);document.execCommand('copy');sel.removeAllRanges();this.textContent='已复制';var bt=this;setTimeout(function(){bt.textContent='复制'},1500)">复制</button>`;
                const scrollHint = `<p class="code-scroll-hint" style="${hintStyle}">← 左右滑动查看更多 →</p>`;
                return `<pre style="${preStyle}">${copyBtn}<code style="${codeStyle}">${escaped}</code></pre>${scrollHint}`;
            }
            case 'img': {
                const src = node.getAttribute('src') || '';
                const alt = node.getAttribute('alt') || '';
                const imgStyle = theme.imageStyle
                    ? theme.imageStyle(c)
                    : 'max-width:100%;height:auto;border-radius:8px;display:block;';
                const wrapperStyle = theme.imageWrapperStyle
                    ? theme.imageWrapperStyle(c)
                    : 'margin:16px 0;';
                const innerWrapperStyle = 'margin:0;overflow:hidden;';
                return `<section style="${wrapperStyle}margin-bottom:8px;"><section style="${innerWrapperStyle}"><img src="${src}" alt="${alt}" style="${imgStyle}"></section></section>`;
            }
            case 'br':
                return '<br>';
            case 'div': {
                if (node.getAttribute('data-end-marker') === 'true') {
                    const endStyle = `text-align:center;letter-spacing:10px;color:${c.accentDark};font-size:14px;padding:32px 0 16px 0;font-family:${font};font-weight:500;margin-top:16px;display:block;`;
                    const decorLine = theme.hrDecor
                        ? `<p style="text-align:center;color:${c.accent}60;font-size:18px;letter-spacing:8px;margin:0 0 8px 0;font-family:${font};display:block;">${theme.hrDecor(c)}</p>`
                        : '';
                    return `${decorLine}<p style="${endStyle}">- E N D -</p>`;
                }
                return children;
            }
            case 'span':
                return children;
            default:
                return children;
        }
    }

    let result = '';
    Array.from(root.childNodes).forEach(node => {
        result += walk(node);
    });

    // END 结束标识：由模板自动追加，用主题色+主题字体渲染，居中显示
    // 无论 Markdown 如何转换、是否重新排版，都会稳定显示
    const endDecorLine = theme.hrDecor
        ? `<p style="text-align:center;color:${c.accent}80;font-size:18px;letter-spacing:12px;margin:40px 0 8px 0;font-family:${font};display:block;">${theme.hrDecor(c)}</p>`
        : `<p style="text-align:center;color:${c.accent}40;font-size:20px;letter-spacing:8px;margin:40px 0 8px 0;display:block;">· · ·</p>`;
    const endStyle = `text-align:center;letter-spacing:10px;color:${c.accentDark};font-size:14px;padding:0 0 24px 0;font-family:${font};font-weight:500;display:block;`;
    result += endDecorLine + `<p style="${endStyle}">- E N D -</p>`;

    return result;
}

// ===== 字数统计 =====
function updateWordCount() {
    const text = editor.innerText || '';
    const trimmed = text.trim();

    const charCount = text.length;

    let wordCount = 0;
    if (trimmed) {
        const chineseChars = (trimmed.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = trimmed.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
        wordCount = chineseChars + englishWords;
    }

    let paraCount = 0;
    const children = editor.children;
    for (let i = 0; i < children.length; i++) {
        const tag = children[i].tagName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'hr', 'div'].includes(tag)) {
            if (children[i].innerText && children[i].innerText.trim()) {
                paraCount++;
            } else if (tag === 'hr') {
                paraCount++;
            }
        }
    }
    if (paraCount === 0 && trimmed) {
        paraCount = 1;
    }

    const wcEl = document.getElementById('wordCount');
    const ccEl = document.getElementById('charCount');
    const lcEl = document.getElementById('lineCount');
    if (wcEl) wcEl.textContent = wordCount;
    if (ccEl) ccEl.textContent = charCount;
    if (lcEl) lcEl.textContent = paraCount;
}

// ===== 规范化编辑器HTML，确保所见即所得同步 =====
function normalizeEditorHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__norm__">${html}</div>`, 'text/html');
    const root = doc.getElementById('__norm__');

    const result = [];
    let currentPara = [];

    function flushPara() {
        if (currentPara.length > 0) {
            result.push(`<p>${currentPara.join('')}</p>`);
            currentPara = [];
        }
    }

    function processNode(node) {
        if (node.nodeType === 3) {
            const text = node.textContent;
            if (text.trim() || text.includes('\n')) {
                currentPara.push(text.replace(/\n/g, ''));
            }
            return;
        }

        if (node.nodeType !== 1) return;

        const tag = node.tagName.toLowerCase();

        const blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'hr', 'figure'];

        if (blockTags.includes(tag)) {
            flushPara();
            result.push(node.outerHTML);
            return;
        }

        if (tag === 'br') {
            flushPara();
            return;
        }

        if (tag === 'div') {
            flushPara();
            // END 标识 div 必须保留原样，不能转 <p>（否则丢失 data-end-marker 属性）
            if (node.getAttribute('data-end-marker') === 'true') {
                result.push(node.outerHTML);
                return;
            }
            const divHTML = node.innerHTML.trim();
            if (divHTML && divHTML !== '<br>') {
                result.push(`<p>${divHTML}</p>`);
            }
            return;
        }

        if (tag === 'span' || tag === 'strong' || tag === 'b' || tag === 'em' || tag === 'i' ||
            tag === 'a' || tag === 'code' || tag === 'img') {
            currentPara.push(node.outerHTML);
            return;
        }

        for (const child of node.childNodes) {
            processNode(child);
        }
    }

    for (const child of root.childNodes) {
        processNode(child);
    }
    flushPara();

    if (result.length === 0 && html.trim()) {
        return `<p>${html}</p>`;
    }

    return result.join('\n');
}

// ===== HTML 转义（防止名片字段含尖角号破坏结构）=====
function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== 底部名片渲染 =====
function getIntroCardHTML() {
    const enabledEl = document.getElementById('introEnabled');
    if (enabledEl && !enabledEl.checked) return '';

    // 收集名片字段（已转义，防止破坏 HTML 结构）
    const data = {
        name: escapeHTML(document.getElementById('introName')?.value || ''),
        title: escapeHTML(document.getElementById('introTitle')?.value || ''),
        focus: escapeHTML(document.getElementById('introFocus')?.value || ''),
        output: escapeHTML(document.getElementById('introOutput')?.value || ''),
        slogan: escapeHTML(document.getElementById('introSlogan')?.value || ''),
        disclaimer1: escapeHTML(document.getElementById('introDisclaimer1')?.value || ''),
        disclaimer2: escapeHTML(document.getElementById('introDisclaimer2')?.value || ''),
    };

    // 主题色 / 字号 / 间距配置（兼容老主题用）
    const ctx = {
        c: getColorConfig(),
        s: getSizeConfig(),
        sp: getSpacingConfig(),
        t: getTrackingConfig(),
        font: getFontFamily(),
        fontWeight: getFontWeight(),
    };

    // 优先调用主题自定义的 introCardHTML，让名片跟随主题风格
    const theme = getStyleTheme();
    if (typeof theme.introCardHTML === 'function') {
        return theme.introCardHTML(data, ctx);
    }

    // 兜底：默认名片样式（浅色卡片 + 主题色强调）
    return defaultIntroCardHTML(data, ctx);
}

// 默认名片渲染（兜底，老主题未实现 introCardHTML 时使用）
function defaultIntroCardHTML(data, ctx) {
    const { c, s, sp, font } = ctx;
    const cardStyle = `margin-top:${sp.pMargin};padding:20px 18px;background:${c.accentSoft};border-radius:12px;border:1px solid ${c.accentSoft};font-family:${font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:#3D3D3D;`;
    const rowStyle = `display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:${s.fontSize};`;
    const iconStyle = `flex-shrink:0;width:20px;text-align:center;font-size:15px;`;
    const textStyle = `flex:1;color:#3D3D3D;`;
    const sepStyle = `color:${c.accent};flex-shrink:0;`;
    const labelStyle = `color:#8A8A8A;flex-shrink:0;font-size:13px;`;
    const sloganStyle = `margin:10px 0 10px 26px;font-weight:500;color:#6B7280;font-size:${s.fontSize};`;
    const dividerStyle = `height:1px;background:rgba(0,0,0,0.08);margin:10px 0;`;
    const disclaimerStyle = `display:flex;align-items:flex-start;gap:6px;margin-bottom:4px;font-size:12px;color:#8A8A8A;line-height:1.6;`;

    let html = `<div style="${cardStyle}">`;
    if (data.name || data.title) {
        html += `<div style="${rowStyle}"><span style="${iconStyle}">🧔</span><span style="${textStyle}"><strong>${data.name}</strong> <span style="${sepStyle}">｜</span> ${data.title}</span></div>`;
    }
    if (data.focus) {
        html += `<div style="${rowStyle}"><span style="${iconStyle}">🔭</span><span style="${labelStyle}">关注：</span><span style="${textStyle}">${data.focus}</span></div>`;
    }
    if (data.output) {
        html += `<div style="${rowStyle}"><span style="${iconStyle}">📦</span><span style="${labelStyle}">产出：</span><span style="${textStyle}">${data.output}</span></div>`;
    }
    if (data.slogan) {
        html += `<div style="${sloganStyle}">${data.slogan}</div>`;
    }
    html += `<div style="${dividerStyle}"></div>`;
    if (data.disclaimer1) {
        html += `<div style="${disclaimerStyle}"><span style="${iconStyle};font-size:13px;">⚠️</span><span>${data.disclaimer1}</span></div>`;
    }
    if (data.disclaimer2) {
        html += `<div style="${disclaimerStyle}"><span style="${iconStyle};font-size:13px;">📋</span><span>${data.disclaimer2}</span></div>`;
    }
    html += '</div>';
    return html;
}

// ===== 更新预览 =====
function updatePreview() {
    // 性能优化：输入时只调用 syncEditorContainerStyle（轻量），
    // 主题/字号变化时才走完整 syncEditorToTheme（重量级，会重建 <style> 注入）
    syncEditorContainerStyle();

    const content = normalizeEditorHTML(editor.innerHTML);
    const introHTML = getIntroCardHTML();
    const parsed = renderStyledHTML(content);
    articleBody.innerHTML = parsed + introHTML;

    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const theme = getStyleTheme();

    const bodyStyle = theme.bodyStyle(c, s, sp, t, font);
    articleBody.style.cssText = bodyStyle;

    updateWordCount();
}

// 轻量容器样式同步：只更新字体/字号/颜色/padding 等 editor 自身样式
// 不重建 <style id="editor-sync-styles">（那个由 syncEditorToTheme 在主题切换时做）
function syncEditorContainerStyle() {
    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const fontWeight = getFontWeight();
    const theme = getStyleTheme();

    editor.style.fontFamily = font;
    editor.style.fontWeight = fontWeight;
    editor.style.fontSize = s.fontSize;
    editor.style.lineHeight = sp.lineHeight;
    editor.style.color = theme.textColor;
    editor.style.backgroundColor = theme.canvasBg;
    if (t.letterSpacing) editor.style.letterSpacing = t.letterSpacing;
    else editor.style.letterSpacing = 'normal';

    const bodyStyle = theme.bodyStyle(c, s, sp, t, font);
    const padMatch = bodyStyle.match(/padding:\s*([^;]+);/);
    if (padMatch) editor.style.padding = padMatch[1].trim();
    const alignMatch = bodyStyle.match(/text-align:\s*([^;]+);/);
    editor.style.textAlign = alignMatch ? alignMatch[1].trim() : 'left';

    editor.style.maxWidth = '480px';
    editor.style.margin = '0 auto';
    editor.style.width = '100%';

    editor.style.setProperty('--editor-accent', c.accent);
    editor.style.setProperty('--editor-accent-light', c.accentLight);
    editor.style.setProperty('--editor-accent-dark', c.accentDark);
    editor.style.setProperty('--editor-accent-soft', c.accentSoft);
    editor.style.setProperty('--editor-accent-border', c.accentSoft2);
    editor.style.setProperty('--editor-meta', theme.metaColor);
}

function debouncedUpdatePreview() {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    // 自适应防抖：内容越长，防抖时间越长，避免长文档输入卡顿
    // 短文档（≤3000 字）100ms；中文档（3000-10000 字）200ms；长文档（>10000 字）300ms
    const len = (editor.innerText || '').length;
    const delay = len > 10000 ? 300 : (len > 3000 ? 200 : 100);
    previewDebounceTimer = setTimeout(() => {
        // 用 requestAnimationFrame 让渲染不阻塞输入
        requestAnimationFrame(updatePreview);
    }, delay);
}

// ===== 导出 =====
function compressForWechat(html) {
    let result = html;
    // 1. 移除所有换行符、制表符、回车符（微信会把它们解析为<br>导致行距翻倍）
    result = result.replace(/[\n\r\t]+/g, '');
    // 2. 移除所有 Unicode 空白符（包括 \u00A0 不间断空格、零宽空格等）
    result = result.replace(/[\u00A0\u2000-\u200B\uFEFF]+/g, '');
    // 3. 标签间空白替换为紧连（避免微信把标签间空白解析为<br>或额外间距）
    result = result.replace(/>\s+</g, '><');
    // 4. 标签属性间多余空格压缩（保留文本内空格）
    result = result.replace(/\s{2,}/g, ' ');
    // 5. 移除 span leaf 标记的空 span（这些在公众号中会产生额外间距）
    result = result.replace(/<span[^>]*leaf[^>]*>\s*<\/span>/gi, '');
    result = result.replace(/<span[^>]*leaf[^>]*>\s*<br\s*\/?>\s*<\/span>/gi, '');

    // 6.【关键修复】彻底移除独立 <br> —— 微信粘贴时会为每个 <p> 自动加段距，
    //    任何残留 <br> 都会被解析为额外空行，导致段距翻倍。
    //    用户需要的换行应通过 <p> 段落分隔实现，而非 <br>。
    //    仅保留 <pre><code> 内的 <br>（代码块需要原样换行）。
    result = result.replace(/(<pre[^>]*>[\s\S]*?<\/pre>)|<br\s*\/?>/gi, (m, pre) => pre || '');

    // 7. 移除 <br> 后清理空段落（避免残留空 <p></p> 产生额外间距）
    result = result.replace(/<p[^>]*>\s*<\/p>/gi, '');
    result = result.replace(/<br\s*\/?>\s*<\/(div|p|section)>/gi, '</$1>');

    // 8.【核心加固】给间距/行高/padding 加 !important，抵抗公众号编辑器默认样式覆盖。
    //    公众号粘贴时会注入自己的 p/section 默认 margin(1em) 和 line-height(1.75)，
    //    不加 important 预览合适的间距在公众号里会被叠加成 2 倍。
    //    正则覆盖带分号和结尾引号两种形式，避免漏匹配。
    result = result.replace(/(margin(?:-top|-bottom|-left|-right)?):\s*([^;"]+)(;|(?="))/gi, '$1:$2 !important$3');
    result = result.replace(/(line-height):\s*([^;"]+)(;|(?="))/gi, '$1:$2 !important$3');
    result = result.replace(/(padding(?:-top|-bottom|-left|-right)?):\s*([^;"]+)(;|(?="))/gi, '$1:$2 !important$3');

    // 9.【重复 !important 防护】避免重复添加
    result = result.replace(/!important\s+!important/gi, '!important');
    return result.trim();
}

function generateExportHTML() {
    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const fontWeight = getFontWeight();
    const theme = getStyleTheme();

    const bodyStyle = theme.bodyStyle(c, s, sp, t, font);
    const normalizedContent = normalizeEditorHTML(editor.innerHTML);
    const styledContent = renderStyledHTML(normalizedContent);
    const introHTML = getIntroCardHTML();

    const fullHTML = `<section id="articleContent" style="max-width:677px;margin:0 auto;background:${theme.canvasBg};word-break:break-word;"><section style="${bodyStyle}">${styledContent}${introHTML}</section></section>`;

    return compressForWechat(fullHTML);
}

function generateRawHTML() {
    return generateExportHTML();
}

async function copyToClipboard() {
    const html = generateExportHTML();
    const textContent = articleBody.innerText || editor.innerText;

    try {
        const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const item = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
        });
        await navigator.clipboard.write([item]);
        showToast('排版已复制，可直接粘贴到公众号！');
    } catch (err) {
        fallbackCopyWithHTML(html, '排版已复制，请粘贴到公众号编辑器');
    }
}

async function copyRawHTML() {
    const html = generateExportHTML();
    try {
        await navigator.clipboard.writeText(html);
        showToast('HTML源码已复制！');
    } catch (err) {
        fallbackCopy(html, 'HTML源码已复制');
    }
}

function fallbackCopyWithHTML(html, msg) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
    } catch (e) {}

    selection.removeAllRanges();
    document.body.removeChild(container);
    showToast(msg);
}

function fallbackCopy(text, msg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(msg);
}

function showToast(message) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ===== 设置函数 =====
// 同步编辑器与预览的主题样式（字体/字号/间距/颜色/padding 等），实现 1:1 视觉一致
function syncEditorToTheme() {
    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const fontWeight = getFontWeight();
    const theme = getStyleTheme();

    // 基础文字样式（与 articleBody 的 bodyStyle 保持一致）
    editor.style.fontFamily = font;
    editor.style.fontWeight = fontWeight;
    editor.style.fontSize = s.fontSize;
    editor.style.lineHeight = sp.lineHeight;
    editor.style.color = theme.textColor;
    editor.style.backgroundColor = theme.canvasBg;
    if (t.letterSpacing) editor.style.letterSpacing = t.letterSpacing;
    else editor.style.letterSpacing = 'normal';

    // 从主题 bodyStyle 中解析 padding / text-align，应用到编辑器，使排版与预览完全一致
    const bodyStyle = theme.bodyStyle(c, s, sp, t, font);
    const padMatch = bodyStyle.match(/padding:\s*([^;]+);/);
    if (padMatch) editor.style.padding = padMatch[1].trim();
    const alignMatch = bodyStyle.match(/text-align:\s*([^;]+);/);
    editor.style.textAlign = alignMatch ? alignMatch[1].trim() : 'left';

    // 限制编辑器内容宽度与预览手机框一致（phone-frame max-width:480px）
    // 让文字换行、图片缩放与预览完全 1:1
    editor.style.maxWidth = '480px';
    editor.style.margin = '0 auto';
    editor.style.width = '100%';

    // 同步 CSS 变量，给 styles.css 中部分仍使用变量的规则（如 hover、placeholder）兜底
    editor.style.setProperty('--editor-accent', c.accent);
    editor.style.setProperty('--editor-accent-light', c.accentLight);
    editor.style.setProperty('--editor-accent-dark', c.accentDark);
    editor.style.setProperty('--editor-accent-soft', c.accentSoft);
    editor.style.setProperty('--editor-accent-border', c.accentBorder);
    editor.style.setProperty('--editor-meta', theme.metaColor);

    // 同步编辑器内子元素（h1/h2/p/blockquote 等）样式，使其与预览渲染一致
    syncEditorContentStyles();
}

// 将主题的 *Style() 方法转换为 CSS 规则，注入到 <style id="editor-sync-styles"> 中
// 这样编辑器内的 h1/h2/p/blockquote 等元素就会和预览区 1:1 一致
function syncEditorContentStyles() {
    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const theme = getStyleTheme();

    // 复用主题方法拿到 style 字符串，无需重复实现
    const h1Style = theme.h1Style(c, s, sp, t);
    const h2Style = theme.h2Style(c, s, sp, t);
    // h3 沿用 renderStyledHTML 中的回退逻辑：h2Style 调小字号 + 中等字重
    const h3Style = theme.h3Style
        ? theme.h3Style(c, s, sp, t)
        : h2Style.replace(/font-size:[^;]+;/, `font-size:${parseInt(s.h2Size) - 2}px;`)
                 .replace(/font-weight:[^;]+;/, 'font-weight:500;');
    const pStyle = theme.pStyle(c, sp);
    const blockquoteStyle = theme.blockquoteStyle(c);
    const ulStyle = theme.ulStyle(c);
    const olStyle = theme.olStyle(c);
    const liStyle = theme.liStyle(c);
    const hrStyle = theme.hrStyle(c);
    const aStyle = theme.aStyle(c);
    const strongStyle = theme.strongStyle(c);
    const emStyle = theme.emStyle(c);
    const codeStyle = theme.codeStyle(c);
    const preStyle = theme.preStyle(c);
    const preCodeStyle = theme.preCodeStyle(c);
    const metaLineStyle = theme.metaLineStyle ? theme.metaLineStyle(c) : '';

    // 列表项图标需要伪元素呈现（避免修改编辑器 DOM），用 ::before 注入符号
    // 与主题 liIcon / olIcon 保持视觉一致：无序列表用 ·，有序列表用 1. 2. 3.
    const liIconHtml = theme.liIcon ? theme.liIcon(c) : '';
    const liIconChar = (liIconHtml.match(/>([^<]+)</) || [])[1] || '·';

    // 构建编辑器内部元素的 CSS 规则
    const cssText = `
#editor h1 { ${h1Style} margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0; }
#editor h2 { ${h2Style} margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0; }
#editor h3 { ${h3Style} margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0; }
#editor p { ${pStyle} }
#editor p.meta-line { ${metaLineStyle} }
#editor blockquote { ${blockquoteStyle} }
#editor ul { ${ulStyle} }
#editor ol { ${olStyle} }
#editor li { ${liStyle} }
#editor ul > li { counter-increment: editor-ul-counter; }
#editor ul > li::before { content: "${liIconChar}"; position:absolute; left:0; top:0; color:${c.accent}; font-size:12px; }
#editor ol { counter-reset: editor-ol-counter; list-style:none; }
#editor ol > li { counter-increment: editor-ol-counter; }
#editor ol > li::before { content: counter(editor-ol-counter) "."; position:absolute; left:0; top:0; color:${c.accent}; font-weight:500; font-size:12px; }
#editor hr { ${hrStyle} }
#editor a { ${aStyle} }
#editor strong, #editor b { ${strongStyle} }
#editor em, #editor i { ${emStyle} }
#editor code { ${codeStyle} font-family:${fontFamilies.mono}; }
#editor pre { ${preStyle} position:relative; }
#editor pre code { ${preCodeStyle} background:transparent; padding:0; }
#editor img { max-width:100%; height:auto; border-radius:8px; margin:16px 0; display:block; }
`;

    // 注入或替换 <style id="editor-sync-styles">
    let styleTag = document.getElementById('editor-sync-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'editor-sync-styles';
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssText;
}

function fillIntroDefaults() {
    const theme = getStyleTheme();
    if (!theme.defaultIntro) return;

    const defaults = theme.defaultIntro;
    const fields = ['name', 'title', 'focus', 'output', 'slogan', 'disclaimer1', 'disclaimer2'];

    fields.forEach(field => {
        const el = document.getElementById('intro' + field.charAt(0).toUpperCase() + field.slice(1));
        if (el && defaults[field] !== undefined) {
            el.value = defaults[field];
        }
    });
}

function setStyle(style) {
    currentStyle = style;
    styleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.style === style));

    const theme = getStyleTheme();

    if (theme.defaultColor) {
        document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
        currentColor = theme.defaultColor;
        document.body.classList.add(`theme-${currentColor}`);
        try { localStorage.setItem('wx_theme_v5', `theme-${currentColor}`); } catch {}
        colorButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.color === currentColor));
    }

    if (theme.defaultFont) {
        currentFont = theme.defaultFont;
        fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.font === currentFont));
    }

    fillIntroDefaults();
    syncEditorToTheme();
    updatePreview();
}

function setColor(color) {
    document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
    currentColor = color;
    document.body.classList.add(`theme-${color}`);
    try { localStorage.setItem('wx_theme_v5', `theme-${color}`); } catch {}
    colorButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.color === color));
    syncEditorToTheme();
    updatePreview();
}

function setSize(size) {
    currentSize = size;
    sizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === size));
    syncEditorToTheme();
    updatePreview();
}

function setSpacing(spacing) {
    currentSpacing = spacing;
    spacingButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.spacing === spacing));
    syncEditorToTheme();
    updatePreview();
}

function setFont(font) {
    currentFont = font;
    fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.font === font));
    syncEditorToTheme();
    updatePreview();
}

function setTracking(tracking) {
    currentTracking = tracking;
    trackingButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tracking === tracking));
    syncEditorToTheme();
    updatePreview();
}

// ===== 富文本编辑器工具函数 =====
function execCommand(cmd, value = null) {
    editor.focus();
    document.execCommand(cmd, false, value);
    debouncedUpdatePreview();
}

function formatBlock(tag) {
    editor.focus();
    document.execCommand('formatBlock', false, tag);
    debouncedUpdatePreview();
}

function insertHTMLAtCursor(html) {
    editor.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const fragment = range.createContextualFragment(html);
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    } else {
        editor.innerHTML += html;
    }
    debouncedUpdatePreview();
}

function wrapSelectionWithTag(tag) {
    editor.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        const el = document.createElement(tag);
        el.textContent = selectedText;
        range.deleteContents();
        range.insertNode(el);
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
        debouncedUpdatePreview();
    }
}

function handleToolAction(action) {
    const btn = document.querySelector(`.tool-btn[data-action="${action}"]`);
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 150);
    }

    switch (action) {
        case 'bold':
            execCommand('bold');
            break;
        case 'italic':
            execCommand('italic');
            break;
        case 'underline':
            execCommand('underline');
            break;
        case 'strikethrough':
            execCommand('strikeThrough');
            break;
        case 'h1':
            formatBlock('h1');
            break;
        case 'h2':
            formatBlock('h2');
            break;
        case 'h3':
            formatBlock('h3');
            break;
        case 'p':
            // 将当前块转为普通段落
            formatBlock('p');
            break;
        case 'list':
            execCommand('insertUnorderedList');
            break;
        case 'olist':
            execCommand('insertOrderedList');
            break;
        case 'quote':
            formatBlock('blockquote');
            break;
        case 'divider':
            insertHTMLAtCursor('<hr>');
            break;
        case 'link': {
            const url = prompt('请输入链接地址：', 'https://');
            if (url) {
                execCommand('createLink', url);
            }
            break;
        }
        case 'image': {
            const choice = prompt('输入图片URL，或点击取消选择本地图片：', 'https://');
            if (choice) {
                insertHTMLAtCursor(`<img src="${choice}" alt="图片">`);
            } else {
                const imgInput = document.createElement('input');
                imgInput.type = 'file';
                imgInput.accept = 'image/*';
                imgInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            insertHTMLAtCursor(`<img src="${evt.target.result}" alt="${file.name}">`);
                        };
                        reader.readAsDataURL(file);
                    }
                };
                imgInput.click();
            }
            break;
        }
        case 'code':
            wrapSelectionWithTag('code');
            break;
        case 'undo':
            execCommand('undo');
            break;
        case 'redo':
            execCommand('redo');
            break;
    }
}

function clearContent() {
    if (editor.innerHTML.trim() && !confirm('确定要清空所有内容吗？')) return;
    editor.innerHTML = '';
    updatePreview();
}

// ===== 粘贴处理 =====
function sanitizeHTML(html) {
    const allowedTags = ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'strong', 'em', 'code', 'pre', 'hr', 'br', 'span', 'div', 'b', 'i', 'u', 's'];
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__sanitize__">${html}</div>`, 'text/html');
    const root = doc.getElementById('__sanitize__');

    function cleanNode(node) {
        if (node.nodeType === 3) return node.textContent;
        if (node.nodeType !== 1) return '';

        const tag = node.tagName.toLowerCase();
        if (!allowedTags.includes(tag)) {
            return Array.from(node.childNodes).map(cleanNode).join('');
        }

        const attrs = {};
        if (tag === 'img') {
            attrs.src = node.getAttribute('src') || '';
            attrs.alt = node.getAttribute('alt') || '';
        }
        if (tag === 'a') {
            attrs.href = node.getAttribute('href') || '#';
            attrs.target = '_blank';
        }

        const children = Array.from(node.childNodes).map(cleanNode).join('');

        let attrStr = '';
        for (const [k, v] of Object.entries(attrs)) {
            if (v) attrStr += ` ${k}="${v}"`;
        }

        return `<${tag}${attrStr}>${children}</${tag}>`;
    }

    return Array.from(root.childNodes).map(cleanNode).join('');
}

function handlePaste(e) {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    insertHTMLAtCursor(`<img src="${evt.target.result}" alt="${file.name}">`);
                };
                reader.readAsDataURL(file);
                return;
            }
        }
    }

    const htmlData = clipboardData.getData('text/html');
    if (htmlData) {
        const clean = sanitizeHTML(htmlData);
        insertHTMLAtCursor(clean);
        return;
    }

    const textData = clipboardData.getData('text/plain');
    if (textData) {
        const trimmed = textData.trim();
        if (!trimmed) return;

        const hasMarkdownSyntax = /^#\s|^##\s|```|^-\s|^>\s|\*\*.+\*\*/.test(trimmed);
        const isLongText = trimmed.length > 300;
        const hasMultipleLines = trimmed.split('\n').filter(l => l.trim()).length > 5;

        if (hasMarkdownSyntax || isLongText || hasMultipleLines) {
            const formatted = smartFormatText(trimmed);
            const html = markdownToHTML(formatted);
            insertHTMLAtCursor(html);
        } else {
            const lines = trimmed.split('\n');
            const paragraphs = [];
            let paraBuffer = [];
            for (const line of lines) {
                if (line.trim() === '') {
                    if (paraBuffer.length > 0) {
                        paragraphs.push(`<p>${paraBuffer.join('')}</p>`);
                        paraBuffer = [];
                    }
                } else {
                    paraBuffer.push(line);
                }
            }
            if (paraBuffer.length > 0) {
                paragraphs.push(`<p>${paraBuffer.join('')}</p>`);
            }
            insertHTMLAtCursor(paragraphs.join(''));
        }
    }
}

// ===== 拖拽处理 =====
function handleDragOver(e) {
    e.preventDefault();
    editor.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    editor.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    editor.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.indexOf('image') !== -1) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    insertHTMLAtCursor(`<img src="${evt.target.result}" alt="${file.name}">`);
                };
                reader.readAsDataURL(file);
                return;
            }
            if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const formatted = smartFormatText(evt.target.result);
                    const html = markdownToHTML(formatted);
                    editor.innerHTML = html;
                    updatePreview();
                    showToast(`已导入：${file.name}（已替换原有内容）`);
                };
                reader.readAsText(file, 'UTF-8');
                return;
            }
        }
    }

    const htmlData = e.dataTransfer.getData('text/html');
    if (htmlData) {
        const clean = sanitizeHTML(htmlData);
        insertHTMLAtCursor(clean);
        return;
    }

    const textData = e.dataTransfer.getData('text/plain');
    if (textData) {
        const trimmed = textData.trim();
        if (trimmed) {
            const formatted = smartFormatText(trimmed);
            const html = markdownToHTML(formatted);
            insertHTMLAtCursor(html);
        }
    }
}

// ===== 文件上传 =====
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        const formatted = smartFormatText(evt.target.result);
        const html = markdownToHTML(formatted);
        editor.innerHTML = html;
        updatePreview();
        showToast(`已导入：${file.name}`);
    };
    reader.readAsText(file, 'UTF-8');
    fileInput.value = '';
}

// ===== 智能排版 =====
function smartFormat() {
    const html = editor.innerHTML;
    if (!html.trim()) { showToast('请先输入内容'); return; }

    let text = html;
    // 将 <img> 转为 Markdown 图片语法（兼容各种属性顺序和单双引号）
    text = text.replace(/<img[^>]*?src=(["'])(.*?)\1[^>]*?>/gi, (match, quote, src) => {
        // 提取 alt 属性
        const altMatch = match.match(/alt=(["'])(.*?)\1/i);
        const alt = altMatch ? altMatch[2] : '';
        return `![${alt}](${src})`;
    });
    // 移除其他 HTML 标签，只留文本
    text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    // 解码 HTML 实体
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    // 修复编码问题：替换全角空格和其他不可见字符
    text = text.replace(/\u3000/g, ' ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    if (!text.trim()) { showToast('请先输入内容'); return; }

    // === 预检测：判断输入类型，避免粗暴转换丢失格式 ===
    // 1. 标准 Markdown 文本（含 # 标题、``` 代码块、> 引用、- 列表等）
    const isMarkdown = /^#{1,6}\s/m.test(text)
        || /^```/m.test(text)
        || /^>\s/m.test(text)
        || /^[-*]\s/m.test(text)
        || /^\d+\.\s/m.test(text)
        || /\*\*[^*]+\*\*/.test(text)
        || /`[^`]+`/.test(text);
    // 2. HTML 富文本（含 <h1>/<pre>/<blockquote>/<ul> 等结构标签）
    const isHtmlRich = /<(h[1-6]|pre|blockquote|ul|ol|table|code)\b/i.test(html);

    if (isMarkdown && !isHtmlRich) {
        // 标准 MD：直接走 marked.js 解析，保留所有格式（标题层级/代码块/引用/列表/表格/加粗斜体）
        if (!confirm('检测到标准 Markdown 格式，将直接解析为富文本。继续？')) return;
        const newHtml = markdownToHTML(text);
        editor.innerHTML = newHtml;
        updatePreview();
        showToast('Markdown 已解析为富文本！');
        return;
    }

    if (isHtmlRich) {
        // HTML 富文本：保留结构，只应用主题样式（不转纯文本重新识别）
        if (!confirm('检测到富文本内容，将应用主题样式排版。继续？')) return;
        const normalizedContent = normalizeEditorHTML(editor.innerHTML);
        const styledContent = renderStyledHTML(normalizedContent);
        editor.innerHTML = styledContent;
        updatePreview();
        showToast('富文本已应用主题样式！');
        return;
    }

    // 3. 纯文本：走 smartFormatText 重新识别结构（口语化/无格式文本）
    if (/^#\s/.test(text) || /```/.test(text)) {
        if (!confirm('内容可能已经是Markdown格式，确定要重新智能排版吗？')) return;
    }
    const formatted = smartFormatText(text);
    const newHtml = markdownToHTML(formatted);
    editor.innerHTML = newHtml;
    updatePreview();
    showToast('智能排版完成！');
}

function smartFormatText(text) {
    let lines = text.split('\n').map(l => l.trimRight());
    lines = normalizeWhitespace(lines);

    // 合并被空行分隔的引用+署名
    let processed = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const nextNextLine = i + 2 < lines.length ? lines[i + 2] : '';
        if (line.trim() && /^[""「『【「]/.test(line.trim()) && /[""」』】」[。！？!?]$/.test(line.trim()) &&
            nextLine.trim() === '' && nextNextLine.trim() && /^[——\-]+\s*[\u4e00-\u9fa5]/.test(nextNextLine.trim())) {
            processed.push(line);
            processed.push(nextNextLine);
            i += 2;
            continue;
        }
        processed.push(line);
    }
    lines = processed;

    const cleanLines = collapseEmptyLines(lines);
    const nonEmpty = cleanLines.filter(l => l.trim());
    if (nonEmpty.length === 0) return text;

    const result = [];
    let paraBuffer = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLang = '';
    let inQuoteBlock = false;
    let quoteBuffer = [];
    let inTableBlock = false;
    let tableBuffer = [];

    const analysis = analyzeTextStructure(cleanLines, nonEmpty);

    const flushAll = () => {
        if (inQuoteBlock && quoteBuffer.length > 0) {
            result.push(quoteBuffer.map(l => `> ${l}`).join('\n'));
            quoteBuffer = [];
            inQuoteBlock = false;
        }
        if (paraBuffer.length > 0) {
            result.push(paraBuffer.join(''));
            paraBuffer = [];
        }
    };

    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];
        const trimmed = line.trim();
        const nonEmptyIdx = getNonEmptyIndex(cleanLines, i);

        // === 空行处理 ===
        if (trimmed === '') {
            if (inCodeBlock && codeLang === 'text') {
                // 检查后面是否还有流程图/代码
                let hasMore = false;
                for (let j = i + 1; j < cleanLines.length; j++) {
                    if (cleanLines[j].trim()) {
                        if (isFlowChartLine(cleanLines[j].trim()) || isCodeLine(cleanLines[j].trim())) hasMore = true;
                        break;
                    }
                }
                if (!hasMore) {
                    codeBuffer.push('```');
                    result.push(codeBuffer.join('\n'));
                    codeBuffer = [];
                    inCodeBlock = false;
                    result.push('');
                    continue;
                }
                codeBuffer.push('');
                continue;
            }
            if (inTableBlock && tableBuffer.length > 0) {
                result.push(convertToMarkdownTable(tableBuffer));
                tableBuffer = [];
                inTableBlock = false;
                result.push('');
                continue;
            }
            if (inQuoteBlock && quoteBuffer.length > 0) {
                result.push(quoteBuffer.map(l => `> ${l}`).join('\n'));
                quoteBuffer = [];
                inQuoteBlock = false;
            }
            if (paraBuffer.length > 0) {
                result.push(paraBuffer.join(''));
                paraBuffer = [];
            }
            result.push('');
            continue;
        }

        // === Markdown 图片语法处理（保留图片，不参与智能识别）===
        const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
            flushAll();
            result.push(trimmed);
            result.push('');
            continue;
        }

        // === 已有的 Markdown 代码块 ===
        if (trimmed.startsWith('```') || /^[`]{3,}/.test(trimmed)) {
            if (inCodeBlock) {
                codeBuffer.push(trimmed);
                result.push(codeBuffer.join('\n'));
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                flushAll();
                inCodeBlock = true;
                codeLang = trimmed.replace(/^```+/, '').trim();
                codeBuffer = [trimmed];
            }
            continue;
        }

        // 已在非自动检测的代码块中
        if (inCodeBlock && codeLang !== 'text') {
            codeBuffer.push(line);
            continue;
        }

        // 已在自动检测的代码块中
        if (inCodeBlock && codeLang === 'text') {
            // 标题行结束代码块（包括中文风格标题和标准 Markdown # 标题）
            if (/^[一二三四五六七八九十]+、/.test(trimmed) || /^[0-9]+[、.．]/.test(trimmed) || /^第[一二三四五六七八九十百千]+[章节部分]/.test(trimmed) || /^#{1,6}[ \t]+/.test(trimmed)) {
                codeBuffer.push('```');
                result.push(codeBuffer.join('\n'));
                codeBuffer = [];
                inCodeBlock = false;
                // 继续往下处理标题
            } else {
                codeBuffer.push(line);
                continue;
            }
        }

        // === 表格检测 ===
        if (isTableRow(trimmed) || isTableSeparator(trimmed)) {
            flushAll();
            if (inCodeBlock && codeLang === 'text') {
                codeBuffer.push('```');
                result.push(codeBuffer.join('\n'));
                codeBuffer = [];
                inCodeBlock = false;
            }
            if (!inTableBlock) {
                inTableBlock = true;
                tableBuffer = [];
            }
            tableBuffer.push(trimmed);
            continue;
        } else if (inTableBlock) {
            result.push(convertToMarkdownTable(tableBuffer));
            tableBuffer = [];
            inTableBlock = false;
            result.push('');
            // 继续处理当前行
        }

        // === 标准 Markdown 标题检测（# ~ ######） ===
        // 必须在流程图/代码自动检测之前处理，避免含编程关键词的标题（如 "# Function"）
        // 被误判为代码行；同时确保标题独立成段，防止与相邻段落内容被 paraBuffer 拼接合并
        if (/^#{1,6}[ \t]+.+/.test(trimmed)) {
            flushAll();
            result.push(trimmed); // 保留原始 # 数量，不改变标题级别
            result.push('');
            continue;
        }

        // === 流程图/代码自动检测 ===
        if (isFlowChartLine(trimmed) || isCodeLine(trimmed)) {
            flushAll();
            if (inTableBlock && tableBuffer.length > 0) {
                result.push(convertToMarkdownTable(tableBuffer));
                tableBuffer = [];
                inTableBlock = false;
                result.push('');
            }
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLang = 'text';
                codeBuffer = ['```text'];
            }
            codeBuffer.push(line);
            continue;
        }

        // === 基于分析结果分类 ===
        const lineType = analysis.lineTypes[nonEmptyIdx] || 'paragraph';

        switch (lineType) {
            case 'title':
                flushAll();
                result.push(`# ${trimmed}`);
                result.push('');
                break;

            case 'subtitle':
                flushAll();
                result.push(`## ${trimmed}`);
                result.push('');
                break;

            case 'h1':
                flushAll();
                result.push(`# ${cleanHeadingText(trimmed)}`);
                result.push('');
                break;

            case 'h2':
            case 'h3':
                flushAll();
                result.push(`${lineType === 'h2' ? '##' : '###'} ${cleanHeadingText(trimmed)}`);
                result.push('');
                break;

            case 'meta':
                flushAll();
                result.push(`<p class="meta-line">${trimmed}</p>`);
                result.push('');
                break;

            case 'list-ul':
                flushAll();
                result.push(`- ${cleanListItemText(trimmed)}`);
                break;
                
            case 'list-ol':
                flushAll();
                const olMatch = trimmed.match(/^([0-9]+|[①②③④⑤⑥⑦⑧⑨⑩⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]+)[.、）)．]\s*(.*)/);
                if (olMatch) {
                    const num = olMatch[1];
                    const rest = olMatch[2];
                    let displayNum = num;
                    const circleMap = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10};
                    const circleMap2 = {'⒈':1,'⒉':2,'⒊':3,'⒋':4,'⒌':5,'⒍':6,'⒎':7,'⒏':8,'⒐':9,'⒑':10};
                    if (circleMap[num] !== undefined) displayNum = circleMap[num];
                    else if (circleMap2[num] !== undefined) displayNum = circleMap2[num];
                    result.push(`${displayNum}. ${rest}`);
                } else {
                    result.push(`1. ${cleanListItemText(trimmed)}`);
                }
                break;

            case 'quote':
                flushAll();
                inQuoteBlock = true;
                quoteBuffer.push(cleanQuoteText(trimmed));
                break;

            case 'divider':
                flushAll();
                result.push('---');
                result.push('');
                break;

            default:
                if (inQuoteBlock) {
                    inQuoteBlock = false;
                    if (quoteBuffer.length > 0) {
                        result.push(quoteBuffer.map(l => `> ${l}`).join('\n'));
                        quoteBuffer = [];
                    }
                }
                paraBuffer.push(trimmed);
                break;
        }
    }

    // 收尾：刷新所有缓冲区
    if (inCodeBlock && codeBuffer.length > 0) {
        if (codeLang === 'text' && !codeBuffer[codeBuffer.length - 1].includes('```')) {
            codeBuffer.push('```');
        }
        result.push(codeBuffer.join('\n'));
    }
    if (inTableBlock && tableBuffer.length > 0) {
        result.push(convertToMarkdownTable(tableBuffer));
    }
    if (inQuoteBlock && quoteBuffer.length > 0) {
        result.push(quoteBuffer.map(l => `> ${l}`).join('\n'));
    }
    if (paraBuffer.length > 0) {
        const joined = paraBuffer.join('');
        const split = splitLongParagraph(joined);
        result.push(split);
    }

    return highlightKeySentences(result.join('\n'));
}

function getNonEmptyIndex(cleanLines, currentIdx) {
    let count = 0;
    for (let i = 0; i <= currentIdx && i < cleanLines.length; i++) {
        if (cleanLines[i].trim()) count++;
    }
    return count - 1;
}

function analyzeTextStructure(cleanLines, nonEmptyLines) {
    const lineTypes = {};
    const totalLines = nonEmptyLines.length;

    if (totalLines === 0) return { lineTypes };

    const firstLine = nonEmptyLines[0].trim();
    if (isLikelyTitle(firstLine) && totalLines > 2) {
        lineTypes[0] = 'title';
        
        if (totalLines > 1) {
            const secondLine = nonEmptyLines[1].trim();
            if (isLikelySubtitle(secondLine, firstLine)) {
                lineTypes[1] = 'subtitle';
            }
        }
    }

    let lastHeadingLevel = 0;
    const startIdx = (lineTypes[0] === 'title' ? (lineTypes[1] === 'subtitle' ? 2 : 1) : 0);

    for (let i = 0; i < totalLines; i++) {
        if (lineTypes[i]) continue;
        
        const line = nonEmptyLines[i].trim();
        const prevLine = i > 0 ? nonEmptyLines[i - 1].trim() : '';
        const nextLine = i < totalLines - 1 ? nonEmptyLines[i + 1].trim() : '';
        const prevPrevLine = i > 1 ? nonEmptyLines[i - 2].trim() : '';

        if (isLikelyDivider(line)) {
            lineTypes[i] = 'divider';
            continue;
        }

        if (isLikelyQuote(line, prevLine, nextLine)) {
            lineTypes[i] = 'quote';
            if (nextLine && /^[—]{2,}\s*[\u4e00-\u9fa5]/.test(nextLine)) {
                lineTypes[i + 1] = 'quote';
            }
            continue;
        }

        if (/^[—]{2,}\s*[\u4e00-\u9fa5]/.test(line) && prevLine && lineTypes[i - 1] === 'quote') {
            lineTypes[i] = 'quote';
            continue;
        }

        if (isAuthorDateLine(line, prevLine, nextLine, i, totalLines)) {
            lineTypes[i] = 'meta';
            continue;
        }

        const headingInfo = detectHeadingLevel(line, i, totalLines, prevLine, nextLine, lastHeadingLevel);
        if (headingInfo) {
            lineTypes[i] = headingInfo;
            if (headingInfo === 'h1') lastHeadingLevel = 1;
            else if (headingInfo === 'h2') lastHeadingLevel = 2;
            else if (headingInfo === 'h3') lastHeadingLevel = 3;
            continue;
        }

        if (isLikelyListItem(line)) {
            lineTypes[i] = /^[0-9]+[.、）)]/.test(line) ? 'list-ol' : 'list-ul';
            continue;
        }
    }

    return { lineTypes };
}

function isAuthorDateLine(line, prevLine, nextLine, idx, totalLines) {
    const t = line.trim();
    if (t.length < 5 || t.length > 80) return false;

    const authorPatterns = [
        /^文\s*[\/／]\s*/,
        /^作者[：:]\s*/,
        /^撰文[：:]\s*/,
        /^原创\s*[：:]/,
    ];
    const datePatterns = [
        /\d{4}年\d{1,2}月\d{1,2}日/,
        /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
        /日期[：:]\s*\d/,
    ];

    let hasAuthor = false;
    for (const p of authorPatterns) {
        if (p.test(t)) { hasAuthor = true; break; }
    }

    let hasDate = false;
    for (const p of datePatterns) {
        if (p.test(t)) { hasDate = true; break; }
    }

    if (hasAuthor && hasDate) return true;
    if (hasAuthor && idx < 5) return true;
    if (hasDate && idx < 5) return true;

    if (idx < 3 && /^(文\s*[\/／]|作者[：:]|撰文[：:])/.test(t)) return true;

    return false;
}

function detectHeadingLevel(line, idx, totalLines, prevLine, nextLine, lastHeadingLevel) {
    const t = line.trim();
    if (t.length < 2) return null;

    const isNumberedPattern = /^[0-9]+[、.．]\s+\S/.test(t) || /^[0-9]+\.[0-9]+(\.[0-9]+)?\s+\S/.test(t);
    const isNumberedCirclePattern = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]\s*\S/.test(t) || /^[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]\s*\S/.test(t);

    if (isNumberedPattern || isNumberedCirclePattern) {
        if (nextLine && (/^[0-9]+[、.．]\s+\S/.test(nextLine) || /^[0-9]+\.[0-9]+(\.[0-9]+)?\s+\S/.test(nextLine))) {
            return null;
        }
        if (prevLine && (/^[0-9]+[、.．]\s+\S/.test(prevLine) || /^[0-9]+\.[0-9]+(\.[0-9]+)?\s+\S/.test(prevLine))) {
            return null;
        }
    }

    const h1Patterns = [
        /^第[一二三四五六七八九十百千0-9]+部分[：: ]/,
        /^第[一二三四五六七八九十百千0-9]+章[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+篇[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+辑[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+卷[、\s]/,
        /^Part\s+[0-9A-Z]+[:,]/i,
        /^Chapter\s+[0-9]+[:,]/i,
    ];
    for (const p of h1Patterns) {
        if (p.test(t)) return 'h1';
    }

    const h2Patterns = [
        /^[一二三四五六七八九十百千]+、\s*\S/,
        /^[一二三四五六七八九十百千]+\.\s*\S/,
        /^[一二三四五六七八九十百千]+）\s*\S/,
        /^\([一二三四五六七八九十]+\)\s*\S/,
        /^（[一二三四五六七八九十]+）\s*\S/,
        /^第[一二三四五六七八九十百千0-9]+节[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+条[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+点[、\s]/,
        /^第[一二三四五六七八九十百千0-9]+讲[、\s]/,
        /^[0-9]+[、.．]\s+\S/,
    ];
    for (const p of h2Patterns) {
        if (p.test(t) && t.length < 70) return 'h2';
    }

    const h3Patterns = [
        /^[0-9]+\.[0-9]+\s+\S/,
        /^[0-9]+\.[0-9]+\.[0-9]+\s+\S/,
        /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]\s*\S/,
        /^[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]\s*\S/,
    ];
    for (const p of h3Patterns) {
        if (p.test(t) && t.length < 60) return 'h3';
    }

    const h2Keywords = [
        /^前言$/, /^引言$/, /^背景$/, /^概述$/, /^简介$/,
        /^总结$/, /^结语$/, /^结论$/, /^正文$/,
        /^核心要点$/, /^重要提示$/, /^写在最后$/, /^最后总结$/,
        /^附录$/, /^参考资料$/, /^参考文献$/,
        /^什么是/, /^为什么/, /^如何/, /^怎么/, /^哪些/, /^怎样/,
        /^注意/, /^关键/, /^重点/, /^核心/, /^本质/,
        /^方法/, /^技巧/, /^策略/, /^方案/, /^步骤/,
        /^优势/, /^特点/, /^区别/, /^对比/, /^分析/,
    ];
    for (const p of h2Keywords) {
        if (p.test(t) && t.length < 25) {
            if (!/[。！？]$/.test(t)) return 'h2';
        }
    }

    if (t.length >= 4 && t.length <= 28 && /[\u4e00-\u9fa5]/.test(t)) {
        const hasEndPunct = /[。！？，；：、]$/.test(t);
        const startsWithListMark = /^[-•·■▪▸▹►▻◆◇★☆✓✔✅☑️]/.test(t);
        if (!hasEndPunct && !startsWithListMark) {
            if (prevLine && prevLine.length > 15 && nextLine && nextLine.length > 15) {
                if (idx > 2 && idx < totalLines - 1) {
                    return lastHeadingLevel >= 2 ? 'h3' : 'h2';
                }
            }
        }
    }

    return null;
}

function isLikelyDivider(line) {
    if (/^[-—=*·•]{3,}\s*$/.test(line)) return true;
    if (/^[-—]{5,}/.test(line)) return true;
    if (/^[*·•]{3,}/.test(line)) return true;
    if (/^[=]{3,}/.test(line)) return true;
    return false;
}

function isLikelyQuote(line, prevLine, nextLine) {
    const t = line.trim();
    
    if (/^[-*•·▪▸▹►▻◆◇★☆✓✔✅☑️]\s+/.test(t)) return false;
    if (/^[0-9]+[.、）)]\s/.test(t)) return false;
    
    if (/^[""「『【「].*[""」』】」]$/.test(t) && t.length > 10) return true;
    
    if (/^[""「『]/.test(t) && t.length > 10) {
        if (nextLine && /[""」』]/.test(nextLine)) return true;
    }
    
    if (/^[—]{2,}\s*[\u4e00-\u9fa5]/.test(t) && t.length > 8) return true;
    
    if (/^摘自|^引自|^出自|^来源：|^来源[:：]/.test(t) && t.length > 6) return true;
    
    if (prevLine && prevLine.length > 5 && t.length > 5) {
        const prevEndsQuote = /[""」』】」]$/.test(prevLine);
        const startsDash = /^[—]{2,}\s*/.test(t);
        if (prevEndsQuote && startsDash) return true;
    }

    return false;
}

function cleanHeadingText(text) {
    // 仅去除可能残留的 Markdown 标记，保留编号（一、/1./第X章 等），
    // 因为标题不像有序列表那样自动编号，去掉编号会丢失信息。
    return text.replace(/^#{1,6}\s*/, '').trim();
}

function cleanListItemText(text) {
    return text
        .replace(/^[0-9]+[.、）)\s]+/, '')
        .replace(/^[一二三四五六七八九十百千]+、\s*/, '')
        .replace(/^[-•·■▪▸▹►▻◆◇★☆✓✔✅☑️]+\s*/, '')
        .trim();
}

function cleanQuoteText(text) {
    return text
        .replace(/^[>\""「『【「\s]+/, '')
        .replace(/[\""」』】」\s]+$/, '')
        .trim();
}

function normalizeWhitespace(lines) {
    return lines.map(l => l.replace(/\t/g, '    ').replace(/\u3000/g, '  '));
}

function collapseEmptyLines(lines) {
    const result = [];
    let prevEmpty = false;
    for (const line of lines) {
        if (line.trim() === '') {
            if (!prevEmpty && result.length > 0) {
                result.push('');
            }
            prevEmpty = true;
        } else {
            result.push(line);
            prevEmpty = false;
        }
    }
    return result;
}

function isLikelyTitle(text) {
    if (text.length < 3 || text.length > 60) return false;
    if (/[。，；：、！？!?，；：]$/.test(text)) return false;
    if (/https?:\/\//.test(text)) return false;
    if (/^[0-9]+[.、）)]/.test(text)) return false;
    if (/^[-•·]/.test(text)) return false;
    if (text.length <= 6) return false;
    return true;
}

function isLikelySubtitle(text, title) {
    if (text.length < 4 || text.length > 40) return false;
    if (text === title) return false;
    if (/^[0-9]+[.、）)]/.test(text)) return false;
    if (/[。！？!?，；：、]/.test(text)) return false;
    if (text.length > 20 && /[的是了在和与及]/.test(text)) return false;
    return true;
}

function isLikelyListItem(text) {
    if (/^[-•·■▪▸▹►▻◆◇★☆✓✔✅☑️]+\s+/.test(text)) return true;
    if (/^[0-9]+[.、）)]\s+/.test(text)) return true;
    return false;
}

// ===== 代码行检测 =====
function isCodeLine(line) {
    const t = line.trim();
    if (!t || t.length < 2) return false;
    // 排除中文为主的行
    const cjkCount = (t.match(/[\u4e00-\u9fa5]/g) || []).length;
    if (cjkCount > t.length * 0.5) return false;
    // 编程关键词
    const codeKeywords = /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|def|print|echo|require|module|async|await|new|typeof|instanceof|try|catch|throw|switch|case|break|continue|public|private|protected|static|void|int|string|boolean|true|false|null|undefined|None|True|False)\b/;
    if (codeKeywords.test(t)) return true;
    // 以分号结尾
    if (/;$/.test(t) && /[a-zA-Z=(){}\[\]]/.test(t)) return true;
    // 大括号行
    if (/^[{}]\s*$/.test(t)) return true;
    // 赋值语句
    if (/^\s*(const|let|var|int|String|boolean|auto)\s+\w+\s*=/.test(t)) return true;
    // 函数调用
    if (/\w+\([^)]*\)/.test(t) && /[;{}]/.test(t)) return true;
    // 缩进的代码行（有前导空格且包含代码特征）
    if (/^\s{2,}/.test(line) && /[(){}=;]/.test(t) && !/[。！？，]/.test(t)) return true;
    return false;
}

// ===== 表格检测 =====
function isTableRow(line) {
    const t = line.trim();
    if (!t) return false;
    // Markdown表格行: | col1 | col2 |
    if (t.startsWith('|') && t.endsWith('|') && t.split('|').length >= 3) return true;
    // 制表符分隔的行（至少2个tab）
    if (t.split('\t').length >= 3) return true;
    // 多列空格分隔（检测3个以上连续空格分隔的短词）
    if (/\s{3,}/.test(t) && t.split(/\s{3,}/).length >= 3 && t.length < 100) return true;
    return false;
}

function isTableSeparator(line) {
    const t = line.trim();
    if (!t) return false;
    // | --- | --- | 或 |:---:|:---|
    if (/^\|[\s:|\-]+$/.test(t) && t.includes('-') && t.includes('|')) return true;
    return false;
}

function convertToMarkdownTable(tableLines) {
    const normalized = tableLines.map(l => l.replace(/[丨｜]/g, '|').trim());
    const hasSeparator = normalized.some(l => /^[\|:\- ]+$/.test(l) && l.includes('-'));
    if (!hasSeparator && normalized.length >= 2) {
        const firstLine = normalized[0];
        const colCount = (firstLine.match(/\|/g) || []).length - 1;
        if (colCount > 0) {
            const separator = '|' + Array(colCount).fill('---').join('|') + '|';
            normalized.splice(1, 0, separator);
        }
    }
    return normalized.join('\n');
}

// ===== 流程图/架构图检测 =====
function isFlowChartLine(line) {
    const t = line.trim();
    if (!t) return false;
    const flowChars = ['│', '┃', '├', '┤', '┌', '┐', '└', '┘', '┼', '┴', '┬', '─', '━', '↓', '↑', '→', '←', '▼', '▲', '▶', '◀'];
    let flowCount = 0;
    let totalChars = 0;
    for (const ch of t) {
        if (ch === ' ' || ch === '\t') continue;
        totalChars++;
        if (flowChars.includes(ch)) flowCount++;
    }
    return (totalChars > 0 && flowCount / totalChars > 0.3) || /^[│|┃]\s*$/.test(t) || /^[├┝┠┣┌┍┏┐┑┓└┕┗┘┙┛]/.test(t);
}

function splitLongParagraph(text) {
    const MAX_PARA_LEN = 180;
    if (text.length <= MAX_PARA_LEN) return text;

    const sentences = text.split(/(?<=[。！？!?；;])\s*/);
    if (sentences.length <= 2) return text;

    const paragraphs = [];
    let current = '';

    for (const s of sentences) {
        if (!s.trim()) continue;
        if (current.length + s.length <= MAX_PARA_LEN) {
            current += (current ? '' : '') + s;
        } else {
            if (current) paragraphs.push(current.trim());
            current = s;
        }
    }
    if (current) paragraphs.push(current.trim());

    return paragraphs.join('\n\n');
}

function highlightKeySentences(text) {
    const strongPatterns = [
        { pattern: /(最重要的是.{0,50}?[。！？!?])/g, priority: 1 },
        { pattern: /(关键在于.{0,50}?[。！？!?])/g, priority: 1 },
        { pattern: /(核心是.{0,50}?[。！？!?])/g, priority: 1 },
        { pattern: /(需要注意的是.{0,50}?[。！？!?])/g, priority: 1 },
        { pattern: /(值得注意的是.{0,50}?[。！？!?])/g, priority: 1 },
        { pattern: /(必须.{0,30}?[。！？!?])/g, priority: 2 },
        { pattern: /(一定要.{0,30}?[。！？!?])/g, priority: 2 },
        { pattern: /(切记.{0,30}?[。！？!?])/g, priority: 2 },
    ];
    
    return text.split('\n').map(line => {
        // 修复：使用 trimStart 后判断，避免缩进的标题（如 "  # 标题"）被误加粗
        const _ts = line.trimStart();
        if (_ts.startsWith('#') || _ts.startsWith('-') || _ts.startsWith('>') ||
            _ts.startsWith('```') || _ts.startsWith('**') || !line.trim()) return line;
        
        let p = line;
        
        for (const { pattern } of strongPatterns) {
            p = p.replace(pattern, m => {
                if (m.includes('**')) return m;
                if (m.length < 10 || m.length > 100) return m;
                return `**${m}**`;
            });
        }

        if (!p.includes('**')) {
            const sentences = p.match(/[^。！？!?]+[。！？!?]/g) || [p];
            if (sentences.length >= 3) {
                let maxLen = 0;
                let maxIdx = -1;
                sentences.forEach((s, idx) => {
                    if (s.length > maxLen && s.length < 50 && s.length > 15) {
                        maxLen = s.length;
                        maxIdx = idx;
                    }
                });
                if (maxIdx >= 0 && maxLen >= 20) {
                    const target = sentences[maxIdx];
                    if (!target.includes('**') && !target.startsWith('总之') && !target.startsWith('因此') && !target.startsWith('所以')) {
                        p = p.replace(target, `**${target}**`);
                    }
                }
            }
        }
        
        return p;
    }).join('\n');
}

// ===== 链接解析 =====
async function parseUrl() {
    const url = urlInput.value.trim();
    if (!url) { showToast('请输入文章链接'); return; }
    if (!/^https?:\/\//.test(url)) { showToast('请输入有效的URL'); return; }

    const origText = parseUrlBtn.textContent;
    parseUrlBtn.innerHTML = '<span class="loading"></span>';
    parseUrlBtn.disabled = true;

    try {
        const html = await fetchWebpage(url);
        const content = extractArticleContent(html, url);
        if (!content || content.trim().length < 50) {
            showToast('未能提取到文章内容，请尝试复制全文后使用智能排版');
            return;
        }
        const formatted = smartFormatText(content);
        const htmlContent = markdownToHTML(formatted);
        editor.innerHTML = htmlContent;
        updatePreview();
        showToast('文章解析完成！');
    } catch (err) {
        console.error(err);
        showToast('解析失败：' + (err.message || '请检查链接或稍后重试'));
    } finally {
        parseUrlBtn.textContent = origText;
        parseUrlBtn.disabled = false;
    }
}

async function fetchWebpage(url) {
    const proxies = [
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
        { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://corsproxy.io/?url=${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://thingproxy.freeboard.io/fetch/${url}`, type: 'raw' },
        { url: `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`, type: 'jsonp' },
    ];

    const randomDelay = () => new Promise(r => setTimeout(r, Math.random() * 400 + 200));

    for (let attempt = 0; attempt < 3; attempt++) {
        const shuffledProxies = [...proxies].sort(() => Math.random() - 0.5);

        for (const proxy of shuffledProxies) {
            try {
                await randomDelay();

                const resp = await fetch(proxy.url, {
                    signal: AbortSignal.timeout(15000),
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    },
                    credentials: 'omit',
                    mode: 'cors',
                });

                if (resp.ok && resp.status === 200) {
                    const text = await resp.text();

                    // 检测微信反爬页面
                    const antiScrapKeywords = ['请在微信客户端打开', '环境异常', '访问过于频繁', '请验证'];
                    if (antiScrapKeywords.some(kw => text.includes(kw))) {
                        throw new Error('微信文章需要验证，建议复制全文后使用智能排版');
                    }

                    if (proxy.type === 'json') {
                        try {
                            const data = JSON.parse(text);
                            if (data.contents && data.contents.length > 50) {
                                return data.contents;
                            }
                        } catch (e) {}
                    }

                    if (proxy.type === 'jsonp') {
                        try {
                            const match = text.match(/^[^\(]*\((.+)\)[^\)]*$/);
                            if (match) {
                                const data = JSON.parse(match[1]);
                                if (data.html) return data.html;
                            }
                        } catch (e) {}
                    }

                    if (text && text.length > 100) {
                        if (!text.includes('<!DOCTYPE') && !text.includes('<html') && text.includes('{')) {
                            try {
                                const data = JSON.parse(text);
                                if (data.contents) return data.contents;
                            } catch (e) {}
                        }
                        return text;
                    }
                }
            } catch (e) {
                if (e.message && e.message.includes('微信文章')) throw e;
                console.warn(`Proxy ${proxy.url} failed:`, e.message);
                continue;
            }
        }

        if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        }
    }

    throw new Error('所有代理均无法访问，建议复制全文后使用智能排版');
}

function extractArticleContent(html, sourceUrl) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // 移除无关元素
    doc.querySelectorAll('script,style,noscript,iframe,nav,header,footer,aside,svg').forEach(el => el.remove());
    doc.querySelectorAll('.sidebar,.menu,.nav,.comment,.comments,.share,.ad,.ads,.advertisement,.recommend,.related,.sidebar-widget,.widget').forEach(el => el.remove());

    // 微信公众号专用选择器（优先级最高）
    const wxSelectors = ['#js_content', '.rich_media_content', '.rich_media_main'];
    for (const sel of wxSelectors) {
        const el = doc.querySelector(sel);
        if (el && (el.innerText || '').trim().length > 50) {
            // 恢复懒加载图片
            el.querySelectorAll('img').forEach(img => {
                if (img.dataset.src) img.src = img.dataset.src;
                if (img.getAttribute('data-original')) img.src = img.getAttribute('data-original');
            });
            return extractText(el);
        }
    }

    // 通用选择器
    const selectors = [
        'article', '.article-content', '.article-body', '.post-content',
        '.entry-content', '.content-article', '#article-content', '#artibody',
        'main', '#content', '.markdown-body', '.post-body',
        '.content', '.article', '.detail-content', '.news-content',
    ];

    let best = null, bestScore = 0;

    for (const sel of selectors) {
        const el = doc.querySelector(sel);
        if (el) {
            const sc = scoreElement(el);
            if (sc > bestScore) {
                bestScore = sc;
                best = el;
            }
        }
    }

    if (!best || bestScore < 200) {
        doc.querySelectorAll('div').forEach(d => {
            const sc = scoreElement(d);
            if (sc > bestScore) {
                bestScore = sc;
                best = d;
            }
        });
    }

    if (best) {
        best.querySelectorAll('img').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.getAttribute('data-original')) img.src = img.getAttribute('data-original');
        });
    }

    return best ? extractText(best) : '';
}

function scoreElement(el) {
    const text = (el.innerText || '').trim();
    if (text.length < 80) return 0;
    
    const ps = el.querySelectorAll('p').length;
    const links = el.querySelectorAll('a').length;
    const images = el.querySelectorAll('img').length;
    const headings = el.querySelectorAll('h1,h2,h3').length;
    
    const linkText = Array.from(el.querySelectorAll('a')).map(a => a.textContent).join('').length;
    const linkDensity = text.length > 0 ? linkText / text.length : 1;
    
    let score = text.length;
    score += ps * 40;
    score += headings * 30;
    score += images * 10;
    score -= links * 5;
    
    if (linkDensity > 0.4) score *= 0.2;
    else if (linkDensity > 0.3) score *= 0.5;
    else if (linkDensity > 0.2) score *= 0.8;
    
    if (ps > 10) score += 300;
    else if (ps > 5) score += 150;
    
    if (text.length > 1000 && ps > 3) score += 200;
    
    const className = el.className || '';
    const id = el.id || '';
    const goodKeywords = ['article', 'content', 'post', 'body', 'detail', 'rich_media', 'entry'];
    for (const kw of goodKeywords) {
        if (className.includes(kw) || id.includes(kw)) {
            score += 100;
            break;
        }
    }
    
    return score;
}

function extractText(el) {
    const lines = [];
    
    function walk(node) {
        if (!node) return;
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || 
            node.tagName === 'NOSCRIPT' || node.tagName === 'IFRAME') return;
        
        if (node.nodeType === 3) {
            const t = node.textContent.replace(/\u00a0/g, ' ').trim();
            if (t) lines.push(t);
            return;
        }
        
        const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 
                          'LI', 'BLOCKQUOTE', 'BR', 'HR', 'PRE', 'FIGURE',
                          'TR', 'TABLE', 'UL', 'OL'];
        
        if (blockTags.includes(node.tagName) && lines.length > 0) {
            const last = lines[lines.length - 1];
            if (last.trim() !== '') lines.push('');
        }
        
        if (node.tagName === 'IMG') {
            const alt = node.getAttribute('alt') || '';
            if (alt.trim()) {
                lines.push(`![${alt}](${node.src})`);
            }
            return;
        }
        
        Array.from(node.childNodes).forEach(walk);
    }
    
    walk(el);
    
    const result = [];
    let prevEmpty = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') {
            if (!prevEmpty && result.length > 0) {
                result.push('');
            }
            prevEmpty = true;
        } else {
            result.push(trimmed);
            prevEmpty = false;
        }
    }
    
    return result.join('\n');
}

// ===== 初始化事件绑定 =====
editor.addEventListener('input', debouncedUpdatePreview);
editor.addEventListener('paste', handlePaste);
editor.addEventListener('dragover', handleDragOver);
editor.addEventListener('dragleave', handleDragLeave);
editor.addEventListener('drop', handleDrop);

// ===== 编辑器回车/删除行为规范化 =====
// 解决问题：
//  1. 标题后回车延续标题序列（浏览器默认，保留），但删除后段落不收回
//  2. 图片插入后与上下文间距失控（多余空 <p>、孤立 <br>）
//  3. 删除时残留空段落堆积
editor.addEventListener('keyup', (e) => {
    // 仅在可能改变结构的按键后规范化
    const structural = e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete';
    if (!structural) return;
    normalizeEditorStructure();
});
editor.addEventListener('input', (e) => {
    // input 事件中做轻量规范化（拖拽/粘贴/快捷插入后）
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop' || e.inputType === 'insertParagraph') {
        normalizeEditorStructure();
    }
});

// 规范化编辑器结构：清理空段落、孤立 br、相邻图片/标题间多余空段
function normalizeEditorStructure() {
    const root = editor;
    let changed = false;

    // 判断一个 <p> 是否"视觉为空"：无文字、无图片/视频/iframe
    // 注意：含 <br> 或纯空白的 <p> 仍算空（contenteditable 常残留 <br>）
    const isVisualEmpty = (p) => {
        if (p.querySelector('img,video,iframe')) return false;
        const text = p.textContent.replace(/\u200B/g, '').trim();
        const noBr = p.innerHTML.replace(/<br\s*\/?>/gi, '').trim();
        return text === '' && noBr === '';
    };

    // 1. 移除视觉为空的 <p>（仅含空白/br）
    const empties = root.querySelectorAll('p');
    empties.forEach(p => {
        if (isVisualEmpty(p)) {
            p.remove();
            changed = true;
        }
    });

    // 2. 清理段落/块内末尾孤立的 <br>（contenteditable 残留，导致图片与下文多余间距）
    root.querySelectorAll('p, div, h1, h2, h3, li, blockquote').forEach(el => {
        let last = el.lastChild;
        while (last && last.nodeType === 3 && !last.textContent.trim()) {
            el.removeChild(last);
            changed = true;
            last = el.lastChild;
        }
        if (last && last.nodeType === 1 && last.tagName === 'BR') {
            el.removeChild(last);
            changed = true;
        }
    });

    // 3. 图片必须独占段落：若图片与文字混在同一个 <p>，拆分为独立 <p>
    root.querySelectorAll('p').forEach(p => {
        const imgs = p.querySelectorAll('img');
        imgs.forEach(img => {
            const hasText = p.textContent.trim().length > 0;
            if (hasText || imgs.length > 1) {
                const imgP = document.createElement('p');
                imgP.appendChild(img.cloneNode(false));
                p.parentNode.insertBefore(imgP, p.nextSibling);
                img.remove();
                changed = true;
            }
        });
    });

    // 4. 移除相邻的重复空段落（连续空段堆积时合并为单个）
    const ps = root.querySelectorAll('p');
    let prevEmpty = false;
    ps.forEach(p => {
        const isEmpty = isVisualEmpty(p);
        if (isEmpty && prevEmpty) {
            p.remove();
            changed = true;
        } else {
            prevEmpty = isEmpty;
        }
    });

    // 5. 若编辑器完全空了，保留一个占位 <p>（避免无法聚焦输入）
    if (root.children.length === 0 || (root.children.length === 1 && root.children[0].tagName !== 'P')) {
        const placeholder = document.createElement('p');
        placeholder.innerHTML = '<br>';
        root.appendChild(placeholder);
        changed = true;
    }

    if (changed) {
        debouncedUpdatePreview();
    }
}

// 回车键拦截：在图片后回车，确保生成新 <p> 而非延续图片所在块
editor.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const anchor = sel.anchorNode;
    if (!anchor) return;
    // 找到最近的块级元素
    let block = anchor.nodeType === 3 ? anchor.parentElement : anchor;
    while (block && block !== editor && !['P','DIV','H1','H2','H3','LI','BLOCKQUOTE'].includes(block.tagName)) {
        block = block.parentElement;
    }
    if (!block || block === editor) return;
    // 若光标在图片所在块，阻止默认，手动插入新空段落
    const img = block.tagName === 'P' ? block.querySelector('img') : null;
    if (img && block.textContent.trim() === '') {
        e.preventDefault();
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        block.parentNode.insertBefore(newP, block.nextSibling);
        // 移动光标到新段落
        const range = document.createRange();
        range.setStart(newP, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        debouncedUpdatePreview();
    }
});

// ===== 侧边栏收起/展开（支持 localStorage 持久化 + Ctrl+B 快捷键）=====
(function setupSidebarCollapse() {
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const container = document.querySelector('.app-container');
    if (!collapseBtn || !container) return;

    const STORAGE_KEY = 'mp_sidebar_collapsed';
    // 屏幕过窄时强制收起，且不恢复（避免恢复后挤压编辑区）
    const FORCE_COLLAPSE_BREAKPOINT = 1024;

    function applyState(collapsed, persist) {
        container.classList.toggle('sidebar-collapsed', collapsed);
        collapseBtn.setAttribute('aria-expanded', String(!collapsed));
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch (e) {}
        }
    }

    // 1) 恢复上次状态（窄屏强制收起）
    const isNarrow = window.innerWidth <= FORCE_COLLAPSE_BREAKPOINT;
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    const initialCollapsed = isNarrow ? true : (saved === '1');
    applyState(initialCollapsed, false);

    // 2) 点击切换
    collapseBtn.addEventListener('click', () => {
        const collapsed = !container.classList.contains('sidebar-collapsed');
        applyState(collapsed, true);
    });

    // 3) Ctrl+B / Cmd+B 快捷键
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            // 不在编辑框内时才触发，避免拦截编辑器内的加粗
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
            e.preventDefault();
            const collapsed = !container.classList.contains('sidebar-collapsed');
            applyState(collapsed, true);
        }
    });

    // 4) 窗口尺寸变化时自适应：跨越断点时自动收起
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth <= FORCE_COLLAPSE_BREAKPOINT && !container.classList.contains('sidebar-collapsed')) {
                applyState(true, false);
            }
        }, 150);
    });

    // 5) 收起态下 hover 显示文字气泡（注入 body，避免被侧栏 overflow-x:hidden 裁切）
    const tip = document.createElement('div');
    tip.className = 'sidebar-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    let tipTarget = null;

    function positionTip(el) {
        const r = el.getBoundingClientRect();
        tip.style.left = (r.right + 10) + 'px';
        tip.style.top = (r.top + r.height / 2 - tip.offsetHeight / 2) + 'px';
    }
    container.querySelectorAll('.nav-item[data-tip]').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!container.classList.contains('sidebar-collapsed')) return;
            tipTarget = item;
            tip.textContent = item.getAttribute('data-tip') || '';
            tip.classList.add('show');
            positionTip(item);
        });
        item.addEventListener('mouseleave', () => {
            tipTarget = null;
            tip.classList.remove('show');
        });
        item.addEventListener('focus', () => {
            if (!container.classList.contains('sidebar-collapsed')) return;
            tip.textContent = item.getAttribute('data-tip') || '';
            tip.classList.add('show');
            positionTip(item);
        });
        item.addEventListener('blur', () => tip.classList.remove('show'));
    });
})();

// ===== 样式工具条：可一键收起/展开（默认展开常驻上方）=====
(function setupStyleBar() {
    const bar = document.getElementById('styleBar');
    if (!bar) return;
    const STORAGE_KEY = 'mp_stylebar_collapsed';
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === '1') bar.classList.add('collapsed');
})();

styleButtons.forEach(btn => btn.addEventListener('click', () => setStyle(btn.dataset.style)));
colorButtons.forEach(btn => btn.addEventListener('click', () => setColor(btn.dataset.color)));
sizeButtons.forEach(btn => btn.addEventListener('click', () => setSize(btn.dataset.size)));
spacingButtons.forEach(btn => btn.addEventListener('click', () => setSpacing(btn.dataset.spacing)));
fontButtons.forEach(btn => btn.addEventListener('click', () => setFont(btn.dataset.font)));
trackingButtons.forEach(btn => btn.addEventListener('click', () => setTracking(btn.dataset.tracking)));

toolButtons.forEach(btn => {
    // 跳过独立配图按钮（有自己的处理逻辑）
    if (btn.id === 'autoIllustrateBtn') return;
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleToolAction(btn.dataset.action);
    });
});

// 独立配图按钮
const autoIllustrateBtn = document.getElementById('autoIllustrateBtn');
if (autoIllustrateBtn) {
    autoIllustrateBtn.addEventListener('mousedown', (e) => e.preventDefault());
    autoIllustrateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.autoIllustrate === 'function') {
            window.autoIllustrate();
        } else {
            showToast('配图功能加载中，请稍后重试');
        }
    });
}

// 去AI味按钮
const humanizeBtn = document.getElementById('humanizeBtn');
if (humanizeBtn) {
    humanizeBtn.addEventListener('mousedown', (e) => e.preventDefault());
    humanizeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (typeof window.humanizeArticle !== 'function') {
            showToast('功能加载中，请稍后重试');
            return;
        }
        // 从编辑框获取文章
        const editor = document.getElementById('editor');
        if (!editor || !editor.innerText.trim()) {
            showToast('编辑框为空，请先输入文章');
            return;
        }
        // 获取 markdown 源文本（优先 workflowState，其次 innerText）
        let articleText = '';
        if (window.workflowState && window.workflowState.article) {
            articleText = window.workflowState.article;
        } else {
            articleText = editor.innerText.trim();
        }
        if (!articleText || articleText.length < 100) {
            showToast('文章内容过短，无需去AI味');
            return;
        }

        const origText = humanizeBtn.textContent;
        humanizeBtn.disabled = true;
        humanizeBtn.textContent = '处理中...';

        // 状态条提示
        let statusEl = document.getElementById('humanizeStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'humanizeStatus';
            statusEl.style.cssText = 'padding:8px 14px;margin-top:8px;border-radius:6px;font-size:12px;display:none;';
            editor.parentElement.insertBefore(statusEl, editor);
        }
        const settings = (typeof getAISettings === 'function') ? getAISettings() : null;
        const willUseLLM = settings && settings.apiKey;
        statusEl.style.display = 'block';
        statusEl.style.background = '#F3E8FF';
        statusEl.style.color = '#6B21A8';
        statusEl.style.border = '1px solid #C4B5FD';
        statusEl.textContent = willUseLLM
            ? '⏳ 去AI味处理中：先本地规则清洗，再调用 LLM 深度改写...'
            : '⏳ 去AI味处理中：本地规则清洗（未配置 API Key，仅做基础清洗）...';

        try {
            const result = await window.humanizeArticle(articleText, settings);
            // 更新编辑框
            if (editor) {
                // 用 markdown 重新渲染
                if (typeof marked !== 'undefined') {
                    editor.innerHTML = marked.parse(result.text);
                } else {
                    editor.innerText = result.text;
                }
            }
            // 更新 workflowState
            if (window.workflowState) {
                window.workflowState.article = result.text;
            }
            // 显示4层处理报告
            const parts = [];
            // L1 机械修复
            parts.push(`L1机械修复：${result.autoFixes && result.autoFixes.length > 0 ? result.autoFixes.join('、') : '无'}`);
            // L2 模式检测
            if (result.analysis) {
                const a = result.analysis;
                parts.push(`L2检测：关键${a.critical.length}/重要${a.important.length}/细节${a.minor.length}`);
            }
            // L3 词汇替换
            parts.push(`L3词汇替换：${result.vocabReplaced || 0}个`);
            // L4 LLM 改写
            if (willUseLLM) {
                if (result.usedLLM) {
                    parts.push('L4 LLM改写：已完成');
                } else if (result.llmError) {
                    parts.push(`L4 LLM失败：${result.llmError}`);
                }
            }
            statusEl.style.background = '#ECFDF5';
            statusEl.style.color = '#065F46';
            statusEl.style.border = '1px solid #6EE7B7';
            statusEl.textContent = `✓ 去AI味完成 · ${parts.join(' · ')}`;
            // 在控制台输出详细报告供调试
            if (result.analysis) {
                console.log('[humanize] 详细报告：', result.analysis);
            }
            showToast('去AI味处理完成');
        } catch (e) {
            statusEl.style.background = '#FEF2F2';
            statusEl.style.color = '#991B1B';
            statusEl.style.border = '1px solid #FECACA';
            statusEl.textContent = '✗ 去AI味失败：' + e.message;
            showToast('去AI味失败：' + e.message);
        } finally {
            humanizeBtn.disabled = false;
            humanizeBtn.textContent = origText;
        }
    });
}

// 自动排版按钮（LLM 驱动：标题层级识别、引用/代码块规范、段落首字符标点修正、段落松散化）
const autoFormatBtn = document.getElementById('autoFormatBtn');
if (autoFormatBtn) {
    autoFormatBtn.addEventListener('mousedown', (e) => e.preventDefault());
    autoFormatBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (typeof window.formatArticleSmart !== 'function') {
            showToast('功能加载中，请稍后重试');
            return;
        }
        const editor = document.getElementById('editor');
        if (!editor || !editor.innerHTML.trim()) {
            showToast('编辑框为空，请先输入文章');
            return;
        }
        // 获取 markdown 源文本（优先 workflowState，其次从 innerHTML 提取）
        let articleText = '';
        if (window.workflowState && window.workflowState.article) {
            articleText = window.workflowState.article;
        } else {
            // 从 innerHTML 提取 markdown 文本（保留图片语法，兼容各种属性顺序和单双引号）
            const html = editor.innerHTML;
            articleText = html
                .replace(/<img[^>]*?src=(["'])(.*?)\1[^>]*?>/gi, (match, quote, src) => {
                    const altMatch = match.match(/alt=(["'])(.*?)\1/i);
                    const alt = altMatch ? altMatch[2] : '';
                    return `![${alt}](${src})`;
                })
                .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
                .replace(/\u3000/g, ' ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
        }
        // 检查内容是否足够（至少有文字或图片）
        const hasText = articleText.trim().length > 0;
        const hasImages = html.includes('<img');
        if (!hasText && !hasImages) {
            showToast('编辑框为空，请先输入文章');
            return;
        }
        // 纯图片内容不需要排版
        if (!hasText && hasImages) {
            showToast('仅图片内容，无需排版');
            return;
        }

        const origText = autoFormatBtn.textContent;
        autoFormatBtn.disabled = true;
        autoFormatBtn.textContent = '排版中...';

        // 状态条提示
        let statusEl = document.getElementById('humanizeStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'humanizeStatus';
            statusEl.style.cssText = 'padding:8px 14px;margin-top:8px;border-radius:6px;font-size:12px;display:none;';
            editor.parentElement.insertBefore(statusEl, editor);
        }
        const settings = (typeof getAISettings === 'function') ? getAISettings() : null;
        const willUseLLM = settings && settings.apiKey;
        statusEl.style.display = 'block';
        statusEl.style.background = '#EFF6FF';
        statusEl.style.color = '#1E40AF';
        statusEl.style.border = '1px solid #BFDBFE';
        statusEl.textContent = willUseLLM
            ? '⏳ 自动排版中：先本地智能排版，再调用 LLM 识别标题层级/规范引用代码块/修正段落首字符...'
            : '⏳ 自动排版中：本地智能排版（未配置 API Key，仅做基础排版）...';

        try {
            const result = await window.formatArticleSmart(articleText, settings);
            // 更新编辑框
            if (editor) {
                if (typeof marked !== 'undefined') {
                    editor.innerHTML = marked.parse(result.text);
                } else {
                    editor.innerText = result.text;
                }
            }
            // 更新 workflowState
            if (window.workflowState) {
                window.workflowState.article = result.text;
            }
            // 显示报告
            const parts = [];
            parts.push(`本地排版：${result.localFormatted ? '已完成' : '无'}`);
            if (willUseLLM) {
                if (result.usedLLM) {
                    const summary = result.llmSummary || 'LLM 优化完成';
                    parts.push(`LLM 优化：${summary}`);
                } else if (result.llmError) {
                    parts.push(`LLM 失败：${result.llmError}`);
                }
            }
            statusEl.style.background = '#ECFDF5';
            statusEl.style.color = '#065F46';
            statusEl.style.border = '1px solid #6EE7B7';
            statusEl.textContent = `✓ 自动排版完成 · ${parts.join(' · ')}`;
            if (typeof updatePreview === 'function') updatePreview();
            showToast('自动排版完成');
        } catch (e) {
            statusEl.style.background = '#FEF2F2';
            statusEl.style.color = '#991B1B';
            statusEl.style.border = '1px solid #FECACA';
            statusEl.textContent = '✗ 自动排版失败：' + e.message;
            showToast('自动排版失败：' + e.message);
        } finally {
            autoFormatBtn.disabled = false;
            autoFormatBtn.textContent = origText;
        }
    });
}

copyBtn.addEventListener('click', copyToClipboard);
copyHtmlBtn.addEventListener('click', copyRawHTML);
clearBtn.addEventListener('click', clearContent);
fileInput.addEventListener('change', handleFileUpload);
parseUrlBtn.addEventListener('click', parseUrl);
smartFormatBtn.addEventListener('click', async () => {
    const editor = document.getElementById('editor');
    if (!editor || !editor.innerHTML.trim()) { showToast('请先输入内容'); return; }

    const html = editor.innerHTML;
    let text = html;
    text = text.replace(/<img[^>]*?src=(["'])(.*?)\1[^>]*?>/gi, (match, quote, src) => {
        const altMatch = match.match(/alt=(["'])(.*?)\1/i);
        const alt = altMatch ? altMatch[2] : '';
        return `![${alt}](${src})`;
    });
    text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    text = text.replace(/\u3000/g, ' ').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    if (!text.trim()) { showToast('请先输入内容'); return; }

    const settings = (typeof window.getAISettings === 'function') ? window.getAISettings() : ((typeof getAISettings === 'function') ? getAISettings() : null);
    const hasAI = !!(settings && settings.apiKey);

    const origHTML = editor.innerHTML;
    const origBtnText = smartFormatBtn.querySelector('span:last-child')?.textContent || '智能排版';
    if (smartFormatBtn.querySelector('span:last-child')) {
        smartFormatBtn.querySelector('span:last-child').textContent = '排版中...';
    }
    smartFormatBtn.disabled = true;

    let statusEl = document.getElementById('formatStatus');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'formatStatus';
        statusEl.style.cssText = 'padding:8px 14px;margin-top:8px;border-radius:6px;font-size:12px;display:none;';
        editor.parentElement.insertBefore(statusEl, editor);
    }
    statusEl.style.display = 'block';
    if (hasAI) {
        statusEl.style.background = '#EFF6FF';
        statusEl.style.color = '#1E40AF';
        statusEl.style.border = '1px solid #BFDBFE';
        statusEl.textContent = '⏳ AI 智能排版中：识别标题层级、规范引用代码块、优化段落结构...';
    } else {
        statusEl.style.background = '#FFFBEB';
        statusEl.style.color = '#92400E';
        statusEl.style.border = '1px solid #FDE68A';
        statusEl.textContent = '⏳ 本地规则排版中（未配置 AI，仅做基础排版，建议配置 AI 获得更好效果）...';
    }

    try {
        let resultText;
        let stats = '';

        if (hasAI && typeof window.formatArticleSmart === 'function') {
            const result = await window.formatArticleSmart(text, settings);
            resultText = result.text;
            if (result.usedLLM) {
                stats = `AI优化：${result.llmSummary || '结构已规范化'}`;
            } else {
                stats = result.llmError ? `AI失败(${result.llmError})，使用本地排版` : '本地排版完成';
            }
        } else {
            resultText = smartFormatText(text);
            stats = '本地规则排版完成（建议配置 AI 获得更好效果）';
        }

        if (resultText) {
            if (typeof marked !== 'undefined') {
                editor.innerHTML = markdownToHTML(resultText);
            } else {
                editor.innerText = resultText;
            }
            if (window.workflowState) {
                window.workflowState.article = resultText;
            }
        }

        statusEl.style.background = '#ECFDF5';
        statusEl.style.color = '#065F46';
        statusEl.style.border = '1px solid #6EE7B7';
        statusEl.textContent = `✓ 排版完成 · ${stats}`;
        if (typeof updatePreview === 'function') updatePreview();
        showToast('自动排版完成');
        setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
    } catch (e) {
        editor.innerHTML = origHTML;
        statusEl.style.background = '#FEF2F2';
        statusEl.style.color = '#991B1B';
        statusEl.style.border = '1px solid #FECACA';
        statusEl.textContent = '✗ 排版失败：' + e.message;
        showToast('排版失败：' + e.message);
        setTimeout(() => { statusEl.style.display = 'none'; }, 8000);
    } finally {
        smartFormatBtn.disabled = false;
        if (smartFormatBtn.querySelector('span:last-child')) {
            smartFormatBtn.querySelector('span:last-child').textContent = origBtnText;
        }
    }
});
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') parseUrl(); });

const introInputs = document.querySelectorAll('.intro-input');
introInputs.forEach(input => {
    input.addEventListener('input', debouncedUpdatePreview);
});
const introEnabled = document.getElementById('introEnabled');
if (introEnabled) {
    introEnabled.addEventListener('change', debouncedUpdatePreview);
}

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); handleToolAction('bold'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); handleToolAction('italic'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleToolAction('undo'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleToolAction('redo'); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') { e.preventDefault(); handleToolAction('redo'); }
});

document.body.classList.add(`theme-${currentColor}`);
setFont(currentFont);
fillIntroDefaults();

// 示例内容
editor.innerHTML = `<h1>公众号文章标题</h1>
<p>这是一段正文内容，可以在这里输入你的文章内容。支持<strong>加粗重点</strong>和<em>斜体强调</em>，让文章更有层次感。</p>
<h2>小标题示例</h2>
<p>五种主题风格，每种都有独立的设计语言：画布背景、标题样式、引用框、列表符号、代码块、分割线各不相同。主题色会贯穿全文。</p>
<ul>
<li>极简白——渐变标题，清爽留白</li>
<li>黑金奢——金色点缀，居中斜体引用</li>
<li>科技感——青色线条，等宽字体，简洁有力</li>
<li>杂志风——宋体大字，上下线引用，编辑美学</li>
<li>清新绿——浅绿底，绿色圆点，自然清新</li>
</ul>
<blockquote>这里是一段引用内容，可以用来强调重要观点、名人名言，或者金句摘录。不同主题对引用框的处理方式完全不同。</blockquote>
<h2>代码示例</h2>
<pre><code>function hello(name) {
    console.log("Hello, " + name + "!");
    return true;
}</code></pre>
<p>行内代码也支持，比如定义一个变量 <code>const count = 42</code> 这样的形式。</p>
<p><a href="https://example.com">点击这里</a> 是一个链接示例，可以跳转到指定页面。</p>
<hr>
<p>这是分割线后的内容。段落间距、字间距、正文字号、字体族（衬线/无衬线/等宽）均可独立调节。</p>
<p><img src="https://picsum.photos/600/300" alt="示例图片"></p>
<p>图片支持粘贴和拖拽上传，会自动转换为 base64 嵌入文档中。</p>`;

syncEditorToTheme();
updatePreview();

// =============================================
// 图片生成功能
// =============================================

const imageSizes = {
    xhs: { w: 1242, h: 1656, ratio: '3/4' },
    pyq: { w: 1080, h: 1080, ratio: '1/1' },
    wb: { w: 1920, h: 1080, ratio: '16/9' },
    story: { w: 1080, h: 1920, ratio: '9/16' }
};

const imgColors = {
    emerald: { accent: '#10B981', light: '#34D399', dark: '#065f46', soft: '#ecfdf5', border: 'rgba(16,185,129,0.2)' },
    blue: { accent: '#3B82F6', light: '#60A5FA', dark: '#1e40af', soft: '#eff6ff', border: 'rgba(59,130,246,0.2)' },
    orange: { accent: '#F97316', light: '#FB923C', dark: '#9a3412', soft: '#fff7ed', border: 'rgba(249,115,22,0.2)' },
    purple: { accent: '#8B5CF6', light: '#A78BFA', dark: '#5b21b6', soft: '#f5f3ff', border: 'rgba(139,92,246,0.2)' },
    pink: { accent: '#EC4899', light: '#F472B6', dark: '#9d174d', soft: '#fdf2f8', border: 'rgba(236,72,153,0.2)' },
    black: { accent: '#1F2937', light: '#4B5563', dark: '#111827', soft: '#f3f4f6', border: 'rgba(31,41,55,0.2)' }
};

let currentImgMode = 'cover';
let currentImgSize = 'xhs';
let currentImgTpl = 'minimal';
let currentImgColor = 'emerald';
let generatedCanvases = [];
let currentPageIdx = 0;

// Tab切换（兼容顶部 .tab-btn 与左侧 .nav-item）
function switchTab(tab) {
    document.querySelectorAll('.tab-btn, .nav-item').forEach(b => {
        if (b.dataset.tab === tab) b.classList.add('active');
        else b.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(`tab-${tab}`);
    if (target) target.classList.add('active');
    // 顶部按钮上下文感知：data-tab-visible 的按钮仅在对应 tab 显示
    document.querySelectorAll('.header-actions [data-tab-visible]').forEach(el => {
        const visibleTab = el.getAttribute('data-tab-visible');
        el.style.display = (visibleTab === tab) ? '' : 'none';
    });
    // 进入创作 tab 时刷新 AI 状态横幅
    if (tab === 'create') {
        if (typeof updateCreateAIBanner === 'function') updateCreateAIBanner();
    }
    // 进入订阅/产物/设置 tab 时刷新对应面板
    if (tab === 'subscribe') refreshSubscribeDash();
    if (tab === 'products') {
        refreshProductsDash();
        if (window._productsApi && window._productsApi.renderAll) {
            try { window._productsApi.renderAll(); } catch(e) { console.warn('prod render', e); }
        }
    }
    if (tab === 'settings') refreshSettingsDash();
    // 进入信息中枢 tab 时刷新（已有数据则只重渲染，不强制重新拉取）
    if (tab === 'inbox' && window._inboxRefresh) window._inboxRefresh(false);
}
document.querySelectorAll('.tab-btn, .nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ===== 侧边栏 AI 状态指示 =====
function updateSidebarAiStatus() {
    const dot = document.getElementById('sidebarAiDot');
    const text = document.getElementById('sidebarAiText');
    if (!dot || !text) return;
    try {
        const s = getAISettings && getAISettings();
        if (s && s.apiKey) {
            dot.classList.add('ready');
            text.textContent = 'AI 已就绪';
        } else {
            dot.classList.remove('ready');
            text.textContent = 'AI 未配置';
        }
    } catch {}
}

// ===== 订阅 Dashboard =====
async function refreshSubscribeDash() {
    try {
        const api = window._subsApi;
        const subs = api ? await api.loadSubscriptions() : [];
        const subCount = document.getElementById('dashSubCount');
        const artCount = document.getElementById('dashArticleCount');
        const syncState = document.getElementById('dashSyncState');
        const list = document.getElementById('dashArticlesList');
        if (subCount) subCount.textContent = subs.length;
        const status = api ? api.getBackendStatus() : 'unknown';
        if (syncState) syncState.textContent = status === 'ok' ? '云端' : '本地';
        // 文章数：优先调后端 /api/articles，失败取本地缓存
        let arts = [];
        if (status === 'ok') {
            try {
                const r = await fetch('/api/articles?size=200');
                if (r.ok) {
                    const d = await r.json();
                    arts = d.rows || [];
                }
            } catch (e) { console.warn('articles fetch', e); }
        }
        if (arts.length === 0) {
            try { arts = JSON.parse(localStorage.getItem('wx_editor_subs_articles_cache_v1') || '[]'); } catch {}
        }
        if (artCount) artCount.textContent = arts.length;
        if (list) {
            if (arts.length === 0) {
                list.innerHTML = '<div style="padding:16px;text-align:center;color:#9CA3AF;font-size:13px;border:1px dashed #E5E7EB;border-radius:8px;">暂无文章，点"立即同步"抓取</div>';
            } else {
                list.innerHTML = arts.slice(0, 10).map(a => `
                    <div style="padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;">
                        <div style="font-size:13px;color:#1F2937;font-weight:500;margin-bottom:4px;">${(a.title||'').replace(/</g,'&lt;')}</div>
                        <div style="font-size:11px;color:#9CA3AF;">${(a.source||'')} · ${(a.pub_date||a.time||'').slice(0,16)}</div>
                    </div>`).join('');
            }
        }
    } catch (e) { console.warn('refreshSubscribeDash', e); }
}

// ===== 产物 Dashboard =====
function refreshProductsDash() {
    try {
        const drafts = (typeof getDrafts === 'function') ? getDrafts() : (JSON.parse(localStorage.getItem('wx_editor_drafts') || '[]'));
        const dc = document.getElementById('dashDraftCount');
        const wc = document.getElementById('dashWordCount');
        const list = document.getElementById('dashDraftList');
        if (dc) dc.textContent = drafts.length;
        // 当前编辑器字数
        if (wc) {
            const ed = document.getElementById('editor');
            const txt = ed ? ed.innerText : '';
            wc.textContent = txt.replace(/\s/g,'').length;
        }
        if (list) {
            if (!drafts.length) {
                list.innerHTML = '<div style="padding:16px;text-align:center;color:#9CA3AF;font-size:13px;border:1px dashed #E5E7EB;border-radius:8px;">暂无草稿</div>';
            } else {
                list.innerHTML = drafts.slice(0, 10).map((d, i) => `
                    <div style="padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;">
                        <div style="font-size:13px;color:#1F2937;font-weight:500;margin-bottom:4px;">${(d.title||d.name||'草稿'+(i+1)).replace(/</g,'&lt;')}</div>
                        <div style="font-size:11px;color:#9CA3AF;">${(d.time||d.createdAt||'')} · ${((d.content||'').replace(/\s/g,'').length)}字</div>
                    </div>`).join('');
            }
        }
    } catch (e) { console.warn('refreshProductsDash', e); }
}

// ===== 设置 Dashboard =====
async function refreshSettingsDash() {
    const ov = document.getElementById('dashSettingsOverview');
    if (ov) {
        try {
            const s = getAISettings && getAISettings();
            const rows = [];
            rows.push(`<div>AI 模型：<b>${s && s.provider ? s.provider : '未配置'}</b></div>`);
            rows.push(`<div>API Key：<b>${s && s.apiKey ? '已配置（' + s.apiKey.slice(0,4) + '...' + s.apiKey.slice(-2) + '）' : '未配置'}</b></div>`);
            const subs = window._subsApi ? await window._subsApi.loadSubscriptions() : [];
            rows.push(`<div>已订阅公众号：<b>${subs.length}</b> 个</div>`);
            const st = window._subsApi ? window._subsApi.getBackendStatus() : 'unknown';
            rows.push(`<div>存储模式：<b>${st === 'ok' ? '云端（D1）' : '本地（localStorage）'}</b></div>`);
            ov.innerHTML = rows.join('');
        } catch (e) { ov.textContent = '配置读取失败：' + e.message; }
    }
    // 渲染主题选择器（独立入口，不依赖 Ctrl+K）
    renderThemePicker();
}

// 主题选择器渲染（设置 tab 独立入口）
function renderThemePicker() {
    const grid = document.getElementById('themePickerGrid');
    if (!grid) return;
    const THEMES = [
        { key: 'theme-emerald', name: '翡翠绿', color: '#10B981' },
        { key: 'theme-blue',    name: '天空蓝', color: '#3B82F6' },
        { key: 'theme-orange',   name: '活力橙', color: '#F97316' },
        { key: 'theme-purple',   name: '梦幻紫', color: '#8B5CF6' }
    ];
    let current = 'theme-emerald';
    try { current = localStorage.getItem('wx_theme_v5') || 'theme-emerald'; } catch {}
    grid.innerHTML = THEMES.map(t => `
        <div class="theme-picker-item ${t.key === current ? 'active' : ''}" data-theme="${t.key}" type="button">
            <div class="theme-picker-swatch" style="background:linear-gradient(135deg, ${t.color}, ${t.color}cc);"></div>
            <div class="theme-picker-name">${t.name}</div>
        </div>`).join('');
    grid.querySelectorAll('.theme-picker-item').forEach(el => {
        el.addEventListener('click', () => {
            const key = el.dataset.theme;
            // 清除所有 theme-* class（含排版 tab 的 brown/black/beige），避免叠加
            document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
            document.body.classList.add(key);
            try { localStorage.setItem('wx_theme_v5', key); } catch {}
            // 同步更新命令面板的 cycleTheme 状态
            grid.querySelectorAll('.theme-picker-item').forEach(x => x.classList.remove('active'));
            el.classList.add('active');
            if (window._showBanner) window._showBanner(`🎨 主题已切换为 ${key.replace('theme-','')}`, 2000);
        });
    });
}

// 绑定 dashboard 按钮到既有 modal/函数
function bindDashButtons() {
    const $ = id => document.getElementById(id);
    $('dashManageSubsBtn') && $('dashManageSubsBtn').addEventListener('click', () => {
        const m = $('subsModal'); if (m) { m.style.display = 'flex'; if (window._subsApi) window._subsApi.renderSubsList(); }
    });
    $('dashSyncBtn') && $('dashSyncBtn').addEventListener('click', async (e) => {
        const b = e.currentTarget; b.disabled=true; b.textContent='⏳ 同步中...';
        const t0 = Date.now();
        try {
            let r;
            if (window._dashSync) {
                r = await window._dashSync();
            } else {
                // _dashSync 尚未就绪：尝试直接调 _subsApi.syncAll，否则本地缓存兜底
                if (window._subsApi && window._subsApi.syncAll) {
                    r = await window._subsApi.syncAll();
                } else {
                    await new Promise(res => setTimeout(res, 600));
                    r = { synced: 'local', total: 0 };
                    showToast('本地模式：后端未就绪，已读取缓存');
                }
            }
            refreshSubscribeDash();
        } catch(err){ showToast('同步失败：'+err.message); }
        finally {
            // 保证 loading 至少显示 600ms，让用户感知到反馈
            const dt = Date.now() - t0;
            if (dt < 600) await new Promise(res => setTimeout(res, 600 - dt));
            b.disabled=false; b.textContent='🔄 立即同步';
        }
    });
    $('dashGoCreateBtn') && $('dashGoCreateBtn').addEventListener('click', () => switchTab('create'));
    $('dashSaveDraftBtn') && $('dashSaveDraftBtn').addEventListener('click', () => { const b=$('draftBtn'); if(b) b.click(); showToast('已触发保存草稿'); });
    $('dashDownloadMdBtn') && $('dashDownloadMdBtn').addEventListener('click', () => { const b=$('downloadMdBtn'); if(b) b.click(); });
    $('dashManageDraftBtn') && $('dashManageDraftBtn').addEventListener('click', () => { const m=$('draftModal'); if(m) m.style.display='flex'; });
    $('dashAiSettingsBtn') && $('dashAiSettingsBtn').addEventListener('click', () => { const b=$('aiSettingsBtn'); if(b) b.click(); });
    $('dashThemeBtn') && $('dashThemeBtn').addEventListener('click', () => { const b=$('aiSettingsBtn'); if(b) b.click(); });
}
bindDashButtons();
updateSidebarAiStatus();
// 定期刷新侧边栏状态（AI 设置变化后）
setInterval(updateSidebarAiStatus, 3000);

// 模式切换
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentImgMode = btn.dataset.mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (currentImgMode === 'cover') {
            document.getElementById('inputTitle').textContent = '输入标题';
            document.getElementById('inputHint').textContent = '建议20字以内';
            document.getElementById('imageInput').placeholder = '在这里输入标题或短句...';
        } else if (currentImgMode === 'article') {
            document.getElementById('inputTitle').textContent = '输入文章内容';
            document.getElementById('inputHint').textContent = '支持Markdown，自动分页';
            document.getElementById('imageInput').placeholder = '在这里输入文章内容...\n\n可以用Markdown语法：\n# 大标题\n## 小标题\n- 列表项\n> 引用内容\n**加粗文字**';
        }
        // 显示/隐藏文章配图工作区
        const aiPanel = document.getElementById('articleIllustrationPanel');
        const ccPanel = document.getElementById('contentCardsPanel');
        const legacyInput = document.querySelector('.image-input-section');
        const legacyPreview = document.querySelector('.image-preview-section');
        if (currentImgMode === 'article-illustration') {
            if (aiPanel) aiPanel.style.display = 'flex';
            if (ccPanel) ccPanel.style.display = 'none';
            if (legacyInput) legacyInput.style.display = 'none';
            if (legacyPreview) legacyPreview.style.display = 'none';
            // 加载 workflowState 的文章信息
            if (window.workflowState && window.workflowState.article) {
                if (typeof window.updateArticleIllustrationPanel === 'function') {
                    window.updateArticleIllustrationPanel();
                }
            }
        } else if (currentImgMode === 'content-cards') {
            if (ccPanel) ccPanel.style.display = 'flex';
            if (aiPanel) aiPanel.style.display = 'none';
            if (legacyInput) legacyInput.style.display = 'none';
            if (legacyPreview) legacyPreview.style.display = 'none';
        } else {
            if (aiPanel) aiPanel.style.display = 'none';
            if (ccPanel) ccPanel.style.display = 'none';
            if (legacyInput) legacyInput.style.display = '';
            if (legacyPreview) legacyPreview.style.display = '';
        }
        clearGeneratedImages();
    });
});

// 尺寸切换
document.querySelectorAll('.size-card').forEach(btn => {
    btn.addEventListener('click', () => {
        currentImgSize = btn.dataset.size;
        document.querySelectorAll('.size-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (generatedCanvases.length > 0) {
            generateImages();
        }
    });
});

// 模板切换
document.querySelectorAll('.tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentImgTpl = btn.dataset.tpl;
        document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (generatedCanvases.length > 0) {
            generateImages();
        }
    });
});

// 颜色切换
document.querySelectorAll('[data-img-color]').forEach(btn => {
    btn.addEventListener('click', () => {
        currentImgColor = btn.dataset.imgColor;
        document.querySelectorAll('[data-img-color]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (generatedCanvases.length > 0) {
            generateImages();
        }
    });
});

// 清空
document.getElementById('clearImageBtn').addEventListener('click', () => {
    document.getElementById('imageInput').value = '';
    clearGeneratedImages();
});

// 生成按钮
document.getElementById('generateBtn').addEventListener('click', generateImages);

// 下载单张
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (generatedCanvases.length === 0) {
        showToast('请先生成图片');
        return;
    }
    downloadCanvas(generatedCanvases[currentPageIdx], `排版_${currentPageIdx + 1}.png`);
});

// 打包下载
document.getElementById('downloadAllBtn').addEventListener('click', async () => {
    if (generatedCanvases.length === 0) {
        showToast('请先生成图片');
        return;
    }
    if (generatedCanvases.length === 1) {
        downloadCanvas(generatedCanvases[0], '排版图片.png');
        return;
    }
    showToast('正在打包...');
    const zip = new JSZip();
    for (let i = 0; i < generatedCanvases.length; i++) {
        const dataUrl = generatedCanvases[i].toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        zip.file(`图片_${i + 1}.png`, base64, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, '排版图片打包.zip');
    showToast('打包完成');
});

// 翻页
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPageIdx > 0) {
        currentPageIdx--;
        updateImagePreview();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPageIdx < generatedCanvases.length - 1) {
        currentPageIdx++;
        updateImagePreview();
    }
});

function clearGeneratedImages() {
    generatedCanvases = [];
    currentPageIdx = 0;
    const wrap = document.getElementById('imagePreviewWrap');
    wrap.innerHTML = `<div class="image-placeholder">
        <div class="placeholder-icon">🖼</div>
        <div class="placeholder-text">输入内容后点击生成图片</div>
    </div>`;
    document.getElementById('pageInfo').style.display = 'none';
    document.getElementById('pageNav').style.display = 'none';
    document.getElementById('downloadAllBtn').style.display = 'none';
}

function updateImagePreview() {
    const wrap = document.getElementById('imagePreviewWrap');
    if (generatedCanvases.length === 0) return;
    const canvas = generatedCanvases[currentPageIdx];
    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    img.style.borderRadius = '8px';
    wrap.appendChild(img);
    document.getElementById('pageInfo').textContent = `第 ${currentPageIdx + 1} / ${generatedCanvases.length} 张`;
    document.getElementById('pageInfo').style.display = generatedCanvases.length > 1 ? 'inline-block' : 'none';
    document.getElementById('pageNav').style.display = generatedCanvases.length > 1 ? 'flex' : 'none';
    document.getElementById('downloadAllBtn').style.display = generatedCanvases.length > 1 ? 'inline-flex' : 'none';
    document.getElementById('prevPage').disabled = currentPageIdx === 0;
    document.getElementById('nextPage').disabled = currentPageIdx === generatedCanvases.length - 1;
}

function downloadCanvas(canvas, filename) {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

function getColorVars() {
    const c = imgColors[currentImgColor];
    return {
        '--tpl-accent': c.accent,
        '--tpl-accent-light': c.light,
        '--tpl-accent-dark': c.dark,
        '--tpl-bg-soft': c.soft,
        '--tpl-border': c.border
    };
}

// 生成图片
async function generateImages() {
    const text = document.getElementById('imageInput').value.trim();
    if (!text) {
        showToast('请输入内容');
        return;
    }
    showToast('生成中...');
    generatedCanvases = [];
    currentPageIdx = 0;
    const size = imageSizes[currentImgSize];
    const colorVars = getColorVars();
    if (currentImgMode === 'cover') {
        const canvas = await generateCoverImage(text, size, colorVars);
        generatedCanvases.push(canvas);
    } else {
        const pages = paginateArticle(text, size);
        for (let i = 0; i < pages.length; i++) {
            const canvas = await generateArticleImage(pages[i], size, colorVars, i + 1, pages.length);
            generatedCanvases.push(canvas);
        }
    }
    updateImagePreview();
    showToast('生成成功！');
}

// 封面图生成
async function generateCoverImage(text, size, colorVars) {
    const div = document.createElement('div');
    div.className = `cover-tpl cover-${currentImgTpl}`;
    div.style.width = size.w + 'px';
    div.style.height = size.h + 'px';
    Object.entries(colorVars).forEach(([k, v]) => div.style.setProperty(k, v));
    const titleDiv = document.createElement('div');
    titleDiv.className = 'cover-title';
    titleDiv.textContent = text;
    div.appendChild(titleDiv);
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.top = '0';
    document.body.appendChild(div);
    const canvas = await html2canvas(div, {
        width: size.w,
        height: size.h,
        scale: 1,
        backgroundColor: null,
        useCORS: true
    });
    document.body.removeChild(div);
    return canvas;
}

// 文章分页
function paginateArticle(text, size) {
    const lines = text.split('\n').filter(l => l.trim());
    const pages = [];
    let currentPage = { title: null, paragraphs: [] };
    let charCount = 0;
    const maxChars = Math.floor((size.h - 200) / 34);
    if (lines.length > 0 && (lines[0].startsWith('# ') || lines[0].startsWith('## '))) {
        currentPage.title = lines[0].replace(/^#+\s*/, '');
        lines.shift();
    }
    for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        const lineChars = cleanLine.length;
        if (charCount + lineChars > maxChars && currentPage.paragraphs.length > 0) {
            pages.push(currentPage);
            currentPage = { title: null, paragraphs: [] };
            charCount = 0;
        }
        currentPage.paragraphs.push(cleanLine);
        charCount += lineChars + 2;
    }
    if (currentPage.paragraphs.length > 0 || currentPage.title) {
        pages.push(currentPage);
    }
    return pages;
}

// 文章图生成
async function generateArticleImage(pageData, size, colorVars, pageNum, totalPages) {
    const div = document.createElement('div');
    div.className = `article-tpl article-${currentImgTpl}`;
    div.style.width = size.w + 'px';
    div.style.minHeight = size.h + 'px';
    Object.entries(colorVars).forEach(([k, v]) => div.style.setProperty(k, v));
    if (pageData.title) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'article-title';
        titleDiv.textContent = pageData.title;
        div.appendChild(titleDiv);
    }
    for (const para of pageData.paragraphs) {
        const p = document.createElement('div');
        p.className = 'article-paragraph';
        p.innerHTML = formatParagraph(para);
        div.appendChild(p);
    }
    if (totalPages > 1) {
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        footer.textContent = `${pageNum} / ${totalPages}`;
        div.appendChild(footer);
    }
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.top = '0';
    document.body.appendChild(div);
    const canvas = await html2canvas(div, {
        width: size.w,
        height: size.h,
        scale: 1,
        backgroundColor: null,
        useCORS: true
    });
    document.body.removeChild(div);
    return canvas;
}

function formatParagraph(text) {
    let html = text;
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--tpl-accent-dark); font-weight: 700;">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em style="color: var(--tpl-accent);">$1</em>');
    if (/^[-*•]\s+/.test(html)) {
        html = html.replace(/^[-*•]\s+/, '<span style="color: var(--tpl-accent); margin-right: 8px;">●</span>');
    }
    if (/^>\s+/.test(html)) {
        html = `<div style="border-left: 4px solid var(--tpl-accent); padding-left: 16px; color: var(--tpl-accent-dark); font-style: italic;">${html.replace(/^>\s+/, '')}</div>`;
    }
    if (/^#+\s+/.test(html)) {
        html = `<div style="font-size: 22px; font-weight: 700; margin: 20px 0 12px; color: var(--tpl-accent-dark);">${html.replace(/^#+\s+/, '')}</div>`;
    }
    return html;
}

// ===== AI 一键工作流（抓热点 → 写文章 → 规划配图 → 生成图片 → 排版）=====
// 用 IIFE 包裹避免污染全局，内部可直接访问外部的 editor / markdownToHTML / smartFormatText / updatePreview / showToast
(function () {
    'use strict';

    // ===== LLM 提供商预设配置表 =====
    // editable: true 表示该 provider 使用 OpenAI 兼容格式，允许用户在 UI 中修改 baseUrl/model
    //   （例如腾讯云 Maas 下可切换 glm-5.2 / deepseek-v3 / claude 等模型）
    const LLM_PROVIDERS = {
        deepseek: {
            name: 'DeepSeek（深度求索）',
            baseUrl: 'https://api.deepseek.com/v1/chat/completions',
            model: 'deepseek-chat',
            helpText: '到 platform.deepseek.com 创建 API Key',
            helpUrl: 'https://platform.deepseek.com/api_keys'
        },
        zhipu: {
            name: '智谱 GLM-4',
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4',
            helpText: '到 open.bigmodel.cn 创建 API Key',
            helpUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
        },
        tencent: {
            name: '腾讯云 Maas（GLM-5.2 等）',
            baseUrl: 'https://tokenhub.tencentmaas.com/v1/chat/completions',
            model: 'glm-5.2',
            helpText: '到腾讯云 Maas 控制台获取 Token Hub API Key',
            helpUrl: 'https://console.cloud.tencent.com/maas',
            editable: true
        },
        doubao: {
            name: '字节豆包 Doubao（火山方舟）',
            baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            model: 'doubao-pro-32k',
            helpText: '到火山引擎控制台创建 API Key（模型需在方舟里开通）',
            helpUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement',
            editable: true
        },
        qwen: {
            name: '通义千问 Qwen',
            baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            model: 'qwen-plus',
            helpText: '到 dashscope.aliyun.com 创建 API Key',
            helpUrl: 'https://dashscope.console.aliyun.com/apiKey'
        },
        yi: {
            name: '零一万物 Yi',
            baseUrl: 'https://api.lingyiwanwu.com/v1/chat/completions',
            model: 'yi-large',
            helpText: '到 platform.lingyiwanwu.com 创建 API Key',
            helpUrl: 'https://platform.lingyiwanwu.com/apikeys',
            editable: true
        },
        baichuan: {
            name: '百川 Baichuan',
            baseUrl: 'https://api.baichuan-ai.com/v1/chat/completions',
            model: 'Baichuan2-53B',
            helpText: '到 platform.baichuan-ai.com 创建 API Key',
            helpUrl: 'https://platform.baichuan-ai.com/console/apikey',
            editable: true
        },
        minimax: {
            name: 'MiniMax',
            baseUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
            model: 'abab6.5-chat',
            helpText: '到 platform.minimaxi.com 创建 API Key',
            helpUrl: 'https://platform.minimaxi.com/',
            editable: true
        },
        moonshot: {
            name: 'Moonshot Kimi',
            baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
            model: 'moonshot-v1-8k',
            helpText: '到 platform.moonshot.cn 创建 API Key',
            helpUrl: 'https://platform.moonshot.cn/console/api-keys'
        },
        openai: {
            name: 'OpenAI GPT-4o',
            baseUrl: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o',
            helpText: '到 platform.openai.com 创建 API Key',
            helpUrl: 'https://platform.openai.com/api-keys'
        },
        custom: {
            name: '自定义',
            baseUrl: '',
            model: '',
            helpText: '填写兼容 OpenAI 格式的 API 地址和模型名',
            helpUrl: '',
            editable: true
        }
    };

    // ===== 1. 设置管理：从 localStorage 读取/保存 =====
    // API Key 用 base64 编码存储（btoa），避免明文出现在 localStorage / devtools
    // 不是真正加密，但能防止"一眼可见"和被自动扫描工具抓取
    // 配合过期时间戳：默认 30 天后自动清除
    const API_KEY_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

    // base64 编解码（处理 Unicode，避免 btoa 中文报错）
    function encodeKey(plain) {
        if (!plain) return '';
        try {
            // 先 encodeURIComponent 处理 Unicode，再 btoa
            return btoa(encodeURIComponent(plain));
        } catch (e) {
            // 极端情况下退化为明文
            return plain;
        }
    }
    function decodeKey(encoded) {
        if (!encoded) return '';
        try {
            // 优先按 base64 解码
            const decoded = decodeURIComponent(atob(encoded));
            return decoded;
        } catch (e) {
            // 解码失败说明不是 base64，可能是历史明文存储，直接返回
            return encoded;
        }
    }
    function isKeyExpired(ts) {
        if (!ts) return false;
        const now = Date.now();
        return (now - ts) > API_KEY_TTL_MS;
    }

    function getAISettings() {
        // 兼容：先查新版 wx_editor_ai_settings_v2（加密 + TTL），再查旧版明文
        let apiKey = '';
        let savedAt = 0;
        try {
            const raw = localStorage.getItem('wx_editor_ai_settings_v2');
            if (raw) {
                const obj = JSON.parse(raw);
                apiKey = decodeKey(obj.apiKey || '');
                savedAt = obj.savedAt || 0;
            }
        } catch {}
        // 过期清理：超过 TTL 直接清掉
        if (savedAt && isKeyExpired(savedAt)) {
            apiKey = '';
            try { localStorage.removeItem('wx_editor_ai_settings_v2'); } catch {}
        }
        // 旧版明文兼容（一次性迁移：读出后写回 v2 再删除旧 key，避免下次再被误读）
        if (!apiKey) {
            const legacy = localStorage.getItem('llm_api_key');
            if (legacy) {
                apiKey = legacy;
                try {
                    localStorage.setItem('wx_editor_ai_settings_v2', JSON.stringify({
                        apiKey: encodeKey(legacy),
                        savedAt: Date.now()
                    }));
                    localStorage.removeItem('llm_api_key');
                } catch {}
            }
        }
        return {
            provider: localStorage.getItem('llm_provider') || 'deepseek',
            apiKey: apiKey,
            baseUrl: localStorage.getItem('llm_base_url') || '',
            model: localStorage.getItem('llm_model') || '',
            imageCount: parseInt(localStorage.getItem('ai_image_count') || '4', 10),
            // 图片生成 API 配置
            imageProvider: localStorage.getItem('image_provider') || 'pollinations',
            imageApiKey: decodeKey(localStorage.getItem('image_api_key_enc') || ''),
            imageBaseUrl: localStorage.getItem('image_base_url') || '',
            imageModel: localStorage.getItem('image_model') || ''
        };
    }
    function saveAISettings(provider, apiKey, imageCount, baseUrl, model) {
        localStorage.setItem('llm_provider', provider);
        // API Key 加密存储 + 时间戳
        try {
            localStorage.setItem('wx_editor_ai_settings_v2', JSON.stringify({
                apiKey: encodeKey(apiKey || ''),
                savedAt: Date.now()
            }));
            // 删除可能的旧版明文
            localStorage.removeItem('llm_api_key');
        } catch (e) {
            console.warn('API Key 加密存储失败，退回明文:', e);
            localStorage.setItem('llm_api_key', apiKey);
        }
        if (baseUrl !== undefined) localStorage.setItem('llm_base_url', baseUrl);
        if (model !== undefined) localStorage.setItem('llm_model', model);
        localStorage.setItem('ai_image_count', String(imageCount));
    }

    // 图片生成 API 配置的读写
    function getImageApiSettings() {
        return {
            provider: localStorage.getItem('image_provider') || 'pollinations',
            apiKey: decodeKey(localStorage.getItem('image_api_key_enc') || ''),
            baseUrl: localStorage.getItem('image_base_url') || '',
            model: localStorage.getItem('image_model') || ''
        };
    }
    function saveImageApiSettings(provider, apiKey, baseUrl, model) {
        localStorage.setItem('image_provider', provider);
        // 图片 API Key 也加密存储
        try {
            localStorage.setItem('image_api_key_enc', encodeKey(apiKey || ''));
        } catch (e) {
            console.warn('图片 API Key 加密存储失败:', e);
            localStorage.setItem('image_api_key', apiKey);
        }
        if (baseUrl !== undefined) localStorage.setItem('image_base_url', baseUrl);
        if (model !== undefined) localStorage.setItem('image_model', model);
    }

    // 缓存 DOM 节点
    const aiWorkflowBtn = document.getElementById('aiWorkflowBtn');
    const aiSettingsBtn = document.getElementById('aiSettingsBtn');
    // Tab1 创作相关
    const createTopicInput = document.getElementById('createTopicInput');
    const hotTopicsList = document.getElementById('hotTopicsList');
    const createWordCount = document.getElementById('createWordCount');
    const createDirectionSel = document.getElementById('createDirection');
    const createStyleSel = document.getElementById('createStyle');
    const createSectionsSel = document.getElementById('createSections');
    const createGenerateBtn = document.getElementById('createGenerateBtn');
    const createRegenerateBtn = document.getElementById('createRegenerateBtn');
    const createStatus = document.getElementById('createStatus');
    const createStatusText = document.getElementById('createStatusText');
    const createArticleSection = document.getElementById('createArticleSection');
    const createArticleArea = document.getElementById('createArticleArea');
    const createWordNum = document.getElementById('createWordNum');
    const createEmptyState = document.getElementById('createEmptyState');
    const createCopyBtn = document.getElementById('createCopyBtn');
    const createGotoEditorBtn = document.getElementById('createGotoEditorBtn');
    const aiSettingsCancel = document.getElementById('aiSettingsCancel');
    const aiSettingsSave = document.getElementById('aiSettingsSave');
    const aiSettingsModal = document.getElementById('aiSettingsModal');
    const llmProviderSelect = document.getElementById('llmProviderSelect');
    const llmApiKeyInput = document.getElementById('llmApiKeyInput');
    const llmHelpText = document.getElementById('llmHelpText');
    const customProviderFields = document.getElementById('customProviderFields');
    const llmBaseUrlInput = document.getElementById('llmBaseUrlInput');
    const llmModelInput = document.getElementById('llmModelInput');
    const imageCountInput = document.getElementById('imageCountInput');
    // 图片生成 API 相关元素
    const imageProviderSelect = document.getElementById('imageProviderSelect');
    const imageApiFields = document.getElementById('imageApiFields');
    const imageApiKeyInput = document.getElementById('imageApiKeyInput');
    const imageApiHelpText = document.getElementById('imageApiHelpText');
    const imageBaseUrlInput = document.getElementById('imageBaseUrlInput');
    const imageModelInput = document.getElementById('imageModelInput');
    // 测试连接按钮
    const llmTestBtn = document.getElementById('llmTestBtn');
    const llmTestResult = document.getElementById('llmTestResult');
    const imageTestBtn = document.getElementById('imageTestBtn');
    const imageTestResult = document.getElementById('imageTestResult');
    // 模型刷新按钮
    const refreshLLMModelsBtn = document.getElementById('refreshLLMModelsBtn');
    const llmModelList = document.getElementById('llmModelList');
    const refreshImageModelsBtn = document.getElementById('refreshImageModelsBtn');
    const imageModelList = document.getElementById('imageModelList');

    // ===== 图片生成 API 预设配置表 =====
    // 与文章 LLM 不同：图片生成 API 调用格式各厂商差异较大，需按 provider 分别处理
    const IMAGE_PROVIDERS = {
        pollinations: {
            name: '免费方案（Pollinations.ai）',
            helpText: '无需 API Key，海外免费服务，速度较慢',
            helpUrl: 'https://pollinations.ai',
            needsApiKey: false
        },
        zhipu: {
            name: '智谱 CogView-3',
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/images/generations',
            model: 'cogview-3',
            helpText: '到 open.bigmodel.cn 创建 API Key（与 GLM-4 共用）',
            helpUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
            needsApiKey: true,
            // 智谱图片 API 返回 url，需要再下载转 data URI
            responseFormat: 'url'
        },
        dashscope: {
            name: '通义万相（阿里 DashScope）',
            baseUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            model: 'wanx-v1',
            helpText: '到 dashscope.aliyun.com 创建 API Key（与 Qwen 共用）',
            helpUrl: 'https://dashscope.console.aliyun.com/apiKey',
            needsApiKey: true,
            // 通义万相是异步 API：先 POST 拿 task_id，再轮询结果
            responseFormat: 'async'
        },
        dalle: {
            name: 'OpenAI DALL-E 3',
            baseUrl: 'https://api.openai.com/v1/images/generations',
            model: 'dall-e-3',
            helpText: '到 platform.openai.com 创建 API Key',
            helpUrl: 'https://platform.openai.com/api-keys',
            needsApiKey: true,
            responseFormat: 'url'
        },
        tencent: {
            name: '腾讯云 TokenHub（混元文生图）',
            baseUrl: 'https://tokenhub.tencentmaas.com/v1/api/image/submit',
            queryUrl: 'https://tokenhub.tencentmaas.com/v1/api/image/query',
            model: 'hy-image-v3.0',
            helpText: '到腾讯云 TokenHub 控制台创建 API Key（与文章 LLM 共用）',
            helpUrl: 'https://console.cloud.tencent.com/maas',
            needsApiKey: true,
            responseFormat: 'async_tencent'
        },
        volcengine: {
            name: '火山引擎 Seedream（豆包文生图）',
            baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
            model: 'doubao-seedream-4-5-251128',
            helpText: '到火山方舟控制台创建 API Key，支持 doubao-seedream-4.5/4.0/3.0 等模型',
            helpUrl: 'https://console.volcengine.com/ark',
            needsApiKey: true,
            responseFormat: 'url'
        },
        custom_image: {
            name: '自定义',
            baseUrl: '',
            model: '',
            helpText: '填写兼容 OpenAI 图片生成 API 的地址',
            helpUrl: '',
            needsApiKey: true,
            responseFormat: 'url',
            editable: true
        }
    };

    // ===== 2. 设置弹窗交互 =====
    // 切换 provider 时更新帮助文本和自定义字段显隐
    function updateProviderUI(forceProvider) {
        const provider = forceProvider || llmProviderSelect.value;
        const config = LLM_PROVIDERS[provider];
        if (!config) return;
        // 更新帮助文本
        if (llmHelpText) {
            if (config.helpUrl) {
                llmHelpText.innerHTML = `${config.helpText} → <a href="${config.helpUrl}" target="_blank" style="color:#3B82F6;">点击创建</a>`;
            } else {
                llmHelpText.textContent = config.helpText;
            }
        }
        // editable provider（腾讯云/豆包/零一/百川/MiniMax/custom）显示 baseUrl/model 输入框
        if (customProviderFields) {
            const isEditable = !!(config.editable || provider === 'custom');
            customProviderFields.style.display = isEditable ? 'block' : 'none';
            // 用 dataset.provider 跟踪输入框当前值对应的 provider
            // 切换到新 provider 时才覆盖默认值，避免覆盖用户手动改的值
            const currentTag = llmBaseUrlInput && llmBaseUrlInput.dataset.provider;
            if (isEditable && currentTag !== provider) {
                if (llmBaseUrlInput) {
                    llmBaseUrlInput.value = config.baseUrl || '';
                    llmBaseUrlInput.dataset.provider = provider;
                }
                if (llmModelInput) {
                    llmModelInput.value = config.model || '';
                    llmModelInput.dataset.provider = provider;
                }
            }
        }
    }
    if (llmProviderSelect) {
        llmProviderSelect.addEventListener('change', () => updateProviderUI());
    }

    // ===== 3. 进度面板更新 =====
    function updateAIStatus(status, steps = '') {
        const panel = document.getElementById('aiWorkflowPanel');
        if (panel) panel.style.display = 'block';
        const statusEl = document.getElementById('aiWorkflowStatus');
        if (statusEl) statusEl.textContent = status;
        const stepsEl = document.getElementById('aiWorkflowSteps');
        if (stepsEl) stepsEl.textContent = steps;
    }
    function showAISpinner(show) {
        const spinner = document.getElementById('aiWorkflowSpinner');
        if (spinner) spinner.style.display = show ? 'inline' : 'none';
    }

    // ===== 4. 抓热点（多源聚合 + 多次重试 + 失败兜底）=====
    // vvhan 偶发 ERR_CONNECTION_CLOSED，加入备用源和重试
    async function fetchHotTopics() {
        const fallback = [
            'AI 最新进展',
            '科技行业动态',
            '生活感悟',
            '职场成长',
            '情感故事',
            '数字时代的阅读',
            '城市与自然',
            '慢生活',
            '记忆中的味道',
            '夜晚的情绪'
        ];

        // 源 1：vvhan 微博热搜（带重试）
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 8000);
                const resp = await fetch('https://api.vvhan.com/api/hotlist/wbHot', {
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                if (data && Array.isArray(data.data) && data.data.length > 0) {
                    return data.data.slice(0, 10)
                        .map(item => item.name || item.title)
                        .filter(Boolean);
                }
            } catch (e) {
                console.warn(`热搜抓取失败 (尝试 ${attempt + 1}/3):`, e.message);
                if (attempt < 2) await new Promise(r => setTimeout(r, 500));
            }
        }

        // 源 2：备用源（如果有其他免费热搜 API 可加在这里）
        // 暂无稳定备用源，直接用 fallback 话题

        console.warn('所有热搜源失败，使用默认话题');
        return fallback;
    }

    // ===== 5. 调用 LLM（根据 provider 选择不同 base URL 和 model）=====
    async function callLLM(prompt, settings) {
        const config = LLM_PROVIDERS[settings.provider] || LLM_PROVIDERS.deepseek;
        // editable provider（腾讯云/豆包/零一/百川/MiniMax/custom）使用用户在 UI 中填的 baseUrl/model
        // 非 editable 的预设 provider 用 config 默认值
        const baseUrl = (config.editable && settings.baseUrl) ? settings.baseUrl : config.baseUrl;
        const model = (config.editable && settings.model) ? settings.model : config.model;

        if (!baseUrl || !model) {
            throw new Error('请先在设置中配置 API Base URL 和模型名称');
        }

        // 清洗 API Key：去除首尾空白、全角空格、零宽字符，只保留可打印 ASCII
        // fetch headers 不允许非 ISO-8859-1 字符，否则报 "String contains non ISO-8859-1 code point"
        let apiKey = (settings.apiKey || '').trim();
        apiKey = apiKey.replace(/[\u3000\u200B\u200C\u200D\uFEFF]/g, ''); // 去全角空格/零宽字符
        if (!/^[\x20-\x7E]*$/.test(apiKey)) {
            // 含有非 ASCII 字符，尝试保留 ASCII 部分
            const cleaned = apiKey.replace(/[^\x20-\x7E]/g, '');
            console.warn('API Key 含非 ASCII 字符，已自动清洗。原始长度:', apiKey.length, '清洗后:', cleaned.length);
            apiKey = cleaned;
        }
        if (!apiKey) {
            throw new Error('API Key 无效或为空，请在设置中检查（可能误粘贴了中文/全角字符）');
        }

        const resp = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                // 支持传入 system prompt（字符串则视为纯 user 消息；对象 {system, user} 拆为两条）
                messages: (typeof prompt === 'object' && prompt !== null && prompt.system)
                    ? [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }]
                    : [{ role: 'user', content: String(prompt) }],
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error(`LLM 调用失败 (${resp.status}): ${errText.substring(0, 200)}`);
        }
        const data = await resp.json();
        // 防御：API 返回异常格式时给清晰错误（避免 "Cannot read properties of null (reading 'length')"）
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            let errInfo = '未知响应';
            if (data && data.error) {
                errInfo = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            } else if (data) {
                errInfo = JSON.stringify(data).substring(0, 300);
            }
            throw new Error(`LLM 返回格式异常（无 choices）: ${errInfo.substring(0, 200)}`);
        }
        const msg = data.choices[0].message || {};
        // 兼容多种返回格式：
        // 1. content 是字符串（标准 OpenAI 格式）→ 直接用
        // 2. content 是数组（OpenAI vision 格式 [{type:"text", text:"..."}]）→ 拼接文本
        // 3. content 是 null（推理模型如 deepseek-r1，只输出 reasoning_content 思考链）→ 不回退，返回空
        //    原因：reasoning_content 是 CoT 思考过程，不是文章正文，回退会导致 CoT 泄露到前台
        let content = msg.content;
        if (content === null || content === undefined) {
            // 推理模型只输出思考过程、未输出正文
            if (msg.reasoning_content) {
                console.warn('[callLLM] 模型只返回了 reasoning_content（思考过程），未输出正文 content。可能是推理模型（如 deepseek-r1），建议使用非推理模型（如 deepseek-chat）');
            }
            content = '';
        }
        if (Array.isArray(content)) {
            // vision 格式：拼接所有 text 段
            content = content.filter(c => c && c.type === 'text').map(c => c.text).join('');
        }
        if (typeof content !== 'string') {
            content = String(content || '');
        }
        // 过滤 prompt 泄露：某些模型会回显 prompt 内容（保守过滤，不删正常段落）
        content = stripPromptLeakage(content);
        return content;
    }

    // 检测并过滤 LLM 回显的 prompt 内容 / CoT 思考链
    // 设计原则：保守过滤——宁可漏过少量泄露，也不要误删正常文章段落
    // 因为推理模型的 reasoning_content 已经在 callLLM 中被拦截（不作为正文返回），
    // 这里只处理 content 字段中偶尔混入的 prompt 回显片段
    function stripPromptLeakage(text) {
        if (!text || typeof text !== 'string') return text;

        // === prompt 原文回显标记 ===（这些只出现在 prompt 里，不会出现在正常文章里）
        const promptMarkers = [
            // 旧版标记
            '事实红线·禁止杜撰', '禁止杜撰', '总字数必须达到', '总字数严格控制在',
            '风格要求', '内容方向', '每章节必须达到',
            '不要输出任何解释说明', '现在请开始写', '你是一位资深的公众号',
            '严格遵循以下要求', '字数要求',
            '【红线', '【事实红线', '【写作核心要求', '【爆款标题技巧',
            '【去AI化', '【写作要求', '【资讯背景', '【话题背景',
            // v41 新增标记
            '【字数·硬性', '【风格·硬性', '【格式·硬性', '【内容要求',
            '【事实红线】', '【话题红线】', '【去AI化】', '【爆款标题技巧】',
            '【字数·硬性】', '【风格·硬性】', '【格式·硬性】',
            // v42 自然语言式标记
            '字数·硬性', '风格·硬性', '格式·硬性'
        ];

        // === CoT 元思考标记 ===（只保留明确的元思考特征，去掉正常文章常见词）
        // 重要：不要加"让我们"、"我需要"、"可以。"、"精简"等正常文章里也常见的词
        const cotMarkers = [
            // 明确的思考步骤标记
            '解构话题', '检查约束', '起草内容', '审查与打磨', '字数计算', '精确计算字数',
            '结构安排', '结构规划', '结构设计',
            '我可以这样写', '删减策略', '逐步进行',
            // 元注释格式（带括号的字数统计，如"（字数：260字左右，3-4段）"）
            '（字数：', '(字数：',
            // 提纲式标记
            '引言：', '章节1：', '章节2：', '章节3：', '章节4：', '章节5：', '结尾：',
            '1. 引言', '2. 章节', '3. 章节', '4. 章节', '5. 章节',
            // CoT 特有的箭头标记
            '-> 可以', '-> 删减', '-> 精简',
            // 思考过程标记
            '等等，提示词', '由于我不能', '我必须基于', '触碰红线'
        ];

        const hasLeakage = promptMarkers.some(m => text.includes(m))
            || cotMarkers.some(m => text.includes(m));
        if (!hasLeakage) return text;
        console.warn('[stripPromptLeakage] 检测到 prompt/CoT 泄露，尝试截取正文');

        // 策略1（首选）：找最后一个 markdown # 标题，从那里截取
        // CoT 思考过程在正文之前，真正的文章从 # 标题开始
        const titleMatches = [...text.matchAll(/^#\s+[^\n]+/gm)];
        if (titleMatches.length > 0) {
            const lastTitle = titleMatches[titleMatches.length - 1];
            const candidate = text.substring(lastTitle.index).trim();
            if (candidate.length > 200) {
                // 验证截取的内容不像 CoT（不含元思考标记）
                const hasCoTInCandidate = cotMarkers.some(m => candidate.includes(m));
                if (!hasCoTInCandidate) return candidate;
            }
        }

        // 策略2：找"直接输出""以下是文章"等分隔标记之后的内容
        const outputMarkers = ['直接输出', '以下是文章', '以下是正文', '文章如下', '正文开始', '改写后'];
        for (const marker of outputMarkers) {
            const idx = text.lastIndexOf(marker);
            if (idx >= 0) {
                const after = text.substring(idx + marker.length).replace(/^[:：\s\n]+/, '').trim();
                if (after.length > 200) return after;
            }
        }

        // 策略3（保守）：只丢弃明确含 prompt 标记的段，保留其余所有段
        // 不再用 cotMarkers 做段级过滤（避免误删含"让我们"等正常词的段）
        const paras = text.split(/\n\s*\n/);
        const cleanParas = paras.filter(p => {
            const t = p.trim();
            if (!t) return false;
            // 只丢弃含 prompt 原文标记的段（这些不可能出现在正常文章里）
            if (promptMarkers.some(m => t.includes(m))) return false;
            // 丢弃纯提纲式段（如"1. 引言：60-90字"）
            if (/^\d+[\.\、]\s*(引言|章节|标题|结尾|结构)/.test(t)) return false;
            // 丢弃纯字数注释段（如"（字数：260字左右）"）
            if (/^[（(]字数/.test(t)) return false;
            return true;
        });
        if (cleanParas.length >= 2 && cleanParas.join('\n\n').length > 50) {
            return cleanParas.join('\n\n');
        }

        // 都失败，返回原文（让用户看到问题，而不是丢失内容）
        return text;
    }

    // ===== 去AI味（Humanize）系统化处理 =====
    // 参考 ~/.qclaw/skills/humanizer 的多层级设计原则：
    //   第1层 autoFix          机械修复（弯引号、chatbot痕迹、安全填充短语）
    //   第2层 analyzePatterns  24模式检测（critical/important/minor 优先级分组）
    //   第3层 replaceAIVocab   3级AI词汇替换（Tier1 死命词 / Tier2 密度可疑 / Tier3 上下文）
    //   第4层 humanizeViaLLM   LLM 深度改写（附上检测报告作为指导）
    // 中文适配：去掉了 \b 词边界（中文中无效），用直接匹配；保留语义不改变核心内容。

    // ─── Tier 1 死命词：出现即替换（中文高频 AI 痕迹） ───
    const HUMANIZER_TIER1 = [
        // 形而上/抽象名词
        ['彰显', '显出'], ['交织', '交错'], ['精妙', '巧妙'],
        ['格局', '局面'], ['维度', '角度'], ['范畴', '范围'],
        ['层面', '方面'], ['活力', '生气'], ['生态', '圈子'],
        // 互联网黑话
        ['赋能', '助力'], ['沉淀', '积累'], ['迭代', '改进'],
        ['落地', '用上'], ['变现', '赚钱'], ['裂变', '扩散'],
        ['触达', '到达'], ['闭环', '完整流程'], ['抓手', '着力点'],
        ['赛道', '方向'], ['风口', '机会'], ['护城河', '优势'],
        ['降维打击', '碾压'], ['出圈', '火出圈'], ['破圈', '突破圈层'],
        // 常用 AI 句式词
        ['此外', '另外'], ['值得一提的是', ''], ['至关重要', '关键'],
        ['深入探讨', '仔细说说'], ['不可或缺', '少不了'],
        ['综上所述', '说到底'], ['总而言之', '说到底'],
        ['不可否认', '说实话'], ['众所周知', '大家都知道'],
        ['值得注意的是', '要注意的是'], ['不难发现', '能看出来'],
        ['毋庸置疑', '确实'], ['诚然', '确实'], ['无疑', '确实是'],
        // AI 高频动词
        ['引发了广泛关注', '引起了不少人注意'],
        ['掀起了热议', '聊得挺热闹'], ['引发了热议', '聊得挺热闹'],
        ['纷纷表示', '都说'], ['蓬勃发展', '发展得不错'],
        ['方兴未艾', '还在往上走'], ['日新月异', '变化很快'],
        ['深刻变革', '大变化'], ['深度融合', '结合得紧'],
        ['见证了', '看到了'], ['凸显了', '显出了'], ['凸显', '显出'],
        ['展现了', '展示了'], ['展现', '展示'],
        // 平行结构标记词
        ['不仅是', '不只是'], ['更是', '而且是'], ['与此同时', '同时'],
        // 总结类
        ['然而', '但是'], ['尽管如此', '虽然这样'],
        ['即使如此', '就算这样'], ['即便如此', '就算这样'],
        ['无论如何', '不管怎样'], ['言而总之', '说到底'],
        ['概而言之', '说到底'], ['总之', '说到底'],
        ['总的来看', '总体看'], ['总的来说', '总体看'],
        ['综合来看', '总体看'], ['综合而言', '总体看'],
        ['除此之外', '另外'], ['在此基础之上', '在这个基础上'],
        ['基于此', '基于这个'], ['由此可知', '从这里能知道'],
        ['综上', '说到底'],
        // AI 反思句
        ['这不禁让我们思考', '这让人会想'], ['这提醒我们', '这提醒'],
        ['未来必将', '未来会'], ['我们应当认识到', '我们得知道'],
        ['我们必须承认', '我们得承认'], ['我们不能否认', '我们没法否认'],
        // 商业/营销词
        ['核心要素', '关键点'], ['核心价值', '关键价值'],
        ['核心竞争力', '关键优势'], ['核心', '关键'],
        ['场景', '场合'], ['痛点', '麻烦'], ['内卷', '过度竞争'],
        ['躺平', '不折腾'], ['国潮', '国货风潮'],
        ['新消费', '新消费方式'], ['新国货', '国产品牌'],
        ['新锐', '新出的'], ['头部', '领先'], ['腰部', '中等'],
        ['尾部', '小'], ['下沉市场', '三四线城市'],
        ['私域', '自有'], ['公域', '公共'],
        ['存量', '现有'], ['增量', '新增'], ['复用', '重复用'],
    ];

    // ─── Tier 2 密度可疑：单独出现可接受，多个出现才替换 ───
    const HUMANIZER_TIER2_DENSITY = 3; // 出现≥3次才整批替换

    // ─── 安全填充短语（机械替换，无歧义） ───
    const HUMANIZER_SAFE_FILLS = [
        [/在([^，。、]{1,10})的背景下/g, '在$1的时候'],
        [/随着([^，。、]{1,10})的发展/g, '随着$1发展'],
    ];

    // ─── Chatbot 痕迹（开头/结尾） ───
    const HUMANIZER_CHATBOT_START = [
        /^[以下是]+[^。！？]{0,30}[。：：]\s*/i,
        /^(当然|当然可以|好的|没问题)[！!。]?\s*/,
        /^(这是一个|这确实是一个)(很好|不错|有趣)的?[^。！？]{0,30}[。！？]\s*/,
    ];
    const HUMANIZER_CHATBOT_END = [
        /\s*(希望对你有帮助|希望对您有帮助|希望这篇文章对你有帮助|希望对你有所启发)[^。！？]*[。！？]\s*$/i,
        /\s*(如果你觉得有用|如果对你有帮助|欢迎点赞分享|欢迎留言讨论)[^。！？]*[。！？]\s*$/i,
        /\s*(以上就是|以上就是关于)[^。！？]*[。！？]\s*$/i,
    ];

    // ─── 第1层：机械修复（autoFix） ───
    // 只做"无歧义"的转换，不改写语义。
    function humanizeAutoFix(text) {
        let result = text;
        const fixes = [];
        // 1. 弯引号 → 直引号
        if (/[\u201C\u201D]/.test(result)) {
            result = result.replace(/[\u201C\u201D]/g, '"');
            fixes.push('弯引号→直引号');
        }
        if (/[\u2018\u2019]/.test(result)) {
            result = result.replace(/[\u2018\u2019]/g, "'");
            fixes.push('弯单引号→直单引号');
        }
        // 2. 破折号统一为逗号（保留语义不破坏句式）
        const dashCount = (result.match(/[—–]/g) || []).length;
        if (dashCount > 0) {
            result = result.replace(/[—–]/g, '，');
            fixes.push(`破折号×${dashCount}→逗号`);
        }
        // 3. Chatbot 开头痕迹
        for (const re of HUMANIZER_CHATBOT_START) {
            if (re.test(result)) {
                result = result.replace(re, '');
                fixes.push('移除chatbot开头');
                break;
            }
        }
        // 4. Chatbot 结尾痕迹
        for (const re of HUMANIZER_CHATBOT_END) {
            if (re.test(result)) {
                result = result.replace(re, '');
                fixes.push('移除chatbot结尾');
                break;
            }
        }
        // 5. 安全填充短语替换
        for (const [re, to] of HUMANIZER_SAFE_FILLS) {
            if (re.test(result)) {
                const cnt = (result.match(re) || []).length;
                result = result.replace(re, to);
                fixes.push(`填充短语×${cnt}`);
            }
        }
        return { text: result.trim(), fixes };
    }

    // ─── 第2层：模式检测（analyzePatterns） ───
    // 返回 critical/important/minor 三级问题清单 + 统计信号
    function humanizeAnalyze(text) {
        const critical = [];   // weight 4-5: 死命问题
        const important = [];  // weight 2-3: 明显问题
        const minor = [];      // weight 1: 细节问题

        // Pattern 13: 破折号过度（已由 autoFix 处理，此处只统计）
        const emDashCount = (text.match(/[—–]/g) || []).length;
        if (emDashCount >= 3) {
            critical.push({ pattern: '破折号过度', count: emDashCount, suggestion: '用逗号/句号/括号替代多数破折号' });
        }

        // Pattern 14: 粗体过度（**xxx** 在 markdown 中）
        const boldCount = (text.match(/\*\*[^*]+\*\*/g) || []).length;
        if (boldCount >= 5) {
            important.push({ pattern: '粗体滥用', count: boldCount, suggestion: '减少机械加粗，让文字本身承担强调' });
        }

        // Pattern 17: emoji 过度
        const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu) || []).length;
        if (emojiCount >= 4) {
            important.push({ pattern: 'Emoji过度', count: emojiCount, suggestion: '专业文字减少 emoji 装饰' });
        }

        // Pattern 24: 套话结尾
        const genericEnd = /(未来.*可期|未来.*光明|让我们拭目以待|相信.*会更好|前景.*广阔)/g;
        const endMatches = text.match(genericEnd) || [];
        if (endMatches.length > 0) {
            critical.push({ pattern: '套话结尾', count: endMatches.length, suggestion: '用具体事实替代"未来可期"类套话' });
        }

        // Pattern 22: 三段论标记
        const triadMarkers = /(首先[^。！？]{0,80}[。！？][^]{0,200}其次[^。！？]{0,80}[。！？][^]{0,200}最后)/g;
        const triadMatches = text.match(triadMarkers) || [];
        if (triadMatches.length > 0) {
            important.push({ pattern: '三段论结构', count: triadMatches.length, suggestion: '避免"首先/其次/最后"机械结构' });
        }

        // Pattern 9: 平行结构"不是…而是…"
        const negParallel = /(不是[^，。]{1,30})而是/g;
        const negMatches = text.match(negParallel) || [];
        if (negMatches.length >= 2) {
            important.push({ pattern: '平行结构', count: negMatches.length, suggestion: '"不是X而是Y"用多了显得AI，直接陈述' });
        }

        // 统计信号：句子长度变化
        const sentences = text.split(/[。！？\n]/).map(s => s.trim()).filter(s => s.length > 0);
        const sentCount = sentences.length;
        let avgLen = 0, variance = 0, burstiness = 0;
        if (sentCount >= 4) {
            const lens = sentences.map(s => s.length);
            avgLen = lens.reduce((a, b) => a + b, 0) / sentCount;
            variance = lens.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / sentCount;
            const stdDev = Math.sqrt(variance);
            const cov = avgLen > 0 ? stdDev / avgLen : 0;
            burstiness = cov;
            if (cov < 0.3) {
                important.push({
                    pattern: '句子节奏单一',
                    count: 1,
                    suggestion: `句子长度方差过小（CoV=${cov.toFixed(2)}），混合短句(3-15字)和长句(30+字)`
                });
            }
            if (avgLen > 40) {
                minor.push({
                    pattern: '平均句长偏长',
                    count: 1,
                    suggestion: `平均句长 ${avgLen.toFixed(0)} 字，拆分部分长句`
                });
            }
        }

        // 统计信号：词汇重复（trigram）
        if (sentCount >= 4) {
            const cleaned = text.replace(/[\s\n]+/g, '');
            const trigrams = {};
            for (let i = 0; i < cleaned.length - 5; i += 3) {
                const tg = cleaned.substring(i, i + 6);
                trigrams[tg] = (trigrams[tg] || 0) + 1;
            }
            const repeated = Object.values(trigrams).filter(v => v >= 2).length;
            const total = Object.keys(trigrams).length;
            const repeatRate = total > 0 ? repeated / total : 0;
            if (repeatRate > 0.15) {
                minor.push({
                    pattern: '短语重复',
                    count: repeated,
                    suggestion: `3字短语重复率 ${(repeatRate * 100).toFixed(0)}%，变换表达方式`
                });
            }
        }

        return {
            critical,
            important,
            minor,
            stats: { sentCount, avgLen, burstiness },
            totalIssues: critical.length + important.length + minor.length
        };
    }

    // ─── 第3层：AI 词汇替换（Tier1 死命词 + Tier2 密度替换） ───
    function replaceAIVocabulary(text) {
        let result = text;
        const replaced = [];
        let tier1Count = 0;

        // Tier 1: 出现即替换
        for (const [from, to] of HUMANIZER_TIER1) {
            const re = new RegExp(from, 'g');
            const matches = result.match(re);
            if (matches) {
                result = result.replace(re, to);
                tier1Count += matches.length;
                replaced.push(`${from}×${matches.length}`);
            }
        }
        // 清理替换后的多余标点（"","" → ""；""， → ，）
        result = result.replace(/  +/g, ' ')
                       .replace(/，，/g, '，').replace(/，。/g, '。').replace(/。，/g, '。')
                       .replace(/^，|，$/gm, '');

        return {
            text: result,
            tier1Count,
            replacedWords: replaced.slice(0, 8) // 只保留前8个用于状态显示
        };
    }

    // 保留旧 API 兼容（其他地方可能引用）
    function humanizeLocal(text) {
        if (!text || typeof text !== 'string') return { text, changes: [] };
        const auto = humanizeAutoFix(text);
        const vocab = replaceAIVocabulary(auto.text);
        const changes = [];
        if (auto.fixes.length > 0) changes.push(...auto.fixes);
        if (vocab.tier1Count > 0) changes.push(`高频词×${vocab.tier1Count}`);
        return { text: vocab.text, changes };
    }

    // ─── 第4层：LLM 深度改写（附上检测报告作为指导） ───
    async function humanizeViaLLM(text, settings, analysis) {
        // 把检测报告作为指导附在 prompt 里，让 LLM 有针对性地改
        const reportLines = [];
        if (analysis) {
            if (analysis.critical.length > 0) {
                reportLines.push('关键问题（必须处理）：');
                analysis.critical.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.important.length > 0) {
                reportLines.push('重要问题（优先处理）：');
                analysis.important.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.minor.length > 0) {
                reportLines.push('细节问题（酌情处理）：');
                analysis.minor.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.stats.sentCount >= 4) {
                reportLines.push(`统计信号：句子数 ${analysis.stats.sentCount}，平均句长 ${analysis.stats.avgLen.toFixed(0)} 字，节奏 CoV=${analysis.stats.burstiness.toFixed(2)}`);
            }
        }
        const reportBlock = reportLines.length > 0
            ? `\n${reportLines.join('\n')}\n`
            : '';

        const prompt = `你是资深公众号编辑，擅长把 AI 生成的文章改得像真人写的。请对以下文章做去AI味改写。
改写原则：保留原文的核心观点、结构、标题层级，不要改变内容方向。不要新增观点、数据、案例、引语，不要删除核心事实。文章字数控制在原文 ±10% 以内。
AI 痕迹清除：删除所有破折号，用逗号或句号替代。拆解"不仅是…更是…"、"不是…而是…"等平行结构。拆解"首先/其次/最后"三段论，改为自然过渡。去掉"这不禁让我们思考"、"这提醒我们"、"未来必将"等 AI 反思句。去掉"在 XX 的背景下"、"随着 XX 的发展"等 AI 开头。替换 AI 高频词：此外、值得一提的是、至关重要、深入探讨、赋能、沉淀、迭代、落地、变现、裂变、触达、闭环、抓手、赛道、风口、护城河、降维打击、内卷、躺平、破圈、国潮、新消费、下沉市场。移除"以下是"、"希望对你有帮助"、"以上就是"等 chatbot 痕迹。移除"未来可期"、"前景广阔"、"让我们拭目以待"等套话结尾。
人味增加：句子长短混排，有的句子只有 3-10 字，有的 30+ 字。加入口语化表达（说实话、坦白讲、老实说、讲真、其实、话说回来）。段落长度有变化，有的段落只有一句话。保留 Markdown 格式。
${reportBlock}
请直接输出改写后的全文，从 # 标题开始，不要任何解释、思考过程、前后缀。

原文：
${text}`;

        return await callLLM(prompt, settings);
    }

    // ─── 主入口：四级处理 ───
    async function humanizeArticle(text, settings) {
        // 第1层：机械修复（即时、无成本）
        const auto = humanizeAutoFix(text);
        // 第2层：模式检测（在机械修复后做检测，避免误报）
        const analysis = humanizeAnalyze(auto.text);
        // 第3层：AI 词汇替换（即时）
        const vocab = replaceAIVocabulary(auto.text);
        const cleanedText = vocab.text;

        console.log(`[humanize] L1机械修复: ${auto.fixes.length}项 | L2检测: critical=${analysis.critical.length}, important=${analysis.important.length}, minor=${analysis.minor.length} | L3词汇替换: ${vocab.tier1Count}个`);

        // 第4层：LLM 深度改写（需 API Key）
        if (settings && settings.apiKey) {
            try {
                const llmResult = await humanizeViaLLM(cleanedText, settings, analysis);
                if (llmResult && llmResult.trim().length > 100) {
                    const cleaned = stripPromptLeakage(llmResult);
                    return {
                        text: cleaned,
                        usedLLM: true,
                        autoFixes: auto.fixes,
                        analysis,
                        vocabReplaced: vocab.tier1Count,
                        llmError: null
                    };
                }
                return {
                    text: cleanedText,
                    usedLLM: false,
                    autoFixes: auto.fixes,
                    analysis,
                    vocabReplaced: vocab.tier1Count,
                    llmError: 'LLM 返回内容过短'
                };
            } catch (e) {
                console.warn('[humanize] LLM 改写失败，仅用本地处理：', e.message);
                return {
                    text: cleanedText,
                    usedLLM: false,
                    autoFixes: auto.fixes,
                    analysis,
                    vocabReplaced: vocab.tier1Count,
                    llmError: e.message
                };
            }
        }

        // 无 API Key：仅用前 3 层
        return {
            text: cleanedText,
            usedLLM: false,
            autoFixes: auto.fixes,
            analysis,
            vocabReplaced: vocab.tier1Count,
            llmError: null
        };
    }

    // ===== 智能排版优化（LLM 驱动）=====
    // 两级处理：第一级本地基础排版（smartFormatText）+ 段落首字符标点修正；
    //          第二级 LLM 识别标题层级、规范引用/代码块、段落松散化。
    function fixLeadingPunctuation(text) {
        // 修正段落首字符为标点的问题（如 "。xxx" → "xxx"，"，xxx" → "xxx"）
        // 只处理段落开头，不影响句中
        return text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;
            // 段落首字符是句号/逗号/分号/感叹号/问号/冒号 → 去掉
            return line.replace(/^(\s*)[。，；！？：、]+/, '$1');
        }).join('\n');
    }

    async function formatViaLLM(text, settings) {
        const prompt = `你是一位资深的公众号文章排版编辑。你收到一篇可能是纯文本、也可能是已有部分格式的文章。你的任务是：通读全文，理解文章的逻辑结构，然后把这篇文章"重新格式化"为结构清晰的 Markdown。

你的核心职责是"格式清洗与结构重建"——不改写文章的核心内容，但要主动识别文章的层次结构，为每一部分打上正确的 Markdown 标记。

【你需要在理解文章后做以下事情】

1. 识别标题，赋予正确层级：
   - 通读全文后，找到文章的总标题（通常在开头，是整篇文章的主题），用 # 标记
   - 找到文章的主要章节（大的主题块），用 ## 标记。如果原文已有"一、""第一部分""Chapter 1"等编号，保留并使用 ##
   - 找到章节下的子小节，用 ### 标记
   - 如果原文没有编号，你可以根据语义自行添加"一、二、三"等中文序号到 ## 标题前，让层次更清晰
   - 标题末尾不要加句号、冒号

2. 识别引用内容，用 > 标记：
   - 名人名言、经典语录、哲理金句
   - 他人的观点、书摘引用
   - 读者来信、用户反馈等引用性内容
   - 注意：普通正文段落不要误标为引用，只有真正的"引述他人话语"才用 >

3. 识别列表内容，用列表语法：
   - 并列的要点（如"第一…第二…第三…"，或用顿号分隔的短句），转换为无序列表（- 开头）
   - 有顺序的步骤、流程、操作指南，转换为有序列表（1. 2. 3.）
   - 如果原文是"第一步…第二步…"这种，改为有序列表

4. 识别代码，用代码块语法：
   - 如果文章中出现代码、命令行、配置项，用三反引号包裹并标注语言（如 \`\`\`python）
   - 行内的技术术语、变量名、文件名可以用反引号包裹

5. 识别重点，用加粗标记：
   - 段落中的核心结论、关键数据、重要观点，用 **加粗** 标记
   - 不要过度加粗，每段最多1-2处

6. 段落重组：
   - 把长段落按语义拆分为 2-4 句的短段落
   - 段落之间用空行分隔
   - 如果发现两段说的其实是同一件事，可以合并

7. 清理问题：
   - 删除段落开头多余的标点符号（如开头是逗号、句号）
   - 删除多余的空行（连续3个以上空行压缩为1个）
   - 修正全角半角混用问题（如中文语境下用中文标点）

【绝对不能做的事】
- 不要删减或改写文章的核心观点和论据
- 不要替换同义词、不要"润色"文笔
- 不要添加原文没有的事实、数据、案例
- 不要删除原文的任何段落（除非是完全重复的废话）
- 不要添加任何编者按、导读、总结等原文没有的内容

【保留规则】
- 保留原文中已有的图片语法 ![alt](url)
- 保留原文中已有的链接 [text](url)
- 保留原文中已有的分割线 ---
- 保留原文中已有的表格语法

【输出要求】
直接输出格式化后的完整 Markdown 文本。从 # 标题开始。不要任何解释、思考过程、前言后缀、代码标记包裹。

原文：
${text}`;

        return await callLLM(prompt, settings);
    }

    // 主入口：先本地排版，再 LLM 优化
    async function formatArticleSmart(text, settings) {
        // 第一级：本地基础排版（复用现有 smartFormatText）
        let localFormatted = text;
        let localFormattedFlag = false;
        try {
            if (typeof smartFormatText === 'function') {
                localFormatted = smartFormatText(text);
                localFormattedFlag = true;
            }
        } catch (e) {
            console.warn('[format] 本地排版失败，使用原文：', e.message);
        }
        // 修正段落首字符标点（即时、无成本）
        localFormatted = fixLeadingPunctuation(localFormatted);

        // 第二级：LLM 优化（需 API Key）
        if (settings && settings.apiKey) {
            try {
                const llmResult = await formatViaLLM(localFormatted, settings);
                if (llmResult && llmResult.trim().length > 100) {
                    const cleaned = stripPromptLeakage(llmResult);
                    // 统计 LLM 改了什么（粗略对比标题数、段落数）
                    const origHeadings = (text.match(/^#{1,6}\s/gm) || []).length;
                    const newHeadings = (cleaned.match(/^#{1,6}\s/gm) || []).length;
                    const origParas = text.split(/\n\s*\n/).filter(p => p.trim()).length;
                    const newParas = cleaned.split(/\n\s*\n/).filter(p => p.trim()).length;
                    const llmSummary = `标题${origHeadings}→${newHeadings}，段落${origParas}→${newParas}`;
                    return {
                        text: cleaned,
                        usedLLM: true,
                        localFormatted: localFormattedFlag,
                        llmSummary,
                        llmError: null
                    };
                }
                return {
                    text: localFormatted,
                    usedLLM: false,
                    localFormatted: localFormattedFlag,
                    llmSummary: '',
                    llmError: 'LLM 返回内容过短'
                };
            } catch (e) {
                console.warn('[format] LLM 排版失败，仅用本地排版：', e.message);
                return {
                    text: localFormatted,
                    usedLLM: false,
                    localFormatted: localFormattedFlag,
                    llmSummary: '',
                    llmError: e.message
                };
            }
        }

        // 无 API Key：仅本地排版
        return {
            text: localFormatted,
            usedLLM: false,
            localFormatted: localFormattedFlag,
            llmSummary: '',
            llmError: null
        };
    }

    // ===== 6. 话题筛选（让 LLM 从热搜中选最适合写文章的话题）=====
    async function selectBestTopic(topics, settings) {
        const prompt = `你是公众号编辑。以下是从微博热搜抓取的话题列表：

${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

请从中选出最适合写一篇深度公众号文章的话题，要求：
1. 话题有延展性，能写出深度观点
2. 有公众讨论价值
3. 能引发情感共鸣

【红线·绝对不能选】涉及以下任何一项的话题一律跳过，换选其他：
- 宗教（任何宗教教义、信仰争议、宗教冲突）
- 政治（政党、政策立场、意识形态争论）
- 国家领导人（任何国家现任或前任领导人的评价）
- 民族独立、主权争议、领土争端
- 民族矛盾、种族冲突
- 其他敏感地缘政治话题

如果所有话题都触碰红线，输出：DEFAULT_TOPIC

只输出你选中的那一个话题的原文，不要任何解释、不要编号、不要引号。`;
        const result = await callLLM(prompt, settings);
        let selected = result.trim().replace(/^[\d.、\s]+/, '').replace(/^["""']+|["""']+$/g, '').trim();
        if (selected === 'DEFAULT_TOPIC') {
            return '一个值得思考的生活现象';
        }
        const matched = topics.find(t => t.includes(selected) || selected.includes(t));
        return matched || selected || topics[0];
    }

    // ===== 7. 写文章（已集成 humanizer 去 AI 化规则，一次成型，避免二次 LLM 调用）=====
    // 基于 https://github.com/blader/humanizer 的核心规则
    async function generateArticle(topic, settings) {
        const prompt = `你是一位资深公众号主笔，擅长用独特的视角、扎实的数据和有温度的故事写出10w+爆款文章。

请基于以下话题写一篇公众号文章：

话题：${topic}

【红线·绝对禁止】以下内容一律不得出现在文章中，违反则整篇作废重写：
- 宗教（任何宗教教义、信仰争议、宗教冲突、宗教评价）
- 政治（政党、政策立场、意识形态争论、政治制度比较）
- 国家领导人（任何国家现任或前任领导人的名字、评价、轶事）
- 民族独立、主权争议、领土争端、地缘政治
- 民族矛盾、种族冲突、地域歧视
如果话题本身触碰红线，请转换角度，只写生活化、人性化、情感化的侧面，绝不触及敏感维度。

【事实红线·禁止杜撰】
- 不得编造任何具体数据、统计数字、百分比、金额（如"73%的人..."、"市场规模达XX亿"等）。如需引用数据，用模糊表达（"相当一部分"、"大多数"、"许多人"）。
- 不得编造具体人物、公司、机构、事件、案例（如"小李在北京..."、"某互联网公司..."）。可以用第一人称泛化叙述（"我见过一些人..."、"身边有朋友..."）。
- 不得编造历史事件、时间节点、政策名称、法律条文。
- 不得编造名人名言或将其归因于具体人物。可以用"有人说过"等泛化表达。
- 不得编造科学结论、研究结论、专家观点。
- 如果话题本身是具体新闻事件，只写话题引发的思考、情感共鸣、社会现象，不写事件的具体细节、当事人、时间地点。
- 概括性、观点性、情感性的内容可以自由发挥；具体性、事实性、可查证的内容必须谨慎，宁可不写也不编造。

【去AI化·一次成型·必须遵循】你的文章将通过头条、公众号等平台的朱雀AI检测，以下规则基于 humanizer 项目的去 AI 化规则，在写作时就严格执行：

语言层面：
- 禁止使用破折号（— –），用句号/逗号/冒号/括号替换
- 禁止 AI 高频词汇：actually, additionally, crucial, delve, enhance, foster, highlight, interplay, intricate, landscape, pivotal, showcase, tapestry, testament, underscore, vibrant
- 中文禁止：此外、值得一提的是、至关重要、深入探讨、增强、培育、彰显、交织、精妙、格局、关键、展示、见证、凸显、活力
- 禁止"不仅是…更是…""不是…而是…"等否定平行结构
- 禁止三连句式（A、B 和 C 改为 A 和 B，或拆成两句）
- 把被动语态改为主动语态

结构层面：
- 禁止"总分总"三段论结构（开头总述→分点论述→结尾总结）
- 禁止"首先/其次/最后/此外/然而/总之/综上所述"等AI式过渡词
- 禁止段落结尾用"这不禁让我们思考…""这提醒我们…""未来必将…"等AI式反思句和升华句
- 禁止"在XX的背景下""随着XX的发展""在XX的时代"等AI式开头
- 段落长度要变化：有的段落只有一句话，有的三四句

风格层面：
- 加入口语化表达（说实话、坦白讲、老实说）
- 加入个人视角和情感体验（我注意到、我发现、我经历过）
- 用具体细节替代抽象概括（不说"很多人"，说"地铁上刷手机的打工人"）
- 句子长度要混排：短句有力。然后长句慢慢展开。再来个短的。
- 允许跳跃思维、不完美的表达、生活化比喻
- 只在真正关键处使用加粗，不要过度加粗

写作要求（严格遵循）：
1. 文章结构（必须用 Markdown 格式）：
   - 开头用 # 写一个吸引眼球的标题（15-25字，不要用「」号）
   - 紧接着一段 60-90 字的引言，用 > 引用块格式，点出话题的核心矛盾或悬念
   - 用 ## 划分 3-4 个章节，每个章节标题要有信息量（不要用"第一章"这种，要用观点式标题）
   - 结尾有一个简短的总结段落
   - 不要在文章末尾写自我介绍、签名、引导关注等内容，排版模板已有

2. 内容与段落（重要·阅读体验）：
   - 总字数严格控制在 1000-1500 字，不要超出
   - 段落必须松散短小：每段不超过 3-4 句话，理想 2-3 句
   - 一个观点讲完就换段，不要把多个观点挤在一段里
   - 每个章节 250-350 字，分 3-4 个自然段
   - 要有真实的生活观察、个人体验、情感细节（但不要编造具体数据/人物/事件）
   - 不要空话套话，不要"众所周知""不可否认""不言而喻"等万能句式
   - 观点要鲜明，有自己的角度，不是复述新闻
   - 适当使用**加粗**标注关键观点
   - 可以用 > 引用块标注金句

3. 不要输出任何解释说明，直接输出 Markdown 正文。

现在请开始写：`;
        return await callLLM(prompt, settings);
    }

    // humanizeArticle 已删除——去 AI 化规则已合并进 generateArticle，避免二次 LLM 调用

    // ===== 8. 规划配图（让 LLM 生成英文图片 prompt，与文章强相关）=====
    async function planImages(article, imageCount, settings) {
        const prompt = `你是一位资深图片编辑。请仔细阅读以下文章，为文章规划 ${imageCount} 张配图。

文章内容：
${article.substring(0, 3000)}

请为每张配图生成一个英文的图片生成 prompt。要求：
1. 共 ${imageCount} 行，每行一个 prompt
2. prompt 格式：[摄影/插画风格] + [主体内容] + [场景环境] + [色调氛围] + ultra detailed, professional photography, 8k quality, no text, no watermark
3. 所有图片风格统一（都用 editorial photography 或都用 editorial illustration）
4. 【重要】每张图必须与文章具体内容强相关：
   - 从文章中提取具体的场景、人物、物品、环境作为图片主体
   - 不要用泛化的"城市风景"、"抽象概念"等与文章无关的图
   - 图片应该能帮助读者理解文章内容，而不是装饰
   - 例如：文章写"深夜加班的人"，图就应该是"深夜办公室亮着灯，一个人在电脑前工作"；文章写"菜市场的人情味"，图就应该是"清晨菜市场摊主与顾客交谈"
5. 每张图对应文章中不同的章节/主题，不要重复
6. 只输出英文 prompt，每行一个，不要编号、不要中文、不要其他内容

示例（假设文章写的是都市生活的孤独感）：
editorial photography, person sitting alone in late night office, monitor glow on face, empty office background, melancholic mood, ultra detailed, 8k quality, no text, no watermark
editorial photography, crowded subway platform at rush hour, people looking at phones, isolated feeling despite crowd, warm fluorescent light, ultra detailed, 8k quality, no text, no watermark`;
        const result = await callLLM(prompt, settings);
        const prompts = result.split('\n')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('prompt') && !s.startsWith('示例') && s.length > 30);
        // 如果 LLM 输出不够，补充默认 prompt（与文章弱相关）
        const defaults = [
            'editorial photography, modern cityscape, warm sunset light, aerial view, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, technology concept, blue tones, abstract, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, lifestyle scene, warm atmosphere, natural light, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, abstract concept, minimal composition, soft colors, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, people in modern environment, candid moment, warm tones, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, nature landscape, golden hour, serene atmosphere, ultra detailed, 8k quality, no text, no watermark'
        ];
        while (prompts.length < imageCount) {
            prompts.push(defaults[prompts.length % defaults.length]);
        }
        return prompts.slice(0, imageCount);
    }

    // ===== 8.5 封面配图规划（让 LLM 生成场景/标题/金句三变量）=====
    async function planCoverImage(article, settings) {
        const prompt = `你是一位资深图片编辑。请阅读以下文章，为封面图生成三个变量。

文章内容：
${article.substring(0, 3000)}

请根据文章内容，生成以下四个变量（用 JSON 格式输出）：

1. "scene"：一个适合做封面的人文摄影场景描述（中文，一句话，描述一个具体的生活场景。如"一个推着垃圾车的环卫工人背影，一束晨光照在他的身上"或"深夜便利店收银员"或"凌晨机场等待起飞的人"或"暴雨中的外卖员"）
2. "title"：文章的标题（中文，不超过三行，每行不超过15字）
3. "quote"：一句金句（中文，来自文章或总结文章核心，如"真正厉害的人，不是没有情绪，而是每天都在生活里解决情绪。"）
4. "articleType"：文章类型，"lifestyle"（生活感悟/情感/随笔/记录）或 "tech"（科技/AI/资讯/数码）

只输出 JSON，不要其他内容。格式：
{"scene":"场景描述","title":"标题","quote":"金句","articleType":"lifestyle"}`;
        const result = await callLLM(prompt, settings);
        try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    scene: parsed.scene || '一个人在清晨的街道上独行，背影被朝阳拉长',
                    title: parsed.title || '生活的温度',
                    quote: parsed.quote || '每一个平凡的日子，都值得被认真对待。',
                    articleType: parsed.articleType === 'tech' ? 'tech' : 'lifestyle'
                };
            }
        } catch (e) {
            console.error('封面规划解析失败:', e);
        }
        return {
            scene: '一个人在清晨的街道上独行，背影被朝阳拉长',
            title: '生活的温度',
            quote: '每一个平凡的日子，都值得被认真对待。',
            articleType: 'lifestyle'
        };
    }

    // ===== 8.6 生成封面图（用户配置的图片API背景 + Canvas 合成文字）=====
    // 优先使用用户在 AI 设置中配置的图片生成 API，失败时降级 Pollinations
    async function generateArticleCover(plan, seed) {
        const isTech = plan.articleType === 'tech';
        const stylePrompt = isTech
            ? 'minimalist tech style, clean modern composition, blue and grey tones, abstract technology concept, large empty negative space on left side, geometric, futuristic, ultra detailed, 8k quality, no text, no watermark, no people'
            : 'documentary photography, humanistic photography, golden hour warm light, candid moment, story telling atmosphere, person from behind or side profile not looking at camera, composition biased to the right side, large empty negative space on the left for text overlay, National Geographic style, natural realistic not posed, film grain, ultra detailed, 8k quality, no text, no watermark';

        const bgPrompt = `${stylePrompt}, ${plan.scene}, no text, no watermark, no logo`;

        // 优先用用户配置的图片 API
        const imgSettings = getImageApiSettings();
        let bgDataUri = null;
        if (imgSettings.provider !== 'pollinations' && imgSettings.apiKey) {
            try {
                const imgConfig = IMAGE_PROVIDERS[imgSettings.provider] || IMAGE_PROVIDERS.pollinations;
                bgDataUri = await generateImageViaApi(bgPrompt, imgSettings, imgConfig, 60000);
            } catch (e) {
                console.warn('封面图用用户API失败，降级到 Pollinations:', e.message);
                bgDataUri = null;
            }
        }
        // 降级到 Pollinations
        if (!bgDataUri) {
            const encoded = encodeURIComponent(bgPrompt);
            const bgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}&model=flux-realism`;
            bgDataUri = await preloadImageToDataUri(bgUrl, 90000);
        }

        // Canvas 合成文字
        return await compositeCoverImage(bgDataUri, plan.title, plan.quote);
    }

    // Canvas 合成：背景图 + 整体淡蒙版 + 左侧渐变蒙版 + 标题 + 金句 + 品牌信息
    // 设计原则：主体靠右，文字靠左，整体淡淡蒙版突出文字
    function compositeCoverImage(bgDataUri, title, quote) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1280;
                    canvas.height = 720;
                    const ctx = canvas.getContext('2d');

                    // 1. 绘制背景图
                    ctx.drawImage(img, 0, 0, 1280, 720);

                    // 2. 整体淡淡蒙版（让文字更突出，但不影响背景观感）
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
                    ctx.fillRect(0, 0, 1280, 720);

                    // 3. 左侧渐变蒙版（黑色→透明，占约55%宽度，文字区域更深）
                    const gradient = ctx.createLinearGradient(0, 0, 720, 0);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
                    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.42)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 720, 720);

                    const drawText = () => {
                        // 文字区设计：左安全边距 96px（更宽松），垂直居中
                        const padding = 96;
                        const titleLines = (title || '').split('\n').filter(l => l.trim());
                        const quoteLines = (quote || '').split('\n').filter(l => l.trim());

                        // 标题字号加大到 52px，行距 68px（更舒适）
                        const titleFontSize = 52;
                        const titleLineHeight = 68;
                        // 金句字号 20px，行距 32px
                        const quoteFontSize = 20;
                        const quoteLineHeight = 32;
                        const titleQuoteGap = 40;
                        const brandGap = 48;

                        // 计算文字总高度，用于垂直居中
                        const titleHeight = titleLines.length * titleLineHeight;
                        const quoteHeight = quoteLines.length * quoteLineHeight;
                        const totalTextHeight = titleHeight + titleQuoteGap + quoteHeight;
                        // 垂直居中起点（文字区垂直居中）
                        const startY = Math.max(120, (720 - totalTextHeight) / 2);

                        // 3. 标题（米白色，大字号，左对齐，行距舒适）
                        ctx.fillStyle = '#F8F5EE';
                        ctx.font = `600 ${titleFontSize}px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';
                        // 字间距通过 letterSpacing 属性（如果支持）或手动分字
                        if ('letterSpacing' in ctx) {
                            ctx.letterSpacing = '2px';
                        }
                        titleLines.forEach((line, i) => {
                            ctx.fillText(line, padding, startY + i * titleLineHeight);
                        });

                        // 4. 金句（浅灰色，字号适中，行距舒适）
                        const quoteY = startY + titleHeight + titleQuoteGap;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
                        ctx.font = `300 ${quoteFontSize}px "Noto Sans SC", "PingFang SC", sans-serif`;
                        if ('letterSpacing' in ctx) {
                            ctx.letterSpacing = '0.5px';
                        }
                        quoteLines.forEach((line, i) => {
                            ctx.fillText(line, padding, quoteY + i * quoteLineHeight);
                        });

                        // 5. 左下角品牌信息（与文字区底部对齐，保持安全距离）
                        const brandY = startY + totalTextHeight + brandGap;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.font = '400 14px "Noto Sans SC", sans-serif';
                        if ('letterSpacing' in ctx) {
                            ctx.letterSpacing = '1px';
                        }
                        ctx.fillText('@北苠', padding, brandY);
                        ctx.fillText('查看精彩内容 →', padding, brandY + 22);

                        // 重置 letterSpacing
                        if ('letterSpacing' in ctx) {
                            ctx.letterSpacing = '0px';
                        }

                        // 6. 导出 data URI
                        try {
                            const dataUri = canvas.toDataURL('image/jpeg', 0.9);
                            resolve(dataUri);
                        } catch (e) {
                            console.warn('canvas 合成导出失败（CORS），使用背景图:', e.message);
                            resolve(bgDataUri);
                        }
                    };

                    // 确保字体加载完成
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(drawText).catch(drawText);
                    } else {
                        drawText();
                    }
                } catch (e) {
                    reject(new Error('封面合成失败: ' + e.message));
                }
            };
            img.onerror = () => reject(new Error('封面背景图加载失败'));
            img.src = bgDataUri;
        });
    }

    // ===== 9. 生成图片（Pollinations.ai，预加载 → data URI 方案）=====
    // 核心策略：Image() 预加载（无 CORS 问题）→ canvas 转 data URI → 内嵌 HTML
    // - data URI 完全自包含，不依赖网络，预览/复制/粘贴都能显示
    // - 与 LLM 完全解耦：换任何模型都不影响图片生成
    // - 复制到公众号时，微信自动转存 data URI 中的图片
    // 性能优化：canvas.toDataURL 是同步阻塞操作，用 setTimeout(0) 让出主线程
    //   避免 4 张图同时完成时连续阻塞导致 UI 卡死
    async function preloadImageToDataUri(url, timeoutMs = 90000) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // 请求 CORS，使 canvas 可读取像素
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                img.src = '';
                reject(new Error('图片加载超时'));
            }, timeoutMs);
            img.onload = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (img.naturalWidth < 100 || img.naturalHeight < 100) {
                    reject(new Error('图片尺寸异常'));
                    return;
                }
                // 用 setTimeout(0) 让 canvas 转换在下一个事件循环执行
                // 避免连续 4 张图的 canvas 操作阻塞主线程导致 UI 卡死
                setTimeout(() => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const dataUri = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(dataUri);
                    } catch (e) {
                        // canvas 被污染（CORS 不通过），回退到直接 URL
                        console.warn('canvas 转 data URI 失败（CORS 限制），使用直接 URL:', e.message);
                        resolve(url);
                    }
                }, 0);
            };
            img.onerror = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                reject(new Error('图片加载失败'));
            };
            img.src = url;
        });
    }

    async function generateImage(prompt, seed, timeoutMs = 90000) {
        // 读取图片生成 API 配置
        const imgSettings = getImageApiSettings();
        const imgConfig = IMAGE_PROVIDERS[imgSettings.provider] || IMAGE_PROVIDERS.pollinations;

        // 如果配置了多模态 API（非 pollinations），优先使用
        if (imgSettings.provider !== 'pollinations' && imgSettings.apiKey) {
            try {
                const dataUri = await generateImageViaApi(prompt, imgSettings, imgConfig, timeoutMs);
                return dataUri;
            } catch (e) {
                console.warn(`图片 API (${imgConfig.name}) 失败: ${e.message}，降级到 Pollinations...`);
                // 失败时降级到 Pollinations 兜底
            }
        }

        // Pollinations 免费方案（兜底）
        const encoded = encodeURIComponent(prompt);
        // 主图源：Pollinations.ai + flux-realism 模型（写实照片级，解决人脸变形问题）
        const primaryUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}&model=flux-realism`;
        // 备用图源 1：flux 模型（通用高质量）
        const fallbackUrl1 = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;
        // 备用图源 2：Picsum（随机真实照片，无 AI 但稳定可用）
        const fallbackUrl2 = `https://picsum.photos/seed/${seed}/1280/720`;

        // 依次尝试：主 → 备1 → 备2
        const candidates = [
            { url: primaryUrl, label: 'Pollinations flux-realism' },
            { url: fallbackUrl1, label: 'Pollinations flux' },
            { url: fallbackUrl2, label: 'Picsum 备用' }
        ];
        for (const candidate of candidates) {
            try {
                const dataUri = await preloadImageToDataUri(candidate.url, timeoutMs);
                return dataUri;
            } catch (e) {
                console.warn(`${candidate.label} 失败: ${e.message}，尝试下一个...`);
            }
        }
        throw new Error('所有图源均失败');
    }

    // 通过多模态 API 生成图片（智谱 CogView / 通义万相 / DALL-E / 自定义）
    async function generateImageViaApi(prompt, settings, config, timeoutMs) {
        const apiKey = settings.apiKey;
        const baseUrl = settings.baseUrl || config.baseUrl;
        const model = settings.model || config.model;

        if (!apiKey || !baseUrl) {
            throw new Error('图片 API 配置不完整');
        }

        // 清洗 API Key（去除非 ASCII 字符，与 callLLM 一致）
        const cleanKey = apiKey.replace(/[\u3000\u200B\u200C\u200D\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
        if (!cleanKey) throw new Error('API Key 无效');

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            let imageUrl = '';

            if (config.responseFormat === 'async') {
                // 通义万相：异步 API，先 POST 拿 task_id，再轮询
                imageUrl = await generateImageDashScope(prompt, cleanKey, baseUrl, model, timeoutMs);
            } else if (config.responseFormat === 'async_tencent') {
                // 腾讯云 TokenHub：异步两阶段（submit + query 轮询）
                const queryUrl = config.queryUrl || baseUrl.replace('/submit', '/query');
                imageUrl = await generateImageTencent(prompt, cleanKey, baseUrl, queryUrl, model, timeoutMs);
            } else {
                // 智谱 CogView / DALL-E / 自定义：同步 API，POST 直接返回 URL 或 base64
                const responseFormat = (settings.provider === 'dalle') ? 'url' : config.responseFormat;
                const res = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cleanKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        prompt: prompt,
                        n: 1,
                        size: '1280x720',
                        response_format: responseFormat
                    }),
                    signal: controller.signal
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    throw new Error(`API 返回 ${res.status}: ${errText.substring(0, 200)}`);
                }

                const data = await res.json();
                // 兼容不同 API 的返回格式
                if (data.data && data.data[0]) {
                    if (data.data[0].b64_json) {
                        // 直接返回 base64 data URI
                        return `data:image/png;base64,${data.data[0].b64_json}`;
                    }
                    imageUrl = data.data[0].url || data.data[0].image_url || '';
                } else if (data.url) {
                    imageUrl = data.url;
                } else if (data.images && data.images[0]) {
                    imageUrl = data.images[0];
                } else {
                    throw new Error('API 返回格式无法识别: ' + JSON.stringify(data).substring(0, 200));
                }
            }

            if (!imageUrl) throw new Error('API 未返回图片 URL');

            // 下载图片 URL 并转为 data URI（与 Pollinations 流程一致）
            const dataUri = await preloadImageToDataUri(imageUrl, Math.min(timeoutMs, 60000));
            return dataUri;
        } finally {
            clearTimeout(timer);
        }
    }

    // 通义万相（DashScope）异步图片生成：POST 创建任务 → 轮询任务状态 → 获取图片 URL
    async function generateImageDashScope(prompt, apiKey, baseUrl, model, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // 1. 创建任务
            const createRes = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-DashScope-Async': 'enable'
                },
                body: JSON.stringify({
                    model: model,
                    input: { prompt: prompt },
                    parameters: { size: '1280*720', n: 1 }
                }),
                signal: controller.signal
            });

            if (!createRes.ok) {
                const errText = await createRes.text().catch(() => '');
                throw new Error(`创建任务失败 ${createRes.status}: ${errText.substring(0, 200)}`);
            }

            const createData = await createRes.json();
            const taskId = createData.output && createData.output.task_id;
            if (!taskId) throw new Error('未获取到 task_id');

            // 2. 轮询任务状态（每 2 秒查一次，最多 60 秒）
            const pollUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
            const startTime = Date.now();
            while (Date.now() - startTime < timeoutMs) {
                await new Promise(r => setTimeout(r, 2000));
                const pollRes = await fetch(pollUrl, {
                    headers: { 'Authorization': `Bearer ${apiKey}` },
                    signal: controller.signal
                });
                if (!pollRes.ok) continue;
                const pollData = await pollRes.json();
                const status = pollData.output && pollData.output.task_status;
                if (status === 'SUCCEEDED') {
                    const url = pollData.output.results && pollData.output.results[0] && pollData.output.results[0].url;
                    if (!url) throw new Error('任务成功但未返回图片 URL');
                    return url;
                } else if (status === 'FAILED') {
                    throw new Error('图片生成任务失败: ' + (pollData.output && pollData.output.message || ''));
                }
                // PENDING / RUNNING 继续轮询
            }
            throw new Error('通义万相任务超时');
        } finally {
            clearTimeout(timer);
        }
    }

    // 腾讯云 TokenHub 异步图片生成：POST submit 拿 id → POST query 轮询结果 → 获取图片 URL
    async function generateImageTencent(prompt, apiKey, submitUrl, queryUrl, model, timeoutMs) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // 1. 提交任务
            const submitRes = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt
                }),
                signal: controller.signal
            });

            if (!submitRes.ok) {
                const errText = await submitRes.text().catch(() => '');
                throw new Error(`提交任务失败 ${submitRes.status}: ${errText.substring(0, 200)}`);
            }

            const submitData = await submitRes.json();
            const taskId = submitData.id || (submitData.data && submitData.data.id);
            if (!taskId) {
                throw new Error('未获取到任务 id: ' + JSON.stringify(submitData).substring(0, 200));
            }

            // 2. 轮询查询（每 2 秒查一次，最多 timeoutMs）
            const startTime = Date.now();
            while (Date.now() - startTime < timeoutMs) {
                await new Promise(r => setTimeout(r, 2000));
                const queryRes = await fetch(queryUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        id: taskId
                    }),
                    signal: controller.signal
                });
                if (!queryRes.ok) continue;
                const queryData = await queryRes.json();
                const status = queryData.status || (queryData.data && queryData.data.status);

                // 成功状态：completed / success / SUCCEEDED
                if (status === 'completed' || status === 'success' || status === 'SUCCEEDED') {
                    // 尝试从多个位置提取图片 URL（兼容不同 API 返回格式）
                    let url = '';
                    // 腾讯云格式: data[0].url
                    if (Array.isArray(queryData.data) && queryData.data[0]) {
                        url = queryData.data[0].url || queryData.data[0].image_url || '';
                    }
                    // 通用格式: output.image_url / output.url
                    if (!url && queryData.output) {
                        url = queryData.output.image_url || queryData.output.url || '';
                    }
                    // 其他格式: data.image_url / data.url
                    if (!url && queryData.data && typeof queryData.data === 'object' && !Array.isArray(queryData.data)) {
                        url = queryData.data.image_url || queryData.data.url || '';
                    }
                    // 顶层格式
                    if (!url) {
                        url = queryData.image_url || queryData.url || '';
                    }
                    // images 数组格式
                    if (!url && queryData.data && Array.isArray(queryData.data.images)) {
                        url = queryData.data.images[0] || '';
                    }
                    if (!url) {
                        throw new Error('任务成功但未找到图片 URL: ' + JSON.stringify(queryData).substring(0, 300));
                    }
                    return url;
                }
                // 失败状态：failed / error / FAILED
                if (status === 'failed' || status === 'error' || status === 'FAILED') {
                    const msg = queryData.message || (queryData.data && queryData.data.message) || '未知错误';
                    throw new Error('图片生成任务失败: ' + msg);
                }
                // 其他状态（processing / pending / running / PENDING / RUNNING）继续轮询
            }
            throw new Error('腾讯云文生图任务超时');
        } finally {
            clearTimeout(timer);
        }
    }

    // ===== 刷新模型列表（调用 OpenAI 兼容的 GET /v1/models）=====
    // 支持腾讯云 TokenHub、OpenAI、智谱等支持 /v1/models 的 API
    async function fetchModels(baseUrl, apiKey, modelType) {
        if (!baseUrl || !apiKey) return [];
        const cleanKey = apiKey.replace(/[\u3000\u200B\u200C\u200D\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
        if (!cleanKey) return [];

        // 构建模型列表 URL（兼容各种 baseUrl 格式）
        let modelsUrl = baseUrl.replace(/\/chat\/completions$/, '/models');
        modelsUrl = modelsUrl.replace(/\/images\/generations$/, '/models');
        modelsUrl = modelsUrl.replace(/\/api\/image\/submit$/, '/models');
        if (!modelsUrl.endsWith('/models')) {
            modelsUrl = modelsUrl.replace(/\/$/, '') + '/models';
        }

        try {
            const resp = await fetch(modelsUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanKey}`
                },
                signal: AbortSignal.timeout(15000)
            });
            if (!resp.ok) return [];
            const data = await resp.json();
            if (!data.data || !Array.isArray(data.data)) return [];

            // 根据模型名称过滤分类
            const models = data.data.map(m => ({
                id: m.id || m.model || '',
                name: m.name || m.id || ''
            })).filter(m => m.id);

            // 按类型过滤：llm 只显示文本模型，image 只显示图片模型
            if (modelType === 'llm') {
                return models.filter(m => 
                    m.id.startsWith('hy') && !m.id.includes('image') && !m.id.includes('Image') ||
                    m.id.startsWith('glm') ||
                    m.id.startsWith('gpt') ||
                    m.id.startsWith('deepseek') ||
                    m.id.startsWith('qwen') ||
                    m.id.startsWith('doubao') ||
                    m.id.startsWith('yi') ||
                    m.id.startsWith('baichuan') ||
                    m.id.startsWith('moonshot') ||
                    m.id.startsWith('minimax')
                );
            } else if (modelType === 'image') {
                return models.filter(m => 
                    m.id.includes('image') || 
                    m.id.includes('Image') ||
                    m.id.includes('vision') ||
                    m.id.includes('Vision') ||
                    m.id.includes('cogview') ||
                    m.id.includes('wanx') ||
                    m.id.includes('dalle')
                );
            }
            return models;
        } catch (e) {
            console.warn('获取模型列表失败:', e.message);
            return [];
        }
    }

    // ===== 渲染模型列表到 UI =====
    function renderModelList(modelList, container, inputElement) {
        if (!container || !inputElement) return;
        if (!modelList || modelList.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.innerHTML = modelList.map(m => 
            `<button type="button" style="display:block;width:100%;padding:6px 10px;text-align:left;border:none;background:none;font-size:12px;color:#374151;cursor:pointer;border-radius:4px;transition:background 0.15s;" onclick="document.getElementById('${inputElement.id}').value='${m.id}';this.parentElement.style.display='none'">
                ${m.name || m.id}
                <span style="float:right;font-size:11px;color:#9CA3AF;">${m.id}</span>
            </button>`
        ).join('');
        container.style.display = 'block';
    }

    // ===== 测试 LLM 连接（用当前 UI 中填写的配置，不依赖已保存的设置）=====
    // 发送一个极小的 ping 请求，max_tokens=10，验证 API Key/Base URL/模型是否有效
    async function testLLMConnection() {
        if (!llmTestResult) return;
        const provider = llmProviderSelect ? llmProviderSelect.value : 'deepseek';
        const config = LLM_PROVIDERS[provider] || LLM_PROVIDERS.deepseek;
        // 从 UI 读取当前填写的值（不依赖已保存的 localStorage）
        let apiKey = llmApiKeyInput ? llmApiKeyInput.value.trim() : '';
        let baseUrl, model;
        if (config.editable) {
            baseUrl = llmBaseUrlInput ? llmBaseUrlInput.value.trim() : '';
            model = llmModelInput ? llmModelInput.value.trim() : '';
        } else {
            baseUrl = config.baseUrl;
            model = config.model;
        }
        if (config.editable && llmBaseUrlInput && llmBaseUrlInput.value.trim()) baseUrl = llmBaseUrlInput.value.trim();
        if (config.editable && llmModelInput && llmModelInput.value.trim()) model = llmModelInput.value.trim();

        if (!apiKey) {
            llmTestResult.innerHTML = '<span style="color:#DC2626;">❌ 请先填写 API Key</span>';
            return;
        }
        if (!baseUrl || !model) {
            llmTestResult.innerHTML = '<span style="color:#DC2626;">❌ 请先填写 Base URL 和模型名称</span>';
            return;
        }
        // 清洗 API Key
        apiKey = apiKey.replace(/[\u3000\u200B\u200C\u200D\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
        if (!apiKey) {
            llmTestResult.innerHTML = '<span style="color:#DC2626;">❌ API Key 含非法字符</span>';
            return;
        }

        const btn = llmTestBtn;
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 测试中...'; }
        llmTestResult.innerHTML = '<span style="color:#6B7280;">⏳ 正在连接 ' + (config.name || provider) + ' ...</span>';
        const startTime = Date.now();

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);
        try {
            const resp = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: '回复"OK"两个字符' }],
                    temperature: 0,
                    max_tokens: 10
                }),
                signal: controller.signal
            });
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (!resp.ok) {
                const errText = await resp.text().catch(() => '');
                llmTestResult.innerHTML = `<span style="color:#DC2626;">❌ 连接失败 (${resp.status}, ${elapsed}s)<br>${errText.substring(0, 200)}</span>`;
                return;
            }
            const data = await resp.json();
            if (!data || !data.choices || !data.choices[0]) {
                let errInfo = data && data.error ? JSON.stringify(data.error) : JSON.stringify(data).substring(0, 200);
                llmTestResult.innerHTML = `<span style="color:#DC2626;">❌ 响应格式异常 (${elapsed}s)<br>${errInfo}</span>`;
                return;
            }
            const reply = data.choices[0].message && data.choices[0].message.content;
            llmTestResult.innerHTML = `<span style="color:#10B981;font-weight:600;">✅ 大模型连接成功！(${elapsed}s)</span><br><span style="color:#6B7280;">模型回复：${(reply || '').substring(0, 50)}</span>`;
        } catch (e) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const msg = e.name === 'AbortError' ? `请求超时（${elapsed}s）` : e.message;
            llmTestResult.innerHTML = `<span style="color:#DC2626;">❌ 连接失败 (${elapsed}s)<br>${msg}</span>`;
        } finally {
            clearTimeout(timer);
            if (btn) { btn.disabled = false; btn.textContent = '🔗 测试 LLM 连接'; }
        }
    }

    // ===== 测试图片 API 连接（用当前 UI 中填写的配置）=====
    async function testImageConnection() {
        if (!imageTestResult) return;
        const provider = imageProviderSelect ? imageProviderSelect.value : 'pollinations';
        const config = IMAGE_PROVIDERS[provider] || IMAGE_PROVIDERS.pollinations;

        if (provider === 'pollinations') {
            // Pollinations 免费方案，无 API Key，直接测试图源可达性
            imageTestResult.innerHTML = '<span style="color:#6B7280;">⏳ 正在测试 Pollinations 图源...</span>';
            const testUrl = 'https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true&seed=1';
            const startTime = Date.now();
            try {
                await preloadImageToDataUri(testUrl, 20000);
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                imageTestResult.innerHTML = `<span style="color:#10B981;font-weight:600;">✅ 图源可达 (${elapsed}s)</span><br><span style="color:#6B7280;">Pollinations 免费方案可用（速度较慢）</span>`;
            } catch (e) {
                imageTestResult.innerHTML = `<span style="color:#DC2626;">❌ 图源不可达: ${e.message}</span>`;
            }
            return;
        }

        let apiKey = imageApiKeyInput ? imageApiKeyInput.value.trim() : '';
        let baseUrl = imageBaseUrlInput ? imageBaseUrlInput.value.trim() : '';
        let model = imageModelInput ? imageModelInput.value.trim() : '';
        if (!apiKey) {
            imageTestResult.innerHTML = '<span style="color:#DC2626;">❌ 请先填写图片 API Key</span>';
            return;
        }
        if (!baseUrl) baseUrl = config.baseUrl;
        if (!model) model = config.model;
        if (!baseUrl || !model) {
            imageTestResult.innerHTML = '<span style="color:#DC2626;">❌ 请先填写 Base URL 和模型名称</span>';
            return;
        }
        apiKey = apiKey.replace(/[\u3000\u200B\u200C\u200D\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
        if (!apiKey) {
            imageTestResult.innerHTML = '<span style="color:#DC2626;">❌ API Key 含非法字符</span>';
            return;
        }

        const btn = imageTestBtn;
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 测试中...'; }
        imageTestResult.innerHTML = '<span style="color:#6B7280;">⏳ 正在调用 ' + (config.name || provider) + ' 生成测试图（可能需要 5-30 秒）...</span>';
        const startTime = Date.now();
        const settings = { provider, apiKey, baseUrl, model };
        try {
            const dataUri = await generateImageViaApi('a red apple on white background, simple test image, ultra detailed', settings, config, 60000);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (dataUri && (dataUri.startsWith('data:image') || dataUri.startsWith('http'))) {
                // 成功：data URI 或可访问的 URL（CORS 失败时回退到 URL）
                imageTestResult.innerHTML = `<span style="color:#10B981;font-weight:600;">✅ 图片 API 连接成功！(${elapsed}s)</span><br>`;
                if (dataUri.startsWith('data:image')) {
                    imageTestResult.innerHTML += `<img src="${dataUri}" style="max-width:120px;max-height:80px;margin-top:6px;border-radius:4px;border:1px solid #E5E7EB;" alt="测试图">`;
                } else {
                    imageTestResult.innerHTML += `<span style="color:#6B7280;">图片 URL: ${dataUri.substring(0, 80)}...</span>`;
                }
            } else {
                imageTestResult.innerHTML = `<span style="color:#DC2626;">❌ 返回异常 (${elapsed}s): ${String(dataUri).substring(0, 100)}</span>`;
            }
        } catch (e) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            imageTestResult.innerHTML = `<span style="color:#DC2626;">❌ 连接失败 (${elapsed}s)<br>${e.message}</span>`;
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '🔗 测试图片 API 连接'; }
        }
    }

    // ===== 10. 把图片插入文章（在 ## 章节标题后插入）=====
    function insertImagesIntoArticle(article, imageUrls, imageCaptions) {
        const lines = article.split('\n');
        // 找到所有 ## 标题的行号
        const headingIndices = [];
        for (let i = 0; i < lines.length; i++) {
            if (/^##\s/.test(lines[i])) {
                headingIndices.push(i);
            }
        }
        // 如果没有 ## 标题，在文章开头/中间/结尾插入
        if (headingIndices.length === 0) {
            const result = [...lines];
            imageUrls.forEach((url, i) => {
                const caption = imageCaptions[i] || `配图 ${i + 1}`;
                const insertPos = Math.floor((i + 1) * result.length / (imageUrls.length + 1));
                result.splice(insertPos + i, 0, `![${caption}](${url})`, '');
            });
            return result.join('\n');
        }
        // 在章节标题后插入图片（跳过第一个章节，让引言先展示）
        const result = [...lines];
        let insertOffset = 0;
        imageUrls.forEach((url, i) => {
            const caption = imageCaptions[i] || `配图 ${i + 1}`;
            // 轮流插入到不同章节后面，跳过第一个章节
            const targetHeadingIdx = headingIndices[(i + 1) % headingIndices.length];
            if (targetHeadingIdx !== undefined) {
                // 在标题行后空一行再插入图片
                const insertPos = targetHeadingIdx + 2 + insertOffset;
                result.splice(insertPos, 0, `![${caption}](${url})`, '');
                insertOffset += 2;
            }
        });
        return result.join('\n');
    }

    // ===== 11. 主工作流 =====
    async function aiWorkflow() {
        const settings = getAISettings();
        if (!settings.apiKey) {
            showToast('请先在 AI 设置中配置 API Key');
            if (aiSettingsModal) aiSettingsModal.style.display = 'flex';
            return;
        }

        const btn = document.getElementById('aiWorkflowBtn');
        try {
            showAISpinner(true);
            if (btn) btn.disabled = true;

            // 1. 抓热点
            updateAIStatus('正在抓取今日热点...', '');
            let topics = [];
            try {
                topics = await fetchHotTopics();
                updateAIStatus('已抓取热点', `共 ${topics.length} 个话题`);
            } catch (e) {
                topics = ['AI 最新进展', '科技行业动态', '生活感悟'];
                updateAIStatus('热搜抓取失败，使用默认话题', '');
            }

            // 2. 话题筛选（让 LLM 选最适合写文章的）
            updateAIStatus('AI 正在筛选话题...', `从 ${topics.length} 个热点中挑选`);
            let topic;
            try {
                topic = await selectBestTopic(topics, settings);
                updateAIStatus('话题已选定', `话题：${topic}`);
            } catch (e) {
                topic = topics[Math.floor(Math.random() * topics.length)];
                updateAIStatus('话题筛选失败，随机选取', `话题：${topic}`);
            }

            // 3. 写文章（已集成 humanizer 去 AI 化规则，一次成型）
            updateAIStatus('AI 正在构思文章（含去 AI 化）...', `话题：${topic}`);
            let finalArticle = await generateArticle(topic, settings);
            updateAIStatus('文章生成完成', `字数：约 ${finalArticle.length} 字`);

            // 3.5 生成封面图（Pollinations 背景 + Canvas 合成文字）
            let coverImage = null;
            try {
                updateAIStatus('正在规划封面图...', '');
                const coverPlan = await planCoverImage(finalArticle, settings);
                updateAIStatus('正在生成封面图...', `场景：${coverPlan.scene.substring(0, 20)}...`);
                coverImage = await generateArticleCover(coverPlan, 88888);
                updateAIStatus('封面图生成完成', '');
            } catch (e) {
                console.error('封面图生成失败:', e.message);
                updateAIStatus('封面图生成失败，跳过封面', '');
            }

            // 4. 规划配图
            const imageCount = settings.imageCount;
            updateAIStatus('正在规划配图...', `计划 ${imageCount} 张`);
            let imagePrompts = [];
            try {
                imagePrompts = await planImages(finalArticle, imageCount, settings);
                updateAIStatus('配图规划完成', `${imagePrompts.length} 个 prompt`);
            } catch (e) {
                imagePrompts = [
                    'editorial photography, modern cityscape, warm sunset light, ultra detailed, 8k quality, no text, no watermark',
                    'editorial photography, technology concept, blue tones, ultra detailed, 8k quality, no text, no watermark',
                    'editorial photography, lifestyle scene, warm atmosphere, ultra detailed, 8k quality, no text, no watermark',
                    'editorial photography, abstract concept, minimal composition, ultra detailed, 8k quality, no text, no watermark'
                ].slice(0, imageCount);
                updateAIStatus('配图规划失败，用默认 prompt', '');
            }

            // 5. 生成图片（并行生成，速度提升 3-4 倍）
            // 失败时插入占位图，保留文章结构，用户可手动替换
            const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">` +
                `<rect width="1280" height="720" fill="#F3F4F6"/>` +
                `<text x="640" y="340" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#9CA3AF">📷 图片加载失败</text>` +
                `<text x="640" y="400" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#9CA3AF">请手动上传替换</text>` +
                `</svg>`
            );

            updateAIStatus('正在生成配图...', `共 ${imagePrompts.length} 张（并行生成中）`);

            const aiImageTasks = imagePrompts.map((prompt, i) =>
                generateImage(prompt, 1000 + i * 111, 90000)
                    .then(dataUri => ({ ok: true, dataUri, caption: `配图${i + 1}`, index: i }))
                    .catch(e => {
                        console.error(`图片 ${i + 1} 生成失败:`, e.message);
                        return { ok: false, dataUri: PLACEHOLDER_IMG, caption: `配图${i + 1}（加载失败，请替换）`, index: i };
                    })
            );

            // 进度更新
            let aiCompleted = 0;
            aiImageTasks.forEach(t => t.finally(() => {
                aiCompleted++;
                updateAIStatus('正在生成配图...', `已完成 ${aiCompleted}/${imagePrompts.length} 张（并行生成）`);
            }));

            const aiResults = await Promise.all(aiImageTasks);
            aiResults.sort((a, b) => a.index - b.index);
            const imageUrls = aiResults.map(r => r.dataUri);
            const imageCaptions = aiResults.map(r => r.caption);
            const successCount = aiResults.filter(r => r.ok).length;
            const failCount = aiResults.length - successCount;

            // 6. 把图片插入文章（封面图插最开头，正文配图插章节后）
            updateAIStatus('正在排版...', `插入 ${imageUrls.length} 张配图（其中 ${successCount} 张成功）`);
            if (imageUrls.length > 0) {
                finalArticle = insertImagesIntoArticle(finalArticle, imageUrls, imageCaptions);
            }
            // 封面图插入文章最开头
            if (coverImage) {
                finalArticle = `![封面](${coverImage})\n\n` + finalArticle;
            }

            // 7. END 结束标识由 renderStyledHTML 模板自动追加（在 updatePreview 中），不写入 Markdown
            // 这样无论 Markdown 如何转换、是否重新排版，END 都会用主题样式渲染

            // 8. 排版 + 预览（复用外部全局函数）
            const formatted = smartFormatText(finalArticle);
            const html = markdownToHTML(formatted);
            editor.innerHTML = html;
            updatePreview();

            const imgInfo = successCount > 0
                ? `配图 ${successCount}/${imageUrls.length} 张成功`
                : `配图全部使用占位图（可手动替换）`;
            updateAIStatus('完成！可切换主题/颜色后复制到公众号', `话题：${topic} | ${imgInfo}`);
            showAISpinner(false);
            showToast(`AI 工作流完成！文章 + ${successCount} 张配图`);
        } catch (e) {
            console.error(e);
            updateAIStatus('出错了：' + e.message, '');
            showAISpinner(false);
            showToast('工作流出错：' + e.message);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ===== 9.5 Tab1 创作：文章生成（参数化版本，不影响原 aiWorkflow）=====
    // 共享状态：三 Tab 之间传递的文章内容
    window.workflowState = window.workflowState || {
        article: '',      // Tab1 产出的 Markdown 文章
        topic: '',        // 当前话题
        wordCount: 1200,  // 字数设置
        direction: 'opinion', // 内容方向
        style: 'deep',    // 风格
        sections: 4        // 章节数
    };

    // 参数化文章生成（与原 generateArticle 并存，避免影响 aiWorkflow）
    async function generateArticleWithParams(topic, settings, opts) {
        opts = opts || {};
        const wordCount = opts.wordCount || 1200;
        const style = opts.style || 'deep';
        const direction = opts.direction || 'opinion';
        const sections = opts.sections || 4;

        // 无 API Key 时，直接走演示模式
        if (!settings || !settings.apiKey) {
            return {
                article: generateMockArticle(topic, { wordCount, style, direction, sections }),
                isMock: true,
                mockReason: '未配置 API Key'
            };
        }

        try {
            const article = await _generateArticleWithLLM(topic, settings, opts);
            // 检查返回内容：如果太短（<100字）说明 LLM 返回异常，回退到演示模式
            if (!article || article.trim().length < 100) {
                console.warn('[generateArticleWithParams] LLM 返回内容过短（' + (article?.length || 0) + '字），回退到演示模式');
                return {
                    article: generateMockArticle(topic, { wordCount, style, direction, sections }),
                    isMock: true,
                    mockReason: 'LLM 返回内容过短（' + (article?.length || 0) + '字）'
                };
            }
            return { article, isMock: false, mockReason: '' };
        } catch (e) {
            console.warn('[generateArticleWithParams] LLM 调用失败，回退到演示模式：', e.message);
            return {
                article: generateMockArticle(topic, { wordCount, style, direction, sections }),
                isMock: true,
                mockReason: e.message
            };
        }
    }

    // 真实 LLM 调用（原 generateArticleWithParams 主体）
    // 核心改进：基于资讯背景 + 人设视角写有价值分析，而非空泛套话
    async function _generateArticleWithLLM(topic, settings, opts) {
        opts = opts || {};
        const wordCount = opts.wordCount || 1200;
        const style = opts.style || 'deep';
        const direction = opts.direction || 'opinion';
        const sections = opts.sections || 4;
        const newsContext = opts.newsContext || '';

        // 风格映射（保留参数生效，但用一句话描述）
        const styleMap = {
            deep: '深度思考，观点犀利，有逻辑推演',
            casual: '轻松随性，口语化，像朋友聊天',
            story: '故事叙事，用具体场景和人物展开',
            sharp: '立场鲜明，敢下判断，但避免情绪化攻击',
            warm: '温暖治愈，关注普通人的微小感受'
        };
        const directionMap = {
            opinion: '表达独立思考后的判断，敢于给出立场',
            experience: '以第一人称讲实操经验，给出可执行建议',
            knowledge: '用通俗语言讲清楚一个概念，避免术语堆砌',
            emotion: '关注读者内心感受，写到读者心里去'
        };

        // 资讯背景
        const bgLine = newsContext
            ? `\n资讯参考（可引用事实，不要照抄）：${newsContext}\n`
            : '';

        // 自然语言式 prompt：不用【】标记（避免 LLM 回显标记），
        // 用段落式描述代替结构化条目，减少触发推理模型 CoT 的概率
        const minWords = Math.max(600, wordCount - 100);
        const maxWords = wordCount + 200;
        const sectionWords = Math.floor(wordCount / sections);

        // system 消息：设定资深编辑人设 + 全局禁词表（去 AI 味）
        const systemPrompt = `你是一位有十年从业经验的公众号资深主笔，写过大量被读者主动转发的原创文章。你的文字有三个特征：第一，有真实的观察和判断，不是空话套话；第二，句子长短交错，像说话一样自然，没有 AI 痕迹；第三，每段只讲一个意思，讲完就换段，不拖泥带水。

你坚决避免以下"AI 腔"词汇和句式，出现即视为不合格：
- 过渡词类：综上所述、总而言之、由此可见、与此同时、在此基础上、进而、由此、那么、因此、所以、然而、不过、总的来说、换言之、简而言之、首先、其次、最后、此外、值得一提的是、至关重要、深入探讨、赋能、沉淀、迭代、落地、闭环、抓手、赛道、破局、重塑、加持、维度、层面
- 句式类："不仅是…更是…"、"不是…而是…"、"既…又…"、"一方面…另一方面…"三段论式排比
- 反思句："这不禁让我们思考"、"这让我们意识到"、"未来必将"、"在这个XX的时代"
- AI 开头："在XX的背景下"、"随着XX的发展"、"XX时代下"、"当下社会"
- 标点：不用破折号，不用分号堆叠长句

你要像跟一个聪明的朋友聊天那样写作：直接、有信息量、敢下判断，但留有余地。宁可说"我觉得"也不要装作客观。宁可说大白话也不要用大词。`;

        // user 消息：具体写作任务（不再给"标题示例"，避免照抄；原则用文字描述）
        const userPrompt = `请基于「${topic}」写一篇原创公众号文章，字数 ${minWords}-${maxWords} 字（目标 ${wordCount} 字），分 ${sections} 个章节，每章 ${sectionWords} 字以上。

写作风格：${styleMap[style] || styleMap.deep}
内容方向：${directionMap[direction] || directionMap.opinion}
${bgLine}
格式要求：必须是 Markdown 格式，结构如下——
1. 第一行是 # 一级标题（15-25 字，要有信息量，让人想点开看，可以用数字、悬念、反差、具体场景，但不要用「」书名号，不要套用模板句式）
2. 紧跟一个 > 引用块引言（60-90 字，点出核心矛盾或抛出问题，不要写成总结）
3. 用 ## 划分 ${sections} 个章节，章节标题要传达信息量（不要用"第一章""第二部分"这种编号）
4. 文末可以有一段简短收束（2-3 句），但不要自我介绍，不要加 END、完、以上等标记

内容要求：
- 紧扣「${topic}」展开，每段都服务于主题，不要发散跑题
- 要有独立观点和信息增量，让读者读完获得新认知，而不是"我也知道"的废话
- 要有具体的生活观察、个人体验、情感细节，避免空泛议论
- 段落松散自由，每段 2-3 句，一个想法讲完就换段
- 第一人称写作，可以适度口语化（如"说实话""坦白讲""老实讲"），但不要每段都用

事实要求：
- 不得编造具体数据、统计数字、百分比、人物姓名、公司名称、新闻事件、案例、名言出处
- 可以用"身边有朋友""我观察到""有人说过"等泛化表达
- 观点和情感可以自由发挥，但事实层面必须诚实

话题边界：
- 不碰宗教、政治、政党、政策立场、国家领导人、民族独立、领土争端、民族矛盾
- 如果话题触碰以上，请自动转换到生活化、人性化、情感化的侧面来写

输出要求：
- 请直接输出文章正文，从 # 标题开始
- 不要输出任何思考过程、结构规划、字数统计、审查说明、生成备注
- 不要在文章前后加任何解释性文字`;
        return await callLLM({ system: systemPrompt, user: userPrompt }, settings);
    }

    // ===== 高保真演示模式：无 API Key 或调用失败时使用的本地文章生成器 =====
    // 严格遵循项目红线：无宗教/政治/领导人；无杜撰数据/人物/事件；段落松散自由
    // 字数 1000-1500 字，每章节 250-350 字，段落 2-3 句，段间空行
    function generateMockArticle(topic, opts) {
        opts = opts || {};
        const style = opts.style || 'deep';
        const direction = opts.direction || 'opinion';
        const sections = Math.min(Math.max(opts.sections || 4, 3), 5);
        const topicStr = (topic || '生活的另一种可能').trim();
        const shortTopic = topicStr.length > 12 ? topicStr.slice(0, 12) + '…' : topicStr;

        // 爆款标题技巧：数字+悬念+具体场景+情绪点
        const titleStyles = [
            `# 为什么90%的人看完${shortTopic}之后，沉默了`,
            `# ${shortTopic}背后，藏着普通人都忽略的3个真相`,
            `# 关于${shortTopic}，没人愿意告诉你的那些事`,
            `# ${shortTopic}火了，但我劝你先冷静下来想一想`,
            `# 我研究了${shortTopic}一周，发现事情没那么简单`
        ];
        const title = titleStyles[Math.floor(Math.random() * titleStyles.length)];

        const styleTone = {
            deep: '冷静地讲，这件事比想象中复杂。我们常常以为想清楚了，其实只是把表面那一层揭开了，底下还有褶皱，只是没人愿意多看一眼。',
            casual: '说实话，这事儿聊起来挺有意思。朋友之间偶尔开几句玩笑，倒比一本正经地说道理更接近真相，也更让人愿意听进去。',
            story: '让我想起去年遇到的一个朋友，他跟这件事的关系不一般，但他自己从来没正面承认过，只是偶尔话里话外露一点。',
            sharp: '别急着站队，先把事实摆清楚。情绪化的判断往往在最关键的地方把人引偏，等回过神来已经走远了。',
            warm: '我们都是普通人，能在小事里找到一点光就很好了，不必每件事都追求彻底想明白，那样太累了。'
        }[style] || '冷静地讲，这件事比想象中复杂。我们常常以为想清楚了，其实只是把表面那一层揭开了，底下还有褶皱。';

        const directionHook = {
            opinion: `关于${shortTopic}，我想说一个不太一样的观点，可能跟主流的看法不太一样，但值得停下来想一想，不急着下结论。`,
            experience: `聊${shortTopic}这个话题，我能分享的是一点一点试出来的经验，不一定都对，至少是亲测过的，比纸上谈兵靠谱一些。`,
            knowledge: `要弄明白${shortTopic}，得先把它拆成几个小问题来看，一个一个说清楚，比想象中容易理解，也不容易绕进去。`,
            emotion: `说到${shortTopic}，先别急着下定义，先想想这件事在我们心里到底意味着什么，很多时候答案就藏在那个模糊的地方。`
        }[direction] || `关于${shortTopic}，我想说一个不太一样的观点，可能跟主流的看法不太一样，但值得停下来想一想。`;

        const sectionTemplates = [
            {
                title: '表面看起来很简单',
                paras: [
                    `${topicStr}，听起来像是日常生活里再普通不过的一件事，第一次听到的时候大多数人会下意识点头，觉得懂了，不需要多想。`,
                    `可一旦认真琢磨，会发现它背后藏着的褶皱比想象中多，那些被一句"就是这样"盖过去的地方，才是值得停下来多看一眼的地方。`,
                    `${styleTone}`,
                    `${directionHook}`,
                    `普通人不一定非要把这些想清楚，但偶尔停下来想一下，会让生活多出一些不一样的质感，至少不会一直在惯性里滑下去。`
                ]
            },
            {
                title: '藏在细节里的另一面',
                paras: [
                    `身边有不少朋友提过类似感受，只是大家平时不太愿意展开聊，怕显得想太多，或者怕别人觉得自己矫情，干脆一笑带过。`,
                    `把它放在更长的时间维度看，会发现一些有意思的轨迹，那些曾经被忽略的小事，回头看竟然成了关键节点，只是当时没意识到。`,
                    `不是非黑即白那种简单，而是渐变过渡的灰，每一层灰里都藏着不同的取舍和妥协，外人看不出来。`,
                    `我们看到的所谓"结果"，其实是一长串选择叠加之后的产物，不是某一次决定决定的，这一点容易被忽略。`
                ]
            },
            {
                title: '为什么这件事值得多想一层',
                paras: [
                    `我们常常习惯用最顺手的方式去理解问题，省事是省事了，代价也不小，因为顺手的方式往往也是偷懒的方式，看不到全貌。`,
                    `多问一句"真的是这样吗"，往往能看到被忽略的角落，那里藏着另一套解释和另一种可能，比第一印象有意思得多。`,
                    `这并不是要给自己找麻烦，而是给判断留一点余地，余地多了，焦虑反而会少一点，人也松弛一些。`,
                    `想得多一点不等于想得复杂，有时候只是把想得不够的地方补上而已，补完之后反而简单了。`
                ]
            },
            {
                title: '可以怎么走下一步',
                paras: [
                    `如果愿意稍微调整一下视角，事情未必会立刻变好，但至少不会被惯性推着走，被动地接受别人给的答案和节奏。`,
                    `小步试错比一次押宝要稳得多，每一次小的调整都能带来新的反馈，反馈会告诉你下一步往哪里走，不用一次想清楚。`,
                    `把节奏放慢一点，反而看得更清楚，因为有些东西只有时间能给你答案，急也急不来，越急越容易看偏。`,
                    `走得不快没关系，关键是方向别偏，别走着走着把自己走丢了，回头一看不知道自己在哪。`
                ]
            },
            {
                title: '剩下的留给时间',
                paras: [
                    `有些答案不是当下能给的，需要让生活再走一段，让更多的经历填进来，答案会自己浮上来，不用硬挤。`,
                    `此刻能做的，是把该想清楚的想清楚，该放下的放下，剩下的就交给时间和慢慢长大的自己，不急。`,
                    `${shortTopic}这件事，最后大概会以我们没有预料到的方式回到我们身边，那时候再看今天的纠结，可能会笑出来。`,
                    `人也好，事也好，都有它们自己的节奏，急不得，慢一点未必是坏事，快也未必是好事。`
                ]
            }
        ];

        const picks = sectionTemplates.slice(0, sections);
        const body = picks.map(s => {
            const paras = s.paras.join('\n\n');
            return `## ${s.title}\n\n${paras}`;
        }).join('\n\n');

        // 不在正文里放 - E N D - 标记，由排版模板的 data-end-marker 统一处理
        const article = `${title}\n\n> 我们以为看懂了一件事，往往只是看懂了自己想看的那一面。\n\n${body}\n\n## 写在最后\n\n生活里大多数事情都没有标准答案，${shortTopic}也是。\n\n能多想一层，就多一层余地，能把节奏放慢一点，就更稳一点。\n\n不是每件事都要立刻有结论，有些事慢慢长出来，反而更结实。`;
        return article;
    }

    // 更新创作状态显示
    function setCreateStatus(text, show) {
        if (createStatus) createStatus.style.display = show ? 'block' : 'none';
        if (createStatusText) createStatusText.textContent = text;
    }

    // 生成文章主函数（Tab1）
    async function createGenerateArticle(isRegenerate) {
        const settings = getAISettings();
        const isDemo = !settings || !settings.apiKey;
        const topic = (createTopicInput && createTopicInput.value.trim()) || window.workflowState.topic;
        if (!topic) {
            showToast('请先输入话题或选择热搜');
            return;
        }
        // 记录参数
        window.workflowState.topic = topic;
        window.workflowState.wordCount = createWordCount ? parseInt(createWordCount.value, 10) : 1200;
        window.workflowState.direction = createDirectionSel ? createDirectionSel.value : 'opinion';
        window.workflowState.style = createStyleSel ? createStyleSel.value : 'deep';
        window.workflowState.sections = createSectionsSel ? parseInt(createSectionsSel.value, 10) : 4;

        // 获取当前调用的模型名称（用于状态条显示）
        const llmConfig = LLM_PROVIDERS[settings.provider] || LLM_PROVIDERS.deepseek;
        const llmModelName = (llmConfig.editable && settings.model) ? settings.model : llmConfig.model;
        const modelLabel = isDemo ? '演示模式（未配置 API Key）' : `${llmConfig.name} · ${llmModelName}`;

        // 按钮 loading
        const btn = isRegenerate ? createRegenerateBtn : createGenerateBtn;
        const origText = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 生成中...'; }
        if (createGenerateBtn) { createGenerateBtn.disabled = true; createGenerateBtn.textContent = '⏳ 生成中...'; }
        setCreateStatus(isDemo ? `演示模式生成中... [模型：${modelLabel}]` : `AI 正在生成文章（含去 AI 化处理）... [模型：${modelLabel}]`, true);

        try {
            const result = await generateArticleWithParams(topic, settings, {
                wordCount: window.workflowState.wordCount,
                direction: window.workflowState.direction,
                style: window.workflowState.style,
                sections: window.workflowState.sections,
                newsContext: window.workflowState.newsContext || ''
            });
            const article = result.article;
            // 显示编辑区
            if (createArticleSection) createArticleSection.style.display = 'block';
            if (createEmptyState) createEmptyState.style.display = 'none';
            if (createArticleArea) createArticleArea.value = article;
            // 更新字数
            updateCreateWordNum();
            // 启用重新生成按钮
            if (createRegenerateBtn) { createRegenerateBtn.disabled = false; createRegenerateBtn.style.cursor = 'pointer'; createRegenerateBtn.style.color = '#10B981'; createRegenerateBtn.style.borderColor = '#10B981'; }
            // 存入 workflowState
            window.workflowState.article = article;
            // 根据是否是 mock 显示不同的状态信息
            if (result.isMock) {
                // LLM 调用失败，明确告知用户失败原因
                const reason = result.mockReason || '未知原因';
                setCreateStatus(
                    `⚠️ LLM 调用失败：${reason}。当前为演示模式占位文章（约 ${article.length} 字），内容与话题无关。请检查 AI 设置（API Key、Base URL、模型）后重试。`,
                    true
                );
                showToast(`LLM 调用失败：${reason}，已用演示占位文章替代`);
            } else {
                setCreateStatus(
                    `✓ 文章已生成，约 ${article.length} 字。[模型：${modelLabel}] 可编辑后进入「排版助手」`,
                    true
                );
                showToast('文章生成完成！');
            }
        } catch (e) {
            console.error(e);
            setCreateStatus('生成失败：' + e.message, true);
            showToast('生成失败：' + e.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            if (createGenerateBtn) { createGenerateBtn.disabled = false; createGenerateBtn.textContent = '🚀 生成文章'; }
        }
    }

    // 字数统计
    function updateCreateWordNum() {
        if (!createArticleArea || !createWordNum) return;
        const text = createArticleArea.value.trim();
        // 去除 markdown 标记后的中文字符数
        const cleanText = text.replace(/[#*>`\-\[\]\(\)!]/g, '');
        createWordNum.textContent = `${cleanText.length} 字`;
    }

    // ===== Tab1 选题中心（参考 daily-news-podcast skill 设计）=====
    // 多源分级 + 四大板块分类 + 红线过滤
    // 来源优先级：1.微博热搜 2.抖音热点 3.36氪科技 4.推荐选题
    // 四大板块：互联网 #2563eb / 职场 #7c3aed / 科技 #16a34a / 社会爆款 #dc2626

    // ===== AI 配置状态横幅 =====
    function updateCreateAIBanner() {
        const banner = document.getElementById('createAIStatusBanner');
        if (!banner) return;
        const settings = getAISettings();
        if (settings && settings.apiKey) {
            const config = LLM_PROVIDERS[settings.provider] || LLM_PROVIDERS.deepseek;
            const modelName = (config.editable && settings.model) ? settings.model : config.model;
            banner.style.display = 'flex';
            banner.style.background = '#ECFDF5';
            banner.style.border = '1px solid #6EE7B7';
            banner.style.color = '#065F46';
            banner.innerHTML = '<span style="color:#10B981;">●</span> AI 已配置 · ' + config.name + ' · ' + modelName
                + '<span style="margin-left:8px;padding:2px 8px;background:#fff;border:1px solid #6EE7B7;border-radius:4px;font-size:11px;cursor:pointer;color:#065F46;" id="aiBannerTestBtn">测试连接</span>';
            banner.onclick = null;
            banner.style.cursor = 'default';
            const testBtn = document.getElementById('aiBannerTestBtn');
            if (testBtn) {
                testBtn.onclick = async function(e) {
                    if (e) e.stopPropagation();
                    testBtn.textContent = '测试中...';
                    testBtn.style.opacity = '0.6';
                    try {
                        await callLLM('请回复"OK"', settings);
                        testBtn.textContent = '✓ 连接成功';
                        testBtn.style.color = '#065F46';
                        testBtn.style.borderColor = '#10B981';
                    } catch (err) {
                        testBtn.textContent = '✗ 连接失败';
                        testBtn.style.color = '#B91C1C';
                        testBtn.style.borderColor = '#FCA5A5';
                        showToast('AI 连接失败：' + (err && err.message ? err.message : '未知错误') + '，请检查 API Key 与网络');
                    } finally {
                        testBtn.style.opacity = '1';
                        setTimeout(() => { testBtn.textContent = '测试连接'; testBtn.style.color = '#065F46'; testBtn.style.borderColor = '#6EE7B7'; }, 3000);
                    }
                };
            }
        } else {
            banner.style.display = 'flex';
            banner.style.background = '#FEF3C7';
            banner.style.border = '1px solid #FCD34D';
            banner.style.color = '#92400E';
            banner.innerHTML = '<span>⚠️</span> 尚未配置 AI，创作功能需要 AI 支持。<span style="text-decoration:underline;font-weight:600;">点击此处配置 →</span>';
            banner.onclick = function() {
                // 复用顶部 AI 设置按钮的完整初始化逻辑（填充 provider/key/model 等）
                const btn = document.getElementById('aiSettingsBtn');
                if (btn) btn.click();
            };
            banner.style.cursor = 'pointer';
        }
    }
    // 暴露到全局，供顶层 tab 切换处理器调用（updateCreateAIBanner 定义在 IIFE 内）
    window.updateCreateAIBanner = updateCreateAIBanner;

    const TOPIC_CATEGORIES = {
        internet: { name: '互联网', color: '#2563eb' },
        workplace: { name: '职场', color: '#7c3aed' },
        tech: { name: '科技', color: '#16a34a' },
        society: { name: '社会爆款', color: '#dc2626' }
    };

    // 红线关键词：选题标题含这些词的过滤掉
    const TOPIC_REDLINE_KEYWORDS = [
        '台独', '两岸', '一国两制', '西藏', '新疆', '香港独立', '主权',
        '总统', '主席', '总理', '国家领导人', '总书记',
        '法轮功', '六四', '天安门', '文革',
        '宗教冲突', '教义', '种族冲突'
    ];

    // 抖音风社会热点（CORS 限制下无法直抓，预置高质量选题）
    const DOUYIN_TOPICS = [
        { title: '打工人下班后的真实状态', cat: 'workplace', desc: '当代职场人下班后的疲惫与放松，引发共鸣' },
        { title: '独居年轻人怎么过周末', cat: 'society', desc: '独居生活百态，从社交回避到自我相处' },
        { title: '当代年轻人的消费降级', cat: 'society', desc: '从冲动消费到理性回归，消费观念转变' },
        { title: '996 之外的另一种可能', cat: 'workplace', desc: '工作与生活平衡的新探索' },
        { title: '为什么大家越来越不想发朋友圈了', cat: 'society', desc: '社交疲劳背后的心理变化' },
        { title: '返乡青年在小城市的生活', cat: 'society', desc: '逃离大城市后的真实感受' },
        { title: '30 岁还没结婚的人在想什么', cat: 'society', desc: '婚恋焦虑与社会期待的真实对话' },
        { title: '同事之间的边界感', cat: 'workplace', desc: '职场人际关系的新共识' },
        { title: '下班后还要回工作消息吗', cat: 'workplace', desc: '工作与私人时间的界限之争' },
        { title: '为什么年轻人开始反向消费', cat: 'society', desc: '不追求品牌，更注重性价比和体验' }
    ];

    // 36 氪风科技商业（CORS 限制下无法直抓，预置高质量选题）
    const KR36_TOPICS = [
        { title: 'AI 大模型对普通人工作的影响', cat: 'tech', desc: 'AI 正在改变哪些岗位，普通人如何应对' },
        { title: '国产 AI 产品的最新进展', cat: 'tech', desc: '国产大模型产品的实用化探索' },
        { title: '大厂裁员潮背后的逻辑', cat: 'workplace', desc: '行业调整期的人才流动趋势' },
        { title: '短视频平台的算法怎么影响我们', cat: 'internet', desc: '推荐算法对内容消费的深层影响' },
        { title: 'AI 工具如何改变内容创作', cat: 'tech', desc: '从写作到配图，AI 工具重塑创作流程' },
        { title: '互联网平台的治理新趋势', cat: 'internet', desc: '平台监管与内容生态的平衡' },
        { title: '远程办公会成为常态吗', cat: 'workplace', desc: '混合办公模式的未来走向' },
        { title: 'AI 副业到底能不能赚到钱', cat: 'tech', desc: 'AI 副业的真实收益与陷阱' },
        { title: '国产手机品牌的下一步', cat: 'tech', desc: '国产手机在高端市场的突破' },
        { title: '内容平台如何应对 AI 生成内容', cat: 'internet', desc: 'AIGC 时代的内容治理新挑战' }
    ];

    // 推荐选题（深度思考向，不依赖外部 API）
    const RECOMMEND_TOPICS = [
        { title: '普通人如何过好这一生', cat: 'society', desc: '在没有标准答案的生活里找到自己的节奏' },
        { title: '为什么越长大越不容易开心', cat: 'society', desc: '成年后快乐阈值变化的思考' },
        { title: '独处是一种被低估的能力', cat: 'society', desc: '独处与孤独的区别，以及独处的价值' },
        { title: '那些 30 岁才明白的事', cat: 'workplace', desc: '年龄节点带来的人生感悟' },
        { title: '工作之外，人生还能装下什么', cat: 'workplace', desc: '职业身份之外的自我探索' },
        { title: '为什么我们总是想得太多做得太少', cat: 'society', desc: '行动力不足的心理根源' },
        { title: '慢下来，生活会还你一份从容', cat: 'society', desc: '快节奏时代的反潮流思考' },
        { title: '关于「足够好」这件事', cat: 'society', desc: '完美主义之外的另一种活法' },
        { title: '把生活过成自己想要的样子', cat: 'society', desc: '主动选择而非被动接受' },
        { title: '为什么独处比社交更让人放松', cat: 'society', desc: '内向者的能量恢复机制' },
        { title: '30 岁之后，朋友越来越少是好事', cat: 'workplace', desc: '社交圈精简背后的人生做减法' },
        { title: '我们都在用忙碌逃避真正的自己', cat: 'society', desc: '忙碌作为一种心理防御机制' }
    ];

    // 选题中心状态
    const topicCenterState = {
        currentSource: '36kr',         // weibo / douyin / 36kr / recommend
        currentCategory: 'all',          // all / internet / workplace / tech / society
        currentList: []                  // [{title, cat, source}]
    };

    // 红线过滤
    function filterByRedline(items) {
        return items.filter(item => {
            const t = item.title || item;
            return !TOPIC_REDLINE_KEYWORDS.some(kw => t.includes(kw));
        });
    }

    // 抓取微博热搜（vvhan API 1次3秒 → 失败后用 IT之家 RSS 作为热点 fallback）
    async function fetchWeiboTopics() {
        const now = new Date();
        const timeStr = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`;
        // 尝试 vvhan API（1 次，3 秒超时）
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            const resp = await fetch('https://api.vvhan.com/api/hotlist/wbHot', { signal: controller.signal });
            clearTimeout(timer);
            if (resp.ok) {
                const data = await resp.json();
                const items = (data.data || []).slice(0, 20).map(item => ({
                    title: item.title || item.name || '',
                    cat: guessCategory(item.title || item.name || ''),
                    source: '微博',
                    desc: (item.title || '').slice(0, 30) + '...',
                    time: timeStr
                })).filter(it => it.title);
                if (items.length > 0) return filterByRedline(items);
            }
        } catch (e) {
            console.warn('[微博] vvhan API 失败，切换到 IT之家 RSS');
        }
        // fallback：IT之家 RSS（真实资讯）
        try {
            const items = await fetchRSSNews('https://www.ithome.com/rss', '微博');
            if (items.length > 0) return items;
        } catch (e) {
            console.warn('[微博] IT之家 RSS 也失败，使用预置选题');
        }
        // 最后兜底：预置选题（标记 _isMock，渲染时诚实提示）
        return [
            { title: '当代年轻人的精神状态', cat: 'society', desc: '年轻人面对压力的真实反应', time: timeStr, source: '微博', _isMock: true },
            { title: 'AI 改变了哪些工作', cat: 'tech', desc: 'AI 技术对传统岗位的冲击', time: timeStr, source: '微博', _isMock: true },
            { title: '大厂年终奖真相', cat: 'workplace', desc: '互联网行业薪酬福利现状', time: timeStr, source: '微博', _isMock: true },
            { title: '互联网行业的下一个风口', cat: 'internet', desc: '行业趋势预测与新机会', time: timeStr, source: '微博', _isMock: true }
        ];
    }

    // 简易分类：根据标题关键词猜测板块
    function guessCategory(title) {
        const t = title.toLowerCase();
        if (/(ai|人工智能|大模型|gpt|claude|芯片|算法|科技|产品发布|手机|电脑|deepseek|openai|苹果|特斯拉|小米|华为)/.test(t)) return 'tech';
        if (/(裁员|招聘|工作|上班|职场|996|加班|副业|就业|同事|boss|裁员|年终奖|薪酬)/.test(t)) return 'workplace';
        if (/(抖音|微博|平台|流量|算法推荐|内容生态|公众号|小红书|b站|互联网|大厂|腾讯|阿里|字节)/.test(t)) return 'internet';
        return 'society';
    }

    // ===== 真实 RSS 资讯抓取（通过 rss2json 服务绕过 CORS）=====
    async function fetchRSSNews(rssUrl, sourceName) {
        const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const resp = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timer);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data.status !== 'ok' || !data.items) throw new Error('RSS 解析失败');
            const items = data.items.slice(0, 20).map(item => {
                // 解析发布时间
                let timeStr = '未知时间';
                try {
                    const d = new Date(item.pubDate);
                    if (!isNaN(d)) {
                        const now = new Date();
                        const diff = (now - d) / 3600000; // 小时差
                        if (diff < 1) timeStr = `${Math.floor(diff * 60)}分钟前`;
                        else if (diff < 24) timeStr = `${Math.floor(diff)}小时前`;
                        else timeStr = `${d.getMonth() + 1}月${d.getDate()}日`;
                    }
                } catch {}
                // 提取摘要（去掉 HTML 标签）
                let desc = item.description || item.content || '';
                desc = desc.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
                if (desc.length > 80) desc = desc.slice(0, 80) + '...';
                return {
                    title: item.title || '',
                    cat: guessCategory(item.title || ''),
                    source: sourceName,
                    desc: desc || '暂无摘要',
                    time: timeStr,
                    link: item.link || ''
                };
            }).filter(it => it.title);
            if (items.length === 0) throw new Error('无有效条目');
            return filterByRedline(items);
        } catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }

    // 抖音热榜：vvhan API 1次3秒 → 失败后用少数派 RSS 作为 fallback
    async function fetchDouyinTopics() {
        const now = new Date();
        const timeStr = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`;
        // 尝试 vvhan API（1 次，3 秒超时）
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            const resp = await fetch('https://api.vvhan.com/api/hotlist/douyinHot', { signal: controller.signal });
            clearTimeout(timer);
            if (resp.ok) {
                const data = await resp.json();
                const items = (data.data || []).slice(0, 20).map(item => ({
                    title: item.title || item.name || '',
                    cat: guessCategory(item.title || item.name || ''),
                    source: '抖音',
                    desc: (item.title || '').slice(0, 30) + '...',
                    time: timeStr
                })).filter(it => it.title);
                if (items.length > 0) return filterByRedline(items);
            }
        } catch (e) {
            console.warn('[抖音] vvhan API 失败，切换到少数派 RSS');
        }
        // fallback：少数派 RSS（真实资讯）
        try {
            const items = await fetchRSSNews('https://sspai.com/feed', '抖音');
            if (items.length > 0) return items;
        } catch (e) {
            console.warn('[抖音] 少数派 RSS 也失败，使用预置选题');
        }
        // 最后兜底：预置选题（标记 _isMock，渲染时诚实提示）
        return DOUYIN_TOPICS.map(t => ({ ...t, source: '抖音', time: timeStr, _isMock: true }));
    }

    // 综合资讯：聚合多个 RSS 源（36氪+IT之家+少数派），各取前 8 条混合
    async function fetchAggregatedNews() {
        const sources = [
            { url: 'https://36kr.com/feed', name: '36氪' },
            { url: 'https://www.ithome.com/rss', name: 'IT之家' },
            { url: 'https://sspai.com/feed', name: '少数派' }
        ];
        const results = await Promise.allSettled(
            sources.map(s => fetchRSSNews(s.url, s.name))
        );
        let allItems = [];
        results.forEach((r, i) => {
            if (r.status === 'fulfilled' && r.value && r.value.length > 0) {
                // 每个源取前 8 条
                allItems = allItems.concat(r.value.slice(0, 8));
            }
        });
        if (allItems.length === 0) throw new Error('所有 RSS 源均失败');
        // 打乱顺序，让不同来源的内容交叉展示
        for (let i = allItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
        }
        return allItems.slice(0, 20);
    }

    // ===== 公众号订阅模块（前端：localStorage 持久化 + 后端 API 同步 + 降级直抓）=====
    // 部署到 Cloudflare 后由 Pages Functions + D1 提供持久化与搜索；
    // 本地开发（_server.js）无后端时降级为前端直接用 rss2json 代理抓取订阅的 RSS。
    const SUBS_STORAGE_KEY = 'wx_editor_subscriptions_v1';
    const SUBS_CACHE_KEY = 'wx_editor_subs_articles_cache_v1';

    function getLocalSubs() {
        try { return JSON.parse(localStorage.getItem(SUBS_STORAGE_KEY) || '[]'); } catch { return []; }
    }
    function saveLocalSubs(subs) {
        try { localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subs)); } catch {}
    }

    // 后端可用性探测（带缓存，避免每次切换都探测）
    let _subsBackendStatus = 'unknown'; // 'unknown' | 'ok' | 'offline'
    async function detectSubsBackend() {
        if (_subsBackendStatus !== 'unknown') return _subsBackendStatus;
        try {
            const ctrl = AbortSignal.timeout(4000);
            const res = await fetch('/api/subscriptions', { signal: ctrl });
            _subsBackendStatus = res.ok ? 'ok' : 'offline';
        } catch { _subsBackendStatus = 'offline'; }
        return _subsBackendStatus;
    }

    // 获取订阅列表：优先后端，降级 localStorage
    async function loadSubscriptions() {
        const status = await detectSubsBackend();
        if (status === 'ok') {
            try {
                const res = await fetch('/api/subscriptions');
                const data = await res.json();
                // 同步到 localStorage（便于离线查看）
                const local = (data.rows || []).map(r => ({ id: r.id, name: r.name, rss_url: r.rss_url, last_synced_at: r.last_synced_at }));
                saveLocalSubs(local);
                return local;
            } catch (e) { console.warn('加载订阅失败', e); }
        }
        return getLocalSubs();
    }

    // 添加订阅：后端 + localStorage 双写
    async function addSubscription(name, rssUrl) {
        const status = await detectSubsBackend();
        if (status === 'ok') {
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rss_url: rssUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '添加失败');
        }
        // 本地也存一份（双写）
        const local = getLocalSubs();
        // 用 name 或 rssUrl 任一匹配去重（支持空 RSS 的占位订阅）
        if (!local.find(s => (rssUrl && s.rss_url === rssUrl) || s.name === name)) {
            local.push({ name, rss_url: rssUrl || '', _localOnly: status !== 'ok' });
            saveLocalSubs(local);
        }
        return { ok: true };
    }

    // 删除订阅
    async function removeSubscription(sub) {
        const status = await detectSubsBackend();
        if (status === 'ok' && sub.id) {
            await fetch('/api/subscriptions?id=' + encodeURIComponent(sub.id), { method: 'DELETE' });
        }
        const local = getLocalSubs().filter(s => s.rss_url !== sub.rss_url);
        saveLocalSubs(local);
    }

    // 渲染订阅列表（管理弹窗内）
    async function renderSubsList() {
        const listEl = document.getElementById('subsList');
        if (!listEl) return;
        const subs = await loadSubscriptions();
        const hint = document.getElementById('subsBackendHint');
        const status = _subsBackendStatus;
        if (hint) {
            if (status === 'ok') {
                hint.style.display = 'block';
                hint.textContent = '✓ 已连接后端（Cloudflare D1），订阅将持久化存储';
                hint.style.color = '#065F46';
            } else {
                hint.style.display = 'block';
                hint.textContent = '⚠ 后端未部署：当前订阅仅保存在本地浏览器，部署 Cloudflare 后可持久化与自动同步';
                hint.style.color = '#92400E';
            }
        }
        if (subs.length === 0) {
            listEl.innerHTML = '<div style="padding:16px;text-align:center;color:#9CA3AF;font-size:13px;border:1px dashed #E5E7EB;border-radius:8px;">暂无订阅，请在上方添加公众号 RSS 链接</div>';
            return;
        }
        listEl.innerHTML = subs.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;margin-bottom:6px;">
                <span style="flex:1;font-size:13px;color:#1F2937;font-weight:600;">${escapeHtml(s.name)}</span>
                <span style="flex:2;font-size:11px;color:#9CA3AF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(s.rss_url)}">${escapeHtml(s.rss_url)}</span>
                ${s.last_synced_at ? `<span style="font-size:10px;color:#07C160;">已同步</span>` : ''}
                <button type="button" data-rss="${escapeHtml(s.rss_url)}" class="del-sub-btn" style="padding:3px 8px;background:#fff;color:#E11D48;border:1px solid #E11D48;border-radius:4px;font-size:11px;cursor:pointer;">删除</button>
            </div>
        `).join('');
        listEl.querySelectorAll('.del-sub-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const rss = btn.dataset.rss;
                const sub = subs.find(s => s.rss_url === rss);
                if (sub) {
                    await removeSubscription(sub);
                    renderSubsList();
                    showToast('已删除订阅');
                }
            });
        });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 获取公众号订阅文章（供 switchTopicSource 调用）
    // 优先：后端 API 查询 D1（部署后）；降级：前端用 rss2json 代理直抓订阅的 RSS（本地可用）
    async function fetchWechatSubsArticles() {
        const subs = await loadSubscriptions();
        if (!subs || subs.length === 0) {
            // 无订阅：返回空列表（由 renderTopicList 显示空状态），并提示去添加
            setTimeout(() => showToast('暂无公众号订阅，点"⚙ 订阅"添加'), 200);
            return [];
        }
        const status = _subsBackendStatus;
        let items = [];
        if (status === 'ok') {
            // 后端可用：查询 D1
            try {
                const res = await fetch('/api/articles?size=30');
                const data = await res.json();
                items = (data.rows || []).map(r => ({
                    title: r.title,
                    cat: guessCategory(r.title || ''),
                    source: r.source,
                    desc: (r.content || '').slice(0, 80),
                    time: r.pub_date ? formatPubDate(r.pub_date) : '未知时间',
                    link: r.url,
                    _isReal: true
                }));
                return items;
            } catch (e) {
                console.warn('[公众号订阅] 后端查询失败，降级前端直抓', e);
            }
        }
        // 降级：前端用 rss2json 代理直抓每个订阅的 RSS（绕过 CORS）
        const results = await Promise.allSettled(subs.map(s => fetchRSSNews(s.rss_url, s.name)));
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value && r.value.length) {
                items = items.concat(r.value.slice(0, 8));
            }
        });
        if (items.length === 0) {
            // 抓取失败：用缓存（如果有）
            try {
                const cache = JSON.parse(localStorage.getItem(SUBS_CACHE_KEY) || '[]');
                if (cache.length) {
                    setTimeout(() => showToast('实时抓取失败，显示最近缓存'), 200);
                    return cache;
                }
            } catch {}
            throw new Error('公众号订阅抓取失败');
        }
        // 缓存一份
        try { localStorage.setItem(SUBS_CACHE_KEY, JSON.stringify(items.slice(0, 50))); } catch {}
        return items.slice(0, 30);
    }

    function formatPubDate(d) {
        try {
            const date = new Date(d);
            if (isNaN(date)) return '未知时间';
            const now = new Date();
            const diff = (now - date) / 3600000;
            if (diff < 1) return `${Math.floor(diff * 60)}分钟前`;
            if (diff < 24) return `${Math.floor(diff)}小时前`;
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        } catch { return '未知时间'; }
    }

    // ===== 微信爆文榜（多源降级：后端 API → rss2json 公共 RSS → 诚实标注的示例榜）=====
    // 后端 /api/hot-articles 已尝试 RSSHub 公共实例；前端再做一层 rss2json 兜底。
    async function fetchWechatHotArticles() {
        // 1. 优先调后端
        try {
            const ctrl = AbortSignal.timeout(9000);
            const res = await fetch('/api/hot-articles?size=30', { signal: ctrl });
            if (res.ok) {
                const data = await res.json();
                if (data.rows && data.rows.length) {
                    return data.rows.map(r => ({
                        title: r.title,
                        cat: guessCategory(r.title || ''),
                        source: r.source || '微信爆文',
                        desc: (r.content || '').slice(0, 80) || '点击查看爆文详情',
                        time: r.pub_date ? formatPubDate(r.pub_date) : '近期',
                        link: r.url || '',
                        readCount: r.read_count || 0,
                        _isMock: !!data._isMock
                    }));
                }
            }
        } catch (e) {
            console.warn('[微信爆文榜] 后端查询失败，尝试前端直抓', e);
        }
        // 2. 前端直抓 RSSHub 公共实例（通过 rss2json 代理绕 CORS）
        const rsshubFeeds = [
            'https://rsshub.app/wechat/announce',
            'https://rsshub.feeded.xyz/wechat/announce'
        ];
        for (const feed of rsshubFeeds) {
            try {
                const items = await fetchRSSNews(feed, '微信爆文');
                if (items && items.length) return items;
            } catch (e) {
                continue;
            }
        }
        // 3. 兜底：诚实标注的示例爆文榜
        const mock = [
            { title: '一篇 10w+ 是怎么炼成的：标题、封面、正文的 27 个细节', source: '文案怪谈', desc: '10w+ 不是玄学，是系统工程...' },
            { title: '我用 AI 写公众号 30 天，粉丝从 0 涨到 5000 的复盘', source: '增长黑盒', desc: 'AI 不是替代创作者，而是放大器...' },
            { title: '公众号又改版了：推荐流逻辑变化与应对策略', source: '运营研究社', desc: '本次改版最大的变化是把"在看"权重降低...' },
            { title: '爆款标题的 6 个公式：从恐惧、好奇到利益承诺', source: '文案怪谈', desc: '标题决定打开率...' },
            { title: '2026 公众号广告报价参考：头部账号报价普跌 20%', source: '新榜', desc: '受整体环境影响...' },
            { title: 'AI 时代的内容创作：哪些公众号会被淘汰，哪些会崛起', source: '未来内容', desc: 'AI 是分水岭...' }
        ].map(m => ({
            ...m, cat: guessCategory(m.title), time: '示例', link: '', readCount: 50000 + Math.floor(Math.random() * 50000), _isMock: true
        }));
        setTimeout(() => showToast('公共数据源暂不可用，当前为示例爆文榜。自建 RSSHub 可获取实时数据'), 200);
        return mock;
    }

    // 手动同步：调后端 /api/sync；本地降级时提示
    async function syncAllSubscriptions() {
        const status = await detectSubsBackend();
        if (status === 'ok') {
            const res = await fetch('/api/sync', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '同步失败');
            return data; // {ok, synced, failed, total}
        }
        // 本地降级：触发一次 fetchWechatSubsArticles（直抓 + 缓存）
        await fetchWechatSubsArticles();
        return { ok: true, synced: 'local', failed: 0, total: 0, note: '本地模式：已直抓并缓存，部署后端后可持久化' };
    }

    // 绑定订阅管理弹窗事件
    function bindSubsModalEvents() {
        const modal = document.getElementById('subsModal');
        const manageBtn = document.getElementById('manageSubsBtn');
        const closeBtn = document.getElementById('subsModalCloseBtn');
        const addBtn = document.getElementById('addSubBtn');
        const nameInput = document.getElementById('subNameInput');
        const rssInput = document.getElementById('subRssInput');
        const syncBtn = document.getElementById('syncSubsBtn');
        if (!modal || !manageBtn) return;

        manageBtn.addEventListener('click', async () => {
            modal.style.display = 'flex';
            await renderSubsList();
        });
        const close = () => { modal.style.display = 'none'; };
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        addBtn.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            const rssUrl = rssInput.value.trim();
            if (!name) { showToast('请输入公众号名称'); return; }
            // RSS 可选：未填则创建占位订阅，后续可补
            if (rssUrl && !/^https?:\/\//i.test(rssUrl)) { showToast('RSS 链接需以 http(s) 开头'); return; }
            addBtn.disabled = true; addBtn.textContent = '添加中...';
            try {
                await addSubscription(name, rssUrl || '');
                nameInput.value = ''; rssInput.value = '';
                showToast(rssUrl ? '订阅已添加' : '占位订阅已创建（后续可在管理中补 RSS）');
                await renderSubsList();
                _subsBackendStatus = 'unknown'; // 重置探测，下次刷新
            } catch (e) {
                showToast('添加失败：' + e.message);
            } finally {
                addBtn.disabled = false; addBtn.textContent = '添加';
            }
        });

        syncBtn.addEventListener('click', async () => {
            syncBtn.disabled = true; syncBtn.textContent = '⏳ 同步中...';
            try {
                const r = await syncAllSubscriptions();
                if (r.synced === 'local') {
                    showToast('本地模式：已抓取并缓存文章');
                } else {
                    showToast(`同步完成：成功 ${r.synced} 个源，新增 ${r.total} 篇${r.failed ? '，失败 ' + r.failed : ''}`);
                }
                // 同步后刷新当前列表（如果在公众号订阅 tab）
                if (topicCenterState.currentSource === 'wechat') {
                    await switchTopicSource('wechat');
                }
            } catch (e) {
                showToast('同步失败：' + e.message);
            } finally {
                syncBtn.disabled = false; syncBtn.textContent = '🔄 立即同步所有订阅';
            }
        });
    }

    // ===== 暴露到 window，供 dashboard（外层作用域）调用 =====
    window._subsApi = {
        detectBackend: detectSubsBackend,
        loadSubscriptions: loadSubscriptions,
        addSubscription: addSubscription,
        removeSubscription: removeSubscription,
        renderSubsList: renderSubsList,
        syncAllSubscriptions: syncAllSubscriptions,
        getBackendStatus: () => _subsBackendStatus
    };

    // dashboard 同步按钮调用统一入口
    window._dashSync = async function() {
        const r = await syncAllSubscriptions();
        if (r.synced === 'local') {
            showToast('本地模式：已抓取并缓存文章');
        } else {
            showToast(`同步完成：成功 ${r.synced} 个源，新增 ${r.total} 篇${r.failed ? '，失败 ' + r.failed : ''}`);
        }
        return r;
    };


    // 统一渲染选题列表
    function renderTopicList() {
        if (!hotTopicsList) return;
        let items = topicCenterState.currentList || [];
        // 按分类过滤
        if (topicCenterState.currentCategory !== 'all') {
            items = items.filter(it => it.cat === topicCenterState.currentCategory);
        }
        if (items.length === 0) {
            hotTopicsList.innerHTML = '<div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">该分类下暂无选题</div>';
            return;
        }

        const sourceLabel = {
            weibo: '微博热搜',
            douyin: '抖音热点',
            '36kr': '36氪科技',
            recommend: '综合资讯',
            wechat: '公众号订阅',
            'wechat-hot': '微信爆文榜'
        }[topicCenterState.currentSource] || '';

        // 诚实标注：检测列表中是否含 mock 数据
        const hasMock = items.some(it => it._isMock);
        const now = new Date();
        const timeStr = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`;
        // mock 数据不再假装"实时"，明确标注"示例选题"
        const timeLabel = hasMock ? '示例选题' : `实时 ${timeStr}`;
        const mockTip = hasMock ? '<span style="color:#92400E;font-size:11px;margin-left:6px;">⚠️ 实时数据获取失败，当前为预置示例</span>' : '';

        hotTopicsList.innerHTML = `<div style="font-size:12px;color:#6B7280;margin-bottom:8px;font-weight:600;">${sourceLabel} · ${timeLabel}（共 ${items.length} 条，点击选择）：${mockTip}</div>` +
            items.map((it, i) => {
                const catInfo = TOPIC_CATEGORIES[it.cat] || TOPIC_CATEGORIES.society;
                const safeTitle = (it.title || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                const safeDesc = (it.desc || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                const safeLink = (it.link || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                const itemTime = it.time || timeLabel;
                return `<div style="padding:10px 12px;margin-bottom:6px;border:1px solid #E5E7EB;background:#fff;border-radius:8px;cursor:pointer;transition:all 0.15s;" data-topic="${safeTitle}" data-desc="${safeDesc}" data-source="${it.source || ''}" data-link="${safeLink}" class="topic-item">
                    <div style="display:flex;align-items:center;margin-bottom:4px;">
                        <span style="color:#9CA3AF;font-size:11px;margin-right:8px;min-width:20px;">${i + 1}.</span>
                        <span style="flex:1;font-size:13px;color:#1F2937;font-weight:500;">${safeTitle}</span>
                        <span style="font-size:10px;padding:1px 6px;border-radius:3px;background:${catInfo.color}1a;color:${catInfo.color};margin-left:8px;font-weight:600;white-space:nowrap;">${catInfo.name}</span>
                    </div>
                    <div style="display:flex;align-items:center;padding-left:28px;">
                        <span style="font-size:11px;color:#9CA3AF;margin-right:8px;">${itemTime}</span>
                        ${safeDesc ? `<span style="font-size:11px;color:#6B7280;line-height:1.4;">${safeDesc}</span>` : ''}
                    </div>
                </div>`;
            }).join('');
        hotTopicsList.style.display = 'block';

        // 绑定事件
        hotTopicsList.querySelectorAll('.topic-item').forEach(el => {
            el.addEventListener('mouseenter', () => { el.style.background = '#F0FDF4'; el.style.borderColor = '#10B981'; });
            el.addEventListener('mouseleave', () => { el.style.background = '#fff'; el.style.borderColor = '#E5E7EB'; });
            el.addEventListener('click', () => {
                if (createTopicInput) createTopicInput.value = el.dataset.topic;
                // 记录选中资讯的摘要到 workflowState，供文章生成时作为背景信息
                window.workflowState.newsContext = el.dataset.desc || '';
                window.workflowState.newsSource = el.dataset.source || '';
                window.workflowState.newsLink = el.dataset.link || '';
                setCreateStatus(`已选择话题：${el.dataset.topic}${el.dataset.desc ? '（含资讯背景）' : ''}${el.dataset.link ? '（可点状态栏原文链接阅读）' : ''}`, true);
            });
        });
    }

    // 切换来源（核心函数）
    async function switchTopicSource(source, isInitialLoad) {
        if (!source) return;
        topicCenterState.currentSource = source;

        // UI 按钮状态
        document.querySelectorAll('.topic-source-btn').forEach(b => {
            const isActive = b.dataset.source === source;
            // 保留各自的颜色，激活时反色
            const colors = {
                weibo: '#E11D48',
                douyin: '#111',
                '36kr': '#1E40AF',
                recommend: '#3B82F6',
                wechat: '#07C160',
                'wechat-hot': '#DC2626'
            };
            const c = colors[source] || '#3B82F6';
            if (isActive) {
                b.style.background = c;
                b.style.color = '#fff';
                b.style.borderColor = c;
                b.classList.add('active');
            } else {
                b.style.background = '#fff';
                b.style.color = c;
                b.style.borderColor = c;
                b.classList.remove('active');
            }
        });

        // 加载列表
        setCreateStatus(`正在加载${({weibo:'微博热搜',douyin:'抖音热点','36kr':'36氪科技',recommend:'推荐选题',wechat:'公众号订阅','wechat-hot':'微信爆文榜'})[source] || '数据'}...`, true);

        let items = [];
        try {
            if (source === 'weibo') {
                items = await fetchWeiboTopics();
            } else if (source === 'douyin') {
                items = await fetchDouyinTopics();
            } else if (source === '36kr') {
                // 36氪：真实 RSS 抓取
                items = await fetchRSSNews('https://36kr.com/feed', '36氪');
            } else if (source === 'wechat') {
                // 公众号订阅：优先调后端 API（D1），失败降级前端直抓 RSS
                items = await fetchWechatSubsArticles();
            } else if (source === 'wechat-hot') {
                // 微信爆文榜：后端 API → rss2json → 示例榜（多源降级）
                items = await fetchWechatHotArticles();
            } else {
                // 推荐选题 → 综合资讯：聚合 36氪+IT之家+少数派 RSS
                items = await fetchAggregatedNews();
            }
        } catch (e) {
            console.error('加载选题失败:', e);
            // 各源失败时用对应的本地预置选题（不再统一用 RECOMMEND_TOPICS）
            const now = new Date();
            const timeStr = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`;
            const mockSourceName = { weibo: '微博', douyin: '抖音', '36kr': '36氪', recommend: '综合资讯' }[source] || '综合资讯';
            const mockArray = source === '36kr' ? KR36_TOPICS : RECOMMEND_TOPICS;
            items = mockArray.map(t => ({ ...t, source: mockSourceName, time: timeStr, _isMock: true }));
        }

        topicCenterState.currentList = filterByRedline(items);
        renderTopicList();
        // 只在用户主动切换来源时更新状态条，避免覆盖文章生成的状态
        if (!isInitialLoad) {
            setCreateStatus(`已加载 ${topicCenterState.currentList.length} 条选题，可按分类筛选`, true);
        }
    }

    // 绑定来源按钮
    document.querySelectorAll('.topic-source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTopicSource(btn.dataset.source);
        });
    });

    // 绑定分类筛选按钮
    document.querySelectorAll('.topic-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            topicCenterState.currentCategory = cat;
            // UI 状态
            document.querySelectorAll('.topic-cat-btn').forEach(b => {
                const isActive = b.dataset.cat === cat;
                if (isActive) {
                    b.style.background = '#10B981';
                    b.style.color = '#fff';
                    b.style.border = 'none';
                    b.classList.add('active');
                } else {
                    b.style.background = '#fff';
                    b.style.color = '#374151';
                    b.style.border = '1px solid #D1D5DB';
                    b.classList.remove('active');
                }
            });
            renderTopicList();
        });
    });

    // 刷新按钮：重新加载当前源（带 loading 视觉反馈）
    const refreshTopicsBtn = document.getElementById('refreshTopicsBtn');
    if (refreshTopicsBtn) {
        refreshTopicsBtn.addEventListener('click', async () => {
            if (refreshTopicsBtn.dataset.loading === '1') return;
            const originalText = refreshTopicsBtn.textContent;
            refreshTopicsBtn.dataset.loading = '1';
            refreshTopicsBtn.textContent = '⏳ 刷新中...';
            refreshTopicsBtn.style.opacity = '0.6';
            refreshTopicsBtn.style.cursor = 'wait';
            try {
                await switchTopicSource(topicCenterState.currentSource);
            } finally {
                refreshTopicsBtn.dataset.loading = '0';
                refreshTopicsBtn.textContent = originalText;
                refreshTopicsBtn.style.opacity = '1';
                refreshTopicsBtn.style.cursor = 'pointer';
            }
        });
    }

    // 初始化：默认加载推荐选题
    // 默认激活 36 氪（真实 RSS 资讯）
    setTimeout(() => switchTopicSource('36kr', true), 100);

    // 公众号订阅管理弹窗事件绑定
    bindSubsModalEvents();

    // 生成按钮状态控制：无 API Key 时禁用并引导配置（不再静默返回 mock 垃圾）
    function updateCreateGenerateBtnState() {
        if (!createGenerateBtn) return;
        const settings = getAISettings();
        const hasKey = !!(settings && settings.apiKey);
        if (hasKey) {
            createGenerateBtn.disabled = false;
            createGenerateBtn.textContent = '🚀 生成文章';
            createGenerateBtn.style.opacity = '1';
            createGenerateBtn.style.cursor = 'pointer';
            createGenerateBtn.title = '';
        } else {
            createGenerateBtn.disabled = false; // 保持可点击以触发引导
            createGenerateBtn.textContent = '⚠️ 未配置 AI，点击配置';
            createGenerateBtn.style.opacity = '0.85';
            createGenerateBtn.style.cursor = 'pointer';
            createGenerateBtn.title = '尚未配置 AI API Key，点击前往配置';
        }
    }

    // 生成按钮
    if (createGenerateBtn) {
        createGenerateBtn.addEventListener('click', () => {
            const settings = getAISettings();
            if (!settings || !settings.apiKey) {
                // 无 key：引导配置，不再静默生成 mock
                showToast('请先配置 AI API Key，配置后才能生成真实文章', 'warn');
                const btn = document.getElementById('aiSettingsBtn');
                if (btn) btn.click();
                return;
            }
            createGenerateArticle(false);
        });
    }
    // 重新生成按钮
    if (createRegenerateBtn) {
        createRegenerateBtn.addEventListener('click', () => createGenerateArticle(true));
    }
    // 初始化按钮状态
    updateCreateGenerateBtnState();
    window.updateCreateGenerateBtnState = updateCreateGenerateBtnState;
    // 字数实时统计
    if (createArticleArea) {
        createArticleArea.addEventListener('input', updateCreateWordNum);
    }
    // 复制
    if (createCopyBtn) {
        createCopyBtn.addEventListener('click', () => {
            if (!createArticleArea) return;
            const text = createArticleArea.value;
            if (!text) { showToast('暂无文章可复制'); return; }
            navigator.clipboard.writeText(text).then(() => showToast('已复制文章到剪贴板'));
        });
    }
    // 下一步：进入排版助手
    if (createGotoEditorBtn) {
        createGotoEditorBtn.addEventListener('click', () => {
            if (!createArticleArea || !createArticleArea.value.trim()) {
                showToast('请先生成文章');
                return;
            }
            // 存入 workflowState
            window.workflowState.article = createArticleArea.value;
            // 切到排版 tab
            const editorTab = document.querySelector('.tab-btn[data-tab="editor"]');
            if (editorTab) editorTab.click();
            // 把文章填入编辑器
            const formatted = smartFormatText(createArticleArea.value);
            const html = markdownToHTML(formatted);
            editor.innerHTML = html;
            updatePreview();
            showToast('已进入排版助手，文章已填入编辑器');
        });
    }

    // 格式工具栏：对 textarea 选中文本插入 Markdown 标记
    document.querySelectorAll('.create-fmt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!createArticleArea) return;
            const fmt = btn.dataset.fmt;
            const ta = createArticleArea;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selected = ta.value.substring(start, end);
            const before = ta.value.substring(0, start);
            const after = ta.value.substring(end);
            let insert = selected;
            let cursorOffset = 0;

            switch (fmt) {
                case 'h2':
                    insert = '## ' + (selected || '标题');
                    cursorOffset = selected ? 0 : -2;
                    break;
                case 'h3':
                    insert = '### ' + (selected || '小标题');
                    cursorOffset = selected ? 0 : -3;
                    break;
                case 'bold':
                    insert = '**' + (selected || '加粗文字') + '**';
                    cursorOffset = selected ? 0 : -5;
                    break;
                case 'italic':
                    insert = '*' + (selected || '斜体文字') + '*';
                    cursorOffset = selected ? 0 : -4;
                    break;
                case 'quote':
                    insert = '> ' + (selected || '引用内容');
                    cursorOffset = 0;
                    break;
                case 'list':
                    insert = '- ' + (selected || '列表项');
                    cursorOffset = 0;
                    break;
                case 'code':
                    if (selected.includes('\n')) {
                        insert = '```\n' + selected + '\n```';
                    } else {
                        insert = '`' + (selected || '代码') + '`';
                        cursorOffset = selected ? 0 : -2;
                    }
                    break;
                case 'hr':
                    insert = '\n---\n';
                    cursorOffset = 0;
                    break;
            }

            ta.value = before + insert + after;
            ta.focus();
            if (selected || cursorOffset !== 0) {
                const newPos = start + insert.length + cursorOffset;
                ta.setSelectionRange(newPos, newPos);
            } else {
                ta.setSelectionRange(start + insert.length, start + insert.length);
            }
            updateCreateWordNum();
        });
    });

    // 初始刷新 AI 状态横幅
    updateCreateAIBanner();

    // ===== 9.6 Tab3 文章配图：精细化封面/配图单独重新生成 =====
    // Tab3 文章配图相关的 DOM 元素
    const aiFetchFromEditorBtn = document.getElementById('aiFetchFromEditorBtn');
    const aiPlanImagesBtn = document.getElementById('aiPlanImagesBtn');
    const aiGenerateAllBtn = document.getElementById('aiGenerateAllBtn');
    const aiApplyToEditorBtn = document.getElementById('aiApplyToEditorBtn');
    const aiArticleTitle = document.getElementById('aiArticleTitle');
    const aiArticleMeta = document.getElementById('aiArticleMeta');
    const aiCoverRegenerateBtn = document.getElementById('aiCoverRegenerateBtn');
    const aiCoverPreview = document.getElementById('aiCoverPreview');
    const aiImagesList = document.getElementById('aiImagesList');
    const aiEmptyState = document.getElementById('aiEmptyState');
    const aiStatus = document.getElementById('aiStatus');
    const aiStatusText = document.getElementById('aiStatusText');

    // Tab3 文章配图的内部状态
    const tab3State = {
        coverPrompt: '',
        coverDataUri: '',
        imagePrompts: [],   // [{prompt, dataUri, generating, fail}]
        coverPlan: null
    };

    function setAIStatus(text, show) {
        if (aiStatus) aiStatus.style.display = show ? 'block' : 'none';
        if (aiStatusText) aiStatusText.textContent = text;
    }

    // 更新文章信息显示
    function updateArticleIllustrationPanel() {
        const article = window.workflowState && window.workflowState.article;
        if (!article) {
            if (aiArticleTitle) aiArticleTitle.textContent = '未选择文章';
            if (aiArticleMeta) aiArticleMeta.textContent = '';
            return;
        }
        // 提取文章标题（首个 # 开头行）
        const titleMatch = article.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : '(无标题)';
        if (aiArticleTitle) aiArticleTitle.textContent = title;
        const wordCount = article.replace(/[#*>`\-\[\]\(\)!]/g, '').length;
        if (aiArticleMeta) aiArticleMeta.textContent = `${wordCount} 字 · 来自 ${window.workflowState.topic ? '创作' : '排版助手'}`;
    }

    // 渲染配图列表
    function renderAIImageList() {
        if (!aiImagesList) return;
        if (tab3State.imagePrompts.length === 0) {
            aiImagesList.innerHTML = '';
            if (aiEmptyState) aiEmptyState.style.display = 'block';
            return;
        }
        if (aiEmptyState) aiEmptyState.style.display = 'none';
        aiImagesList.innerHTML = tab3State.imagePrompts.map((item, i) => `
            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:14px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-weight:600;font-size:13px;color:#1F2937;">配图 ${i + 1}${item.fail ? '（失败）' : ''}</div>
                    <button data-idx="${i}" class="ai-img-regen" style="padding:4px 10px;background:#fff;color:#10B981;border:1px solid #10B981;border-radius:5px;font-size:11px;cursor:pointer;">↻ 重新生成</button>
                </div>
                <textarea data-idx="${i}" class="ai-img-prompt" style="width:100%;min-height:60px;padding:8px 10px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;color:#374151;font-family:monospace;resize:vertical;box-sizing:border-box;outline:none;">${(item.prompt || '').replace(/</g, '&lt;')}</textarea>
                <div data-idx="${i}" class="ai-img-preview" style="margin-top:8px;min-height:100px;display:flex;align-items:center;justify-content:center;background:#F9FAFB;border-radius:6px;color:#9CA3AF;font-size:12px;">
                    ${item.dataUri
                        ? `<img src="${item.dataUri}" style="max-width:100%;max-height:200px;border-radius:6px;" alt="配图${i + 1}">`
                        : (item.generating ? '⏳ 生成中...' : '尚未生成')}
                </div>
            </div>
        `).join('');
        // 绑定重新生成按钮
        aiImagesList.querySelectorAll('.ai-img-regen').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                regenerateSingleImage(idx);
            });
        });
        // 绑定 prompt 编辑
        aiImagesList.querySelectorAll('.ai-img-prompt').forEach(ta => {
            ta.addEventListener('change', () => {
                const idx = parseInt(ta.dataset.idx, 10);
                if (tab3State.imagePrompts[idx]) {
                    tab3State.imagePrompts[idx].prompt = ta.value;
                }
            });
        });
    }

    // 渲染封面
    function renderAICover() {
        if (!aiCoverPreview) return;
        if (tab3State.coverDataUri) {
            aiCoverPreview.innerHTML = `<img src="${tab3State.coverDataUri}" style="max-width:100%;max-height:200px;border-radius:6px;" alt="封面">`;
            if (aiCoverRegenerateBtn) {
                aiCoverRegenerateBtn.disabled = false;
                aiCoverRegenerateBtn.style.cursor = 'pointer';
                aiCoverRegenerateBtn.style.color = '#10B981';
                aiCoverRegenerateBtn.style.borderColor = '#10B981';
            }
        } else {
            aiCoverPreview.innerHTML = tab3State.coverPrompt ? '⏳ 封面生成中...' : '尚未生成';
        }
    }

    // 把 Tab3 文章配图的核心函数暴露到 window，供 IIFE 外的 mode-btn 切换调用
    window.updateArticleIllustrationPanel = updateArticleIllustrationPanel;

    // 从排版助手导入文章
    if (aiFetchFromEditorBtn) {
        aiFetchFromEditorBtn.addEventListener('click', () => {
            // 优先用 workflowState（保留 markdown 结构），如果不存在则尝试从编辑器提取文本
            if (window.workflowState && window.workflowState.article) {
                // 已有 markdown 文章，直接用
                updateArticleIllustrationPanel();
                showToast('已导入文章：' + ((window.workflowState.article.match(/^#\s+(.+)$/m) || [])[1] || ''));
            } else {
                // 尝试从编辑器提取（会丢失 markdown 结构，作为兜底）
                const text = editor.innerText || editor.textContent || '';
                if (text.trim()) {
                    window.workflowState.article = text;
                    updateArticleIllustrationPanel();
                    showToast('已从排版助手导入文章（提示：建议从「创作」Tab 生成文章以保留 Markdown 结构）');
                } else {
                    showToast('排版助手中暂无内容，请先在「创作」Tab 生成文章');
                    return;
                }
            }
            // 启用规划按钮
            if (aiPlanImagesBtn) {
                aiPlanImagesBtn.disabled = false;
                aiPlanImagesBtn.style.cursor = 'pointer';
            }
        });
    }

    // 规划配图 Prompt
    if (aiPlanImagesBtn) {
        aiPlanImagesBtn.addEventListener('click', async () => {
            const settings = getAISettings();
            if (!settings.apiKey) {
                showToast('请先在 AI 设置中配置 API Key');
                if (aiSettingsModal) aiSettingsModal.style.display = 'flex';
                return;
            }
            const article = window.workflowState && window.workflowState.article;
            if (!article) {
                showToast('请先导入文章');
                return;
            }
            const origText = aiPlanImagesBtn.textContent;
            aiPlanImagesBtn.disabled = true;
            aiPlanImagesBtn.textContent = '⏳ 规划中...';
            setAIStatus('AI 正在规划配图 Prompt（含封面）...', true);
            try {
                // 规划封面
                const coverPlan = await planCoverImage(article, settings);
                tab3State.coverPlan = coverPlan;
                tab3State.coverPrompt = `documentary photography, ${coverPlan.scene}, golden hour warm light, large empty negative space on the left, no text, no watermark, ultra detailed, 8k quality`;
                // 规划配图
                const imageCount = settings.imageCount || 4;
                const prompts = await planImages(article, imageCount, settings);
                tab3State.imagePrompts = prompts.map(p => ({ prompt: p, dataUri: '', generating: false, fail: false }));
                // 渲染
                renderAICover();
                renderAIImageList();
                // 启用后续按钮
                if (aiGenerateAllBtn) {
                    aiGenerateAllBtn.disabled = false;
                    aiGenerateAllBtn.style.cursor = 'pointer';
                    aiGenerateAllBtn.style.color = '#10B981';
                    aiGenerateAllBtn.style.borderColor = '#10B981';
                }
                setAIStatus(`已规划：1 张封面 + ${prompts.length} 张配图。可编辑 prompt 后点「一键生成全部」`, true);
                showToast(`规划完成：封面 + ${prompts.length} 张配图`);
            } catch (e) {
                console.error(e);
                setAIStatus('规划失败：' + e.message, true);
                showToast('规划失败：' + e.message);
            } finally {
                aiPlanImagesBtn.disabled = false;
                aiPlanImagesBtn.textContent = origText;
            }
        });
    }

    // 一键生成全部（封面 + 所有配图，并行）
    if (aiGenerateAllBtn) {
        aiGenerateAllBtn.addEventListener('click', async () => {
            const settings = getAISettings();
            if (!settings.apiKey) {
                showToast('请先配置 API Key');
                return;
            }
            if (!tab3State.coverPrompt && tab3State.imagePrompts.length === 0) {
                showToast('请先规划配图');
                return;
            }
            const origText = aiGenerateAllBtn.textContent;
            aiGenerateAllBtn.disabled = true;
            aiGenerateAllBtn.textContent = '⏳ 生成中...';
            setAIStatus(`正在生成：封面 + ${tab3State.imagePrompts.length} 张配图（并行）...`, true);

            // 启动并行任务
            const tasks = [];
            // 封面任务
            if (tab3State.coverPrompt && !tab3State.coverDataUri) {
                tab3State.coverPlan = tab3State.coverPlan || {};
                tasks.push(
                    generateArticleCover(tab3State.coverPlan, 88888)
                        .then(uri => { tab3State.coverDataUri = uri; renderAICover(); })
                        .catch(e => { console.error('封面生成失败:', e); tab3State.coverDataUri = ''; })
                );
            }
            // 配图任务
            tab3State.imagePrompts.forEach((item, i) => {
                if (item.dataUri || item.generating) return;
                item.generating = true;
                tasks.push(
                    generateImage(item.prompt, 1000 + i * 111, 90000)
                        .then(uri => {
                            tab3State.imagePrompts[i].dataUri = uri;
                            tab3State.imagePrompts[i].generating = false;
                            tab3State.imagePrompts[i].fail = false;
                            renderAIImageList();
                        })
                        .catch(e => {
                            console.error(`配图 ${i + 1} 生成失败:`, e);
                            tab3State.imagePrompts[i].generating = false;
                            tab3State.imagePrompts[i].fail = true;
                            renderAIImageList();
                        })
                );
            });

            let completed = 0;
            const total = tasks.length;
            tasks.forEach(t => t.finally(() => {
                completed++;
                setAIStatus(`生成中... ${completed}/${total} 完成`, true);
            }));

            try {
                await Promise.all(tasks);
                const success = tab3State.imagePrompts.filter(x => x.dataUri).length;
                setAIStatus(`完成！封面${tab3State.coverDataUri ? '✓' : '✗'} + 配图 ${success}/${tab3State.imagePrompts.length}`, true);
                // 启用应用按钮
                if (aiApplyToEditorBtn) {
                    aiApplyToEditorBtn.disabled = false;
                    aiApplyToEditorBtn.style.cursor = 'pointer';
                    aiApplyToEditorBtn.style.color = '#10B981';
                    aiApplyToEditorBtn.style.borderColor = '#10B981';
                }
                showToast(`生成完成！`);
            } catch (e) {
                setAIStatus('部分生成失败：' + e.message, true);
            } finally {
                aiGenerateAllBtn.disabled = false;
                aiGenerateAllBtn.textContent = origText;
            }
        });
    }

    // 单独重新生成某张配图
    async function regenerateSingleImage(idx) {
        const settings = getAISettings();
        const item = tab3State.imagePrompts[idx];
        if (!item) return;
        item.generating = true;
        item.dataUri = '';
        item.fail = false;
        renderAIImageList();
        setAIStatus(`正在重新生成配图 ${idx + 1}...`, true);
        try {
            const uri = await generateImage(item.prompt, 2000 + idx * 333, 90000);
            tab3State.imagePrompts[idx].dataUri = uri;
            tab3State.imagePrompts[idx].generating = false;
            renderAIImageList();
            setAIStatus(`配图 ${idx + 1} 重新生成完成`, true);
            showToast(`配图 ${idx + 1} 已重新生成`);
        } catch (e) {
            tab3State.imagePrompts[idx].generating = false;
            tab3State.imagePrompts[idx].fail = true;
            renderAIImageList();
            setAIStatus(`配图 ${idx + 1} 生成失败：${e.message}`, true);
        }
    }

    // 重新生成封面
    if (aiCoverRegenerateBtn) {
        aiCoverRegenerateBtn.addEventListener('click', async () => {
            if (!tab3State.coverPlan) return;
            const origText = aiCoverRegenerateBtn.textContent;
            aiCoverRegenerateBtn.disabled = true;
            aiCoverRegenerateBtn.textContent = '⏳';
            tab3State.coverDataUri = '';
            renderAICover();
            setAIStatus('正在重新生成封面...', true);
            try {
                const uri = await generateArticleCover(tab3State.coverPlan, 99999);
                tab3State.coverDataUri = uri;
                renderAICover();
                setAIStatus('封面重新生成完成', true);
                showToast('封面已重新生成');
            } catch (e) {
                setAIStatus('封面生成失败：' + e.message, true);
            } finally {
                aiCoverRegenerateBtn.disabled = false;
                aiCoverRegenerateBtn.textContent = origText;
            }
        });
    }

    // 应用到排版助手：把图片插入文章并切回 Tab2
    if (aiApplyToEditorBtn) {
        aiApplyToEditorBtn.addEventListener('click', () => {
            const article = window.workflowState && window.workflowState.article;
            if (!article) {
                showToast('暂无文章');
                return;
            }
            // 收集所有成功的图片
            const imageUrls = tab3State.imagePrompts.filter(x => x.dataUri).map(x => x.dataUri);
            const imageCaptions = tab3State.imagePrompts.filter((x, i) => x.dataUri).map((x, i) => `配图${i + 1}`);
            let finalArticle = article;
            if (imageUrls.length > 0) {
                finalArticle = insertImagesIntoArticle(finalArticle, imageUrls, imageCaptions);
            }
            if (tab3State.coverDataUri) {
                finalArticle = `![封面](${tab3State.coverDataUri})\n\n` + finalArticle;
            }
            // 更新 workflowState
            window.workflowState.article = finalArticle;
            // 切到排版 tab
            const editorTab = document.querySelector('.tab-btn[data-tab="editor"]');
            if (editorTab) editorTab.click();
            // 填入编辑器
            const formatted = smartFormatText(finalArticle);
            const html = markdownToHTML(formatted);
            editor.innerHTML = html;
            updatePreview();
            showToast(`已应用到排版助手（${imageUrls.length} 张配图 + 封面${tab3State.coverDataUri ? '✓' : '✗'}）`);
        });
    }

    // ===== 9.7 三 Tab 状态打通：从排版助手跳转到配图 Tab =====
    // Tab2 排版助手的「精细化配图」按钮
    const gotoImageBtn = document.getElementById('gotoImageBtn');
    if (gotoImageBtn) {
        gotoImageBtn.addEventListener('click', async () => {
            const settings = (typeof getAISettings === 'function') ? getAISettings() : null;
            const hasAI = !!(settings && settings.apiKey);

            if (!hasAI) {
                showToast('建议先配置 AI API Key 以使用一键配图功能');
                const aiSettingsBtn = document.getElementById('aiSettingsBtn');
                if (aiSettingsBtn) aiSettingsBtn.click();
                return;
            }

            let article = (window.workflowState && window.workflowState.article) || '';
            if (!article) {
                const editorText = editor.innerText || editor.textContent || '';
                if (editorText.trim()) {
                    article = editorText;
                    window.workflowState.article = article;
                }
            }
            if (!article) {
                showToast('请先在创作 Tab 生成文章，或在排版助手中导入文章');
                return;
            }
            window.workflowState.article = article;

            const origText = gotoImageBtn.querySelector('span:last-child')?.textContent || '一键配图';
            if (gotoImageBtn.querySelector('span:last-child')) {
                gotoImageBtn.querySelector('span:last-child').textContent = '配图中...';
            }
            gotoImageBtn.disabled = true;

            try {
                if (typeof window.autoIllustrate === 'function') {
                    await window.autoIllustrate();
                } else {
                    showToast('配图功能加载中，请稍后重试');
                }
            } catch (e) {
                showToast('配图失败：' + e.message);
            } finally {
                gotoImageBtn.disabled = false;
                if (gotoImageBtn.querySelector('span:last-child')) {
                    gotoImageBtn.querySelector('span:last-child').textContent = origText;
                }
            }
        });
    }

    // ===== 10. 事件绑定 =====
    if (aiWorkflowBtn) {
        aiWorkflowBtn.addEventListener('click', aiWorkflow);
    }
    if (aiSettingsBtn) {
        aiSettingsBtn.addEventListener('click', () => {
            const s = getAISettings();
            if (llmProviderSelect) llmProviderSelect.value = s.provider;
            if (llmApiKeyInput) llmApiKeyInput.value = s.apiKey;
            // 先清空 dataset.provider 标记，让 updateProviderUI 知道是初始化状态
            if (llmBaseUrlInput) llmBaseUrlInput.dataset.provider = '';
            if (llmModelInput) llmModelInput.dataset.provider = '';
            // 把保存的 baseUrl/model 填入输入框（可能是用户手动改过的）
            if (llmBaseUrlInput) llmBaseUrlInput.value = s.baseUrl;
            if (llmModelInput) llmModelInput.value = s.model;
            if (imageCountInput) imageCountInput.value = String(s.imageCount);
            // 调用 updateProviderUI：如果保存的 baseUrl 与当前 provider 默认值不同，
            // 说明用户手动改过，应该保留；如果相同，dataset.provider 会被设为当前 provider
            updateProviderUI();
            // 如果当前 provider 是 editable，且保存的值非空且与默认值相同，
            // 上面的 updateProviderUI 已经设置了 dataset.provider；
            // 如果保存的值与默认值不同（用户改过），下面手动设置 dataset.provider，让下次切换才覆盖
            const cfg = LLM_PROVIDERS[s.provider];
            if (cfg && (cfg.editable || s.provider === 'custom')) {
                // 用户改过：保留保存的值，标记当前 provider 已生效
                if (llmBaseUrlInput) llmBaseUrlInput.dataset.provider = s.provider;
                if (llmModelInput) llmModelInput.dataset.provider = s.provider;
            }

            // 图片生成 tab 初始化
            if (imageProviderSelect) imageProviderSelect.value = s.imageProvider || 'pollinations';
            if (imageApiKeyInput) imageApiKeyInput.value = s.imageApiKey || '';
            if (imageBaseUrlInput) imageBaseUrlInput.value = s.imageBaseUrl || '';
            if (imageModelInput) imageModelInput.value = s.imageModel || '';
            updateImageProviderUI();

            if (aiSettingsModal) aiSettingsModal.style.display = 'flex';
        });
    }

    // 图片生成 provider 切换时更新帮助文本和字段显隐
    function updateImageProviderUI() {
        if (!imageProviderSelect) return;
        const provider = imageProviderSelect.value;
        const config = IMAGE_PROVIDERS[provider];
        if (!config) return;
        // 更新帮助文本
        if (imageApiHelpText) {
            if (config.helpUrl) {
                imageApiHelpText.innerHTML = `${config.helpText} → <a href="${config.helpUrl}" target="_blank" style="color:#3B82F6;">点击创建</a>`;
            } else {
                imageApiHelpText.textContent = config.helpText;
            }
        }
        // pollinations 不需要 API Key，隐藏字段
        if (imageApiFields) {
            imageApiFields.style.display = config.needsApiKey ? 'block' : 'none';
        }
        // 非 custom 的预设 provider 自动填入默认 baseUrl/model
        if (config.editable) {
            // custom 模式：用户自己填，不自动覆盖
            if (imageBaseUrlInput && imageBaseUrlInput.dataset.provider !== provider) {
                imageBaseUrlInput.value = config.baseUrl || '';
                imageBaseUrlInput.dataset.provider = provider;
            }
            if (imageModelInput && imageModelInput.dataset.provider !== provider) {
                imageModelInput.value = config.model || '';
                imageModelInput.dataset.provider = provider;
            }
        } else if (config.needsApiKey) {
            // 预设 provider（智谱/通义/DALL-E）：自动填入默认值（只读感）
            if (imageBaseUrlInput) {
                imageBaseUrlInput.value = config.baseUrl || '';
                imageBaseUrlInput.dataset.provider = provider;
            }
            if (imageModelInput) {
                imageModelInput.value = config.model || '';
                imageModelInput.dataset.provider = provider;
            }
        }
    }
    if (imageProviderSelect) {
        imageProviderSelect.addEventListener('change', () => {
            // 清除 dataset 标记，让 updateImageProviderUI 自动填入新 provider 的默认值
            if (imageBaseUrlInput) imageBaseUrlInput.dataset.provider = '';
            if (imageModelInput) imageModelInput.dataset.provider = '';
            updateImageProviderUI();
        });
    }

    // Tab 切换逻辑
    document.querySelectorAll('.ai-settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            // 切换 tab 激活态
            document.querySelectorAll('.ai-settings-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === targetTab);
                if (t.dataset.tab === targetTab) {
                    t.style.color = '#10B981';
                    t.style.borderBottom = '2px solid #10B981';
                    t.style.fontWeight = '600';
                } else {
                    t.style.color = '#6B7280';
                    t.style.borderBottom = '2px solid transparent';
                    t.style.fontWeight = '500';
                }
            });
            // 切换 panel 显隐
            document.querySelectorAll('.ai-settings-panel').forEach(p => {
                p.style.display = (p.dataset.panel === targetTab) ? 'block' : 'none';
            });
        });
    });
    if (aiSettingsCancel) {
        aiSettingsCancel.addEventListener('click', () => {
            if (aiSettingsModal) aiSettingsModal.style.display = 'none';
        });
    }
    if (llmTestBtn) {
        llmTestBtn.addEventListener('click', testLLMConnection);
    }
    if (imageTestBtn) {
        imageTestBtn.addEventListener('click', testImageConnection);
    }
    // 刷新模型列表按钮事件
    if (refreshLLMModelsBtn) {
        refreshLLMModelsBtn.addEventListener('click', async () => {
            const btn = refreshLLMModelsBtn;
            const origText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '⏳ 加载中...';
            try {
                const provider = llmProviderSelect ? llmProviderSelect.value : '';
                const config = LLM_PROVIDERS[provider];
                let baseUrl = llmBaseUrlInput ? llmBaseUrlInput.value.trim() : '';
                let apiKey = llmApiKeyInput ? llmApiKeyInput.value.trim() : '';
                if (!baseUrl && config) baseUrl = config.baseUrl || '';
                const models = await fetchModels(baseUrl, apiKey, 'llm');
                renderModelList(models, llmModelList, llmModelInput);
                if (models.length === 0) {
                    llmTestResult.innerHTML = '<span style="color:#F59E0B;">⚠️ 未获取到模型列表（API可能不支持 /v1/models）</span>';
                }
            } catch (e) {
                console.error('刷新模型列表失败:', e);
            } finally {
                btn.disabled = false;
                btn.textContent = origText;
            }
        });
    }
    if (refreshImageModelsBtn) {
        refreshImageModelsBtn.addEventListener('click', async () => {
            const btn = refreshImageModelsBtn;
            const origText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '⏳ 加载中...';
            try {
                const provider = imageProviderSelect ? imageProviderSelect.value : '';
                const config = IMAGE_PROVIDERS[provider];
                let baseUrl = imageBaseUrlInput ? imageBaseUrlInput.value.trim() : '';
                let apiKey = imageApiKeyInput ? imageApiKeyInput.value.trim() : '';
                if (!baseUrl && config) baseUrl = config.baseUrl || '';
                // 腾讯云图片API需要转换为TokenHub基础URL
                if (provider === 'tencent' && baseUrl.includes('/api/image/submit')) {
                    baseUrl = 'https://tokenhub.tencentmaas.com/v1';
                }
                const models = await fetchModels(baseUrl, apiKey, 'image');
                renderModelList(models, imageModelList, imageModelInput);
                if (models.length === 0) {
                    imageTestResult.innerHTML = '<span style="color:#F59E0B;">⚠️ 未获取到图片模型列表（API可能不支持 /v1/models）</span>';
                }
            } catch (e) {
                console.error('刷新图片模型列表失败:', e);
            } finally {
                btn.disabled = false;
                btn.textContent = origText;
            }
        });
    }
    if (aiSettingsSave) {
        aiSettingsSave.addEventListener('click', () => {
            const provider = llmProviderSelect ? llmProviderSelect.value : 'deepseek';
            const apiKey = llmApiKeyInput ? llmApiKeyInput.value.trim() : '';
            const rawCount = imageCountInput ? parseInt(imageCountInput.value, 10) : 4;
            const imageCount = (isNaN(rawCount) || rawCount < 1) ? 4 : rawCount;
            const baseUrl = llmBaseUrlInput ? llmBaseUrlInput.value.trim() : '';
            const model = llmModelInput ? llmModelInput.value.trim() : '';
            saveAISettings(provider, apiKey, imageCount, baseUrl, model);

            // 保存图片生成 API 配置
            const imgProvider = imageProviderSelect ? imageProviderSelect.value : 'pollinations';
            const imgApiKey = imageApiKeyInput ? imageApiKeyInput.value.trim() : '';
            const imgBaseUrl = imageBaseUrlInput ? imageBaseUrlInput.value.trim() : '';
            const imgModel = imageModelInput ? imageModelInput.value.trim() : '';
            saveImageApiSettings(imgProvider, imgApiKey, imgBaseUrl, imgModel);

            if (aiSettingsModal) aiSettingsModal.style.display = 'none';
            showToast('设置已保存');
            // 刷新创作 tab 的 AI 状态横幅与生成按钮状态
            updateCreateAIBanner();
            if (typeof window.updateCreateGenerateBtnState === 'function') window.updateCreateGenerateBtnState();
        });
    }

    // ===== 12. 独立配图功能（不依赖 AI 工作流，编辑器直接触发）=====
    // 逻辑：从编辑器读文章 → LLM 理解文章生成图片 prompt → 生成图片 → 插入编辑器
    async function autoIllustrate() {
        const settings = getAISettings();
        const imgSettings = getImageApiSettings();
        const isDemo = !settings || !settings.apiKey;
        const usingCustomImageApi = imgSettings.provider !== 'pollinations' && imgSettings.apiKey;

        // 从编辑器提取文章文本
        const editorHtml = editor.innerHTML;
        if (!editorHtml.trim()) {
            showToast('编辑器为空，请先输入文章内容');
            return;
        }
        let articleText = editorHtml.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
        if (articleText.length < 100) {
            showToast('文章内容太少（少于100字），无法规划配图');
            return;
        }

        const imageCount = settings.imageCount || 4;
        showAISpinner(true);
        const imgApiName = usingCustomImageApi ? (IMAGE_PROVIDERS[imgSettings.provider] || {}).name : 'Pollinations 免费方案';
        updateAIStatus(isDemo ? '演示模式：使用本地 prompt 规划...' : '正在理解文章内容并规划配图...', `目标 ${imageCount} 张 · 图片 API：${imgApiName}`);

        try {
            // 0. 生成封面图
            let coverImage = null;
            try {
                updateAIStatus('正在规划封面图...', isDemo ? '演示模式' : '');
                let coverPlan;
                if (isDemo) {
                    coverPlan = mockPlanCover(articleText);
                } else {
                    coverPlan = await planCoverImage(articleText, settings);
                }
                updateAIStatus('正在生成封面图...', `场景：${(coverPlan.scene || '').substring(0, 20)}... · ${imgApiName}`);
                coverImage = await generateArticleCover(coverPlan, 88888);
                updateAIStatus('封面图生成完成', '');
            } catch (e) {
                console.error('封面图生成失败:', e.message);
                updateAIStatus('封面图生成失败，跳过封面', '');
            }

            // 1. LLM 理解文章，生成图片 prompt（演示模式下用本地 mock 规划）
            let imagePrompts;
            if (isDemo) {
                updateAIStatus('演示模式：本地规划配图 prompt...', '');
                imagePrompts = mockPlanImages(articleText, imageCount);
            } else {
                imagePrompts = await planImages(articleText, imageCount, settings);
            }
            if (!imagePrompts || imagePrompts.length === 0) {
                throw new Error('未返回有效的图片 prompt');
            }
            updateAIStatus('正在生成配图...', `共 ${imagePrompts.length} 张 · ${imgApiName}（并行）`);

            // 2. 生成图片（data URI）— 并行生成
            // PLACEHOLDER 带序号和场景描述，让每张失败的图都不同
            const makePlaceholder = (idx, prompt) => 'data:image/svg+xml,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">` +
                `<rect width="1280" height="720" fill="#F3F4F6"/>` +
                `<text x="640" y="320" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#9CA3AF">📷 配图${idx + 1} 加载失败</text>` +
                `<text x="640" y="380" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#D1D5DB">${(prompt || '').substring(0, 60)}...</text>` +
                `<text x="640" y="430" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#D1D5DB">请手动上传替换</text>` +
                `</svg>`
            );

            // 超时从 90 秒减到 45 秒，避免卡太久
            const imageTasks = imagePrompts.map((prompt, i) =>
                generateImage(prompt, 1000 + i * 111, 45000)
                    .then(dataUri => ({ ok: true, dataUri, caption: `配图${i + 1}`, index: i, prompt }))
                    .catch(e => {
                        console.error(`图片 ${i + 1} 失败:`, e.message);
                        return { ok: false, dataUri: makePlaceholder(i, prompt), caption: `配图${i + 1}（加载失败）`, index: i, prompt };
                    })
            );

            let completed = 0;
            imageTasks.forEach(t => t.finally(() => {
                completed++;
                updateAIStatus('正在生成配图...', `已完成 ${completed}/${imagePrompts.length} 张 · ${imgApiName}`);
            }));

            const results = await Promise.all(imageTasks);
            results.sort((a, b) => a.index - b.index);
            const imageUrls = results.map(r => r.dataUri);
            const imageCaptions = results.map(r => r.caption);
            const successCount = results.filter(r => r.ok).length;

            // 3. 把图片插入编辑器
            updateAIStatus('正在插入配图...', `插入 ${successCount} 张`);
            let currentText = editorHtml
                .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
                .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
                .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            let finalArticle = insertImagesIntoArticle(currentText, imageUrls, imageCaptions);
            if (coverImage) {
                finalArticle = `![封面](${coverImage})\n\n` + finalArticle;
            }
            const formatted = smartFormatText(finalArticle);
            const newHtml = markdownToHTML(formatted);
            editor.innerHTML = newHtml;
            updatePreview();

            const imgInfo = successCount > 0
                ? `配图 ${successCount}/${imageUrls.length} 张成功 · ${imgApiName}`
                : `配图全部使用占位图`;
            updateAIStatus('配图完成！', imgInfo + (isDemo ? '（演示模式 prompt 规划）' : ''));
            showAISpinner(false);
            showToast(`配图完成！${successCount} 张图片已插入${isDemo ? '（演示模式）' : ''}`);
        } catch (e) {
            showAISpinner(false);
            updateAIStatus('配图失败', e.message);
            showToast('配图失败：' + e.message);
        }
    }

    // 演示模式：本地 mock 图片 prompt 规划（无 LLM API Key 时使用）
    function mockPlanImages(article, imageCount) {
        // 从文章提取关键词，生成与内容相关的英文 prompt
        const lower = article.toLowerCase();
        const hasNight = /深夜|凌晨|晚上|夜晚|加班/.test(article);
        const hasOffice = /办公|公司|职场|上班|同事/.test(article);
        const hasCity = /城市|都市|街|路|地铁/.test(article);
        const hasNature = /自然|公园|树|花|绿|山|海/.test(article);
        const hasTech = /ai|科技|手机|电脑|算法|数据/.test(lower);
        const hasPeople = /人|朋友|家|我们/.test(article);

        const scenePool = [];
        if (hasNight) scenePool.push('editorial photography, person working late at night in dimly lit office, monitor glow on face, quiet and contemplative mood, ultra detailed, 8k quality, no text, no watermark');
        if (hasOffice) scenePool.push('editorial photography, modern office workspace with coffee cup and laptop, soft morning light through window, clean and minimal, ultra detailed, 8k quality, no text, no watermark');
        if (hasCity) scenePool.push('editorial photography, busy city street at golden hour, people walking with purpose, warm light, shallow depth of field, ultra detailed, 8k quality, no text, no watermark');
        if (hasNature) scenePool.push('editorial photography, peaceful park scene with sunlight through leaves, bench under tree, serene atmosphere, ultra detailed, 8k quality, no text, no watermark');
        if (hasTech) scenePool.push('editorial photography, modern technology concept, hands interacting with device, blue ambient light, futuristic but warm, ultra detailed, 8k quality, no text, no watermark');
        if (hasPeople) scenePool.push('editorial photography, candid moment of person in everyday life, natural expression, warm tones, documentary style, ultra detailed, 8k quality, no text, no watermark');

        // 默认通用场景
        const defaults = [
            'editorial photography, minimalist still life with warm natural light, soft shadows, contemplative mood, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, urban landscape at blue hour, calm and reflective, leading lines composition, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, close-up of hands holding coffee cup, steam rising, warm cafe light, cozy atmosphere, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, window with rain drops, city view blurred behind, moody and introspective, cool tones, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, bookshelf with warm reading lamp, cozy corner, intellectual mood, ultra detailed, 8k quality, no text, no watermark',
            'editorial photography, empty subway platform with warm light, sense of waiting and passage of time, ultra detailed, 8k quality, no text, no watermark'
        ];

        const prompts = [];
        for (let i = 0; i < imageCount; i++) {
            if (i < scenePool.length) {
                prompts.push(scenePool[i]);
            } else {
                prompts.push(defaults[i % defaults.length]);
            }
        }
        return prompts;
    }

    // 演示模式：本地 mock 封面规划
    function mockPlanCover(article) {
        const titleMatch = article.match(/^#\s+(.+)/m);
        const title = titleMatch ? titleMatch[1].slice(0, 30) : '关于生活的一点思考';
        const hasNight = /深夜|凌晨|夜晚/.test(article);
        const scene = hasNight
            ? '深夜城市天台，一个人独自站着望向远方，城市灯火在身后'
            : '清晨阳光透过窗帘，书桌上放着一杯热茶和一本打开的书';
        return {
            scene,
            title,
            quote: '生活没有标准答案，多想一层就多一层余地。',
            articleType: /ai|科技|手机|电脑/i.test(article) ? 'tech' : 'lifestyle'
        };
    }

    // 暴露到全局，供工具栏按钮调用
    window.autoIllustrate = autoIllustrate;
    window.humanizeArticle = humanizeArticle;
    window.formatArticleSmart = formatArticleSmart;
    window.getAISettings = getAISettings;
})();

// ===== 草稿功能（localStorage，无需用户系统/注册登录）=====
const DRAFT_KEY = 'wx_editor_drafts';
const AUTOSAVE_KEY = 'wx_editor_autosave';

function getDrafts() {
    try {
        return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    } catch { return []; }
}

function saveDrafts(drafts) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function generateDraftName() {
    const text = editor.innerText || '';
    // 取第一个非空行作为草稿名
    const firstLine = text.split('\n').map(s => s.trim()).find(s => s) || '未命名';
    const name = firstLine.substring(0, 20);
    const now = new Date();
    const ts = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    return `${name} - ${ts}`;
}

function saveCurrentDraft() {
    const content = editor.innerHTML;
    if (!content.trim()) {
        showToast('编辑器为空，无法保存');
        return;
    }
    const drafts = getDrafts();
    const draft = {
        id: Date.now(),
        name: generateDraftName(),
        content: content,
        savedAt: new Date().toISOString()
    };
    drafts.unshift(draft);
    // 最多保留 20 个草稿
    if (drafts.length > 20) drafts.length = 20;
    saveDrafts(drafts);
    renderDraftList();
    // V4：同步入产物中心
    if (window._productsApi) {
        try { window._productsApi.saveArticle({ content, title: draft.name }); } catch(e) { console.warn('prod sync', e); }
    }
    showToast('草稿已保存');
}

function loadDraft(id) {
    const drafts = getDrafts();
    const draft = drafts.find(d => d.id === id);
    if (!draft) return;
    editor.innerHTML = draft.content;
    updatePreview();
    showToast(`已加载草稿：${draft.name}`);
    // 关闭弹窗
    const modal = document.getElementById('draftModal');
    if (modal) modal.style.display = 'none';
}

function deleteDraft(id) {
    let drafts = getDrafts();
    drafts = drafts.filter(d => d.id !== id);
    saveDrafts(drafts);
    renderDraftList();
    showToast('草稿已删除');
}

function renderDraftList() {
    const listEl = document.getElementById('draftList');
    if (!listEl) return;
    const drafts = getDrafts();
    if (drafts.length === 0) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">暂无草稿，点击上方「保存当前为草稿」</div>';
        return;
    }
    listEl.innerHTML = drafts.map(d => {
        const date = new Date(d.savedAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        const preview = (d.content.replace(/<[^>]+>/g, '').trim().substring(0, 60)) || '（空内容）';
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #E5E7EB;border-radius:8px;background:#FAFAFA;">
                <div style="flex:1;min-width:0;cursor:pointer;" onclick="loadDraft(${d.id})">
                    <div style="font-size:13px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.name}</div>
                    <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${dateStr} · ${preview}</div>
                </div>
                <button onclick="deleteDraft(${d.id})" style="margin-left:8px;padding:4px 10px;background:#FE2C2C;color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;flex-shrink:0;">删除</button>
            </div>
        `;
    }).join('');
}

// HTML 转 Markdown（简易版，用于下载 .md 文件）
function htmlToMarkdown(html) {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<\/?(ul|ol)>/gi, '\n');
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n');
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<hr[^>]*>/gi, '\n---\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<p[^>]*>/gi, '\n');
    md = md.replace(/<\/p>/gi, '\n');
    md = md.replace(/<div[^>]*data-end-marker[^>]*>.*?<\/div>/gi, ''); // END 由模板自动追加，下载 md 时不保留
    // 移除剩余 HTML 标签
    md = md.replace(/<[^>]+>/g, '');
    // 清理多余空行
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
}

function downloadAsMarkdown() {
    const html = editor.innerHTML;
    if (!html.trim()) {
        showToast('编辑器为空，无法下载');
        return;
    }
    const md = htmlToMarkdown(html);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `文章_${dateStr}.md`;
    if (typeof saveAs !== 'undefined') {
        saveAs(blob, filename);
    } else {
        // 兜底：手动触发下载
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    showToast('已下载 ' + filename);
}

// 自动保存（防丢失，每 5 秒检查一次）
let autosaveTimer = null;
function startAutosave() {
    if (autosaveTimer) clearInterval(autosaveTimer);
    autosaveTimer = setInterval(() => {
        const content = editor.innerHTML;
        if (content.trim()) {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
                content: content,
                savedAt: new Date().toISOString()
            }));
        }
    }, 5000);
}

// 页面加载时检查自动保存
function checkAutosave() {
    try {
        const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
        if (saved && saved.content) {
            const date = new Date(saved.savedAt);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            // 如果编辑器为空，自动恢复
            if (!editor.innerHTML.trim()) {
                editor.innerHTML = saved.content;
                updatePreview();
                showToast(`已自动恢复上次内容（${dateStr} 自动保存）`);
            }
        }
    } catch {}
}

// 事件绑定
(function initDraftFeature() {
    const draftBtn = document.getElementById('draftBtn');
    const draftModal = document.getElementById('draftModal');
    const draftCloseBtn = document.getElementById('draftCloseBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const downloadMdBtn = document.getElementById('downloadMdBtn');

    if (draftBtn) {
        draftBtn.addEventListener('click', () => {
            renderDraftList();
            if (draftModal) draftModal.style.display = 'flex';
        });
    }
    if (draftCloseBtn) {
        draftCloseBtn.addEventListener('click', () => {
            if (draftModal) draftModal.style.display = 'none';
        });
    }
    if (draftModal) {
        draftModal.addEventListener('click', (e) => {
            if (e.target === draftModal) draftModal.style.display = 'none';
        });
    }
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveCurrentDraft);
    }
    if (downloadMdBtn) {
        downloadMdBtn.addEventListener('click', downloadAsMarkdown);
    }

    // 启动自动保存 + 检查恢复
    startAutosave();
    setTimeout(checkAutosave, 500);
})();

// ===== 用户系统（GitHub OAuth + Gist 数据同步）=====
// 方案：GitHub OAuth 登录 → 获取 access_token → 数据存用户私有 Gist
// 纯前端实现，无需后端，完全免费
const GITHUB_CLIENT_ID = 'Ov23liHSxnd1wuTDpic4'; // GitHub OAuth App Client ID
const GIST_FILENAME = 'wx-editor-data.json';

function getGitHubToken() {
    try {
        const data = JSON.parse(localStorage.getItem('wx_editor_github_token') || 'null');
        return data;
    } catch { return null; }
}

function saveGitHubToken(tokenData) {
    localStorage.setItem('wx_editor_github_token', JSON.stringify(tokenData));
}

function clearGitHubToken() {
    localStorage.removeItem('wx_editor_github_token');
}

// GitHub 登录：改用 Personal Access Token 方式（避免 OAuth code 交换的 CORS 问题）
// OAuth 的 access_token 端点不支持 CORS，前端无法直接换 token
// PAT 方式：用户生成 token 粘贴进来，前端直接用 token 调 GitHub API（支持 CORS）
function githubLogin() {
    // 弹出 PAT 输入框
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:32px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 16px;font-size:20px;color:#111;">GitHub 登录</h3>
            <p style="margin:0 0 12px;font-size:14px;color:#6B7280;line-height:1.6;">
                由于 GitHub OAuth 在纯前端环境下有 CORS 限制，请使用 Personal Access Token 登录：
            </p>
            <ol style="margin:0 0 16px 16px;padding:0;font-size:13px;color:#374151;line-height:1.8;">
                <li>打开 <a href="https://github.com/settings/tokens/new" target="_blank" style="color:#3B82F6;">github.com/settings/tokens/new</a></li>
                <li>Note 填写 "wx-editor"</li>
                <li>Expiration 选 "No expiration" 或 90 天</li>
                <li>勾选 <strong>gist</strong> 权限（只需这一个）</li>
                <li>点击 "Generate token"，复制生成的 token</li>
                <li>粘贴到下方输入框</li>
            </ol>
            <input type="text" id="patInput" placeholder="ghp_xxxxxxxxxxxx" style="width:100%;padding:10px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:14px;font-family:monospace;box-sizing:border-box;">
            <div id="patError" style="color:#EF4444;font-size:12px;margin-top:8px;display:none;"></div>
            <div style="display:flex;gap:8px;margin-top:16px;">
                <button id="patCancel" style="flex:1;padding:10px;border:1px solid #D1D5DB;border-radius:6px;background:#fff;color:#374151;cursor:pointer;font-size:14px;">取消</button>
                <button id="patConfirm" style="flex:1;padding:10px;border:none;border-radius:6px;background:#111;color:#fff;cursor:pointer;font-size:14px;">登录</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#patInput');
    const errorDiv = modal.querySelector('#patError');
    const confirmBtn = modal.querySelector('#patConfirm');
    const cancelBtn = modal.querySelector('#patCancel');

    input.focus();

    const close = () => modal.remove();
    cancelBtn.onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    confirmBtn.onclick = async () => {
        const token = input.value.trim();
        if (!token) {
            errorDiv.textContent = '请输入 token';
            errorDiv.style.display = 'block';
            return;
        }
        confirmBtn.textContent = '验证中...';
        confirmBtn.disabled = true;
        try {
            // 用 token 调 GitHub API 验证（支持 CORS）
            const resp = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                throw new Error(resp.status === 401 ? 'token 无效或已过期' : `HTTP ${resp.status}`);
            }
            const user = await resp.json();
            saveGitHubToken({
                accessToken: token,
                username: user.login,
                avatar: user.avatar_url,
                expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000 // 90天有效期
            });
            close();
            await syncFromGist();
            updateUserUI();
            showToast(`登录成功！欢迎, ${user.login}`);
        } catch (e) {
            errorDiv.textContent = '登录失败：' + e.message;
            errorDiv.style.display = 'block';
            confirmBtn.textContent = '登录';
            confirmBtn.disabled = false;
        }
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmBtn.click();
    });
}

// 获取或创建用户数据 Gist
async function getUserGist(accessToken) {
    try {
        // 查找已存在的 Gist
        const resp = await fetch('https://api.github.com/gists', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const gists = await resp.json();
        const existing = gists.find(g => g.files[GIST_FILENAME]);
        if (existing) return existing.id;

        // 创建新 Gist
        const createResp = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'wx-editor 个人数据备份',
                files: {
                    [GIST_FILENAME]: { content: JSON.stringify({}) }
                },
                public: false // 私有 Gist
            })
        });
        const created = await createResp.json();
        return created.id;
    } catch (e) {
        console.error('获取/创建 Gist 失败:', e);
        throw e;
    }
}

// 从 Gist 同步数据到本地
async function syncFromGist() {
    const tokenData = getGitHubToken();
    if (!tokenData) return;

    try {
        const gistId = await getUserGist(tokenData.accessToken);
        const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: { 'Authorization': `Bearer ${tokenData.accessToken}` }
        });
        const gist = await resp.json();
        const content = gist.files[GIST_FILENAME].content;
        const data = JSON.parse(content || '{}');

        // 同步 AI 设置（apiKey 用 base64 加密传输）
        if (data.aiSettings) {
            try {
                // 兼容：data.aiSettings 可能是对象或字符串
                const ais = (typeof data.aiSettings === 'string')
                    ? JSON.parse(data.aiSettings)
                    : data.aiSettings;
                // 云端 apiKey 可能是加密的（btoa(encodeURIComponent(...))）也可能是明文（旧数据）
                // 用往返校验确认是否为加密格式，避免双重编码
                let cloudKey = ais.apiKey || '';
                try {
                    const decoded = decodeURIComponent(atob(cloudKey));
                    // 往返校验：若重新编码后等于原值，则确认为加密格式
                    if (decoded && btoa(encodeURIComponent(decoded)) === cloudKey) {
                        cloudKey = decoded;
                    }
                    // 否则视为明文，保持不变（saveAISettings 会做首次加密）
                } catch {}
                saveAISettings(
                    ais.provider || 'deepseek',
                    cloudKey,
                    ais.imageCount || 4,
                    ais.baseUrl || '',
                    ais.model || ''
                );
                // 更新设置弹窗显示
                if (llmProviderSelect) llmProviderSelect.value = ais.provider || 'deepseek';
                if (llmApiKeyInput) llmApiKeyInput.value = cloudKey;
                if (llmBaseUrlInput) llmBaseUrlInput.value = ais.baseUrl || '';
                if (llmModelInput) llmModelInput.value = ais.model || '';
                if (imageCountInput) imageCountInput.value = ais.imageCount || 4;
                showToast('AI 设置已从云端同步');
            } catch {}
        }

        // 同步草稿
        if (data.drafts && Array.isArray(data.drafts)) {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(data.drafts));
                showToast(`草稿已同步（${data.drafts.length} 篇）`);
            } catch {}
        }
    } catch (e) {
        console.error('从 Gist 同步失败:', e);
        showToast('云端同步失败：' + e.message);
    }
}

// 将本地数据同步到 Gist
async function syncToGist() {
    const tokenData = getGitHubToken();
    if (!tokenData) {
        showToast('请先登录');
        return;
    }

    try {
        const gistId = await getUserGist(tokenData.accessToken);
        const s = getAISettings();
        // 上传到 Gist 时 apiKey 也用 base64 加密（即使 Gist 是 secret，多一层防护）
        const data = {
            aiSettings: {
                provider: s.provider,
                apiKey: (function(){ try { return btoa(encodeURIComponent(s.apiKey || '')); } catch { return s.apiKey || ''; } })(),
                baseUrl: s.baseUrl,
                model: s.model,
                imageCount: s.imageCount
            },
            drafts: getDrafts(),
            updatedAt: new Date().toISOString()
        };

        await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${tokenData.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) }
                }
            })
        });
        showToast('数据已同步到云端');
    } catch (e) {
        console.error('同步到 Gist 失败:', e);
        showToast('同步失败：' + e.message);
    }
}

// 登出
function githubLogout() {
    clearGitHubToken();
    updateUserUI();
    showToast('已退出登录');
}

// 更新用户 UI
function updateUserUI() {
    const userBtn = document.getElementById('userBtn');
    const userName = document.getElementById('userName');
    if (!userBtn || !userName) return;

    const tokenData = getGitHubToken();
    if (tokenData && tokenData.username) {
        userBtn.style.display = 'flex';
        userName.textContent = tokenData.username;
    } else {
        userBtn.style.display = 'flex';
        userName.textContent = '登录';
    }
}

// 用户菜单弹窗
function showUserMenu() {
    const tokenData = getGitHubToken();
    if (!tokenData) {
        githubLogin();
        return;
    }

    const menu = document.createElement('div');
    menu.style.cssText = `
        position:fixed;top:56px;right:16px;background:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:8px;min-width:160px;z-index:9999;border:1px solid #E5E7EB;
    `;
    menu.innerHTML = `
        <div style="padding:8px 12px;border-bottom:1px solid #F3F4F6;">
            <div style="font-weight:600;color:#111;">${tokenData.username}</div>
            <div style="font-size:12px;color:#6B7280;">GitHub 账号</div>
        </div>
        <button onclick="syncToGist()" style="width:100%;padding:8px 12px;text-align:left;border:none;background:none;color:#374151;font-size:13px;cursor:pointer;">
            ☁️ 同步到云端
        </button>
        <button onclick="syncFromGist()" style="width:100%;padding:8px 12px;text-align:left;border:none;background:none;color:#374151;font-size:13px;cursor:pointer;">
            ↻ 从云端同步
        </button>
        <div style="height:1px;background:#F3F4F6;margin:4px 0;"></div>
        <button onclick="githubLogout()" style="width:100%;padding:8px 12px;text-align:left;border:none;background:none;color:#EF4444;font-size:13px;cursor:pointer;">
            🔓 退出登录
        </button>
    `;
    document.body.appendChild(menu);

    function closeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

// 初始化用户系统
(function initUserSystem() {
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showUserMenu();
        });
    }

    // 更新 UI（不再需要 OAuth 回调，改用 PAT 方式）
    updateUserUI();
})();

// ===== V1 信息中枢 Inbox =====
(function() {
    const inboxState = {
        currentSource: 'all',
        allItems: [],
        keyword: '',
        timeFilter: 'all'
    };

    const SOURCE_META = {
        'wechat': { label: '公众号', color: '#07C160', icon: '📢' },
        'wechat-hot': { label: '爆文榜', color: '#DC2626', icon: '🔥' },
        'weibo': { label: '微博', color: '#E11D48', icon: '📈' },
        '36kr': { label: '36氪', color: '#1E40AF', icon: '📊' },
        'douyin': { label: '抖音', color: '#111', icon: '🎵' },
        'recommend': { label: '综合', color: '#3B82F6', icon: '🌐' }
    };

    // 统一数据拉取：调用现有函数聚合所有信源
    async function fetchAllSources() {
        const results = [];
        const tasks = [
            { source: 'wechat', fn: fetchWechatItems },
            { source: 'wechat-hot', fn: fetchWechatHotItems },
            { source: 'weibo', fn: fetchWeiboItems },
            { source: '36kr', fn: fetch36krItems },
            { source: 'douyin', fn: fetchDouyinItems },
            { source: 'recommend', fn: fetchRecommendItems }
        ];
        // 并行拉取所有源
        const settled = await Promise.allSettled(tasks.map(async t => {
            try {
                const items = await t.fn();
                return { source: t.source, items: items || [] };
            } catch (e) {
                console.warn('inbox source fail:', t.source, e);
                return { source: t.source, items: [], error: true };
            }
        }));
        for (const r of settled) {
            if (r.status === 'fulfilled' && r.value) {
                const items = Array.isArray(r.value.items) ? r.value.items : [];
                for (const it of items) {
                    results.push({ ...it, _source: r.value.source });
                }
            }
        }
        // 兜底降级：所有信源都拉取失败时注入 mock 示例数据，让用户看到 UI 骨架
        if (results.length === 0) {
            const now = new Date().toISOString().slice(0,16);
            const mock = [
                { source: '公众号', title: 'AI 大模型应用落地：从 demo 到生产的最后一公里', desc: '探讨大模型在实际业务中部署的工程挑战与解决方案', time: now, readCount: 8200, url: '' },
                { source: '公众号', title: '内容创作新范式：当 AI 成为创作伙伴', desc: 'AI 工具如何改变内容创作者的工作流', time: now, readCount: 6700, url: '' },
                { source: '爆文榜', title: '10w+ 文章的标题规律：我们分析了 5000 篇爆款', desc: '数据驱动的标题写作方法论', time: now, readCount: 102000, url: '' },
                { source: '微博', title: '#年轻人精神状态# 当代年轻人的 5 个解压方式', desc: '热搜话题：年轻人面对压力的真实反应', time: now, readCount: 450000, url: '' },
                { source: '36氪', title: 'AI 创业公司融资回暖，垂直赛道受青睐', desc: '行业趋势：AI 应用层项目获资本关注', time: now, readCount: 12000, url: '' },
                { source: '抖音', title: '短视频里的知识科普新风向', desc: '知识类内容在短视频平台的增长', time: now, readCount: 89000, url: '' }
            ];
            const sourceMap = { '公众号':'wechat', '爆文榜':'wechat-hot', '微博':'weibo', '36氪':'36kr', '抖音':'douyin' };
            for (const m of mock) results.push({ ...m, _source: sourceMap[m.source] || 'recommend', _isMock: true });
        }
        return results;
    }

    // 各源的封装（调用现有全局函数，做防御性处理）
    async function fetchWechatItems() {
        try {
            const r = await fetch('/api/articles?size=30');
            if (r.ok) { const d = await r.json(); return (d.rows||[]).map(x=>({title:x.title, source:x.source||'公众号', time:x.pub_date||'', url:x.url||'', desc:x.content||'', readCount:x.read_count||0})); }
        } catch {}
        // 降级：本地缓存的订阅文章
        try { return JSON.parse(localStorage.getItem('wx_editor_subs_articles_cache_v1')||'[]'); } catch {}
        return [];
    }
    async function fetchWechatHotItems() {
        try {
            const r = await fetch('/api/hot-articles?size=30');
            if (r.ok) { const d = await r.json(); return (d.rows||[]).map(x=>({...x, title:x.title, source:x.source||'爆文榜', time:x.pub_date||'', url:x.url||'', desc:x.content||'', readCount:x.read_count||0})); }
        } catch {}
        return [];
    }
    async function fetchWeiboItems() {
        // 复用创作模块的 weibo 抓取；若不可达返回空
        try {
            if (typeof window._fetchWeiboTopics === 'function') return await window._fetchWeiboTopics();
        } catch {}
        return [];
    }
    async function fetch36krItems() {
        try {
            const r = await fetch('/api/articles?source=36氪&size=30');
            if (r.ok) { const d = await r.json(); return (d.rows||[]).map(x=>({...x,title:x.title,source:'36氪',time:x.pub_date||'',url:x.url||'',desc:x.content||''})); }
        } catch {}
        return [];
    }
    async function fetchDouyinItems() { return []; }
    async function fetchRecommendItems() {
        try {
            if (typeof window._fetchAggregatedNews === 'function') return await window._fetchAggregatedNews();
        } catch {}
        return [];
    }

    // 时间过滤
    function filterByTime(items) {
        if (inboxState.timeFilter === 'all') return items;
        const now = Date.now();
        const ranges = { '1h': 3600e3, '24h': 86400e3, '7d': 7*86400e3 };
        const span = ranges[inboxState.timeFilter] || 0;
        return items.filter(it => {
            const t = parseItemTime(it.time || it.pub_date || it.date);
            return t && (now - t) <= span;
        });
    }
    function parseItemTime(t) {
        if (!t) return 0;
        const d = new Date(t);
        return isNaN(d) ? 0 : d.getTime();
    }

    // 关键词过滤
    function filterByKeyword(items) {
        if (!inboxState.keyword) return items;
        const kw = inboxState.keyword.toLowerCase();
        return items.filter(it =>
            (it.title||'').toLowerCase().includes(kw) ||
            (it.desc||it.content||'').toLowerCase().includes(kw)
        );
    }

    // 渲染信息卡片
    function renderInbox() {
        const list = document.getElementById('inboxList');
        const count = document.getElementById('inboxCount');
        if (!list) return;
        let items = inboxState.allItems;
        // 信源过滤
        if (inboxState.currentSource !== 'all') {
            items = items.filter(it => it._source === inboxState.currentSource);
        }
        items = filterByTime(filterByKeyword(items));
        // 按时间倒序
        items.sort((a,b) => parseItemTime(b.time) - parseItemTime(a.time));
        if (count) count.textContent = `${items.length} 条`;
        if (items.length === 0) {
            list.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#9CA3AF;font-size:14px;">暂无信息，试试切换信源或刷新</div>';
            return;
        }
        list.innerHTML = items.slice(0, 60).map(it => {
            const meta = SOURCE_META[it._source] || { label: it.source||'未知', color: '#6B7280', icon: '📌' };
            const isMock = it._isMock ? '<span style="color:#92400E;font-size:10px;margin-left:4px;">示例</span>' : '';
            const readInfo = it.readCount ? `<span style="font-size:11px;color:#9CA3AF;">👁 ${it.readCount}</span>` : '';
            const timeStr = (it.time||'').toString().slice(0,16);
            const desc = (it.desc||it.content||'').slice(0,80);
            return `<div class="inbox-card" data-source="${it._source}" style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:14px;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 20px rgba(0,0,0,0.08)';this.style.borderColor='${meta.color}66';" onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='#E5E7EB';">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${meta.color}15;color:${meta.color};font-weight:600;">${meta.icon} ${meta.label}</span>${isMock}
                    ${readInfo}
                    <span style="font-size:10px;color:#9CA3AF;margin-left:auto;">${timeStr}</span>
                </div>
                <div style="font-size:14px;color:#1F2937;font-weight:600;line-height:1.4;">${(it.title||'').replace(/</g,'&lt;')}</div>
                ${desc ? `<div style="font-size:12px;color:#6B7280;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc.replace(/</g,'&lt;')}</div>` : ''}
                <div style="display:flex;gap:6px;margin-top:auto;padding-top:6px;border-top:1px dashed #F3F4F6;">
                    <button class="inbox-to-create" data-title="${(it.title||'').replace(/"/g,'&quot;')}" type="button" style="padding:4px 10px;background:linear-gradient(135deg,#10B981,#3B82F6);color:#fff;border:none;border-radius:5px;font-size:11px;cursor:pointer;">✍ 带入创作</button>
                    ${it.url ? `<a href="${it.url}" target="_blank" rel="noopener" style="padding:4px 10px;background:#F3F4F6;color:#6B7280;border:none;border-radius:5px;font-size:11px;text-decoration:none;">原文 ↗</a>` : ''}
                </div>
            </div>`;
        }).join('');
        // 绑定带入创作
        list.querySelectorAll('.inbox-to-create').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const title = btn.getAttribute('data-title');
                const input = document.getElementById('createTopicInput');
                if (input) input.value = title;
                switchTab('create');
                showToast(`已带入创作：${title.slice(0,20)}`);
            });
        });
    }

    // 刷新全部
    async function refreshInbox(force) {
        // 如果已有数据且非强制，只重渲染
        if (!force && inboxState.allItems.length > 0) { renderInbox(); return; }
        const btn = document.getElementById('inboxRefreshBtn');
        const list = document.getElementById('inboxList');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 加载中...'; }
        if (list) list.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#9CA3AF;font-size:14px;">⏳ 正在聚合所有信源...</div>';
        try {
            inboxState.allItems = await fetchAllSources();
            renderInbox();
        } catch (e) {
            console.error('inbox refresh', e);
            if (list) list.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#DC2626;font-size:14px;">加载失败：'+e.message+'</div>';
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '🔄 刷新全部'; }
        }
    }

    // 信源切换
    function bindSourceTabs() {
        document.querySelectorAll('.inbox-source-btn').forEach(b => {
            b.addEventListener('click', () => {
                inboxState.currentSource = b.dataset.inboxSource;
                document.querySelectorAll('.inbox-source-btn').forEach(x => {
                    x.classList.remove('active');
                    x.style.background = '#fff';
                    x.style.color = x.style.borderColor;
                });
                b.classList.add('active');
                const meta = SOURCE_META[b.dataset.inboxSource];
                const c = meta ? meta.color : '#10B981';
                b.style.background = c;
                b.style.color = '#fff';
                renderInbox();
            });
        });
    }

    // 初始化
    function init() {
        bindSourceTabs();
        const searchInput = document.getElementById('inboxSearchInput');
        if (searchInput) searchInput.addEventListener('input', (e) => {
            inboxState.keyword = e.target.value;
            renderInbox();
        });
        const timeFilter = document.getElementById('inboxTimeFilter');
        if (timeFilter) timeFilter.addEventListener('change', (e) => {
            inboxState.timeFilter = e.target.value;
            renderInbox();
        });
        const refreshBtn = document.getElementById('inboxRefreshBtn');
        if (refreshBtn) refreshBtn.addEventListener('click', () => refreshInbox(true));
        // 暴露给 switchTab 调用（默认非强制：已有数据则只重渲染）
        window._inboxRefresh = (force) => refreshInbox(force);
        // V5：暴露给命令面板查询所有信源条目
        window._inboxApi = window._inboxApi || {};
        window._inboxApi.getAllItems = () => inboxState.allItems.slice(0, 50);
        window._inboxApi.refresh = (force) => refreshInbox(force);
    }
    // DOM ready
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();

// ===== V2 创作蓝图系统 =====
(function() {
    const blueprint = {
        mode: 'ai',           // 'ai' | 'custom'
        type: 'opinion',
        audience: 'intermediate',
        tone1: 50, tone2: 50, tone3: 50,  // 严谨↔活泼, 理性↔感性, 正式↔随性
        structure: 'pyramid',
        length: '1200',
        platform: 'wechat'
    };

    const PRESETS = {
        'tech-deep': { type:'insight', audience:'expert', tone1:25, tone2:30, tone3:30, structure:'pyramid', length:'1500', platform:'wechat' },
        'warm-story': { type:'story', audience:'beginner', tone1:75, tone2:75, tone3:70, structure:'progressive', length:'1200', platform:'wechat' },
        'sharp-opinion': { type:'opinion', audience:'intermediate', tone1:60, tone2:35, tone3:65, structure:'contrast', length:'1200', platform:'wechat' },
        'knowledge-pop': { type:'knowledge', audience:'beginner', tone1:65, tone2:60, tone3:55, structure:'progressive', length:'1200', platform:'xiaohongshu' }
    };

    // 调性 → 旧 style 兼容映射（用于同步到隐藏的旧 select）
    function toneToStyle(bp) {
        if (!bp) return 'deep';
        if (bp.type === 'story') return 'story';
        if (bp.type === 'emotion') return 'warm';
        if (bp.type === 'opinion' && bp.tone1 >= 60) return 'sharp';
        if (bp.tone1 >= 65) return 'casual';
        return 'deep';
    }

    // 结构 → 旧 sections 兼容映射
    function structureToSections(structure) {
        const map = { pyramid: '4', scqa: '4', star: '4', contrast: '3', progressive: '5', list: '5' };
        return map[structure] || '4';
    }

    // 兼容旧代码：创建隐藏的旧 select 占位
    function ensureLegacyInputs() {
        ['createWordCount','createDirection','createStyle','createSections'].forEach(id => {
            if (!document.getElementById(id)) {
                const el = document.createElement('select');
                el.id = id; el.style.display = 'none';
                document.body.appendChild(el);
            }
        });
    }

    // 同步蓝图值到旧 select（保护旧生成逻辑不报错）
    function syncToLegacy() {
        const wc = document.getElementById('createWordCount'); if (wc) wc.value = blueprint.length;
        const dir = document.getElementById('createDirection'); if (dir) dir.value = blueprint.type;
        const st = document.getElementById('createStyle'); if (st) st.value = toneToStyle(blueprint);
        const sec = document.getElementById('createSections'); if (sec) sec.value = structureToSections(blueprint.structure);
    }

    function applyBlueprint(bp) {
        Object.assign(blueprint, bp);
        // 同步 UI
        document.querySelectorAll('.bp-type-btn').forEach(b => {
            const on = b.dataset.type === blueprint.type;
            b.classList.toggle('active', on);
            b.style.borderColor = on ? '#10B981' : '#E5E7EB';
            b.style.background = on ? '#ECFDF5' : '#fff';
            b.querySelector('div:last-child').style.color = on ? '#1F2937' : '#6B7280';
        });
        document.querySelectorAll('.bp-aud-btn').forEach(b => {
            const on = b.dataset.aud === blueprint.audience;
            b.classList.toggle('active', on);
            b.style.borderColor = on ? '#10B981' : '#E5E7EB';
            b.style.background = on ? '#ECFDF5' : '#fff';
            b.style.color = on ? '#1F2937' : '#6B7280';
        });
        const s = document.getElementById('blueprintStructure'); if (s) s.value = blueprint.structure;
        const l = document.getElementById('blueprintLength'); if (l) l.value = blueprint.length;
        const p = document.getElementById('blueprintPlatform'); if (p) p.value = blueprint.platform;
        ['1','2','3'].forEach(n => {
            const inp = document.getElementById('bpTone'+n);
            const val = document.getElementById('bpTone'+n+'Val');
            if (inp) inp.value = blueprint['tone'+n];
            if (val) val.textContent = blueprint['tone'+n];
        });
        syncToLegacy();
    }

    function init() {
        // 兼容旧代码：创建隐藏的旧 select 占位（避免旧生成逻辑读到 null）
        ensureLegacyInputs();

        // 模式切换
        document.querySelectorAll('.blueprint-mode-btn').forEach(b => {
            b.addEventListener('click', () => {
                blueprint.mode = b.dataset.mode;
                document.querySelectorAll('.blueprint-mode-btn').forEach(x => {
                    const on = x.dataset.mode === blueprint.mode;
                    x.style.background = on ? 'linear-gradient(135deg,#10B981,#3B82F6)' : '#fff';
                    x.style.color = on ? '#fff' : '#6B7280';
                    x.classList.toggle('active', on);
                });
                document.getElementById('blueprintAIPanel').style.display = blueprint.mode === 'ai' ? 'block' : 'none';
                document.getElementById('blueprintCustomPanel').style.display = blueprint.mode === 'custom' ? 'block' : 'none';
                const genBtn = document.getElementById('createGenerateBtn');
                if (genBtn) genBtn.textContent = blueprint.mode === 'ai' ? '🚀 生成文章' : '✍ 进入编辑器';
            });
        });

        // 内容类型选择
        document.querySelectorAll('.bp-type-btn').forEach(b => {
            b.addEventListener('click', () => applyBlueprint({ type: b.dataset.type }));
        });
        // 受众选择
        document.querySelectorAll('.bp-aud-btn').forEach(b => {
            b.addEventListener('click', () => applyBlueprint({ audience: b.dataset.aud }));
        });
        // 调性滑块
        ['1','2','3'].forEach(n => {
            const inp = document.getElementById('bpTone'+n);
            if (inp) inp.addEventListener('input', (e) => {
                blueprint['tone'+n] = parseInt(e.target.value);
                const val = document.getElementById('bpTone'+n+'Val');
                if (val) val.textContent = e.target.value;
                syncToLegacy();
            });
        });
        // 结构/长度/平台
        const s = document.getElementById('blueprintStructure'); if (s) s.addEventListener('change', e => { blueprint.structure = e.target.value; syncToLegacy(); });
        const l = document.getElementById('blueprintLength'); if (l) l.addEventListener('change', e => { blueprint.length = e.target.value; syncToLegacy(); });
        const p = document.getElementById('blueprintPlatform'); if (p) p.addEventListener('change', e => { blueprint.platform = e.target.value; });
        // 预设
        document.querySelectorAll('.bp-preset-btn').forEach(b => {
            b.addEventListener('click', () => {
                const preset = PRESETS[b.dataset.preset];
                if (preset) { applyBlueprint(preset); showToast('已应用预设：' + b.textContent); }
            });
        });
        // 保存预设
        const saveBtn = document.getElementById('bpSavePresetBtn');
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const name = prompt('预设名称：', '我的预设');
            if (!name) return;
            try {
                const saved = JSON.parse(localStorage.getItem('wx_bp_presets') || '{}');
                saved[name] = { ...blueprint };
                localStorage.setItem('wx_bp_presets', JSON.stringify(saved));
                showToast('预设「' + name + '」已保存');
            } catch(e) { showToast('保存失败'); }
        });
        // 自定义模式：AI 辅助工具栏（选中文本浮现）
        const toolbar = document.getElementById('aiAssistToolbar');
        const editor = document.getElementById('createArticleEditor') || document.getElementById('editorContent');
        if (toolbar && editor) {
            document.addEventListener('mouseup', () => {
                const sel = window.getSelection();
                const text = sel ? sel.toString().trim() : '';
                if (blueprint.mode === 'custom' && text.length > 0 && editor.contains(sel.anchorNode)) {
                    const rect = sel.getRangeAt(0).getBoundingClientRect();
                    toolbar.style.display = 'flex';
                    toolbar.style.left = (rect.left + rect.width/2 - 100) + 'px';
                    toolbar.style.top = (rect.top - 40) + 'px';
                } else {
                    toolbar.style.display = 'none';
                }
            });
            document.querySelectorAll('.ai-assist-btn').forEach(b => {
                b.addEventListener('click', () => {
                    const sel = window.getSelection();
                    const text = sel ? sel.toString().trim() : '';
                    const action = b.dataset.action;
                    toolbar.style.display = 'none';
                    window._blueprintAiAssist && window._blueprintAiAssist(action, text);
                });
            });
        }
        // 暴露当前蓝图给生成逻辑
        window._getBlueprint = () => ({ ...blueprint });
        // 初始同步一次，确保隐藏 select 有初值
        syncToLegacy();
    }
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();

// ===== V3 贴图卡片 Canvas 合成（基于 article-content-cards skill 规范）=====
(function() {
    const W = 720, H = 960;

    // 风格预设（背景 prompt 关键词 + 渐变基调）
    const STYLES = {
        'tech-dark': { bgPrompt: 'futuristic holographic data streams, deep blue neon', tone: '#0a1628', accent: '#3B82F6' },
        'business-minimal': { bgPrompt: 'clean geometric premium, black white gold', tone: '#0f0f0f', accent: '#B4966A' },
        'finance-dark': { bgPrompt: 'trading screens charts abstract, black gold green', tone: '#0a0f0a', accent: '#D4AF37' },
        'science-fresh': { bgPrompt: 'clean lab molecular bright teal', tone: '#e8f4f0', accent: '#06B6D4' },
        'lifestyle-warm': { bgPrompt: 'warm interior soft natural light cream', tone: '#2a1f15', accent: '#EA580C' },
        'retro-magazine': { bgPrompt: 'vintage film grain editorial muted', tone: '#1a1410', accent: '#B4896B' },
        'chinese-ink': { bgPrompt: 'ink wash brush strokes mountain black white red', tone: '#0a0a0a', accent: '#C83232' },
        'japanese-muted': { bgPrompt: 'soft light minimal wabi-sabi pastel', tone: '#2a2a28', accent: '#B8B8B0' },
        'trendy-poster': { bgPrompt: 'bold colors graphic pop art high saturation', tone: '#1a0010', accent: '#FF6464' }
    };

    // accent 配色（RGB）
    const ACCENTS = {
        ai: [59, 130, 246],
        cloud: [6, 182, 212],
        robot: [249, 115, 22],
        health: [34, 197, 94],
        brain: [168, 85, 247],
        finance: [212, 175, 55],
        edu: [99, 102, 241],
        entertain: [236, 72, 153]
    };

    // smoothstep 渐变（模拟 skill 的 t*t*(3-2t)）
    function drawSmoothGradient(ctx, topRatio, maxA) {
        const topY = H * topRatio;
        const span = H - topY;
        for (let y = topY; y < H; y++) {
            let t = (y - topY) / span;
            t = t * t * (3 - 2 * t);
            const a = Math.floor(maxA * t);
            ctx.fillStyle = `rgba(6,6,10,${a/255})`;
            ctx.fillRect(0, y, W, 1);
        }
    }

    // 顶部暗化
    function drawTopDarken(ctx) {
        for (let y = 0; y < 90; y++) {
            const a = Math.floor(110 * (1 - y / 90));
            ctx.fillStyle = `rgba(0,0,0,${a/255})`;
            ctx.fillRect(0, y, W, 1);
        }
    }

    // 文字换行
    function wrapText(ctx, text, font, maxW) {
        ctx.font = font;
        const lines = [];
        let cur = '';
        for (const ch of text) {
            const test = cur + ch;
            if (ctx.measureText(test).width > maxW && cur) {
                lines.push(cur);
                cur = ch;
            } else {
                cur = test;
            }
        }
        if (cur) lines.push(cur);
        return lines;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // 玻璃拟态 badge
    function drawBadge(ctx, text, padX, padY) {
        ctx.font = 'bold 22px "Noto Sans SC", sans-serif';
        const metrics = ctx.measureText(text);
        const bw = metrics.width + 28;
        const bh = 22 + 16;
        // 圆角矩形
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        roundRect(ctx, padX, 32, bw, bh, 14);
        ctx.fill();
        ctx.stroke();
        // 文字
        ctx.fillStyle = 'rgba(255,255,255,0.94)';
        ctx.fillText(text, padX + 14, 32 + 22 + 8);
        return { bw, bh };
    }

    // 生成背景图（调用图片 API 或用纯色降级）
    async function fetchBackground(style, topicHint) {
        const s = STYLES[style] || STYLES['business-minimal'];
        // 尝试用网站已配置的图片 API
        try {
            const apiKey = (typeof getImageApiKey === 'function') ? getImageApiKey() : (localStorage.getItem('wx_image_api_key') || '');
            const provider = localStorage.getItem('wx_image_provider') || 'trae';
            if (apiKey || provider === 'trae') {
                const prompt = `Dramatic cinematic scene: ${s.bgPrompt}, matching topic "${topicHint}". No text, no letters, no words, no logos. Pure visual atmosphere. 720x960 vertical.`;
                const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`;
                const r = await fetch(url);
                if (r.ok) {
                    const blob = await r.blob();
                    return await blobToDataURL(blob);
                }
            }
        } catch (e) { console.warn('bg fetch fail, fallback gradient', e); }
        // 降级：用风格基调色生成渐变背景
        return null;
    }

    function blobToDataURL(blob) {
        return new Promise((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = () => resolve(null);
            fr.readAsDataURL(blob);
        });
    }

    // 画降级渐变背景
    function drawFallbackBg(ctx, style) {
        const s = STYLES[style] || STYLES['business-minimal'];
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, s.tone);
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // 加点纹理
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
            const r = Math.random() * 100 + 20;
            ctx.beginPath();
            ctx.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 合成单张卡片
    async function compositeCard(card) {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        const accent = ACCENTS[card.accent] || ACCENTS.cloud;
        const accentColor = `rgb(${accent[0]},${accent[1]},${accent[2]})`;

        // 1. 背景
        const bgUrl = await fetchBackground(card.style, card.topicHint || card.title);
        if (bgUrl) {
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve(); };
                img.onerror = () => { drawFallbackBg(ctx, card.style); resolve(); };
                img.src = bgUrl;
            });
        } else {
            drawFallbackBg(ctx, card.style);
        }

        // 2. smoothstep 渐变叠加
        drawSmoothGradient(ctx, 0.45, 240);
        // 3. 顶部暗化
        drawTopDarken(ctx);

        const pad = 40;
        // 4. badge
        drawBadge(ctx, card.badge || '内容卡', pad, 32);

        // 5. accent 横条
        const barY = H * 0.62;
        ctx.fillStyle = accentColor;
        ctx.fillRect(pad, barY, 56, 5);

        // 6. 按类型渲染
        if (card.type === 'cover') {
            renderCover(ctx, card, accent, accentColor, barY, pad);
        } else if (card.type === 'summary') {
            renderSummary(ctx, card, accent, accentColor, barY, pad);
        } else {
            renderContent(ctx, card, accent, accentColor, barY, pad);
        }
        return canvas.toDataURL('image/jpeg', 0.92);
    }

    function renderContent(ctx, card, accent, accentColor, barY, pad) {
        const mw = W - pad * 2;
        // 标题 56px
        ctx.font = '600 56px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.textBaseline = 'top';
        let titleY = barY + 22;
        const titleLines = wrapText(ctx, card.title, '600 56px "Noto Sans SC", sans-serif', mw);
        titleLines.forEach((line, i) => ctx.fillText(line, pad, titleY + i * 68));

        // 副标题 30px（带 accent 阴影发光）
        ctx.font = '500 30px "Noto Sans SC", sans-serif';
        const subY = titleY + titleLines.length * 68 + 6;
        const subLines = wrapText(ctx, card.subtitle || '', '500 30px "Noto Sans SC", sans-serif', mw);
        subLines.forEach((line, i) => {
            ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.2)`;
            ctx.fillText(line, pad + 1, subY + i * 42 + 1);
            ctx.fillStyle = 'rgba(255,255,255,0.94)';
            ctx.fillText(line, pad, subY + i * 42);
        });

        // 分隔线
        const sepY = subY + subLines.length * 42 + 14;
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(pad, sepY, mw, 1);

        // 描述 22px
        ctx.font = '400 22px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(190,200,215,0.78)';
        const descLines = wrapText(ctx, card.desc || '', '400 22px "Noto Sans SC", sans-serif', mw);
        const bodyY = sepY + 16;
        descLines.forEach((line, i) => ctx.fillText(line, pad, bodyY + i * 32));
    }

    function renderCover(ctx, card, accent, accentColor, barY, pad) {
        const mw = W - pad * 2;
        ctx.font = '700 60px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.textBaseline = 'top';
        let titleY = barY + 22;
        const titleLines = wrapText(ctx, card.title, '700 60px "Noto Sans SC", sans-serif', mw);
        titleLines.forEach((line, i) => ctx.fillText(line, pad, titleY + i * 72));

        ctx.font = '500 32px "Noto Sans SC", sans-serif';
        const subY = titleY + titleLines.length * 72 + 8;
        const subLines = wrapText(ctx, card.subtitle || '', '500 32px "Noto Sans SC", sans-serif', mw);
        subLines.forEach((line, i) => {
            ctx.fillStyle = 'rgba(255,255,255,0.94)';
            ctx.fillText(line, pad, subY + i * 44);
        });

        if (card.hook) {
            const hookY = subY + subLines.length * 44 + 20;
            ctx.font = '400 26px "Noto Sans SC", sans-serif';
            ctx.fillStyle = 'rgba(220,225,235,0.78)';
            ctx.fillText(card.hook, pad, hookY);
        }
    }

    function renderSummary(ctx, card, accent, accentColor, barY, pad) {
        const mw = W - pad * 2;
        ctx.font = '600 56px "Noto Sans SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.textBaseline = 'top';
        let titleY = barY + 22;
        const titleLines = wrapText(ctx, card.title, '600 56px "Noto Sans SC", sans-serif', mw);
        titleLines.forEach((line, i) => ctx.fillText(line, pad, titleY + i * 68));

        // 关键词圆角标签
        if (card.keywords && card.keywords.length) {
            const kwY = titleY + titleLines.length * 68 + 20;
            let kwX = pad;
            ctx.font = '500 26px "Noto Sans SC", sans-serif';
            card.keywords.forEach(kw => {
                const w = ctx.measureText(kw).width + 24;
                ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.7)`;
                ctx.lineWidth = 1;
                roundRect(ctx, kwX, kwY, w, 26 + 14, 10);
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.86)';
                ctx.fillText(kw, kwX + 12, kwY + 7);
                kwX += w + 12;
            });
        }

        // 收尾句居中
        if (card.closing) {
            ctx.font = '400 26px "Noto Sans SC", sans-serif';
            ctx.fillStyle = 'rgba(220,225,235,0.82)';
            ctx.textAlign = 'center';
            const closeLines = wrapText(ctx, card.closing, '400 26px "Noto Sans SC", sans-serif', mw);
            const closeY = H - 100 - closeLines.length * 34;
            closeLines.forEach((line, i) => ctx.fillText(line, W / 2, closeY + i * 34));
            ctx.textAlign = 'left';
        }
    }

    // 从用户输入解析卡片内容
    function parseCardFromInput(text, type) {
        text = (text || '').trim();
        if (!text) return null;
        if (type === 'cover') {
            const lines = text.split('\n').filter(Boolean);
            return { type: 'cover', title: lines[0] || text.slice(0, 20), subtitle: lines[1] || '深度解读', hook: lines[2] || '一文看懂核心要点', badge: '封面' };
        }
        if (type === 'summary') {
            const parts = text.split(/[，,。；;]/).filter(Boolean);
            return {
                type: 'summary',
                title: parts[0] || '核心总结',
                keywords: parts.slice(1, 4).map(p => p.trim().slice(0, 8)).filter(Boolean),
                closing: parts[parts.length - 1] || '关注获取更多深度内容',
                badge: '总结'
            };
        }
        // content
        const lines = text.split('\n').filter(Boolean);
        const title = lines[0] || text.slice(0, 20);
        const subtitle = lines[1] || '关键洞察';
        const desc = lines.slice(2).join(' ') || text.slice(20, 120) || '这一点值得关注';
        return { type: 'content', title, subtitle, desc, badge: '内容' };
    }

    async function generateCards() {
        const input = document.getElementById('ccInput');
        const typeSel = document.getElementById('ccCardType');
        const styleSel = document.getElementById('ccStyle');
        const accentSel = document.getElementById('ccAccent');
        const preview = document.getElementById('ccPreview');
        const btn = document.getElementById('ccGenerateBtn');
        if (!input || !preview) return;
        const text = input.value.trim();
        if (!text) { showToast('请输入标题或文章'); return; }
        const type = typeSel.value;
        const style = styleSel.value;
        const accent = accentSel.value;
        if (btn) { btn.disabled = true; btn.textContent = '🎨 生成中...'; }
        preview.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#9CA3AF;font-size:13px;">⏳ 正在合成卡片...</div>';
        try {
            // 如果输入是长文章，生成 3 张系列卡；否则单张
            const isLong = text.length > 80 || text.split('\n').length > 3;
            let cards = [];
            if (isLong) {
                // 系列卡：cover + 1 content + summary
                cards = [
                    { ...parseCardFromInput(text.split('\n')[0] || text.slice(0,40), 'cover'), style, accent, topicHint: text.slice(0,30) },
                    { ...parseCardFromInput(text, 'content'), style, accent, topicHint: text.slice(0,30) },
                    { ...parseCardFromInput(text, 'summary'), style, accent, topicHint: text.slice(0,30) }
                ];
            } else {
                cards = [{ ...parseCardFromInput(text, type), style, accent, topicHint: text.slice(0,20) }];
            }
            // 并行合成
            const dataUrls = await Promise.all(cards.map(c => compositeCard(c)));
            preview.innerHTML = dataUrls.map((url, i) => `
                <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;">
                    <img src="${url}" style="width:100%;display:block;" />
                    <div style="padding:8px 10px;display:flex;gap:6px;align-items:center;background:#F9FAFB;">
                        <span style="font-size:11px;color:#6B7280;">${cards[i].type === 'cover' ? '封面卡' : cards[i].type === 'summary' ? '总结卡' : '内容卡'}</span>
                        <a href="${url}" download="card-${i+1}.jpg" style="margin-left:auto;font-size:11px;color:#10B981;text-decoration:none;">⬇ 下载</a>
                    </div>
                </div>`).join('');
            showToast(`已生成 ${dataUrls.length} 张卡片`);
            // V4：自动入产物中心
            try {
                if (window._productsApi && dataUrls.length) {
                    const title = (text.split('\n')[0] || text.slice(0, 20)).trim() || '贴图卡片';
                    window._productsApi.saveCard({
                        title,
                        text,
                        thumb: dataUrls[0],
                        thumbs: dataUrls,
                        style, accent
                    });
                }
            } catch (e) { console.warn('card save to products', e); }
        } catch (e) {
            console.error('card gen', e);
            preview.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#DC2626;font-size:13px;">生成失败：'+e.message+'</div>';
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '🎨 生成卡片'; }
        }
    }

    function init() {
        const btn = document.getElementById('ccGenerateBtn');
        if (btn) btn.addEventListener('click', generateCards);
        // 暴露给模式切换
        window._ccPanel = document.getElementById('contentCardsPanel');
    }
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();

// ===== V4 产物中心：统一产物库 =====
(function productsCenterModule() {
    'use strict';
    const STORE_KEY = 'wx_products_v1';
    const MIGRATED_KEY = 'wx_products_migrated_v1';
    const MAX_VERSIONS = 10;

    const TYPE_META = {
        article: { icon: '📝', label: '文章', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
        card:     { icon: '🎴', label: '卡片', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
        audio:    { icon: '🎙', label: '音频', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' }
    };

    const state = {
        products: [],
        filter: { type: 'all', keyword: '', tag: '', sort: 'recent', view: 'grid' }
    };

    // ---------- 存储层 ----------
    function load() {
        try { state.products = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
        catch { state.products = []; }
    }
    function persist() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state.products)); }
        catch (e) { console.warn('products persist fail', e); }
    }

    // 旧草稿迁移：把 wx_editor_drafts 转换为 article 类型产物
    function migrateLegacyDrafts() {
        if (localStorage.getItem(MIGRATED_KEY)) return;
        try {
            const oldDrafts = JSON.parse(localStorage.getItem('wx_editor_drafts') || '[]');
            for (const d of oldDrafts) {
                const text = (d.content || '').replace(/<[^>]+>/g, '');
                state.products.push({
                    id: 'art_' + d.id,
                    type: 'article',
                    title: d.name || '未命名文章',
                    content: d.content || '',
                    text: text,
                    wordCount: text.replace(/\s/g, '').length,
                    tags: [],
                    versions: [{
                        v: 1, content: d.content || '', savedAt: d.savedAt || new Date().toISOString(), note: '迁移自旧草稿'
                    }],
                    parentId: null,
                    derivedIds: [],
                    createdAt: d.savedAt || new Date().toISOString(),
                    updatedAt: d.savedAt || new Date().toISOString(),
                    trashed: false
                });
            }
            localStorage.setItem(MIGRATED_KEY, '1');
            persist();
        } catch (e) { console.warn('migrate fail', e); }
    }

    // ---------- API ----------
    function list() { return state.products.slice(); }
    function get(id) { return state.products.find(p => p.id === id); }

    function upsert(partial) {
        const now = new Date().toISOString();
        let p;
        if (partial.id && (p = get(partial.id))) {
            // 更新：把当前内容压栈为版本
            if (partial.content !== undefined && partial.content !== p.content) {
                p.versions = p.versions || [];
                p.versions.unshift({
                    v: (p.versions[0]?.v || 0) + 1,
                    content: p.content,
                    text: p.text,
                    wordCount: p.wordCount,
                    savedAt: p.updatedAt || now,
                    note: partial.versionNote || '自动版本'
                });
                if (p.versions.length > MAX_VERSIONS) p.versions.length = MAX_VERSIONS;
            }
            Object.assign(p, partial, { updatedAt: now });
        } else {
            // 新建：id 加入随机后缀，避免同毫秒创建导致碰撞
            const rand = Math.random().toString(36).slice(2, 8);
            const id = partial.id || (partial.type?.slice(0,3) + '_' + Date.now() + '_' + rand);
            const text = partial.text || (partial.content || '').replace(/<[^>]+>/g, '');
            p = {
                id,
                type: partial.type || 'article',
                title: partial.title || '未命名',
                content: partial.content || '',
                text,
                wordCount: text.replace(/\s/g, '').length,
                tags: partial.tags || [],
                versions: [],
                parentId: partial.parentId || null,
                derivedIds: [],
                createdAt: partial.createdAt || now,
                updatedAt: now,
                trashed: false,
                meta: partial.meta || {}
            };
            state.products.unshift(p);
        }
        persist();
        return p;
    }

    function remove(id, permanent) {
        const i = state.products.findIndex(p => p.id === id);
        if (i < 0) return;
        if (permanent) {
            state.products.splice(i, 1);
        } else {
            state.products[i].trashed = true;
            state.products[i].updatedAt = new Date().toISOString();
        }
        persist();
    }
    function restore(id) {
        const p = get(id); if (!p) return;
        p.trashed = false; p.updatedAt = new Date().toISOString();
        persist();
    }
    function emptyTrash() {
        state.products = state.products.filter(p => !p.trashed);
        persist();
    }
    function addTag(id, tag) {
        const p = get(id); if (!p) return;
        tag = (tag || '').trim();
        if (!tag) return;
        if (!p.tags.includes(tag)) p.tags.push(tag);
        persist();
    }
    function removeTag(id, tag) {
        const p = get(id); if (!p) return;
        p.tags = p.tags.filter(t => t !== tag);
        persist();
    }
    function linkDerivative(parentId, childId) {
        const parent = get(parentId); const child = get(childId);
        if (!parent || !child) return;
        if (!parent.derivedIds.includes(childId)) parent.derivedIds.push(childId);
        child.parentId = parentId;
        persist();
    }
    function restoreVersion(id, v) {
        const p = get(id); if (!p || !p.versions) return;
        const ver = p.versions.find(x => x.v === v);
        if (!ver) return;
        // 当前内容先入版本
        p.versions.unshift({
            v: (p.versions[0]?.v || 0) + 1,
            content: p.content, text: p.text, wordCount: p.wordCount,
            savedAt: p.updatedAt, note: '回滚前快照'
        });
        if (p.versions.length > MAX_VERSIONS) p.versions.length = MAX_VERSIONS;
        // 移除已恢复的版本
        p.versions = p.versions.filter(x => x.v !== v);
        p.content = ver.content; p.text = ver.text; p.wordCount = ver.wordCount;
        p.updatedAt = new Date().toISOString();
        persist();
    }

    // ---------- 查询 ----------
    function filterProducts() {
        const f = state.filter;
        let arr = state.products.slice();
        if (f.type === 'trash') {
            arr = arr.filter(p => p.trashed);
        } else {
            arr = arr.filter(p => !p.trashed);
            if (f.type !== 'all') arr = arr.filter(p => p.type === f.type);
        }
        if (f.tag) arr = arr.filter(p => p.tags && p.tags.includes(f.tag));
        if (f.keyword) {
            const kw = f.keyword.toLowerCase();
            arr = arr.filter(p =>
                (p.title||'').toLowerCase().includes(kw) ||
                (p.text||'').toLowerCase().includes(kw) ||
                (p.tags||[]).some(t => t.toLowerCase().includes(kw))
            );
        }
        const sorters = {
            recent: (a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||''),
            created: (a,b) => (b.createdAt||'').localeCompare(a.createdAt||''),
            name: (a,b) => (a.title||'').localeCompare(b.title||''),
            size: (a,b) => (b.wordCount||0) - (a.wordCount||0)
        };
        arr.sort(sorters[f.sort] || sorters.recent);
        return arr;
    }

    function allTags() {
        const tagSet = {};
        for (const p of state.products) {
            if (p.trashed) continue;
            for (const t of (p.tags || [])) tagSet[t] = (tagSet[t]||0) + 1;
        }
        return Object.keys(tagSet).map(t => ({ tag: t, count: tagSet[t] })).sort((a,b) => b.count - a.count);
    }

    function stats() {
        const s = { article: 0, card: 0, audio: 0, trash: 0, total: 0 };
        for (const p of state.products) {
            if (p.trashed) { s.trash++; continue; }
            s.total++;
            if (s[p.type] !== undefined) s[p.type]++;
        }
        return s;
    }

    // ---------- 渲染 ----------
    function fmtTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
        if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
        if (diff < 86400*7) return Math.floor(diff/86400) + ' 天前';
        return `${d.getMonth()+1}/${d.getDate()}`;
    }
    function escapeHtml(s) {
        return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
    function preview(p) {
        const t = p.text || '';
        if (p.type === 'card' && p.meta?.thumb) return ''; // 卡片用缩略图
        return t.replace(/\s+/g, ' ').trim().slice(0, 90);
    }

    function renderStats() {
        const el = document.getElementById('prodStats');
        if (!el) return;
        const s = stats();
        const items = [
            { k: 'total', label: '产物总数', icon: '📦', color: '#10B981', count: s.total },
            { k: 'article', label: '文章', icon: '📝', color: '#3B82F6', count: s.article },
            { k: 'card', label: '卡片', icon: '🎴', color: '#8B5CF6', count: s.card },
            { k: 'audio', label: '音频', icon: '🎙', color: '#F59E0B', count: s.audio },
            { k: 'trash', label: '回收站', icon: '🗑', color: '#9CA3AF', count: s.trash }
        ];
        el.innerHTML = items.map(it => `
            <div data-stat="${it.k}" class="prod-stat-card" style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:12px 14px;cursor:pointer;transition:all 0.2s;${state.filter.type === it.k ? 'border-color:'+it.color+';box-shadow:0 0 0 3px '+it.color+'20;' : ''}">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:18px;">${it.icon}</span>
                    <div>
                        <div style="font-size:20px;font-weight:700;color:${it.color};line-height:1;">${it.count}</div>
                        <div style="font-size:11px;color:#6B7280;margin-top:2px;">${it.label}</div>
                    </div>
                </div>
            </div>
        `).join('');
        el.querySelectorAll('[data-stat]').forEach(card => {
            card.addEventListener('click', () => {
                setFilter('type', card.dataset.stat);
            });
            card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
        });
    }

    function renderTagBar() {
        const el = document.getElementById('prodTagBar');
        if (!el) return;
        const tags = allTags();
        if (!tags.length) { el.innerHTML = ''; return; }
        el.innerHTML = `<span style="font-size:11px;color:#9CA3AF;padding:4px 6px;">🏷</span>` +
            tags.slice(0, 12).map(t => `
                <button data-tag="${escapeHtml(t.tag)}" class="prod-tag-pill" style="padding:4px 10px;background:${state.filter.tag === t.tag ? '#10B981' : '#fff'};color:${state.filter.tag === t.tag ? '#fff' : '#6B7280'};border:1px solid ${state.filter.tag === t.tag ? '#10B981' : '#E5E7EB'};border-radius:14px;font-size:11px;cursor:pointer;">${escapeHtml(t.tag)} <span style="opacity:0.7;">${t.count}</span></button>
            `).join('');
        el.querySelectorAll('[data-tag]').forEach(b => {
            b.addEventListener('click', () => {
                const tag = b.dataset.tag;
                setFilter('tag', state.filter.tag === tag ? '' : tag);
            });
        });
    }

    function renderList() {
        const listEl = document.getElementById('prodList');
        const emptyEl = document.getElementById('prodEmpty');
        if (!listEl) return;
        const arr = filterProducts();
        if (!arr.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        const isGrid = state.filter.view === 'grid';
        listEl.style.gridTemplateColumns = isGrid ? 'repeat(auto-fill,minmax(280px,1fr))' : '1fr';

        listEl.innerHTML = arr.map(p => {
            const meta = TYPE_META[p.type] || TYPE_META.article;
            const prev = preview(p);
            const title = escapeHtml(p.title || '未命名');
            const tagsHtml = (p.tags||[]).slice(0,3).map(t => `<span style="display:inline-block;padding:1px 6px;background:${meta.bg};color:${meta.color};border-radius:3px;font-size:10px;margin-right:4px;">#${escapeHtml(t)}</span>`).join('');
            const derivedCount = (p.derivedIds||[]).length;
            const versionCount = (p.versions||[]).length;

            // 卡片产物缩略图
            let thumbHtml = '';
            if (p.type === 'card' && p.meta?.thumb) {
                thumbHtml = `<img src="${p.meta.thumb}" style="width:100%;height:${isGrid ? '140px' : '60px'};object-fit:cover;background:#F3F4F6;" alt="">`;
            } else if (p.type === 'card' && Array.isArray(p.meta?.thumbs) && p.meta.thumbs.length) {
                thumbHtml = `<div style="display:flex;height:${isGrid ? '140px' : '60px'};overflow:hidden;background:#F3F4F6;">${p.meta.thumbs.slice(0,3).map(u => `<img src="${u}" style="height:100%;flex:1;object-fit:cover;min-width:0;">`).join('')}</div>`;
            } else if (isGrid) {
                // 文章/音频用渐变占位
                thumbHtml = `<div style="height:80px;background:linear-gradient(135deg,${meta.bg},#fff);display:flex;align-items:center;justify-content:center;font-size:36px;opacity:0.6;">${meta.icon}</div>`;
            }

            if (isGrid) {
                return `
                <div class="prod-card" data-id="${p.id}" style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;">
                    ${thumbHtml}
                    <div style="padding:10px 12px;flex:1;display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="display:inline-block;padding:2px 6px;background:${meta.bg};color:${meta.color};border-radius:4px;font-size:10px;font-weight:600;letter-spacing:0.5px;">${meta.icon} ${meta.label}</span>
                            ${p.trashed ? '<span style="font-size:10px;color:#DC2626;">已删</span>' : ''}
                        </div>
                        <div style="font-size:13px;font-weight:600;color:#1F2937;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${title}</div>
                        ${prev ? `<div style="font-size:11px;color:#9CA3AF;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(prev)}</div>` : ''}
                        <div style="font-size:11px;color:#9CA3AF;margin-top:auto;">${fmtTime(p.updatedAt)} · ${p.wordCount||0}字</div>
                        ${tagsHtml ? `<div>${tagsHtml}</div>` : ''}
                        ${(derivedCount || versionCount) ? `<div style="font-size:10px;color:#9CA3AF;border-top:1px dashed #F3F4F6;padding-top:6px;">${versionCount ? '🗂 '+versionCount+'版本' : ''} ${derivedCount ? '· 🔗 '+derivedCount+'衍生' : ''}</div>` : ''}
                    </div>
                </div>`;
            } else {
                return `
                <div class="prod-card" data-id="${p.id}" style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;cursor:pointer;transition:all 0.2s;display:flex;gap:12px;padding:10px;align-items:center;">
                    ${thumbHtml ? `<div style="width:80px;height:60px;flex-shrink:0;border-radius:6px;overflow:hidden;">${thumbHtml.replace(/height:[^;"]+/g,'height:60px').replace(/width:100%;/g,'width:80px;')}</div>` : `<div style="width:60px;height:60px;flex-shrink:0;border-radius:6px;background:${meta.bg};display:flex;align-items:center;justify-content:center;font-size:24px;">${meta.icon}</div>`}
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                            <span style="display:inline-block;padding:2px 6px;background:${meta.bg};color:${meta.color};border-radius:4px;font-size:10px;font-weight:600;">${meta.icon} ${meta.label}</span>
                            ${tagsHtml}
                            ${p.trashed ? '<span style="font-size:10px;color:#DC2626;">已删</span>' : ''}
                        </div>
                        <div style="font-size:13px;font-weight:600;color:#1F2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
                        <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${fmtTime(p.updatedAt)} · ${p.wordCount||0}字 ${versionCount ? '· 🗂 '+versionCount+'版本' : ''} ${derivedCount ? '· 🔗 '+derivedCount+'衍生' : ''}</div>
                    </div>
                </div>`;
            }
        }).join('');

        listEl.querySelectorAll('.prod-card').forEach(c => {
            c.addEventListener('click', () => openDetail(c.dataset.id));
            c.addEventListener('mouseenter', () => { c.style.transform = 'translateY(-2px)'; c.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; });
            c.addEventListener('mouseleave', () => { c.style.transform = ''; c.style.boxShadow = ''; });
        });
    }

    function renderAll() {
        renderStats();
        renderTagBar();
        renderList();
    }

    function setFilter(key, value) {
        state.filter[key] = value;
        if (key === 'type') {
            document.querySelectorAll('.prod-filter-btn').forEach(b => {
                const on = b.dataset.prodType === value;
                b.classList.toggle('active', on);
                if (on) {
                    b.style.background = '#10B981';
                    b.style.color = '#fff';
                    b.style.border = 'none';
                    b.style.fontWeight = '600';
                } else {
                    b.style.background = '#fff';
                    b.style.color = b.dataset.prodType === 'all' ? '#10B981' : ({article:'#3B82F6', card:'#8B5CF6', audio:'#F59E0B', trash:'#9CA3AF'}[b.dataset.prodType] || '#6B7280');
                    b.style.border = '1px solid ' + b.style.color;
                    b.style.fontWeight = '400';
                }
            });
        }
        renderList();
    }

    // ---------- 详情抽屉 ----------
    function openDetail(id) {
        const p = get(id);
        if (!p) return;
        const meta = TYPE_META[p.type] || TYPE_META.article;
        document.getElementById('prodDetailType').textContent = `${meta.icon} ${meta.label} · ${p.id}`;
        document.getElementById('prodDetailTitle').textContent = p.title || '未命名';
        document.getElementById('prodDetailHeader').style.background = `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`;

        const body = document.getElementById('prodDetailBody');
        const created = new Date(p.createdAt); const updated = new Date(p.updatedAt);
        const tagsHtml = (p.tags||[]).map(t => `
            <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:${meta.bg};color:${meta.color};border-radius:12px;font-size:11px;margin:0 4px 4px 0;">
                #${escapeHtml(t)}
                <button data-tag-del="${escapeHtml(t)}" style="background:none;border:none;color:${meta.color};cursor:pointer;padding:0;font-size:13px;line-height:1;">&times;</button>
            </span>`).join('');

        // 预览
        let previewHtml = '';
        if (p.type === 'card') {
            const thumbs = Array.isArray(p.meta?.thumbs) && p.meta.thumbs.length ? p.meta.thumbs : (p.meta?.thumb ? [p.meta.thumb] : []);
            if (thumbs.length) {
                previewHtml = `<div style="display:grid;grid-template-columns:repeat(${Math.min(thumbs.length,3)},1fr);gap:8px;margin-bottom:14px;">${thumbs.map(u => `<img src="${u}" style="width:100%;border-radius:6px;border:1px solid #E5E7EB;">`).join('')}</div>`;
            }
        } else if (p.content) {
            const text = p.text || p.content.replace(/<[^>]+>/g,'');
            previewHtml = `<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px;font-size:12px;color:#374151;max-height:200px;overflow-y:auto;line-height:1.6;margin-bottom:14px;white-space:pre-wrap;">${escapeHtml(text.slice(0, 600))}${text.length>600?'…':''}</div>`;
        }

        // 版本历史
        let versionsHtml = '';
        if (p.versions && p.versions.length) {
            versionsHtml = `
                <div style="margin-top:18px;">
                    <div style="font-size:12px;color:#374151;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">🗂 版本历史 <span style="font-size:10px;color:#9CA3AF;font-weight:400;">（共 ${p.versions.length} 个历史版本）</span></div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${p.versions.map(v => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#FAFAFA;border:1px solid #F3F4F6;border-radius:6px;">
                                <div>
                                    <div style="font-size:12px;color:#374151;font-weight:500;">v${v.v} · ${escapeHtml(v.note||'')}</div>
                                    <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">${fmtTime(v.savedAt)} · ${v.wordCount||0}字</div>
                                </div>
                                <button data-ver-restore="${v.v}" style="padding:4px 10px;background:#fff;color:#F59E0B;border:1px solid #F59E0B;border-radius:5px;font-size:11px;cursor:pointer;">⏮ 回滚</button>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        // 衍生关系
        let derivedHtml = '';
        const parent = p.parentId ? get(p.parentId) : null;
        const derived = (p.derivedIds||[]).map(d => get(d)).filter(Boolean);
        if (parent || derived.length) {
            const relItems = [];
            if (parent) relItems.push(`<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:#FAFAFA;border-radius:6px;font-size:11px;"><span style="color:#9CA3AF;">⬆ 源自</span><span style="color:${TYPE_META[parent.type]?.color};">${TYPE_META[parent.type]?.icon||''} ${escapeHtml(parent.title)}</span><button data-jump="${parent.id}" style="margin-left:auto;color:#3B82F6;background:none;border:none;cursor:pointer;font-size:11px;">跳转 →</button></div>`);
            for (const d of derived) relItems.push(`<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:#FAFAFA;border-radius:6px;font-size:11px;"><span style="color:#9CA3AF;">⬇ 衍生</span><span style="color:${TYPE_META[d.type]?.color};">${TYPE_META[d.type]?.icon||''} ${escapeHtml(d.title)}</span><button data-jump="${d.id}" style="margin-left:auto;color:#3B82F6;background:none;border:none;cursor:pointer;font-size:11px;">跳转 →</button></div>`);
            derivedHtml = `<div style="margin-top:18px;"><div style="font-size:12px;color:#374151;font-weight:700;margin-bottom:8px;">🔗 衍生关系</div><div style="display:flex;flex-direction:column;gap:6px;">${relItems.join('')}</div></div>`;
        }

        body.innerHTML = `
            <div style="font-size:11px;color:#9CA3AF;margin-bottom:14px;display:flex;gap:14px;flex-wrap:wrap;">
                <span>📅 创建 ${fmtTime(p.createdAt)} · ${created.toLocaleDateString('zh-CN')}</span>
                <span>✏ 更新 ${fmtTime(p.updatedAt)} · ${updated.toLocaleString('zh-CN')}</span>
                <span>📊 ${p.wordCount||0} 字</span>
            </div>

            ${previewHtml}

            <div style="margin-bottom:14px;">
                <div style="font-size:12px;color:#374151;font-weight:700;margin-bottom:6px;">🏷 标签</div>
                <div style="margin-bottom:6px;">${tagsHtml || '<span style="font-size:11px;color:#9CA3AF;">无标签</span>'}</div>
                <div style="display:flex;gap:6px;">
                    <input id="prodTagInput" type="text" placeholder="添加标签后回车" style="flex:1;padding:6px 10px;border:1px solid #D1D5DB;border-radius:6px;font-size:12px;outline:none;">
                    <button id="prodTagAddBtn" style="padding:6px 12px;background:${meta.color};color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer;">添加</button>
                </div>
            </div>

            ${derivedHtml}
            ${versionsHtml}
        `;

        // 标签操作
        const tagInput = document.getElementById('prodTagInput');
        const tagAddBtn = document.getElementById('prodTagAddBtn');
        if (tagAddBtn) {
            tagAddBtn.addEventListener('click', () => {
                const v = tagInput.value.trim();
                if (!v) return;
                addTag(id, v); tagInput.value = ''; openDetail(id); renderAll();
            });
        }
        if (tagInput) {
            tagInput.addEventListener('keydown', e => {
                if (e.key === 'Enter' && tagAddBtn) tagAddBtn.click();
            });
        }
        body.querySelectorAll('[data-tag-del]').forEach(b => {
            b.addEventListener('click', () => { removeTag(id, b.dataset.tagDel); openDetail(id); renderAll(); });
        });
        body.querySelectorAll('[data-ver-restore]').forEach(b => {
            b.addEventListener('click', () => {
                if (confirm('确认回滚到此版本？当前内容会先入版本快照。')) {
                    restoreVersion(id, parseInt(b.dataset.verRestore, 10));
                    openDetail(id); renderAll(); showToast('已回滚到 v'+b.dataset.verRestore);
                }
            });
        });
        body.querySelectorAll('[data-jump]').forEach(b => {
            b.addEventListener('click', () => openDetail(b.dataset.jump));
        });

        // 底部操作
        const actions = document.getElementById('prodDetailActions');
        const isTrashed = !!p.trashed;
        actions.innerHTML = '';
        const mkBtn = (txt, bg, onclick) => {
            const b = document.createElement('button');
            b.textContent = txt;
            b.style.cssText = `padding:8px 14px;background:${bg};color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600;`;
            b.addEventListener('click', onclick);
            actions.appendChild(b);
        };

        if (p.type === 'article' && !isTrashed) {
            mkBtn('✎ 载入编辑器', '#10B981', () => {
                const ed = document.getElementById('editor');
                if (ed) { ed.innerHTML = p.content || ''; if (typeof updatePreview === 'function') updatePreview(); }
                document.querySelector('.nav-item[data-tab="editor"]')?.click();
                showToast('已载入编辑器');
                closeDetail();
            });
            mkBtn('🎴 生成卡片', '#8B5CF6', () => {
                const ccBtn = document.querySelector('.mode-btn[data-mode="content-cards"]');
                document.querySelector('.nav-item[data-tab="editor"]')?.click();
                if (ccBtn) ccBtn.click();
                const ta = document.getElementById('ccInput');
                if (ta) {
                    ta.value = p.text || (p.content||'').replace(/<[^>]+>/g,'');
                    showToast('已带入贴图卡片，点击「生成卡片」');
                }
                // 生成后由生成流程自动入库
                window._ccDeriveFrom = p.id;
                closeDetail();
            });
            mkBtn('📥 下载 .md', '#3B82F6', () => {
                const md = (typeof htmlToMarkdown === 'function') ? htmlToMarkdown(p.content || '') : (p.text||'');
                const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = (p.title||'文章') + '.md';
                a.click();
                URL.revokeObjectURL(a.href);
            });
        }
        if (p.type === 'card' && !isTrashed) {
            mkBtn('📥 下载卡片', '#8B5CF6', () => {
                const thumbs = Array.isArray(p.meta?.thumbs) ? p.meta.thumbs : (p.meta?.thumb ? [p.meta.thumb] : []);
                thumbs.forEach((u, i) => {
                    const a = document.createElement('a');
                    a.href = u; a.download = `${p.title||'card'}-${i+1}.jpg`;
                    a.click();
                });
            });
            mkBtn('📝 转为文章', '#3B82F6', () => {
                const newP = upsert({
                    type: 'article',
                    title: (p.title||'卡片') + '（衍生文章）',
                    content: (p.meta?.text||p.text||''),
                    tags: p.tags ? p.tags.slice() : [],
                    parentId: p.id
                });
                linkDerivative(p.id, newP.id);
                showToast('已创建衍生文章');
                renderAll(); openDetail(newP.id);
            });
        }
        if (p.type === 'audio') {
            mkBtn('▶ 播放', '#F59E0B', () => {
                if (p.meta?.audioUrl) {
                    new Audio(p.meta.audioUrl).play().catch(()=>showToast('播放失败'));
                } else showToast('音频文件未上传（占位）');
            });
        }

        if (!isTrashed) {
            mkBtn('🗑 移入回收站', '#9CA3AF', () => {
                if (confirm('确认移入回收站？30 天内可恢复。')) {
                    remove(id, false); renderAll(); closeDetail(); showToast('已移入回收站');
                }
            });
        } else {
            mkBtn('♻ 恢复', '#10B981', () => { restore(id); renderAll(); closeDetail(); showToast('已恢复'); });
            mkBtn('❌ 永久删除', '#DC2626', () => {
                if (confirm('永久删除后无法恢复，确认？')) { remove(id, true); renderAll(); closeDetail(); showToast('已永久删除'); }
            });
        }

        document.getElementById('prodDetailDrawer').style.display = 'flex';
    }
    function closeDetail() {
        const d = document.getElementById('prodDetailDrawer');
        if (d) d.style.display = 'none';
    }

    // ---------- 对外暴露（保存钩子）----------
    window._productsApi = {
        list, get, upsert, remove, restore, emptyTrash,
        addTag, removeTag, linkDerivative, restoreVersion,
        renderAll, openDetail,
        // 文章保存钩子：编辑器内容入产物库
        saveArticle(opts) {
            const editor = document.getElementById('editor');
            const content = opts?.content || (editor ? editor.innerHTML : '');
            if (!content.trim()) return null;
            const text = content.replace(/<[^>]+>/g, '');
            // 取首行作为标题
            const firstLine = text.split('\n').map(s=>s.trim()).find(s=>s) || '未命名文章';
            return upsert({
                id: opts?.id,
                type: 'article',
                title: opts?.title || firstLine.substring(0, 30),
                content,
                text,
                tags: opts?.tags || [],
                versionNote: opts?.versionNote || '编辑器保存'
            });
        },
        // 卡片保存钩子
        saveCard(opts) {
            const id = opts.id;
            const existing = id ? get(id) : null;
            const p = upsert({
                id, type: 'card',
                title: opts.title || '贴图卡片',
                content: opts.text || '',
                text: opts.text || '',
                tags: opts.tags || [],
                parentId: opts.parentId || existing?.parentId || null,
                meta: { thumb: opts.thumb, thumbs: opts.thumbs, style: opts.style, accent: opts.accent },
                versionNote: opts.versionNote || '卡片生成'
            });
            // 衍生关系
            const deriveFrom = opts.parentId || window._ccDeriveFrom;
            if (deriveFrom) {
                linkDerivative(deriveFrom, p.id);
                window._ccDeriveFrom = null;
            }
            return p;
        }
    };

    // ---------- 事件绑定 ----------
    function bindEvents() {
        document.querySelectorAll('.prod-filter-btn').forEach(b => {
            b.addEventListener('click', () => setFilter('type', b.dataset.prodType));
        });
        const search = document.getElementById('prodSearchInput');
        if (search) {
            let t;
            search.addEventListener('input', () => {
                clearTimeout(t);
                t = setTimeout(() => { state.filter.keyword = search.value.trim(); renderList(); }, 200);
            });
        }
        const sortSel = document.getElementById('prodSortSelect');
        if (sortSel) sortSel.addEventListener('change', () => { state.filter.sort = sortSel.value; renderList(); });
        document.querySelectorAll('.prod-view-btn').forEach(b => {
            b.addEventListener('click', () => {
                state.filter.view = b.dataset.view;
                document.querySelectorAll('.prod-view-btn').forEach(x => {
                    const on = x.dataset.view === state.filter.view;
                    x.classList.toggle('active', on);
                    x.style.background = on ? '#fff' : 'transparent';
                });
                renderList();
            });
        });
        const closeBtn = document.getElementById('prodDetailClose');
        if (closeBtn) closeBtn.addEventListener('click', closeDetail);
        const drawer = document.getElementById('prodDetailDrawer');
        if (drawer) drawer.addEventListener('click', e => { if (e.target === drawer) closeDetail(); });

        const exportBtn = document.getElementById('prodExportBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => {
            const data = JSON.stringify(state.products, null, 2);
            // 双通道：尝试触发下载 + 弹出可复制文本框（沙箱环境下载会被拦截）
            try {
                const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `products-${new Date().toISOString().slice(0,10)}.json`;
                a.click(); URL.revokeObjectURL(a.href);
            } catch (e) { console.warn('download fail', e); }
            openTextModal('📤 导出全部产物', `共 ${state.products.length} 个产物，JSON 如下（可全选复制）：`, data);
            showToast(`已导出 ${state.products.length} 个产物`);
        });
        const importBtn = document.getElementById('prodImportBtn');
        if (importBtn) importBtn.addEventListener('click', () => {
            // 优先尝试文件选择器，失败/被拦截则弹粘贴框
            let triggered = false;
            try {
                const inp = document.createElement('input');
                inp.type = 'file'; inp.accept = '.json,.md,.txt';
                inp.onchange = e => {
                    const f = e.target.files[0]; if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => doImport(f.name, String(reader.result));
                    reader.readAsText(f);
                };
                inp.addEventListener('click', () => { triggered = true; }, { once: true });
                inp.click();
                // 500ms 内没触发 click（被拦截），则弹粘贴框
                setTimeout(() => { if (!triggered) openImportPasteModal(); }, 500);
            } catch (e) { openImportPasteModal(); }
        });
        const cleanupBtn = document.getElementById('prodCleanupBtn');
        if (cleanupBtn) cleanupBtn.addEventListener('click', () => {
            const s = stats();
            if (!s.trash) { showToast('回收站为空'); return; }
            // 自定义确认弹窗替代 confirm（沙箱拦截 confirm）
            openConfirmModal('🗑 清空回收站', `确认清空回收站？共 ${s.trash} 个产物将被永久删除，此操作不可撤销。`, () => {
                emptyTrash(); renderAll(); showToast('回收站已清空');
            });
        });
    }

    // ---------- 自定义 Modal 工具（替代被沙箱拦截的 confirm/alert/prompt）----------
    function ensureModalRoot() {
        let root = document.getElementById('prodModalRoot');
        if (!root) {
            root = document.createElement('div');
            root.id = 'prodModalRoot';
            root.innerHTML = `
                <div class="prod-modal-overlay" id="prodModalOverlay">
                    <div class="prod-modal-card">
                        <div class="prod-modal-head">
                            <h3 id="prodModalTitle"></h3>
                            <button class="prod-modal-close" id="prodModalClose" type="button">&times;</button>
                        </div>
                        <div class="prod-modal-body" id="prodModalBody"></div>
                        <div class="prod-modal-foot" id="prodModalFoot"></div>
                    </div>
                </div>`;
            document.body.appendChild(root);
            document.getElementById('prodModalClose').addEventListener('click', closeModal);
            document.getElementById('prodModalOverlay').addEventListener('click', e => { if (e.target.id === 'prodModalOverlay') closeModal(); });
        }
        return root;
    }
    function closeModal() {
        const ov = document.getElementById('prodModalOverlay');
        if (ov) ov.classList.remove('show');
    }
    function openModal(title, bodyHTML, footHTML) {
        ensureModalRoot();
        document.getElementById('prodModalTitle').textContent = title;
        document.getElementById('prodModalBody').innerHTML = bodyHTML;
        document.getElementById('prodModalFoot').innerHTML = footHTML || '<button class="prod-modal-btn-secondary" id="prodModalCancelBtn" type="button">关闭</button>';
        const cancel = document.getElementById('prodModalCancelBtn');
        if (cancel) cancel.addEventListener('click', closeModal);
        document.getElementById('prodModalOverlay').classList.add('show');
    }
    function openConfirmModal(title, msg, onConfirm) {
        openModal(title, `<p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">${msg}</p>`,
            `<button class="prod-modal-btn-secondary" id="prodConfirmCancel" type="button">取消</button>
             <button class="prod-modal-btn-danger" id="prodConfirmOk" type="button">确认清空</button>`);
        document.getElementById('prodConfirmCancel').addEventListener('click', closeModal);
        document.getElementById('prodConfirmOk').addEventListener('click', () => { closeModal(); onConfirm(); });
    }
    function openTextModal(title, desc, text) {
        openModal(title,
            `<p style="color:#6B7280;font-size:12px;margin:0 0 8px;">${desc}</p>
             <textarea id="prodModalTextarea" style="width:100%;height:240px;font-family:var(--font-mono);font-size:11px;padding:10px;border:1px solid #E5E7EB;border-radius:6px;resize:vertical;" readonly></textarea>`,
            `<button class="prod-modal-btn-secondary" id="prodTextCopy" type="button">📋 复制全文</button>
             <button class="prod-modal-btn-primary" id="prodTextClose" type="button">关闭</button>`);
        const ta = document.getElementById('prodModalTextarea');
        ta.value = text;
        document.getElementById('prodTextCopy').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(text); showToast('已复制到剪贴板'); }
            catch { ta.select(); document.execCommand('copy'); showToast('已复制'); }
        });
        document.getElementById('prodTextClose').addEventListener('click', closeModal);
    }
    function openImportPasteModal() {
        openModal('📥 导入产物',
            `<p style="color:#6B7280;font-size:12px;margin:0 0 8px;">粘贴 JSON 数组（产物导出格式）或纯文本（作为文章导入）：</p>
             <textarea id="prodImportTextarea" placeholder='[ { "type":"article", "title":"...", "content":"..." } ] 或纯文本内容' style="width:100%;height:200px;font-family:var(--font-mono);font-size:11px;padding:10px;border:1px solid #E5E7EB;border-radius:6px;resize:vertical;"></textarea>`,
            `<button class="prod-modal-btn-secondary" id="prodImportCancel" type="button">取消</button>
             <button class="prod-modal-btn-primary" id="prodImportOk" type="button">导入</button>`);
        document.getElementById('prodImportCancel').addEventListener('click', closeModal);
        document.getElementById('prodImportOk').addEventListener('click', () => {
            const text = document.getElementById('prodImportTextarea').value.trim();
            if (!text) { showToast('请粘贴内容'); return; }
            closeModal();
            doImport('pasted.json', text);
        });
    }
    function doImport(filename, content) {
        try {
            if (filename.endsWith('.json') || content.trim().startsWith('[') || content.trim().startsWith('{')) {
                const arr = JSON.parse(content);
                const list = Array.isArray(arr) ? arr : [arr];
                let n = 0;
                for (const it of list) {
                    if (!it || typeof it !== 'object') continue;
                    if (!it.id) it.id = 'imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
                    state.products.unshift(it);
                    n++;
                }
                persist(); renderAll(); showToast(`已导入 ${n} 个产物`);
            } else {
                const p = upsert({ type: 'article', title: filename.replace(/\.[^.]+$/,''), content, text: content });
                renderAll(); showToast('已导入：' + p.title);
            }
        } catch (err) { showToast('导入失败：' + err.message); }
    }

    function init() {
        load();
        migrateLegacyDrafts();
        bindEvents();
        renderAll();
    }
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();

// ===== V5 全局命令面板（Ctrl+K） + 新手引导 + 通知条 =====
(function v5ShellModule() {
    'use strict';
    const ONBOARD_SEEN_KEY = 'wx_onboard_seen_v5';

    // ---------- 通知条 ----------
    let bannerTimer = null;
    function showBanner(msg, ms = 4000) {
        const el = document.getElementById('globalBanner');
        if (!el) return;
        el.innerHTML = msg + '<span class="banner-close" onclick="this.parentElement.classList.remove(\'show\')">&times;</span>';
        el.classList.add('show');
        clearTimeout(bannerTimer);
        bannerTimer = setTimeout(() => el.classList.remove('show'), ms);
    }
    window._showBanner = showBanner;

    // ---------- 新手引导 ----------
    function showOnboard() {
        const el = document.getElementById('onboardOverlay');
        if (el) el.classList.add('show');
    }
    function hideOnboard() {
        const el = document.getElementById('onboardOverlay');
        if (el) el.classList.remove('show');
        try { localStorage.setItem(ONBOARD_SEEN_KEY, '1'); } catch {}
    }
    function shouldShowOnboard() {
        try { return !localStorage.getItem(ONBOARD_SEEN_KEY); } catch { return false; }
    }

    // ---------- 命令面板 ----------
    const cmdkState = { items: [], selected: 0 };

    function buildCmdkItems(query) {
        const q = (query || '').trim().toLowerCase();
        const items = [];

        // 1. 导航
        const navItems = [
            { key: 'editor', icon: '✎', title: '排版', sub: '编辑文章并应用主题', tag: '导航' },
            { key: 'inbox', icon: '📥', title: '信息中枢', sub: '聚合所有信源', tag: '导航' },
            { key: 'create', icon: '✍', title: '创作', sub: 'AI 一键 / 自定义创作', tag: '导航' },
            { key: 'subscribe', icon: '📰', title: '订阅', sub: '管理公众号订阅', tag: '导航' },
            { key: 'image', icon: '🖼', title: '图片', sub: 'AI 图片生成', tag: '导航' },
            { key: 'products', icon: '📦', title: '产物中心', sub: '统一管理所有产物', tag: '导航' },
            { key: 'settings', icon: '⚙️', title: '设置', sub: 'AI 模型 / 主题色', tag: '导航' }
        ];
        for (const n of navItems) {
            if (!q || n.title.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q)) {
                items.push({ type: 'nav', ...n, action: () => switchTab(n.key) });
            }
        }

        // 2. 动作
        const actions = [
            { icon: '💾', title: '保存当前为草稿', sub: '编辑器内容 → 草稿 + 产物库', tag: '动作', action: () => { switchTab('editor'); setTimeout(() => saveCurrentDraft(), 100); } },
            { icon: '📥', title: '下载为 Markdown', sub: '当前编辑器内容导出 .md', tag: '动作', action: () => { switchTab('editor'); setTimeout(() => downloadAsMarkdown(), 100); } },
            { icon: '⎘', title: '复制全文', sub: '复制到剪贴板', tag: '动作', action: () => { const b = document.getElementById('copyBtn'); if (b) b.click(); } },
            { icon: '🚀', title: 'AI 一键创作', sub: '基于当前选题或编辑器内容', tag: '动作', action: () => { const b = document.getElementById('aiWorkflowBtn'); if (b) b.click(); } },
            { icon: '🎴', title: '生成贴图卡片', sub: '基于当前编辑器内容', tag: '动作', action: () => { switchTab('editor'); setTimeout(() => { const b = document.querySelector('.mode-btn[data-mode="content-cards"]'); if (b) b.click(); }, 100); } },
            { icon: '📤', title: '导出全部产物', sub: '下载 JSON 备份', tag: '动作', action: () => { const b = document.getElementById('prodExportBtn'); if (b) b.click(); } },
            { icon: '📥', title: '导入文件', sub: '从 .json / .md 导入', tag: '动作', action: () => { const b = document.getElementById('prodImportBtn'); if (b) b.click(); } },
            { icon: '⚙️', title: 'AI 设置', sub: '配置模型 API Key', tag: '动作', action: () => { const b = document.getElementById('aiSettingsBtn'); if (b) b.click(); } },
            { icon: '🎨', title: '主题色切换', sub: '在 emerald/blue/orange/purple 间循环', tag: '动作', action: () => cycleTheme() }
        ];
        for (const a of actions) {
            if (!q || a.title.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)) {
                items.push({ type: 'action', ...a });
            }
        }

        // 3. 产物（如果有产物库 API）
        if (window._productsApi) {
            const prods = window._productsApi.list().filter(p => !p.trashed);
            for (const p of prods.slice(0, 30)) {
                const typeIcon = p.type === 'article' ? '📝' : p.type === 'card' ? '🎴' : '🎙';
                const title = p.title || '未命名';
                if (!q || title.toLowerCase().includes(q) || (p.text||'').toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q))) {
                    items.push({
                        type: 'product', icon: typeIcon, title,
                        sub: `${p.type === 'article' ? '文章' : p.type === 'card' ? '卡片' : '音频'} · ${p.wordCount||0}字 · ${(p.tags||[]).join(' / ') || '无标签'}`,
                        tag: '产物',
                        action: () => { switchTab('products'); setTimeout(() => window._productsApi.openDetail(p.id), 200); }
                    });
                }
            }
        }

        // 4. 信源（如果有信息中枢 API）
        if (window._inboxApi && window._inboxApi.getAllItems) {
            try {
                const items2 = window._inboxApi.getAllItems();
                for (const it of items2.slice(0, 20)) {
                    const title = it.title || '';
                    if (!q || title.toLowerCase().includes(q) || (it.desc||'').toLowerCase().includes(q)) {
                        items.push({
                            type: 'inbox', icon: '📰', title,
                            sub: `信源：${it._source || it.source || ''} · ${it.time || ''}`,
                            tag: '信源',
                            action: () => { switchTab('inbox'); }
                        });
                    }
                }
            } catch {}
        }

        return items.slice(0, 50);
    }

    function renderCmdk() {
        const resultsEl = document.getElementById('cmdkResults');
        if (!resultsEl) return;
        if (!cmdkState.items.length) {
            resultsEl.innerHTML = '<div class="cmdk-empty">无匹配结果</div>';
            return;
        }
        // 分组
        const groups = {};
        for (const it of cmdkState.items) {
            (groups[it.tag] = groups[it.tag] || []).push(it);
        }
        let html = '';
        let idx = 0;
        for (const [groupName, groupItems] of Object.entries(groups)) {
            html += `<div class="cmdk-group-label">${groupName}</div>`;
            for (const it of groupItems) {
                const active = idx === cmdkState.selected ? 'active' : '';
                html += `<div class="cmdk-item ${active}" data-idx="${idx}">
                    <span class="cmdk-item-icon">${it.icon}</span>
                    <div class="cmdk-item-body">
                        <div class="cmdk-item-title">${escapeCmdk(it.title)}</div>
                        <div class="cmdk-item-sub">${escapeCmdk(it.sub || '')}</div>
                    </div>
                    <span class="cmdk-item-tag">${it.type}</span>
                </div>`;
                idx++;
            }
        }
        resultsEl.innerHTML = html;
        resultsEl.querySelectorAll('.cmdk-item').forEach((el, i) => {
            el.addEventListener('click', () => executeCmdk(parseInt(el.dataset.idx, 10)));
            el.addEventListener('mouseenter', () => { cmdkState.selected = parseInt(el.dataset.idx, 10); updateActive(); });
        });
    }
    function escapeCmdk(s) {
        return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
    function updateActive() {
        document.querySelectorAll('.cmdk-item').forEach((el, i) => {
            el.classList.toggle('active', i === cmdkState.selected);
        });
        // 滚动到可见
        const active = document.querySelector('.cmdk-item.active');
        if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }
    function executeCmdk(idx) {
        const it = cmdkState.items[idx];
        if (!it) return;
        closeCmdk();
        if (typeof it.action === 'function') {
            try { it.action(); } catch (e) { console.warn('cmdk action', e); }
        }
    }
    function openCmdk() {
        const overlay = document.getElementById('cmdkOverlay');
        if (!overlay) return;
        overlay.classList.add('show');
        const input = document.getElementById('cmdkInput');
        if (input) { input.value = ''; setTimeout(() => input.focus(), 50); }
        cmdkState.items = buildCmdkItems('');
        cmdkState.selected = 0;
        renderCmdk();
    }
    function closeCmdk() {
        const overlay = document.getElementById('cmdkOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ---------- 主题循环切换 ----------
    const THEMES = ['theme-emerald', 'theme-blue', 'theme-orange', 'theme-purple'];
    function cycleTheme() {
        const body = document.body;
        const current = THEMES.find(t => body.classList.contains(t)) || 'theme-emerald';
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx + 1) % THEMES.length];
        // 清除所有 theme-* class（含排版 tab 的 brown/black/beige），避免叠加
        body.className = body.className.replace(/\btheme-\S+/g, '').trim();
        body.classList.add(next);
        try { localStorage.setItem('wx_theme_v5', next); } catch {}
        showBanner(`🎨 主题已切换为 ${next.replace('theme-','')}`);
    }

    // ---------- 事件 ----------
    function bindEvents() {
        // 触发按钮
        const btn = document.getElementById('globalSearchBtn');
        if (btn) btn.addEventListener('click', openCmdk);

        // 全局快捷键 Ctrl+K / Cmd+K（部分浏览器会拦截，加 / 键备选）
        document.addEventListener('keydown', (e) => {
            // Ctrl+K / Cmd+K
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                const overlay = document.getElementById('cmdkOverlay');
                if (overlay && overlay.classList.contains('show')) closeCmdk();
                else openCmdk();
                return;
            }
            // 单独 / 键触发（输入框内不触发）
            if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') && !document.activeElement?.isContentEditable) {
                e.preventDefault();
                openCmdk();
                return;
            }
            if (e.key === 'Escape') {
                closeCmdk();
                const onboard = document.getElementById('onboardOverlay');
                if (onboard && onboard.classList.contains('show')) onboard.classList.remove('show');
            }
            // 命令面板内导航
            const overlay = document.getElementById('cmdkOverlay');
            if (overlay && overlay.classList.contains('show')) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    cmdkState.selected = Math.min(cmdkState.selected + 1, cmdkState.items.length - 1);
                    updateActive();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    cmdkState.selected = Math.max(cmdkState.selected - 1, 0);
                    updateActive();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    executeCmdk(cmdkState.selected);
                }
            }
        });

        // 命令面板输入
        const input = document.getElementById('cmdkInput');
        if (input) {
            input.addEventListener('input', () => {
                cmdkState.items = buildCmdkItems(input.value);
                cmdkState.selected = 0;
                renderCmdk();
            });
        }
        // 点遮罩关闭
        const overlay = document.getElementById('cmdkOverlay');
        if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeCmdk(); });

        // 新手引导按钮
        const startBtn = document.getElementById('onboardStart');
        if (startBtn) startBtn.addEventListener('click', () => {
            hideOnboard();
            setTimeout(() => {
                showBanner('💡 提示：按 Ctrl+K（Mac 为 ⌘K）随时唤起全局命令面板');
                openCmdk();
            }, 300);
        });
        const skipBtn = document.getElementById('onboardSkip');
        if (skipBtn) skipBtn.addEventListener('click', hideOnboard);
    }

    // 暴露
    window._v5Shell = { showOnboard, hideOnboard, openCmdk, closeCmdk, showBanner, cycleTheme };

    // 初始化
    function init() {
        bindEvents();
        // 恢复主题
        try {
            const saved = localStorage.getItem('wx_theme_v5');
            // 清除所有 theme-* class，避免与排版 tab 主题色选择器叠加
            document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
            document.body.classList.add(saved || 'theme-emerald');
        } catch { document.body.classList.add('theme-emerald'); }
        // 首次访问显示新手引导
        if (shouldShowOnboard()) {
            setTimeout(() => showOnboard(), 600);
        } else {
            // 已访问过的用户：显示更新提示
            const lastSeen = localStorage.getItem('wx_v5_last_seen');
            const today = new Date().toISOString().slice(0,10);
            if (lastSeen !== today) {
                setTimeout(() => showBanner('✨ 已升级至 v5：新增全局命令面板（Ctrl+K）、统一产物中心、贴图卡片重构'), 800);
                try { localStorage.setItem('wx_v5_last_seen', today); } catch {}
            }
        }
    }
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
