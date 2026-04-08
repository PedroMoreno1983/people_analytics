import { datasetSchema, type DatasetKey, type FileType } from "@/lib/validations/ingestion";

export type DatasetField = {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "date" | "number";
  description: string;
  sampleHeaders: string[];
  templateHeader: string;
  exampleValue: string;
};

export type DatasetDefinition = {
  key: DatasetKey;
  label: string;
  description: string;
  persistenceNote: string;
  quickStart: string;
  templateFileName: string;
  recommendedOrder: number;
  supportedFileTypes: FileType[];
  fields: DatasetField[];
};

const datasetDefinitions: Record<DatasetKey, DatasetDefinition> = {
  employees: {
    key: "employees",
    label: "Empleados",
    description: "Es la base principal. Crea o actualiza personas, equipos y estructura organizaciónal.",
    persistenceNote: "Crea departamentos faltantes y actualiza empleados existentes por codigo externo dentro de la empresa elegida.",
    quickStart: "Empieza por este archivo si es la primera vez que una empresa carga información.",
    templateFileName: "plantilla_empleados.csv",
    recommendedOrder: 1,
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "externalCode", label: "Codigo de empleado", required: true, type: "string", description: "Identificador estable de la persona en el HRIS.", sampleHeaders: ["employee_id", "external_code", "employee_code", "code"], templateHeader: "employee_id", exampleValue: "EMP-001" },
      { key: "firstName", label: "Nombre", required: true, type: "string", description: "Nombre de la persona.", sampleHeaders: ["first_name", "name", "given_name"], templateHeader: "first_name", exampleValue: "Ana" },
      { key: "lastName", label: "Apellido", required: true, type: "string", description: "Apellido de la persona.", sampleHeaders: ["last_name", "surname", "family_name"], templateHeader: "last_name", exampleValue: "Lopez" },
      { key: "hireDate", label: "Fecha de ingreso", required: true, type: "date", description: "Fecha en que la persona entro a la empresa.", sampleHeaders: ["hire_date", "start_date", "admission_date"], templateHeader: "hire_date", exampleValue: "2024-01-15" },
      { key: "departmentName", label: "Equipo o area", required: true, type: "string", description: "Nombre del equipo, area o departamento.", sampleHeaders: ["department", "department_name", "team", "area"], templateHeader: "department", exampleValue: "Ventas" },
      { key: "managerExternalCode", label: "Codigo de manager", required: false, type: "string", description: "Codigo del manager directo si ya existe en el HRIS.", sampleHeaders: ["manager_id", "manager_code", "reports_to"], templateHeader: "manager_id", exampleValue: "EMP-010" },
      { key: "jobTitle", label: "Cargo", required: false, type: "string", description: "Cargo o rol de la persona.", sampleHeaders: ["job_title", "title", "position", "role"], templateHeader: "job_title", exampleValue: "Ejecutiva Comercial" },
      { key: "jobLevel", label: "Nivel", required: false, type: "string", description: "Nivel, seniority o tramo.", sampleHeaders: ["job_level", "level", "seniority"], templateHeader: "job_level", exampleValue: "L2" },
      { key: "contractType", label: "Tipo de contrato", required: false, type: "string", description: "Tipo de relacion laboral.", sampleHeaders: ["contract_type", "contract"], templateHeader: "contract_type", exampleValue: "Indefinido" },
      { key: "location", label: "Ubicacion", required: false, type: "string", description: "Ciudad, oficina o ubicacion principal.", sampleHeaders: ["location", "office", "city"], templateHeader: "location", exampleValue: "Santiago" },
      { key: "workMode", label: "Modalidad", required: false, type: "string", description: "Presencial, hibrido o remoto.", sampleHeaders: ["work_mode", "modality", "work_type"], templateHeader: "work_mode", exampleValue: "Hibrido" },
      { key: "ageBand", label: "Tramo etario", required: false, type: "string", description: "Rango de edad si la empresa trabaja con bandas.", sampleHeaders: ["age_band", "age_group"], templateHeader: "age_band", exampleValue: "30-39" },
      { key: "gender", label: "Genero", required: false, type: "string", description: "Genero segun el sistema de origen.", sampleHeaders: ["gender", "sex"], templateHeader: "gender", exampleValue: "Femenino" },
      { key: "terminationDate", label: "Fecha de salida", required: false, type: "date", description: "Completar solo si la persona ya no esta activa.", sampleHeaders: ["termination_date", "end_date", "termination"], templateHeader: "termination_date", exampleValue: "" }
    ]
  },
  absences: {
    key: "absences",
    label: "Ausencias",
    description: "Suma licencias, ausencias o inasistencias sobre personas que ya existen en la empresa.",
    persistenceNote: "Requiere empleados ya cargados en la empresa y evita duplicados por persona, fecha, dias y tipo.",
    quickStart: "Subelo después de empleados para enriquecer ausentismo y riesgo.",
    templateFileName: "plantilla_ausencias.csv",
    recommendedOrder: 2,
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "employeeExternalCode", label: "Codigo de empleado", required: true, type: "string", description: "Codigo de la persona ya cargada en empleados.", sampleHeaders: ["employee_id", "external_code", "employee_code"], templateHeader: "employee_id", exampleValue: "EMP-001" },
      { key: "date", label: "Fecha de ausencia", required: true, type: "date", description: "Fecha del evento de ausencia.", sampleHeaders: ["date", "absence_date"], templateHeader: "absence_date", exampleValue: "2025-03-12" },
      { key: "days", label: "Dias", required: true, type: "number", description: "Cantidad de dias ausentes.", sampleHeaders: ["days", "days_absent"], templateHeader: "days_absent", exampleValue: "2" },
      { key: "type", label: "Tipo", required: false, type: "string", description: "Categoria de ausencia si la empresa la reporta.", sampleHeaders: ["type", "absence_type", "category"], templateHeader: "absence_type", exampleValue: "Licencia medica" }
    ]
  },
  performance: {
    key: "performance",
    label: "Performance",
    description: "Carga evaluaciones o snapshots de desempeño para personas ya existentes.",
    persistenceNote: "Crea o actualiza evaluaciones por persona y fecha de revision.",
    quickStart: "Sirve para darle más contexto a la lectura de riesgo y evolucion.",
    templateFileName: "plantilla_performance.csv",
    recommendedOrder: 3,
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "employeeExternalCode", label: "Codigo de empleado", required: true, type: "string", description: "Codigo de la persona ya cargada en empleados.", sampleHeaders: ["employee_id", "external_code", "employee_code"], templateHeader: "employee_id", exampleValue: "EMP-001" },
      { key: "reviewDate", label: "Fecha de evaluacion", required: true, type: "date", description: "Fecha de la revision o evaluacion.", sampleHeaders: ["review_date", "evaluation_date"], templateHeader: "review_date", exampleValue: "2025-03-31" },
      { key: "score", label: "Score", required: true, type: "number", description: "Puntaje numerico de desempeño.", sampleHeaders: ["score", "rating", "performance_score"], templateHeader: "performance_score", exampleValue: "4.2" },
      { key: "reviewer", label: "Evaluador", required: false, type: "string", description: "Nombre o identificador del evaluador.", sampleHeaders: ["reviewer", "reviewed_by"], templateHeader: "reviewer", exampleValue: "Manager directo" }
    ]
  },
  surveys: {
    key: "surveys",
    label: "Encuestas",
    description: "Carga respuestas de encuesta para engagement, carga y apoyo de liderazgo.",
    persistenceNote: "Crea o reutiliza encuestas por empresa y nombre, y actualiza respuestas por persona y dimension.",
    quickStart: "Ideal para enriquecer engagement, desgaste y lectura de managers.",
    templateFileName: "plantilla_encuestas.csv",
    recommendedOrder: 4,
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "surveyName", label: "Nombre de encuesta", required: true, type: "string", description: "Nombre del pulso o encuesta.", sampleHeaders: ["survey_name", "pulse_name", "survey"], templateHeader: "survey_name", exampleValue: "Pulso Marzo 2025" },
      { key: "surveyCreatedAt", label: "Fecha de encuesta", required: false, type: "date", description: "Fecha del levantamiento. Conviene incluirla para ver tendencia.", sampleHeaders: ["survey_date", "created_at", "pulse_date"], templateHeader: "survey_date", exampleValue: "2025-03-20" },
      { key: "employeeExternalCode", label: "Codigo de empleado", required: true, type: "string", description: "Codigo de la persona ya cargada en empleados.", sampleHeaders: ["employee_id", "external_code", "employee_code"], templateHeader: "employee_id", exampleValue: "EMP-001" },
      { key: "dimension", label: "Dimension", required: true, type: "string", description: "Usa engagement, workload o manager_support, o una variante equivalente.", sampleHeaders: ["dimension", "question_group", "topic"], templateHeader: "dimension", exampleValue: "engagement" },
      { key: "score", label: "Score", required: true, type: "number", description: "Puntaje numerico. Hoy se aceptan escalas como 1-5, 1-10 o 0-100.", sampleHeaders: ["score", "value", "response_score"], templateHeader: "score", exampleValue: "4" }
    ]
  }
};

export const ingestionDatasets = datasetSchema.options.map(
  (key) => datasetDefinitions[key],
);

export function getDatasetDefinition(dataset: DatasetKey) {
  return datasetDefinitions[dataset];
}

export function getSortedIngestionDatasets() {
  return [...ingestionDatasets].sort(
    (left, right) => left.recommendedOrder - right.recommendedOrder,
  );
}

export function getTemplateHeaders(dataset: DatasetKey) {
  return getDatasetDefinition(dataset).fields.map((field) => field.templateHeader);
}

export function getTemplateExampleRow(dataset: DatasetKey) {
  return getDatasetDefinition(dataset).fields.map((field) => field.exampleValue);
}
