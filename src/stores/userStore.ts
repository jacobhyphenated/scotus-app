import { observable, computed, action, runInAction, autorun, makeObservable} from 'mobx';
import { createContext } from 'react';
import { NetworkService } from '../services/networkService';

// React Type definitions require a default value, but this makes little sense.
// A provider must provide a value in the component tree, the default should never be used.
// And reating a default here would break dependency injection principles.
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106
export const UserStoreContext = createContext<UserStore>(null!);

export class UserStore {
  username?: string;
  password?: string;
  roles?: string[];

  constructor(private networkService: NetworkService) {
    makeObservable(this, {
      username: observable,
      password: observable,
      roles: observable,
      authHeaderToken: computed,
      isAdmin: computed,
      authenticate: action,

    });
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

  get authHeaderToken(): string | null {
    return this.username ? `Basic ${btoa(`${this.username}:${this.password}`)}` : null;
  }

  get isAdmin(): boolean {
    return this.roles?.some(role => role === 'ROLE_ADMIN') ?? false;
  }

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