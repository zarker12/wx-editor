window.styleThemes = window.styleThemes || {};

// 05 清新绿：白色画布 · 绿色点缀 · 自然清新 · 圆角卡片
// 注：按用户要求 canvasBg 改为 #FFFFFF（与极简白一致），主题色只影响其他元素
window.styleThemes.fresh = {
    name: '清新绿',
    defaultColor: 'emerald',
    defaultFont: 'sans',
    canvasBg: '#FFFFFF',
    textColor: '#3D4F3D',
    metaColor: '#16A34A',
    green: '#22C55E',
    greenDeep: '#15803D',
    greenLight: '#86EFAC',
    greenSoft: '#DCFCE7',
    greenBorder: '#BBF7D0',

    defaultIntro: {
        name: '作者名',
        title: '一句话简介，如：自然生活家 · 内容创作者',
        focus: '自然生活 ｜ 健康饮食 ｜ 旅行探索',
        output: '生活指南 ＋ 美食分享 ＋ 旅行日志',
        slogan: '生活不止眼前的苟且，还有诗和远方。关注我，一起发现生活的美好',
        disclaimer1: '生活感悟，个人观点',
        disclaimer2: '内容仅供参考，请结合自身情况'
    },

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;color:${c.accentDark};`;
    },
    h2Style(c, s, sp, t) {
        return `margin:36px 0 18px;padding:12px 16px;background:${c.accentSoft};border-left:4px solid ${c.accent};border-radius:0 10px 10px 0;`;
    },
    h2Decor(c) {
        return `<section style="display:flex;align-items:center;margin-bottom:4px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.accent};margin-right:10px;"><span leaf=""><br></span></span><span style="font-size:11px;color:#16A34A;letter-spacing:2px;font-weight:600;"><span leaf="">SECTION 01</span></span></section>`;
    },
    h2NumberStyle(c) {
        return `display:inline-block;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;margin-right:10px;letter-spacing:1px;`;
    },
    h2TitleStyle(c, s, sp, t) {
        return `font-size:19px;font-weight:800;color:${c.accentDark};line-height:1.4;letter-spacing:0.5px;margin:0;`;
    },
    blockquoteStyle(c) {
        return `margin:0 0 24px;padding:14px 18px;border-left:4px solid ${c.accent};background:${c.accentSoft};border-radius:0 12px 12px 0;font-size:15px;line-height:1.9;color:${this.textColor};`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:18px 20px;background:#FFFFFF;border-radius:12px;box-shadow:0 2px 10px -4px rgba(34,197,94,0.1);`; },
    olStyle(c) { return `margin:0 0 24px;padding:18px 20px;background:#FFFFFF;border-radius:12px;box-shadow:0 2px 10px -4px rgba(34,197,94,0.1);`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:12px;`;
    },
    liIcon(c) {
        return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.accent};margin:9px 12px 0 0;flex-shrink:0;border:2px solid ${c.accentBorder};"><span leaf=""><br></span></span>`;
    },
    olIcon(c, idx) {
        return `<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:700;border-radius:50%;margin-right:10px;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        return `text-align:center;margin:32px 0;`;
    },
    hrDecor(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:50px;background:${c.accentBorder};margin-right:12px;"><span leaf=""><br></span></span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accent};margin:0 4px;"><span leaf=""><br></span></span><span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:${c.accentLight};margin:0 4px;"><span leaf=""><br></span></span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accent};margin:0 4px;"><span leaf=""><br></span></span><span style="height:1px;width:50px;background:${c.accentBorder};margin-left:12px;"><span leaf=""><br></span></span></section>`;
    },
    codeStyle(c) {
        return `background:${c.accentSoft};color:${c.accentDark};padding:2px 6px;border-radius:4px;font-family:${fontFamilies.mono};font-size:14px;`;
    },
    preStyle(c) {
        return `margin:0 0 22px;border-radius:10px;overflow:hidden;background:#FFFFFF;border:1px solid ${c.accentBorder};border-left:3px solid ${c.accent};`;
    },
    preHeaderCodeStyle(c) {
        return `padding:8px 14px;border-bottom:1px solid ${c.accentBorder};background:${c.accentSoft};font-size:12px;color:${c.accentDark};font-family:${fontFamilies.mono};letter-spacing:1px;font-weight:600;`;
    },
    preCodeStyle(c) {
        return `padding:12px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:${this.textColor};white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${c.accent};color:#FFFFFF;border:0;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${c.accentDark};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${c.accentDark};font-weight:600;border-bottom:1px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accentDark};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${c.accent};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${c.accentDark};text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    keywordStyle(c) {
        return `border-bottom:2px solid ${c.accentLight};font-weight:600;color:${c.accentDark};`;
    },
    sectionTagStyle(c) {
        return `display:inline-block;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:700;padding:3px 12px;border-radius:12px;margin-right:8px;letter-spacing:1px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:8px 0;font-size:${parseInt(s.h2Size) - 1}px;font-weight:600;color:${c.accentDark};line-height:1.5;letter-spacing:0.5px;border-bottom:2px solid ${c.accentBorder};`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 0 14px;font-size:15px;font-weight:700;color:${c.accentDark};line-height:1.5;`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border-radius:12px;padding:6px;border:1px solid ${c.accentBorder};box-shadow:0 4px 12px -2px rgba(34,197,94,0.1);margin-bottom:8px;`;
    },
    imageStyle(c) {
        return `max-width:100%;height:auto;display:block;border-radius:8px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:#16A34A;text-align:center;margin:0 0 24px 0;`;
    },
    endDecorStyle(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:${c.accentBorder};margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:11px;color:${c.accentDark};letter-spacing:4px;font-weight:600;"><span leaf="">END</span></span><span style="height:1px;width:48px;background:${c.accentBorder};margin-left:16px;"><span leaf=""><br></span></span></section>`;
    },
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:#FFFFFF;border-left:4px solid ${c.accent};border-radius:0 16px 16px 0;box-shadow:0 6px 20px -6px rgba(34,197,94,0.2);text-align:center;font-family:${font};`;
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${c.accent} 0%,${c.accentLight} 100%);margin:0 0 14px;line-height:56px;text-align:center;box-shadow:0 6px 16px -2px rgba(34,197,94,0.4);`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:Georgia,serif;`;
        const nameStyle = `font-size:17px;font-weight:800;color:${c.accentDark};margin:0 0 8px;letter-spacing:1px;`;
        const titleStyle = `font-size:13px;color:#16A34A;margin:0 0 16px;letter-spacing:0.5px;font-style:italic;`;
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accent};margin:0 6px;`;
        const decoLineStyle = `height:1.5px;width:28px;background:${c.accentBorder};`;
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
        const focusLabelStyle = `color:${c.accent};font-weight:700;`;
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
        const outputLabelStyle = `color:${c.accent};font-weight:700;`;
        const sloganStyle = `font-size:12px;color:${c.accentDark};margin:0 0 4px;line-height:1.8;font-weight:500;`;
        const disclaimerStyle = `font-size:11px;color:${c.accentLight};margin:0;line-height:1.7;opacity:0.75;`;

        let html = `<section style="${cardStyle}">`;
        html += `<section style="${avatarStyle}"><span style="${avatarTextStyle}"><span leaf="">${(data.name || 'T').charAt(0).toUpperCase()}</span></span></section>`;
        if (data.name) {
            html += `<p style="${nameStyle}"><span leaf="">${data.name}</span></p>`;
        }
        if (data.title) {
            html += `<p style="${titleStyle}"><span leaf="">${data.title}</span></p>`;
        }
        html += `<section style="${decoStyle}"><span style="${decoDotStyle}"><span leaf=""><br></span></span><span style="${decoLineStyle}"><span leaf=""><br></span></span><span style="${decoDotStyle}"><span leaf=""><br></span></span></section>`;
        if (data.focus) {
            html += `<p style="${focusStyle}"><span style="${focusLabelStyle}"><span leaf="">关注</span></span><span leaf=""> ｜ ${data.focus}</span></p>`;
        }
        if (data.output) {
            html += `<p style="${outputStyle}"><span style="${outputLabelStyle}"><span leaf="">产出</span></span><span leaf=""> ｜ ${data.output}</span></p>`;
        }
        if (data.slogan) {
            html += `<p style="${sloganStyle}"><span leaf="">${data.slogan}</span></p>`;
        }
        if (data.disclaimer1 || data.disclaimer2) {
            const disclaimers = [data.disclaimer1, data.disclaimer2].filter(Boolean).join(' · ');
            html += `<p style="${disclaimerStyle}"><span leaf="">${disclaimers}</span></p>`;
        }
        html += '</section>';
        return html;
    }
};
