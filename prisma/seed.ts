import { PrismaClient } from "@prisma/client";

import { runAnalyticsPipeline } from "../src/lib/analytics/pipeline";

const prisma = new PrismaClient();

type EmployeeSeed = {
  key: string;
  externalCode: string;
  firstName: string;
  lastName: string;
  departmentKey: "executive" | "peopleOps" | "sales" | "product" | "operations";
  managerKey?: string;
  hireDate: string;
  terminationDate?: string;
  jobTitle: string;
  jobLevel: string;
  contractType: string;
  location: string;
  workMode: string;
  ageBand: string;
  gender: string;
};

const surveySnapshots = [
  {
    name: "January Pulse",
    createdAt: "2025-01-15",
    responses: {
      ceo: [4.7, 4.4, 4.6],
      hr_director: [4.4, 4.0, 4.2],
      sales_head: [3.9, 3.4, 3.6],
      product_head: [4.5, 3.9, 4.2],
      ops_head: [3.9, 3.4, 3.7],
      hrbp: [4.2, 3.8, 4.0],
      recruiter: [4.0, 3.6, 4.0],
      account_exec: [3.6, 3.2, 3.4],
      sales_ops: [3.7, 3.3, 3.4],
      pm: [4.3, 3.6, 4.2],
      designer: [4.2, 3.7, 4.1],
      ops_analyst: [3.7, 3.3, 3.5],
      former_sales_rep: [3.2, 2.9, 3.0],
      former_ops_coord: [3.4, 3.1, 3.2],
    },
  },
  {
    name: "February Pulse",
    createdAt: "2025-02-15",
    responses: {
      ceo: [4.7, 4.4, 4.6],
      hr_director: [4.3, 3.9, 4.1],
      sales_head: [3.7, 3.2, 3.5],
      product_head: [4.4, 3.8, 4.2],
      ops_head: [3.8, 3.2, 3.5],
      hrbp: [4.1, 3.7, 3.9],
      recruiter: [3.9, 3.5, 4.0],
      account_exec: [3.3, 3.0, 3.2],
      sales_ops: [3.4, 3.1, 3.2],
      pm: [4.2, 3.5, 4.1],
      designer: [4.1, 3.6, 4.0],
      ops_analyst: [3.5, 3.2, 3.4],
      former_sales_rep: [3.0, 2.8, 2.9],
      former_ops_coord: [3.3, 3.0, 3.1],
    },
  },
  {
    name: "March Pulse",
    createdAt: "2025-03-15",
    responses: {
      ceo: [4.8, 4.5, 4.7],
      hr_director: [4.3, 3.9, 4.2],
      sales_head: [3.5, 3.0, 3.3],
      product_head: [4.4, 3.8, 4.2],
      ops_head: [3.7, 3.1, 3.4],
      hrbp: [4.0, 3.7, 3.9],
      recruiter: [3.9, 3.5, 4.0],
      account_exec: [3.0, 2.8, 3.0],
      sales_ops: [3.2, 3.0, 3.1],
      pm: [4.2, 3.5, 4.1],
      designer: [4.1, 3.6, 4.0],
      ops_analyst: [3.4, 3.1, 3.3],
      former_sales_rep: [2.8, 2.6, 2.8],
      former_ops_coord: [3.1, 2.9, 3.0],
    },
  },
] as const;

