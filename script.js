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
// 微信公众号支持的系统内置字体（不支持外部字体链接）
const fontFamilies = {
    serif: "'Songti SC', 'SimSun', 'STSong', '华文宋体', Georgia, 'Times New Roman', serif",
    sans: "'PingFang SC', 'Microsoft YaHei', '微软雅黑', 'SimHei', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Consolas', 'Courier New', 'SF Mono', monospace"
};

const fontWeights = {
    serif: '400',
    sans: '400',
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

// ===== 5种精品模板 - 全部支持主题色 =====
const styleThemes = {

    // ===== 1. 极简白 =====
    minimal: {
        name: '极简白',
        canvasBg: '#FFFFFF',
        textColor: '#3D3D3D',
        metaColor: '#8A8A8A',

        bodyStyle(c, s, sp, t, font) {
            return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:40px 32px 60px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.35;text-align:center;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
        },
        h2Style(c, s, sp, t) {
            return `font-size:${s.h2Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
        },
        blockquoteStyle(c) {
            return `border-left:2px solid ${c.accent};padding:14px 0 14px 20px;margin:24px 0;color:${this.metaColor};font-size:14px;line-height:1.8;`;
        },
        ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        liStyle(c) {
            return `margin-bottom:10px;color:${this.textColor};padding-left:20px;position:relative;`;
        },
        liIcon(c) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-size:12px;">·</span>`;
        },
        olIcon(c, idx) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:500;font-size:12px;">${idx}.</span>`;
        },
        hrStyle(c) {
            return `border:none;height:1px;background:linear-gradient(90deg,transparent,${c.accent}40,transparent);margin:40px auto;width:60%;`;
        },
        codeStyle(c) {
            return `color:${c.accentDark};background:${c.accentSoft};padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};`;
        },
        preStyle(c) {
            return `background:${c.accentSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:8px;border:1px solid ${c.accentBorder};overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
        },
        preCodeStyle(c) {
            return `display:block;color:${this.textColor};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.9);border:1px solid ${c.accentBorder};border-radius:4px;padding:4px 12px;font-size:11px;color:${c.accentDark};cursor:pointer;line-height:1.4;`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
        },
        aStyle(c) {
            return `color:${c.accentDark};text-decoration:none;border-bottom:1px solid ${c.accentBorder};`;
        },
        strongStyle(c) {
            return `color:${c.accentDark};font-weight:600;`;
        },
        emStyle(c) {
            return `color:${c.accent};font-style:italic;`;
        }
    },

    // ===== 2. 黑金奢 =====
    luxury: {
        name: '黑金奢',
        canvasBg: '#FEFDFB',
        textColor: '#3D3D3D',
        metaColor: '#999999',

        bodyStyle(c, s, sp, t, font) {
            return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:2.0;color:${this.textColor};background-color:${this.canvasBg};padding:40px 32px 60px;text-align:justify;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:${s.h1Size};font-weight:500;margin:${sp.h2MarginTop + 10} 0 ${sp.h2MarginBottom + 5} 0;text-align:center;color:${c.accentDark};letter-spacing:4px;`;
        },
        h2Style(c, s, sp, t) {
            return `font-size:${s.h2Size};font-weight:500;margin:0;color:${c.accentDark};letter-spacing:2px;padding:0 20px;display:inline-block;`;
        },
        h2Decor(c) {
            return `<span style="display:block;text-align:center;margin-top:8px;"><span style="display:inline-block;color:${c.accent};font-size:10px;letter-spacing:8px;">· · ·</span></span>`;
        },
        blockquoteStyle(c) {
            return `border-top:1px solid ${c.accent}40;border-bottom:1px solid ${c.accent}40;padding:24px 40px;margin:32px 0;text-align:center;color:#888;font-style:italic;font-size:14px;line-height:1.9;`;
        },
        ulStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
        olStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
        liStyle(c) {
            return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
        },
        liIcon(c) {
            return `<span style="position:absolute;left:0;top:3px;color:${c.accent};font-size:9px;">◆</span>`;
        },
        olIcon(c, idx) {
            return `<span style="position:absolute;left:0;top:3px;color:${c.accent};font-size:10px;font-weight:500;">${idx}</span>`;
        },
        hrStyle(c) {
            return `border:none;height:1px;background:${c.accent}50;width:80px;margin:48px auto;`;
        },
        codeStyle(c) {
            return `color:${c.accentDark};background:${c.accentSoft};border:1px solid ${c.accentBorder};padding:2px 8px;border-radius:2px;font-size:12px;font-family:${fontFamilies.mono};`;
        },
        preStyle(c) {
            return `background:#FFFDF8;padding:24px;margin:28px 0 8px 0;border:1px solid ${c.accent}25;border-radius:2px;overflow:hidden;font-size:13px;line-height:1.8;position:relative;`;
        },
        preCodeStyle(c) {
            return `display:block;color:#555;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:rgba(255,253,248,0.95);border:1px solid ${c.accent}30;border-radius:2px;padding:4px 12px;font-size:11px;color:${c.accentDark};cursor:pointer;line-height:1.4;`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:11px;color:${c.accent}90;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-style:italic;`;
        },
        aStyle(c) {
            return `color:${c.accentDark};text-decoration:none;border-bottom:1px solid ${c.accent}60;`;
        },
        strongStyle(c) {
            return `color:${c.accentDark};font-weight:600;`;
        },
        emStyle(c) {
            return `color:${c.accent};font-style:italic;`;
        }
    },

    // ===== 3. 科技感 =====
    cyber: {
        name: '科技感',
        canvasBg: '#FAFBFC',
        textColor: '#1E293B',
        metaColor: '#64748B',

        bodyStyle(c, s, sp, t, font) {
            return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:1.85;color:${this.textColor};background-color:${this.canvasBg};padding:36px 28px 56px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};font-family:${fontFamilies.mono};letter-spacing:1px;`;
        },
        h2Style(c, s, sp, t) {
            return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};font-family:${fontFamilies.mono};padding-left:14px;border-left:3px solid ${c.accent};letter-spacing:0.5px;`;
        },
        blockquoteStyle(c) {
            return `background:${c.accentSoft};border-left:3px solid ${c.accent};padding:14px 20px;margin:24px 0;color:#475569;font-size:14px;border-radius:0 6px 6px 0;`;
        },
        ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        liStyle(c) {
            return `margin-bottom:10px;color:${this.textColor};padding-left:22px;position:relative;`;
        },
        liIcon(c) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-family:${fontFamilies.mono};font-size:11px;font-weight:600;">▸</span>`;
        },
        olIcon(c, idx) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-family:${fontFamilies.mono};font-size:11px;font-weight:600;">${String(idx).padStart(2,'0')}</span>`;
        },
        hrStyle(c) {
            return `border:none;height:1px;background:linear-gradient(90deg,transparent,${c.accent},transparent);margin:36px 0;`;
        },
        codeStyle(c) {
            return `color:${c.accentDark};background:${c.accentSoft};padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};border:1px solid ${c.accentBorder};`;
        },
        preStyle(c) {
            return `background:#0F172A;padding:20px 24px;margin:24px 0 8px 0;border-radius:8px;border:1px solid #1E293B;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
        },
        preCodeStyle(c) {
            return `display:block;color:#E2E8F0;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:rgba(30,41,59,0.9);border:1px solid #334155;border-radius:4px;padding:4px 12px;font-size:11px;color:#94A3B8;cursor:pointer;line-height:1.4;font-family:${fontFamilies.mono};`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:11px;color:#64748B;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-family:${fontFamilies.mono};`;
        },
        aStyle(c) {
            return `color:${c.accentDark};text-decoration:none;border-bottom:1px dashed ${c.accent};`;
        },
        strongStyle(c) {
            return `color:${c.accentDark};font-weight:600;`;
        },
        emStyle(c) {
            return `color:${c.accent};font-style:italic;`;
        }
    },

    // ===== 4. 杂志风 =====
    magazine: {
        name: '杂志风',
        canvasBg: '#FFFFFF',
        textColor: '#1A1A1A',
        metaColor: '#666666',

        bodyStyle(c, s, sp, t, font) {
            return `font-family:${font};font-weight:${getFontWeight()};font-size:15px;line-height:2.15;color:${this.textColor};background-color:${this.canvasBg};padding:48px 36px 72px;text-align:justify;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};text-indent:2em;`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:${s.h1Size + 4}px;font-weight:700;margin:${sp.h2MarginTop + 10} 0 ${sp.h2MarginBottom + 5} 0;text-align:center;color:${c.accentDark};letter-spacing:6px;line-height:1.3;`;
        },
        h2Style(c, s, sp, t) {
            return `font-size:${s.h2Size + 2}px;font-weight:700;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;text-align:center;color:${c.accentDark};letter-spacing:3px;line-height:1.4;`;
        },
        blockquoteStyle(c) {
            return `border-top:1px solid ${c.accent}40;border-bottom:1px solid ${c.accent}40;padding:28px 48px;margin:36px 0;text-align:center;color:${this.metaColor};font-style:italic;font-size:15px;line-height:1.9;`;
        },
        ulStyle(c) { return `margin:20px 0;padding-left:28px;list-style:none;text-indent:0;`; },
        olStyle(c) { return `margin:20px 0;padding-left:28px;list-style:none;text-indent:0;`; },
        liStyle(c) {
            return `margin-bottom:12px;color:${this.textColor};font-size:15px;position:relative;padding-left:16px;text-indent:0;`;
        },
        liIcon(c) {
            return `<span style="position:absolute;left:0;top:8px;color:${c.accent};font-size:6px;">●</span>`;
        },
        olIcon(c, idx) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:13px;">${idx}.</span>`;
        },
        hrStyle(c) {
            return `border:none;text-align:center;margin:48px 0;height:auto;color:${c.accent}80;font-size:18px;letter-spacing:12px;`;
        },
        hrDecor(c) {
            return `· · ·`;
        },
        codeStyle(c) {
            return `color:${c.accentDark};background:${c.accentSoft};padding:2px 8px;border-radius:2px;font-size:13px;font-family:${fontFamilies.mono};`;
        },
        preStyle(c) {
            return `background:#FAFAFA;padding:24px;margin:28px 0 8px 0;border-radius:2px;border:1px solid #EFEFEF;overflow:hidden;font-size:14px;line-height:1.8;position:relative;`;
        },
        preCodeStyle(c) {
            return `display:block;color:#333;font-family:${fontFamilies.mono};font-size:14px;white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);border:1px solid #E5E5E5;border-radius:2px;padding:4px 12px;font-size:11px;color:#666;cursor:pointer;line-height:1.4;`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:11px;color:#CCC;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-style:italic;`;
        },
        aStyle(c) {
            return `color:${c.accentDark};text-decoration:none;border-bottom:2px solid ${c.accent};`;
        },
        strongStyle(c) {
            return `color:${c.accentDark};font-weight:700;`;
        },
        emStyle(c) {
            return `color:${this.metaColor};font-style:italic;`;
        }
    },

    // ===== 5. 清新绿 =====
    fresh: {
        name: '清新绿',
        canvasBg: '#F8FFFE',
        textColor: '#374151',
        metaColor: '#6B7280',

        bodyStyle(c, s, sp, t, font) {
            return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:2.0;color:${this.textColor};background-color:${this.canvasBg};padding:36px 28px 56px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};padding-bottom:12px;border-bottom:3px solid ${c.accent}30;letter-spacing:${t.letterSpacing};`;
        },
        h2Style(c, s, sp, t) {
            return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};padding-bottom:8px;border-bottom:2px solid ${c.accent}25;letter-spacing:${t.letterSpacing};`;
        },
        blockquoteStyle(c) {
            return `background:${c.accentSoft};border-left:4px solid ${c.accent};padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;color:${c.accentDark};font-size:14px;`;
        },
        ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
        liStyle(c) {
            return `margin-bottom:10px;color:${this.textColor};padding-left:24px;position:relative;`;
        },
        liIcon(c) {
            return `<span style="position:absolute;left:0;top:2px;color:${c.accent};font-size:9px;">●</span>`;
        },
        olIcon(c, idx) {
            return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:11px;">${idx}.</span>`;
        },
        hrStyle(c) {
            return `border:none;height:2px;background:linear-gradient(90deg,transparent,${c.accent}50,transparent);margin:40px 0;border-radius:1px;`;
        },
        codeStyle(c) {
            return `color:${c.accentDark};background:${c.accentSoft};padding:2px 8px;border-radius:4px;font-size:12px;font-family:${fontFamilies.mono};`;
        },
        preStyle(c) {
            return `background:${c.accentSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:10px;border:1px solid ${c.accent}20;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
        },
        preCodeStyle(c) {
            return `display:block;color:${c.accentDark};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.9);border:1px solid ${c.accent}30;border-radius:6px;padding:4px 12px;font-size:11px;color:${c.accentDark};cursor:pointer;line-height:1.4;`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:11px;color:${c.accent}70;margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
        },
        aStyle(c) {
            return `color:${c.accentDark};text-decoration:none;border-bottom:1px solid ${c.accent}40;`;
        },
        strongStyle(c) {
            return `color:${c.accentDark};font-weight:600;`;
        },
        emStyle(c) {
            return `color:${c.accent};font-style:italic;`;
        }
    }
};

function getStyleTheme() {
    return styleThemes[currentStyle] || styleThemes.minimal;
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
        const blockId = `__CODEBLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
        return blockId;
    });

    html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^———$/gm, '<hr>');

    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    const lines = html.split('\n');
    const processedLines = [];
    let inUl = false;
    let inOl = false;
    let olCounter = 0;

    function closeLists() {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        if (inOl) { processedLines.push('</ol>'); inOl = false; olCounter = 0; }
    }

    lines.forEach((line) => {
        const ulMatch = line.match(/^[-*•] (.+)$/);
        const olMatch = line.match(/^(\d+)[.、）)]\s*(.+)$/);

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
            const trimmed = line.trim();
            if (trimmed && !trimmed.match(/^<\/?(ul|ol|li|blockquote|pre|h[1-6]|div|p|hr|a|strong|em|code|span)/i)
                && !trimmed.startsWith('__CODEBLOCK_') && !trimmed.includes('__CODEBLOCK_')) {
                processedLines.push(`<p>${trimmed}</p>`);
            } else {
                processedLines.push(line);
            }
        }
    });

    closeLists();

    let result = processedLines.join('\n');
    codeBlocks.forEach((block, idx) => {
        result = result.replace(`__CODEBLOCK_${idx}__`, block);
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

    // 为样式追加字体（微信公众号需要每个元素都明确指定字体）
    const appendFont = (style, useMono = false) => {
        const fontFamily = useMono ? fontFamilies.mono : font;
        return style + `font-family:${fontFamily};`;
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
                const style = appendFont(theme.h1Style(c, s, sp, t));
                return `<h1 style="${style}">${children}</h1>`;
            }
            case 'h2': {
                const style = appendFont(theme.h2Style(c, s, sp, t));
                const h2Decor = theme.h2Decor ? theme.h2Decor(c) : '';
                if (h2Decor) {
                    return `<div style="margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;"><h2 style="${style}">${children}</h2>${h2Decor}</div>`;
                }
                return `<h2 style="${style}">${children}</h2>`;
            }
            case 'h3': {
                const style = appendFont(theme.h2Style(c, s, sp, t));
                return `<h3 style="${style}">${children}</h3>`;
            }
            case 'p': {
                const style = appendFont(theme.pStyle(c, sp));
                return `<p style="${style}">${children}</p>`;
            }
            case 'blockquote': {
                const style = appendFont(theme.blockquoteStyle(c));
                return `<blockquote style="${style}">${children}</blockquote>`;
            }
            case 'ul': {
                const style = theme.ulStyle(c);
                const liStyle = appendFont(theme.liStyle(c));
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
                const liStyle = appendFont(theme.liStyle(c));
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
                const hrDecor = theme.hrDecor ? `<span style="display:block;text-align:center;color:${c.accent}80;font-size:18px;letter-spacing:12px;margin:-28px 0 48px 0;">${theme.hrDecor(c)}</span>` : '';
                return `<hr style="${style}">${hrDecor}`;
            }
            case 'a': {
                const style = appendFont(theme.aStyle(c));
                const href = node.getAttribute('href') || '#';
                return `<a href="${href}" style="${style}">${children}</a>`;
            }
            case 'strong':
            case 'b': {
                const style = appendFont(theme.strongStyle(c));
                return `<strong style="${style}">${children}</strong>`;
            }
            case 'em':
            case 'i': {
                const style = appendFont(theme.emStyle(c));
                return `<em style="${style}">${children}</em>`;
            }
            case 'code': {
                const parentTag = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
                if (parentTag === 'pre') {
                    return children;
                }
                const style = appendFont(theme.codeStyle(c), true); // code使用等宽字体
                return `<code style="${style}">${children}</code>`;
            }
            case 'pre': {
                const preStyle = appendFont(theme.preStyle(c), true);
                const codeStyle = appendFont(theme.preCodeStyle(c), true);
                const copyBtnStyle = appendFont(theme.codeCopyBtnStyle(c), true);
                const hintStyle = appendFont(theme.scrollHintStyle(c), true);
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

// ===== 更新预览 =====
function updatePreview() {
    const content = editor.innerHTML;
    const parsed = renderStyledHTML(content);
    articleBody.innerHTML = parsed;

    const c = getColorConfig();
    const s = getSizeConfig();
    const sp = getSpacingConfig();
    const t = getTrackingConfig();
    const font = getFontFamily();
    const theme = getStyleTheme();

    const bodyStyle = theme.bodyStyle(c, s, sp, t, font);
    articleBody.style.cssText = bodyStyle;
}

function debouncedUpdatePreview() {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(updatePreview, 100);
}

// ===== 导出 =====
function generateExportHTML() {
    const clone = articleBody.cloneNode(true);
    clone.querySelectorAll('.code-copy-btn').forEach(btn => btn.remove());
    clone.querySelectorAll('.code-scroll-hint').forEach(hint => hint.remove());
    return clone.innerHTML;
}

function generateRawHTML() {
    return articleBody.innerHTML;
}

async function copyToClipboard() {
    const html = generateExportHTML();
    try {
        const blob = new Blob([html], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([item]);
        showToast('排版已复制，可直接粘贴到公众号！');
    } catch (err) {
        fallbackCopy(html, '排版已复制，请粘贴到公众号编辑器');
    }
}

async function copyRawHTML() {
    const html = generateRawHTML();
    try {
        await navigator.clipboard.writeText(html);
        showToast('HTML源码已复制！');
    } catch (err) {
        fallbackCopy(html, 'HTML源码已复制');
    }
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
function setStyle(style) {
    currentStyle = style;
    styleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.style === style));
    updatePreview();
}

function setColor(color) {
    document.body.classList.remove(`theme-${currentColor}`);
    currentColor = color;
    document.body.classList.add(`theme-${color}`);
    colorButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.color === color));
    updatePreview();
}

function setSize(size) {
    currentSize = size;
    sizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === size));
    updatePreview();
}

