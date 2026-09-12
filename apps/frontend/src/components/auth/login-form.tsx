"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";
import { authClient } from "@/src/lib/auth/client";

interface FormStatus {
  status: "idle" | "error" | "success";
  message?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { error: sessionError } = authClient.useSession();

  const [status, setStatus] = useState<FormStatus>({ status: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsingPasskey, setIsUsingPasskey] = useState(false);
  const [supportsPasskeys, setSupportsPasskeys] = useState(true);
  const conditionalUiStarted = useRef(false);

  useEffect(() => {
    const supported = "PublicKeyCredential" in window;
    setSupportsPasskeys(supported);

    if (!supported || conditionalUiStarted.current) {
      return;
    }

    const publicKeyCredential = window.PublicKeyCredential as typeof PublicKeyCredential & {
      isConditionalMediationAvailable?: () => Promise<boolean>;
    };

    if (!publicKeyCredential.isConditionalMediationAvailable) {
      return;
    }

    conditionalUiStarted.current = true;
    void publicKeyCredential
      .isConditionalMediationAvailable()
      .then((available) => {
        if (!available) return;

        return authClient.signIn.passkey({
          autoFill: true,
          fetchOptions: {
            onSuccess() {
              window.location.replace("/home");
            },
          },
        });
      })
      .catch(() => {
        // Conditional UI is an enhancement; the explicit button remains available.
      });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const rememberMe = formData.get("rememberMe") === "on";

    if (!email || !password) {
      setStatus({ status: "error", message: "Completá tu email y contraseña." });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ status: "idle" });

      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/home",
        rememberMe,
      });

      if (result.error) {
        setStatus({
          status: "error",
          message:
              result.error.message ??
              "No pudimos validar las credenciales. Revisá los datos e intentá nuevamente.",
        });
        return;
      }

      setStatus({ status: "success", message: "Inicio de sesión correcto." });
      form.reset();
      authClient.$store.notify("$sessionSignal");
      router.replace("/home");
      router.refresh();
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setStatus({
        status: "error",
        message: "Ocurrió un error inesperado. Intentá nuevamente en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!supportsPasskeys) {
      setStatus({
        status: "error",
        message: "Este navegador no permite usar llaves de acceso.",
      });
      return;
    }

    try {
      setIsUsingPasskey(true);
      setStatus({ status: "idle" });

      const result = await authClient.signIn.passkey();

      if (result.error) {
        setStatus({
          status: "error",
          message:
            "code" in result.error && result.error.code === "AUTH_CANCELLED"
              ? "No se completó el ingreso con la llave de acceso."
              : "No pudimos validar la llave de acceso. Intentá nuevamente.",
        });
        return;
      }

      setStatus({ status: "success", message: "Inicio de sesión correcto." });
      authClient.$store.notify("$sessionSignal");
      router.replace("/home");
      router.refresh();
    } catch (passkeyError) {
      console.error("Error signing in with passkey", passkeyError);
      setStatus({
        status: "error",
        message: "No pudimos validar la llave de acceso. Intentá nuevamente.",
      });
    } finally {
      setIsUsingPasskey(false);
    }
  };

  return (
    <section className="w-full max-w-md space-y-6 rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-lg backdrop-blur">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Ranking Gourmet
        </p>
        <h2 className="text-3xl font-semibold text-zinc-900">Iniciá sesión</h2>
        <p className="text-sm text-zinc-500">
          Elegí cómo querés entrar a tu cuenta.
        </p>
      </header>

      {sessionError && (
        <p role="alert" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No pudimos recuperar tu sesión actual. {sessionError.message}
        </p>
      )}

      {status.status === "error" && (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {status.message}
        </p>
      )}

      {status.status === "success" && (
        <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {status.message}
        </p>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username webauthn"
            required
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="tucuenta@ranking.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="••••••••"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-600">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            className="h-[18px] w-[18px] rounded border border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            defaultChecked
          />
          Recordarme en este dispositivo
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">o</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <button
        type="button"
        onClick={() => void handlePasskeyLogin()}
        disabled={isSubmitting || isUsingPasskey || !supportsPasskeys}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-white px-6 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
      >
        <Fingerprint size={21} aria-hidden="true" />
        {isUsingPasskey ? "Esperando confirmación..." : "Ingresar con una llave de acceso"}
      </button>

      {!supportsPasskeys && (
        <p className="text-center text-xs leading-5 text-zinc-500">
          Tu navegador no permite usar llaves de acceso. Podés ingresar con tu contraseña.
        </p>
      )}
    </section>
  );
}
