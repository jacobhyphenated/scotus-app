import { NetworkService } from '../services/networkService';
import { observable, runInAction } from 'mobx';
import { Court } from './courtStore';

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
export type FullDocket = BaseDocket &  { lowerCourt: Court }

export enum DocketStatus {
  PENDING,
  CERT_GRANTED,
  SCHEDULED,
  DONE // affirmed/remanded/reversed?
}

export class CourtStore {
  constructor(private networkService: NetworkService) {
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
    return this.networkService.get<FullDocket>(`/dockets/${id}`);
  }

  //TODO: search for docket by title
  //TODO: edit docket
  //TODO: assign to a case? - lower priority

}


