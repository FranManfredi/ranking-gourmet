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
  initials: string;
  reviewerName: string;
  sections: ReviewerFormSection[];
  averageScore: number;
  isSubmitting: boolean;
  isEditingExistingReview: boolean;
  onSectionChange: (sectionId: ReviewRatingId, value: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function RatingFlow({
  initials,
  reviewerName,
  sections,
  averageScore,
  isSubmitting,
  isEditingExistingReview,
  onSectionChange,
  onSubmit,
  onCancel,
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
    <div className="w-full max-w-lg overflow-hidden rounded-t-[2rem] bg-slate-50 sm:rounded-[2rem] sm:border sm:border-[#CFEEED] sm:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07BAB5] text-sm font-black text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold tracking-[0.14em] text-slate-400">EVALUADOR</span>
          <span className="block truncate text-sm font-black text-slate-900">{reviewerName}</span>
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-xl px-3 text-xs font-black text-[#087A77]"
        >
          Cancelar
        </button>
      </div>

      {showSummary ? (
        <RatingSummary
          categories={REVIEW_RATING_CATEGORIES}
          sections={sections}
          averageScore={averageScore}
          isSubmitting={isSubmitting}
          isEditingExistingReview={isEditingExistingReview}
          onEdit={handleEdit}
          onPublish={onSubmit}
        />
      ) : (
        <div
          key={category.id}
          className={direction === "forward" ? styles.stepForward : styles.stepBackward}
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
