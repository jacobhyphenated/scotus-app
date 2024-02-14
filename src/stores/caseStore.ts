import { NetworkService } from '../services/networkService';
import { makeObservable, observable, runInAction } from 'mobx';
import { LocalDate } from '@js-joda/core';
import { Court } from './courtStore';
import { DocketStore } from './docketStore';
import { Opinion } from './opinionStore';
import { Justice } from './justiceStore';
import { ObjectCache }  from '../util/cache';
import { createContext } from 'react';

export enum CaseStatus {
  GRANTED = 'GRANTED',
  ARGUMENT_SCHEDULED = 'ARGUMENT_SCHEDULED',
  ARGUED = 'ARGUED',
  DISMISSED = 'DISMISSED',
  DIG = 'DIG',
  GVR = 'GVR',
  AFFIRMED = 'AFFIRMED',
  REVERSED = 'REVERSED',
  REMANDED = 'REMANDED',
}

export enum CaseSitting {
  October = 'October',
  November = 'November',
  December = 'December',
  January = 'January',
  February = 'February',
  March = 'March',
  April = 'April',
  May = 'May',
}

export interface Term {
  id: number;
  name: string;
  otName: string;
  inactive: boolean;
}

export interface Case {
  id: number;
  case: string;
  shortSummary: string;
  status: CaseStatus;
  result?: string;
  argumentDate?: LocalDate;
  sitting?: CaseSitting;
  decisionDate?: LocalDate;
  decisionSummary?: string;
  important: boolean;
  term: Term;
}

export interface CaseDocket {
  docketId: number;
  docketNumber: string;
  title: string;
  lowerCourt: Court;
  lowerCourtOverruled?: boolean;
} 

export interface FullCase extends Case {
  opinions: Opinion[];
  dockets: CaseDocket[];
  alternateTitles: string[];
  decisionLink?: string;
  resultStatus?: CaseStatus;
}

export interface EditCase {
  case?: string;
  shortSummary?: string;
  resultStatus?: CaseStatus;
  argumentDate?: LocalDate;
  decisionDate?: LocalDate;
  result?: string;
  decisionSummary?: string;
  decisionLink?: string;
  termId?: number;
  important?: boolean;
  alternateTitles?: string[];
  sitting?: CaseSitting;
}

export interface TermSummary {
  termId: number;
  termEndDate: LocalDate;
  justiceSummary: TermJusticeSummary[];
  courtSummary: TermCourtSummary[];
  justiceAgreement: JusticeAgreement[];
  unanimous: Case[];
  partySplit: Case[];
}

export interface TermJusticeSummary {
  justice: Justice;
  majorityAuthor: number;
  concurringAuthor: number;
  concurJudgementAuthor: number;
  dissentAuthor: number;
  dissentJudgementAuthor: number;
  casesWithOpinion: number;
  casesInMajority: number;
  percentInMajority: number;
}

export interface TermCourtSummary {
  court: Court;
  cases: number;
  affirmed: number;
  reversedRemanded: number;
}

export interface JusticeAgreement {
  justiceId: number;
  opinionAgreementMap: { [id: number]: number };
  caseAgreementMap: { [id: number]: number };
}

export interface EditTermProps {
  name?: string;
  otName?: string;
  inactive?: boolean;
}

export const dismissedCases: (c: Case) => boolean = c => [CaseStatus.DIG, CaseStatus.DISMISSED, CaseStatus.GVR].includes(c.status);

export const CaseStoreContext = createContext<CaseStore>(null!);

export class CaseStore {

  allTerms: Term[] = [];

  caseCache: ObjectCache<FullCase, 'id'>;

  termSorter = (t1: Term, t2: Term) => t2.otName.localeCompare(t1.otName);

  constructor(private networkService: NetworkService,
              private docketStore: DocketStore) {
    makeObservable(this, {
      allTerms: observable,
    });
    this.caseCache = new ObjectCache();
    this.refreshAllTerms();
  }

