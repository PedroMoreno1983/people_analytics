import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { upsertBootstrapUser } from "../src/lib/auth/bootstrap";

function readArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const user = await upsertBootstrapUser({
    email: readArg("email"),
    password: readArg("password"),
    name: readArg("name"),
  });

  console.log(`Bootstrap auth user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
