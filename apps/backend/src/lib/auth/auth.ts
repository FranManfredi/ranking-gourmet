import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import prisma from "../prisma.js";

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3001").replace(/\/$/, "");
const passkeyRpId = new URL(frontendUrl).hostname;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    
    plugins: [
        admin(),
        passkey({
            rpID: passkeyRpId,
            rpName: "Ranking Gourmet",
            origin: frontendUrl,
            registration: {
                requireSession: true,
            },
            authenticatorSelection: {
                residentKey: "required",
                userVerification: "preferred",
            },
        })
    ],

    emailAndPassword:{
        enabled: true,
    },

    user: {
        additionalFields: {
            surname: {
                type: "string",
                required: false,
                input: true
            },
            role: {
                type: "string",
                required: false,
                input: false, // Evita que los usuarios se asignen roles al registrarse
                defaultValue: "user"
            }
        }
    },

    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.reviewer.create({
                        data: {
                            userId: user.id,
                            name: user.name,
                            surname: (user as any).surname || "", 
                        }
                    });
                }
            }
        }
    },

    secret: process.env.BETTER_AUTH_SECRET,

    baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
    
    trustHost: true,
    trustedProxies: ["loopback", frontendUrl],
    trustedOrigins: [frontendUrl],
    rateLimit: {
        enabled: true
    }
});
