import { api } from "@/lib/api";

export interface Review {
  id: string;
  reviewerName: string;
  overallRating: number;
  cleanlinessRating: number | null;
  conditionRating: number | null;
  comment: string | null;
  createdAt: string;
}

export async function getCarReviews(carId: string): Promise<Review[]> {
  try {
    const { data } = await api.get<Review[]>(`/cars/${carId}/reviews`);
    return data;
  } catch {
    return [];
  }
}

export async function submitReview(input: {
  bookingReference: string;
  overallRating: number;
  cleanlinessRating?: number;
  conditionRating?: number;
  comment?: string;
}): Promise<Review> {
  const { data } = await api.post<Review>("/reviews", input);
  return data;
}
