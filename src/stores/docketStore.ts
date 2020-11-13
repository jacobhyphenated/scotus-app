import { NetworkService } from '../services/networkService';
import { makeObservable, observable, runInAction } from 'mobx';
import { Court } from './courtStore';
import { Case } from './caseStore';
import { LocalDate } from '@js-joda/core';

interface BaseDocket {
  id: number;
  caseId: number | null;
  title: string;
  docketNumber: string;
  lowerCourtRuling: string;
  lowerCourtOverruled: boolean | null;
  status: DocketStatus;
}

export type BareDocket = BaseDocket &  { lowerCourtId: number }
export type FullDocket = BaseDocket &  { lowerCourt: Court, case?: Case }

export enum DocketStatus {
  PENDING = "PENDING",
  CERT_GRANTED = "CERT_GRANTED",
  CERT_DENIED = "CERT_DENIED",
  SCHEDULED = "SCHEDULED",
  DONE = "DONE" // affirmed/remanded/reversed?
}

export interface DocketEdit {
  title?: string;
  docketNumber?: string;
  lowerCourtOverruled?: boolean;
  lowerCourtRuling?: string;
  caseId?: number;
  status?: DocketStatus;
}

export class DocketStore {
  constructor(private networkService: NetworkService) {
    makeObservable(this);
    this.refreshUnassigned();
  }

  @observable
  unassignedDockets: BareDocket[] = [];

  async refreshUnassigned() {
    const result = await this.networkService.get<BareDocket[]>('/dockets/unassigned');
    runInAction(() => {
      this.unassignedDockets = result;
    });
  }

  async createDocket( title: string,
                      docketNumber: string,
                      lowerCourtId: number,
                      lowerCourtRuling: string,
                      status: DocketStatus = DocketStatus.PENDING): Promise<FullDocket> {
    const newDocket = await this.networkService.post<FullDocket>('/dockets', {
      title,
      docketNumber,
      lowerCourtId,
      lowerCourtRuling,
      status,
    });
    runInAction(() => {
      this.unassignedDockets.push( {...newDocket, lowerCourtId: newDocket.lowerCourt.id});
    });
    return newDocket;
  }

  async getDocketById(id: number): Promise<FullDocket> {
    const result = await this.networkService.get<FullDocket>(`/dockets/${id}`);
    return this.mapFullDocket(result);
  }

  async searchDocket(titleSearch: string): Promise<BareDocket[]> {
    return this.networkService.get(`/dockets/title/${encodeURIComponent(titleSearch)}`);
  }

  async editDocket(id: number, editRequest: DocketEdit): Promise<FullDocket> {
    const result = await this.networkService.patch<FullDocket>(`/dockets/${id}`, editRequest);
    return this.mapFullDocket(result);
  }

  private mapFullDocket(docket: FullDocket): FullDocket {
    if (!docket.case){
      return docket;
    }
    const argumentDate = docket.case.argumentDate ? LocalDate.parse(String(docket.case.argumentDate)) : undefined;
    const decisionDate = docket.case.decisionDate ? LocalDate.parse(String(docket.case.decisionDate)) : undefined;
    const mappedCase = {
      ...docket.case,
      argumentDate,
      decisionDate,
    };
    return {
      ...docket,
      case: {
        ...mappedCase,
      },
    };
  }
}
