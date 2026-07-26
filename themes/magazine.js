window.styleThemes = window.styleThemes || {};

// 04 杂志风：宋体大字 · 上下线引用 · 编辑美学 · 罗马数字
window.styleThemes.magazine = {
    name: '杂志风',
    canvasBg: '#FDFCFA',
    textColor: '#1A1A1A',
    metaColor: '#6B7280',
    ink: '#1A1A1A',
    inkSoft: '#374151',
    line: '#1A1A1A',
    lineSoft: '#D1D5DB',
    serifFont: "'Noto Serif SC', 'Songti SC', 'SimSun', 'STSong', Georgia, serif",

    bodyStyle(c, s, sp, t, font) {
        // 杂志风强制衬线宋体
        return `font-family:${this.serifFont};font-weight:400;font-size:${s.fontSize};line-height:1.95;color:${this.textColor};background-color:${this.canvasBg};padding:48px 28px 56px;text-align:justify;letter-spacing:0.5px;word-break:break-word;`;
    },
    pStyle(c, sp) {
        // 首段缩进 2 字符
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};text-indent:2em;`;
    },
    h1Style(c, s, sp, t) {
        // 居中宋体大字 + 上下双主题色线
        return `font-size:${s.h1Size};font-weight:700;margin:${parseInt(sp.h2MarginTop) + 12}px 0 ${parseInt(sp.h2MarginBottom) + 8}px 0;padding:18px 0;line-height:1.4;text-align:center;color:${this.ink};border-top:2px solid ${c.accent};border-bottom:1px solid ${c.accent};letter-spacing:4px;font-family:${this.serifFont};text-indent:0;`;
    },
    h2Style(c, s, sp, t) {
        // 宋体大字 + 左侧主题色粗竖线（编辑栏式）
        return `font-size:${s.h2Size};font-weight:700;margin:${parseInt(sp.h2MarginTop) + 8}px 0 ${parseInt(sp.h2MarginBottom) + 4}px 0;padding:6px 0 6px 18px;line-height:1.5;color:${this.ink};border-left:5px solid ${c.accent};letter-spacing:2px;font-family:${this.serifFont};text-indent:0;`;
    },
    h2Decor(c) {
        // 标题下方居中圆点装饰（编辑美学）
        return `<span style="display:block;text-align:center;margin-top:8px;color:${this.ink};font-size:10px;letter-spacing:6px;opacity:0.4;">· · ·</span>`;
    },
    blockquoteStyle(c) {
        // 上下双主题色线 + 居中 + 斜体
        return `border-top:1px solid ${c.accent};border-bottom:1px solid ${c.accent};padding:20px 32px;margin:32px 0;text-align:center;color:${this.inkSoft};font-style:italic;font-size:15px;line-height:1.9;font-family:${this.serifFont};`;
    },
    ulStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:28px;position:relative;font-size:15px;font-family:${this.serifFont};text-indent:0;`;
    },
    liIcon(c) {
        // 编辑式短横线跟随主题色
        return `<span style="position:absolute;left:0;top:11px;width:16px;height:1px;background:${c.accent};"></span>`;
    },
    olIcon(c, idx) {
        // 罗马数字跟随主题色
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:13px;font-family:${this.serifFont};letter-spacing:1px;">${toRoman(idx)}.</span>`;
    },
    hrStyle(c) {
        // 居中细线（编辑美学）
        return `border:none;border-top:1px solid ${this.ink};margin:48px auto;width:120px;`;
    },
    codeStyle(c) {
        return `color:${c.accent};background:${c.accentSoft};padding:2px 8px;border-radius:0;font-size:12px;font-family:${fontFamilies.mono};border:1px solid ${c.accentBorder};`;
    },
    preStyle(c) {
        return `background:#F3EFE8;padding:24px 28px;margin:28px 0 8px 0;border:1px solid ${this.lineSoft};border-left:3px solid ${this.ink};border-radius:0;overflow:hidden;font-size:13px;line-height:1.8;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${this.ink};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.ink};color:#FFFFFF;border:0;border-radius:0;padding:4px 12px;font-size:11px;font-weight:500;cursor:pointer;line-height:1.4;font-family:${fontFamilies.mono};`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:2px;font-family:${this.serifFont};font-style:italic;`;
    },
    aStyle(c) {
        return `color:${c.accent};text-decoration:none;border-bottom:1px solid ${c.accent};font-weight:500;`;
    },
    strongStyle(c) {
        return `color:${c.accent};font-weight:700;`;
    },
    emStyle(c) {
        return `color:${this.inkSoft};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 32px 0;letter-spacing:2px;font-family:${this.serifFont};font-style:italic;`;
    },
    // "01 章节标题"格式中数字部分样式：主题色大号粗体居中 + 宋体
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;font-family:${this.serifFont};`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，左侧主题色粗竖线更细，沿用宋体语言
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:600;margin:${parseInt(sp.h2MarginTop) + 6}px 0 ${parseInt(sp.h2MarginBottom) + 2}px 0;padding:4px 0 4px 14px;line-height:1.5;color:${this.ink};border-left:3px solid ${c.accent};letter-spacing:1px;font-family:${this.serifFont};text-indent:0;`;
    },
    // hr 分割线后装饰：圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `· · ·`;
    },
    // 底部名片：米白底 · 上下双主题色线 · 宋体 · § I 罗马分节 · 居中斜体 slogan
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const cardStyle = `margin-top:${sp.pMargin};padding:28px 26px;background:${this.canvasBg};border-top:3px double ${c.accent};border-bottom:3px double ${c.accent};font-family:${this.serifFont};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.ink};`;
        // 分节小标签 § I / § II / § III
        const sectionTag = (roman, label) => `<div style="font-size:11px;color:${c.accent};letter-spacing:3px;margin:14px 0 6px 0;font-style:italic;">§ ${roman} · ${label}</div>`;
        // name 行：粗体 + 稍大字号 + 紧贴小标签
        const nameStyle = `font-size:${parseInt(s.fontSize) + 3}px;font-weight:700;color:${this.ink};letter-spacing:2px;`;
        const titleStyle = `font-size:${parseInt(s.fontSize) - 1}px;color:${this.inkSoft};margin-left:10px;font-style:italic;`;
        // 关注/产出行：宋体文字 + 紧凑行距
        const metaRowStyle = `display:block;margin:4px 0;font-size:${parseInt(s.fontSize) - 1}px;color:${this.inkSoft};line-height:1.7;`;
        const labelStyle = `color:${c.accent};font-weight:600;letter-spacing:1px;`;
        // slogan 居中 + 主题色 + 斜体 + 上下留白
        const sloganStyle = `margin:22px 0 8px 0;text-align:center;font-style:italic;color:${this.ink};font-size:${parseInt(s.fontSize) + 2}px;letter-spacing:1px;line-height:1.7;`;
        const dividerStyle = `border-top:1px solid ${this.lineSoft};margin:18px 0 10px 0;height:0;`;
        // 免责声明：最小字号 + 浅灰 + § 罗马小标记
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:8px;margin:3px 0;font-size:11px;color:#6B7280;line-height:1.7;font-style:italic;`;
        const disclaimerMarkStyle = `flex-shrink:0;color:${c.accent};font-size:10px;letter-spacing:1px;line-height:1.7;opacity:0.7;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += sectionTag('I', 'AUTHOR');
            html += `<div>`;
            if (data.name) html += `<span style="${nameStyle}">${data.name}</span>`;
            if (data.title) html += `<span style="${titleStyle}">${data.title}</span>`;
            html += `</div>`;
        }
        if (data.focus) {
            html += sectionTag('II', 'FOCUS');
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">— </span>${data.focus}</div>`;
        }
        if (data.output) {
            html += sectionTag('III', 'OUTPUT');
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">— </span>${data.output}</div>`;
        }
        if (data.slogan) {
            html += `<div style="${sloganStyle}">${data.slogan}</div>`;
        }
        if (data.disclaimer1 || data.disclaimer2) {
            html += `<div style="${dividerStyle}"></div>`;
        }
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">§</span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">§</span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};

// 罗马数字转换（1-3999）
function toRoman(num) {
    if (num < 1 || num > 3999) return num;
    const map = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [v, s] of map) {
        while (num >= v) { result += s; num -= v; }
    }
    return result;
}
