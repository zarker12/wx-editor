window.styleThemes = window.styleThemes || {};

// 03 科技感：青色线条 · 等宽字体 · 终端式 · 方块编号
window.styleThemes.cyber = {
    name: '科技感',
    canvasBg: '#F8FAFC',
    textColor: '#1F2937',
    metaColor: '#64748B',
    cyan: '#0891B2',
    cyanDeep: '#0E7490',
    cyanSoft: '#ECFEFF',
    cyanBorder: '#CFFAFE',
    terminalBg: '#0F172A',

    bodyStyle(c, s, sp, t, font) {
        // 强制等宽字体作为科技感识别符号
        return `font-family:${fontFamilies.mono};font-weight:400;font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:32px 20px 48px;letter-spacing:0;word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 等宽字 + 左侧青色色块 + // 前缀
        return `font-size:${s.h1Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:6px 0 6px 16px;line-height:1.4;color:#0F172A;border-left:4px solid ${this.cyan};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    h2Style(c, s, sp, t) {
        // 等宽字 + // 前缀 + 下方青色横线
        return `font-size:${s.h2Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:8px 0 8px 16px;line-height:1.5;color:#0F172A;border-left:4px solid ${this.cyan};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    h2Decor(c) {
        // 标题下方"代码注释"风格横线
        return `<span style="display:block;height:1px;background:${this.cyanBorder};margin-top:6px;"></span><span style="display:block;margin-top:6px;color:${this.cyan};font-size:11px;font-family:${fontFamilies.mono};letter-spacing:1px;">// ──────────</span>`;
    },
    blockquoteStyle(c) {
        // 浅青底 + 左青色实色边 + 等宽字
        return `background:${this.cyanSoft};border-left:3px solid ${this.cyan};padding:14px 18px;margin:24px 0;color:${this.cyanDeep};font-size:13px;line-height:1.8;font-family:${fontFamilies.mono};`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:24px;position:relative;font-family:${fontFamilies.mono};font-size:14px;`;
    },
    liIcon(c) {
        // 方块符号
        return `<span style="position:absolute;left:0;top:8px;color:${this.cyan};font-size:12px;">▪</span>`;
    },
    olIcon(c, idx) {
        // 青色方块背景 + 白字编号
        return `<span style="position:absolute;left:0;top:1px;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${this.cyan};color:#FFFFFF;font-size:11px;font-weight:600;border-radius:2px;">${idx}</span>`;
    },
    hrStyle(c) {
        // 虚线分割
        return `border:none;border-top:1px dashed ${this.cyan};margin:36px auto;width:80%;`;
    },
    codeStyle(c) {
        return `color:${this.cyanDeep};background:${this.cyanSoft};padding:2px 6px;border-radius:2px;font-size:12px;font-family:${fontFamilies.mono};border:1px solid ${this.cyanBorder};`;
    },
    preStyle(c) {
        // 终端式深色底
        return `background:${this.terminalBg};padding:36px 20px 20px 20px;margin:24px 0 8px 0;border-radius:8px;border:1px solid #1E293B;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:#E2E8F0;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    preDecor(c) {
        // mac 终端三圆点
        return `<span style="position:absolute;top:14px;left:16px;font-size:0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:6px;"></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:6px;"></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;"></span></span>`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;padding:4px 12px;font-size:11px;color:#94A3B8;cursor:pointer;line-height:1.4;font-family:${fontFamilies.mono};`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;font-family:${fontFamilies.mono};`;
    },
    aStyle(c) {
        return `color:${this.cyanDeep};text-decoration:none;border-bottom:1px solid ${this.cyan};`;
    },
    strongStyle(c) {
        return `color:#0F172A;font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.cyan};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;font-family:${fontFamilies.mono};`;
    },
    // "01 章节标题"格式中数字部分样式：青色大号粗体居中 + 等宽字
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${this.cyan};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;font-family:${fontFamilies.mono};`;
    },
    // h3 小标题：比 h2 小一号、左侧青线更细，沿用等宽字语言
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:6px 0 6px 14px;line-height:1.5;color:#0F172A;border-left:3px solid ${this.cyan};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    // hr 分割线后装饰：代码注释风格横线（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `// ─ ─ ─`;
    }
};
