import { observable, computed, action, runInAction, autorun} from 'mobx'
import { NetworkService } from '../services/networkService'

export class UserStore {

  constructor(private networkService: NetworkService) {
    autorun( () => {
      this.networkService.authorizationToken = this.authHeaderToken;
    })
  }

  @observable username?: string;
  @observable password?: string;
  @observable roles?: string[];

  @computed get authHeaderToken(): string {
    return `Basic ${btoa(`${this.username}:${this.password}`)}`;
  }

  @computed get isAdmin(): boolean {
    return this.roles?.some(role => role === 'ROLE_ADMIN') ?? false;
  }

  @action
  async authenticate(username: string, password: string) {
    this.username = undefined;
    this.password = undefined;
    this.roles = undefined;
    const user = await this.networkService.authenticate(username, password);
    runInAction(() => {
      this.username = user?.username;
      this.password = user?.password;
      this.roles = user?.roles;
    })
    return user;
  }
}