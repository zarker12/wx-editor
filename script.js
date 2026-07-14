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
        if (!editor || !editor.innerText.trim()) {
            showToast('编辑框为空，请先输入文章');
            return;
        }
        // 获取 markdown 源文本（优先 workflowState，其次从 innerHTML 提取）
        let articleText = '';
        if (window.workflowState && window.workflowState.article) {
            articleText = window.workflowState.article;
        } else {
            // 从 innerHTML 提取 markdown 文本（保留图片语法）
            const html = editor.innerHTML;
            articleText = html
                .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
                .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
                .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        }
        if (!articleText || articleText.length < 100) {
            showToast('文章内容过短，无需排版');
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
        } else if (currentImgMode === 'article') {
            document.getElementById('inputTitle').textContent = '输入文章内容';
            document.getElementById('inputHint').textContent = '支持Markdown，自动分页';
            document.getElementById('imageInput').placeholder = '在这里输入文章内容...\n\n可以用Markdown语法：\n# 大标题\n## 小标题\n- 列表项\n> 引用内容\n**加粗文字**';
        }
        // 显示/隐藏文章配图工作区
        const aiPanel = document.getElementById('articleIllustrationPanel');
        const legacyInput = document.querySelector('.image-input-section');
        const legacyPreview = document.querySelector('.image-preview-section');
        if (currentImgMode === 'article-illustration') {
            if (aiPanel) aiPanel.style.display = 'flex';
            if (legacyInput) legacyInput.style.display = 'none';
            if (legacyPreview) legacyPreview.style.display = 'none';
            // 加载 workflowState 的文章信息
            if (window.workflowState && window.workflowState.article) {
                if (typeof window.updateArticleIllustrationPanel === 'function') {
                    window.updateArticleIllustrationPanel();
                }
            }
        } else {
            if (aiPanel) aiPanel.style.display = 'none';
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
        // 1. content 是字符串（标准 OpenAI 格式，含空字符串）
        // 2. content 是 null（部分模型在 tool_calls 或特定场景下）→ 尝试 reasoning_content
        // 3. content 是数组（OpenAI vision 格式 [{type:"text", text:"..."}]）→ 拼接文本
        let content = msg.content;
        if (content === null || content === undefined) {
            // 尝试 reasoning_content（部分模型用此字段）
            content = msg.reasoning_content || '';
        }
        if (Array.isArray(content)) {
            // vision 格式：拼接所有 text 段
            content = content.filter(c => c && c.type === 'text').map(c => c.text).join('');
        }
        if (typeof content !== 'string') {
            // 最后兜底：转字符串
            content = String(content || '');
        }
        // 过滤 prompt 泄露：某些模型会回显 prompt 内容
        content = stripPromptLeakage(content);
        return content;
    }

    // 检测并过滤 LLM 回显的 prompt 内容
    // 某些模型（特别是国内部分 API）会把 prompt 的指令部分当作返回内容
    function stripPromptLeakage(text) {
        if (!text || typeof text !== 'string') return text;
        // 1. prompt 特征标记（prompt 原文回显）
        const promptMarkers = [
            '事实红线·禁止杜撰', '禁止杜撰', '总字数必须达到', '总字数严格控制在',
            '风格要求', '内容方向', '每章节必须达到', '不得编造',
            '不要输出任何解释说明', '现在请开始写', '你是一位资深的公众号',
            '严格遵循以下要求', '字数要求', '你是一位资深公众号', '【红线', '【事实红线',
            '【写作核心要求', '【爆款标题技巧', '【去AI化', '【写作要求', '【资讯背景', '【话题背景'
        ];
        // 2. CoT 元思考特征（推理模型把思考过程当答案输出）
        const cotMarkers = [
            '解构话题', '检查约束', '起草内容', '审查与打磨', '字数计算', '精确计算字数',
            '结构安排', '结构规划', '结构设计', '让我们', '我需要', '我可以这样写',
            '我的建议是', '删减策略', '精简', '逐字', '逐步进行', '完美。',
            '字数：', '（字数：', '(字数：', '字左右', '字，符合', '字，稍微',
            '引言：', '章节1：', '章节2：', '章节3：', '章节4：', '章节5：', '结尾：',
            '标题：', '1. 引言', '2. 章节', '3. 章节', '4. 章节', '5. 章节',
            '符合。', '可以。', '-> 可以', '-> 删减', '不要编造', '触碰红线'
        ];
        const allMarkers = [...promptMarkers, ...cotMarkers];
        // 检测是否包含任一标记
        const hasLeakage = allMarkers.some(m => text.includes(m));
        if (!hasLeakage) return text;
        console.warn('[callLLM] 检测到 prompt/CoT 泄露，尝试截取正文');

        // 策略1：找到最后一个 markdown 标题（# 开头），从那里截取（CoT 通常在正文之前）
        const titleMatches = [...text.matchAll(/^#\s+[^\n]+/gm)];
        if (titleMatches.length > 0) {
            // 取最后一个 # 标题的位置（真正的文章标题，CoT 里的"标题："不算）
            const lastTitle = titleMatches[titleMatches.length - 1];
            const idx = lastTitle.index;
            if (idx > 0) {
                const candidate = text.substring(idx).trim();
                // 截取后必须够长（避免截到 CoT 里的假标题）
                if (candidate.length > 200) {
                    return candidate;
                }
            }
        }
        // 策略2：找"直接输出"或"以下是"之后的内容
        const outputMarkers = ['直接输出', '以下是文章', '以下是正文', '文章如下', '正文开始'];
        for (const marker of outputMarkers) {
            const idx = text.lastIndexOf(marker);
            if (idx >= 0) {
                const after = text.substring(idx + marker.length).replace(/^[:：\s\n]+/, '').trim();
                if (after.length > 200) return after;
            }
        }
        // 策略3：按双换行分段，丢弃所有包含 CoT 特征的段落，保留看起来像文章的段落
        const paras = text.split(/\n\s*\n/);
        const cleanParas = paras.filter(p => {
            const t = p.trim();
            if (!t) return false;
            // 丢弃含 CoT 标记的段
            if (allMarkers.some(m => t.includes(m))) return false;
            // 丢弃"数字. "开头的提纲式段
            if (/^\d+[\.\、]\s*(引言|章节|标题|结尾|结构)/.test(t)) return false;
            // 丢弃括号注释（如"(字数：260字左右，3-4段，无禁用词)"）
            if (/^\(字数|^（字数/.test(t)) return false;
            return true;
        });
        if (cleanParas.length >= 3) {
            return cleanParas.join('\n\n');
        }
        // 都失败，返回原文（让用户看到问题）
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
                reportLines.push('【关键问题·必须处理】');
                analysis.critical.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.important.length > 0) {
                reportLines.push('【重要问题·优先处理】');
                analysis.important.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.minor.length > 0) {
                reportLines.push('【细节问题·酌情处理】');
                analysis.minor.forEach(c => reportLines.push(`- ${c.pattern}（${c.count}次）：${c.suggestion}`));
            }
            if (analysis.stats.sentCount >= 4) {
                reportLines.push(`【统计信号】句子数 ${analysis.stats.sentCount}，平均句长 ${analysis.stats.avgLen.toFixed(0)} 字，节奏 CoV=${analysis.stats.burstiness.toFixed(2)}`);
            }
        }
        const reportBlock = reportLines.length > 0
            ? `\n\n${reportLines.join('\n')}\n`
            : '';

        const prompt = `你是一位资深公众号编辑，擅长把 AI 生成的文章改得像真人写的。请对以下文章做"去AI味"改写。

【改写原则】
1. 保留原文的核心观点、结构、标题层级（# ## ###），不要改变内容方向
2. 不要新增观点、数据、案例、引语；不要删除核心事实
3. 文章字数控制在原文 ±10% 以内

【AI 痕迹清除清单】
- 删除所有破折号（— –），用逗号或句号替代
- 拆解"不仅是…更是…"、"不是…而是…"等平行结构
- 拆解"首先/其次/最后"三段论，改为自然过渡
- 去掉"这不禁让我们思考"、"这提醒我们"、"未来必将"等 AI 反思句
- 去掉"在 XX 的背景下"、"随着 XX 的发展"等 AI 开头
- 替换 AI 高频词：此外/值得一提的是/至关重要/深入探讨/赋能/沉淀/迭代/落地/变现/裂变/触达/闭环/抓手/赛道/风口/护城河/降维打击/内卷/躺平/破圈/国潮/新消费/下沉市场
- 移除"以下是"、"希望对你有帮助"、"以上就是"等 chatbot 痕迹
- 移除"未来可期"、"前景广阔"、"让我们拭目以待"等套话结尾

【人味增加】
- 句子长短混排：有的句子只有 3-10 字，有的 30+ 字
- 加入口语化表达（说实话、坦白讲、老实说、讲真、其实、话说回来）
- 段落长度有变化：有的段落只有一句话
- 可以保留 Markdown 格式（# ## > ** - \`\`\`）
${reportBlock}
【输出要求】
直接输出改写后的全文，不要任何解释、不要前后缀。

【原文】
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
        const prompt = `你是一位资深公众号排版编辑。请对以下 Markdown 文章做"排版优化"，不要改写文字内容，只调整结构和格式。

【排版优化清单】
1. 标题层级识别：
   - 文章大标题用 # (H1)
   - 一级章节标题用 ## (H2)
   - 二级小节标题用 ### (H3)
   - 不要跳级（如 H1 直接跳到 H3）
   - 标题末尾不要加句号、冒号
2. 引用块规范：
   - 引用名人名言、重点金句、他人观点时用 > 引用语法
   - 引用块前后要空一行
   - 不要把普通段落误标为引用
3. 代码块规范：
   - 代码片段用 \`\`\` 包裹，并标注语言（\`\`\`js / \`\`\`python 等）
   - 行内代码用 \`反引号\` 包裹
4. 段落松散化：
   - 每段 2-3 句最佳，最多 4 句
   - 长段落拆分为多个短段落
   - 段落之间用空行分隔
5. 列表规范：
   - 并列要点用 - 无序列表
   - 步骤用 1. 2. 3. 有序列表
   - 列表前后空一行
6. 段落首字符修正：
   - 段落开头不能是标点符号（。，；！？：、）
   - 如果有，删掉该标点
7. 保留原文的：
   - 所有文字内容（不增删观点、不替换词语）
   - 图片语法 ![](url)
   - 链接语法 [文字](url)
   - 加粗 **重点** 和斜体 *强调*

【输出要求】
直接输出排版优化后的完整 Markdown 文本，不要任何解释、不要前后缀。

【原文】
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

        // 风格一句话
        const styleMap = {
            deep: '深度思考，观点犀利',
            casual: '轻松随性，口语化',
            story: '故事叙事，具体场景',
            sharp: '立场鲜明，敢下判断',
            warm: '温暖治愈，关注普通人'
        };
        const directionMap = {
            opinion: '表达独立判断',
            experience: '分享实操经验',
            knowledge: '通俗讲清楚一个概念',
            emotion: '关注读者内心感受'
        };

        // 资讯背景：简洁一句话
        const bgLine = newsContext
            ? `资讯背景：${newsContext}\n`
            : '';

        // 极简 prompt：避免触发推理模型的 CoT 思考链
        // 关键：不要堆砌结构化指令，直接给话题和要求，让 LLM 直接写
        const prompt = `你是公众号主笔。基于「${topic}」写一篇 ${wordCount} 字左右的文章，风格${styleMap[style] || '深度思考'}，${directionMap[direction] || '表达独立判断'}。
${bgLine}
要求：
- 用 Markdown 格式，# 大标题 + ## 划分 ${sections} 个章节
- 段落松散，每段 2-3 句，不要写大段堆砌
- 写真人会说的话，不要"此外/值得一提的是/至关重要"这类 AI 腔
- 不编造具体数据/人物/公司/事件，观点和情感可以自由发挥
- 不碰宗教/政治/领导人/民族争议
- 标题用爆款技巧（数字、悬念、反差），15-25 字

直接输出文章正文，从 # 标题开始，不要任何解释、思考过程、字数统计。`;
        return await callLLM(prompt, settings);
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
    // 多源分级 + 四大板块分类 + 红线过滤 + 时间校准
    // 来源优先级：1.微博热搜 2.抖音热点 3.36氪科技 4.推荐选题
    // 四大板块：互联网 #2563eb / 职场 #7c3aed / 科技 #16a34a / 社会爆款 #dc2626

    // ===== 长条形时间栏 + 时间校准 =====
    function renderCalendar() {
        const calDate = document.getElementById('calDate');
        const calWeekday = document.getElementById('calWeekday');
        const calTime = document.getElementById('calTime');
        const calStatus = document.getElementById('calStatus');
        if (!calDate) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const hour = now.getHours();
        const min = now.getMinutes();
        const timeStr = `${hour < 10 ? '0' + hour : hour}:${min < 10 ? '0' + min : min}`;

        if (calDate) calDate.textContent = `${year}年${month}月${day}日`;
        if (calWeekday) calWeekday.textContent = weekdays[now.getDay()];
        if (calTime) calTime.textContent = timeStr;
        if (calStatus) calStatus.innerHTML = '<span style="color:#10B981;">●</span> 实时';
    }
    renderCalendar();
    setInterval(renderCalendar, 30000);

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
        // 最后兜底：预置选题
        return [
            { title: '当代年轻人的精神状态', cat: 'society', desc: '年轻人面对压力的真实反应', time: timeStr, source: '微博' },
            { title: 'AI 改变了哪些工作', cat: 'tech', desc: 'AI 技术对传统岗位的冲击', time: timeStr, source: '微博' },
            { title: '大厂年终奖真相', cat: 'workplace', desc: '互联网行业薪酬福利现状', time: timeStr, source: '微博' },
            { title: '互联网行业的下一个风口', cat: 'internet', desc: '行业趋势预测与新机会', time: timeStr, source: '微博' }
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
        // 最后兜底：预置选题
        return DOUYIN_TOPICS.map(t => ({ ...t, source: '抖音', time: timeStr }));
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
            recommend: '综合资讯'
        }[topicCenterState.currentSource] || '';

        // 时间标签：实时抓取的显示"实时"，预置的显示"今日精选"
        const now = new Date();
        const timeStr = `${now.getHours() < 10 ? '0' + now.getHours() : now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`;
        const timeLabel = `实时 ${timeStr}`;

        hotTopicsList.innerHTML = `<div style="font-size:12px;color:#6B7280;margin-bottom:8px;font-weight:600;">${sourceLabel} · ${timeLabel}（共 ${items.length} 条，点击选择）：</div>` +
            items.map((it, i) => {
                const catInfo = TOPIC_CATEGORIES[it.cat] || TOPIC_CATEGORIES.society;
                const safeTitle = (it.title || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                const safeDesc = (it.desc || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                const itemTime = it.time || timeLabel;
                return `<div style="padding:10px 12px;margin-bottom:6px;border:1px solid #E5E7EB;background:#fff;border-radius:8px;cursor:pointer;transition:all 0.15s;" data-topic="${safeTitle}" data-desc="${safeDesc}" data-source="${it.source || ''}" class="topic-item">
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
                setCreateStatus(`已选择话题：${el.dataset.topic}${el.dataset.desc ? '（含资讯背景）' : ''}`, true);
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
                recommend: '#3B82F6'
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
        setCreateStatus(`正在加载${({weibo:'微博热搜',douyin:'抖音热点','36kr':'36氪科技',recommend:'推荐选题'})[source]}...`, true);

        let items = [];
        try {
            if (source === 'weibo') {
                items = await fetchWeiboTopics();
            } else if (source === 'douyin') {
                items = await fetchDouyinTopics();
            } else if (source === '36kr') {
                // 36氪：真实 RSS 抓取
                items = await fetchRSSNews('https://36kr.com/feed', '36氪');
            } else {
                // 推荐选题 → 综合资讯：聚合 36氪+IT之家+少数派 RSS
                items = await fetchAggregatedNews();
            }
        } catch (e) {
            console.error('加载选题失败:', e);
            items = RECOMMEND_TOPICS.map(t => ({ ...t, source: 'recommend', time: '今日精选' }));
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

    // 刷新按钮：重新加载当前源
    const refreshTopicsBtn = document.getElementById('refreshTopicsBtn');
    if (refreshTopicsBtn) {
        refreshTopicsBtn.addEventListener('click', () => {
            switchTopicSource(topicCenterState.currentSource);
        });
    }

    // 初始化：默认加载推荐选题
    // 默认激活 36 氪（真实 RSS 资讯）
    setTimeout(() => switchTopicSource('36kr', true), 100);

    // 生成按钮
    if (createGenerateBtn) {
        createGenerateBtn.addEventListener('click', () => createGenerateArticle(false));
    }
    // 重新生成按钮
    if (createRegenerateBtn) {
        createRegenerateBtn.addEventListener('click', () => createGenerateArticle(true));
    }
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
        gotoImageBtn.addEventListener('click', () => {
            // 优先用 workflowState，否则尝试从编辑器提取
            let article = (window.workflowState && window.workflowState.article) || '';
            if (!article) {
                // 从编辑器 innerHTML 反推 markdown 不可靠，提示用户
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
            // 同步 workflowState
            window.workflowState.article = article;
            // 切到 Tab3 图片生成 tab
            const imageTab = document.querySelector('.tab-btn[data-tab="image"]');
            if (imageTab) imageTab.click();
            // 切换 mode 到 article-illustration
            const aiModeBtn = document.querySelector('.mode-btn[data-mode="article-illustration"]');
            if (aiModeBtn) aiModeBtn.click();
            // 更新 Tab3 文章信息
            setTimeout(() => updateArticleIllustrationPanel(), 100);
            showToast('已进入配图 Tab，可点击「规划配图 Prompt」开始');
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
