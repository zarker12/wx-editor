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
let currentSpacing = 'compact';
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
            return html;
        } catch (e) {
            console.warn('marked 解析失败，降级到正则方案:', e);
        }
    }
    return _markdownToHTMLLegacy(text);
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
                style = addBaseTextStyles(style);
                return `<h1 style="${style}">${children}</h1>`;
            }
            case 'h2': {
                let style = theme.h2Style(c, s, sp, t);
                style = addBaseTextStyles(style);
                const h2Decor = theme.h2Decor ? theme.h2Decor(c) : '';

                // 大数字居中样式：检测 h2 内容是否以数字开头（如 "01 章节标题"）
                // 若匹配，将开头的数字提取为大号居中粗体显示，下方显示章节标题
                // 仅对以数字开头且紧跟分隔符的 h2 生效，避免误伤普通标题
                const h2Text = node.textContent.trim();
                const numMatch = h2Text.match(/^(\d+)[\s、.）)]+(.+)$/);
                if (numMatch) {
                    const num = numMatch[1];        // 开头数字，如 "01"
                    const title = numMatch[2].trim(); // 章节标题文字
                    // 数字大号居中粗体，使用主题色 accent
                    // 主题可通过 h2NumberStyle 自定义数字样式，未定义则使用内置默认样式
                    const numStyle = theme.h2NumberStyle
                        ? theme.h2NumberStyle(c, s, sp, t)
                        : `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 8px 0;`;
                    // 标题用正常 h2 字号，居中显示（沿用主题 h2Style，仅覆盖对齐方式）
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
                style = addBaseTextStyles(style);
                const href = node.getAttribute('href') || '#';
                return `<a href="${href}" style="${style}">${children}</a>`;
            }
            case 'strong':
            case 'b': {
                let style = theme.strongStyle(c);
                style = addBaseTextStyles(style);
                return `<strong style="${style}">${children}</strong>`;
            }
            case 'em':
            case 'i': {
                let style = theme.emStyle(c);
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
                const imgStyle = 'max-width:100%;height:auto;border-radius:8px;margin:16px 0;display:block;';
                return `<img src="${src}" alt="${alt}" style="${imgStyle}">`;
            }
            case 'br':
                return '<br>';
            case 'div': {
                // END 结束标识：居中 + 主题色 + 主题字体，匹配文章整体风格
                if (node.getAttribute('data-end-marker') === 'true') {
                    const endStyle = `text-align:center;letter-spacing:10px;color:${c.accentDark};font-size:14px;padding:32px 0 16px 0;font-family:${font};font-weight:500;margin-top:16px;`;
                    // 装饰线（使用主题色，与 hrDecor 风格呼应）
                    const decorLine = theme.hrDecor
                        ? `<div style="text-align:center;color:${c.accent}60;font-size:18px;letter-spacing:8px;margin-bottom:8px;font-family:${font};">${theme.hrDecor(c)}</div>`
                        : '';
                    return `${decorLine}<div style="${endStyle}">- E N D -</div>`;
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
        ? `<div style="text-align:center;color:${c.accent}80;font-size:18px;letter-spacing:12px;margin:40px 0 8px 0;font-family:${font};">${theme.hrDecor(c)}</div>`
        : `<div style="text-align:center;color:${c.accent}40;font-size:20px;letter-spacing:8px;margin:40px 0 8px 0;">· · ·</div>`;
    const endStyle = `text-align:center;letter-spacing:10px;color:${c.accentDark};font-size:14px;padding:0 0 24px 0;font-family:${font};font-weight:500;`;
    result += endDecorLine + `<div style="${endStyle}">- E N D -</div>`;

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

// ===== 底部名片渲染 =====
function getIntroCardHTML() {
    const enabledEl = document.getElementById('introEnabled');
    if (enabledEl && !enabledEl.checked) return '';

    const name = document.getElementById('introName')?.value || '';
    const title = document.getElementById('introTitle')?.value || '';
    const focus = document.getElementById('introFocus')?.value || '';
    const output = document.getElementById('introOutput')?.value || '';
    const slogan = document.getElementById('introSlogan')?.value || '';
    const disclaimer1 = document.getElementById('introDisclaimer1')?.value || '';
    const disclaimer2 = document.getElementById('introDisclaimer2')?.value || '';

    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const font = getFontFamily();

    const cardStyle = `
        margin-top: ${sp.pMargin};
        padding: 20px 18px;
        background: ${c.accentSoft};
        border-radius: 12px;
        border: 1px solid ${c.accentSoft};
        font-family: ${font};
        font-size: ${s.fontSize};
        line-height: ${sp.lineHeight};
        color: var(--text-article);
    `;

    const rowStyle = `
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        font-size: ${s.fontSize};
    `;

    const iconStyle = `
        flex-shrink: 0;
        width: 20px;
        text-align: center;
        font-size: 15px;
    `;

    const textStyle = `
        flex: 1;
        color: var(--text-article);
    `;

    const sepStyle = `
        color: ${c.accent};
        flex-shrink: 0;
    `;

    const labelStyle = `
        color: var(--text-tertiary);
        flex-shrink: 0;
        font-size: 13px;
    `;

    const sloganStyle = `
        margin: 10px 0 10px 26px;
        font-weight: 500;
        color: var(--text-secondary);
        font-size: ${s.fontSize};
    `;

    const dividerStyle = `
        height: 1px;
        background: var(--border-light);
        margin: 10px 0;
    `;

    const disclaimerStyle = `
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--text-tertiary);
        line-height: 1.6;
    `;

    let html = `<div style="${cardStyle}">`;

    if (name || title) {
        html += `<div style="${rowStyle}">
            <span style="${iconStyle}">🧔</span>
            <span style="${textStyle}"><strong>${name}</strong> <span style="${sepStyle}">｜</span> ${title}</span>
        </div>`;
    }

    if (focus) {
        html += `<div style="${rowStyle}">
            <span style="${iconStyle}">🔭</span>
            <span style="${labelStyle}">关注：</span>
            <span style="${textStyle}">${focus}</span>
        </div>`;
    }

    if (output) {
        html += `<div style="${rowStyle}">
            <span style="${iconStyle}">📦</span>
            <span style="${labelStyle}">产出：</span>
            <span style="${textStyle}">${output}</span>
        </div>`;
    }

    if (slogan) {
        html += `<div style="${sloganStyle}">${slogan}</div>`;
    }

    html += `<div style="${dividerStyle}"></div>`;

    if (disclaimer1) {
        html += `<div style="${disclaimerStyle}">
            <span style="${iconStyle};font-size:13px;">⚠️</span>
            <span>${disclaimer1}</span>
        </div>`;
    }

    if (disclaimer2) {
        html += `<div style="${disclaimerStyle}">
            <span style="${iconStyle};font-size:13px;">📋</span>
            <span>${disclaimer2}</span>
        </div>`;
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

    const fullHTML = `<section id="articleContent" style="max-width:677px;margin:0 auto;background:${theme.canvasBg};word-break:break-word;">
        <section style="${bodyStyle}">
            ${styledContent}
            ${introHTML}
        </section>
    </section>`;

    return fullHTML;
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

function setStyle(style) {
    currentStyle = style;
    styleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.style === style));
    syncEditorToTheme();
    updatePreview();
}

function setColor(color) {
    document.body.classList.remove(`theme-${currentColor}`);
    currentColor = color;
    document.body.classList.add(`theme-${color}`);
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
                    insertHTMLAtCursor(html);
                    showToast(`已导入：${file.name}`);
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
    // ⚠ 不能用 editor.innerText —— 它会丢弃 <img> 的 src（data URI）
    // 改为从 innerHTML 提取：保留图片语法 ![alt](src) 和文本
    const html = editor.innerHTML;
    if (!html.trim()) { showToast('请先输入内容'); return; }

    // 将 <img alt="x" src="y"> 转为 Markdown 图片语法，保留 data URI
    let text = html
        .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![[$1]]($2)')
        .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![[$2]]($1)')
        .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');
    // 移除其他 HTML 标签，只留文本
    text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    // 解码 HTML 实体
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    // 还原我们用的特殊图片占位符
    text = text.replace(/!\[\[([^\]]*)\]\]/g, '![$1]');

    if (!text.trim()) { showToast('请先输入内容'); return; }
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
            case 'list-ol':
                flushAll();
                result.push(`- ${cleanListItemText(trimmed)}`);
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
        result.push(paraBuffer.join(''));
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
    ];
    for (const p of h2Patterns) {
        if (p.test(t) && t.length < 70) return 'h2';
    }

    const h3Patterns = [
        /^[0-9]+[、.．]\s+\S/,
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
    ];
    for (const p of h2Keywords) {
        if (p.test(t) && t.length < 25) {
            if (!/[。！？]$/.test(t)) return 'h2';
        }
    }

    if (t.length >= 4 && t.length <= 32 && /[\u4e00-\u9fa5]/.test(t)) {
        const hasEndPunct = /[。！？，；：、]$/.test(t);
        const startsWithListMark = /^[-•·■▪▸▹►▻◆◇★☆✓✔✅☑️]/.test(t);
        if (!hasEndPunct && !startsWithListMark) {
            if (prevLine && prevLine.length > 10 && nextLine && nextLine.length > 10) {
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

copyBtn.addEventListener('click', copyToClipboard);
copyHtmlBtn.addEventListener('click', copyRawHTML);
clearBtn.addEventListener('click', clearContent);
fileInput.addEventListener('change', handleFileUpload);
parseUrlBtn.addEventListener('click', parseUrl);
smartFormatBtn.addEventListener('click', smartFormat);
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

// Tab切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
    });
});

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
        } else {
            document.getElementById('inputTitle').textContent = '输入文章内容';
            document.getElementById('inputHint').textContent = '支持Markdown，自动分页';
            document.getElementById('imageInput').placeholder = '在这里输入文章内容...\n\n可以用Markdown语法：\n# 大标题\n## 小标题\n- 列表项\n> 引用内容\n**加粗文字**';
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
        // 旧版明文兼容（一次性迁移）
        if (!apiKey) {
            const legacy = localStorage.getItem('llm_api_key');
            if (legacy) {
                apiKey = legacy;
                // 迁移到 v2 后删除旧版明文
                try { localStorage.removeItem('llm_api_key'); } catch {}
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

    // ===== 4. 抓热点（微博热搜聚合，失败兜底）=====
    async function fetchHotTopics() {
        const fallback = [
            'AI 最新进展',
            '科技行业动态',
            '生活感悟',
            '职场成长',
            '情感故事'
        ];
        const resp = await fetch('https://api.vvhan.com/api/hotlist/wbHot');
        if (!resp.ok) throw new Error('热搜 API 返回异常');
        const data = await resp.json();
        if (!data || !Array.isArray(data.data) || data.data.length === 0) {
            return fallback;
        }
        return data.data.slice(0, 10)
            .map(item => item.name || item.title)
            .filter(Boolean);
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
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 4000
            })
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error(`LLM 调用失败 (${resp.status}): ${errText.substring(0, 200)}`);
        }
        const data = await resp.json();
        return data.choices[0].message.content;
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
   - 用 ## 划分 4-5 个章节，每个章节标题要有信息量（不要用"第一章"这种，要用观点式标题）
   - 结尾有一个简短的总结段落
   - 不要在文章末尾写自我介绍、签名、引导关注等内容，排版模板已有

2. 内容与段落（重要·阅读体验）：
   - 总字数 1500-2000 字
   - 段落必须松散短小：每段不超过 3-4 句话，理想 2-3 句
   - 一个观点讲完就换段，不要把多个观点挤在一段里
   - 每个章节 300-450 字，分 3-5 个自然段
   - 要有具体数据、真实案例或生动细节
   - 不要空话套话，不要"众所周知""不可否认""不言而喻"等万能句式
   - 观点要鲜明，有自己的角度，不是复述新闻
   - 适当使用**加粗**标注关键数据和观点
   - 可以用 > 引用块标注金句

3. 不要输出任何解释说明，直接输出 Markdown 正文。

现在请开始写：`;
        return await callLLM(prompt, settings);
    }

    // humanizeArticle 已删除——去 AI 化规则已合并进 generateArticle，避免二次 LLM 调用

    // ===== 8. 规划配图（让 LLM 生成英文图片 prompt）=====
    async function planImages(article, imageCount, settings) {
        const prompt = `你是一位图片编辑。请阅读以下文章，为文章规划 ${imageCount} 张配图。

文章内容：
${article.substring(0, 3000)}

请为每张配图生成一个英文的图片生成 prompt。要求：
1. 共 ${imageCount} 行，每行一个 prompt
2. prompt 格式：[摄影/插画风格] + [主体内容] + [场景环境] + [色调氛围] + ultra detailed, professional photography, 8k quality, no text, no watermark
3. 所有图片风格统一（都用 editorial photography 或都用 editorial illustration）
4. 每张图对应文章中不同的章节/主题，不要重复
5. 只输出英文 prompt，每行一个，不要编号、不要中文、不要其他内容

示例：
editorial photography, modern city skyline at sunset, warm golden light, aerial view, ultra detailed, 8k quality, no text, no watermark
editorial photography, person working on laptop in cafe, warm ambient lighting, shallow depth of field, ultra detailed, 8k quality, no text, no watermark`;
        const result = await callLLM(prompt, settings);
        const prompts = result.split('\n')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('prompt') && !s.startsWith('示例') && s.length > 30);
        // 如果 LLM 输出不够，补充默认 prompt
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

    // ===== 8.6 生成封面图（Pollinations 背景图 + Canvas 合成文字）=====
    // 方案：Pollinations 生成纯背景图（无文字，左侧留白）→ Canvas 叠加渐变蒙版+标题+金句+品牌
    // 这样文字一定清晰美观，不受 AI 生图文字能力限制
    async function generateArticleCover(plan, seed) {
        const isTech = plan.articleType === 'tech';
        const stylePrompt = isTech
            ? 'minimalist tech style, clean modern composition, blue and grey tones, abstract technology concept, large empty negative space on left side, geometric, futuristic, ultra detailed, 8k quality, no text, no watermark, no people'
            : 'documentary photography, humanistic photography, golden hour warm light, candid moment, story telling atmosphere, person from behind or side profile not looking at camera, composition biased to the right side, large empty negative space on the left for text overlay, National Geographic style, natural realistic not posed, film grain, ultra detailed, 8k quality, no text, no watermark';

        const bgPrompt = `${stylePrompt}, ${plan.scene}, no text, no watermark, no logo`;
        const encoded = encodeURIComponent(bgPrompt);
        const bgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}&model=flux-realism`;

        // 预加载背景图
        const bgDataUri = await preloadImageToDataUri(bgUrl, 90000);

        // Canvas 合成文字
        return await compositeCoverImage(bgDataUri, plan.title, plan.quote);
    }

    // Canvas 合成：背景图 + 渐变蒙版 + 标题 + 金句 + 品牌信息
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

                    // 2. 左侧渐变蒙版（黑色→透明，占约40%宽度）
                    const gradient = ctx.createLinearGradient(0, 0, 560, 0);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
                    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 560, 720);

                    const drawText = () => {
                        const padding = 64;

                        // 3. 标题（米白色 #F4F0E8，大字号，左对齐，行距舒适）
                        ctx.fillStyle = '#F4F0E8';
                        ctx.font = '600 40px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';
                        const titleLines = (title || '').split('\n').filter(l => l.trim());
                        const titleStartY = 200;
                        titleLines.forEach((line, i) => {
                            ctx.fillText(line, padding, titleStartY + i * 54);
                        });

                        // 4. 金句（浅灰色，约为标题字号30%→约14px，高留白）
                        const quoteY = titleStartY + titleLines.length * 54 + 32;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                        ctx.font = '300 15px "Noto Sans SC", "PingFang SC", sans-serif';
                        const quoteLines = (quote || '').split('\n').filter(l => l.trim());
                        quoteLines.forEach((line, i) => {
                            ctx.fillText(line, padding, quoteY + i * 24);
                        });

                        // 5. 左下角品牌信息（非常小字号，半透明）
                        const brandY = 636;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
                        ctx.font = '400 13px "Noto Sans SC", sans-serif';
                        ctx.fillText('@北苠', padding, brandY);
                        ctx.fillText('查看精彩内容 →', padding, brandY + 20);

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
        });
    }

    // ===== 12. 独立配图功能（不依赖 AI 工作流，编辑器直接触发）=====
    // 逻辑：从编辑器读文章 → LLM 理解文章生成图片 prompt → 生成图片 → 插入编辑器
    async function autoIllustrate() {
        const settings = getAISettings();
        if (!settings.apiKey) {
            showToast('请先在 AI 设置中配置 API Key');
            if (aiSettingsModal) aiSettingsModal.style.display = 'flex';
            return;
        }

        // 从编辑器提取文章文本（保留图片占位，但配图基于文本理解）
        const editorHtml = editor.innerHTML;
        if (!editorHtml.trim()) {
            showToast('编辑器为空，请先输入文章内容');
            return;
        }
        // 提取纯文本用于 LLM 理解
        let articleText = editorHtml.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
        if (articleText.length < 100) {
            showToast('文章内容太少（少于100字），无法规划配图');
            return;
        }

        const imageCount = settings.imageCount || 4;
        showAISpinner(true);
        updateAIStatus('正在理解文章内容并规划配图...', `目标 ${imageCount} 张配图`);

        try {
            // 0. 生成封面图（Pollinations 背景 + Canvas 合成文字）
            let coverImage = null;
            try {
                updateAIStatus('正在规划封面图...', '');
                const coverPlan = await planCoverImage(articleText, settings);
                updateAIStatus('正在生成封面图...', `场景：${coverPlan.scene.substring(0, 20)}...`);
                coverImage = await generateArticleCover(coverPlan, 88888);
                updateAIStatus('封面图生成完成', '');
            } catch (e) {
                console.error('封面图生成失败:', e.message);
                updateAIStatus('封面图生成失败，跳过封面', '');
            }

            // 1. LLM 理解文章，生成图片 prompt
            const imagePrompts = await planImages(articleText, imageCount, settings);
            if (!imagePrompts || imagePrompts.length === 0) {
                throw new Error('LLM 未返回有效的图片 prompt');
            }
            updateAIStatus('正在生成配图...', `共 ${imagePrompts.length} 张（并行生成中）`);

            // 2. 生成图片（data URI）— 并行生成，速度提升 3-4 倍
            // 用 Promise.allSettled 保证单张失败不影响其他
            const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">` +
                `<rect width="1280" height="720" fill="#F3F4F6"/>` +
                `<text x="640" y="340" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#9CA3AF">📷 图片加载失败</text>` +
                `<text x="640" y="400" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#9CA3AF">请手动上传替换</text>` +
                `</svg>`
            );

            const imageTasks = imagePrompts.map((prompt, i) =>
                generateImage(prompt, 1000 + i * 111, 90000)
                    .then(dataUri => ({ ok: true, dataUri, caption: `配图${i + 1}`, index: i }))
                    .catch(e => {
                        console.error(`图片 ${i + 1} 失败:`, e.message);
                        return { ok: false, dataUri: PLACEHOLDER_IMG, caption: `配图${i + 1}（加载失败）`, index: i };
                    })
            );

            // 进度更新（基于已完成数量）
            let completed = 0;
            imageTasks.forEach(t => t.finally(() => {
                completed++;
                updateAIStatus('正在生成配图...', `已完成 ${completed}/${imagePrompts.length} 张（并行生成）`);
            }));

            const results = await Promise.all(imageTasks);
            // 按原始顺序排列（imageTasks 按 index 顺序 map 创建，结果本来就是有序的；
            // 这里再排一次作为防御性代码，确保顺序正确）
            results.sort((a, b) => a.index - b.index);
            const imageUrls = results.map(r => r.dataUri);
            const imageCaptions = results.map(r => r.caption);
            const successCount = results.filter(r => r.ok).length;

            // 3. 把图片插入编辑器现有内容
            updateAIStatus('正在插入配图...', `插入 ${successCount} 张`);
            // 将编辑器 HTML 转为带图片语法的文本
            let currentText = editorHtml
                .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
                .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
                .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            // 插入新图片
            let finalArticle = insertImagesIntoArticle(currentText, imageUrls, imageCaptions);
            // 封面图插入文章最开头
            if (coverImage) {
                finalArticle = `![封面](${coverImage})\n\n` + finalArticle;
            }
            // 重新渲染编辑器
            const formatted = smartFormatText(finalArticle);
            const newHtml = markdownToHTML(formatted);
            editor.innerHTML = newHtml;
            updatePreview();

            const imgInfo = successCount > 0
                ? `配图 ${successCount}/${imageUrls.length} 张成功`
                : `配图全部使用占位图`;
            updateAIStatus('配图完成！', imgInfo);
            showAISpinner(false);
            showToast(`配图完成！${successCount} 张图片已插入`);
        } catch (e) {
            showAISpinner(false);
            updateAIStatus('配图失败', e.message);
            showToast('配图失败：' + e.message);
        }
    }

    // 暴露到全局，供工具栏按钮调用
    window.autoIllustrate = autoIllustrate;
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
