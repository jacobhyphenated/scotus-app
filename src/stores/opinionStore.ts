import { NetworkService } from "../services/networkService";

export interface OpinionJustice extends CreateOpinionJustice {
  justiceName: string;
}

export interface CreateOpinionJustice {
  justiceId: number;
  isAuthor: boolean;
}

export interface Opinion {
  id: number;
  caseId: number;
  opinionType: OpinionType;
  summary: string;
  justices: OpinionJustice[];
}

export enum OpinionType {
  MAJORITY = 'MAJORITY',
  PER_CURIUM = 'PER_CURIUM',
  CONCURRENCE = 'CONCURRENCE',
  CONCUR_JUDGEMENT = 'CONCUR_JUDGEMENT',
  DISSENT = 'DISSENT',
  DISSENT_JUDGEMENT = 'DISSENT_JUDGEMENT'
}

export const opinionSort = (o1: Opinion, o2: Opinion) => {
  const types = Object.values(OpinionType);
  return types.indexOf(o1.opinionType) - types.indexOf(o2.opinionType);
};

export class OpinionStore {

  constructor(private networkService: NetworkService) {}

  async getOpinionsForCase(caseId: number): Promise<Opinion[]> {
    return this.networkService.get(`/opinions/case/${caseId}`);
  }

  async createOpinion(caseId: number, opinionType: OpinionType, summary: string, justices: CreateOpinionJustice[]): Promise<Opinion> {
    return this.networkService.post<Opinion>('/opinions', {
      caseId,
      opinionType,
      summary,
      justices,
    });
  }

  async editOpinionSummary(opinionId: number, summary:string): Promise<Opinion> {
    return this.networkService.put(`/opinions/${opinionId}/summary`, {summary});
  }

  async deleteOpinion(id: number): Promise<void> {
    this.networkService.delete(`/opinions/${id}`);
  }
}
