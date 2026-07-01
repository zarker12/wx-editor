window.styleThemes = window.styleThemes || {};

window.styleThemes.luxury = {
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
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 32px 0;letter-spacing:3px;font-style:italic;`;
    }
};