function setSpacing(spacing) {
    currentSpacing = spacing;
    spacingButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.spacing === spacing));
    updatePreview();
}

function setFont(font) {
    currentFont = font;
    editor.style.fontFamily = fontFamilies[font];
    editor.style.fontWeight = fontWeights[font];
    fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.font === font));
    updatePreview();
}

function setTracking(tracking) {
    currentTracking = tracking;
    trackingButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tracking === tracking));
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
        const looksLikeMarkdown = /^#\s|^##\s|```|\*\*|^-\s|^>\s/.test(trimmed) || trimmed.length > 200;
        if (looksLikeMarkdown) {
            const formatted = smartFormatText(trimmed);
            const html = markdownToHTML(formatted);
            insertHTMLAtCursor(html);
        } else {
            insertHTMLAtCursor(`<p>${trimmed.replace(/\n/g, '<br>')}</p>`);
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
        const formatted = smartFormatText(textData.trim());
        const html = markdownToHTML(formatted);
        insertHTMLAtCursor(html);
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
    editor.focus();
    document.execCommand('selectAll', false, null);
    const formatted = smartFormatText(text);
    const html = markdownToHTML(formatted);
    document.execCommand('insertHTML', false, html);
    updatePreview();
    showToast('智能排版完成！');
}

