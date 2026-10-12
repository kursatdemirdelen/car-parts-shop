"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { DEMO_ADMIN } from "@/lib/seed";
import { useAdminSession } from "@/state/admin-session";

export function LoginPage() {
  const router = useRouter();
  const { login, loggedIn, hydrated } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && loggedIn) router.replace("/admin");
  }, [hydrated, loggedIn, router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      setPassword("");
      router.replace("/admin");
    } else {
      setError("E-posta veya şifre hatalı. Aşağıdaki demo bilgilerini kullanabilirsin.");
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-[8px] bg-ink text-sm font-bold text-white">KS</span>
          <span className="text-lg font-semibold tracking-tight">Kursat Shop Yönetim</span>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink">Giriş yap</h1>
          <FormField label="E-posta" htmlFor="login-email">
            <Input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
          </FormField>
          <FormField label="Şifre" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
          </FormField>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            Giriş yap
          </Button>
          <div className="rounded-[var(--radius-control)] border border-line bg-surface p-3 text-xs text-ink-soft">
            <p className="font-medium text-ink">Demo giriş bilgileri</p>
            <p className="mt-1 tabular">E-posta: {DEMO_ADMIN.email}</p>
            <p className="tabular">Şifre: {DEMO_ADMIN.password}</p>
          </div>
        </form>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Bu giriş yalnızca demo amaçlıdır; gerçek kimlik doğrulama değildir. Oturum bilgisi tarayıcıda tutulur ve hiçbir güvenlik sağlamaz.
          Canlı kullanımdan önce sunucu taraflı kimlik doğrulama ve yetkilendirme eklenmelidir.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-muted underline underline-offset-2 hover:text-ink">
            Mağazaya dön
          </Link>
        </p>
      </div>
    </main>
  );
}
