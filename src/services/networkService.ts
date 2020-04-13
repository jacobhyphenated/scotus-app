export class NetworkService {
  constructor(private baseApi: string) {}

  authorizationToken?: string;

  async authenticate(username: string, password: string): Promise<UserResponse | null> {
    const response = await fetch(`${this.baseApi}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
      },
    });
    const userResponse = await response.json();
    if (response.status >= 300) {
      throw new Error(userResponse.errorMessage);
    }
    return userResponse ? Object.assign(userResponse, { password }) : null;
  }

  async get<T>(uri: string, params?: { [id: string]: string}): Promise<T> {
    return this.fetchHelper<T>('GET', uri, params);
  }

  async post<T>(uri: string, body?: any): Promise<T> {
    return this.fetchHelper<T>('POST', uri, undefined, body);
  }

  async put<T>(uri: string, body?: any): Promise<T> {
    return this.fetchHelper<T>('PUT', uri, undefined, body);
  }

  async patch<T>(uri: string, body: any): Promise<T> {
    return this.fetchHelper<T>('PATCH', uri, undefined, body);
  }

  private async fetchHelper<T>(verb: string, uri: string, params?: { [id: string]: string}, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authorizationToken) {
      headers['Authorization'] =  this.authorizationToken;
    }

    let url = this.baseApi + uri;
    if (params) {
      const queryParmas = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      url += `?${queryParmas}`;
    }

    const response = await fetch(url, {
      method: verb,
      mode: 'cors',
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    if (response.status >= 300) {
      if (response.status === 404) {
        throw new Error('Not Found');
      }
      const errorResponse = await response.json();
      console.warn(errorResponse);
      throw new Error(errorResponse?.errorMessage);
    }
    const result = await response.json() as T; 
    return result;
  }
}

interface RawUserResponse {
  username: string;
  roles: string[];
}

export type UserResponse = RawUserResponse & { password: string};