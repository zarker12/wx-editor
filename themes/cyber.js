window.styleThemes = window.styleThemes || {};

// 03 科技感：青色线条 · 等宽字体 · 终端式 · 方块编号
window.styleThemes.cyber = {
    name: '科技感',
    canvasBg: '#F8FAFC',
    textColor: '#1F2937',
    metaColor: '#64748B',
    cyan: '#0891B2',
    cyanDeep: '#0E7490',
    cyanSoft: '#ECFEFF',
    cyanBorder: '#CFFAFE',
    terminalBg: '#0F172A',

    bodyStyle(c, s, sp, t, font) {
        // 强制等宽字体作为科技感识别符号
        return `font-family:${fontFamilies.mono};font-weight:400;font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background-color:${this.canvasBg};padding:32px 20px 48px;letter-spacing:0;word-break:break-word;`;
    },
    pStyle(c, sp) {
        return `margin:0 0 ${sp.pMargin} 0;color:${this.textColor};`;
    },
    h1Style(c, s, sp, t) {
        // 等宽字 + 左侧主题色块 + // 前缀
        return `font-size:${s.h1Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:6px 0 6px 16px;line-height:1.4;color:#0F172A;border-left:4px solid ${c.accent};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    h2Style(c, s, sp, t) {
        // 等宽字 + // 前缀 + 左侧主题色块
        return `font-size:${s.h2Size};font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:8px 0 8px 16px;line-height:1.5;color:#0F172A;border-left:4px solid ${c.accent};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    h2Decor(c) {
        // 标题下方"代码注释"风格横线（跟随主题色）
        return `<span style="display:block;height:1px;background:${c.accentBorder};margin-top:6px;"></span><span style="display:block;margin-top:6px;color:${c.accent};font-size:11px;font-family:${fontFamilies.mono};letter-spacing:1px;">// ──────────</span>`;
    },
    blockquoteStyle(c) {
        // 浅主题色底 + 左主题色边 + 等宽字
        return `background:${c.accentSoft};border-left:3px solid ${c.accent};padding:14px 18px;margin:24px 0;color:${c.accentDark};font-size:13px;line-height:1.8;font-family:${fontFamilies.mono};`;
    },
    ulStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    olStyle(c) { return `margin:16px 0;padding-left:0;list-style:none;`; },
    liStyle(c) {
        return `margin-bottom:10px;color:${this.textColor};padding-left:24px;position:relative;font-family:${fontFamilies.mono};font-size:14px;`;
    },
    liIcon(c) {
        // 方块符号跟随主题色
        return `<span style="position:absolute;left:0;top:8px;color:${c.accent};font-size:12px;">▪</span>`;
    },
    olIcon(c, idx) {
        // 主题色方块背景 + 白字编号
        return `<span style="position:absolute;left:0;top:1px;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${c.accent};color:#FFFFFF;font-size:11px;font-weight:600;border-radius:2px;">${idx}</span>`;
    },
    hrStyle(c) {
        // 虚线分割
        return `border:none;border-top:1px dashed ${this.cyan};margin:36px auto;width:80%;`;
    },
    codeStyle(c) {
        return `color:${c.accent};background:${c.accentSoft};padding:2px 6px;border-radius:2px;font-size:12px;font-family:${fontFamilies.mono};border:1px solid ${c.accentBorder};`;
    },
    preStyle(c) {
        // 终端式深色底
        return `background:${this.terminalBg};padding:36px 20px 20px 20px;margin:24px 0 8px 0;border-radius:8px;border:1px solid #1E293B;overflow:hidden;font-size:13px;line-height:1.7;position:relative;`;
    },
    preCodeStyle(c) {
        return `display:block;color:#E2E8F0;font-family:${fontFamilies.mono};font-size:13px;white-space:pre;overflow-x:auto;`;
    },
    preDecor(c) {
        // mac 终端三圆点
        return `<span style="position:absolute;top:14px;left:16px;font-size:0;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:6px;"></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:6px;"></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;"></span></span>`;
    },
    codeCopyBtnStyle(c) {
        return `position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;padding:4px 12px;font-size:11px;color:#94A3B8;cursor:pointer;line-height:1.4;font-family:${fontFamilies.mono};`;
    },
    scrollHintStyle(c) {
        return `text-align:center;font-size:11px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:1px;font-family:${fontFamilies.mono};`;
    },
    aStyle(c) {
        return `color:${c.accent};text-decoration:none;border-bottom:1px solid ${c.accent};`;
    },
    strongStyle(c) {
        return `color:${c.accent};font-weight:600;`;
    },
    emStyle(c) {
        return `color:${this.cyan};font-style:italic;`;
    },
    metaLineStyle(c) {
        return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;font-family:${fontFamilies.mono};`;
    },
    // "01 章节标题"格式中数字部分样式：主题色大号粗体居中 + 等宽字
    h2NumberStyle(c, s, sp, t) {
        return `display:block;text-align:center;font-size:48px;font-weight:700;color:${c.accent};line-height:1.2;letter-spacing:2px;margin:0 0 10px 0;font-family:${fontFamilies.mono};`;
    },
    // h3 小标题：比 h2 小一号、左侧主题色线更细，沿用等宽字语言
    h3Style(c, s, sp, t) {
        return `font-size:${parseInt(s.h2Size) - 2}px;font-weight:500;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom} 0;padding:6px 0 6px 14px;line-height:1.5;color:#0F172A;border-left:3px solid ${c.accent};font-family:${fontFamilies.mono};letter-spacing:1px;`;
    },
    // hr 分割线后装饰：代码注释风格横线（纯文本，script.js 自动包 span）
    hrDecor(c) {
        return `// ─ ─ ─`;
    },
    // 底部名片：终端深底 · mac 三圆点 · 等宽字 · > prompt name · // 注释免责 · 主题色虚线分隔
    introCardHTML(data, ctx) {
        const sp = ctx.sp, s = ctx.s, c = ctx.c;
        const mono = fontFamilies.mono;
        const cardStyle = `margin-top:${sp.pMargin};padding:36px 20px 20px 20px;background:${this.terminalBg};border-radius:4px;border:1px solid ${c.accent};font-family:${mono};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${c.accent};position:relative;`;
        const dotsStyle = `position:absolute;top:14px;left:16px;font-size:0;`;
        const dot = (color) => `display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;`;
        const commentStyle = `color:${c.accent};font-size:11px;letter-spacing:1px;margin:0 0 6px 0;opacity:0.6;`;
        // name 行：> prompt + 粗体 + 稍大字号
        const promptStyle = `flex-shrink:0;color:${c.accent};font-weight:700;font-size:${parseInt(s.fontSize) + 2}px;margin-right:6px;`;
        const nameStyle = `font-size:${parseInt(s.fontSize) + 2}px;font-weight:600;color:${c.accent};`;
        const titleStyle = `font-size:${parseInt(s.fontSize) - 1}px;color:#94A3B8;margin-left:8px;`;
        // 关注/产出行：// 前缀 + 等宽字标签
        const metaRowStyle = `display:flex;align-items:baseline;gap:8px;margin:4px 0;`;
        const labelStyle = `flex-shrink:0;color:${c.accentDark};font-size:11px;font-weight:600;letter-spacing:1px;`;
        const metaTextStyle = `flex:1;color:${c.accent};font-size:${parseInt(s.fontSize) - 1}px;`;
        // slogan 主题色块 + 等宽字
        const sloganStyle = `margin:12px 0;padding:8px 12px;border-left:2px solid ${c.accent};color:${c.accent};font-size:${s.fontSize};background:${c.accentSoft};font-style:italic;`;
        const dividerStyle = `border-top:1px dashed ${c.accent};opacity:0.3;margin:12px 0;height:0;`;
        // 免责声明：// 注释前缀 + 浅色
        const disclaimerStyle = `display:flex;align-items:flex-start;gap:8px;margin:3px 0;font-size:11px;color:${c.accentDark};line-height:1.6;`;
        const disclaimerMarkStyle = `flex-shrink:0;color:${c.accent};opacity:0.6;line-height:1.6;`;
        let html = `<div style="${cardStyle}">`;
        html += `<span style="${dotsStyle}"><span style="${dot('#FF5F56')}"></span><span style="${dot('#FFBD2E')}"></span><span style="${dot('#27C93F')}"></span></span>`;
        html += `<div style="${commentStyle}">// author info</div>`;
        if (data.name || data.title) {
            html += `<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;"><span style="${promptStyle}">&gt;</span>`;
            if (data.name) html += `<span style="${nameStyle}">${data.name}</span>`;
            if (data.title) html += `<span style="${titleStyle}">${data.title}</span>`;
            html += `</div>`;
        }
        if (data.focus) {
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">FOCUS</span><span style="${metaTextStyle}">${data.focus}</span></div>`;
        }
        if (data.output) {
            html += `<div style="${metaRowStyle}"><span style="${labelStyle}">OUTPUT</span><span style="${metaTextStyle}">${data.output}</span></div>`;
        }
        if (data.slogan) {
            html += `<div style="${sloganStyle}">${data.slogan}</div>`;
        }
        if (data.disclaimer1 || data.disclaimer2) {
            html += `<div style="${dividerStyle}"></div>`;
        }
        if (data.disclaimer1) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">//</span><span>${data.disclaimer1}</span></div>`;
        }
        if (data.disclaimer2) {
            html += `<div style="${disclaimerStyle}"><span style="${disclaimerMarkStyle}">//</span><span>${data.disclaimer2}</span></div>`;
        }
        html += '</div>';
        return html;
    }
};
