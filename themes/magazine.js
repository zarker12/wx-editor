window.styleThemes = window.styleThemes || {};

window.styleThemes.magazine = {
    name: '杂志风',
    canvasBg: '#FFFFFF',
    textColor: '#1A1A1A',
    metaColor: '#666666',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:15px;line-height:2.15;color:${this.textColor};background-color:${this.canvasBg};padding:48px 36px 72px;text-align:justify;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};text-indent:2em;`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size + 4}px;font-weight:700;margin:${sp.h2MarginTop + 10} 0 ${sp.h2MarginBottom + 5} 0;text-align:center;color:${c.accentDark};letter-spacing:6px;line-height:1.3;`;
    },
    h2Style(c, s, sp, t) {
        return `font-size:${s.h2Size + 2}px;font-weight:700;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;text-align:center;color:${c.accentDark};letter-spacing:3px;line-height:1.4;`;
    },
    blockquoteStyle(c) {
        return `border-top:1px solid ${c.accent}40;border-bottom:1px solid ${c.accent}40;padding:28px 48px;margin:36px 0;text-align:center;color:${this.metaColor};font-style:italic;font-size:15px;line-height:1.9;`;
    },
    ulStyle(c) { return `margin:20px 0;padding-left:28px;list-style:none;text-indent:0;`; },
    olStyle(c) { return `margin:20px 0;padding-left:28px;list-style:none;text-indent:0;`; },
    liStyle(c) {
        return `margin-bottom:12px;color:${this.textColor};font-size:15px;position:relative;padding-left:16px;text-indent:0;`;
    },
    liIcon(c) {
        return `<span style="position:absolute;left:0;top:8px;color:${c.accent};font-size:6px;">●</span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-weight:600;font-size:13px;">${idx}.</span>`;
    },
    hrStyle(c) {
        return `border:none;text-align:center;margin:48px 0;height:auto;color:${c.accent}80;font-size:18px;letter-spacing:12px;`;
    },
    hrDecor(c) {
        return `· · ·`;
    },
    codeStyle(c) {
        return `color:${c.accentDark};background:${c.accentSoft};padding:2px 8px;border-radius:2px;font-size:13px;font-family:${fontFamilies.mono};`;
    },
    preStyle(c) {
        return `background:#FAFAFA;padding:24px;margin:28px 0 8px 0;border-radius:2px;border:1px solid #EFEFEF;overflow:hidden;font-size:14px;line-height:1.8;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:#333;font-family:${fontFamilies.mono};font-size:14px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.95);border:1px solid #E5E5E5;border-radius:2px;padding:4px 12px;font-size:11px;color:#666;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:#CCC;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-style:italic;`;
    },
    aStyle(c) {
        return `color:${c.accentDark};text-decoration:none;border-bottom:2px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accentDark};font-weight:700;`;
    },
    emStyle(c) {
        return `color:${this.metaColor};font-style:italic;`;
    }
};
