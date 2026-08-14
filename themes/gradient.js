window.styleThemes = window.styleThemes || {};

/**
 * 渐变排版主题（6 套）
 * 规则：渐变仅用于「文章容器背景」+「标题强调色」，绝不改动外层 UI。
 * - 容器背景使用 background:linear-gradient(...)（非 background-color），
 *   因此 generateExportHTML 的 background-color 剥离逻辑不会误伤，导出时渐变跟随输出。
 * - fixedColor:true 使 renderStyledHTML 的 applyThemeColor 跳过覆盖，保留 startColor 标题色。
 * - 编辑区/预览区通过 syncEditorToTheme 解析 bodyStyle 中的 background: 同步渐变。
 *
 * 文字可读性：正文使用深色 #2D2D3A（在渐变的浅色端可读）；标题使用 startColor（大字号加粗，对比充分）。
 */
const GRADIENT_LAYOUT_THEMES = [
    { key: 'g-pink',   name: '粉的很无敌',     gradient: 'linear-gradient(90deg, #FF768D, #E5FFFD)', startColor: '#FF768D', endColor: '#E5FFFD' },
    { key: 'g-dream',  name: '深邃又梦幻',     gradient: 'linear-gradient(90deg, #5E68FB, #FFFEDA)', startColor: '#5E68FB', endColor: '#FFFEDA' },
    { key: 'g-heal',   name: '好治愈的配色',   gradient: 'linear-gradient(90deg, #1899B6, #FFCCDD)', startColor: '#1899B6', endColor: '#FFCCDD' },
    { key: 'g-deep',   name: '绝不能让它去沉淀', gradient: 'linear-gradient(90deg, #30A9FF, #FFF4E3)', startColor: '#30A9FF', endColor: '#FFF4E3' },
    { key: 'g-love',   name: '如痴如梦爱了',   gradient: 'linear-gradient(90deg, #5D62CC, #FFDDDD)', startColor: '#5D62CC', endColor: '#FFDDDD' },
    { key: 'g-pretty', name: '啥也不说就好看',  gradient: 'linear-gradient(90deg, #18B670, #FFD0D0)', startColor: '#18B670', endColor: '#FFD0D0' }
];

