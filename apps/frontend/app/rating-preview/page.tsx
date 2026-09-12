"use client";

import { useMemo, useState } from "react";
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
    <main className="min-h-screen bg-white pt-4 sm:px-4">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <RatingFlow
          initials="FM"
          reviewerName="FRANCISCO MANFREDI"
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
          onCancel={() => undefined}
        />
      </div>
    </main>
  );
}
