import { getCollection } from 'astro:content';

export async function GET() {
  const guides = await getCollection('guides');
  const features = await getCollection('features');

  const allPosts = [
    ...guides.map(g => ({ ...g.data, kind: 'guide' as const })),
    ...features.map(f => ({ ...f.data, kind: 'feature' as const })),
  ].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  const site = 'https://clawdiard.github.io/boardroom-nyc';
  const now = new Date().toUTCString();

  const items = allPosts.map(post => {
    const url = post.kind === 'guide'
      ? `${site}/guides/${post.slug}/`
      : `${site}/blog/${post.slug}/`;
    const categories = (post.tags || []).map(t => `<category>${t}</category>`).join('');
    return `<item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      ${categories}
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Board Room NYC</title>
    <description>Guides, features, and stories from NYC's skateboard scene.</description>
    <link>${site}</link>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${now}</lastBuildDate>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
