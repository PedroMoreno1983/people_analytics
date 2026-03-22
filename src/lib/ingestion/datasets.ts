import { datasetSchema, type DatasetKey, type FileType } from "@/lib/validations/ingestion";

export type DatasetField = {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "date" | "number";
  description: string;
  sampleHeaders: string[];
};

export type DatasetDefinition = {
  key: DatasetKey;
  label: string;
  description: string;
  persistenceNote: string;
  supportedFileTypes: FileType[];
  fields: DatasetField[];
};

const datasetDefinitions: Record<DatasetKey, DatasetDefinition> = {
  employees: {
    key: "employees",
    label: "Employees",
    description: "Create or update employees and departments from normalized roster files.",
    persistenceNote: "Creates missing departments and updates existing employees by external code within the selected company.",
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "externalCode", label: "External code", required: true, type: "string", description: "Stable employee identifier from the HRIS.", sampleHeaders: ["employee_id", "external_code", "employee_code", "code"] },
      { key: "firstName", label: "First name", required: true, type: "string", description: "Employee given name.", sampleHeaders: ["first_name", "name", "given_name"] },
      { key: "lastName", label: "Last name", required: true, type: "string", description: "Employee family name.", sampleHeaders: ["last_name", "surname", "family_name"] },
      { key: "hireDate", label: "Hire date", required: true, type: "date", description: "Employee start date.", sampleHeaders: ["hire_date", "start_date", "admission_date"] },
      { key: "departmentName", label: "Department", required: true, type: "string", description: "Department or team name.", sampleHeaders: ["department", "department_name", "team", "area"] },
      { key: "managerExternalCode", label: "Manager code", required: false, type: "string", description: "Manager external code if available.", sampleHeaders: ["manager_id", "manager_code", "reports_to"] },
      { key: "jobTitle", label: "Job title", required: false, type: "string", description: "Role title.", sampleHeaders: ["job_title", "title", "position", "role"] },
      { key: "jobLevel", label: "Job level", required: false, type: "string", description: "Seniority or level.", sampleHeaders: ["job_level", "level", "seniority"] },
      { key: "contractType", label: "Contract type", required: false, type: "string", description: "Employment contract type.", sampleHeaders: ["contract_type", "contract"] },
      { key: "location", label: "Location", required: false, type: "string", description: "Primary office or city.", sampleHeaders: ["location", "office", "city"] },
      { key: "workMode", label: "Work mode", required: false, type: "string", description: "On-site, hybrid or remote.", sampleHeaders: ["work_mode", "modality", "work_type"] },
      { key: "ageBand", label: "Age band", required: false, type: "string", description: "Age range bucket.", sampleHeaders: ["age_band", "age_group"] },
      { key: "gender", label: "Gender", required: false, type: "string", description: "Gender label from source system.", sampleHeaders: ["gender", "sex"] },
      { key: "terminationDate", label: "Termination date", required: false, type: "date", description: "Employment end date if employee left.", sampleHeaders: ["termination_date", "end_date", "termination"] }
    ]
  },
  absences: {
    key: "absences",
    label: "Absences",
    description: "Load absence events and attach them to existing employees.",
    persistenceNote: "Requires existing employees in the selected company and deduplicates by employee, date, days and type.",
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "employeeExternalCode", label: "Employee code", required: true, type: "string", description: "Employee identifier used in the roster.", sampleHeaders: ["employee_id", "external_code", "employee_code"] },
      { key: "date", label: "Absence date", required: true, type: "date", description: "Date of absence event.", sampleHeaders: ["date", "absence_date"] },
      { key: "days", label: "Days", required: true, type: "number", description: "Number of days absent.", sampleHeaders: ["days", "days_absent"] },
      { key: "type", label: "Type", required: false, type: "string", description: "Optional absence type or category.", sampleHeaders: ["type", "absence_type", "category"] }
    ]
  },
  performance: {
    key: "performance",
    label: "Performance reviews",
    description: "Load performance review snapshots for existing employees.",
    persistenceNote: "Updates or creates performance review records by employee and review date.",
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "employeeExternalCode", label: "Employee code", required: true, type: "string", description: "Employee identifier used in the roster.", sampleHeaders: ["employee_id", "external_code", "employee_code"] },
      { key: "reviewDate", label: "Review date", required: true, type: "date", description: "Date of the review.", sampleHeaders: ["review_date", "evaluation_date"] },
      { key: "score", label: "Score", required: true, type: "number", description: "Numeric performance score.", sampleHeaders: ["score", "rating", "performance_score"] },
      { key: "reviewer", label: "Reviewer", required: false, type: "string", description: "Optional reviewer name or identifier.", sampleHeaders: ["reviewer", "reviewed_by"] }
    ]
  },
  surveys: {
    key: "surveys",
    label: "Survey responses",
    description: "Load survey responses tied to employees and dimensions.",
    persistenceNote: "Creates or reuses surveys by company and survey name, then upserts employee responses by dimension.",
    supportedFileTypes: ["csv", "xlsx"],
    fields: [
      { key: "surveyName", label: "Survey name", required: true, type: "string", description: "Pulse or survey name.", sampleHeaders: ["survey_name", "pulse_name", "survey"] },
      { key: "surveyCreatedAt", label: "Survey date", required: false, type: "date", description: "Survey creation or field date.", sampleHeaders: ["survey_date", "created_at", "pulse_date"] },
      { key: "employeeExternalCode", label: "Employee code", required: true, type: "string", description: "Employee identifier used in the roster.", sampleHeaders: ["employee_id", "external_code", "employee_code"] },
      { key: "dimension", label: "Dimension", required: true, type: "string", description: "Survey dimension such as engagement or workload.", sampleHeaders: ["dimension", "question_group", "topic"] },
      { key: "score", label: "Score", required: true, type: "number", description: "Numeric survey score.", sampleHeaders: ["score", "value", "response_score"] }
    ]
  }
};

export const ingestionDatasets = datasetSchema.options.map(
  (key) => datasetDefinitions[key],
);

export function getDatasetDefinition(dataset: DatasetKey) {
  return datasetDefinitions[dataset];
}
