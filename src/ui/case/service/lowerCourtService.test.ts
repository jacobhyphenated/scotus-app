import { DocketStatus, FullDocket } from "../../../stores/docketStore";
import { groupDocketsByDecision } from "./lowerCourtService";

describe('Lower Court Service', () => {
  describe('groupDocketsByDecision', () => {
    it('should group together dockets with the same ruling and same lower court', () => {
      const results = groupDocketsByDecision(testDocketsSameCourt);
      expect(results.length).toBe(1);
      expect(results[0].lowerCourtRuling).toBe('aaa');
      expect(results[0].docketIdentifiers.length).toBe(2);
      expect(results[0].docketIdentifiers).toContainEqual({
        docketId: 1,
        docketNumber: '1-01',
        title: 'Docket 1',
      });
      expect(results[0].docketIdentifiers).toContainEqual({
        docketId: 2,
        docketNumber: '1-02',
        title: 'Docket 2',
      });
    });

    it('should separate out dockets from different courts', () => {
      const results = groupDocketsByDecision(testDocketsDifferentCourt);
      expect(results.length).toBe(2);
    });
  });
});

const testDocketsSameCourt: FullDocket[] = [
  {
    id: 1,
    caseId: null,
    title: 'Docket 1',
    docketNumber: '1-01',
    lowerCourtRuling: 'aaa',
    status: DocketStatus.CERT_GRANTED,
    lowerCourtOverruled: null,
    lowerCourt: {
      id: 100,
      name: 'lower court 1',
      shortName: 'lc1',
    },
  },
  {
    id: 2,
    caseId: null,
    title: 'Docket 2',
    docketNumber: '1-02',
    lowerCourtRuling: 'aaa',
    status: DocketStatus.CERT_GRANTED,
    lowerCourtOverruled: null,
    lowerCourt: {
      id: 100,
      name: 'lower court 1',
      shortName: 'lc1',
    },
  },
];

const testDocketsDifferentCourt: FullDocket[] = [
  {
    id: 11,
    caseId: null,
    title: 'Docket 11',
    docketNumber: '1-11',
    lowerCourtRuling: 'bbb',
    status: DocketStatus.CERT_GRANTED,
    lowerCourtOverruled: null,
    lowerCourt: {
      id: 100,
      name: 'lower court 1',
      shortName: 'lc1',
    },
  },
  {
    id: 12,
    caseId: null,
    title: 'Docket 2',
    docketNumber: '1-12',
    lowerCourtRuling: 'bbb',
    status: DocketStatus.CERT_GRANTED,
    lowerCourtOverruled: null,
    lowerCourt: {
      id: 200,
      name: 'lower court 2',
      shortName: 'lc2',
    },
  },
];