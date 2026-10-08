import { DisciplineMark } from "@/components/icons/motivation";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "h-8 w-8 rounded-xl", icon: "h-[1.1rem] w-[1.1rem]", word: "text-lg", tld: "hidden text-[11px] sm:inline" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-8 w-8", word: "text-4xl", tld: "text-base" },
};

export function BrandLogo({ size = "sm", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2", className)} aria-label="discip.uz">
      <span className={cn("flex items-center justify-center gradient-primary text-primary-foreground shadow-glow", s.box)}>
        <DisciplineMark className={s.icon} strokeWidth={2.5} />
      </span>
      <span className="flex items-baseline leading-none" aria-hidden="true">
        <span
          className={cn(
            "font-black uppercase tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
            s.word
          )}
        >
          Discip
        </span>
        <span className={cn("font-semibold text-muted-foreground", s.tld)}>.uz</span>
      </span>
    </span>
  );
}
