import { TermSummary } from "../../../stores/caseStore";

interface JusticeAgreementMap {
  justiceId: number;
  justiceName: string;
  opinionAgreementMap: {
    [id: number]: number;
  };
  caseAgreementMap: {
    [id: number]: number;
  };
}

const ideologyMap = [
  'Sonia Sotomayor',
  'Elena Kagan',
  'Ketanji Brown Jackson',
  'Ruth Bader Ginsburg',
  'Stephen Breyer',
  'John Roberts',
  'Brett Kavanaugh',
  'Amy Coney Barrett',
  'Neil Gorsuch',
  'Samuel Alito',
  'Clarence Thomas',
];

export const addCourtOverviewToTermSummary = (summaryResult: TermSummary): TermSummary => {
  let caseTotal = 0;
  let reverseRemandTotal = 0;
  summaryResult.courtSummary.forEach(item => {
    caseTotal += item.cases;
    reverseRemandTotal += item.reversedRemanded;
  });
  summaryResult.courtSummary.push({
    cases: caseTotal,
    reversedRemanded: reverseRemandTotal,
    court: { id: 0, name: 'All Cases', shortName: 'all' },
    affirmed: caseTotal - reverseRemandTotal,
  });
  return summaryResult;
};

export const createJusticeAgreementMap = (summary: TermSummary | null): JusticeAgreementMap[] | null => {
  if (!summary) {
    return null;
  }
  const justiceNameLookup = (id: number) => {
    return summary.justiceSummary.find((js => js.justice.id === id))?.justice.name ?? `${id}`;
  };

  return summary.justiceAgreement.map(j => ({
    justiceName: justiceNameLookup(j.justiceId),
    ...j,
  })).sort((j1, j2) => {
    // sort by the most agreeable justices as defined by the sum of the agreement map values
    // return Object.values(j2.opinionAgreementMap).reduce((a, j) => a + j, 0) - Object.values(j1.opinionAgreementMap).reduce((a, j) => a + j, 0);
    return ideologyMap.indexOf(j1.justiceName) - ideologyMap.indexOf(j2.justiceName);
  });
};