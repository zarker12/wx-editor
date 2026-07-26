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
        // 主题色渐变色块 + 白字 + 居中（保持深色卡片语言）
        return `font-size:${s.h1Size};font-weight:500;margin:${parseInt(sp.h2MarginTop) + 10}px auto ${parseInt(sp.h2MarginBottom) + 8}px auto;padding:18px 24px;line-height:1.4;text-align:center;color:#FFFFFF;background:${c.gradient};letter-spacing:6px;max-width:80%;`;
    },
    h2Style(c, s, sp, t) {
        // 居中金字 + 上下双主题色线（保持金色文字身份）
        return `font-size:${s.h2Size};font-weight:500;margin:${parseInt(sp.h2MarginTop) + 6}px 0 ${parseInt(sp.h2MarginBottom) + 4}px 0;padding:12px 0;line-height:1.5;text-align:center;color:${this.goldDeep};border-top:1px solid ${c.accent};border-bottom:1px solid ${c.accent};letter-spacing:3px;`;
    },
    h2Decor(c) {
        // 标题下方居中菱形装饰
        return `<span style="display:block;text-align:center;margin-top:10px;color:${this.gold};font-size:9px;letter-spacing:8px;">◆ ◆ ◆</span>`;
    },
    blockquoteStyle(c) {
        // 深色底 + 金字 + 居中斜体（边框跟随主题色）
        return `background:${this.ink};color:${this.gold};padding:24px 32px;margin:32px 0;text-align:center;font-style:italic;font-size:14px;line-height:1.9;border-left:3px solid ${c.accent};border-right:3px solid ${c.accent};`;
    },
    ulStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:20px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
    },
    liIcon(c) {
        // 主题色菱形
        return `<span style="position:absolute;left:0;top:8px;color:${c.accent};font-size:9px;">◆</span>`;
    },
    olIcon(c, idx) {
        // 主题色编号 + 菱形点
        return `<span style="position:absolute;left:0;top:2px;color:${c.accent};font-size:12px;font-weight:500;letter-spacing:1px;">${idx}<span style="color:${c.accent};margin-left:4px;">◆</span></span>`;
    },
    hrStyle(c) {
        // 金色细线 + 居中
        return `border:none;height:1px;background:${this.gold};width:60px;margin:48px auto;`;
    },
    codeStyle(c) {
        return `color:${c.accent};background:${c.accentSoft};border:1px solid ${c.accentBorder};padding:2px 8px;border-radius:2px;font-size:12px;font-family:${fontFamilies.mono};`;
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
        return `color:${c.accent};text-decoration:none;border-bottom:1px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accent};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.goldDeep};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 32px 0;letter-spacing:3px;font-style:italic;`;
    },
    // "01 章节标题"格式中数字部分样式：主题色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，沿用金线语言但只保留下线（主题色）
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:400;margin:${parseInt(sp.h2MarginTop) + 4}px 0 ${parseInt(sp.h2MarginBottom) + 2}px 0;padding:6px 0;line-height:1.5;text-align:center;color:${this.goldDeep};border-bottom:1px solid ${c.accent};letter-spacing:2px;`;
    },
    // hr 分割线后装饰：菱形（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `◆ ◆ ◆`;
    },
    // 底部名片：深底金字 · 金色菱形◆分隔 · 英文小标签 FOCUS/OUTPUT · 居中斜体 slogan
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const cardStyle = `margin-top:${sp.pMargin};padding:26px 24px;background:${this.ink};border-radius:8px;border:1px solid ${c.accent};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.gold};`;
        // name 行：金色菱形◆ + 粗体 + 稍大字号
        const nameRowStyle = `display:flex;align-items:baseline;gap:10px;margin-bottom:8px;`;
        const diamondStyle = `flex-shrink:0;color:${c.accent};font-size:10px;line-height:1;`;
        const nameStyle = `font-size:${parseInt(s.fontSize) + 2}px;font-weight:600;color:${this.gold};letter-spacing:1px;`;
        const titleStyle = `font-size:${parseInt(s.fontSize) - 1}px;color:${this.metaColor};margin-left:6px;`;
        // 关注/产出行：英文小标签 + 字母间距
        const metaRowStyle = `display:flex;align-items:baseline;gap:10px;margin:5px 0 5px 20px;`;
        const labelStyle = `flex-shrink:0;color:${c.accent};font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;`;
        const metaTextStyle = `flex:1;color:${this.gold};font-size:${parseInt(s.fontSize) - 1}px;letter-spacing:0.5px;`;
        // slogan 居中 + 主题色 + 斜体
        const sloganStyle = `margin:18px 0 8px 0;text-align:center;font-style:italic;color:${this.gold};font-size:${parseInt(s.fontSize) + 1}px;letter-spacing:2px;`;
        const dividerStyle = `text-align:center;color:${c.accent};font-size:9px;letter-spacing:8px;margin:16px 0 10px 0;opacity:0.6;`;
        // 免责声明：最小字号 + 浅金 + 金色◆
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:8px;margin:3px 0;font-size:11px;color:${this.metaColor};line-height:1.6;`;
        const disclaimerMarkStyle = `flex-shrink:0;color:${c.accent};font-size:9px;line-height:1.6;opacity:0.7;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${nameRowStyle}"><span style="${diamondStyle}">◆</span>`;
            if (data.name) html += `<span style="${nameStyle}">${data.name}</span>`;
            if (data.title) html += `<span style="${titleStyle}">${data.title}</span>`;
            html += `</div>`;
        }
        if (data.focus) {
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">FOCUS</span><span style="${metaTextStyle}">${data.focus}</span></div>`;
        }
        if (data.output) {
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">OUTPUT</span><span style="${metaTextStyle}">${data.output}</span></div>`;
        }
        if (data.slogan) {
            html += `<div style="${sloganStyle}">${data.slogan}</div>`;
        }
        if (data.disclaimer1 || data.disclaimer2) {
            html += `<div style="${dividerStyle}">◆ ◆ ◆</div>`;
        }
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">◆</span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">◆</span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};
