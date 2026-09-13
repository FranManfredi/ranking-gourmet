import clsx from "clsx";

interface ScoreBadgeProps {
    score?: number | null;
    showText?: boolean;
    label?: string;
    className?: string;
}

export interface ScorePalette {
    accent: string;
    foreground: string;
    label: string;
    surface: string;
}

export function getScorePalette(score?: number | null): ScorePalette {
    if (!score || score < 1 || score > 10) {
        return {
            accent: "#9CA3AF",
            foreground: "#9CA3AF",
            label: "#64748B",
            surface: "#F3F4F6",
        };
    }

    if (score <= 3) {
        return {
            accent: "#FF0000",
            foreground: "#FFFFFF",
            label: "#FF0000",
            surface: "#FFDFDF",
        };
    }

    if (score <= 6) {
        return {
            accent: "#FFBF1E",
            foreground: "#644300",
            label: "#644300",
            surface: "#FFF7D6",
        };
    }

    if (score <= 8) {
        return {
            accent: "#9DE000",
            foreground: "#006403",
            label: "#006403",
            surface: "#F1FBCF",
        };
    }

    return {
        accent: "#22C55D",
        foreground: "#FFFFFF",
        label: "#15803D",
        surface: "#DCFCE7",
    };
}

export function getScoreStyles(score?: number | null) {
    if (!score || score < 1 || score > 10) {
        return {
            value: "-",
            box: "bg-[#F3F4F6]",
            text: "text-[#9CA3AF]",
            labelText: "text-[#9CA3AF]",
        };
    }

    if (score <= 3) {
        return {
            value: score.toFixed(2),
            box: "bg-[#FF0000]",
            text: "text-white",
            labelText: "text-[#FF0000]",
        };
    }

    if (score <= 6) {
        return {
            value: score.toFixed(2),
            box: "bg-[#FFBF1E]",
            text: "text-[#644300]",
            labelText: "text-[#644300]",
        };
    }

    if (score <= 8) {
        return {
            value: score.toFixed(2),
            box: "bg-[#9DE000]",
            text: "text-[#006403]",
            labelText: "text-[#006403]",
        };
    }

    return {
        value: score.toFixed(2),
        box: "bg-[#22C55D]",
        text: "text-white",
        labelText: "text-[#22C55D]",
    };
}

export function getScoreLabel(score: number | null | undefined) : string {
    if (!score || score < 1 || score > 10) {
        return "SIN DATOS";
    }
    if (score <= 3) {
        return "Olvidable";
    }
    if (score <= 6) {
        return "Mejorable";
    }
    if (score <= 8) {
        return "Recomendable";
    }
    return "Gourmet";
}

export default function ScoreBadge({
                                       score,
                                       showText = true,
                                       label = getScoreLabel(score),
                                       className,
                                   }: ScoreBadgeProps) {
    const styles = getScoreStyles(score);

    return (
        <div
            className={clsx(
                "inline-flex w-20 flex-col items-center justify-center gap-2",
                className
            )}
        >
            <div
                className={clsx(
                    "inline-flex h-11 self-stretch items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-3.5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
                    styles.box
                )}
            >
                <div
                    className={clsx(
                        "h-6 w-16 text-center text-lg font-black",
                        styles.text
                    )}
                >
                    {styles.value}
                </div>
            </div>

            {showText && (
                <div
                    className={clsx(
                        "text-center text-xs font-black",
                        styles.labelText
                    )}
                >
                    {label}
                </div>
            )}
        </div>
    );
}
