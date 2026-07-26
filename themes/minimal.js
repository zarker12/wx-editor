window.styleThemes = window.styleThemes || {};

// 01 极简白：渐变标题 · 清爽留白 · 炭灰主色 · 圆点列表
window.styleThemes.minimal = {
    name: '极简白',
    canvasBg: '#FFFFFF',
    textColor: '#3D3D3D',
    metaColor: '#8A8A8A',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:32px 20px 48px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 渐变标题跟随主题色：居中
        return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.35;text-align:center;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
    },
    h2Style(c, s, sp, t) {
        // 小标题：左侧主题色细边 + 炭灰文字（保持极简留白）
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;text-align:left;color:${this.textColor};border-left:3px solid ${c.accentBorder};padding-left:12px;letter-spacing:${t.letterSpacing};`;
    },
    h2Decor(c) {
        // 标题下方居中圆点装饰
        return `<span style="display:block;text-align:center;margin-top:6px;font-size:10px;letter-spacing:6px;color:#D1D5DB;">· · ·</span>`;
    },
    blockquoteStyle(c) {
        return `border-left:3px solid ${c.accent};padding:14px 0 14px 20px;margin:24px 0;color:${this.metaColor};font-size:14px;line-height:1.8;background:${c.accentSoft};`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:20px;position:relative;`;
    },
    liIcon(c) {
        // 实心圆点跟随主题色
        return `<span style="position:absolute;left:0;top:10px;width:6px;height:6px;background:${c.accent};border-radius:50%;"></span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:13px;">${idx}.</span>`;
    },
    hrStyle(c) {
        // 渐变细线
        return `border:none;height:1px;background:linear-gradient(90deg,transparent,#1F2937,transparent);margin:40px auto;width:60%;`;
    },
    codeStyle(c) {
        return `color:${c.accent};background:${c.accentSoft};padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:#F9FAFB;padding:20px 24px;margin:24px 0 8px 0;border-radius:8px;border:1px solid #E5E7EB;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${this.textColor};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:4px;padding:4px 12px;font-size:11px;color:#1F2937;cursor:pointer;line-height:1.4;`;
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
        return `color:#1F2937;font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:0.5px;`;
    },
    // "01 章节标题"格式中数字部分样式：主题色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，左侧主题色细边更克制
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;text-align:left;color:${this.textColor};border-left:2px solid ${c.accentBorder};padding-left:10px;letter-spacing:${t.letterSpacing};`;
    },
    // hr 分割线后装饰：圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `· · ·`;
    },
    // 底部名片：白底浅灰边框 · 主题色竖线 name · 英文小标签 FOCUS/OUTPUT · 极简留白
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const cardStyle = `margin-top:${sp.pMargin};padding:22px 20px;background:#FFFFFF;border-radius:8px;border:1px solid ${c.accentBorder};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:#1F2937;`;
        // name 行：左侧主题色竖线 + 粗体 + 稍大字号
        const nameRowStyle = `border-left:3px solid ${c.accent};padding-left:12px;margin-bottom:6px;`;
        const nameStyle = `font-size:${parseInt(s.fontSize) + 2}px;font-weight:600;color:${c.accent};`;
        const titleStyle = `font-size:${parseInt(s.fontSize) - 1}px;color:#8A8A8A;margin-left:8px;`;
        // 关注/产出行：英文小标签 + 字母间距
        const metaRowStyle = `display:flex;align-items:baseline;gap:8px;margin:4px 0 4px 15px;`;
        const labelStyle = `flex-shrink:0;color:${c.accent};font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;`;
        const metaTextStyle = `flex:1;color:#4B5563;font-size:${parseInt(s.fontSize) - 1}px;`;
        // slogan 居中 + 主题色 + 斜体
        const sloganStyle = `margin:14px 0 6px 0;text-align:center;font-style:italic;color:${c.accent};font-size:${s.fontSize};font-weight:500;letter-spacing:0.5px;`;
        const dividerStyle = `height:1px;background:${c.accentBorder};margin:12px 0 8px 0;`;
        // 免责声明：最小字号 + 浅灰 + 主题色竖线
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:8px;margin:3px 0;font-size:11px;color:#9CA3AF;line-height:1.6;`;
        const disclaimerMarkStyle = `flex-shrink:0;color:${c.accent};font-size:10px;line-height:1.6;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${nameRowStyle}">`;
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
            html += `<div style="${dividerStyle}"></div>`;
        }
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">|</span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">|</span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};
