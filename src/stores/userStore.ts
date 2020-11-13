import { observable, computed, action, runInAction, autorun, makeObservable} from 'mobx';
import { NetworkService } from '../services/networkService';

export class UserStore {
  @observable username?: string;
  @observable password?: string;
  @observable roles?: string[];

  constructor(private networkService: NetworkService) {
    makeObservable(this);
    const rawUser = sessionStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      runInAction(() => {
        this.username = user.username;
        this.password = user.password;
        this.roles = user.roles;
      });
    }
    autorun( () => {
      if (this.authHeaderToken) {
        this.networkService.authorizationToken = this.authHeaderToken;
      }
    }, {requiresObservable: true});
  }

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
    });
    return user;
  }
}