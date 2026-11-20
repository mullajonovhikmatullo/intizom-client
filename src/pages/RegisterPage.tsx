import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { isAuthenticated, register } from "@/lib/auth";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (password.length < 8) {
      toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const user = await register(trimmedName, trimmedEmail, password);
      toast.success(`Xush kelibsiz, ${user.name}!`);
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        toast.error("Bu email bilan hisob allaqachon mavjud");
        return;
      }

      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Ro'yxatdan o'tish muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="flex justify-center">
            <BrandLogo size="lg" />
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Yangi hisob yaratib davom eting
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ism</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ismingiz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Kamida 8 ta belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
