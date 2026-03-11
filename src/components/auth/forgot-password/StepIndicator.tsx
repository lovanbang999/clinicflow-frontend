interface StepIndicatorProps {
  currentIndex: number;
  totalSteps?: number;
}

export function StepIndicator({ currentIndex, totalSteps = 3 }: StepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={[
            'h-2 rounded-full transition-all duration-300',
            i === currentIndex
              ? 'w-6 bg-blue-600'
              : i < currentIndex
                ? 'w-2 bg-blue-300'
                : 'w-2 bg-slate-200',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
