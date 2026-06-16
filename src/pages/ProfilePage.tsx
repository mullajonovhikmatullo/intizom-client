import { useState } from "react";
import { Mail, User as UserIcon, Pencil, Check, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { StatsContent } from "@/components/StatsContent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { getCurrentUser, updateProfile } from "@/lib/auth";
import { toast } from "sonner";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const user = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [displayUser, setDisplayUser] = useState(user);
  const [saving, setSaving] = useState(false);

  if (!user || !displayUser) return <Navigate to="/login" replace />;

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ name: trimmedName, email: trimmedEmail });
      setDisplayUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      setIsEditing(false);
      toast.success("Ma'lumotlar yangilandi");
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        toast.error("Bu email bilan hisob allaqachon mavjud");
        return;
      }

      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Ma'lumotlarni yangilab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(displayUser.name);
    setEmail(displayUser.email);
    setIsEditing(false);
  };

  return (
    <>
      <AppHeader title="Profil" subtitle="Hisob ma'lumotlari va statistika" />
      <div className="space-y-6 px-4 pt-4">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials(displayUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name" className="text-xs">
                      Ism
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                        placeholder="Ismingiz"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email" className="text-xs">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        placeholder="Email manzilingiz"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={handleSave} className="gap-1" disabled={saving}>
                      <Check className="h-4 w-4" />
                      {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1" disabled={saving}>
                      <X className="h-4 w-4" />
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="truncate text-lg font-semibold">{displayUser.name}</h2>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{displayUser.email}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="mt-3 gap-1"
                  >
                    <Pencil className="h-4 w-4" />
                    Tahrirlash
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <StatsContent />
      </div>
    </>
  );
}
