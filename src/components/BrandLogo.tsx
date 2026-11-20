import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "h-8 w-8", word: "text-lg" },
  lg: { mark: "h-14 w-14", word: "text-4xl" },
};

export function BrandLogo({ size = "sm", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2", className)} aria-label="discip.uz">
      <img
        src="/brand/logo-mark.png"
        alt=""
        width={256}
        height={256}
        decoding="async"
        className={cn("shrink-0 rounded-lg bg-black object-cover shadow-sm ring-1 ring-border/60", s.mark)}
      />
      <span className={cn("font-bold leading-none tracking-tight text-foreground", s.word)} aria-hidden="true">
        Discip
      </span>
    </span>
  );
}
