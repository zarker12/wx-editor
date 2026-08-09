window.styleThemes = window.styleThemes || {};

// 04 杂志风：宋体大字 · 上下线引用 · 编辑美学 · 深红点缀
window.styleThemes.magazine = {
    name: '杂志风',
    defaultColor: 'brown',
    defaultFont: 'serif',
    canvasBg: '#FDFCFA',
    textColor: '#3D3D3D',
    metaColor: '#999999',
    // 主题固定主色：黑色 + 深红色（不跟随用户主题色）
    ink: '#1A1A1A',
    inkLight: '#3D3D3D',
    inkBorder: '#E5E5E5',
    inkSofter: '#E8E8E8',
    crimson: '#8B0000',
    // 罗马数字列表符号
    romanNumerals: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ'],
    // 英文数字对应
    englishNumbers: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE'],

    defaultIntro: {
        name: '作者名',
        title: '一句话简介，如：资深编辑 · 文字工作者',
        focus: '深度观察 ｜ 人物访谈 ｜ 生活美学',
        output: '深度长文 ＋ 专访报道 ＋ 散文随笔',
        slogan: '每一篇文字都是一次与世界的对话。关注我，一起看见更多可能',
        disclaimer1: '个人观点，文责自负',
        disclaimer2: '转载请注明出处，侵权必究'
    },

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};padding:0 4px;`;
    },
    h1Style(c, s, sp, t) {
        return `margin:44px 0 24px;padding:20px 0;text-align:center;border-top:1px solid ${this.ink};border-bottom:1px solid ${this.ink};`;
    },
    h1NumberStyle(c, s, sp, t) {
        return `font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:36px;font-weight:900;color:${this.inkSofter};line-height:1;letter-spacing:-1px;margin-bottom:8px;`;
    },
    h1LabelStyle(c, s, sp, t) {
        return `font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:10px;color:${this.crimson};letter-spacing:4px;font-weight:700;font-style:italic;margin-bottom:12px;`;
    },
    h1TitleStyle(c, s, sp, t) {
        return `font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:21px;font-weight:900;color:${this.ink};line-height:1.4;letter-spacing:1px;margin:0;`;
    },
    h2Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:14px 0;text-align:center;font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:${s.h2Size};font-weight:900;color:${this.ink};line-height:1.4;letter-spacing:1px;`;
    },
    h2NumberStyle(c, s, sp, t) {
        return `font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:18px;font-weight:900;color:${this.crimson};line-height:1;margin-bottom:8px;`;
    },
    h2Decor(c) {
        return `<section style="height:1px;background:${this.ink};margin-top:14px;"><span leaf=""><br></span></section>`;
    },
    blockquoteStyle(c) {
        return `margin:32px 0;padding:32px 20px;border-top:2px solid ${this.ink};border-bottom:2px solid ${this.ink};text-align:center;background:#FFFFFF;font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;color:${this.ink};line-height:1.85;letter-spacing:1px;`;
    },
    ulStyle(c) { return `margin:0 4px 24px;`; },
    olStyle(c) { return `margin:0 4px 24px;`; },
    liStyle(c) {
        return `display:flex;align-items:baseline;padding:10px 0;`;
    },
    liIcon(c) {
        return '';
    },
    olIcon(c, idx) {
        return `<p style="font-family:'Noto Serif SC',Georgia,serif;font-size:18px;font-weight:900;color:${this.crimson};margin:0 16px 0 0;min-width:24px;line-height:1;flex-shrink:0;"><span leaf="">${this.romanNumerals[idx - 1] || idx}</span></p>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;color:${this.textColor};line-height:1.8;flex:1;`;
    },
    hrStyle(c) {
        return `margin:32px 4px;`;
    },
    hrDecor(c) {
        return `<section style="height:1px;background:${this.ink};margin-bottom:3px;"><span leaf=""><br></span></section><section style="height:1px;background:${this.ink};"><span leaf=""><br></span></section>`;
    },
    codeStyle(c) {
        return `background:#F5F5F5;color:${this.ink};padding:1px 6px;border:1px solid ${this.inkBorder};font-family:${fontFamilies.mono};font-size:14px;`;
    },
    preStyle(c) {
        return `margin:0 4px 22px;background:#FFFFFF;border:1px solid ${this.ink};`;
    },
    preHeaderCodeStyle(c) {
        return `padding:8px 14px;border-bottom:1px solid ${this.ink};background:#F5F5F5;font-size:12px;color:${this.ink};font-family:${fontFamilies.mono};letter-spacing:1px;font-weight:600;`;
    },
    preCodeStyle(c) {
        return `padding:14px 16px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.7;color:${this.ink};white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.ink};color:#FFFFFF;border:0;border-radius:0;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:12px;color:${this.crimson};margin:8px 0 0 0;padding:0;font-family:'Noto Serif SC',Georgia,serif;font-style:italic;letter-spacing:0.5px;`;
    },
    aStyle(c) {
        return `color:${this.crimson};font-weight:600;border-bottom:1px solid ${this.crimson};`;
    },
    strongStyle(c) {
        return `color:${this.ink};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.crimson};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;font-family:'Noto Serif SC',Georgia,serif;font-style:italic;letter-spacing:0.5px;`;
    },
    keywordStyle(c) {
        return `border-bottom:2px solid ${this.crimson};font-weight:600;color:${this.ink};`;
    },
    sectionTagStyle(c) {
        return `display:inline-block;background:${this.ink};color:#FFFFFF;font-family:'Noto Serif SC',Georgia,serif;font-size:11px;font-weight:700;padding:2px 12px;border-radius:0;margin-right:8px;letter-spacing:2px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:8px 0;font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:${parseInt(s.h2Size) - 1}px;font-weight:700;color:${this.ink};line-height:1.4;letter-spacing:1px;text-align:left;border-bottom:1px solid ${this.ink};`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 4px 14px;font-size:15px;font-weight:700;color:${this.ink};line-height:1.5;`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border:1px solid ${this.ink};padding:4px;margin:0 4px 8px;`;
    },
    imageStyle(c) {
        return `overflow:hidden;max-width:100%;height:auto;display:block;`;
    },
    imageCaptionTextStyle(c) {
        return `font-family:'Noto Serif SC',Georgia,serif;font-size:12px;color:${this.crimson};text-align:center;margin:0 4px 24px;font-style:italic;letter-spacing:0.5px;`;
    },
    endDecorStyle(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:60px;background:${this.ink};margin-right:18px;"><span leaf=""><br></span></span><span style="font-family:'Noto Serif SC',Georgia,serif;font-size:12px;color:${this.ink};letter-spacing:6px;font-weight:700;font-style:italic;"><span leaf="">END</span></span><span style="height:1px;width:60px;background:${this.ink};margin-left:18px;"><span leaf=""><br></span></span></section>`;
    },
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:#FFFFFF;border-top:3px solid ${this.ink};border-bottom:1px solid ${this.ink};border-radius:0;text-align:center;font-family:${font};`;
        const editorLabelStyle = `font-size:10px;color:${this.ink};letter-spacing:6px;margin:0 0 16px;font-weight:700;`;
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:${this.ink};margin:0 0 14px;line-height:56px;text-align:center;`;
        const avatarTextStyle = `font-family:${font};font-size:22px;font-weight:900;color:#FFFFFF;font-style:italic;`;
        const nameStyle = `font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:19px;font-weight:900;color:${this.ink};margin:0 0 8px;letter-spacing:1.5px;`;
        const titleStyle = `font-size:13px;color:${this.crimson};margin:0 0 16px;letter-spacing:1px;font-style:italic;font-family:'Noto Serif SC',Georgia,serif;`;
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${this.crimson};margin:0 6px;`;
        const decoLineStyle = `display:inline-block;height:1.5px;width:28px;background:${this.ink};`;
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;font-family:'Noto Serif SC',Georgia,serif;`;
        const focusLabelStyle = `color:${this.ink};font-weight:700;`;
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;font-family:'Noto Serif SC',Georgia,serif;`;
        const outputLabelStyle = `color:${this.ink};font-weight:700;`;
        const sloganStyle = `font-family:'Noto Serif SC',Georgia,serif;font-size:12px;color:${this.crimson};margin:0 0 4px;line-height:1.8;font-style:italic;font-weight:500;`;
        const disclaimerStyle = `font-size:11px;color:${this.metaColor};margin:0;line-height:1.7;opacity:0.75;`;

        let html = `<section style="${cardStyle}">`;
        html += `<p style="${editorLabelStyle}"><span leaf="">EDITOR</span></p>`;
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
