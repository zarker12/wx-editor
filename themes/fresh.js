window.styleThemes = window.styleThemes || {};

// 05 清新绿：浅绿底 · 绿色圆点 · 自然清新 · 圆角卡片
window.styleThemes.fresh = {
    name: '清新绿',
    canvasBg: '#F0FDF4',
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
        // 居中深绿大字
        return `font-size:${s.h1Size};font-weight:700;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:8px 0;line-height:1.4;text-align:center;color:${this.greenDeep};letter-spacing:2px;`;
    },
    h2Style(c, s, sp, t) {
        // 浅绿底圆角卡片 + 绿色字
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:10px 18px;line-height:1.5;color:${this.greenDeep};background:${this.greenSoft};border-radius:10px;letter-spacing:1px;`;
    },
    h2Decor(c) {
        // 标题下方圆点装饰
        return `<span style="display:block;text-align:center;margin-top:8px;color:${this.greenLight};font-size:8px;letter-spacing:6px;">● ● ●</span>`;
    },
    blockquoteStyle(c) {
        // 浅绿底圆角卡片 + 左绿色边
        return `background:${this.greenSoft};border-left:4px solid ${this.green};border-radius:8px;padding:14px 18px;margin:24px 0;color:${this.greenDeep};font-size:14px;line-height:1.8;`;
    },
    ulStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:18px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};padding-left:24px;position:relative;font-size:15px;`;
    },
    liIcon(c) {
        // 绿色实心圆点
        return `<span style="position:absolute;left:0;top:9px;width:8px;height:8px;background:${this.green};border-radius:50%;"></span>`;
    },
    olIcon(c, idx) {
        // 绿色圆形数字（圆形背景）
        return `<span style="position:absolute;left:0;top:1px;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${this.green};color:#FFFFFF;font-size:11px;font-weight:600;border-radius:50%;">${idx}</span>`;
    },
    hrStyle(c) {
        // 渐变绿色细线
        return `border:none;height:2px;background:linear-gradient(90deg,transparent,${this.greenLight},transparent);margin:36px auto;width:50%;border-radius:1px;`;
    },
    codeStyle(c) {
        return `color:${this.greenDeep};background:${this.greenSoft};padding:2px 8px;border-radius:6px;font-size:12px;font-family:${fontFamilies.mono};`;
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
        return `color:${this.greenDeep};text-decoration:none;border-bottom:1px solid ${this.greenLight};`;
    },
    strongStyle(c) {
        return `color:${this.greenDeep};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.green};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    // "01 章节标题"格式中数字部分样式：绿色大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${this.green};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，去掉卡片底色更克制，仅保留下边线
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:4px 0 8px 0;line-height:1.5;color:${this.greenDeep};border-bottom:2px solid ${this.greenBorder};letter-spacing:1px;`;
    },
    // hr 分割线后装饰：实心圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `● ● ●`;
    },
    // 底部名片：浅绿底绿边 · 深绿文字 · 圆点分隔 · 居中绿色 slogan
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s;
        const cardStyle = `margin-top:${sp.pMargin};padding:20px 18px;background:${this.canvasBg};border-radius:12px;border:1px solid ${this.greenBorder};font-family:${ctx.font};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.greenDeep};`;
        const rowStyle = `display:flex;align-items:center;gap:6px;margin-bottom:6px;`;
        const iconStyle = `flex-shrink:0;width:20px;text-align:center;font-size:15px;`;
        const textStyle = `flex:1;color:${this.greenDeep};`;
        const sepStyle = `color:${this.green};flex-shrink:0;`;
        const labelStyle = `color:${this.green};flex-shrink:0;font-size:13px;`;
        const sloganStyle = `margin:12px 0;text-align:center;color:${this.green};font-size:${s.fontSize};font-weight:500;`;
        const dividerStyle = `text-align:center;color:${this.greenLight};font-size:8px;letter-spacing:6px;margin:12px 0;`;
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:6px;margin-bottom:4px;font-size:12px;color:${this.green};line-height:1.6;`;
        let html = `<div style="${cardStyle}">`;
        if (data.name || data.title) {
            html += `<div style="${rowStyle}"><span style="${iconStyle}">🧔</span><span style="${textStyle}"><strong>${data.name}</strong> <span style="${sepStyle}">●</span> ${data.title}</span></div>`;
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
        html += `<div style="${dividerStyle}">● ● ●</div>`;
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
