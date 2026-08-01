// ===== Cron Worker：定时同步订阅的 RSS 写入 D1 =====
// 单独部署为 Worker（Pages 不支持 Cron Triggers），复用 _lib/sync.js 逻辑
// 部署：cd worker && wrangler deploy
// Cron 表达式见 worker/wrangler.toml（默认每 2 小时）

import { doSync } from '../functions/_lib/sync.js';

export default {
    // scheduled 事件：Cron 触发
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleSync(env));
    },
    // 也暴露 fetch 入口，便于手动触发 GET https://<worker>.workers.dev/
    async fetch(request, env) {
        const result = await handleSync(env);
        return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
};

async function handleSync(env) {
    if (!env.DB) throw new Error('D1 未绑定');
    return await doSync(env.DB, 20000);
}
