"use client";

import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { getPublicAuthUrl } from "@/src/lib/config/public";

export const authClient = createAuthClient({
  baseURL: getPublicAuthUrl(),
  plugins: [passkeyClient()],
});

export type AuthSession = (typeof authClient)["$Infer"]["Session"];
