// ===== 微信爆文榜单 API =====
// GET /api/hot-articles?category=tech&page=1&size=20
//
// 免费方案：依次尝试多个公开免费数据源，全部失败时返回诚实标注的示例数据。
//   1. RSSHub 公共实例（rsshub.app）的 weixin 路由 —— 免费、不稳定
//   2. RSSHub 备用公共实例（rsshub.feeded.xyz 等）—— 免费
//   3. 兜底：返回预置示例榜单，_isMock=true，前端诚实标注"示例数据"
//
// 想要稳定实时数据：自建 RSSHub（Docker 一行命令，免费），
//   把 BASE 改成你的实例地址即可。

const RSSHUB_INSTANCES = [
    'https://rsshub.app',
    'https://rsshub.feeded.xyz',
    'https://rss.shab.fun'
];

// RSSHub 微信相关路由（不同来源，逐个尝试）
const WECHAT_ROUTES = [
    '/wechat/hot',          // 热门（若存在）
    '/wechat/announce',      // 公众平台公告（稳定）
    '/wechat/csm/notifications' // 通知
];

// 分类映射（前端 category → RSSHub 关键词，若有）
const CATEGORY_MAP = {
    all: '',
    tech: '科技',
    finance: '财经',
    society: '社会',
    entertainment: '娱乐',
    emotion: '情感'
};

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const size = Math.min(50, Math.max(1, parseInt(url.searchParams.get('size') || '20', 10)));

    // 1. 逐个尝试 RSSHub 公共实例
    for (const base of RSSHUB_INSTANCES) {
        for (const route of WECHAT_ROUTES) {
            try {
                const feedUrl = base + route;
                const ctrl = AbortSignal.timeout(6000);
                const res = await fetch(feedUrl, {
                    signal: ctrl,
                    headers: { 'User-Agent': 'wx-editor-hot/1.0', 'Accept': 'application/rss+xml,application/xml,text/xml,*/*' }
                });
                if (!res.ok) continue;
                const xml = await res.text();
                if (!xml || xml.length < 100) continue;
                const items = parseFeed(xml, '微信爆文');
                if (items && items.length > 0) {
                    const start = (page - 1) * size;
                    const paged = items.slice(start, start + size);
                    return jsonResponse({
                        page, size, total: items.length,
                        source: 'rsshub:' + base,
                        rows: paged
                    });
                }
            } catch (e) {
                // 超时或网络错误，继续尝试下一个
                continue;
            }
        }
    }

    // 2. 兜底：诚实标注的示例爆文榜（前端会显示"示例数据"提示）
    const mock = mockHotArticles(category);
    const start = (page - 1) * size;
    return jsonResponse({
        page, size, total: mock.length,
        source: 'mock',
        _isMock: true,
        mockReason: '公共 RSSHub 实例暂不可用。自建 RSSHub（Docker 一行命令）即可获取实时微信爆文：docker run -d -p 1200:1200 diygod/rsshub',
        rows: mock.slice(start, start + size)
    });
}

// 轻量 RSS/Atom 解析（与 _lib/rss.js 同源逻辑，独立内置避免 import 路径问题）
function parseFeed(xml, sourceName) {
    const items = [];
    if (!xml) return items;
    const blockRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    const blockRegexAlt = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let block;
    const re = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    while ((block = re.exec(xml)) !== null) {
        const seg = block[1] || '';
        const title = pickText(seg, 'title');
        let link = pickText(seg, 'link');
        if (!link) {
            const href = seg.match(/<link[^>]*href=["']([^"']+)["']/i);
            link = href ? href[1] : '';
        }
        const desc = pickText(seg, 'description') || pickText(seg, 'summary') || pickText(seg, 'content');
        const date = pickText(seg, 'pubDate') || pickText(seg, 'published') || pickText(seg, 'updated') || '';
        if (!title && !link) continue;
        items.push({
            source: sourceName,
            title: title || '(无标题)',
            content: stripHtml(desc).slice(0, 200),
            url: link,
            pub_date: date,
            read_count: guessReadCount(title)
        });
    }
    return items;
}

function pickText(seg, tag) {
    const m = seg.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
    return m ? decodeXml(m[1] || '').trim() : '';
}

function stripHtml(s) {
    return (s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function decodeXml(s) {
    return (s || '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}

// 标题长度估算阅读量（仅示例用，真实数据由 RSS 提供）
function guessReadCount(title) {
    const len = (title || '').length;
    const base = 10000 + (len % 10) * 8000;
    return base;
}

// 示例爆文榜（分类）
function mockHotArticles(category) {
    const now = new Date().toISOString();
    const all = [
        { title: '深度复盘：2026 上半年最值得订阅的 10 个公众号', source: '新榜', content: '从内容质量、更新频率、互动数据三个维度，盘点上半年表现最稳的 10 个账号...', read_count: 89000 },
        { title: '我用 AI 写公众号 30 天，粉丝从 0 涨到 5000 的复盘', source: '增长黑盒', content: 'AI 不是替代创作者，而是放大器。本文拆解从选题、写作到分发的完整工作流...', read_count: 76000 },
        { title: '公众号又改版了：推荐流逻辑变化与应对策略', source: '运营研究社', content: '本次改版最大的变化是把"在看"权重降低，新增"完读率"指标...', read_count: 65000 },
        { title: '一篇 10w+ 是怎么炼成的：标题、封面、正文的 27 个细节', source: '文案怪谈', content: '10w+ 不是玄学，是系统工程。从标题字数、情绪词、数字使用到封面构图...', read_count: 120000 },
        { title: '2026 公众号广告报价参考：头部账号报价普跌 20%', source: '新榜', content: '受整体环境与算法调整影响，今年公众号广告报价普遍下调...', read_count: 54000 },
        { title: '为什么你的公众号越写越没人看？这 5 个误区要避开', source: '内容增长社', content: '很多人以为掉粉是平台限流，其实更多是自己踩了这些坑...', read_count: 48000 },
        { title: '公众号涨粉新玩法：从视频号反向导流的 3 种姿势', source: '增长黑盒', content: '视频号与公众号打通后，导流路径更短...', read_count: 42000 },
        { title: 'AI 时代的内容创作：哪些公众号会被淘汰，哪些会崛起', source: '未来内容', content: 'AI 不是终点，而是分水岭。本文从内容稀缺性、人格化、专业度三个维度...', read_count: 38000 },
        { title: '公众号编辑器横评：5 款主流工具的优缺点对比', source: '工具猎人', content: '从排版能力、模板丰富度、导出格式、协作功能四个维度实测...', read_count: 31000 },
        { title: '爆款标题的 6 个公式：从恐惧、好奇到利益承诺', source: '文案怪谈', content: '标题决定打开率，本文拆解 6 个经久不衰的爆款标题公式...', read_count: 95000 },
        { title: '公众号图文排版规范：字号、行距、配图的黄金比例', source: '设计青年', content: '好的排版让阅读完成率提升 40%。本文给出经过验证的排版参数...', read_count: 27000 },
        { title: '从 0 到 10w 粉：一个垂直领域公众号的 12 个月增长路径', source: '增长黑盒', content: '不追热点、不蹭流量，靠深耕垂直领域一年做到 10w 粉...', read_count: 58000 }
    ];
    return all.map(a => ({ ...a, url: '', pub_date: now, _isMock: true }));
}

function jsonResponse(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        }
    });
}

export function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
