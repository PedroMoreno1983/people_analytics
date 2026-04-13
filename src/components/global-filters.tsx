"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";

type GlobalFiltersProps = {
  departments: string[];
  locations: string[];
  ageBands: string[];
};

type FilterSection = {
  key: "department" | "location" | "age";
  label: string;
  values: string[];
};

export function GlobalFilters({
  departments,
  locations,
  ageBands,
}: GlobalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const sections = useMemo<FilterSection[]>(
    () =>
      ([
        {
          key: "department",
          label: "Equipo",
          values: departments,
        },
        {
          key: "location",
          label: "Ubicación",
          values: locations,
        },
        {
          key: "age",
          label: "Edad",
          values: ageBands,
        },
      ] satisfies FilterSection[]).filter((section) => section.values.length > 0),
    [ageBands, departments, locations]
  );

  const activeFilters = sections
    .map((section) => ({
      key: section.key,
      label: section.label,
      value: searchParams.get(section.key),
    }))
    .filter((item) => Boolean(item.value));

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  function handleFilterChange(name: string, value: string) {
    const current = searchParams.get(name);
    const nextValue = current === value ? "" : value;
    const query = createQueryString(name, nextValue);

    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());

    ["department", "location", "age"].forEach((key) => params.delete(key));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setIsOpen(false);
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen((current) => !current)}
            className="flex items-center gap-2 border-indigo-200 bg-white/70 text-indigo-900 shadow-sm backdrop-blur-md hover:bg-white"
          >
            <Filter className="size-4" />
            Filtrar lectura
            {activeFilters.length > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                {activeFilters.length}
              </span>
            )}
            <ChevronDown
              className={`size-4 opacity-50 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => handleFilterChange(filter.key, filter.value ?? "")}
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:border-indigo-200 hover:bg-indigo-100"
                >
                  {filter.label}: {filter.value}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Puedes acotar la lectura por equipo, ubicación o tramo etario.
            </p>
          )}
        </div>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-12 z-50 mt-2 w-[320px] rounded-[24px] border border-white/70 bg-white/95 p-5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:w-[560px]">
          <div className="grid gap-6 sm:grid-cols-3">
            {sections.map((section) => (
              <div key={section.key} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section.label}
                </h4>
                <div className="flex flex-col gap-2">
                  {section.values.map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={searchParams.get(section.key) === value}
                        onChange={() => handleFilterChange(section.key, value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs leading-5 text-slate-500">
              Los filtros ahora usan valores reales cargados en la empresa
              seleccionada.
            </p>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Ver resultados
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
