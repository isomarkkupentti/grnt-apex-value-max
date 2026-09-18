import { cn } from "@/lib/utils";

export function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
}: {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number[];
  onValueChange: (v: number[]) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? min}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn(
        "h-11 w-full cursor-pointer appearance-none bg-transparent accent-accent",
        className,
      )}
    />
  );
}
