window.styleThemes = window.styleThemes || {};

// 05 清新绿：白色画布 · 绿色点缀 · 自然清新 · 圆角卡片
window.styleThemes.fresh = {
    name: '清新绿',
    canvasBg: '#FFFFFF',
    textColor: '#1F2937',
    metaColor: '#15803D',
    green: '#15803D',
    greenDeep: '#166534',
    greenLight: '#22C55E',
    greenSoft: '#DCFCE7',
    greenBorder: '#BBF7D0',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:32px 24px 48px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 居中主题色深色大字
        return `font-size:${s.h1Size};font-weight:700;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:8px 0;line-height:1.4;text-align:center;color:${c.accentDark};letter-spacing:2px;`;
    },
    h2Style(c, s, sp, t) {
        // 主题色软底圆角卡片 + 主题色深字
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:10px 18px;line-height:1.5;color:${c.accentDark};background:${c.accentSoft};border-radius:10px;letter-spacing:1px;`;
    },
    h2Decor(c) {
        // 标题下方圆点装饰
        return `<span style="display:block;text-align:center;margin-top:8px;color:${this.greenLight};font-size:8px;letter-spacing:6px;">● ● ●</span>`;
    },
    blockquoteStyle(c) {
        // 主题色软底圆角卡片 + 左主题色边
        return `background:${c.accentSoft};border-left:4px solid ${c.accent};border-radius:8px;padding:14px 18px;margin:24px 0;color:${c.accentDark};font-size:14px;line-height:1.8;`;
    },
    ulStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
    },
    liIcon(c) {
        // 主题色实心圆点
        return `<span style="position:absolute;left:0;top:9px;width:8px;height:8px;background:${c.accent};border-radius:50%;"></span>`;
    },
    olIcon(c, idx) {
        // 主题色圆形数字（圆形背景）
        return `<span style="position:absolute;left:0;top:1px;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:600;border-radius:50%;">${idx}</span>`;
    },
    hrStyle(c) {
        // 渐变绿色细线
        return `border:none;height:2px;background:linear-gradient(90deg,transparent,${this.greenLight},transparent);margin:36px auto;width:50%;border-radius:1px;`;
    },
    codeStyle(c) {
        return `color:${c.accentDark};background:${c.accentSoft};padding:2px 8px;border-radius:6px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:${this.greenSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:10px;border:1px solid ${this.greenBorder};overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${this.textColor};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.green};color:#FFFFFF;border:0;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:500;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${c.accent};text-decoration:none;border-bottom:1px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accent};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.green};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    // "01 章节标题"格式中数字部分样式：主题色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，去掉卡片底色更克制，仅保留下边线
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:4px 0 8px 0;line-height:1.5;color:${c.accentDark};border-bottom:2px solid ${c.accentBorder};letter-spacing:1px;`;
    },
    // hr 分割线后装饰：实心圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `● ● ●`;
    },
    // 底部名片：白底主题色边 · 主题色圆点● name · 英文小标签 · 圆角卡片
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const cardStyle = `margin-top:${sp.pMargin};padding:22px 20px;background:${this.canvasBg};border-radius:12px;border:1px solid ${c.accentBorder};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${c.accentDark};`;
        // name 行：主题色圆点● + 粗体 + 稍大字号
        const nameRowStyle = `display:flex;align-items:center;gap:8px;margin-bottom:8px;`;
        const dotStyle = `flex-shrink:0;display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.accent};`;
        const nameStyle = `font-size:${parseInt(s.fontSize) + 2}px;font-weight:600;color:${c.accentDark};`;
        const titleStyle = `font-size:${parseInt(s.fontSize) - 1}px;color:${c.accent};margin-left:6px;`;
        // 关注/产出行：英文小标签 + 圆点前缀
        const metaRowStyle = `display:flex;align-items:baseline;gap:8px;margin:4px 0 4px 16px;`;
        const labelStyle = `flex-shrink:0;color:${c.accent};font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;`;
        const metaTextStyle = `flex:1;color:${c.accentDark};font-size:${parseInt(s.fontSize) - 1}px;`;
        // slogan 居中 + 主题色 + 斜体
        const sloganStyle = `margin:14px 0 6px 0;text-align:center;color:${c.accent};font-size:${s.fontSize};font-weight:500;font-style:italic;`;
        const dividerStyle = `text-align:center;color:${c.accentLight};font-size:8px;letter-spacing:6px;margin:12px 0;`;
        // 免责声明：最小字号 + 浅色 + 主题色圆点
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:8px;margin:3px 0;font-size:11px;color:${c.accent};line-height:1.6;opacity:0.8;`;
        const disclaimerMarkStyle = `flex-shrink:0;display:inline-block;width:4px;height:4px;border-radius:50%;background:${c.accent};margin-top:7px;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${nameRowStyle}"><span style="${dotStyle}"></span>`;
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
            html += `<div style="${dividerStyle}">● ● ●</div>`;
        }
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}"></span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}"></span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};
