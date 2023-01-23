import { NetworkService } from '../services/networkService';
import { makeObservable, observable, runInAction } from 'mobx';
import { createContext } from 'react';

export const CourtStoreContext = createContext<CourtStore>(null!);

export class CourtStore {
  constructor(private networkService: NetworkService) {
    makeObservable(this);
    this.refreshCourts();
  }

  @observable
  allCourts: Court[] = [];

  async refreshCourts() {
    const result = await this.networkService.get<Court[]>('/courts');
    runInAction(() => {
      this.allCourts = result.sort((c1, c2) => c1.shortName.localeCompare(c2.shortName));
    });
  }

  async createCourt(name: string, shortName: string): Promise<Court> {
    const newCourt = await this.networkService.post<Court>('/courts', { name, shortName });
    runInAction(() => {
      this.allCourts.push(newCourt);
    });
    return newCourt;
  }

}

export interface Court {
  id: number;
  name: string;
  shortName: string;
}
