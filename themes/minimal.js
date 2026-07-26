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
        // 炭灰渐变标题：从深炭灰到中灰，居中
        return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.35;text-align:center;background:linear-gradient(135deg,#1F2937 0%,#6B7280 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
    },
    h2Style(c, s, sp, t) {
        // 小标题：左侧短色块 + 居中渐变
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;text-align:center;background:linear-gradient(135deg,#1F2937 0%,#6B7280 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
    },
    h2Decor(c) {
        // 标题下方居中圆点装饰
        return `<span style="display:block;text-align:center;margin-top:6px;font-size:10px;letter-spacing:6px;color:#D1D5DB;">· · ·</span>`;
    },
    blockquoteStyle(c) {
        return `border-left:3px solid #1F2937;padding:14px 0 14px 20px;margin:24px 0;color:${this.metaColor};font-size:14px;line-height:1.8;background:#FAFAFA;`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:20px;position:relative;`;
    },
    liIcon(c) {
        // 实心圆点
        return `<span style="position:absolute;left:0;top:10px;width:6px;height:6px;background:#1F2937;border-radius:50%;"></span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:#1F2937;font-weight:600;font-size:13px;">${idx}.</span>`;
    },
    hrStyle(c) {
        // 渐变细线
        return `border:none;height:1px;background:linear-gradient(90deg,transparent,#1F2937,transparent);margin:40px auto;width:60%;`;
    },
    codeStyle(c) {
        return `color:#1F2937;background:#F3F4F6;padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};`;
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
        return `color:#1F2937;text-decoration:none;border-bottom:1px solid #1F2937;`;
    },
    strongStyle(c) {
        return `color:#111827;font-weight:600;`;
    },
    emStyle(c) {
        return `color:#1F2937;font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:0.5px;`;
    },
    // "01 章节标题"格式中数字部分样式：炭灰大号粗体居中
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:#1F2937;line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;`;
    },
    // h3 小标题：比 h2 小一号、字重稍轻，沿用渐变语言但更克制（实色替代渐变）
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;text-align:center;color:#1F2937;letter-spacing:${t.letterSpacing};`;
    },
    // hr 分割线后装饰：圆点（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `· · ·`;
    }
};