function smartFormatText(text) {
    let lines = text.split('\n').map(l => l.trimRight());
    
    lines = normalizeWhitespace(lines);
    
    const result = [];
    let paraBuffer = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    
    const cleanLines = collapseEmptyLines(lines);
    const nonEmpty = cleanLines.filter(l => l.trim());
    if (nonEmpty.length === 0) return text;

    let titleLine = -1;
    if (isLikelyTitle(nonEmpty[0].trim()) && nonEmpty.length > 1) titleLine = 0;

    let subtitleLine = -1;
    if (titleLine === 0 && nonEmpty.length > 2) {
        if (isLikelySubtitle(nonEmpty[1].trim(), nonEmpty[0].trim())) subtitleLine = 1;
    }

    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];
        const trimmed = line.trim();
        
        if (trimmed === '') {
            if (inCodeBlock) {
                codeBuffer.push('');
                continue;
            }
            if (paraBuffer.length > 0) {
                result.push(paraBuffer.join(''));
                paraBuffer = [];
            }
            result.push('');
            continue;
        }
        
        if (trimmed.startsWith('```') || /^[`]{3,}/.test(trimmed)) {
            if (inCodeBlock) {
                codeBuffer.push(trimmed);
                result.push(codeBuffer.join('\n'));
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                if (paraBuffer.length > 0) {
                    result.push(paraBuffer.join(''));
                    paraBuffer = [];
                }
                inCodeBlock = true;
                codeBuffer = [trimmed];
            }
            continue;
        }
        
        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }
        
        const idx = cleanLines.slice(0, i+1).filter(l => l.trim()).length - 1;
        
        if (idx === titleLine) {
            result.push(`# ${trimmed}`);
            continue;
        }
        if (idx === subtitleLine) {
            result.push(`> ${trimmed}`);
            result.push('');
            continue;
        }
        
        if (isLikelyHeading(trimmed, idx, cleanLines)) {
            if (paraBuffer.length > 0) {
                result.push(paraBuffer.join(''));
                paraBuffer = [];
            }
            result.push(`## ${trimmed.replace(/^[0-9]+[.、）)\s]+/, '').replace(/^[一二三四五六七八九十]+、\s*/, '')}`);
            continue;
        }
        
        if (isLikelyListItem(trimmed)) {
            if (paraBuffer.length > 0) {
                result.push(paraBuffer.join(''));
                paraBuffer = [];
            }
            result.push(`- ${trimmed.replace(/^[0-9]+[.、）)\s]+/, '').replace(/^[-•·■▪▸▹►▻◆◇★☆✓✔]+\s*/, '')}`);
            continue;
        }
        
        if (isLikelyQuote(trimmed)) {
            if (paraBuffer.length > 0) {
                result.push(paraBuffer.join(''));
                paraBuffer = [];
            }
            result.push(`> ${trimmed.replace(/^[>\""「『【\s]+/, '').replace(/[\""」』】\s]+$/, '')}`);
            continue;
        }
        
        paraBuffer.push(trimmed);
    }
    
    if (inCodeBlock && codeBuffer.length > 0) {
        result.push(codeBuffer.join('\n'));
    }
    if (paraBuffer.length > 0) result.push(paraBuffer.join(''));
    
    return highlightKeySentences(result.join('\n'));
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
    if (text.length < 2 || text.length > 50) return false;
    if (/[。，；：、！？]$/.test(text)) return false;
    if (/https?:\/\//.test(text)) return false;
    if (/^[0-9]+[.、）)]/.test(text)) return false;
    return !/^[-•·]/.test(text);
}

