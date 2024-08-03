import { LocalDate } from "@js-joda/core";
import { TermSummary } from "../../../stores/caseStore";
import { addCourtOverviewToTermSummary, createJusticeAgreementMap } from "./homeService";

describe('Home Service', () => {
  describe('addCourtOverviewToTermSummary', () => {
    it('should append a summary item for all courts', () => {
      const testSummary = testSummaryForCourtOverview();
      const result = addCourtOverviewToTermSummary(testSummary);
      expect(result.courtSummary.length).toBe(3);
      expect(result.courtSummary[2]).toStrictEqual({
        affirmed: 4,
        cases: 15,
        reversedRemanded: 11,
        court: {
          id: 0,
          shortName: 'all',
          name: 'All Cases',
        } ,
      });
    });
  });

  describe('createJusticeAgreementMap', () => {
    it('should return null on null summary input', () => {
      expect(createJusticeAgreementMap(null)).toBeNull();
    });
    it('should create an agreementMapping', () => {
      const testSummary = testSummaryForJusticeAgreement();
      const result = createJusticeAgreementMap(testSummary);
      expect(result?.length).toBe(3);
      
      const sotomayor = result?.find( item => item.justiceId === 7 );
      expect(sotomayor).toBeDefined();
      expect(sotomayor?.opinionAgreementMap[10]).toBeCloseTo(0.508, 3);
      expect(sotomayor?.opinionAgreementMap[2]).toBeCloseTo(0.557, 3);
      expect(sotomayor?.caseAgreementMap[10]).toBeCloseTo(0.6296, 4);
      expect(sotomayor?.caseAgreementMap[2]).toBeCloseTo(0.685, 3);

      const roberts = result?.find( item => item.justiceId === 2 );
      expect(roberts).toBeDefined();
      expect(roberts?.opinionAgreementMap[10]).toBeCloseTo(0.883, 3);
      expect(roberts?.opinionAgreementMap[7]).toBeCloseTo(0.56666, 3);
      expect(roberts?.caseAgreementMap[10]).toBeCloseTo(0.9107, 4);
      expect(roberts?.caseAgreementMap[7]).toBeCloseTo(0.6607, 3);

      const brett = result?.find( item => item.justiceId === 10 );
      expect(brett).toBeDefined();
      expect(brett?.opinionAgreementMap[2]).toBeCloseTo(0.841, 3);
      expect(brett?.opinionAgreementMap[7]).toBeCloseTo(0.492, 3);
      expect(brett?.caseAgreementMap[2]).toBeCloseTo(0.9272, 4);
      expect(brett?.caseAgreementMap[7]).toBeCloseTo(0.6363, 3);
    });
  });
});

const testSummaryForCourtOverview = (): TermSummary => {
  return {
    averageDecisionDays: 111,
    medianDecisionDays: 108,
    termEndDate: LocalDate.now(),
    termId: 1,
    justiceAgreement: [],
    justiceSummary: [],
    partySplit: [],
    unanimous: [],
    courtSummary: [
      {
        affirmed: 3,
        cases: 6,
        reversedRemanded: 3,
        court: {
          id: 4,
          shortName: 'CA04',
          name: 'four',
        } ,
      },
      {
        affirmed: 1,
        cases: 9,
        reversedRemanded: 8,
        court: {
          id: 9,
          shortName: 'CA09',
          name: 'nine',
        } ,
      },
    ],
  };
};

const testSummaryForJusticeAgreement = (): TermSummary => {
  return {
    averageDecisionDays: 111,
    medianDecisionDays: 108,
    termEndDate: LocalDate.now(),
    termId: 1,
    justiceAgreement: [
      {
        justiceId: 10,
        caseAgreementMap: {
          2: 0.9272,
          7: 0.6363,
        },
        opinionAgreementMap: {
          2: 0.8412,
          7: 0.49206,
        },
      },
      {
        justiceId: 7,
        caseAgreementMap: {
          2: 0.68518,
          10: 0.6296,
        },
        opinionAgreementMap: {
          2: 0.55737,
          10: 0.50819,
        },
      },
      {
        justiceId: 2,
        caseAgreementMap: {
          7: 0.6607,
          10: 0.9107,
        },
        opinionAgreementMap: {
          7: 0.566666,
          10: 0.883333,
        },
      },
    ],
    justiceSummary: [
      {
        casesInMajority: 51,
        casesWithOpinion: 55,
        concurJudgementAuthor: 1,
        concurringAuthor: 5,
        dissentAuthor: 2,
        dissentJudgementAuthor: 1,
        majorityAuthor: 6,
        percentInMajority: 0.927,
        justice: {
          dateConfirmed: LocalDate.of(1965,2,12),
          dateRetired: undefined,
          id: 10,
          name: 'Brett Kavanaugh',
          party: 'R',
        },
      },
      {
        casesInMajority: 39,
        casesWithOpinion: 54,
        concurJudgementAuthor: 3,
        concurringAuthor: 4,
        dissentAuthor: 7,
        dissentJudgementAuthor: 1,
        majorityAuthor: 5,
        percentInMajority: 0.722,
        justice: {
          dateConfirmed: LocalDate.of(2009,8,9),
          dateRetired: undefined,
          id: 7,
          name: 'Sonia Sotomayor',
          party: 'D',
        },
      },
      {
        casesInMajority: 54,
        casesWithOpinion: 56,
        concurJudgementAuthor: 1,
        concurringAuthor: 0,
        dissentAuthor: 1,
        dissentJudgementAuthor: 0,
        majorityAuthor: 7,
        percentInMajority: 0.964,
        justice: {
          dateConfirmed: LocalDate.of(2005,9,29),
          dateRetired: undefined,
          id: 2,
          name: 'John Roberts',
          party: 'R',
        },
      },
    ],
    partySplit: [],
    unanimous: [],
    courtSummary: [],
  };
};
