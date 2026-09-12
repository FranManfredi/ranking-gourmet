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

export function getRatingSemanticLabel(value: number) {
  if (value <= 2) return "Muy malo";
  if (value <= 4) return "Malo";
  if (value === 5) return "Regular";
  if (value === 6) return "Aceptable";
  if (value === 7) return "Bueno";
  if (value === 8) return "Muy bueno";
  if (value === 9) return "Excelente";
  return "Excepcional";
}
