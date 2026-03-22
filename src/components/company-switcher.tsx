"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CompanyOption = {
  id: string;
  name: string;
  industry: string | null;
  employeeCount: number | null;
};

type CompanySwitcherProps = {
  companies: CompanyOption[];
  selectedCompanyId?: string;
};

export function CompanySwitcher({
  companies,
  selectedCompanyId,
}: CompanySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Company
      </label>
      <select
        className="w-full min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        value={selectedCompanyId ?? ""}
        onChange={(event) => {
          const nextSearchParams = new URLSearchParams(searchParams.toString());
          const nextValue = event.target.value;

          if (nextValue) {
            nextSearchParams.set("companyId", nextValue);
          } else {
            nextSearchParams.delete("companyId");
          }

          const query = nextSearchParams.toString();
          router.replace(query ? `${pathname}?${query}` : pathname);
        }}
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
