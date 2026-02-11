import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from './auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/users/login', { id: username, psw: password });
  }
}