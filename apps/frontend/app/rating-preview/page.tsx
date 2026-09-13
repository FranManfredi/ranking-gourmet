"use client";

import { useMemo, useState } from "react";
import RestaurantTopBar from "@/src/components/restaurants/RestaurantTopBar";
import RatingFlow, {
  type ReviewerFormSection,
} from "@/src/components/reviews/RatingFlow";
import { REVIEW_RATING_CATEGORIES } from "@/src/components/reviews/review-rating-config";

export default function RatingPreviewPage() {
  const [sections, setSections] = useState<ReviewerFormSection[]>(
    REVIEW_RATING_CATEGORIES.map((category) => ({
      id: category.id,
      title: category.title,
      subtitle: category.subtitle,
      score: 5,
    }))
  );
  const averageScore = useMemo(
    () => sections.reduce((total, section) => total + section.score, 0) / sections.length,
    [sections]
  );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-white">
      <RestaurantTopBar
        name="Restaurante de prueba"
        address="Av. Gourmet 123"
        city="Buenos Aires"
        score={averageScore}
        scoreLabel="PUNTAJE TOTAL"
        backHref="/"
      />
      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col items-center">
        <RatingFlow
          sections={sections}
          averageScore={averageScore}
          isSubmitting={false}
          isEditingExistingReview={false}
          onSectionChange={(sectionId, value) =>
            setSections((current) =>
              current.map((section) =>
                section.id === sectionId ? { ...section, score: value } : section
              )
            )
          }
          onSubmit={() => undefined}
        />
      </div>
    </main>
  );
}
