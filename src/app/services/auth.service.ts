import { inject, Injectable, Injector } from '@angular/core';
import { User } from '../models/meeting.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector); // Az Injector-t injektáljuk a mezőben
  private userKey = 'current_voter_user';
  private baseUrl = 'http://localhost:8000/api';

  constructor(private themeService: ThemeService) { }

  // Felhasználó mentése (bejelentkezéskor hívandó)
  setUser(user: User): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Aktuális felhasználó lekérése a tárolóból
  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('access_token', response.token);
          this.setUser(response.user);
        }
      })
    );
  }
  confirmEmail(token: string) {
    return this.http.post(`http://localhost:8000/api/register/confirm`, { token });
  }

  login(credentials: any) {

    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('access_token', response.token);
          this.setUser(response.user);
        }

      })
    );
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  // Kijelentkezés
  logout(): void {
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem('access_token');
    this.themeService.setDefaultTheme();
    this.router.navigate(['/login']);
  }

  // Ellenőrzés, hogy be van-e jelentkezve
  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.userKey) !== null;
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }
  resetPassword(password: string, token: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      password,
      password_confirmation: password, // Vagy vedd ki külön paraméterként
      token,
      email
    });
  }

}