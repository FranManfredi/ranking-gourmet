"use client";

import { useState } from "react";
import RatingStep from "./RatingStep";
import RatingSummary from "./RatingSummary";
import styles from "./RatingFlow.module.css";
import {
  REVIEW_RATING_CATEGORIES,
  type ReviewRatingId,
} from "./review-rating-config";

export interface ReviewerFormSection {
  id: ReviewRatingId;
  title: string;
  subtitle: string;
  score: number;
}

interface RatingFlowProps {
  sections: ReviewerFormSection[];
  averageScore: number;
  isSubmitting: boolean;
  isEditingExistingReview: boolean;
  onSectionChange: (sectionId: ReviewRatingId, value: number) => void;
  onSubmit: () => void;
}

export default function RatingFlow({
  sections,
  averageScore,
  isSubmitting,
  isEditingExistingReview,
  onSectionChange,
  onSubmit,
}: RatingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [editingFromSummary, setEditingFromSummary] = useState(false);
  const category = REVIEW_RATING_CATEGORIES[currentStep];
  const value = sections.find((section) => section.id === category.id)?.score ?? 5;

  const goToStep = (nextStep: number) => {
    if (nextStep < 0 || nextStep >= REVIEW_RATING_CATEGORIES.length) return;
    setDirection(nextStep > currentStep ? "forward" : "backward");
    setCurrentStep(nextStep);
  };

  const handleNext = () => {
    if (currentStep === REVIEW_RATING_CATEGORIES.length - 1) {
      setShowSummary(true);
      setEditingFromSummary(false);
      return;
    }

    goToStep(currentStep + 1);
  };

  const handleEdit = (categoryId: ReviewRatingId) => {
    const categoryIndex = REVIEW_RATING_CATEGORIES.findIndex((item) => item.id === categoryId);
    if (categoryIndex < 0) return;

    setCurrentStep(categoryIndex);
    setDirection("backward");
    setEditingFromSummary(true);
    setShowSummary(false);
  };

  const returnToSummary = () => {
    setShowSummary(true);
    setEditingFromSummary(false);
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden bg-slate-50 sm:rounded-[2rem] sm:border sm:border-[#CFEEED] sm:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      {showSummary ? (
        <div className="min-h-0 flex-1">
          <RatingSummary
            categories={REVIEW_RATING_CATEGORIES}
            sections={sections}
            averageScore={averageScore}
            isSubmitting={isSubmitting}
            isEditingExistingReview={isEditingExistingReview}
            onEdit={handleEdit}
            onPublish={onSubmit}
          />
        </div>
      ) : (
        <div
          key={category.id}
          className={`min-h-0 flex-1 ${direction === "forward" ? styles.stepForward : styles.stepBackward}`}
        >
          <RatingStep
            category={category}
            value={value}
            currentStep={currentStep}
            totalSteps={REVIEW_RATING_CATEGORIES.length}
            isFirst={currentStep === 0}
            isLast={currentStep === REVIEW_RATING_CATEGORIES.length - 1}
            canReturnToSummary={editingFromSummary}
            onChange={(nextValue) => onSectionChange(category.id, nextValue)}
            onNext={handleNext}
            onPrevious={() => goToStep(currentStep - 1)}
            onReturnToSummary={returnToSummary}
          />
        </div>
      )}
    </div>
  );
}
