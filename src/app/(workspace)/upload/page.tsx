import { Download, FileSpreadsheet, ShieldCheck, Workflow } from "lucide-react";

import { IngestionWorkbench } from "@/components/ingestion-workbench";
import { SectionCard } from "@/components/section-card";
import { getSortedIngestionDatasets } from "@/lib/ingestion/datasets";

export default function UploadPage() {
  const supportedDatasets = getSortedIngestionDatasets().map((dataset) => ({
    key: dataset.key,
    label: dataset.label,
    format: dataset.supportedFileTypes.map((fileType) => fileType.toUpperCase()).join(" / "),
    persistence: dataset.persistenceNote,
    quickStart: dataset.quickStart,
    order: dataset.recommendedOrder,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Carga guiada
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Sube tus archivos sin adivinar el proceso
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Esta pantalla está pensada para que alguien de RR.HH. pueda cargar datos con confianza.
            Primero revisas el archivo, después confirmas columnas y empresa, y solo al final se guarda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/ingestion/template?dataset=employees"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium !text-white transition-colors hover:bg-slate-800 hover:!text-white"
            >
              <Download className="size-4" />
              Descargar plantilla de empleados
            </a>
            <a
              href="#orden-carga"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium !text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:!text-slate-700"
            >
              Ver orden recomendado
            </a>
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 p-8 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Cómo funciona
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                step: "1. Elige que archivo vas a cargar",
                description: "Puedes empezar por empleados o completar después con ausentismo, performance y encuestas.",
              },
              {
                step: "2. Revisa la vista previa",
                description: "La plataforma detecta columnas, propone relaciones y te muestra si falta algo obligatorio.",
              },
              {
                step: "3. Guarda y recalcula",
                description: "Al confirmar, los datos se guardan y se actualiza la lectura de analytics para esa empresa.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[24px] border border-white/10 bg-white/5 p-4"
              >
                <p className="font-medium text-white">{item.step}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          {
            icon: FileSpreadsheet,
            title: "Qué necesitas a mano",
            description: "Un archivo CSV o XLSX y el nombre de la empresa donde quieres cargarlo.",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            icon: ShieldCheck,
            title: "Qué valida la plataforma",
            description: "Columnas obligatorias, formato del archivo, fechas, números y coincidencia con la empresa elegida.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            icon: Workflow,
            title: "Qué pasa después",
            description: "Los datos se guardan en tablas normales y luego se actualizan los indicadores para los dashboards.",
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
            <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>

      <SectionCard
        eyebrow="Orden sugerido"
        title="Cómo debería cargarlo un cliente nuevo"
        description="Este orden reduce errores y ayuda a que los dashboards empiecen a tomar forma más rápido."
      >
        <div id="orden-carga" className="grid gap-4 xl:grid-cols-2">
          {supportedDatasets.map((item) => (
            <div
              key={item.key}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {item.order}
                </div>
                <a
                  href={`/api/ingestion/template?dataset=${item.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium !text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:!text-slate-700"
                >
                  <Download className="size-3.5" />
                  Descargar plantilla
                </a>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.quickStart}</p>
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Formato
                </p>
                <p className="mt-1 text-sm text-slate-700">{item.format}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.persistence}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Carga paso a paso"
        title="Revisa primero, guarda después"
        description="La herramienta te acompaña para que no termines subiendo un archivo a ciegas."
      >
        <IngestionWorkbench />
      </SectionCard>
    </div>
  );
}
