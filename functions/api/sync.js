// ===== 手动同步 API =====
// POST /api/sync   → 拉取所有订阅的 RSS 写入 D1
// 前端"刷新公众号订阅"按钮调用此接口；也可被外部定时器 fetch 触发。

import { doSync } from '../_lib/sync.js';

export async function onRequestPost({ env }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定，请先部署并配置 wrangler.toml' }, 503);
    try {
        const result = await doSync(env.DB, 20000);
        return jsonResponse({ ok: true, ...result });
    } catch (e) {
        return jsonResponse({ error: '同步失败: ' + e.message }, 500);
    }
}

// GET 也支持（便于浏览器直接打开 / 外部定时器 GET 触发）
export async function onRequestGet({ env }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定' }, 503);
    try {
        const result = await doSync(env.DB, 20000);
        return jsonResponse({ ok: true, ...result });
    } catch (e) {
        return jsonResponse({ error: '同步失败: ' + e.message }, 500);
    }
}

function jsonResponse(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
}

export function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
