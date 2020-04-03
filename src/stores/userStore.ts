import { observable, computed, action, runInAction, autorun} from 'mobx'
import { NetworkService } from '../services/networkService'

export class UserStore {

  constructor(private networkService: NetworkService) {
    autorun( () => {
      if (this.authHeaderToken) {
        this.networkService.authorizationToken = this.authHeaderToken;
      }
    })
    const rawUser = sessionStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      runInAction(() => {
        this.username = user.username;
        this.password = user.password;
        this.roles = user.roles;
      });
    }
  }

  @observable username?: string;
  @observable password?: string;
  @observable roles?: string[];

  @computed get authHeaderToken(): string | null {
    return this.username ? `Basic ${btoa(`${this.username}:${this.password}`)}` : null;
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
    sessionStorage.setItem('user', JSON.stringify(user));
    runInAction(() => {
      this.username = user?.username;
      this.password = user?.password;
      this.roles = user?.roles;
    })
    return user;
  }
}