window.styleThemes = window.styleThemes || {};

// 01 极简白：渐变标题 · 清爽留白 · 炭灰主色 · 圆点列表
window.styleThemes.minimal = {
    name: '极简白',
    canvasBg: '#FFFFFF',
    textColor: '#3F3F46',
    metaColor: '#9CA3AF',

    bodyStyle(c, s, sp, t, font) {
        return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 渐变标题跟随主题色（炭灰→主题色），居中
        return `font-size:${s.h1Size};font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
    },
    h2Style(c, s, sp, t) {
        // 左竖条 + 炭灰文字（按 UI：左 4px 竖条 + 18px 加粗大字）
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${s.h2Size};font-weight:800;color:#1F2937;line-height:1.5;padding-left:14px;border-left:4px solid ${c.accent};letter-spacing:0.5px;`;
    },
    h2Decor(c) {
        // 无装饰（按 UI 设计极简风格）
        return '';
    },
    blockquoteStyle(c) {
        // 极简左竖条 + 浅灰底
        return `margin:0 0 24px;padding:14px 20px;border-left:3px solid ${c.accent};background:#FAFAFA;font-size:15px;line-height:1.9;color:${this.textColor};`;
    },
    ulStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    olStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
    liStyle(c) {
        return `display:flex;align-items:flex-start;margin-bottom:12px;`;
    },
    liIcon(c) {
        // 6x6 主题色圆点（按 UI）
        return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accent};margin:10px 12px 0 0;flex-shrink:0;"><span leaf=""><br></span></span>`;
    },
    olIcon(c, idx) {
        // 主题色实心圆点 + 数字
        return `<span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${c.accent};color:#FFFFFF;border-radius:50%;margin-right:10px;font-size:11px;font-weight:600;flex-shrink:0;">${idx}</span>`;
    },
    liTextStyle(c) {
        return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`;
    },
    hrStyle(c) {
        // 居中圆点 · 装饰
        return `text-align:center;margin:32px 0;`;
    },
    hrDecor(c) {
        // 圆点 + 短线装饰（按 UI）
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:60px;background:#E5E7EB;margin-right:14px;"><span leaf=""><br></span></span><span style="font-size:11px;color:#9CA3AF;letter-spacing:3px;font-weight:500;"><span leaf="">·</span></span><span style="height:1px;width:60px;background:#E5E7EB;margin-left:14px;"><span leaf=""><br></span></span></section>`;
    },
    codeStyle(c) {
        return `background:#F3F4F6;color:#1F2937;padding:1px 6px;border-radius:4px;font-family:${fontFamilies.mono};font-size:14px;`;
    },
    preStyle(c) {
        // 浅色极简 + 主题色左竖条
        return `margin:0 0 22px;border-radius:8px;overflow:hidden;background:#FAFAFA;border:1px solid #E5E7EB;border-left:3px solid ${c.accent};`;
    },
    preHeaderCodeStyle(c) {
        return `padding:7px 14px;border-bottom:1px solid #E5E7EB;font-size:12px;color:#9CA3AF;font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    preCodeStyle(c) {
        return `padding:11px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:#1F2937;white-space:pre;overflow-x:auto;`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:10px;right:10px;background:${c.accent};color:#FFFFFF;border:0;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:12px;color:#9CA3AF;margin:8px 0 0 0;padding:0;letter-spacing:0.5px;`;
    },
    aStyle(c) {
        return `color:${c.accent};font-weight:600;border-bottom:1px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accent};font-weight:600;`;
    },
    emStyle(c) {
        return `color:#6B7280;font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:#9CA3AF;text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
    },
    // 正文关键词下划线（每段 1-3 处，按 UI 设计）
    keywordStyle(c) {
        return `border-bottom:2px solid #D1D5DB;font-weight:600;color:#1F2937;`;
    },
    // 章节小标题前的标签：黑底白字小标签
    sectionTagStyle(c) {
        return `display:inline-block;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:3px;margin-right:8px;letter-spacing:1px;`;
    },
    h3Style(c, s, sp, t) {
        // h3 小标题：左竖条稍细
        return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${parseInt(s.h2Size) - 1}px;font-weight:700;color:#1F2937;line-height:1.5;padding-left:12px;border-left:3px solid ${c.accentBorder};letter-spacing:0.5px;`;
    },
    // 图片标题样式
    imageCaptionStyle(c) {
        return `margin:24px 0 14px;font-size:15px;font-weight:700;color:#1F2937;line-height:1.5;`;
    },
    imageWrapperStyle(c) {
        return `background:#FFFFFF;border-radius:12px;padding:6px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.06);margin-bottom:8px;`;
    },
    imageCaptionTextStyle(c) {
        return `font-size:12px;color:#9CA3AF;text-align:center;margin:0 0 24px 0;`;
    },
    // END 分隔样式
    endDecorStyle(c) {
        return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:#E5E7EB;margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:10px;color:#9CA3AF;letter-spacing:4px;font-weight:500;"><span leaf="">END</span></span><span style="height:1px;width:48px;background:#E5E7EB;margin-left:16px;"><span leaf=""><br></span></span></section>`;
    },
    // 尾部名片（极简白卡片）—— 严格按 UI 设计结构
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const font = ctx.font;
        const lineHeight = sp.lineHeight;
        const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;box-shadow:0 4px 16px -6px rgba(31,41,55,0.08);text-align:center;font-family:${font};`;
        // 圆头像：56x56 圆形 + 主题色背景 + 白字 T
        const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:${c.accent};margin:0 0 14px;line-height:56px;text-align:center;box-shadow:0 6px 16px -2px rgba(31,41,55,0.25);`;
        const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:Georgia,serif;`;
        // 作者名行
        const nameStyle = `font-size:17px;font-weight:800;color:#1F2937;margin:0 0 8px;letter-spacing:1px;`;
        // 一句话简介
        const titleStyle = `font-size:13px;color:#6B7280;margin:0 0 16px;letter-spacing:0.5px;`;
        // 三点分隔装饰
        const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
        const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.accent};margin:0 6px;`;
        const decoLineStyle = `height:1.5px;width:28px;background:#E5E7EB;`;
        // 关注行
        const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
        const focusLabelStyle = `color:${c.accent};font-weight:700;`;
        // 产出行
        const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
        const outputLabelStyle = `color:${c.accent};font-weight:700;`;
        // 互动文案
        const sloganStyle = `font-size:12px;color:#9CA3AF;margin:0 0 4px;line-height:1.8;font-weight:500;`;
        // 免责声明
        const disclaimerStyle = `font-size:11px;color:#9CA3AF;margin:0;line-height:1.7;opacity:0.75;`;

        let html = `<section style="${cardStyle}">`;
        // 头像
        html += `<section style="${avatarStyle}"><span style="${avatarTextStyle}"><span leaf="">${(data.name || 'T').charAt(0).toUpperCase()}</span></span></section>`;
        // 作者名
        if (data.name) {
            html += `<p style="${nameStyle}"><span leaf="">${data.name}</span></p>`;
        }
        // 一句话简介
        if (data.title) {
            html += `<p style="${titleStyle}"><span leaf="">${data.title}</span></p>`;
        }
        // 三点分隔
        html += `<section style="${decoStyle}"><span style="${decoDotStyle}"><span leaf=""><br></span></span><span style="${decoLineStyle}"><span leaf=""><br></span></span><span style="${decoDotStyle}"><span leaf=""><br></span></span></section>`;
        // 关注
        if (data.focus) {
            html += `<p style="${focusStyle}"><span style="${focusLabelStyle}"><span leaf="">关注</span></span><span leaf=""> ｜ ${data.focus}</span></p>`;
        }
        // 产出
        if (data.output) {
            html += `<p style="${outputStyle}"><span style="${outputLabelStyle}"><span leaf="">产出</span></span><span leaf=""> ｜ ${data.output}</span></p>`;
        }
        // 互动文案（slogan 字段）
        if (data.slogan) {
            html += `<p style="${sloganStyle}"><span leaf="">${data.slogan}</span></p>`;
        }
        // 免责声明（disclaimer1 + disclaimer2 用 " · " 连接）
        if (data.disclaimer1 || data.disclaimer2) {
            const disclaimers = [data.disclaimer1, data.disclaimer2].filter(Boolean).join(' · ');
            html += `<p style="${disclaimerStyle}"><span leaf="">${disclaimers}</span></p>`;
        }
        html += '</section>';
        return html;
    }
};
