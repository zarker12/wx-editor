window.styleThemes = window.styleThemes || {};

window.styleThemes.cyber = {
    name: '科技感',
    canvasBg: '#FAFBFC',
    textColor: '#1E293B',
    metaColor: '#64748B',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:1.85;color:${this.textColor};background-color:${this.canvasBg};padding:30px 18px 48px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    h2Style(c, s, sp, t) {
        return `font-size:${s.h2Size};font-weight:600;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;color:${c.accentDark};font-family:${fontFamilies.mono};padding-left:14px;border-left:3px solid ${c.accent};letter-spacing:0.5px;`;
    },
    blockquoteStyle(c) {
        return `background:${c.accentSoft};border-left:3px solid ${c.accent};padding:14px 20px;margin:24px 0;color:#475569;font-size:14px;border-radius:0 6px 6px 0;`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:22px;position:relative;`;
    },
    liIcon(c) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-family:${fontFamilies.mono};font-size:11px;font-weight:600;">▸</span>`;
    },
    olIcon(c, idx) {
        return `<span style="position:absolute;left:0;top:0;color:${c.accent};font-family:${fontFamilies.mono};font-size:11px;font-weight:600;">${String(idx).padStart(2,'0')}</span>`;
    },
    hrStyle(c) {
        return `border:none;height:1px;background:linear-gradient(90deg,transparent,${c.accent},transparent);margin:36px 0;`;
    },
    codeStyle(c) {
        return `color:${c.accentDark};background:${c.accentSoft};padding:2px 6px;border-radius:3px;font-size:12px;font-family:${fontFamilies.mono};border:1px solid ${c.accentBorder};`;
    },
    preStyle(c) {
        return `background:#0F172A;padding:20px 24px;margin:24px 0 8px 0;border-radius:8px;border:1px solid #1E293B;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:#E2E8F0;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:rgba(30,41,59,0.9);border:1px solid #334155;border-radius:4px;padding:4px 12px;font-size:11px;color:#94A3B8;cursor:pointer;line-height:1.4;font-family:${fontFamilies.mono};`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:#64748B;margin:8px 0 0 0;padding:0;letter-spacing:2px;font-family:${fontFamilies.mono};`;
    },
    aStyle(c) {
        return `color:${c.accentDark};text-decoration:none;border-bottom:1px dashed ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accentDark};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${c.accent};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:13px;color:${this.metaColor};text-align:left;margin:0 0 24px 0;font-family:${fontFamilies.mono};letter-spacing:1px;`;
    }
};
