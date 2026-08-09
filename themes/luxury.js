window.styleThemes = window.styleThemes || {};

// 02 黑金奢：金色点缀 · 居中斜体引用 · 深色底 · 菱形符号
window.styleThemes.luxury = {
    name: '黑金奢',
    defaultColor: 'brown',
    defaultFont: 'sans',
    defaultIntro: {
        name: '作者名',
        title: '一句话简介，如：商业观察者 · 财经博主',
        focus: '商业洞察 ｜ 财富增长 ｜ 品质生活',
        output: '深度分析 ＋ 案例拆解 ＋ 趋势解读',
        slogan: '认知决定高度，格局决定结局。关注我，一起看见更大的世界',
        disclaimer1: '个人观点，仅供参考',
        disclaimer2: '投资有风险，入市需谨慎'
    },
    canvasBg: '#0E0E10',
    textColor: '#E5E5E5',
    metaColor: '#9A9A9D',
    // 主题固定主色：金色（不跟随用户主题色）
    gold: '#C9A961',
    goldDeep: '#A88A48',
    goldLight: '#F5E6C8',
    ink: '#0E0E10',
    inkDeep: '#1A1A1D',
    inkBorder: '#3A3A3D',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 金色标题居中（纯色，公众号兼容；不用 background-clip 渐变，避免被编辑器剥离导致文字消失）
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:1px;text-align:center;color:${this.goldLight};`;
    },
    h2Style(c, s, sp, t) {
        // 居中金色 + 上下双金线（按 UI）
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:12px 0;line-height:1.5;text-align:center;font-size:${s.h2Size};font-weight:800;color:${this.goldLight};border-top:1px solid ${this.gold};border-bottom:1px solid ${this.gold};letter-spacing:1.5px;`;
    },
    h2Decor(c) {
        // 标题下方居中菱形装饰（按 UI）
        return `<section style="display:flex;align-items:center;justify-content:center;margin-top:10px;"><span style="height:1px;width:24px;background:${this.gold};margin-right:8px;"><span leaf=""><br></span></span><span style="font-size:10px;color:${this.gold};letter-spacing:2px;"><span leaf="">◆</span></span><span style="height:1px;width:24px;background:${this.gold};margin-left:8px;"><span leaf=""><br></span></span></section>`;
    },
    blockquoteStyle(c) {
        // 居中斜体 + 金色上下双线（按 UI）
        return `margin:28px 16px;padding:28px 20px;border-top:1px solid ${this.gold};border-bottom:1px solid ${this.gold};text-align:center;font-style:italic;font-weight:500;color:${this.goldLight};font-size:15px;line-height:1.9;letter-spacing:1px;`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    olStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:12px;`;
    },
    liIcon(c) {
        // 金色菱形（按 UI）
        return `<span style="display:inline-block;color:${this.gold};font-size:12px;margin:9px 12px 0 0;flex-shrink:0;"><span leaf="">◆</span></span>`;
    },
    olIcon(c, idx) {
        return `<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:${this.gold};color:${this.ink};border-radius:50%;margin-right:10px;font-size:11px;font-weight:700;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        return `text-align:center;margin:32px 0;`;
    },
    hrDecor(c) {
        // 金色菱形分隔线（按 UI）
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:60px;background:${this.inkBorder};margin-right:14px;"><span leaf=""><br></span></span><span style="font-size:12px;color:${this.gold};letter-spacing:2px;"><span leaf="">◆</span></span><span style="height:1px;width:60px;background:${this.inkBorder};margin-left:14px;"><span leaf=""><br></span></span></section>`;
    },
    codeStyle(c) {
        // 行内代码：深底金字 + 金色边（按 UI）
        return `background:${this.inkDeep};color:${this.gold};padding:1px 6px;border-radius:3px;font-family:${fontFamilies.mono};font-size:14px;border:1px solid ${this.inkBorder};`;
    },
    preStyle(c) {
        // 深色金边代码块（按 UI）
        return `margin:0 0 22px;border-radius:6px;overflow:hidden;background:${this.inkDeep};border:1px solid ${this.inkBorder};`;
    },
    preHeaderCodeStyle(c) {
        return `padding:9px 14px;border-bottom:1px solid ${this.inkBorder};font-size:12px;color:${this.gold};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    preCodeStyle(c) {
        return `padding:11px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:${this.textColor};white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.gold};color:${this.ink};border:0;border-radius:2px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.gold};margin:8px 0 0 0;padding:0;letter-spacing:2px;font-style:italic;opacity:0.8;`;
    },
    aStyle(c) {
        // 链接：金色 + 金色下划线（按 UI）
        return `color:${this.gold};font-weight:600;border-bottom:1px solid ${this.gold};`;
    },
    strongStyle(c) {
        // 加粗：浅金色（按 UI）
        return `color:${this.goldLight};font-weight:600;`;
    },
    emStyle(c) {
        // 斜体：金色（按 UI）
        return `color:${this.gold};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:3px;font-style:italic;`;
    },
    // 正文关键词下划线：金色细线 + 浅金字（按 UI）
    keywordStyle(c) {
        return `border-bottom:1.5px solid ${this.gold};font-weight:600;color:${this.goldLight};`;
    },
    sectionTagStyle(c) {
        // 标签：金底深字（按 UI）
        return `display:inline-block;background:${this.gold};color:${this.ink};font-size:11px;font-weight:700;padding:2px 12px;border-radius:2px;margin-right:8px;letter-spacing:2px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};padding:6px 0;line-height:1.5;text-align:center;font-size:${parseInt(s.h2Size) - 1}px;font-weight:500;color:${this.goldLight};border-bottom:1px solid ${this.gold};letter-spacing:2px;`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 0 14px;font-size:15px;font-weight:700;color:${this.goldLight};line-height:1.5;text-align:center;`;
    },
    imageWrapperStyle(c) {
        return `background:${this.inkDeep};border-radius:6px;padding:4px;border:1px solid ${this.inkBorder};box-shadow:0 4px 12px -2px rgba(201,169,97,0.15);margin-bottom:8px;`;
    },
    imageStyle(c) {
        return `max-width:100%;height:auto;display:block;border-radius:4px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 28px 0;letter-spacing:0.5px;`;
    },
    endDecorStyle(c) {
        // END 分割：金色双线 + END 文字（按 UI）
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:${this.gold};margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:10px;color:${this.gold};letter-spacing:4px;font-weight:500;"><span leaf="">END</span></span><span style="height:1px;width:48px;background:${this.gold};margin-left:16px;"><span leaf=""><br></span></span></section>`;
    },
    // 尾部名片（黑金奢卡片）—— 严格按 UI 设计
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:linear-gradient(135deg,${this.ink} 0%,${this.inkDeep} 100%);border:1px solid ${this.gold};border-radius:16px;box-shadow:0 6px 20px -6px rgba(201,169,97,0.25);text-align:center;font-family:${font};`;
        // 圆头像：黑底金边 + 金 T
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:${this.ink};border:1.5px solid ${this.gold};margin:0 0 14px;line-height:56px;text-align:center;box-shadow:0 6px 16px -2px rgba(201,169,97,0.3);`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:${this.gold};font-family:${font};`;
        // 作者名（浅金）
        const nameStyle = `font-size:17px;font-weight:800;color:${this.goldLight};margin:0 0 8px;letter-spacing:1.5px;`;
        // 一句话简介（金色斜体，按 UI）
        const titleStyle = `font-size:13px;color:${this.gold};margin:0 0 16px;letter-spacing:1px;font-style:italic;`;
        // 三点分隔（金色双圆点 + 灰线）
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${this.gold};margin:0 6px;`;
        const decoLineStyle = `display:inline-block;height:1.5px;width:28px;background:${this.inkBorder};`;
        // 关注行
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
        const focusLabelStyle = `color:${this.gold};font-weight:700;`;
        // 产出行
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
        const outputLabelStyle = `color:${this.gold};font-weight:700;`;
        // 互动文案（斜体，按 UI）
        const sloganStyle = `font-size:12px;color:${this.metaColor};margin:0 0 4px;line-height:1.8;font-style:italic;font-weight:500;`;
        // 免责声明
        const disclaimerStyle = `font-size:11px;color:#7A7A7D;margin:0;line-height:1.7;opacity:0.75;`;

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
