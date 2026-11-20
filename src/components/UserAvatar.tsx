import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiAssetUrl } from "@/lib/api";
import type { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Round profile picture with the user's initials as fallback. */
export function UserAvatar({
  user,
  className,
  fallbackClassName,
}: {
  user: Pick<User, "name" | "avatarUrl">;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn("rounded-[9999px]", className)}>
      {user.avatarUrl && (
        <AvatarImage src={apiAssetUrl(user.avatarUrl)} alt="" className="object-cover" />
      )}
      <AvatarFallback className={cn("rounded-[9999px] bg-primary/10 font-semibold text-primary", fallbackClassName)}>
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
