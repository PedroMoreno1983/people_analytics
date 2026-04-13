import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/server";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const currentUser = await requireAuthenticatedUser("/dashboard");

  return <AppShell currentUser={currentUser}>{children}</AppShell>;
}
