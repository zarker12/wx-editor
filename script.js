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

    html = html.replace(/^###### (.+)$/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');

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
            case 'div':
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

function debouncedUpdatePreview() {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(updatePreview, 100);
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
function syncEditorToTheme() {
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

    editor.style.setProperty('--editor-accent', c.accent);
    editor.style.setProperty('--editor-accent-light', c.accentLight);
    editor.style.setProperty('--editor-accent-dark', c.accentDark);
    editor.style.setProperty('--editor-accent-soft', c.accentSoft);
    editor.style.setProperty('--editor-accent-border', c.accentBorder);
    editor.style.setProperty('--editor-meta', theme.metaColor);
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
        case 'h2':
            formatBlock('h2');
            break;
        case 'list':
            execCommand('insertUnorderedList');
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
    const allowedTags = ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'strong', 'em', 'code', 'pre', 'hr', 'br', 'span', 'div', 'b', 'i'];
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
    const text = editor.innerText.trim();
    if (!text) { showToast('请先输入内容'); return; }
    if (/^#\s/.test(text) || /```/.test(text)) {
        if (!confirm('内容可能已经是Markdown格式，确定要重新智能排版吗？')) return;
    }
    const formatted = smartFormatText(text);
    const html = markdownToHTML(formatted);
    editor.innerHTML = html;
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
            // 标题行结束代码块
            if (/^[一二三四五六七八九十]+、/.test(trimmed) || /^[0-9]+[、.．]/.test(trimmed) || /^第[一二三四五六七八九十百千]+[章节部分]/.test(trimmed)) {
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
        if (line.startsWith('#') || line.startsWith('-') || line.startsWith('>') || 
            line.startsWith('```') || line.startsWith('**') || !line.trim()) return line;
        
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
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleToolAction(btn.dataset.action);
    });
});

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
