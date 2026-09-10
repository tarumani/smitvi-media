/**
 * Isolated ranking module — replace later without touching UI.
 * Trending Score = engagement + views + recent growth + recency
 */
export function computeTrendingScore(input: {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeSec: number;
  recentViews: number;
  publishedAt: Date | null;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const published = input.publishedAt ?? now;
  const ageHours = Math.max(1, (now.getTime() - published.getTime()) / 3_600_000);

  const engagement =
    input.likes * 8 + input.comments * 12 + input.shares * 10 + input.watchTimeSec * 0.02;

  const recencyBoost = 100 / Math.sqrt(ageHours);
  const growth = input.recentViews * 4;
  const views = Math.log10(input.views + 1) * 20;

  return Number((engagement + views + growth + recencyBoost).toFixed(4));
}
