"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth/client";
import PasskeyManager from "@/src/components/auth/PasskeyManager";
import {
  DEFAULT_SORT_MODE,
  getStoredDefaultSortMode,
  SORT_OPTIONS,
  SortMode,
  storeDefaultSortMode,
} from "@/src/lib/sort-preferences";

export default function AccountPageClient() {
  const router = useRouter();
  const [defaultSortMode, setDefaultSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [filterMessage, setFilterMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    setDefaultSortMode(getStoredDefaultSortMode());
  }, []);

  const handleSaveFilter = () => {
    setIsSavingFilter(true);
    storeDefaultSortMode(defaultSortMode);
    setFilterMessage("Filtro predeterminado actualizado.");
    window.setTimeout(() => setIsSavingFilter(false), 200);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setPasswordError(result.error.message ?? "No pudimos cambiar la contraseña.");
        return;
      }

      setPasswordSuccess("Contraseña actualizada correctamente.");
      event.currentTarget.reset();
    } catch (changePasswordError) {
      console.error("Error changing password", changePasswordError);
      setPasswordError("No pudimos cambiar la contraseña.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);
      await authClient.signOut();
      authClient.$store.notify("$sessionSignal");
      router.replace("/");
      router.refresh();
    } catch (logoutErrorValue) {
      console.error("Error al cerrar sesion", logoutErrorValue);
      setLogoutError("No pudimos cerrar la sesion.");
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-5">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/home"
            className="rounded-2xl bg-[#F4FAFB] px-4 py-2 text-[10px] font-black tracking-wider text-[#07BAB5] outline outline-1 outline-[#CFEEED]"
          >
            VOLVER
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="rounded-2xl bg-[#FFDFDF] px-4 py-2 text-[10px] font-black tracking-wider text-[#FF0000] outline outline-1 outline-[#FF7171] disabled:opacity-60"
          >
            {isLoggingOut ? "SALIENDO..." : "LOG-OUT"}
          </button>
        </div>

        <h1 className="text-3xl font-black leading-8 text-black">Cuenta</h1>

        {logoutError && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {logoutError}
          </p>
        )}

        <section className="space-y-3 rounded-2xl border border-[#CFEEED] bg-[#F4FAFB] p-4">
          <h2 className="text-lg font-black text-black">Filtro predeterminado</h2>

          <select
            id="defaultSortMode"
            value={defaultSortMode}
            onChange={(event) => {
              setDefaultSortMode(event.target.value as SortMode);
              setFilterMessage(null);
            }}
            className="w-full rounded-2xl border border-[#CFEEED] bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#07BAB5]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {filterMessage && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {filterMessage}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveFilter}
              disabled={isSavingFilter}
              className="rounded-2xl bg-[#07BAB5] px-4 py-2 font-bold text-white disabled:opacity-60"
            >
              {isSavingFilter ? "Guardando..." : "Guardar filtro"}
            </button>
          </div>
        </section>

        <PasskeyManager />

        <section
          aria-labelledby="password-heading"
          className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h2 id="password-heading" className="text-lg font-black text-black">
            Cambio de contraseña
          </h2>

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-bold text-zinc-800">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#07BAB5] focus:ring-2 focus:ring-[#07BAB5]/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-bold text-zinc-800">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#07BAB5] focus:ring-2 focus:ring-[#07BAB5]/20"
              />
            </div>

            {passwordError && (
              <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {passwordSuccess}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="rounded-2xl bg-[#07BAB5] px-4 py-2 font-bold text-white disabled:opacity-60"
              >
                {isChangingPassword ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
