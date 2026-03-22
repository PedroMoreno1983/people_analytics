import { FileSpreadsheet, ShieldCheck, Workflow } from "lucide-react";

import { IngestionWorkbench } from "@/components/ingestion-workbench";
import { SectionCard } from "@/components/section-card";
import { uploadDatasets } from "@/lib/placeholder-data";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-slate-200/80 bg-white/85 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Ingestion surface
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-slate-950">
          CSV and XLSX upload belongs in a controlled workflow, not in ad-hoc scripts.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Phase 2 will wire parsing, preview and mapping into this route. Phase 1
          leaves the contracts and UX zones ready so persistence can land cleanly.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          {
            icon: FileSpreadsheet,
            title: "Source files",
            description: "CSV and XLSX are the supported input formats for MVP ingestion."
          },
          {
            icon: ShieldCheck,
            title: "Validation",
            description: "All incoming fields will cross a Zod boundary before persistence."
          },
          {
            icon: Workflow,
            title: "Normalization",
            description: "Mapped records will end in Prisma operational tables, not loose JSON blobs."
          }
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6"
          >
            <item.icon className="size-5 text-slate-700" />
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
        eyebrow="Supported datasets"
        title="What Phase 2 will ingest first"
        description="The MVP backlog points to employee, absence, performance and survey inputs first."
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dataset</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
        title="Phase 2 ingestion flow"
        description="This is the working vertical slice: upload, preview, column mapping, validation and Prisma persistence."
      >
        <IngestionWorkbench />
      </SectionCard>
    </div>
  );
}
