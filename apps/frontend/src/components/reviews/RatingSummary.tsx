"use client";

import { ChevronRight, Pencil } from "lucide-react";
import { getScoreLabel, getScorePalette } from "@/src/components/score/ScoreBadge";
import type { ReviewerFormSection } from "./RatingFlow";
import type { ReviewRatingCategory, ReviewRatingId } from "./review-rating-config";

interface RatingSummaryProps {
  categories: readonly ReviewRatingCategory[];
  sections: ReviewerFormSection[];
  averageScore: number;
  isSubmitting: boolean;
  isEditingExistingReview: boolean;
  onEdit: (categoryId: ReviewRatingId) => void;
  onPublish: () => void;
}

export default function RatingSummary({
  categories,
  sections,
  averageScore,
  isSubmitting,
  isEditingExistingReview,
  onEdit,
  onPublish,
}: RatingSummaryProps) {
  const totalPalette = getScorePalette(averageScore);

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden px-5 py-3" aria-labelledby="rating-summary-title">
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.16em] text-slate-400">RESUMEN</p>
        <h1 id="rating-summary-title" className="mt-1 text-2xl font-black text-slate-950">
          Tu puntuación
        </h1>

        <div className="mt-2 flex items-baseline justify-center gap-1" aria-label={`Promedio general ${averageScore.toFixed(1)} de 10`}>
          <span className="text-5xl font-black tracking-tight text-[#087A77]">
            {averageScore.toFixed(1)}
          </span>
          <span className="text-base font-bold text-slate-400">/ 10</span>
        </div>
        <p className="mt-2 text-xl font-black leading-none" style={{ color: totalPalette.label }}>
          {getScoreLabel(averageScore)}
        </p>
        <p className="mt-2 text-xs text-slate-500">Revisá los valores antes de publicar.</p>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-[#CFEEED] bg-white shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
        {categories.map((category, index) => {
          const CategoryIcon = category.icon;
          const score = sections.find((section) => section.id === category.id)?.score ?? 5;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onEdit(category.id)}
              className="flex min-h-14 w-full items-center gap-3 px-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              style={{ borderTop: index === 0 ? undefined : "1px solid #E2E8F0" }}
              aria-label={`Editar ${category.title}, puntuación ${score} de 10`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: category.softColor, color: category.textColor }}
              >
                <CategoryIcon className="h-5 w-5" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-900">{category.title}</span>
                <span className="block truncate text-[11px] font-medium text-slate-400">
                  {category.subtitle}
                </span>
              </span>

              <span className="text-2xl font-black" style={{ color: category.textColor }}>
                {score}
              </span>
              <ChevronRight className="h-5 w-5 text-slate-300" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 pt-3">
        <button
          type="button"
          onClick={() => onEdit(categories[0].id)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#CFEEED] bg-white px-5 text-sm font-black text-[#087A77] transition-transform active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar puntuaciones
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#087A77] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(7,186,181,0.2)] transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditingExistingReview
              ? "Guardar cambios"
              : "Publicar ranking"}
        </button>
      </div>
    </section>
  );
}
