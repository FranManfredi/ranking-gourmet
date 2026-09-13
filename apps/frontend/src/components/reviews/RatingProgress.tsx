interface RatingProgressProps {
  currentStep: number;
  totalSteps: number;
  categoryColor: string;
}

export default function RatingProgress({
  currentStep,
  totalSteps,
  categoryColor,
}: RatingProgressProps) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-label={`Categoría ${currentStep + 1} de ${totalSteps}`}
    >
      <p className="text-xs font-bold tracking-wide text-slate-500">
        {currentStep + 1} de {totalSteps}
      </p>

      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <span
              key={index}
              className="h-2 rounded-full transition-[width,opacity,background-color] duration-200"
              style={{
                width: isActive ? 24 : 8,
                backgroundColor: isActive || isComplete ? categoryColor : "#CBD5E1",
                opacity: isActive ? 1 : isComplete ? 0.55 : 0.6,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
