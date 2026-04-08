"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const MOCK_DEPARTMENTS = ["Sales", "Engineering", "Operations", "People Ops", "Product", "Finance", "Marketing"];
const MOCK_LOCATIONS = ["Santiago", "Providencia", "Las Condes", "Remoto"];
const MOCK_AGE_RANGES = ["18-25", "26-35", "36-45", "46+"];

export function GlobalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);

  // Helper para generar nueva URL con los parámetros actualizados
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

  const handleFilterChange = (name: string, value: string) => {
    const current = searchParams.get(name);
    // Toggle (clear if already selected)
    const newValue = current === value ? "" : value;
    router.push(pathname + "?" + createQueryString(name, newValue), { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname);
    setIsOpen(false);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).filter(k => ["department", "location", "age"].includes(k)).length > 0;

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border-indigo-200 bg-white/50 text-indigo-900 shadow-sm backdrop-blur-md hover:bg-white/80"
        >
          <Filter className="size-4" />
          Filtros Avanzados
          {hasActiveFilters && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-indigo-600"></span>
          )}
          <ChevronDown className={`size-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>

        {hasActiveFilters && (
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
        <div className="absolute left-0 top-12 z-50 mt-2 w-[320px] rounded-[24px] border border-white/70 bg-white/95 p-5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:w-[500px]">
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Departments */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Departamento</h4>
              <div className="flex flex-col gap-2">
                {MOCK_DEPARTMENTS.map((dept) => (
                  <label key={dept} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={searchParams.get("department") === dept}
                      onChange={() => handleFilterChange("department", dept)}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ubicación</h4>
              <div className="flex flex-col gap-2">
                {MOCK_LOCATIONS.map((loc) => (
                  <label key={loc} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={searchParams.get("location") === loc}
                      onChange={() => handleFilterChange("location", loc)}
                    />
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Edad</h4>
              <div className="flex flex-col gap-2">
                {MOCK_AGE_RANGES.map((age) => (
                  <label key={age} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={searchParams.get("age") === age}
                      onChange={() => handleFilterChange("age", age)}
                    />
                    {age}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="sm" onClick={() => setIsOpen(false)}>Ver Resultados</Button>
          </div>
        </div>
      )}
    </div>
  );
}
