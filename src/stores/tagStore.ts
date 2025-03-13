import { makeObservable, observable, runInAction } from "mobx";
import { createContext } from "react";
import { NetworkService } from "../services/networkService";

export interface Tag {
  id: number,
  name: string,
  description: string,
}

export const TagStoreContext = createContext<TagStore>(null!);

export class TagStore {
  constructor(private networkService: NetworkService) {
    makeObservable(this, {
      allTags: observable,
    });
    this.refreshTags();
  }

  allTags: Tag[] = [];

  async refreshTags() {
    const result = await this.networkService.get<Tag[]>('/tags');
    runInAction(() => {
      this.allTags = result.sort((t1, t2) => t1.name.localeCompare(t2.name));
    });
  }

  async createTag(name: string, description: string): Promise<Tag> {
    const result = await this.networkService.post<Tag>('/tags', { name, description });
    runInAction(() => {
      this.allTags.push(result);
    });
    return result;
  }

  async editTag(id: number, name?: string, description?: string): Promise<Tag> {
    const result = await this.networkService.patch<Tag>(`/tags/${id}`, { name, description });
    this.refreshTags();
    return result;
  }

  async deleteTag(id: number): Promise<void> {
    await this.networkService.delete(`/tags/${id}`);
    this.refreshTags();
  }

}