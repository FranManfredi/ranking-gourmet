"use client";

import { useRef, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { getScorePalette } from "@/src/components/score/ScoreBadge";
import RatingProgress from "./RatingProgress";
import RatingWheel from "./RatingWheel";
import {
  getRatingSemanticLabel,
  type ReviewRatingCategory,
} from "./review-rating-config";

interface RatingStepProps {
  category: ReviewRatingCategory;
  value: number;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  canReturnToSummary: boolean;
  onChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onReturnToSummary: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
}

const HORIZONTAL_SWIPE_THRESHOLD = 56;

export default function RatingStep({
  category,
  value,
  currentStep,
  totalSteps,
  isFirst,
  isLast,
  canReturnToSummary,
  onChange,
  onNext,
  onPrevious,
  onReturnToSummary,
}: RatingStepProps) {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const CategoryIcon = category.icon;
  const scorePalette = getScorePalette(value);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("[data-rating-wheel]")) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (
      Math.abs(deltaX) < HORIZONTAL_SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.25
    ) {
      return;
    }

    if (deltaX < 0) {
      onNext();
    } else if (!isFirst) {
      onPrevious();
    }
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-full min-h-0 w-full flex-col items-center overflow-hidden px-5 pb-3 pt-4"
      aria-labelledby={`rating-title-${category.id}`}
    >
      <RatingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        categoryColor={category.color}
      />

      <div className="mt-4 flex flex-col items-center text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: category.softColor, color: category.textColor }}
        >
          <CategoryIcon className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
        </div>

        <p
          id={`rating-title-${category.id}`}
          className="mt-3 text-base font-black tracking-[0.16em]"
          style={{ color: category.textColor }}
        >
          {category.title}
        </p>
        <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate-400">
          {category.subtitle}
        </p>
        <h1 className="mt-3 text-balance text-2xl font-bold text-slate-950">
          {category.question}
        </h1>
      </div>

      <div className="mt-4 flex w-full flex-col items-center">
        <RatingWheel
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={onChange}
          label={`Puntuación de ${category.title}: ${value} de 10`}
          color={scorePalette.label}
          surfaceColor={scorePalette.surface}
        />

        <p
          className="mt-3 min-h-7 text-xl font-black"
          style={{ color: scorePalette.label }}
          aria-live="polite"
        >
          {getRatingSemanticLabel(category.id, value)}
        </p>
      </div>

      <div className="mt-auto w-full max-w-md pt-3">
        {canReturnToSummary && (
          <button
            type="button"
            onClick={onReturnToSummary}
            className="mb-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold"
            style={{ color: category.textColor }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Volver al resumen
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirst}
            className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border-2 bg-white px-4 text-sm font-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
            style={{ borderColor: category.softColor, color: category.textColor }}
            aria-label="Categoría anterior"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex min-h-13 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ backgroundColor: category.textColor, boxShadow: `0 12px 28px ${category.color}33` }}
            aria-label={isLast ? "Ver resumen de puntuaciones" : "Siguiente categoría"}
          >
            {isLast ? "Ver resumen" : "Siguiente"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
