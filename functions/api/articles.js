// ===== 文章查询 API =====
// GET /api/articles?source=xxx&keyword=xxx&page=1&size=20
//   source  - 按公众号名称筛选（可选）
//   keyword - 模糊匹配标题与正文（可选）
//   page/size - 分页

export async function onRequestGet({ request, env }) {
    if (!env.DB) return jsonResponse({ error: 'D1 未绑定，请先部署并配置 wrangler.toml' }, 503);
    try {
        const url = new URL(request.url);
        const source = url.searchParams.get('source') || '';
        const keyword = url.searchParams.get('keyword') || '';
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const size = Math.min(100, Math.max(1, parseInt(url.searchParams.get('size') || '20', 10)));

        let sql = 'SELECT id, source, title, content, url, pub_date, read_count FROM articles WHERE 1=1';
        const binds = [];
        if (source) { sql += ' AND source = ?'; binds.push(source); }
        if (keyword) { sql += ' AND (title LIKE ? OR content LIKE ?)'; binds.push(`%${keyword}%`, `%${keyword}%`); }
        sql += ' ORDER BY pub_date DESC LIMIT ? OFFSET ?';
        binds.push(size, (page - 1) * size);

        const { results } = await env.DB.prepare(sql).bind(...binds).all();

        // 统计总数（用于前端分页）
        let countSql = 'SELECT COUNT(*) as c FROM articles WHERE 1=1';
        const countBinds = [];
        if (source) { countSql += ' AND source = ?'; countBinds.push(source); }
        if (keyword) { countSql += ' AND (title LIKE ? OR content LIKE ?)'; countBinds.push(`%${keyword}%`, `%${keyword}%`); }
        const { results: countRes } = await env.DB.prepare(countSql).bind(...countBinds).all();
        const total = (countRes && countRes[0] && countRes[0].c) || 0;

        return jsonResponse({ page, size, total, rows: results || [] });
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
