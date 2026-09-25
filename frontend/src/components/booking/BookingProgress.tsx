import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = ["Trip", "Vehicle", "Documents", "Agreement", "Payment", "Confirmed"];

export default function BookingProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const complete = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs transition-colors",
                  complete && "border-brass bg-brass text-obsidian",
                  active && "border-brass text-brass",
                  !complete && !active && "border-graphite-line text-steel"
                )}
              >
                {complete ? <Check size={14} /> : stepNum}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] sm:block",
                  active ? "text-ivory" : "text-steel"
                )}
              >
                {label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <div className={cn("mx-2 h-px flex-1", complete ? "bg-brass" : "bg-graphite-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
