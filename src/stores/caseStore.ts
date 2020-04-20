import { NetworkService } from '../services/networkService';
import { observable, runInAction } from 'mobx';
import { LocalDate } from '@js-joda/core';
import { Court } from './courtStore';

export enum CaseStatus {
  GRANTED = 'GRANTED',
  ARGUMENT_SCHEDULED = 'ARGUMENT_SCHEDULED',
  ARGUED = 'ARGUED',
  DIG = 'DIG',
  GVR = 'GVR',
  AFFIRMED = 'AFFIRMED',
  REVERSED = 'REVERSED',
  REMANDED = 'REMANDED',
}

export interface Term {
  id: number;
  name: string;
  otName: string;
}
export interface Case {
  id: number;
  case: string;
  shortSummary: string;
  status: CaseStatus;
  result?: string;
  argumentDate?: LocalDate;
  decisionDate?: LocalDate;
  decisionSummary?: string;
  term: Term;
}

// TODO: Move to Opinion store?
export interface OpinionJustice {
  justiceId: number;
  isAuthor: boolean;
  justiceName: string;
}

export enum OpinionType {
  MAJORITY = 'MAJORITY',
  PER_CURIUM = 'PER_CURIUM',
  CONCURRENCE = 'CONCURRENCE',
  DISSENT = 'DISSENT',
  CONCUR_JUDGEMENT = 'CONCUR_JUDGEMENT',
  DISSENT_JUDGEMENT = 'DISSENT_JUDGEMENT'
}

export interface CaseDocket {
  docketId: number;
  docketNumber: string;
  lowerCourt: Court;
  lowerCourtOverruled?: boolean;
} 

export interface CaseOpinion {
  opinionId: number;
  opinionType: OpinionType;
  summary: string;
  justices: OpinionJustice[];
}

export interface FullCase extends Case {
  opinions: CaseOpinion[];
  dockets: CaseDocket[];
}

export class CaseStore {

  @observable
  allTerms: Term[] = [];

  termSorter = (t1: Term, t2: Term) => t2.otName.localeCompare(t1.otName);

  constructor(private networkService: NetworkService) {
    this.refreshAllTerms();
  }

  async refreshAllTerms() {
    const result = await this.networkService.get<Term[]>('/cases/term');
    runInAction(() => {
      this.allTerms = result.sort(this.termSorter);
    });
  }

  async createTerm(name: string, otName: string): Promise<Term> {
    const result = await this.networkService.post<Term>('/cases/term', { name, otName });
    runInAction(() => {
      this.allTerms.push(result);
      this.allTerms = this.allTerms.slice().sort(this.termSorter);
    });
    return result;
  }

  async getCaseByTerm(termId: number): Promise<Case[]> {
    const result = await this.networkService.get<Case[]>(`/cases/term/${termId}`);
    return result.map(c => this.mapCase(c));
  }

  async searchCase(searchTerm: string): Promise<Case[]> {
    const result = await this.networkService.get<Case[]>(`/cases/title/${encodeURIComponent(searchTerm)}`);
    return result.map(c => this.mapCase(c));
  }

  async getCaseById(id: number): Promise<FullCase> {
    const result = await this.networkService.get<FullCase>(`/cases/${id}`);
    return this.mapCase(result);
  }

  async createCase(caseTitle: string, shortSummary: string, status: CaseStatus, termId: number, docketIds: number[]): Promise<FullCase> {
    const result = await this.networkService.post<FullCase>('/cases', {
      case: caseTitle,
      shortSummary,
      status,
      termId,
      docketIds,
    });
    return this.mapCase(result);
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
