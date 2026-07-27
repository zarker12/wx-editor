window.styleThemes = window.styleThemes || {};

// 06 活力橙：白色画布 · 暖橙渐变 · 温暖明快 · 圆角卡片
// 注：按用户要求 canvasBg 改为 #FFFFFF（与极简白一致），主题色只影响其他元素
window.styleThemes.vibrant = {
    name: '活力橙',
    defaultColor: 'orange',
    defaultFont: 'sans',
    canvasBg: '#FFFFFF',
    textColor: '#4A3829',
    metaColor: '#E85D04',
    orange: '#FF6B35',
    orangeLight: '#FFB088',
    orangeDeep: '#9D2C00',
    orangeSoft: '#FFF1E6',
    orangeBorder: '#FFD8B8',
    orangeGradient: 'linear-gradient(135deg,#FF6B35 0%,#FFB088 100%)',

    defaultIntro: {
        name: '作者名',
        title: '一句话简介，如：斜杠青年 · 创业玩家',
        focus: '创业成长 ｜ 效率提升 ｜ 生活方式',
        output: '成长干货 ＋ 效率工具 ＋ 生活分享',
        slogan: '人生就是一场冒险，永远年轻，永远热泪盈眶。关注我，一起野蛮生长',
        disclaimer1: '经验分享，个人观点',
        disclaimer2: '请结合自身情况，理性参考'
    },

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
    },
    h2Style(c, s, sp, t) {
        return `margin:36px 0 18px;padding:14px 18px;background:${c.accentSoft};border-left:4px solid ${c.accent};border-radius:0 12px 12px 0;`;
    },
    h2Decor(c) {
        return `<section style="display:flex;align-items:center;margin-bottom:6px;"><span style="${this.h2NumberStyle(c)}"><span leaf="">01</span></span><span style="font-size:11px;color:#E85D04;letter-spacing:2px;font-weight:600;"><span leaf="">SECTION</span></span></section>`;
    },
    h2NumberStyle(c) {
        return `display:inline-block;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;margin-right:10px;letter-spacing:1px;`;
    },
    h2TitleStyle(c, s, sp, t) {
        return `font-size:19px;font-weight:800;color:${c.accentDark};line-height:1.4;letter-spacing:0.5px;margin:0;`;
    },
    blockquoteStyle(c) {
        return `margin:0 0 24px;padding:18px 22px;border-left:4px solid ${c.accent};background:${c.accentSoft};border-radius:0 14px 14px 0;font-size:15px;line-height:1.9;color:${this.textColor};`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:18px 20px;background:#FFFFFF;border-radius:14px;box-shadow:0 4px 14px -4px rgba(255,107,53,0.12);`; },
    olStyle(c) { return `margin:0 0 24px;padding:18px 20px;background:#FFFFFF;border-radius:14px;box-shadow:0 4px 14px -4px rgba(255,107,53,0.12);`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:12px;`;
    },
    liIcon(c) {
        return `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${c.gradient};margin:8px 12px 0 0;flex-shrink:0;"><span leaf=""><br></span></span>`;
    },
    olIcon(c, idx) {
        return `<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:${c.gradient};color:#FFFFFF;font-size:11px;font-weight:700;border-radius:50%;margin-right:10px;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        return `text-align:center;margin:32px 0;`;
    },
    hrDecor(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:2px;width:40px;background:linear-gradient(90deg,transparent,${c.accentBorder});margin-right:10px;"><span leaf=""><br></span></span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.accent};margin:0 3px;"><span leaf=""><br></span></span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accentLight};margin:0 3px;"><span leaf=""><br></span></span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.accent};margin:0 3px;"><span leaf=""><br></span></span><span style="height:2px;width:40px;background:linear-gradient(90deg,${c.accentBorder},transparent);margin-left:10px;"><span leaf=""><br></span></span></section>`;
    },
    codeStyle(c) {
        return `background:${c.accentSoft};color:${c.accentDark};padding:2px 7px;border-radius:5px;font-family:${fontFamilies.mono};font-size:14px;border:1px solid ${c.accentBorder};`;
    },
    preStyle(c) {
        return `margin:0 0 22px;border-radius:10px;overflow:hidden;background:#FFFFFF;border:1px solid ${c.accentBorder};box-shadow:0 4px 12px -4px rgba(255,107,53,0.1);`;
    },
    preHeaderCodeStyle(c) {
        return `display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid ${c.accentBorder};background:${c.accentSoft};font-size:12px;color:${c.accentDark};font-family:${fontFamilies.mono};letter-spacing:1px;font-weight:600;`;
    },
    preCodeStyle(c) {
        return `padding:12px 14px;border-left:3px solid ${c.accent};font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:${this.textColor};white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${c.accent};color:#FFFFFF;border:0;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${c.accentDark};margin:8px 0 0 0;padding:0;letter-spacing:1px;`;
    },
    aStyle(c) {
        return `color:${c.accent};font-weight:600;border-bottom:1.5px solid ${c.accent};padding-bottom:1px;`;
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
        return `display:inline-block;background:${c.gradient};color:#FFFFFF;font-size:11px;font-weight:700;padding:3px 12px;border-radius:10px;margin-right:8px;letter-spacing:1px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:4px 0 6px 0;font-size:${parseInt(s.h2Size) - 1}px;font-weight:600;color:${c.accentDark};line-height:1.5;letter-spacing:0.5px;border-bottom:2px solid ${c.accent};display:inline-block;`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 0 14px;font-size:15px;font-weight:700;color:${c.accentDark};line-height:1.5;`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border-radius:14px;padding:6px;border:1px solid ${c.accentBorder};box-shadow:0 6px 18px -4px rgba(255,107,53,0.15);margin-bottom:8px;`;
    },
    imageStyle(c) {
        return `max-width:100%;height:auto;display:block;border-radius:10px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:#E85D04;text-align:center;margin:0 0 24px 0;`;
    },
    endDecorStyle(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:2px;width:48px;background:linear-gradient(90deg,transparent,${c.accent});margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:11px;color:${c.accentDark};letter-spacing:4px;font-weight:700;"><span leaf="">END</span></span><span style="height:2px;width:48px;background:linear-gradient(90deg,${c.accent},transparent);margin-left:16px;"><span leaf=""><br></span></span></section>`;
    },
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:#FFFFFF;border:2px solid transparent;border-radius:16px;box-shadow:0 6px 20px -6px rgba(255,107,53,0.2);text-align:center;font-family:${font};position:relative;`;
        const cardBorderStyle = `position:absolute;inset:0;border-radius:16px;padding:2px;background:${c.gradient};-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;`;
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:${c.gradient};margin:0 0 14px;line-height:56px;text-align:center;box-shadow:0 6px 16px -2px rgba(255,107,53,0.4);`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:Georgia,serif;`;
        const nameStyle = `font-size:17px;font-weight:800;color:${c.accentDark};margin:0 0 8px;letter-spacing:1px;`;
        const titleStyle = `font-size:13px;color:#E85D04;margin:0 0 16px;letter-spacing:0.5px;`;
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
        html += `<section style="${cardBorderStyle}"><span leaf=""><br></span></section>`;
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
