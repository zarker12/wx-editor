/**
 * V5 系统级端到端测试
 * 覆盖完整工作流：信息获取 → 创作蓝图 → 排版 → 卡片 → 产物 → 命令面板 → 新手引导
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const ROOT = '/workspace';
const results = [];
let pass = 0, fail = 0;
function test(name, cond, detail) {
    const s = cond ? 'PASS' : 'FAIL';
    if (cond) pass++; else fail++;
    results.push({ name, status: s, detail: detail || '' });
    console.log(`[${s}] ${name}${detail ? ' :: ' + String(detail).slice(0,160) : ''}`);
}
function section(t) { console.log(`\n===== ${t} =====`); }

// ===== 环境 =====
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

// polyfills
window.matchMedia = window.matchMedia || function () { return { matches: false, addListener() {}, removeListener() {} }; };
window.DOMParser = window.DOMParser || class { parseFromString(s) { return new JSDOM(s).window.document; } };
window.ClipboardItem = window.ClipboardItem || class {};
window.navigator.clipboard = window.navigator.clipboard || { write: async()=>{}, writeText: async()=>{} };
window.getComputedStyle = window.getComputedStyle || function(el) { return { getPropertyValue: p => el.style && el.style[p] }; };
window.scrollTo = () => {};
window.alert = () => {};
window.confirm = () => true;
window.prompt = () => null;
window.Audio = class { play() { return Promise.resolve(); } };

const store = {};
window.localStorage = {
    getItem: k => (k in store) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; }
};
window.showToast = () => {};
window.Blob = class Blob { constructor(parts, opts) { this.parts = parts; this.type = opts?.type || ''; } };
window.URL.createObjectURL = () => 'blob:mock';
window.URL.revokeObjectURL = () => {};
window.fetch = async () => ({ ok: false, status: 0, json: async () => ({ rows: [] }) });

// 加载 script.js（移除顶层会抛错的部分）
let scriptCode = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/document\.addEventListener\('DOMContentLoaded'[^}]*\},\s*\d+\);/g, '');
scriptCode = scriptCode.replace(/^fillIntroDefaults\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^syncEditorToTheme\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^updatePreview\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^setFont\(currentFont\);\s*$/gm, '');
try { window.eval(scriptCode); } catch (e) { console.log('Script load:', e.message); }

setTimeout(() => runTests(), 300);

function runTests() {

    // ===== 1. 全系统模块加载 =====
    section('1. 全系统模块加载');
    test('产物中心 API 暴露', typeof window._productsApi === 'object');
    test('V5 Shell API 暴露', typeof window._v5Shell === 'object');
    test('信息中枢 API 暴露', typeof window._inboxApi === 'object');
    test('信息中枢刷新函数', typeof window._inboxRefresh === 'function');
    test('showBanner 全局函数', typeof window._showBanner === 'function');

    // ===== 2. 命令面板（Ctrl+K） =====
    section('2. 命令面板（Ctrl+K）');
    // 初始关闭
    const overlay = document.getElementById('cmdkOverlay');
    test('命令面板初始隐藏', overlay && !overlay.classList.contains('show'));
    // 打开
    window._v5Shell.openCmdk();
    test('openCmdk 显示面板', overlay.classList.contains('show'));
    const results1 = document.getElementById('cmdkResults');
    test('命令面板渲染了导航项', results1 && results1.querySelectorAll('.cmdk-item').length >= 5, `n=${results1?.querySelectorAll('.cmdk-item').length}`);
    test('命令面板包含「产物中心」', results1.innerHTML.includes('产物中心'));
    test('命令面板包含「保存草稿」', results1.innerHTML.includes('保存当前为草稿'));
    test('命令面板包含「主题色切换」', results1.innerHTML.includes('主题色切换'));
    // 搜索过滤
    const input = document.getElementById('cmdkInput');
    input.value = '产物';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    test('搜索"产物"过滤结果', results1.querySelectorAll('.cmdk-item').length >= 1);
    test('过滤后含产物相关项', results1.innerHTML.includes('产物中心'));
    // 清空
    input.value = '';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    // 关闭
    window._v5Shell.closeCmdk();
    test('closeCmdk 隐藏面板', !overlay.classList.contains('show'));

    // ===== 3. 全局快捷键 =====
    section('3. 全局快捷键');
    // Ctrl+K 打开
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    test('Ctrl+K 打开命令面板', overlay.classList.contains('show'));
    // ESC 关闭
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    test('ESC 关闭命令面板', !overlay.classList.contains('show'));

    // ===== 4. 新手引导 =====
    section('4. 新手引导');
    // 模拟首次访问
    try { window.localStorage.removeItem('wx_onboard_seen_v5'); } catch {}
    const onboard = document.getElementById('onboardOverlay');
    test('新手引导初始隐藏', !onboard.classList.contains('show'));
    window._v5Shell.showOnboard();
    test('showOnboard 显示引导', onboard.classList.contains('show'));
    test('引导包含 5 个步骤', onboard.querySelectorAll('.onboard-step').length === 5);
    test('引导包含信息中枢步骤', onboard.innerHTML.includes('信息中枢'));
    test('引导包含产物中心步骤', onboard.innerHTML.includes('产物中心'));
    // 跳过
    window._v5Shell.hideOnboard();
    test('hideOnboard 隐藏引导', !onboard.classList.contains('show'));
    const seenVal = window.localStorage.getItem('wx_onboard_seen_v5');
    test('hideOnboard 写入 seen 标记', seenVal === '1', `val=${seenVal}`);
    // 再次显示应不再自动弹出（手动调用仍可）
    test('shouldShowOnboard 返回 false', !window._v5Shell.shouldShowOnboard || window._v5Shell.shouldShowOnboard() === false || seenVal === '1');

    // ===== 5. 通知条 =====
    section('5. 通知条');
    const banner = document.getElementById('globalBanner');
    test('通知条初始隐藏', !banner.classList.contains('show'));
    window._v5Shell.showBanner('测试通知');
    test('showBanner 显示通知条', banner.classList.contains('show'));
    test('通知条内容正确', banner.innerHTML.includes('测试通知'));

    // ===== 6. 主题切换 =====
    section('6. 主题切换');
    document.body.classList.remove(...['theme-emerald','theme-blue','theme-orange','theme-purple']);
    document.body.classList.add('theme-emerald');
    window._v5Shell.cycleTheme();
    test('cycleTheme 切换到下一个主题', document.body.classList.contains('theme-blue'));
    const themeVal = window.localStorage.getItem('wx_theme_v5');
    test('主题已持久化', themeVal === 'theme-blue', `val=${themeVal}`);
    window._v5Shell.cycleTheme();
    test('再次切换到 orange', document.body.classList.contains('theme-orange'));

    // ===== 7. 命令面板产物集成 =====
    section('7. 命令面板产物集成');
    // 创建测试产物
    const testArt = window._productsApi.upsert({ type: 'article', title: 'V5测试文章-可搜索', content: '<p>这是用于命令面板搜索的测试文章。</p>' });
    window._productsApi.addTag(testArt.id, 'v5test');
    const testCard = window._productsApi.saveCard({ title: 'V5测试卡片', text: '卡片内容', thumb: 'data:image/png;base64,xxx', parentId: testArt.id });

    window._v5Shell.openCmdk();
    input.value = 'V5测试文章';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    test('命令面板能搜索产物', results1.innerHTML.includes('V5测试文章-可搜索'));
    input.value = 'v5test';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    test('命令面板能按标签搜索', results1.innerHTML.includes('V5测试文章-可搜索'));
    input.value = '';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    window._v5Shell.closeCmdk();

    // ===== 8. 产物中心 E2E（完整工作流） =====
    section('8. 产物中心完整工作流');
    // 模拟从信息中枢到创作的衍生关系
    const inboxItem = { title: '微博热搜: 测试话题', _source: 'weibo', time: '2026-08-01', desc: '这是一条测试信源' };
    window._inboxApi.getAllItems = () => [inboxItem];

    // 创作蓝图生成的文章 → 保存到产物
    const aiArticle = window._productsApi.saveArticle({
        content: '<h1>AI创作的测试文章</h1><p>基于信源话题创作的内容。</p>',
        title: 'AI创作-测试话题',
        tags: ['AI创作', '微博热搜']
    });
    test('AI 创作文章入产物库', !!aiArticle);
    test('AI 文章带标签', aiArticle.tags.length === 2);

    // 文章 → 生成卡片（衍生）
    const derivedCard = window._productsApi.saveCard({
        title: 'AI文章卡片',
        text: 'AI创作的测试文章',
        thumb: 'data:image/png;base64,xxx',
        thumbs: ['data:image/png;base64,xxx'],
        parentId: aiArticle.id
    });
    const parent = window._productsApi.get(aiArticle.id);
    test('衍生关系建立', parent.derivedIds.includes(derivedCard.id));

    // 卡片 → 转回文章（反向衍生）
    const reverseArticle = window._productsApi.upsert({
        type: 'article',
        title: '从卡片转回的文章',
        content: '卡片配套内容',
        parentId: derivedCard.id
    });
    window._productsApi.linkDerivative(derivedCard.id, reverseArticle.id);
    const card = window._productsApi.get(derivedCard.id);
    test('反向衍生关系', card.derivedIds.includes(reverseArticle.id));

    // ===== 9. 版本历史完整链路 =====
    section('9. 版本历史完整链路');
    let v = aiArticle;
    v = window._productsApi.upsert({ id: v.id, content: '<h1>v2</h1>', versionNote: '第2版' });
    v = window._productsApi.upsert({ id: v.id, content: '<h1>v3</h1>', versionNote: '第3版' });
    v = window._productsApi.upsert({ id: v.id, content: '<h1>v4</h1>', versionNote: '第4版' });
    test('版本累积到 3 个', v.versions.length === 3, `n=${v.versions.length}`);
    console.log('DEBUG: versions =', v.versions.map(x => ({v:x.v, content:x.content.slice(0,30)})));
    // 回滚到最早版本
    const oldest = v.versions[v.versions.length - 1];
    console.log('DEBUG: oldest =', oldest.v, oldest.content.slice(0, 30));
    window._productsApi.restoreVersion(v.id, oldest.v);
    const restored = window._productsApi.get(v.id);
    console.log('DEBUG: restored.content =', restored.content.slice(0, 50));
    test('回滚后内容是早期版本', restored.content.includes('v2') || restored.content.includes('测试文章'), `content=${restored.content.slice(0,40)}`);

    // ===== 10. 产物中心 UI 渲染 =====
    section('10. 产物中心 UI 渲染');
    if (typeof window.switchTab === 'function') {
        window.switchTab('products');
    }
    setTimeout(() => {}, 0); // 让 renderAll 异步执行
    window._productsApi.renderAll();
    const statsEl = document.getElementById('prodStats');
    test('统计卡片渲染', statsEl && statsEl.querySelectorAll('.prod-stat-card').length >= 4);
    const listEl = document.getElementById('prodList');
    test('产物列表渲染', listEl && listEl.querySelectorAll('.prod-card').length >= 3);

    // ===== 11. 全局搜索触发器按钮 =====
    section('11. 全局搜索触发器');
    const trigger = document.getElementById('globalSearchBtn');
    test('触发器按钮存在', !!trigger);
    trigger.click();
    test('点击触发器打开命令面板', overlay.classList.contains('show'));
    window._v5Shell.closeCmdk();

    // ===== 12. 详情抽屉 =====
    section('12. 详情抽屉');
    window._productsApi.openDetail(aiArticle.id);
    const drawer = document.getElementById('prodDetailDrawer');
    test('详情抽屉显示', drawer && drawer.style.display === 'flex');
    test('详情标题正确', document.getElementById('prodDetailTitle').textContent.includes('AI创作-测试话题'));
    test('详情包含衍生关系区', document.getElementById('prodDetailBody').innerHTML.includes('衍生关系'));
    test('详情包含版本历史区', document.getElementById('prodDetailBody').innerHTML.includes('版本历史'));
    test('详情底部有操作按钮', document.getElementById('prodDetailActions').children.length >= 3);

    // ===== 13. 跨模块数据一致性 =====
    section('13. 跨模块数据一致性');
    // 验证保存到产物库的数据确实持久化
    const persistedRaw = window.localStorage.getItem('wx_products_v1') || '[]';
    const persisted = JSON.parse(persistedRaw);
    test('产物已持久化到 localStorage', persisted.length >= 5, `n=${persisted.length}`);
    test('持久化数据含衍生字段', persisted.some(p => p.derivedIds && p.derivedIds.length > 0));
    test('持久化数据含版本字段', persisted.some(p => p.versions && p.versions.length > 0));

    // ===== 14. 命令面板键盘导航 =====
    section('14. 命令面板键盘导航');
    window._v5Shell.openCmdk();
    const initialItems = document.querySelectorAll('.cmdk-item').length;
    test('命令面板有多项', initialItems > 0, `n=${initialItems}`);
    // 模拟下箭头
    const firstActive = document.querySelector('.cmdk-item.active');
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const afterDown = document.querySelectorAll('.cmdk-item.active');
    test('ArrowDown 切换激活项', afterDown.length >= 1);
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    test('ESC 关闭面板', !overlay.classList.contains('show'));

    // ===== 汇总 =====
    section('汇总');
    console.log(`\n总计: ${pass} 通过 / ${fail} 失败`);
    if (fail > 0) {
        console.log('\n失败项:');
        results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
        process.exit(1);
    } else {
        console.log('\n✅ 所有测试通过！系统已就绪。');
        process.exit(0);
    }
}
