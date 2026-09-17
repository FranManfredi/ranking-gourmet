import { NextRequest } from "next/server";
import { getServerSession, isAdminSession } from "@/src/lib/auth/server";
import { getBackendAuthBaseUrl } from "@/src/lib/config/server";

function getRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");

  if (!host) {
    return "http://localhost:3000";
  }

  return `${forwardedProto ?? "http"}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminSession(session)) {
      return Response.json(
        { message: "Solo un administrador puede crear evaluadores." },
        { status: 403 }
      );
    }

    const payload = (await request.json()) as {
      name?: string;
      surname?: string;
      email?: string;
      password?: string;
    };

    const name = payload.name?.trim() ?? "";
    const surname = payload.surname?.trim() ?? "";
    const email = payload.email?.trim() ?? "";
    const password = payload.password ?? "";

    if (!name || !surname || !email || !password) {
      return Response.json(
        { message: "Faltan datos obligatorios para crear el evaluador." },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie") ?? "";
    const origin = getRequestOrigin(request);

    const createUserResponse = await fetch(`${getBackendAuthBaseUrl()}/admin/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        origin,
        referer: `${origin}/home`,
      },
      body: JSON.stringify({
        name: `${name} ${surname}`.trim(),
        email,
        password,
        role: "user",
        data: {
          surname,
        },
      }),
      cache: "no-store",
    });

    const createUserPayload = (await createUserResponse.json().catch(() => null)) as
      | {
          user?: {
            id?: string;
          };
          message?: string;
          error?: string;
        }
      | null;

    if (!createUserResponse.ok || !createUserPayload?.user?.id) {
      return Response.json(
        {
          message:
            createUserPayload?.message ??
            createUserPayload?.error ??
            "No pudimos crear el usuario del evaluador.",
        },
        { status: createUserResponse.status || 500 }
      );
    }

    return Response.json(createUserPayload, { status: 201 });
  } catch (error) {
    console.error("Evaluator create gateway error", error);
    return Response.json(
      { message: "Failed to create evaluator through backend gateway" },
      { status: 500 }
    );
  }
}
