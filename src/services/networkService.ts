export class NetworkService {
  constructor(private baseApi: string) {}

  authorizationToken?: String;

  async authenticate(username: string, password: string): Promise<UserResponse | null> {
    const response = await fetch(`${this.baseApi}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      }
    })
    const userResponse = await response.json();
    if (response.status >= 300) {
      throw new Error(userResponse.errorMessage)
    }
    return userResponse ? Object.assign(userResponse, { password }) : null;
  }

  async get<T>(uri: string, params?: { [id: string]: string}): Promise<T> {
    return this.fetchHelper<T>('GET', uri, params);
  }

  private async fetchHelper<T>(verb: string, uri: string, params?: { [id: string]: string}, body?: any): Promise<T> {
    const response = await fetch(this.baseApi + uri, {
      method: verb,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        // TODO: auth header
      },
      body: body ? JSON.stringify(body) : null
    });
    if (response.status >= 300) {
      const errorResponse = await response.json();
      throw new Error(errorResponse)
    }
    const result = await response.json() as T 
    return result;
  }
}

interface RawUserResponse {
  username: string;
  roles: string[];
}

export type UserResponse = RawUserResponse & { password: string};