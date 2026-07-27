window.styleThemes = window.styleThemes || {};

// 03 科技感：青色线条 · 等宽字体 · 终端式 · 浅色底
window.styleThemes.cyber = {
    name: '科技感',
    canvasBg: '#FFFFFF',
    textColor: '#334155',
    metaColor: '#64748B',
    cyan: '#0891B2',
    cyanLight: '#06B6D4',
    cyanSoft: '#F8FAFC',
    cyanBorder: '#E2E8F0',
    ink: '#0F172A',
    inkDeep: '#1E293B',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 深色加粗居中标题（按 UI）
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;color:${this.ink};`;
    },
    h2Style(c, s, sp, t) {
        // 章节标题：青色方块编号 + 渐变下划线（按 UI）
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${s.h2Size};font-weight:800;color:${this.ink};line-height:1.4;letter-spacing:0.5px;`;
    },
    h2Decor(c) {
        // 青色渐变下划线（按 UI）
        return `<section style="height:2px;width:100%;background:linear-gradient(90deg,${this.cyan} 0%,${this.cyanBorder} 100%);margin-top:10px;"><span leaf=""><br></span></section>`;
    },
    blockquoteStyle(c) {
        // 青色左竖条 + 终端式（按 UI）
        return `margin:0 0 24px;padding:14px 20px;border-left:3px solid ${this.cyan};background:${this.cyanSoft};font-size:15px;line-height:1.8;color:${this.textColor};`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:14px 18px;background:${this.cyanSoft};border:1px solid ${this.cyanBorder};border-left:3px solid ${this.cyan};border-radius:4px;`; },
    olStyle(c) { return `margin:0 0 24px;padding:14px 18px;background:${this.cyanSoft};border:1px solid ${this.cyanBorder};border-left:3px solid ${this.cyan};border-radius:4px;`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:10px;`;
    },
    liIcon(c) {
        // 青色方块（按 UI）
        return `<span style="display:inline-block;width:8px;height:8px;background:${this.cyan};margin:8px 12px 0 0;flex-shrink:0;"><span leaf=""><br></span></span>`;
    },
    olIcon(c, idx) {
        return `<span style="display:inline-block;background:${this.cyan};color:#FFFFFF;font-size:12px;font-weight:700;padding:3px 10px;border-radius:3px;font-family:${fontFamilies.mono};letter-spacing:1px;margin-right:10px;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.8;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        return `margin:28px 0;`;
    },
    hrDecor(c) {
        // 青色渐变细线（按 UI）
        return `<section style="height:1px;background:linear-gradient(90deg,transparent 0%,${this.cyan} 50%,transparent 100%);"><span leaf=""><br></span></section>`;
    },
    codeStyle(c) {
        // 行内代码：青字浅底（按 UI）
        return `background:#F1F5F9;color:${this.cyan};padding:2px 6px;border-radius:4px;font-family:${fontFamilies.mono};font-size:14px;border:1px solid ${this.cyanBorder};`;
    },
    preStyle(c) {
        // 深色终端代码块（按 UI）
        return `margin:0 0 22px;border-radius:8px;overflow:hidden;background:${this.ink};box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);`;
    },
    preHeaderCodeStyle(c) {
        // 终端三色按钮 + 文件名（按 UI）
        return `display:flex;align-items:center;padding:9px 14px;background:${this.inkDeep};`;
    },
    preCodeStyle(c) {
        return `padding:11px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:#E2E8F0;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${this.cyan};color:#FFFFFF;border:0;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:0.5px;font-family:${fontFamilies.mono};`;
    },
    aStyle(c) {
        // 链接：青色 + 青色下划线（按 UI）
        return `color:${this.cyan};font-weight:600;border-bottom:1px solid ${this.cyan};`;
    },
    strongStyle(c) {
        // 加粗：深色（按 UI）
        return `color:${this.ink};font-weight:600;`;
    },
    emStyle(c) {
        // 斜体：青色（按 UI）
        return `color:${this.cyan};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:0.5px;font-family:${fontFamilies.mono};`;
    },
    // 正文关键词下划线：青色（按 UI）
    keywordStyle(c) {
        return `border-bottom:2px solid ${this.cyanLight};font-weight:600;color:${this.ink};`;
    },
    sectionTagStyle(c) {
        // 青色方块编号（按 UI）
        return `display:inline-block;background:${this.cyan};color:#FFFFFF;font-size:12px;font-weight:700;padding:3px 10px;border-radius:3px;font-family:${fontFamilies.mono};letter-spacing:1px;margin-right:10px;`;
    },
    h3Style(c, s, sp, t) {
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${parseInt(s.h2Size) - 1}px;font-weight:700;color:${this.ink};line-height:1.4;letter-spacing:0.5px;font-family:${fontFamilies.mono};`;
    },
    imageCaptionStyle(c) {
        return `margin:24px 0 12px;font-size:14px;font-weight:700;color:${this.ink};line-height:1.5;font-family:${fontFamilies.mono};`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border-radius:8px;padding:4px;border:1px solid ${this.cyanBorder};box-shadow:0 4px 12px -2px rgba(8,145,178,0.08);margin-bottom:8px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;font-family:${fontFamilies.mono};letter-spacing:0.5px;`;
    },
    endDecorStyle(c) {
        // END 终端式（按 UI）
        return `<section style="margin:32px 0;padding:14px 18px;border:1px solid ${this.cyanBorder};border-left:3px solid ${this.cyan};background:${this.cyanSoft};"><p style="font-size:11px;color:${this.cyan};margin:0;font-family:${fontFamilies.mono};letter-spacing:2px;font-weight:600;text-align:center;"><span leaf="">$ ./article --end  [ok]</span></p></section>`;
    },
    // 尾部名片（科技感卡片）—— 严格按 UI 设计
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:${this.cyanSoft};border:1px solid ${this.cyanBorder};border-left:3px solid ${this.cyan};border-radius:12px;box-shadow:0 4px 16px -6px rgba(8,145,178,0.12);text-align:center;font-family:${font};`;
        // 圆角方形头像（按 UI：12px 圆角，青色背景 + 白 T + 等宽字体）
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:12px;background:${this.cyan};margin:0 0 14px;line-height:56px;text-align:center;box-shadow:0 6px 16px -2px rgba(8,145,178,0.3);`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:${fontFamilies.mono};`;
        // 作者名
        const nameStyle = `font-size:17px;font-weight:800;color:${this.ink};margin:0 0 8px;letter-spacing:0.5px;`;
        // 一句话简介（等宽字体，按 UI）
        const titleStyle = `font-size:13px;color:${this.metaColor};margin:0 0 16px;letter-spacing:0.5px;font-family:${fontFamilies.mono};`;
        // 三点分隔（青色双圆点 + 灰线）
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${this.cyan};margin:0 6px;`;
        const decoLineStyle = `height:1.5px;width:28px;background:#CBD5E1;`;
        // 关注行
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
        const focusLabelStyle = `color:${this.cyan};font-weight:700;`;
        // 产出行
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
        const outputLabelStyle = `color:${this.cyan};font-weight:700;`;
        // 互动文案
        const sloganStyle = `font-size:12px;color:${this.metaColor};margin:0 0 4px;line-height:1.8;font-weight:500;`;
        // 免责声明（等宽字体注释形式，按 UI）
        const disclaimerStyle = `font-size:11px;color:#94A3B8;margin:0;line-height:1.7;font-family:${fontFamilies.mono};opacity:0.75;`;

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
            html += `<p style="${disclaimerStyle}"><span leaf="">// ${disclaimers}</span></p>`;
        }
        html += '</section>';
        return html;
    }
};
