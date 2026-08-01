// ===== 共享：RSS/Atom 解析（兼容 RSS 2.0 与 Atom，无 DOMParser 依赖，纯正则）=====
// 被 functions/api/sync.js 与 worker/cron.js 复用

/**
 * 从一段 RSS/Atom XML 文本解析出文章条目
 * @param {string} xml
 * @param {string} sourceName 公众号名称（写入 article.source）
 * @returns {Array<{title:string, content:string, url:string, pub_date:string, read_count:number}>}
 */
export function parseFeed(xml, sourceName) {
    const items = [];
    if (!xml) return items;

    // 兼容 RSS 2.0 <item> 与 Atom <entry>
    const entryRegex = /<(?:item|entry)[\s>]/gi;
    const matches = [...xml.matchAll(entryRegex)];
    if (matches.length === 0) return items;

    // 用 <item>...</item> / <entry>...</entry> 切片
    const blockRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let block;
    while ((block = blockRegex.exec(xml)) !== null) {
        const seg = block[1] || '';
        const title = text(seg, 'title');
        // RSS: <link>文本</link>；Atom: <link href="..." />
        let url = text(seg, 'link');
        if (!url) {
            const href = seg.match(/<link[^>]*href=["']([^"']+)["']/i);
            url = href ? href[1] : '';
        }
        const desc = text(seg, 'description') || text(seg, 'summary') || text(seg, 'content');
        const date = text(seg, 'pubDate') || text(seg, 'published') || text(seg, 'updated') || '';
        if (!title && !url) continue;
        items.push({
            title: title || '(无标题)',
            content: stripHtml(desc).slice(0, 500),
            url,
            pub_date: date,
            read_count: 0,
            source: sourceName
        });
    }
    return items;
}

function text(seg, tag) {
    const m = seg.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
    if (!m) return '';
    return decodeXml(m[1] || '').trim();
}

function stripHtml(s) {
    return (s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function decodeXml(s) {
    return (s || '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}
