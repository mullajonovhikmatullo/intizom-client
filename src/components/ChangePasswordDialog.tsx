import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, isSessionExpiredError } from "@/lib/api";
import { changePassword } from "@/lib/auth";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  visible: boolean;
  onToggleVisible: () => void;
  error?: string;
}

function PasswordField({ id, label, value, onChange, autoComplete, visible, onToggleVisible, error }: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={MAX_LENGTH}
          className="pr-10"
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [currentError, setCurrentError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
      setCurrentError(undefined);
      setSaving(false);
    }
  }, [open]);

  const newError =
    newPassword && newPassword.length < MIN_LENGTH
      ? `Kamida ${MIN_LENGTH} ta belgi bo'lishi kerak`
      : newPassword && newPassword === currentPassword
        ? "Yangi parol joriy paroldan farq qilishi kerak"
        : undefined;
  const confirmError =
    confirmPassword && confirmPassword !== newPassword ? "Parollar mos kelmadi" : undefined;
  const valid =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_LENGTH &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setCurrentError(undefined);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Parol muvaffaqiyatli o'zgartirildi");
      onOpenChange(false);
    } catch (error) {
      if (isSessionExpiredError(error)) return;

      if (error instanceof ApiError && error.code === "INVALID_CURRENT_PASSWORD") {
        setCurrentError("Joriy parol noto'g'ri");
        return;
      }

      if (error instanceof ApiError && error.code === "RATE_LIMITED") {
        toast.error("Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring");
        return;
      }

      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Parolni o'zgartirib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = () => setShowPasswords((v) => !v);

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parolni o'zgartirish</DialogTitle>
          <DialogDescription>Joriy parolingizni va yangi parolni kiriting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <PasswordField
            id="current-password"
            label="Joriy parol"
            value={currentPassword}
            onChange={(v) => {
              setCurrentPassword(v);
              setCurrentError(undefined);
            }}
            autoComplete="current-password"
            visible={showPasswords}
            onToggleVisible={toggleVisible}
            error={currentError}
          />
          <PasswordField
            id="new-password"
            label="Yangi parol"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            visible={showPasswords}
            onToggleVisible={toggleVisible}
            error={newError}
          />
          <PasswordField
            id="confirm-password"
            label="Yangi parolni tasdiqlang"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            visible={showPasswords}
            onToggleVisible={toggleVisible}
            error={confirmError}
          />
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={!valid || saving}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