  async refreshAllTerms() {
    const result = await this.networkService.get<Term[]>('/terms');
    runInAction(() => {
      this.allTerms = result.sort(this.termSorter);
    });
  }

  async createTerm(name: string, otName: string): Promise<Term> {
    const result = await this.networkService.post<Term>('/terms', { name, otName, inactive: true });
    runInAction(() => {
      this.allTerms.push(result);
      this.allTerms = this.allTerms.slice().sort(this.termSorter);
    });
    return result;
  }

  async editTerm(id: number, props: EditTermProps): Promise<Term> {
    const result = await this.networkService.patch<Term>(`/terms/${id}`, props);
    runInAction(() => {
      this.allTerms = this.allTerms.map(t => t.id === result.id ? result : t);
    });
    return result;
  }

  async getCaseByTerm(termId: number): Promise<Case[]> {
    const result = await this.networkService.get<Case[]>(`/cases/term/${termId}`);
    return result.map(c => this.mapCase(c));
  }

  async searchCase(searchTerm: string): Promise<Case[]> {
    const result = await this.networkService.get<Case[]>(`/cases/search/${encodeURIComponent(searchTerm)}`);
    return result.map(c => this.mapCase(c));
  }

  async getCaseById(id: number): Promise<FullCase> {
    const cachedValue = this.caseCache.getItem(id);
    if (cachedValue) {
      return Promise.resolve(cachedValue);
    }
    const result = await this.networkService.get<FullCase>(`/cases/${id}`);
    const c = this.mapCase(result);
    this.caseCache.putItem(c.id, c);
    return c;
  }

  async createCase(caseTitle: string, shortSummary: string, termId: number, important: boolean, docketIds: number[]): Promise<FullCase> {
    const result = await this.networkService.post<FullCase>('/cases', {
      case: caseTitle,
      shortSummary,
      termId,
      important,
      docketIds,
    });
    if (docketIds && docketIds.length > 0) {
      this.docketStore.refreshUnassigned();
    }
    const c = this.mapCase(result);
    this.caseCache.putItem(c.id, c);
    return c;
  }

  async editCase(id: number, request: EditCase): Promise<FullCase> {
    const result = await this.networkService.patch<FullCase>(`/cases/${id}`, request);
    const c = this.mapCase(result);
    this.caseCache.putItem(id, c);
    return c;
  }

  async removeArgumentDate(id: number): Promise<FullCase> {
    const result = await this.networkService.delete<FullCase>(`/cases/${id}/argumentDate`);
    const c = this.mapCase(result);
    this.caseCache.putItem(id, c);
    return c;
  }

  async assignDocket(caseId: number, docketId: number): Promise<FullCase> {
    const result = await this.networkService.put<FullCase>(`/cases/${caseId}/dockets/${docketId}`);
    this.docketStore.refreshUnassigned();
    const c = this.mapCase(result);
    this.caseCache.putItem(caseId, c);
    return c;
  }

  async removeDocket(caseId: number, docketId: number): Promise<void> {
    await this.networkService.delete<void>(`/cases/${caseId}/dockets/${docketId}`);
    this.docketStore.refreshUnassigned();
    this.caseCache.revoke(caseId);
  }

  async getTermSummary(termId: number): Promise<TermSummary> {
    const result = await this.networkService.get<TermSummary>(`/cases/term/${termId}/summary`);
    return {
      ...result,
      termEndDate: this.localDateParse(result.termEndDate) ?? LocalDate.MIN,
      unanimous: result.unanimous.map(c => this.mapCase(c)),
      partySplit: result.partySplit.map(c => this.mapCase(c)),
    };
  }

  revokeCaseCache(caseId: number): void {
    this.caseCache.revoke(caseId);
  }

  private mapCase<T extends Case>(rawCase: T): T {
    return {
      ...rawCase,
      argumentDate: this.localDateParse(rawCase.argumentDate),
      decisionDate: this.localDateParse(rawCase.decisionDate),
    };
  }

  private localDateParse(date?: LocalDate): LocalDate | undefined {
    return date ? LocalDate.parse(String(date)) : undefined;
  }

}
