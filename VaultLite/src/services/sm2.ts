export type ReviewRating = 0 | 1 | 2 | 3;

export interface Sm2State {
  repetitionCount: number;
  reviewInterval: number;
  easeFactor: number;
}

export interface Sm2Result extends Sm2State {
  nextReviewDate: string;
}

const MIN_EASE = 1.3;

function mapRatingToQuality(rating: ReviewRating): number {
  // Again Hard Good Easy => 0,3,4,5
  return [0, 3, 4, 5][rating] ?? 0;
}

export function scheduleSm2(state: Sm2State, rating: ReviewRating, now = new Date()): Sm2Result {
  const quality = mapRatingToQuality(rating);

  let repetitionCount = state.repetitionCount;
  let reviewInterval = state.reviewInterval;
  let easeFactor = state.easeFactor;

  if (quality < 3) {
    repetitionCount = 0;
    reviewInterval = 1;
  } else {
    if (repetitionCount === 0) reviewInterval = 1;
    else if (repetitionCount === 1) reviewInterval = 6;
    else reviewInterval = Math.round(reviewInterval * easeFactor);

    repetitionCount += 1;
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const next = new Date(now);
  next.setDate(next.getDate() + reviewInterval);

  return {
    repetitionCount,
    reviewInterval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate: next.toISOString(),
  };
}
