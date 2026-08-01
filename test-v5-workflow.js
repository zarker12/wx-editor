/**
 * V5 完整工作流端到端测试
 * 模拟真实用户从「信源 → 创作 → 排版 → 卡片 → 产物 → 命令面板」的完整链路
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const ROOT = '/workspace';
let pass = 0, fail = 0;
function test(name, cond, detail) {
    const s = cond ? 'PASS' : 'FAIL';
    if (cond) pass++; else fail++;
    console.log(`[${s}] ${name}${detail ? ' :: ' + String(detail).slice(0,140) : ''}`);
}
function section(t) { console.log(`\n━━━ ${t} ━━━`); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

window.matchMedia = function () { return { matches: false, addListener() {}, removeListener() {} }; };
window.DOMParser = class { parseFromString(s) { return new JSDOM(s).window.document; } };
window.ClipboardItem = class {};
window.navigator.clipboard = { write: async()=>{}, writeText: async()=>{} };
window.getComputedStyle = function(el) { return { getPropertyValue: p => el.style && el.style[p] }; };
window.scrollTo = () => {};
window.alert = () => {};
window.confirm = () => true;
window.prompt = () => null;
window.Audio = class { play() { return Promise.resolve(); } };
window.Blob = class Blob { constructor(parts, opts) { this.parts = parts; this.type = opts?.type || ''; } };
window.URL.createObjectURL = () => 'blob:mock';
window.URL.revokeObjectURL = () => {};
window.fetch = async () => ({ ok: false, status: 0, json: async () => ({ rows: [] }) });
window.showToast = () => {};

let scriptCode = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
scriptCode = scriptCode.replace(/document\.addEventListener\('DOMContentLoaded'[^}]*\},\s*\d+\);/g, '');
scriptCode = scriptCode.replace(/^fillIntroDefaults\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^syncEditorToTheme\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^updatePreview\(\);\s*$/gm, '');
scriptCode = scriptCode.replace(/^setFont\(currentFont\);\s*$/gm, '');
try { window.eval(scriptCode); } catch (e) { console.log('Script load:', e.message); }

setTimeout(() => runWorkflow(), 300);

function runWorkflow() {
    section('工作流 Step 1: 信源获取（信息中枢）');
    // 模拟信源数据
    const mockItems = [
        { title: 'AI 大模型最新进展', _source: '36kr', time: '2026-08-01 10:00', desc: 'GPT-5 发布...', url: 'https://36kr.com/p/1' },
        { title: '微博热搜: 内容创作趋势', _source: 'weibo', time: '2026-08-01 11:00', desc: '今天热门话题', url: '' },
        { title: '公众号: 创作者经济观察', _source: 'wechat', time: '2026-08-01 09:00', desc: '深度分析', url: '' }
    ];
    // 通过暴露的 API 注入信源
    if (window._inboxApi) {
        window._inboxApi.getAllItems = () => mockItems;
    }
    test('信源 API 可注入数据', typeof window._inboxApi.getAllItems === 'function');

    // 验证命令面板能搜到信源
    window._v5Shell.openCmdk();
    const cmdkInput = document.getElementById('cmdkInput');
    cmdkInput.value = 'AI 大模型';
    cmdkInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    const hasInboxItem = document.getElementById('cmdkResults').innerHTML.includes('AI 大模型最新进展');
    test('命令面板能搜到信源条目', hasInboxItem);
    cmdkInput.value = '';
    cmdkInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    window._v5Shell.closeCmdk();

    section('工作流 Step 2: 内容创作（创作蓝图）');
    // 模拟 AI 创作完成的产物
    const createdArticle = window._productsApi.saveArticle({
        content: '<h1>AI 大模型最新进展深度解读</h1><p>基于 36 氪信源，本文分析 GPT-5 的技术突破...</p><h2>技术亮点</h2><p>多模态能力提升显著。</p>',
        title: 'AI 大模型最新进展深度解读',
        tags: ['AI', '技术解读', '36氪信源']
    });
    test('AI 创作完成入产物库', !!createdArticle);
    test('AI 文章字数 > 50', createdArticle.wordCount > 50, `wc=${createdArticle.wordCount}`);
    test('AI 文章带 3 个标签', createdArticle.tags.length === 3);

    section('工作流 Step 3: 排版与发布');
    // 模拟排版后的 HTML（带主题样式）
    const styledHtml = '<h1 style="color:#10B981;">AI 大模型最新进展深度解读</h1><p style="font-size:15px;">基于 36 氪信源...</p>';
    const styledArticle = window._productsApi.upsert({
        id: createdArticle.id,
        content: styledHtml,
        versionNote: '应用 emerald 主题排版后'
    });
    test('排版后产生新版本', styledArticle.versions.length >= 1);
    test('版本记录排版节点', styledArticle.versions.some(v => v.note && v.note.includes('排版')));

    // 模拟复制到公众号
    window.navigator.clipboard.writeText = async (text) => {
        test('复制内容包含标题', text.includes('AI 大模型'));
        return Promise.resolve();
    };
    // 触发复制
    try {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) copyBtn.click();
    } catch {}

    section('工作流 Step 4: 贴图卡片生成');
    // 模拟从文章生成卡片
    const cardProduct = window._productsApi.saveCard({
        title: 'AI 大模型卡片',
        text: 'AI 大模型最新进展深度解读',
        thumb: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
        thumbs: [
            'data:image/jpeg;base64,/9j/cover',
            'data:image/jpeg;base64,/9j/content1',
            'data:image/jpeg;base64,/9j/summary'
        ],
        parentId: styledArticle.id
    });
    test('卡片已生成并入库', !!cardProduct);
    test('卡片有 3 张缩略图', cardProduct.meta.thumbs.length === 3);
    test('卡片类型正确', cardProduct.type === 'card');

    section('工作流 Step 5: 产物中心管理');
    // 验证衍生关系
    const parent = window._productsApi.get(styledArticle.id);
    test('文章 → 卡片衍生关系', parent.derivedIds.includes(cardProduct.id));
    test('卡片 → 文章反向引用', cardProduct.parentId === styledArticle.id);

    // 添加管理标签
    window._productsApi.addTag(cardProduct.id, '已发布');
    window._productsApi.addTag(cardProduct.id, '公众号配图');
    const taggedCard = window._productsApi.get(cardProduct.id);
    test('卡片标签管理', taggedCard.tags.length === 2);

    // 创建衍生文章（卡片 → 文章）
    const derivedArticle = window._productsApi.upsert({
        type: 'article',
        title: '基于卡片的延伸文章',
        content: '<p>基于 AI 大模型卡片的延伸思考...</p>',
        parentId: cardProduct.id
    });
    window._productsApi.linkDerivative(cardProduct.id, derivedArticle.id);
    test('卡片 → 衍生文章', window._productsApi.get(cardProduct.id).derivedIds.includes(derivedArticle.id));

    section('工作流 Step 6: 命令面板搜索产物');
    window._v5Shell.openCmdk();
    cmdkInput.value = 'AI 大模型';
    cmdkInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    const results = document.getElementById('cmdkResults').innerHTML;
    test('命令面板搜到文章', results.includes('AI 大模型最新进展深度解读'));
    test('命令面板搜到卡片', results.includes('AI 大模型卡片'));
    cmdkInput.value = '';
    cmdkInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    window._v5Shell.closeCmdk();

    section('工作流 Step 7: 版本管理与回滚');
    // 多次更新产生多个版本
    let p = styledArticle;
    p = window._productsApi.upsert({ id: p.id, content: '<h1>v2 修订</h1>', versionNote: '编辑修订' });
    p = window._productsApi.upsert({ id: p.id, content: '<h1>v3 终稿</h1>', versionNote: '终稿' });
    test('版本累积', p.versions.length >= 2, `n=${p.versions.length}`);
    // 回滚到初版
    const firstVersion = p.versions[p.versions.length - 1];
    window._productsApi.restoreVersion(p.id, firstVersion.v);
    const rolledBack = window._productsApi.get(p.id);
    test('回滚成功', rolledBack.content.includes('AI 大模型'));

    section('工作流 Step 8: 回收站与导出');
    // 删除衍生文章
    window._productsApi.remove(derivedArticle.id, false);
    test('衍生文章移入回收站', window._productsApi.get(derivedArticle.id).trashed);
    // 验证文章的衍生列表中仍保留引用（已删除但关系保留）
    const card = window._productsApi.get(cardProduct.id);
    test('卡片衍生引用保留', card.derivedIds.includes(derivedArticle.id));
    // 恢复
    window._productsApi.restore(derivedArticle.id);
    test('衍生文章已恢复', !window._productsApi.get(derivedArticle.id).trashed);
    // 导出
    const exportData = JSON.stringify(window._productsApi.list());
    const parsed = JSON.parse(exportData);
    test('导出 JSON 完整', parsed.length >= 3);
    test('导出含衍生字段', parsed.some(x => x.derivedIds && x.derivedIds.length));
    test('导出含版本字段', parsed.some(x => x.versions && x.versions.length));

    section('工作流 Step 9: 系统级数据一致性');
    // 验证所有产物都有正确的元数据
    const all = window._productsApi.list();
    test('所有产物有 id', all.every(p => p.id));
    test('所有产物有 createdAt', all.every(p => p.createdAt));
    test('所有产物有 updatedAt', all.every(p => p.updatedAt));
    test('所有产物有 wordCount', all.every(p => typeof p.wordCount === 'number'));
    test('所有产物有 tags 数组', all.every(p => Array.isArray(p.tags)));
    test('所有产物有 versions 数组', all.every(p => Array.isArray(p.versions)));

    // 验证持久化
    const persisted = JSON.parse(window.localStorage.getItem('wx_products_v1') || '[]');
    test('localStorage 持久化条数一致', persisted.length === all.length, `persisted=${persisted.length}, in-memory=${all.length}`);

    // 汇总
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`工作流端到端测试: ${pass} 通过 / ${fail} 失败`);
    if (fail === 0) console.log('✅ 完整工作流验证通过！内容生产系统已就绪。');
    process.exit(fail > 0 ? 1 : 0);
}