function isLikelySubtitle(text, title) {
    if (text.length < 4 || text.length > 80) return false;
    if (text === title) return false;
    return text.length < title.length * 2;
}

function isLikelyHeading(text, idx, allLines) {
    if (text.length < 2 || text.length > 40) return false;
    if (/[。，；：、！？]$/.test(text)) return false;
    
    if (/^[0-9]+(\.[0-9]+)+[\.、）)]/.test(text)) return true;
    if (/^第[一二三四五六七八九十百千0-9]+[章节部分点条课节章]/i.test(text)) return true;
    if (/^[第]?[一二三四五六七八九十百千]+[章节部分篇卷]/i.test(text)) return true;
    
    const headingKeywords = [
        '前言', '引言', '背景', '概述', '简介', '总结', '结语', '结论',
        '注意', '注意事项', '技巧', '方法', '步骤', '流程', '原理',
        '什么是', '为什么', '如何', '怎么', '哪些', '如何做',
        '优点', '缺点', '优势', '劣势', '区别', '对比',
        '安装', '配置', '使用', '实现', '原理', '案例',
        '开头', '结尾', '目录', '附录', '参考文献',
    ];
    for (const k of headingKeywords) {
        if (text.startsWith(k) && text.length <= 20) return true;
    }
    
    if (text.length <= 14 && /[\u4e00-\u9fa5]/.test(text) && !/[。！？，；：、]/.test(text)) {
        const nonEmptyIdx = allLines.slice(0, idx+1).filter(l => l.trim()).length - 1;
        if (nonEmptyIdx > 3 && text.length >= 4) {
            const prevLine = allLines[idx-1] ? allLines[idx-1].trim() : '';
            const nextLine = allLines[idx+1] ? allLines[idx+1].trim() : '';
            if (prevLine && nextLine && !isLikelyListItem(prevLine) && !isLikelyListItem(nextLine)) {
                return true;
            }
        }
    }
    
    return false;
}

