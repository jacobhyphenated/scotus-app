import { LocalDate } from "@js-joda/core";
import { Case, CaseSitting, CaseStatus } from "../../../stores/caseStore";
import { caseSorter, groupCasesBySitting } from "./allTermCaseService";

describe('All Term Case Service', () => {
  describe('caseSorter', () => {
    it('should order by argument date', () => {
      const sortedCases = testCases1.sort(caseSorter);
      expect(sortedCases[0].id).toBe(3);
      expect(sortedCases[1].id).toBe(2);
      expect(sortedCases[2].id).toBe(1);
    });

    it('should sort secondarily by status', () => {
      const sortedCases = testCases2.sort(caseSorter);
      expect(sortedCases[0].id).toBe(12);
      expect(sortedCases[1].id).toBe(11);
      expect(sortedCases[2].id).toBe(10);
    });
  });

  describe('groupCasesBySitting', () => {
    it('should group cases by sitting', () => {
      const testCases = [...testCases1, ...testCases2];
      const groupedCases = groupCasesBySitting(testCases);
      expect(Array.from(groupedCases.keys()).length).toBe(4);
      expect(groupedCases.get('None')?.length).toBe(1);
      expect(groupedCases.get('None')?.[0].id).toBe(10);
      expect(groupedCases.get('November')?.length).toBe(1);
      expect(groupedCases.get('November')?.[0].id).toBe(3);
      expect(groupedCases.get('January')?.length).toBe(1);
      expect(groupedCases.get('January')?.[0].id).toBe(2);
      expect(groupedCases.get('February')?.length).toBe(3);
    });
  });
});

const testCases1: Case[] = [
  {
    id: 1,
    case: 'test1',
    shortSummary: 'test case 1',
    status: CaseStatus.AFFIRMED,
    result: '8-1',
    argumentDate: LocalDate.of(2024, 2, 5),
    sitting: CaseSitting.February,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
  {
    id: 2,
    case: 'test2',
    shortSummary: 'test case 2',
    status: CaseStatus.AFFIRMED,
    result: '8-1',
    argumentDate: LocalDate.of(2024, 1, 5),
    sitting: CaseSitting.January,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
  {
    id: 3,
    case: 'test3',
    shortSummary: 'test case 3',
    status: CaseStatus.AFFIRMED,
    result: '8-1',
    argumentDate: LocalDate.of(2023, 11, 1),
    sitting: CaseSitting.November,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
];

const testCases2: Case[] = [
  {
    id: 10,
    case: 'test10',
    shortSummary: 'test case 10',
    status: CaseStatus.GRANTED,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
  {
    id: 11,
    case: 'test11',
    shortSummary: 'test case 11',
    status: CaseStatus.DIG,
    result: '8-1',
    argumentDate: LocalDate.of(2024, 2, 15),
    sitting: CaseSitting.February,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
  {
    id: 12,
    case: 'test12',
    shortSummary: 'test case 12',
    status: CaseStatus.GRANTED,
    argumentDate: LocalDate.of(2024, 2, 15),
    sitting: CaseSitting.February,
    important: true,
    term: {
      id: 1,
      inactive: false,
      name: 'term1',
      otName: 'term1',
    },
  },
];