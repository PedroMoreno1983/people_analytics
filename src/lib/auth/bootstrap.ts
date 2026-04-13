import type { AppUser } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

type BootstrapInput = {
  email?: string;
  password?: string;
  name?: string;
};

export function getBootstrapCredentials(overrides?: BootstrapInput) {
  return {
    email: (overrides?.email ||
      process.env.AUTH_BOOTSTRAP_EMAIL ||
      "pedro@datawise.local").trim().toLowerCase(),
    password:
      overrides?.password ||
      process.env.AUTH_BOOTSTRAP_PASSWORD ||
      "PedroAnalytics2026!",
    name: (overrides?.name ||
      process.env.AUTH_BOOTSTRAP_NAME ||
      "Pedro Moreno").trim(),
  };
}

export async function ensureBootstrapUser(overrides?: BootstrapInput) {
  const existingUsers = await prisma.appUser.count();

  if (existingUsers > 0) {
    return null;
  }

  const credentials = getBootstrapCredentials(overrides);
  const { salt, hash } = hashPassword(credentials.password);

  return prisma.appUser.create({
    data: {
      email: credentials.email,
      name: credentials.name,
      role: "ADMIN",
      passwordSalt: salt,
      passwordHash: hash,
    },
  });
}

export async function upsertBootstrapUser(overrides?: BootstrapInput): Promise<AppUser> {
  const credentials = getBootstrapCredentials(overrides);
  const { salt, hash } = hashPassword(credentials.password);

  return prisma.appUser.upsert({
    where: {
      email: credentials.email,
    },
    update: {
      name: credentials.name,
      role: "ADMIN",
      passwordSalt: salt,
      passwordHash: hash,
    },
    create: {
      email: credentials.email,
      name: credentials.name,
      role: "ADMIN",
      passwordSalt: salt,
      passwordHash: hash,
    },
  });
}
