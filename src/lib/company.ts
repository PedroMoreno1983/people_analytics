import { prisma } from "@/lib/prisma";

export async function listCompanies() {
  try {
    return await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        employeeCount: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch {
    return [];
  }
}

export async function getCompanyFilterOptions(companyId?: string) {
  try {
    const company = companyId
      ? await prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true },
        })
      : await prisma.company.findFirst({
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

    if (!company) {
      return {
        departments: [] as string[],
        locations: [] as string[],
        ageBands: [] as string[],
      };
    }

    const [departments, employees] = await Promise.all([
      prisma.department.findMany({
        where: { companyId: company.id },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { companyId: company.id },
        select: {
          location: true,
          ageBand: true,
        },
      }),
    ]);

    return {
      departments: departments.map((department) => department.name),
      locations: Array.from(
        new Set(
          employees
            .map((employee) => employee.location?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((left, right) => left.localeCompare(right)),
      ageBands: Array.from(
        new Set(
          employees
            .map((employee) => employee.ageBand?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((left, right) => left.localeCompare(right)),
    };
  } catch {
    return {
      departments: [] as string[],
      locations: [] as string[],
      ageBands: [] as string[],
    };
  }
}
