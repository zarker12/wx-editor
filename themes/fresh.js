window.styleThemes = window.styleThemes || {};

window.styleThemes.fresh = {
    name: '清新绿',
    canvasBg: '#F8FFFE',
    textColor: '#374151',
    metaColor: '#6B7280',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:2.0;color:${this.textColor};background-color:${this.canvasBg};padding:30px 18px 48px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};padding-bottom:12px;border-bottom:3px solid ${c.accent}30;letter-spacing:${t.letterSpacing};`;
    },
    h2Style(c, s, sp, t) {
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};padding-bottom:8px;border-bottom:2px solid ${c.accent}25;letter-spacing:${t.letterSpacing};`;
    },
    blockquoteStyle(c) {
        return `background:${c.accentSoft};border-left:4px solid ${c.accent};padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;color:${c.accentDark};font-size:14px;`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:24px;position:relative;`;
    },
    liIcon(c) {
        return `<span style="position:absolute;left:0;top:2px;color:${c.accent};font-size:9px;">●</span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:11px;">${idx}.</span>`;
    },
    hrStyle(c) {
        return `border:none;height:2px;background:linear-gradient(90deg,transparent,${c.accent}50,transparent);margin:40px 0;border-radius:1px;`;
    },
    codeStyle(c) {
        return `color:${c.accentDark};background:${c.accentSoft};padding:2px 8px;border-radius:4px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:${c.accentSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:10px;border:1px solid ${c.accent}20;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${c.accentDark};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.9);border:1px solid ${c.accent}30;border-radius:6px;padding:4px 12px;font-size:11px;color:${c.accentDark};cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${c.accent}70;margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${c.accentDark};text-decoration:none;border-bottom:1px solid ${c.accent}40;`;
    },
    strongStyle(c) {
        return `color:${c.accentDark};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${c.accent};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:center;margin:0 0 28px 0;letter-spacing:1px;`;
    }
};
