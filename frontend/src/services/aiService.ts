import { api } from "@/lib/api";
import type { CarSummaryDto, CarSummary } from "@/types/car";
import { mapCarSummaryDto } from "@/types/car";

export interface AiRecommendResult {
  explanation: string;
  matches: CarSummary[];
}

export async function getAiRecommendation(query: string): Promise<AiRecommendResult> {
  const { data } = await api.post<{ explanation: string; matches: CarSummaryDto[] }>("/ai/recommend", { query });
  return {
    explanation: data.explanation,
    matches: data.matches.map(mapCarSummaryDto),
  };
}
