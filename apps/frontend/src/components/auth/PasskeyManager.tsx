"use client";

import { FormEvent, useState } from "react";
import type { Passkey } from "@better-auth/passkey";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { authClient } from "@/src/lib/auth/client";

type PasskeyError = {
  code?: string;
  message?: unknown;
};

function getErrorMessage(error: PasskeyError | null | undefined, fallback: string) {
  if (error?.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
    return "Esta llave de acceso ya está registrada en tu cuenta.";
  }

  if (error?.code === "ERROR_CEREMONY_ABORTED") {
    return "Cancelaste la creación de la llave de acceso.";
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    if (error.message.toLowerCase().includes("fresh")) {
      return "Por seguridad, volvé a iniciar sesión antes de agregar una llave de acceso.";
    }
    return error.message;
  }

  return fallback;
}

function formatCreatedAt(createdAt: Passkey["createdAt"]) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPasskeyDescription(passkey: Passkey) {
  if (passkey.backedUp || passkey.deviceType === "multiDevice") {
    return "Sincronizada entre tus dispositivos";
  }

  return "Guardada en este dispositivo o llave física";
}

export default function PasskeyManager() {
  const {
    data: passkeys,
    isPending,
    error: listError,
  } = authClient.useListPasskeys();
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleAddPasskey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!("PublicKeyCredential" in window)) {
      setError("Este navegador no permite usar llaves de acceso.");
      return;
    }

    try {
      setIsAdding(true);
      const result = await authClient.passkey.addPasskey({
        name: name.trim() || undefined,
      });

      if (result.error) {
        setError(
          getErrorMessage(
            result.error,
            "No pudimos crear la llave de acceso. Intentá nuevamente."
          )
        );
        return;
      }

      setName("");
      setSuccess("Llave de acceso creada correctamente.");
    } catch (addError) {
      console.error("Error adding passkey", addError);
      setError("No pudimos crear la llave de acceso. Intentá nuevamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRename = async (id: string) => {
    const nextName = editingName.trim();

    if (!nextName) {
      setError("Escribí un nombre para identificar esta llave de acceso.");
      return;
    }

    clearMessages();

    try {
      setBusyId(id);
      const result = await authClient.passkey.updatePasskey({
        id,
        name: nextName,
      });

      if (result.error) {
        setError(
          getErrorMessage(result.error, "No pudimos cambiar el nombre de la llave.")
        );
        return;
      }

      setEditingId(null);
      setEditingName("");
      setSuccess("Nombre de la llave actualizado.");
    } catch (renameError) {
      console.error("Error renaming passkey", renameError);
      setError("No pudimos cambiar el nombre de la llave.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    clearMessages();

    try {
      setBusyId(id);
      const result = await authClient.passkey.deletePasskey({ id });

      if (result.error) {
        setError(getErrorMessage(result.error, "No pudimos eliminar la llave."));
        return;
      }

      setDeletingId(null);
      setSuccess("Llave de acceso eliminada.");
    } catch (deleteError) {
      console.error("Error deleting passkey", deleteError);
      setError("No pudimos eliminar la llave.");
    } finally {
      setBusyId(null);
    }
  };

  const currentPasskeys = passkeys ?? [];

  return (
    <section
      aria-labelledby="passkey-heading"
      className="space-y-4 rounded-2xl border border-[#CFEEED] bg-[#F4FAFB] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-white p-2 text-[#079995] shadow-sm" aria-hidden="true">
          <KeyRound size={22} strokeWidth={2.25} />
        </span>
        <div className="space-y-1">
          <h2 id="passkey-heading" className="text-lg font-black text-black">
            Llaves de acceso
          </h2>
          <p className="text-sm leading-5 text-zinc-600">
            Entrá con tu huella, rostro o PIN sin escribir email ni contraseña.
          </p>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleAddPasskey}>
        <div className="space-y-2">
          <label htmlFor="passkeyName" className="text-sm font-bold text-zinc-800">
            Nombre de la llave <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="passkeyName"
            name="passkeyName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={64}
            autoComplete="off"
            placeholder="Ej. iPhone personal"
            className="w-full rounded-2xl border border-[#CFEEED] bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-[#07BAB5] focus:ring-2 focus:ring-[#07BAB5]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isAdding}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#07BAB5] px-4 py-3 font-bold text-white transition hover:bg-[#079995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07BAB5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} aria-hidden="true" />
          {isAdding ? "Esperando confirmación..." : "Agregar una llave de acceso"}
        </button>
      </form>

      <div aria-live="polite" className="space-y-3">
        {(error || listError) && (
          <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error ?? "No pudimos cargar tus llaves de acceso."}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {success}
          </p>
        )}
      </div>

      <div className="border-t border-[#CFEEED] pt-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-700">
          Tus llaves
        </h3>

        {isPending ? (
          <p role="status" className="text-sm text-zinc-600">
            Cargando llaves de acceso...
          </p>
        ) : currentPasskeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#9DD9D7] bg-white px-4 py-5 text-center">
            <ShieldCheck className="mx-auto mb-2 text-[#07BAB5]" size={24} aria-hidden="true" />
            <p className="text-sm font-bold text-zinc-800">Todavía no agregaste ninguna llave.</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Tu contraseña seguirá funcionando como alternativa.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {currentPasskeys.map((passkey, index) => {
              const displayName = passkey.name?.trim() || `Llave de acceso ${index + 1}`;
              const isBusy = busyId === passkey.id;
              const isEditing = editingId === passkey.id;
              const isConfirmingDelete = deletingId === passkey.id;

              return (
                <li key={passkey.id} className="rounded-2xl border border-[#CFEEED] bg-white p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <label htmlFor={`passkey-${passkey.id}`} className="text-sm font-bold text-zinc-800">
                        Nombre de la llave
                      </label>
                      <input
                        id={`passkey-${passkey.id}`}
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        maxLength={64}
                        className="w-full rounded-xl border border-[#CFEEED] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#07BAB5] focus:ring-2 focus:ring-[#07BAB5]/20"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          disabled={isBusy}
                          className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRename(passkey.id)}
                          disabled={isBusy}
                          className="rounded-xl bg-[#07BAB5] px-3 py-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07BAB5] disabled:opacity-60"
                        >
                          {isBusy ? "Guardando..." : "Guardar nombre"}
                        </button>
                      </div>
                    </div>
                  ) : isConfirmingDelete ? (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-zinc-900">¿Eliminar “{displayName}”?</p>
                      <p className="text-xs leading-5 text-zinc-600">
                        {currentPasskeys.length === 1
                          ? "Es tu última llave. Podrás seguir ingresando con email y contraseña."
                          : "Este dispositivo dejará de servir para ingresar con esta llave."}
                      </p>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          disabled={isBusy}
                          className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(passkey.id)}
                          disabled={isBusy}
                          className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60"
                        >
                          {isBusy ? "Eliminando..." : "Confirmar eliminación"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <KeyRound className="mt-0.5 shrink-0 text-[#07BAB5]" size={20} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-zinc-900">{displayName}</p>
                          <p className="text-xs leading-5 text-zinc-500">
                            {getPasskeyDescription(passkey)} · Creada el {formatCreatedAt(passkey.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            clearMessages();
                            setDeletingId(null);
                            setEditingId(passkey.id);
                            setEditingName(displayName);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#E6F7F6] px-3 py-2 text-xs font-bold text-[#087A77] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07BAB5]"
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Renombrar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            clearMessages();
                            setEditingId(null);
                            setDeletingId(passkey.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
