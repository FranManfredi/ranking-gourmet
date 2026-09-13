import {
  BadgeDollarSign,
  ConciergeBell,
  MapPin,
  Martini,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type ReviewRatingId =
  | "foodRating"
  | "beverageRating"
  | "serviceRating"
  | "valueRating"
  | "ambianceRating";

export interface ReviewRatingCategory {
  id: ReviewRatingId;
  title: string;
  subtitle: string;
  question: string;
  color: string;
  textColor: string;
  softColor: string;
  icon: LucideIcon;
}

// The current product uses one shared category accent. Keeping it centralized here
// preserves the existing identity and leaves room for category-specific tokens later.
export const REVIEW_RATING_CATEGORIES: readonly ReviewRatingCategory[] = [
  {
    id: "foodRating",
    title: "COMIDA",
    subtitle: "SABOR Y PRESENTACIÓN",
    question: "¿Cómo estuvo la comida?",
    color: "#07BAB5",
    textColor: "#087A77",
    softColor: "#E6F7F6",
    icon: Utensils,
  },
  {
    id: "beverageRating",
    title: "BEBIDAS",
    subtitle: "CARTA Y COCTELERÍA",
    question: "¿Cómo estuvieron las bebidas?",
    color: "#07BAB5",
    textColor: "#087A77",
    softColor: "#E6F7F6",
    icon: Martini,
  },
  {
    id: "serviceRating",
    title: "SERVICIO",
    subtitle: "ATENCIÓN Y RAPIDEZ",
    question: "¿Cómo estuvo el servicio?",
    color: "#07BAB5",
    textColor: "#087A77",
    softColor: "#E6F7F6",
    icon: ConciergeBell,
  },
  {
    id: "valueRating",
    title: "VALOR PERCIBIDO",
    subtitle: "RELACIÓN PRECIO/CALIDAD",
    question: "¿Cómo fue la relación precio/calidad?",
    color: "#07BAB5",
    textColor: "#087A77",
    softColor: "#E6F7F6",
    icon: BadgeDollarSign,
  },
  {
    id: "ambianceRating",
    title: "AMBIENTE",
    subtitle: "CLIMA Y DECORACIÓN",
    question: "¿Cómo estuvo el ambiente?",
    color: "#07BAB5",
    textColor: "#087A77",
    softColor: "#E6F7F6",
    icon: MapPin,
  },
] as const;

type RatingBand = "low" | "regular" | "good" | "excellent";

const CATEGORY_RATING_LABELS: Record<ReviewRatingId, Record<RatingBand, string>> = {
  foodRating: {
    low: "Incomible",
    regular: "Decepcionante",
    good: "Sabrosa",
    excellent: "Memorable",
  },
  beverageRating: {
    low: "Escasa",
    regular: "Limitada",
    good: "Variada",
    excellent: "Amplia",
  },
  serviceRating: {
    low: "Deficiente",
    regular: "Descuidado",
    good: "Adecuado",
    excellent: "Impecable",
  },
  valueRating: {
    low: "Muy caro",
    regular: "Caro",
    good: "Razonable",
    excellent: "Conveniente",
  },
  ambianceRating: {
    low: "Desagradable",
    regular: "Incómodo",
    good: "Agradable",
    excellent: "Atractivo",
  },
};

function getRatingBand(value: number): RatingBand {
  if (value <= 3) return "low";
  if (value <= 6) return "regular";
  if (value <= 8) return "good";
  return "excellent";
}

export function getRatingSemanticLabel(
  categoryId: string,
  value?: number | null
) {
  if (!value || value < 1 || value > 10 || !(categoryId in CATEGORY_RATING_LABELS)) {
    return "Sin datos";
  }

  return CATEGORY_RATING_LABELS[categoryId as ReviewRatingId][getRatingBand(value)];
}
