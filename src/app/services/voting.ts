import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VotingService {
  private apiUrl = 'http://localhost:8000/api';
  private meetingState = new BehaviorSubject<any>(null);
  meetingState$ = this.meetingState.asObservable();

  constructor(private http: HttpClient) {}

  getMeetings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meetings`);
  }

  getMeetingDetails(id: number): Observable<any> {
    return this.http.get<any>(`/meetings/${id}`);
  }

  submitVote(resolutionId: number, choice: 'yes' | 'no' | 'abstain') {
    return this.http.post(`/votes`, { resolution_id: resolutionId, vote: choice });
  }

  updateAgendaStatus(itemId: number, status: string) {
    return this.http.put(`/agenda-items/${itemId}/status`, { status });
  }
}