function _createGradientLayoutTheme(cfg) {
    const accent = cfg.startColor;
    // canvasBg 用浅色 endColor 作为安全兜底（当某些路径仅读取 canvasBg 时仍可读）；
    // 实际容器背景由 bodyStyle 的 background: 渐变提供。
    const canvasBg = cfg.endColor;
    const textColor = '#2D2D3A';
    const metaColor = '#6B6B7B';
    const borderColor = 'rgba(45, 45, 58, 0.12)';

    return {
        name: cfg.name,
        fixedColor: true,          // 保留主题自带 startColor 标题色，不被全局主题色覆盖
        defaultColor: null,        // 不强制切换全局主题色，保持两套主题独立
        defaultFont: 'sans',
        canvasBg,
        textColor,
        metaColor,

        defaultIntro: {
            name: '作者名',
            title: '一句话简介，如：内容创作者 · 视觉表达者',
            focus: '生活观察 ｜ 美学分享 ｜ 灵感记录',
            output: '图文笔记 ＋ 主题专栏 ＋ 日常随想',
            slogan: '愿这些文字与色彩，给你一点温柔的力量。关注我，一起记录美好',
            disclaimer1: '个人观点，文责自负',
            disclaimer2: '转载请注明出处，侵权必究'
        },

        bodyStyle(c, s, sp, t, font) {
            // 用 background: 渐变（非 background-color），导出时不被剥离，渐变跟随输出
            return `font-family:${font};font-weight:${getFontWeight()};font-size:${s.fontSize};line-height:${sp.lineHeight};color:${this.textColor};background:${cfg.gradient};padding:20px 16px 40px;letter-spacing:${t.letterSpacing};word-break:break-word;`;
        },
        pStyle(c, sp) {
            return `margin:0 0 ${sp.pMargin};font-size:15px;line-height:${sp.lineHeight};text-align:justify;color:${this.textColor};padding:0 4px;`;
        },
        h1Style(c, s, sp, t) {
            return `font-size:22px;font-weight:800;margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};line-height:1.4;letter-spacing:0.5px;text-align:center;color:${accent};padding:18px 0;`;
        },
        h2Style(c, s, sp, t) {
            return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${s.h2Size};font-weight:800;color:${accent};line-height:1.5;padding-left:14px;border-left:4px solid ${accent};letter-spacing:0.5px;`;
        },
        h2Decor(c) { return ''; },
        h3Style(c, s, sp, t) {
            return `margin:${sp.h2MarginTop} 0 ${sp.h2MarginBottom};font-size:${parseInt(s.h2Size) - 1}px;font-weight:700;color:${accent};line-height:1.5;padding-left:12px;border-left:3px solid ${accent};letter-spacing:0.5px;`;
        },
        blockquoteStyle(c) {
            return `margin:0 0 24px;padding:14px 20px;border-left:3px solid ${accent};background:rgba(255,255,255,0.45);font-size:15px;line-height:1.9;color:${this.textColor};`;
        },
        ulStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
        olStyle(c) { return `margin:0 0 24px;padding:0 4px;`; },
        liStyle(c) { return `display:flex;align-items:flex-start;margin-bottom:12px;`; },
        liIcon(c) {
            return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${accent};margin:10px 12px 0 0;flex-shrink:0;"><span leaf=""><br></span></span>`;
        },
        olIcon(c, idx) {
            return `<span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background:${accent};color:#FFFFFF;border-radius:50%;margin-right:10px;font-size:11px;font-weight:600;flex-shrink:0;">${idx}</span>`;
        },
        liTextStyle(c) { return `margin:0;font-size:15px;line-height:1.9;color:${this.textColor};flex:1;`; },
        hrStyle(c) { return `text-align:center;margin:32px 0;`; },
        hrDecor(c) {
            return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:60px;background:${borderColor};margin-right:14px;"><span leaf=""><br></span></span><span style="font-size:11px;color:${accent};letter-spacing:3px;font-weight:500;"><span leaf="">·</span></span><span style="height:1px;width:60px;background:${borderColor};margin-left:14px;"><span leaf=""><br></span></span></section>`;
        },
        codeStyle(c) {
            return `background:rgba(255,255,255,0.6);color:${this.textColor};padding:1px 6px;border-radius:4px;font-family:${fontFamilies.mono};font-size:14px;`;
        },
        preStyle(c) {
            return `margin:0 0 22px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.55);border:1px solid ${borderColor};border-left:3px solid ${accent};`;
        },
        preHeaderCodeStyle(c) {
            return `padding:7px 14px;border-bottom:1px solid ${borderColor};font-size:12px;color:${this.metaColor};font-family:${fontFamilies.mono};letter-spacing:1px;`;
        },
        preCodeStyle(c) {
            return `padding:11px 14px;font-family:${fontFamilies.mono};font-size:13px;line-height:1.6;color:${this.textColor};white-space:pre;overflow-x:auto;`;
        },
        codeCopyBtnStyle(c) {
            return `position:absolute;top:10px;right:10px;background:${accent};color:#FFFFFF;border:0;border-radius:4px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;line-height:1.4;`;
        },
        scrollHintStyle(c) {
            return `text-align:center;font-size:12px;color:${this.metaColor};margin:8px 0 0 0;padding:0;letter-spacing:0.5px;`;
        },
        aStyle(c) { return `color:${accent};font-weight:600;border-bottom:1px solid ${accent};`; },
        strongStyle(c) { return `color:${accent};font-weight:600;`; },
        emStyle(c) { return `color:${this.metaColor};font-style:italic;`; },
        metaLineStyle(c) {
            return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;letter-spacing:1px;`;
        },
        keywordStyle(c) { return `border-bottom:2px solid ${accent};font-weight:600;color:${this.textColor};`; },
        sectionTagStyle(c) {
            return `display:inline-block;background:${accent};color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:3px;margin-right:8px;letter-spacing:1px;`;
        },
        imageCaptionStyle(c) {
            return `margin:24px 0 14px;font-size:15px;font-weight:700;color:${accent};line-height:1.5;`;
        },
        imageWrapperStyle(c) {
            return `background:rgba(255,255,255,0.6);border-radius:12px;padding:6px;border:1px solid ${borderColor};box-shadow:0 4px 12px -2px rgba(0,0,0,0.06);margin-bottom:8px;`;
        },
        imageStyle(c) { return `max-width:100%;height:auto;display:block;border-radius:8px;`; },
        imageCaptionTextStyle(c) {
            return `font-size:12px;color:${this.metaColor};text-align:center;margin:0 0 24px 0;`;
        },
        endDecorStyle(c) {
            return `<section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:${borderColor};margin-right:16px;"><span leaf=""><br></span></span><span style="font-size:10px;color:${accent};letter-spacing:4px;font-weight:500;"><span leaf="">END</span></span><span style="height:1px;width:48px;background:${borderColor};margin-left:16px;"><span leaf=""><br></span></span></section>`;
        },
        introCardHTML(data, ctx) {
            const sp = ctx.sp, font = ctx.font;
            const cardStyle = `margin:${sp.pMargin} 0 8px;padding:32px 22px 26px;background:rgba(255,255,255,0.72);border:1px solid ${borderColor};border-radius:16px;box-shadow:0 4px 16px -6px rgba(0,0,0,0.08);text-align:center;font-family:${font};`;
            const avatarStyle = `display:inline-block;width:56px;height:56px;border-radius:50%;background:${accent};margin:0 0 14px;line-height:56px;text-align:center;`;
            const avatarTextStyle = `font-size:22px;font-weight:800;color:#FFFFFF;font-family:${font};`;
            const nameStyle = `font-size:17px;font-weight:800;color:${this.textColor};margin:0 0 8px;letter-spacing:1px;`;
            const titleStyle = `font-size:13px;color:${this.metaColor};margin:0 0 16px;letter-spacing:0.5px;`;
            const decoStyle = `display:flex;align-items:center;justify-content:center;margin:0 0 16px;`;
            const decoDotStyle = `display:inline-block;width:6px;height:6px;border-radius:50%;background:${accent};margin:0 6px;`;
            const decoLineStyle = `display:inline-block;height:1.5px;width:28px;background:${borderColor};`;
            const focusStyle = `font-size:13px;color:${this.textColor};margin:0 0 6px;line-height:1.8;`;
            const focusLabelStyle = `color:${accent};font-weight:700;`;
            const outputStyle = `font-size:13px;color:${this.textColor};margin:0 0 16px;line-height:1.8;`;
            const outputLabelStyle = `color:${accent};font-weight:700;`;
            const sloganStyle = `font-size:12px;color:${this.metaColor};margin:0 0 4px;line-height:1.8;font-weight:500;`;
            const disclaimerStyle = `font-size:11px;color:${this.metaColor};margin:0;line-height:1.7;opacity:0.75;`;

            let html = `<section style="${cardStyle}">`;
            html += `<section style="${avatarStyle}"><span style="${avatarTextStyle}"><span leaf="">${(data.name || 'T').charAt(0).toUpperCase()}</span></span></section>`;
            if (data.name) html += `<p style="${nameStyle}"><span leaf="">${data.name}</span></p>`;
            if (data.title) html += `<p style="${titleStyle}"><span leaf="">${data.title}</span></p>`;
            html += `<section style="${decoStyle}"><span style="${decoDotStyle}"><span leaf=""><br></span></span><span style="${decoLineStyle}"><span leaf=""><br></span></span><span style="${decoDotStyle}"><span leaf=""><br></span></span></section>`;
            if (data.focus) html += `<p style="${focusStyle}"><span style="${focusLabelStyle}"><span leaf="">关注</span></span><span leaf=""> ｜ ${data.focus}</span></p>`;
            if (data.output) html += `<p style="${outputStyle}"><span style="${outputLabelStyle}"><span leaf="">产出</span></span><span leaf=""> ｜ ${data.output}</span></p>`;
            if (data.slogan) html += `<p style="${sloganStyle}"><span leaf="">${data.slogan}</span></p>`;
            if (data.disclaimer1 || data.disclaimer2) {
                const disclaimers = [data.disclaimer1, data.disclaimer2].filter(Boolean).join(' · ');
                html += `<p style="${disclaimerStyle}"><span leaf="">${disclaimers}</span></p>`;
            }
            html += '</section>';
            return html;
        }
    };
}

// 注册到全局主题表，供 getStyleTheme() 按 currentStyle 读取
GRADIENT_LAYOUT_THEMES.forEach(cfg => {
    window.styleThemes[cfg.key] = _createGradientLayoutTheme(cfg);
});

// 暴露元数据供 UI 渲染（排版主题列表 + 设置页分组）
window.GRADIENT_LAYOUT_THEMES = GRADIENT_LAYOUT_THEMES;
