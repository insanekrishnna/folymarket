import type { Metadata } from "next";
import { Newspaper, ExternalLink, AlertCircle } from "lucide-react";
import { getWorldCupNews, type NewsArticle } from "@/lib/news";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news, transfers, squad announcements and analysis leading up to the 2026 World Cup.",
  alternates: { canonical: "/noticias" },
  openGraph: {
    title: "World Cup 2026 News",
    description:
      "Latest news on teams, venues and the path to the 2026 World Cup.",
    url: "/noticias",
  },
};

export const revalidate = 1800;

export default async function NoticiasPage() {
  const { articles, error } = await getWorldCupNews(18);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Newspaper className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl leading-tight">News</h1>
          <p className="text-sm text-muted-foreground">
            Latest news on the road to the 2026 World Cup. Updated every 30 minutes.
          </p>
        </div>
      </header>

      {error === "missing-key" && (
        <Alert className="mb-6">
          <AlertCircle className="size-4" />
          <AlertTitle>Configure GNews</AlertTitle>
          <AlertDescription>
            Add <code className="rounded bg-muted px-1">GNEWS_API_KEY</code>{" "}
            in your <code className="rounded bg-muted px-1">.env</code>. Get a free key at{" "}
            <a
              href="https://gnews.io"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              gnews.io
            </a>{" "}
            (100 req/day on the free tier).
          </AlertDescription>
        </Alert>
      )}

      {error === "fetch-failed" && (
        <Alert className="mb-6">
          <AlertCircle className="size-4" />
          <AlertTitle>We couldn't load the news</AlertTitle>
          <AlertDescription>
            Try again in a few minutes.
          </AlertDescription>
        </Alert>
      )}

      {!error && articles.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No recent news yet.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <NewsCard key={a.url} article={a} />
        ))}
      </div>
    </main>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const published = new Date(article.publishedAt);
  const relative = formatRelative(published);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group block"
    >
      <Card className="h-full transition hover:ring-primary/40">
        {article.image ? (
          // Using plain <img> on purpose: news images come from dozens of
          // publisher CDNs and whitelisting every hostname in next.config
          // is not worth it for an external feed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted">
            <Newspaper className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2 group-hover:text-primary">
            {article.title}
          </CardTitle>
          {article.description && (
            <CardDescription className="line-clamp-3">
              {article.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate font-medium">{article.source}</span>
          <span className="flex items-center gap-1">
            {relative}
            <ExternalLink className="size-3" />
          </span>
        </CardContent>
      </Card>
    </a>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
