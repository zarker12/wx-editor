window.styleThemes = window.styleThemes || {};

// 01 极简白：渐变标题 · 清爽留白 · 炭灰主色 · 圆点列表
window.styleThemes.minimal = {
    name: '极简白',
    defaultColor: 'black',
    defaultFont: 'sans',
    canvasBg: '#FFFFFF',
    textColor: '#3F3F46',
    metaColor: '#9CA3AF',

    defaultIntro: {
        name: '作者名',
        title: '一句话简介，如：10年互联网老炮 · 大厂运营',
        focus: '互联网风向 ｜ AI落地实操 ｜ 副业玩法',
        output: '资讯速递 ＋ 干货拆解 ＋ 心得笔记',
        slogan: '如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见',
        disclaimer1: '个人观点，仅供参考',
        disclaimer2: '素材及资讯来源网络，如有错误或侵权请及时联系删除'
    },

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:22px;font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;background:linear-gradient(180deg,#1F2937 0%,#6B7280 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;padding:20px 0;`;
    },
    h2Style(c, s, sp, t) {
        return `margin:36px 0 18px;font-size:18px;font-weight:800;color:#1F2937;line-height:1.5;padding-left:14px;border-left:4px solid #1F2937;letter-spacing:0.5px;`;
    },
    h2Decor(c) {
        return '';
    },
    blockquoteStyle(c) {
        return `margin:0 0 24px;padding:14px 20px;border-left:3px solid #1F2937;background:#FAFAFA;font-size:15px;line-height:1.9;color:${this.textColor};`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    olStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:12px;`;
    },
    liIcon(c) {
        return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#1F2937;margin:10px 12px 0 0;flex-shrink:0;"><span leaf=""><br></span></span>`;
    },
    olIcon(c, idx) {
        return `<span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:#1F2937;color:#FFFFFF;border-radius:50%;margin-right:10px;font-size:11px;font-weight:600;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        return `text-align:center;margin:32px 0;`;
    },
    hrDecor(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:60px;background:#E5E7EB;margin-right:14px;"><span leaf=""><br></span></span><span style="font-size:11px;color:#9CA3AF;letter-spacing:3px;font-weight:500;"><span leaf="">·</span></span><span style="height:1px;width:60px;background:#E5E7EB;margin-left:14px;"><span leaf=""><br></span></span></section>`;
    },
    codeStyle(c) {
        return `background:#F3F4F6;color:#1F2937;padding:1px 6px;border-radius:4px;font-family:${fontFamilies.mono};font-size:14px;`;
    },
    preStyle(c) {
        return `margin:0 0 22px;border-radius:8px;overflow:hidden;background:#FAFAFA;border:1px solid #E5E7EB;border-left:3px solid #1F2937;`;
    },
    preHeaderCodeStyle(c) {
        return `padding:7px 14px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#9CA3AF;font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    preCodeStyle(c) {
        return `padding:11px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:#1F2937;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:#1F2937;color:#FFFFFF;border:0;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:12px;color:#9CA3AF;margin:8px 0 0 0;padding:0;letter-spacing:0.5px;`;
    },
    aStyle(c) {
        return `color:#1F2937;font-weight:600;border-bottom:1px solid #1F2937;`;
    },
    strongStyle(c) {
        return `color:#1F2937;font-weight:600;`;
    },
    emStyle(c) {
        return `color:#6B7280;font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:#9CA3AF;text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    keywordStyle(c) {
        return `border-bottom:2px solid #D1D5DB;font-weight:600;color:#1F2937;`;
    },
    sectionTagStyle(c) {
        return `display:inline-block;background:#1F2937;color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:3px;margin-right:8px;letter-spacing:1px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${parseInt(s.h2Size) - 1}px;font-weight:700;color:#1F2937;line-height:1.5;padding-left:12px;border-left:3px solid #4B5563;letter-spacing:0.5px;`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 0 14px;font-size:15px;font-weight:700;color:#1F2937;line-height:1.5;`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border-radius:12px;padding:6px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.06);margin-bottom:8px;`;
    },
    imageStyle(c) {
        return `max-width:100%;height:auto;display:block;border-radius:8px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:#9CA3AF;text-align:center;margin:0 0 24px 0;`;
    },
    endDecorStyle(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:#E5E7EB;margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:10px;color:#9CA3AF;letter-spacing:4px;font-weight:500;"><span leaf="">END</span></span><span style="height:1px;width:48px;background:#E5E7EB;margin-left:16px;"><span leaf=""><br></span></span></section>`;
    },
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;box-shadow:0 4px 16px -6px rgba(31,41,55,0.08);text-align:center;font-family:${font};`;
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:#1F2937;margin:0 0 14px;line-height:56px;text-align:center;`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:${font};`;
        const nameStyle = `font-size:17px;font-weight:800;color:#1F2937;margin:0 0 8px;letter-spacing:1px;`;
        const titleStyle = `font-size:13px;color:#6B7280;margin:0 0 16px;letter-spacing:0.5px;`;
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:#1F2937;margin:0 6px;`;
        const decoLineStyle = `display:inline-block;height:1.5px;width:28px;background:#E5E7EB;`;
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
        const focusLabelStyle = `color:#1F2937;font-weight:700;`;
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
        const outputLabelStyle = `color:#1F2937;font-weight:700;`;
        const sloganStyle = `font-size:12px;color:#9CA3AF;margin:0 0 4px;line-height:1.8;font-weight:500;`;
        const disclaimerStyle = `font-size:11px;color:#9CA3AF;margin:0;line-height:1.7;opacity:0.75;`;

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
