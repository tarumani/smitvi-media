import { prisma } from "@/lib/prisma";
import type { AnalyticsEventType } from "@prisma/client";

export async function trackEvent(input: {
  type: AnalyticsEventType;
  sessionId: string;
  userId?: string | null;
  videoId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.analyticsEvent.create({
    data: {
      type: input.type,
      sessionId: input.sessionId,
      userId: input.userId ?? undefined,
      videoId: input.videoId ?? undefined,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    },
  });
}

export function hoursDedup() {
  return Number(process.env.ANALYTICS_VIEW_DEDUP_HOURS ?? 6);
}
