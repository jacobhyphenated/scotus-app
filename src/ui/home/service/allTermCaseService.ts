import { Case, CaseStatus } from "../../../stores/caseStore";

export const caseSorter = (c1: Case, c2: Case) => {
  if (!c1.argumentDate && !!c2.argumentDate) {
    return 1;
  }
  if (!c2.argumentDate && !!c1.argumentDate) {
    return -1;
  }
  if (c1.argumentDate && c2.argumentDate) {
    const argumentOrder = c1.argumentDate.compareTo(c2.argumentDate);
    if (argumentOrder !== 0) {
      return argumentOrder;
    }
  }
  const statusOrder = [CaseStatus.GRANTED, CaseStatus.GVR,  CaseStatus.DIG, CaseStatus.DISMISSED];
  return statusOrder.indexOf(c1.status) - statusOrder.indexOf(c2.status);
};

export const groupCasesBySitting = (cases: Case[]) => {
  return cases.reduce((acc, value) => {
    const key = value.sitting ?? 'None';
    acc.set(key, [...(acc.get(key) ?? []), value]);
    return acc;
  }, new Map<string, Case[]>());
};

