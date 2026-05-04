import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export const customHttpClient = <T>(
  config: {
    url: string;
    method: string;
    params?: any;
    data?: any;
    headers?: any;
  },
  http: HttpClient
): Promise<T> => {

  // REMOVE any forced content-type for FormData
  if (config.data instanceof FormData) {
    config.headers = undefined;   // <--- 🔥 FORCE REMOVE HEADERS
  }

  const request = http.request<T>(config.method, config.url, {
    body: config.data,
    params: config.params,
    headers: config.headers,
  });

  return lastValueFrom(request);
};
