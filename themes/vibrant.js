window.styleThemes = window.styleThemes || {};

// 06 活力橙：暖橙渐变 · 温暖明快 · 圆角卡片 · 橙色下划线
window.styleThemes.vibrant = {
    name: '活力橙',
    canvasBg: '#FFF7ED',
    textColor: '#1F2937',
    metaColor: '#C2410C',
    orange: '#FF6B35',
    orangeLight: '#FF8C42',
    orangeDeep: '#E85D04',
    orangeSoft: '#FFE8D6',
    orangeBorder: '#FED7AA',
    orangeGradient: 'linear-gradient(135deg,#FF6B35 0%,#FF8C42 100%)',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:32px 24px 48px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 橙色渐变文字 + 居中
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:8px 0;line-height:1.4;text-align:center;background:${this.orangeGradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;`;
    },
    h2Style(c, s, sp, t) {
        // 橙色字 + 下方橙色实线下划线
        return `font-size:${s.h2Size};font-weight:700;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:6px 0 10px 0;line-height:1.5;color:${this.orangeDeep};border-bottom:3px solid ${this.orange};display:inline-block;letter-spacing:1px;`;
    },
    h2Decor(c) {
        // 标题下方圆点装饰
        return `<span style="display:block;text-align:center;margin-top:8px;color:${this.orangeLight};font-size:8px;letter-spacing:6px;">● ● ●</span>`;
    },
    blockquoteStyle(c) {
        // 浅橙底圆角卡片 + 左橙色边
        return `background:${this.orangeSoft};border-left:4px solid ${this.orange};border-radius:10px;padding:14px 18px;margin:24px 0;color:${this.orangeDeep};font-size:14px;line-height:1.8;`;
    },
    ulStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
    },
    liIcon(c) {
        // 橙色实心圆点
        return `<span style="position:absolute;left:0;top:9px;width:8px;height:8px;background:${this.orange};border-radius:50%;"></span>`;
    },
    olIcon(c, idx) {
        // 橙色渐变圆形数字
        return `<span style="position:absolute;left:0;top:1px;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${this.orangeGradient};color:#FFFFFF;font-size:11px;font-weight:600;border-radius:50%;">${idx}</span>`;
    },
    hrStyle(c) {
        // 渐变橙色细线
        return `border:none;height:2px;background:linear-gradient(90deg,transparent,${this.orange},transparent);margin:36px auto;width:50%;border-radius:1px;`;
    },
    codeStyle(c) {
        return `color:${this.orangeDeep};background:${this.orangeSoft};padding:2px 8px;border-radius:6px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:${this.orangeSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:10px;border:1px solid ${this.orangeBorder};overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${this.textColor};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.orange};color:#FFFFFF;border:0;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${this.orangeDeep};text-decoration:none;border-bottom:1px solid ${this.orange};`;
    },
    strongStyle(c) {
        return `color:${this.orangeDeep};font-weight:700;`;
    },
    emStyle(c) {
        return `color:${this.orange};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    // "01 章节标题"格式中数字部分样式：橙色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${this.orange};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，下划线更细更柔
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:4px 0 6px 0;line-height:1.5;color:${this.orangeDeep};border-bottom:2px solid ${this.orangeLight};display:inline-block;letter-spacing:1px;`;
    },
    // hr 分割线后装饰：实心圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `● ● ●`;
    },
    // 底部名片：浅橙底 · 橙色渐变左边框 · 渐变标题条 · 渐变 slogan · 橙色虚线分隔
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s;
        const cardStyle = `margin-top:${sp.pMargin};padding:20px 18px;background:${this.canvasBg};border-radius:12px;border-left:4px solid ${this.orange};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.orangeDeep};`;
        const titleBarStyle = `background:${this.orangeGradient};border-radius:8px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;`;
        const rowStyle = `display:flex;align-items:center;gap:6px;margin-bottom:6px;`;
        const iconStyle = `flex-shrink:0;width:20px;text-align:center;font-size:15px;`;
        const textStyle = `flex:1;color:${this.orangeDeep};`;
        const labelStyle = `color:${this.orange};flex-shrink:0;font-size:13px;`;
        const sloganStyle = `margin:14px 0;text-align:center;background:${this.orangeGradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;font-size:${parseInt(s.fontSize) + 2}px;`;
        const dividerStyle = `border-top:1px dashed ${this.orangeBorder};margin:12px 0;height:0;`;
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:6px;margin-bottom:4px;font-size:12px;color:${this.orange};line-height:1.6;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${titleBarStyle}"><span style="flex-shrink:0;font-size:15px;">🧔</span><span style="flex:1;color:#FFFFFF;font-weight:600;">${data.name}${data.title ? ` <span style="opacity:0.85;">●</span> ${data.title}` : ''}</span></div>`;
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
};
