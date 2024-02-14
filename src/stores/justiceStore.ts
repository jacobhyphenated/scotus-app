import { NetworkService } from '../services/networkService';
import { makeObservable, observable, runInAction } from 'mobx';
import { LocalDate } from '@js-joda/core';
import { createContext } from 'react';

export const JusticeStoreContext = createContext<JusticeStore>(null!);

export class JusticeStore {
  constructor(private networkService: NetworkService) {
    makeObservable(this, {
      activeJustices: observable,
    });
    this.refreshActiveJustices();
  }

  activeJustices?: Justice[];

  async refreshActiveJustices() {
    const result = await this.networkService.get<RawJustice[]>('/justices/active');
    runInAction(() => {
      this.activeJustices = result.map(this.mapRaw);
    });
  }

  async getAllJustices(): Promise<Justice[]> {
    const result = await this.networkService.get<RawJustice[]>('/justices');
    return result.map(this.mapRaw);
  }

  async retireJustice(id: number, date: LocalDate): Promise<Justice> {
    const result = await this.networkService.put<RawJustice>(`/justices/${id}/retire`, { retireDate: date });
    return this.mapRaw(result);
  }

  async createJustice(name: string, birthday: LocalDate, dateConfirmed: LocalDate, party: string): Promise<Justice> {
    const result = await this.networkService.post<RawJustice>('/justices', { name, birthday, dateConfirmed, party });
    return this.mapRaw(result);
  }

  async getById(id: number): Promise<Justice> {
    const result = await this.networkService.get<RawJustice>(`/justices/${id}`);
    return this.mapRaw(result);
  }

  private mapRaw(raw: RawJustice): Justice {
    return {
      ...raw,
      dateConfirmed: LocalDate.parse(raw.dateConfirmed),
      dateRetired: raw.dateRetired ? LocalDate.parse(raw.dateRetired) : undefined,
    };
  }

}

interface RawJustice {
  id: number;
  name: string;
  dateConfirmed: string;
  dateRetired?: string;
  party: string;
}

export interface Justice {
  id: number;
  name: string;
  dateConfirmed: LocalDate;
  dateRetired?: LocalDate;
  party: string;
}