"use server";

import { redirect } from "next/navigation";

import {
  authenticateUser,
  clearAuthenticatedSession,
  createAuthenticatedSession,
} from "@/lib/auth/server";

function buildLoginErrorRedirect(nextPath: string | undefined, error: string) {
  const params = new URLSearchParams();

  params.set("error", error);

  if (nextPath) {
    params.set("next", nextPath);
  }

  return `/login?${params.toString()}`;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "").trim() || "/dashboard";

  if (!email || !password) {
    redirect(buildLoginErrorRedirect(nextPath, "missing_credentials"));
  }

  const user = await authenticateUser(email, password);

  if (!user) {
    redirect(buildLoginErrorRedirect(nextPath, "invalid_credentials"));
  }

  await createAuthenticatedSession(user);
  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}

export async function logoutAction() {
  await clearAuthenticatedSession();
  redirect("/login");
}
