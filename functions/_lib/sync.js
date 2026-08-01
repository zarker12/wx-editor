// ===== 共享：RSS 同步逻辑（拉取所有订阅的 RSS 写入 D1）=====
// 被 functions/api/sync.js（手动触发）与 worker/cron.js（定时触发）复用

import { parseFeed } from './rss.js';

/**
 * 拉取所有订阅源的 RSS，解析后去重写入 D1.articles
 * @param {D1Database} DB  env.DB 绑定
 * @param {number} timeoutMs 每个 RSS 请求超时（默认 15s）
 * @returns {{synced:number, failed:number, total:number}}
 */
export async function doSync(DB, timeoutMs = 15000) {
    if (!DB) throw new Error('D1 绑定不可用');

    // 1. 取出所有订阅
    const { results: subs } = await DB.prepare('SELECT id, name, rss_url FROM subscriptions').all();
    if (!subs || subs.length === 0) {
        return { synced: 0, failed: 0, total: 0 };
    }

    let synced = 0, failed = 0, total = 0;

    // 2. 逐个抓取 RSS
    for (const sub of subs) {
        try {
            const ctrl = AbortSignal.timeout(timeoutMs);
            const res = await fetch(sub.rss_url, { signal: ctrl, headers: { 'User-Agent': 'wx-editor-sync/1.0' } });
            if (!res.ok) { failed++; continue; }
            const xml = await res.text();
            const items = parseFeed(xml, sub.name);
            if (!items.length) { failed++; continue; }

            // 3. 去重写入
            for (const it of items) {
                if (!it.url) continue;
                await DB.prepare(
                    'INSERT OR IGNORE INTO articles (source, title, content, url, pub_date, read_count) VALUES (?,?,?,?,?,?)'
                ).bind(it.source, it.title, it.content, it.url, it.pub_date, it.read_count || 0).run();
            }
            // 更新最近同步时间
            await DB.prepare('UPDATE subscriptions SET last_synced_at = datetime(\'now\') WHERE id = ?').bind(sub.id).run();
            synced++;
            total += items.length;
        } catch (e) {
            console.warn('[sync] 订阅抓取失败:', sub.name, e.message);
            failed++;
        }
    }
    return { synced, failed, total };
}
