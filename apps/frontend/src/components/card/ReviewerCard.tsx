import clsx from "clsx";
import ScoreBadge, { getScoreLabel, getScoreStyles } from "@/src/components/score/ScoreBadge";
import { getRatingSemanticLabel } from "@/src/components/reviews/review-rating-config";
import { BadgeDollarSign, ChevronDown, MapPin, Martini, Pencil, Utensils, ConciergeBell } from "lucide-react";

type ReviewerCardVariant = "open" | "close";

interface ReviewerCardSection {
    id: string;
    title: string;
    subtitle: string;
    score?: number | null;
    statusLabel?: string;
}

interface ReviewerCardProps {
    initials: string;
    name: string;
    surname: string;
    score?: number | null;
    sections?: ReviewerCardSection[];
    variant?: ReviewerCardVariant;
    onClick?: () => void;
    onEditScore?: () => void;
    className?: string;
}

function SectionIcon({ sectionId }: { sectionId: string }) {
    if (sectionId === "foodRating") {
        return <Utensils className="h-5 w-5 text-[#07BAB5]" aria-hidden="true" />;
    }

    if (sectionId === "beverageRating") {
        return <Martini className="h-5 w-5 text-[#07BAB5]" aria-hidden="true" />;
    }

    if (sectionId === "serviceRating") {
        return <ConciergeBell className="h-5 w-5 text-[#07BAB5]" aria-hidden="true" />;
    }

    if (sectionId === "valueRating") {
        return <BadgeDollarSign className="h-5 w-5 text-[#07BAB5]" aria-hidden="true" />;
    }

    return <MapPin className="h-5 w-5 text-[#07BAB5]" aria-hidden="true" />;
}

function ReviewerSectionRow({ section }: { section: ReviewerCardSection }) {
    const styles = getScoreStyles(section.score);
    const label = section.statusLabel?.trim() || getRatingSemanticLabel(section.id, section.score);

    return (
        <div className="inline-flex self-stretch items-center justify-between">
            <div className="inline-flex items-center justify-start gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[inset_0px_4px_8.3px_0px_rgba(0,0,0,0.25)]">
                    <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
                        <SectionIcon sectionId={section.id} />
                    </span>
                </div>

                <div className="inline-flex flex-col items-start justify-start">
                    <div className="self-stretch text-sm font-bold text-black">
                        {section.title}
                    </div>
                    <div className="self-stretch text-[10px] font-normal text-black">
                        {section.subtitle}
                    </div>
                    <div className={clsx("self-stretch text-[8px] font-black uppercase", styles.labelText)}>
                        {label}
                    </div>
                </div>
            </div>

            <ScoreBadge score={section.score} showText={false} />
        </div>
    );
}

function ReviewerChevron({ isOpen }: { isOpen: boolean }) {
    return (
        <span
            className={clsx(
                "inline-flex h-4 w-4 items-center justify-center text-[#07BAB5] transition-transform",
                isOpen ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
        >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
    );
}

export type { ReviewerCardProps, ReviewerCardSection, ReviewerCardVariant };

export default function ReviewerCard({
    initials,
    name,
    surname,
    score,
    sections = [],
    variant = "close",
    onClick,
    onEditScore,
    className,
}: ReviewerCardProps) {
    const isOpen = variant === "open";
    const overallLabel = getScoreLabel(score);

    return (
        <div className={clsx("inline-flex w-96 flex-col items-center justify-center gap-2.5", className)}>
            <div
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                onClick={onClick}
                onKeyDown={(event) => {
                    if (!onClick) {
                        return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClick();
                    }
                }}
                className={clsx(
                    "inline-flex self-stretch flex-col items-center justify-start gap-2.5 overflow-hidden rounded-2xl bg-slate-100 px-4 py-2.5 text-left outline outline-1 outline-offset-[-1px] outline-[#CFEEED]",
                    onClick ? "cursor-pointer" : ""
                )}
            >
                <div className="inline-flex w-full items-center justify-between">
                    <div className="flex h-12 w-52 items-center justify-start gap-2">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#07BAB5] p-2.5">
                            <span className="text-center text-2xl font-black text-white">
                                {initials}
                            </span>
                        </div>

                        <div className="inline-flex h-12 w-36 flex-col items-center justify-center overflow-hidden py-1">
                            <div className="self-stretch text-base font-bold text-black">
                                {name}
                            </div>
                            <div className="inline-flex self-stretch flex-wrap items-center justify-start gap-1">
                                <div className="text-center text-xs font-bold text-black">
                                    {surname}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScoreBadge score={score} showText={true} label={overallLabel} />
                    <ReviewerChevron isOpen={isOpen} />
                </div>

                {isOpen && (
                    <>
                        <div className="flex self-stretch flex-col items-start justify-center gap-2">
                            {sections.map((section) => (
                                <ReviewerSectionRow key={section.id} section={section} />
                            ))}
                        </div>

                        {onEditScore && (
                            <div className="flex self-stretch flex-col items-start justify-start gap-2.5">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onEditScore();
                                    }}
                                    className="inline-flex w-44 items-center justify-center gap-4 overflow-hidden rounded-2xl bg-[#F4FAFB] px-5 py-4 text-[#07BAB5] outline outline-1 outline-offset-[-1px] outline-[#CFEEED]"
                                >
                                    <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="w-24 text-center text-[10px] font-black tracking-wider">
                                        EDITAR PUNTUACION
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
