// ===== 订阅管理 API =====
// GET    /api/subscriptions          → 列出所有订阅
// POST   /api/subscriptions          → 添加订阅 {name, rss_url}
// DELETE /api/subscriptions/:id      → 删除订阅
// DELETE /api/subscriptions?id=xxx   → 删除订阅（兼容）

export async function onRequestGet({ env }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定，请先部署并配置 wrangler.toml' }, 503);
    try {
        const { results } = await env.DB.prepare(
            'SELECT id, name, rss_url, created_at, last_synced_at FROM subscriptions ORDER BY created_at DESC'
        ).all();
        return jsonResponse({ rows: results || [] });
    } catch (e) {
        return jsonResponse({ error: '数据库错误: ' + e.message }, 500);
    }
}

export async function onRequestPost({ request, env }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定' }, 503);
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const rssUrl = (body.rss_url || '').trim();
        if (!name || !rssUrl) return jsonResponse({ error: 'name 和 rss_url 不能为空' }, 400);
        if (!/^https?:\/\//i.test(rssUrl)) return jsonResponse({ error: 'rss_url 必须是 http(s) 链接' }, 400);

        const info = await env.DB.prepare(
            'INSERT OR IGNORE INTO subscriptions (name, rss_url) VALUES (?, ?)'
        ).bind(name, rssUrl).run();
        return jsonResponse({ ok: true, id: info.meta.last_row_id, name, rss_url });
    } catch (e) {
        return jsonResponse({ error: '数据库错误: ' + e.message }, 500);
    }
}

export async function onRequestDelete({ request, env, params }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定' }, 503);
    try {
        // 优先用路径参数 /api/subscriptions/:id，否则查 query
        let id = params && params.id;
        if (!id) {
            const url = new URL(request.url);
            id = url.searchParams.get('id');
        }
        if (!id) return jsonResponse({ error: '缺少 id' }, 400);
        await env.DB.prepare('DELETE FROM subscriptions WHERE id = ?').bind(id).run();
        return jsonResponse({ ok: true });
    } catch (e) {
        return jsonResponse({ error: '数据库错误: ' + e.message }, 500);
    }
}

function jsonResponse(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
}

// 预检
export function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