function isLikelyListItem(text) {
    if (/^[0-9]+[.、）)\s]+/.test(text)) return true;
    if (/^[一二三四五六七八九十百千]+、\s*/.test(text)) return true;
    if (/^[-•·■▪▸▹►▻◆◇★☆✓✔]+\s*/.test(text)) return true;
    return false;
}

function isLikelyQuote(text) {
    if (/^[\""「『【]/.test(text) && /[\""」』】]/.test(text) && text.length > 10) return true;
    if (/^[——-]+\s*[\u4e00-\u9fa5]/.test(text) && text.length > 10) return false;
    return false;
}

function highlightKeySentences(text) {
    const strongKeywords = [
        '重要', '关键', '核心', '必须', '切记', '注意', '特别',
        '最重要的是', '值得注意的是', '需要强调的是',
        '首先', '其次', '最后', '总之', '综上所述',
    ];
    
    return text.split('\n').map(line => {
        if (line.startsWith('#') || line.startsWith('-') || line.startsWith('>') || 
            line.startsWith('```') || line.startsWith('**') || !line.trim()) return line;
        
        let p = line;
        
        for (const kw of strongKeywords) {
            const regex = new RegExp(`(.{0,20}${kw}.{0,30}?[。！？!?])`, 'g');
            p = p.replace(regex, m => {
                if (m.includes('**')) return m;
                if (m.length < 8 || m.length > 80) return m;
                return `**${m}**`;
            });
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
        if (!content || content.trim().length < 20) {
            showToast('未能提取到文章内容，请尝试其他链接');
            return;
        }
        const formatted = smartFormatText(content);
        const htmlContent = markdownToHTML(formatted);
        editor.innerHTML = htmlContent;
        updatePreview();
        showToast('文章解析完成！');
    } catch (err) {
        console.error(err);
        showToast('解析失败，请检查链接或稍后重试');
    } finally {
        parseUrlBtn.textContent = origText;
        parseUrlBtn.disabled = false;
    }
}

async function fetchWebpage(url) {
    const userAgents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    const acceptHeaders = [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/*',
    ];

    const acceptLangHeaders = [
        'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
        'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'zh-CN,zh;q=0.9',
    ];

    const proxies = [
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
        { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://corsproxy.io/?${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`, type: 'raw' },
        { url: `https://thingproxy.freeboard.io/fetch/${url}`, type: 'raw' },
        { url: `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, type: 'json-rss' },
        { url: `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`, type: 'jsonp' },
        { url: `https://cors-anywhere.herokuapp.com/${url}`, type: 'raw' },
        { url: `https://crossorigin.me/${url}`, type: 'raw' },
        { url: `https://api.allorigins.xyz/get?url=${encodeURIComponent(url)}`, type: 'json' },
    ];

    const randomDelay = () => new Promise(r => setTimeout(r, Math.random() * 500 + 300));

    for (let attempt = 0; attempt < 3; attempt++) {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const accept = acceptHeaders[Math.floor(Math.random() * acceptHeaders.length)];
        const acceptLang = acceptLangHeaders[Math.floor(Math.random() * acceptLangHeaders.length)];

        const shuffledProxies = [...proxies].sort(() => Math.random() - 0.5);

        for (const proxy of shuffledProxies) {
            try {
                await randomDelay();

                const resp = await fetch(proxy.url, {
                    signal: AbortSignal.timeout(18000),
                    method: 'GET',
                    headers: {
                        'User-Agent': userAgent,
                        'Accept': accept,
                        'Accept-Language': acceptLang,
                        'Accept-Encoding': 'gzip, deflate, br, zstd',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Connection': 'keep-alive',
                        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': '"macOS"',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'cross-site',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': '1',
                    },
                    credentials: 'omit',
                    mode: 'cors',
                });

                if (resp.ok && resp.status === 200) {
                    const text = await resp.text();

                    if (proxy.type === 'json') {
                        try {
                            const data = JSON.parse(text);
                            if (data.contents && data.contents.length > 50) {
                                return data.contents;
                            }
                            if (data.responseText && data.responseText.length > 50) {
                                return data.responseText;
                            }
                        } catch (e) {}
                    }

                    if (proxy.type === 'json-rss') {
                        try {
                            const data = JSON.parse(text);
                            if (data.items && data.items.length > 0 && data.items[0].description) {
                                return data.items[0].description;
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
                                if (data.data && data.data.html) return data.data.html;
                                if (data.response) return data.response;
                            } catch (e) {}
                        }
                        return text;
                    }
                }
            } catch (e) {
                console.warn(`Proxy ${proxy.url} failed:`, e.message);
                continue;
            }
        }

        if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        }
    }

    throw new Error('所有代理都失败了');
}

function extractArticleContent(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    doc.querySelectorAll('script,style,noscript,iframe,nav,header,footer,aside,svg').forEach(el => el.remove());
    doc.querySelectorAll('.sidebar,.menu,.nav,.comment,.comments,.share,.ad,.ads,.advertisement,.recommend,.related,.sidebar-widget,.widget').forEach(el => el.remove());
    
    const selectors = [
        'article', '.article-content', '.article-body', '.post-content',
        '.entry-content', '.content-article', '#article-content', '#artibody',
        '.rich_media_content', '.rich_media_main', '#js_content',
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

updatePreview();
