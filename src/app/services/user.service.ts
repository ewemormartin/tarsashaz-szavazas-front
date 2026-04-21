import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/users';
  getCurrentUser() {
    const userJson = sessionStorage.getItem("current_voter_user");
    return userJson ? JSON.parse(userJson) : null;
  }
  getUsers() {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.baseUrl}`, { headers })
  }
  createUser(user: any) {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/${user}`, { headers })
  }
  setUser(user: any): void {
  localStorage.setItem('current_voter_user', JSON.stringify(user));
}
  updateUser(user: any) {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/${user.id}`,user, { headers })
  }
  deleteUser(id: any) {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/${id}`, { headers })
  }
}