async function main() {
  await prisma.employeeRiskScore.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.teamMetricsMonthly.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      name: "DataWise Demo Company",
      industry: "Professional Services",
      employeeCount: 14,
    },
  });

  const executive = await prisma.department.create({
    data: { name: "Executive", companyId: company.id },
  });
  const peopleOps = await prisma.department.create({
    data: { name: "People Operations", companyId: company.id },
  });
  const sales = await prisma.department.create({
    data: { name: "Sales", companyId: company.id },
  });
  const product = await prisma.department.create({
    data: { name: "Product", companyId: company.id },
  });
  const operations = await prisma.department.create({
    data: { name: "Operations", companyId: company.id },
  });

  const departments = { executive, peopleOps, sales, product, operations };

  const employeeSeeds: EmployeeSeed[] = [
    { key: "ceo", externalCode: "EMP-001", firstName: "Alicia", lastName: "Rojas", departmentKey: "executive", hireDate: "2018-04-02", jobTitle: "Chief Executive Officer", jobLevel: "Executive", contractType: "Full-time", location: "Santiago", workMode: "Hybrid", ageBand: "35-44", gender: "Female" },
    { key: "hr_director", externalCode: "EMP-002", firstName: "Diego", lastName: "Soto", departmentKey: "peopleOps", managerKey: "ceo", hireDate: "2020-01-13", jobTitle: "People Director", jobLevel: "Director", contractType: "Full-time", location: "Santiago", workMode: "Hybrid", ageBand: "35-44", gender: "Male" },
    { key: "sales_head", externalCode: "EMP-003", firstName: "Marina", lastName: "Vega", departmentKey: "sales", managerKey: "ceo", hireDate: "2019-07-08", jobTitle: "Head of Sales", jobLevel: "Director", contractType: "Full-time", location: "Lima", workMode: "Remote", ageBand: "35-44", gender: "Female" },
    { key: "product_head", externalCode: "EMP-004", firstName: "Tomas", lastName: "Mella", departmentKey: "product", managerKey: "ceo", hireDate: "2021-03-15", jobTitle: "Head of Product", jobLevel: "Director", contractType: "Full-time", location: "Bogota", workMode: "Remote", ageBand: "35-44", gender: "Male" },
    { key: "ops_head", externalCode: "EMP-005", firstName: "Paula", lastName: "Herrera", departmentKey: "operations", managerKey: "ceo", hireDate: "2019-10-01", jobTitle: "Operations Lead", jobLevel: "Director", contractType: "Full-time", location: "Santiago", workMode: "On-site", ageBand: "35-44", gender: "Female" },
    { key: "hrbp", externalCode: "EMP-006", firstName: "Benjamin", lastName: "Fuentes", departmentKey: "peopleOps", managerKey: "hr_director", hireDate: "2023-02-20", jobTitle: "HR Business Partner", jobLevel: "Manager", contractType: "Full-time", location: "Santiago", workMode: "Hybrid", ageBand: "25-34", gender: "Male" },
    { key: "recruiter", externalCode: "EMP-007", firstName: "Javiera", lastName: "Araya", departmentKey: "peopleOps", managerKey: "hr_director", hireDate: "2024-06-10", jobTitle: "Talent Partner", jobLevel: "Senior IC", contractType: "Full-time", location: "Santiago", workMode: "Hybrid", ageBand: "25-34", gender: "Female" },
    { key: "account_exec", externalCode: "EMP-008", firstName: "Nicolas", lastName: "Munoz", departmentKey: "sales", managerKey: "sales_head", hireDate: "2022-05-09", jobTitle: "Account Executive", jobLevel: "Senior IC", contractType: "Full-time", location: "Lima", workMode: "Remote", ageBand: "25-34", gender: "Male" },
    { key: "sales_ops", externalCode: "EMP-009", firstName: "Camila", lastName: "Pino", departmentKey: "sales", managerKey: "sales_head", hireDate: "2023-08-14", jobTitle: "Sales Operations Analyst", jobLevel: "IC", contractType: "Full-time", location: "Santiago", workMode: "Hybrid", ageBand: "25-34", gender: "Female" },
    { key: "pm", externalCode: "EMP-010", firstName: "Valentina", lastName: "Silva", departmentKey: "product", managerKey: "product_head", hireDate: "2022-11-28", jobTitle: "Product Manager", jobLevel: "Manager", contractType: "Full-time", location: "Bogota", workMode: "Remote", ageBand: "25-34", gender: "Female" },
    { key: "designer", externalCode: "EMP-011", firstName: "Matias", lastName: "Caceres", departmentKey: "product", managerKey: "product_head", hireDate: "2024-01-15", jobTitle: "Product Designer", jobLevel: "IC", contractType: "Full-time", location: "Bogota", workMode: "Remote", ageBand: "25-34", gender: "Male" },
    { key: "ops_analyst", externalCode: "EMP-012", firstName: "Francisca", lastName: "Leon", departmentKey: "operations", managerKey: "ops_head", hireDate: "2021-09-06", jobTitle: "Operations Analyst", jobLevel: "Senior IC", contractType: "Full-time", location: "Santiago", workMode: "On-site", ageBand: "25-34", gender: "Female" },
    { key: "former_sales_rep", externalCode: "EMP-013", firstName: "Rocio", lastName: "Cruz", departmentKey: "sales", managerKey: "sales_head", hireDate: "2023-01-10", terminationDate: "2025-02-14", jobTitle: "Sales Representative", jobLevel: "IC", contractType: "Full-time", location: "Lima", workMode: "Remote", ageBand: "25-34", gender: "Female" },
    { key: "former_ops_coord", externalCode: "EMP-014", firstName: "Daniel", lastName: "Mora", departmentKey: "operations", managerKey: "ops_head", hireDate: "2022-06-01", terminationDate: "2025-01-20", jobTitle: "Operations Coordinator", jobLevel: "IC", contractType: "Full-time", location: "Santiago", workMode: "On-site", ageBand: "25-34", gender: "Male" },
  ];

  const createdEmployees = new Map<string, { id: string }>();

  for (const employeeSeed of employeeSeeds) {
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        departmentId: departments[employeeSeed.departmentKey].id,
        managerId: employeeSeed.managerKey
          ? createdEmployees.get(employeeSeed.managerKey)?.id
          : undefined,
        externalCode: employeeSeed.externalCode,
        firstName: employeeSeed.firstName,
        lastName: employeeSeed.lastName,
        hireDate: new Date(employeeSeed.hireDate),
        terminationDate: employeeSeed.terminationDate
          ? new Date(employeeSeed.terminationDate)
          : undefined,
        jobTitle: employeeSeed.jobTitle,
        jobLevel: employeeSeed.jobLevel,
        contractType: employeeSeed.contractType,
        location: employeeSeed.location,
        workMode: employeeSeed.workMode,
        ageBand: employeeSeed.ageBand,
        gender: employeeSeed.gender,
      },
    });

    createdEmployees.set(employeeSeed.key, { id: employee.id });
  }

  await prisma.absence.createMany({
    data: [
      { employeeId: createdEmployees.get("account_exec")!.id, date: new Date("2025-01-12"), days: 2, type: "Sick leave" },
      { employeeId: createdEmployees.get("account_exec")!.id, date: new Date("2025-02-21"), days: 1, type: "Personal" },
      { employeeId: createdEmployees.get("account_exec")!.id, date: new Date("2025-03-09"), days: 2, type: "Medical" },
      { employeeId: createdEmployees.get("sales_ops")!.id, date: new Date("2025-02-11"), days: 3, type: "Medical" },
      { employeeId: createdEmployees.get("sales_ops")!.id, date: new Date("2025-03-04"), days: 1, type: "Personal" },
      { employeeId: createdEmployees.get("ops_analyst")!.id, date: new Date("2025-01-23"), days: 1, type: "Medical" },
      { employeeId: createdEmployees.get("ops_analyst")!.id, date: new Date("2025-03-05"), days: 2, type: "Medical" },
      { employeeId: createdEmployees.get("recruiter")!.id, date: new Date("2025-03-10"), days: 1, type: "Personal" },
      { employeeId: createdEmployees.get("former_sales_rep")!.id, date: new Date("2025-02-03"), days: 2, type: "Medical" },
      { employeeId: createdEmployees.get("former_ops_coord")!.id, date: new Date("2025-01-08"), days: 3, type: "Medical" },
    ],
  });

  await prisma.performanceReview.createMany({
    data: [
      { employeeId: createdEmployees.get("account_exec")!.id, reviewDate: new Date("2024-09-15"), score: 4.2, reviewer: "Marina Vega" },
      { employeeId: createdEmployees.get("account_exec")!.id, reviewDate: new Date("2024-12-15"), score: 3.8, reviewer: "Marina Vega" },
      { employeeId: createdEmployees.get("sales_ops")!.id, reviewDate: new Date("2024-09-15"), score: 4.3, reviewer: "Marina Vega" },
      { employeeId: createdEmployees.get("sales_ops")!.id, reviewDate: new Date("2024-12-15"), score: 4.1, reviewer: "Marina Vega" },
      { employeeId: createdEmployees.get("pm")!.id, reviewDate: new Date("2024-09-15"), score: 4.1, reviewer: "Tomas Mella" },
      { employeeId: createdEmployees.get("pm")!.id, reviewDate: new Date("2024-12-15"), score: 4.4, reviewer: "Tomas Mella" },
      { employeeId: createdEmployees.get("designer")!.id, reviewDate: new Date("2024-12-15"), score: 4.2, reviewer: "Tomas Mella" },
      { employeeId: createdEmployees.get("ops_analyst")!.id, reviewDate: new Date("2024-09-15"), score: 4.2, reviewer: "Paula Herrera" },
      { employeeId: createdEmployees.get("ops_analyst")!.id, reviewDate: new Date("2024-12-15"), score: 3.9, reviewer: "Paula Herrera" },
      { employeeId: createdEmployees.get("former_sales_rep")!.id, reviewDate: new Date("2024-12-15"), score: 3.5, reviewer: "Marina Vega" },
    ],
  });

  await prisma.promotion.createMany({
    data: [
      {
        employeeId: createdEmployees.get("pm")!.id,
        effectiveAt: new Date("2024-10-01"),
        oldLevel: "Senior IC",
        newLevel: "Manager",
      },
      {
        employeeId: createdEmployees.get("hrbp")!.id,
        effectiveAt: new Date("2025-01-01"),
        oldLevel: "IC",
        newLevel: "Manager",
      },
      {
        employeeId: createdEmployees.get("sales_head")!.id,
        effectiveAt: new Date("2023-05-01"),
        oldLevel: "Manager",
        newLevel: "Director",
      },
    ],
  });

  for (const snapshot of surveySnapshots) {
    const survey = await prisma.survey.create({
      data: {
        companyId: company.id,
        name: snapshot.name,
        createdAt: new Date(snapshot.createdAt),
      },
    });

    await prisma.surveyResponse.createMany({
      data: Object.entries(snapshot.responses).flatMap(([key, values]) => [
        {
          surveyId: survey.id,
          employeeId: createdEmployees.get(key)!.id,
          dimension: "engagement",
          score: values[0],
        },
        {
          surveyId: survey.id,
          employeeId: createdEmployees.get(key)!.id,
          dimension: "workload",
          score: values[1],
        },
        {
          surveyId: survey.id,
          employeeId: createdEmployees.get(key)!.id,
          dimension: "manager_support",
          score: values[2],
        },
      ]),
    });
  }

  await runAnalyticsPipeline({
    companyId: company.id,
    prismaClient: prisma,
  });

  console.log("Seed completed for DataWise People Analytics.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
