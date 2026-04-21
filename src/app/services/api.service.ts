import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getMeeting(id: number): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.baseUrl}/meetings/${id}`, { headers });
  }
  getMeetings(): Observable<any[]> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<any[]>(`${this.baseUrl}/meetings`, { headers });
  }

  sendVote(resolutionId: number, vote: string): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/votes`, {
      resolution_id: resolutionId,
      vote: vote
    }, { headers });
  }

  // Admin funkció: Napirendi pont aktiválása
  updateAgendaStatus(id: number, status: string): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/agenda-items/${id}`, { status }, { headers });
  }
  updateMeeting(id: number, meetingData: any): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    // PUT kérést küldünk a módosításhoz
    return this.http.put(`${this.baseUrl}/meetings/${id}`, meetingData, { headers });
  }
  requestToSpeak(agendaItemId: number, comment: string, username:any): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const body = {
      agenda_item_id: agendaItemId,
      text: comment,
      username: username // Biztosítjuk, hogy szám legyen
    };

    // Ellenőrizd a végpontot! A kódodban most: /resolutions/ 
    // Biztos, hogy a felszólalás (comment) a határozatokhoz (resolutions) megy?
    return this.http.post(`${this.baseUrl}/resolutions/`, body, { headers });
  }
  createMeeting(meetingData: any): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/meetings`, meetingData, { headers });
  }
  getAgendaItems(meetingId: number): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    return this.http.get<any[]>(`${this.baseUrl}/agenda-items`, { headers });
  }
  deleteAgendaItem(id: number): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.delete(`${this.baseUrl}/agenda-items/${id}`, { headers });
  }
  deleteMeeting(id: number): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.delete(`${this.baseUrl}/meetings/${id}`, { headers });
  }
  getUsers(): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.baseUrl}/users`, { headers });
  }

  updateUser(userId: number, data: any): Observable<any> {
    const token = sessionStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/users/${userId}`, data, { headers });
  }
  attendMeeting(meetingId: number): Observable<any> {
    const token = sessionStorage.getItem('access_token'); // EZ HIÁNYZOTT
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/meetings/${meetingId}/attend`, {}, { headers });
  }

  // JAVÍTOTT: Megismételt közgyűlés státusz (Admin gombja)
  toggleRepeated(meetingId: number): Observable<any> {
    const token = sessionStorage.getItem('access_token'); // EZ HIÁNYZOTT
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/meetings/${meetingId}/toggle-repeated`, {}, { headers });
  }

  // JAVÍTOTT: Felhasználó aktiválása/letiltása
  toggleUserStatus(userId: number): Observable<any> {
    const token = sessionStorage.getItem('access_token'); // EZ HIÁNYZOTT
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.baseUrl}/users/${userId}/toggle-status`, {}, { headers });
  }
}
