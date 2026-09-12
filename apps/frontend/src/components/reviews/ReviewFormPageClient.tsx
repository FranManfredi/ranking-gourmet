"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantTopBar from "@/src/components/restaurants/RestaurantTopBar";
import RatingFlow, { ReviewerFormSection } from "@/src/components/reviews/RatingFlow";
import {
  REVIEW_RATING_CATEGORIES,
  type ReviewRatingId,
} from "@/src/components/reviews/review-rating-config";
import { ReviewerDTO, getAllReviewers } from "@/src/lib/reviewers/client";
import { createReview, ReviewDTO, updateReview } from "@/src/lib/reviews/client";
import { getVisitById, VisitWithDetailsDTO } from "@/src/lib/visits/client";

interface ReviewFormPageClientProps {
  visitId: string;
  currentUserId: string;
}

function reviewerInitials(reviewer: ReviewerDTO) {
  return `${reviewer.name[0] ?? ""}${reviewer.surname[0] ?? ""}`.toUpperCase() || "??";
}

function buildSections(review?: ReviewDTO | null): ReviewerFormSection[] {
  return REVIEW_RATING_CATEGORIES.map((section) => ({
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    score: review?.[section.id] ?? 5,
  }));
}

export default function ReviewFormPageClient({
  visitId,
  currentUserId,
}: ReviewFormPageClientProps) {
  const router = useRouter();
  const [visit, setVisit] = useState<VisitWithDetailsDTO | null>(null);
  const [reviewer, setReviewer] = useState<ReviewerDTO | null>(null);
  const [existingReview, setExistingReview] = useState<ReviewDTO | null>(null);
  const [sections, setSections] = useState<ReviewerFormSection[]>(buildSections());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviewForm = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [visitData, reviewers] = await Promise.all([
          getVisitById(visitId),
          getAllReviewers(),
        ]);

        const currentReviewer = reviewers.find((item) => item.userId === currentUserId) ?? null;
        const currentReview = currentReviewer
          ? visitData.reviews.find((review) => review.reviewerId === currentReviewer.id) ?? null
          : null;

        setVisit(visitData);
        setReviewer(currentReviewer);
        setExistingReview(currentReview);
        setSections(buildSections(currentReview));

        if (!currentReviewer) {
          setError("No encontramos un evaluador asociado a tu usuario.");
        }
      } catch (loadError) {
        console.error("Error loading review form", loadError);
        setError("No pudimos cargar la evaluacion.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReviewForm();
  }, [currentUserId, visitId]);

  const averageScore = useMemo(() => {
    if (!sections.length) {
      return null;
    }

    return sections.reduce((total, section) => total + section.score, 0) / sections.length;
  }, [sections]);

  const handleSectionChange = (sectionId: ReviewRatingId, value: number) => {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId ? { ...section, score: value } : section
      )
    );
  };

  const handleSubmit = async () => {
    if (!visit || !reviewer) {
      return;
    }

    const payload = {
      foodRating: sections.find((section) => section.id === "foodRating")?.score ?? 5,
      beverageRating: sections.find((section) => section.id === "beverageRating")?.score ?? 5,
      serviceRating: sections.find((section) => section.id === "serviceRating")?.score ?? 5,
      valueRating: sections.find((section) => section.id === "valueRating")?.score ?? 5,
      ambianceRating: sections.find((section) => section.id === "ambianceRating")?.score ?? 5,
    };

    try {
      setIsSubmitting(true);
      setError(null);

      if (existingReview) {
        await updateReview(existingReview.id, payload);
      } else {
        await createReview({
          reviewerId: reviewer.id,
          visitId: visit.id,
          ...payload,
        });
      }

      router.push(`/visits/${visit.id}`);
    } catch (submitError) {
      console.error("Error saving review", submitError);
      setError("No pudimos guardar la evaluacion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-4 py-6">
        <p className="text-sm font-semibold text-[#07BAB5]">Cargando evaluacion...</p>
      </main>
    );
  }

  if (!visit) {
    return (
      <main className="min-h-screen bg-white px-4 py-6">
        <p className="text-sm font-semibold text-red-500">
          {error ?? "No encontramos la visita."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <RestaurantTopBar
        name={visit.restaurant.name}
        address={visit.restaurant.address}
        city={visit.restaurant.city}
        score={averageScore}
        backHref={`/visits/${visit.id}`}
      />

      <div className="flex flex-col items-center px-0 pt-4 sm:px-4 sm:pb-10">
        {error && (
          <div className="mb-4 w-full max-w-lg px-4 sm:px-0">
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</p>
          </div>
        )}

        {reviewer && (
          <RatingFlow
            initials={reviewerInitials(reviewer)}
            reviewerName={`${reviewer.name} ${reviewer.surname}`.toUpperCase()}
            sections={sections}
            averageScore={averageScore ?? 5}
            isSubmitting={isSubmitting}
            isEditingExistingReview={Boolean(existingReview)}
            onSectionChange={handleSectionChange}
            onSubmit={() => void handleSubmit()}
            onCancel={() => router.back()}
          />
        )}
      </div>
    </main>
  );
}
