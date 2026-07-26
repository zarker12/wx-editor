// 验证 intro 卡片跟随主题切换
const { JSDOM } = require('/tmp/node_modules/jsdom');
const fs = require('fs');
const path = require('path');

const ROOT = '/workspace';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const themeFiles = ['minimal.js', 'luxury.js', 'cyber.js', 'magazine.js', 'fresh.js', 'vibrant.js'];
const themeContents = themeFiles.map(f => fs.readFileSync(path.join(ROOT, 'themes', f), 'utf8'));
const scriptContent = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

let modifiedHtml = html
    .replace(/<link[^>]*href="styles.css[^"]*"[^>]*>/g, '')
    .replace(/<script src="https:[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script src="themes[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script src="script\.js[^"]*"[^>]*><\/script>/g, '');
const allScripts = themeContents.join('\n') + '\n' + scriptContent;
modifiedHtml = modifiedHtml.replace('</body>', `<script>${allScripts}</script></body>`);

const dom = new JSDOM(modifiedHtml, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost/'
});

const { window } = dom;
const { document } = window;

setTimeout(() => {
    const results = [];
    function test(name, pass, actual) {
        results.push({ name, pass, actual });
    }

    // 模拟填写名片字段
    document.getElementById('introName').value = '测试作者';
    document.getElementById('introTitle').value = '10年互联网老炮';
    document.getElementById('introFocus').value = 'AI落地实操';
    document.getElementById('introOutput').value = '资讯速递+干货拆解';
    document.getElementById('introSlogan').value = '随缘更新';
    document.getElementById('introDisclaimer1').value = '个人观点仅供参考';
    document.getElementById('introDisclaimer2').value = '素材来源网络，侵权请联系删除';
    document.getElementById('introEnabled').checked = true;

    const themes = ['minimal', 'luxury', 'cyber', 'magazine', 'fresh', 'vibrant'];

    themes.forEach(name => {
        try {
            // 切换主题
            const btn = document.querySelector(`.style-btn[data-style="${name}"]`);
            if (btn) btn.click();

            // 渲染 intro 卡片
            const introHTML = window.getIntroCardHTML();
            const hasName = introHTML.includes('测试作者');
            const hasSlogan = introHTML.includes('随缘更新');
            const hasDisclaimer = introHTML.includes('个人观点');

            test(`${name} intro 卡片包含所有字段`, hasName && hasSlogan && hasDisclaimer, {
                hasName, hasSlogan, hasDisclaimer, htmlLen: introHTML.length
            });
        } catch (e) {
            test(`${name} intro 卡片`, false, e.message);
        }
    });

    // 测试每个主题的视觉特征
    const visualChecks = {
        minimal: { color: '#1F2937', bg: '#FFFFFF' },
        luxury: { color: '#C9A961', bg: '#1A1A1D' },
        cyber: { color: '#0891B2', bg: '#0F172A' },
        magazine: { color: '#1A1A1A', bg: '#FDFCFA' },
        fresh: { color: '#15803D', bg: '#F0FDF4' },
        vibrant: { color: '#FF6B35', bg: '#FFF7ED' }
    };

    themes.forEach(name => {
        try {
            const btn = document.querySelector(`.style-btn[data-style="${name}"]`);
            if (btn) btn.click();
            const introHTML = window.getIntroCardHTML();
            const expected = visualChecks[name];
            const hasColor = introHTML.includes(expected.color);
            const hasBg = introHTML.includes(expected.bg);
            test(`${name} 视觉特征（${expected.color} + ${expected.bg}）`, hasColor && hasBg, {
                hasColor, hasBg
            });
        } catch (e) {
            test(`${name} 视觉特征`, false, e.message);
        }
    });

    // 测试 HTML 转义
    try {
        document.getElementById('introName').value = '<script>alert(1)</script>';
        document.querySelector('.style-btn[data-style="minimal"]').click();
        const introHTML = window.getIntroCardHTML();
        const isEscaped = introHTML.includes('&lt;script&gt;') && !introHTML.includes('<script>alert');
        test('HTML 转义（防止 XSS）', isEscaped, { isEscaped });
    } catch (e) {
        test('HTML 转义', false, e.message);
    }

    // 测试关闭名片
    try {
        document.getElementById('introName').value = '正常作者';
        document.getElementById('introEnabled').checked = false;
        document.querySelector('.style-btn[data-style="minimal"]').click();
        const introHTML = window.getIntroCardHTML();
        test('关闭名片后返回空字符串', introHTML === '', { len: introHTML.length });
    } catch (e) {
        test('关闭名片', false, e.message);
    }

    console.log('\n========================================');
    console.log('=== intro 卡片跟随主题测试结果 ===');
    console.log('========================================');
    let passCount = 0;
    results.forEach(r => {
        const status = r.pass ? '✓ PASS' : '✗ FAIL';
        if (r.pass) passCount++;
        console.log(`${status} | ${r.name}`);
        if (!r.pass) {
            console.log(`  详情: ${JSON.stringify(r.actual)}`);
        }
    });
    console.log('----------------------------------------');
    console.log(`总计: ${passCount}/${results.length} 通过`);

    process.exit(0);
}, 1000);
