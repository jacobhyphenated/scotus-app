import { NetworkService } from '../services/networkService';
import { observable, runInAction } from 'mobx';
import { LocalDate } from '@js-joda/core';
import { Court } from './courtStore';
import { DocketStore } from './docketStore';
import { Opinion } from './opinionStore';

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
  important: boolean;
  term: Term;
}

export interface CaseDocket {
  docketId: number;
  docketNumber: string;
  lowerCourt: Court;
  lowerCourtOverruled?: boolean;
} 

export interface FullCase extends Case {
  opinions: Opinion[];
  dockets: CaseDocket[];
}

export interface EditCase {
  case?: string;
  shortSummary?: string;
  status?: CaseStatus;
  argumentDate?: LocalDate;
  decisionDate?: LocalDate;
  result?: string;
  decisionSummary?: string;
  termId?: number;
  important?: boolean;
}

export class CaseStore {

  @observable
  allTerms: Term[] = [];

  termSorter = (t1: Term, t2: Term) => t2.otName.localeCompare(t1.otName);

  constructor(private networkService: NetworkService,
              private docketStore: DocketStore) {
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

  async createCase(caseTitle: string, shortSummary: string, status: CaseStatus, termId: number, important: boolean, docketIds: number[]): Promise<FullCase> {
    const result = await this.networkService.post<FullCase>('/cases', {
      case: caseTitle,
      shortSummary,
      status,
      termId,
      important,
      docketIds,
    });
    if (docketIds && docketIds.length > 0) {
      this.docketStore.refreshUnassigned();
    }
    return this.mapCase(result);
  }

  async editCase(id: number, request: EditCase): Promise<FullCase> {
    const result = await this.networkService.patch<FullCase>(`/cases/${id}`, request);
    return this.mapCase(result);
  }

  async assignDocket(caseId: number, docketId: number): Promise<FullCase> {
    const result = await this.networkService.put<FullCase>(`/cases/${caseId}/dockets/${docketId}`);
    this.docketStore.refreshUnassigned();
    return this.mapCase(result);
  }

  async removeDocket(caseId: number, docketId: number): Promise<void> {
    await this.networkService.delete<void>(`/cases/${caseId}/dockets/${docketId}`);
    this.docketStore.refreshUnassigned();
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
