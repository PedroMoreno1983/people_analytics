import { FileSpreadsheet, ShieldCheck, Workflow } from "lucide-react";

import { IngestionWorkbench } from "@/components/ingestion-workbench";
import { SectionCard } from "@/components/section-card";
import { uploadDatasets } from "@/lib/placeholder-data";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-slate-200/80 bg-white/85 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
          Ingesta de datos
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-slate-950">
          Subí tus archivos HR y actualizá el pipeline de analytics al instante.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Cargá archivos CSV o XLSX, mapeá columnas automáticamente y disparará el recálculo
          de todos los scores de riesgo y métricas de equipo.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          {
            icon: FileSpreadsheet,
            title: "Formatos soportados",
            description: "CSV y XLSX son los formatos de entrada aceptados para la ingesta.",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
          },
          {
            icon: ShieldCheck,
            title: "Validación automática",
            description: "Todos los campos entrantes pasan por un esquema Zod antes de persistirse.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            icon: Workflow,
            title: "Normalización",
            description: "Los registros mapeados se guardan en tablas Prisma normalizadas, no en JSON suelto.",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`rounded-[28px] border ${item.border} ${item.bg} p-6`}
          >
            <item.icon className={`size-5 ${item.color}`} />
            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <SectionCard
        eyebrow="Datasets soportados"
        title="Qué podés cargar"
        description="El pipeline soporta empleados, ausentismo, evaluaciones de desempeño y encuestas."
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dataset</th>
                <th className="px-4 py-3 font-medium">Formato</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {uploadDatasets.map((item) => (
                <tr key={item.dataset}>
                  <td className="px-4 py-4 font-medium text-slate-950">
                    {item.dataset}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.format}</td>
                  <td className="px-4 py-4 text-slate-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Workbench"
        title="Flujo de ingesta"
        description="Subí, previsualizá, mapeá columnas y persistí los datos en el pipeline de analytics."
      >
        <IngestionWorkbench />
      </SectionCard>
    </div>
  );
}
