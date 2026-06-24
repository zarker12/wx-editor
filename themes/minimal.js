window.styleThemes = window.styleThemes || {};

window.styleThemes.minimal = {
    name: '极简白',
    canvasBg: '#FFFFFF',
    textColor: '#3D3D3D',
    metaColor: '#8A8A8A',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:40px 32px 60px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.35;text-align:center;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
    },
    h2Style(c, s, sp, t) {
        return `font-size:${s.h2Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;line-height:1.4;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:${t.letterSpacing};`;
    },
    blockquoteStyle(c) {
        return `border-left:2px solid ${c.accent};padding:14px 0 14px 20px;margin:24px 0;color:${this.metaColor};font-size:14px;line-height:1.8;`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:20px;position:relative;`;
    },
    liIcon(c) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-size:12px;">·</span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:500;font-size:12px;">${idx}.</span>`;
    },
    hrStyle(c) {
        return `border:none;height:1px;background:linear-gradient(90deg,transparent,${c.accent}40,transparent);margin:40px auto;width:60%;`;
    },
    codeStyle(c) {
        return `color:${c.accentDark};background:${c.accentSoft};padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:${c.accentSoft};padding:20px 24px;margin:24px 0 8px 0;border-radius:8px;border:1px solid ${c.accentBorder};overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:${this.textColor};font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.9);border:1px solid ${c.accentBorder};border-radius:4px;padding:4px 12px;font-size:11px;color:${c.accentDark};cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${c.accentDark};text-decoration:none;border-bottom:1px solid ${c.accentBorder};`;
    },
    strongStyle(c) {
        return `color:${c.accentDark};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${c.accent};font-style:italic;`;
    }
};
