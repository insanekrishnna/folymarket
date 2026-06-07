import "server-only";

export type NewsArticle = {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: string;
};

type GNewsResponse = {
  totalArticles: number;
  articles: Array<{
    title: string;
    description: string | null;
    content: string | null;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  }>;
};

const GNEWS_ENDPOINT = "https://gnews.io/api/v4/search";
const QUERY = '"World Cup 2026" OR "FIFA World Cup 2026"';

const STOPWORDS = new Set([
  "about", "above", "after", "again", "against", "also", "among", "because",
  "before", "being", "between", "could", "during", "every", "fifa", "from",
  "have", "into", "more", "most", "only", "other", "over", "same", "some",
  "than", "that", "their", "them", "then", "there", "these", "they", "this",
  "those", "through", "under", "very", "were", "what", "when", "where",
  "which", "while", "with", "world", "would", "2026",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}

export async function getWorldCupNews(max = 12): Promise<{
  articles: NewsArticle[];
  error: "missing-key" | "fetch-failed" | null;
}> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    return { articles: [], error: "missing-key" };
  }

  const url = new URL(GNEWS_ENDPOINT);
  url.searchParams.set("q", QUERY);
  url.searchParams.set("lang", "en");
  url.searchParams.set("max", String(max));
  url.searchParams.set("sortby", "publishedAt");
  url.searchParams.set("apikey", key);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 1800, tags: ["news"] },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[news] GNews ${res.status}:`, body.slice(0, 300));
      return { articles: [], error: "fetch-failed" };
    }
    const data = (await res.json()) as GNewsResponse;
    const seenUrls = new Set<string>();
    const keptTokens: Array<Set<string>> = [];
    const articles: NewsArticle[] = [];
    const SIMILARITY_THRESHOLD = 0.45;

    for (const a of data.articles) {
      const urlKey = a.url.split("?")[0];
      if (seenUrls.has(urlKey)) continue;

      const tokens = tokenize(`${a.title} ${a.description ?? ""}`);
      const isDup = keptTokens.some(
        (prev) => jaccard(tokens, prev) >= SIMILARITY_THRESHOLD
      );
      if (isDup) continue;

      seenUrls.add(urlKey);
      keptTokens.push(tokens);
      articles.push({
        title: a.title,
        description: a.description,
        url: a.url,
        image: a.image,
        publishedAt: a.publishedAt,
        source: a.source.name,
      });
    }
    return { articles, error: null };
  } catch {
    return { articles: [], error: "fetch-failed" };
  }
}
