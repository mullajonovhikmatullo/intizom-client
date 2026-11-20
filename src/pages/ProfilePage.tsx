import { useRef, useState } from "react";
import { Camera, ImageUp, Loader2, Mail, User as UserIcon, Pencil, KeyRound, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, isSessionExpiredError } from "@/lib/api";
import { getCurrentUser, removeAvatar, updateProfile, uploadAvatar } from "@/lib/auth";
import { prepareAvatarImage } from "@/lib/image";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [displayUser, setDisplayUser] = useState(user);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !displayUser) return <Navigate to="/login" replace />;

  const pickImage = () => fileInputRef.current?.click();

  const handleImageChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm faylini tanlang");
      return;
    }

    setAvatarBusy(true);
    try {
      const { blob, name: fileName } = await prepareAvatarImage(file);
      const updated = await uploadAvatar(blob, fileName);
      setDisplayUser(updated);
      toast.success("Profil rasmi yangilandi");
    } catch (error) {
      if (isSessionExpiredError(error)) return;
      if (error instanceof ApiError && error.code === "FILE_TOO_LARGE") {
        toast.error("Rasm hajmi 5 MB dan oshmasligi kerak");
      } else if (error instanceof ApiError && (error.code === "INVALID_IMAGE" || error.code === "UNSUPPORTED_IMAGE_TYPE")) {
        toast.error("Bu rasm formatini o'qib bo'lmadi. JPEG yoki PNG tanlang");
      } else {
        toast.error("Rasmni yuklab bo'lmadi");
      }
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveImage = async () => {
    setAvatarBusy(true);
    try {
      const updated = await removeAvatar();
      setDisplayUser(updated);
      toast.success("Profil rasmi o'chirildi");
    } catch (error) {
      if (!isSessionExpiredError(error)) toast.error("Rasmni o'chirib bo'lmadi");
    } finally {
      setAvatarBusy(false);
    }
  };

  const cameraButton = (
    <button
      type="button"
      onClick={displayUser.avatarUrl ? undefined : pickImage}
      disabled={avatarBusy}
      aria-label={displayUser.avatarUrl ? "Profil rasmini o'zgartirish" : "Profil rasmini yuklash"}
      className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-[9999px] border-2 border-card bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      <Camera className="h-3.5 w-3.5" />
    </button>
  );

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
      if (isSessionExpiredError(error)) return;

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
      <AppHeader title="Profil" />
      <div className="space-y-6 px-4 pt-4">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <UserAvatar user={displayUser} className="h-20 w-20" fallbackClassName="text-xl" />
              {avatarBusy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[9999px] bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground" aria-label="Yuklanmoqda" />
                </div>
              )}
              {displayUser.avatarUrl ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>{cameraButton}</DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onSelect={pickImage}>
                      <ImageUp className="mr-2 h-4 w-4" />
                      Yangi rasm yuklash
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleRemoveImage} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Rasmni o'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                cameraButton
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleImageChosen}
              />
            </div>
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
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Tahrirlash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPasswordDialogOpen(true)}
                      className="gap-1"
                    >
                      <KeyRound className="h-4 w-4" />
                      Parolni o'zgartirish
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

      </div>
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </>
  );
}
