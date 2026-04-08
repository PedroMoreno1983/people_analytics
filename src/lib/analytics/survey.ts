const CANONICAL_DIMENSIONS: Record<string, string[]> = {
  engagement: [
    "engagement",
    "employee_engagement",
    "engagement_score",
    "compromiso",
    "compromiso_laboral",
  ],
  workload: [
    "workload",
    "work_load",
    "workload_score",
    "carga",
    "carga_laboral",
    "work_pressure",
  ],
  manager_support: [
    "manager_support",
    "managersupport",
    "leadership_support",
    "manager_support_score",
    "support_from_manager",
    "apoyo_del_manager",
    "apoyo_manager",
    "apoyo_liderazgo",
  ],
};

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function normalizeDimensionKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeSurveyDimension(value: string) {
  const normalized = normalizeDimensionKey(value);

  for (const [canonical, aliases] of Object.entries(CANONICAL_DIMENSIONS)) {
    if (aliases.some((alias) => normalizeDimensionKey(alias) === normalized)) {
      return canonical;
    }
  }

  return normalized;
}

export function surveyDimensionMatches(value: string, expected: string) {
  return normalizeSurveyDimension(value) === normalizeSurveyDimension(expected);
}

export function normalizeSurveyPositivePercentage(score: number | null | undefined) {
  if (score == null || !Number.isFinite(score)) {
    return 50;
  }

  if (score >= 1 && score <= 5) {
    return clampPercentage(((score - 1) / 4) * 100);
  }

  if (score >= 0 && score <= 5) {
    return clampPercentage((score / 5) * 100);
  }

  if (score >= 1 && score <= 10) {
    return clampPercentage(((score - 1) / 9) * 100);
  }

  if (score >= 0 && score <= 10) {
    return clampPercentage((score / 10) * 100);
  }

  if (score >= 0 && score <= 100) {
    return clampPercentage(score);
  }

  return clampPercentage(score);
}

export function normalizeSurveyRiskPercentage(score: number | null | undefined) {
  return clampPercentage(100 - normalizeSurveyPositivePercentage(score));
}
