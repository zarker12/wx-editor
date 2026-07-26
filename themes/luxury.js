window.styleThemes = window.styleThemes || {};

// 02 黑金奢：金色点缀 · 居中斜体引用 · 深色底 · 菱形符号
window.styleThemes.luxury = {
    name: '黑金奢',
    canvasBg: '#FEFDFB',         // 米白主底，保证阅读舒适
    textColor: '#2A2A2A',
    metaColor: '#9A8A6A',
    // 主题固定主色（金色），不再跟随用户主题色
    gold: '#C9A961',
    goldDeep: '#A88A48',
    ink: '#1A1A1D',               // 墨黑

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:2.0;color:${this.textColor};background-color:${this.canvasBg};padding:40px 24px 56px;text-align:justify;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 深色色块 + 金色大字 + 居中
        return `font-size:${s.h1Size};font-weight:500;margin:${parseInt(sp.h2MarginTop) + 10}px auto ${parseInt(sp.h2MarginBottom) + 8}px auto;padding:18px 24px;line-height:1.4;text-align:center;color:${this.gold};background:${this.ink};letter-spacing:6px;max-width:80%;`;
    },
    h2Style(c, s, sp, t) {
        // 居中金色字 + 上下双金线
        return `font-size:${s.h2Size};font-weight:500;margin:${parseInt(sp.h2MarginTop) + 6}px 0 ${parseInt(sp.h2MarginBottom) + 4}px 0;padding:12px 0;line-height:1.5;text-align:center;color:${this.goldDeep};border-top:1px solid ${this.gold};border-bottom:1px solid ${this.gold};letter-spacing:3px;`;
    },
    h2Decor(c) {
        // 标题下方居中菱形装饰
        return `<span style="display:block;text-align:center;margin-top:10px;color:${this.gold};font-size:9px;letter-spacing:8px;">◆ ◆ ◆</span>`;
    },
    blockquoteStyle(c) {
        // 深色底 + 金字 + 居中斜体
        return `background:${this.ink};color:${this.gold};padding:24px 32px;margin:32px 0;text-align:center;font-style:italic;font-size:14px;line-height:1.9;border-left:3px solid ${this.gold};border-right:3px solid ${this.gold};`;
    },
    ulStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
    },
    liIcon(c) {
        // 金色菱形
        return `<span style="position:absolute;left:0;top:8px;color:${this.gold};font-size:9px;">◆</span>`;
    },
    olIcon(c, idx) {
        // 金色编号 + 菱形点
        return `<span style="position:absolute;left:0;top:2px;color:${this.goldDeep};font-size:12px;font-weight:500;letter-spacing:1px;">${idx}<span style="color:${this.gold};margin-left:4px;">◆</span></span>`;
    },
    hrStyle(c) {
        // 金色细线 + 居中
        return `border:none;height:1px;background:${this.gold};width:60px;margin:48px auto;`;
    },
    codeStyle(c) {
        return `color:${this.goldDeep};background:#FAF5E8;border:1px solid ${this.gold}40;padding:2px 8px;border-radius:2px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:#FFFDF6;padding:24px;margin:28px 0 8px 0;border:1px solid ${this.gold}30;border-top:2px solid ${this.gold};border-radius:2px;overflow:hidden;font-size:13px;line-height:1.8;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:#3D3D3D;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.gold};color:${this.ink};border:0;border-radius:2px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.gold}90;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-style:italic;`;
    },
    aStyle(c) {
        return `color:${this.goldDeep};text-decoration:none;border-bottom:1px solid ${this.gold};`;
    },
    strongStyle(c) {
        return `color:${this.ink};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.goldDeep};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 32px 0;letter-spacing:3px;font-style:italic;`;
    },
    // "01 章节标题"格式中数字部分样式：金色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${this.gold};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，沿用金线语言但只保留下线
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:400;margin:${parseInt(sp.h2MarginTop) + 4}px 0 ${parseInt(sp.h2MarginBottom) + 2}px 0;padding:6px 0;line-height:1.5;text-align:center;color:${this.goldDeep};border-bottom:1px solid ${this.gold};letter-spacing:2px;`;
    },
    // hr 分割线后装饰：菱形（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `◆ ◆ ◆`;
    },
    // 底部名片：深色底金边 · 金字菱形分隔 · 居中斜体 slogan
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s;
        const cardStyle = `margin-top:${sp.pMargin};padding:24px 22px;background:${this.ink};border-radius:8px;border:1px solid ${this.gold};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.gold};`;
        const rowStyle = `display:flex;align-items:center;gap:6px;margin-bottom:8px;`;
        const iconStyle = `flex-shrink:0;width:20px;text-align:center;font-size:15px;`;
        const textStyle = `flex:1;color:${this.gold};`;
        const sepStyle = `color:${this.gold};flex-shrink:0;`;
        const labelStyle = `color:#8B7355;flex-shrink:0;font-size:13px;letter-spacing:1px;`;
        const sloganStyle = `margin:14px 0;text-align:center;font-style:italic;color:${this.gold};font-size:${s.fontSize};letter-spacing:2px;`;
        const dividerStyle = `text-align:center;color:${this.gold};font-size:9px;letter-spacing:8px;margin:14px 0;opacity:0.7;`;
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:6px;margin-bottom:4px;font-size:12px;color:#8B7355;line-height:1.6;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${rowStyle}"><span style="${iconStyle}">🧔</span><span style="${textStyle}"><strong>${data.name}</strong> <span style="${sepStyle}">◆</span> ${data.title}</span></div>`;
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
        html += `<div style="${dividerStyle}">◆ ◆ ◆</div>`;
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${iconStyle};font-size:13px;">⚠️</span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${iconStyle};font-size:13px;">📋</span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};
