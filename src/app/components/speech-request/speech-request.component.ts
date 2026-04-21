import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-speech-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-request.component.html',
  styleUrls: ['./speech-request.component.css']
})
export class SpeechRequestsComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  
  meetingId: number = 1;
  agendaItems: any[] = [];
  private pollingSub?: Subscription;

  ngOnInit(): void {
    this.startPolling();
  }

  startPolling(): void {
    this.pollingSub = interval(4000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.getMeeting(this.meetingId))
      )
      .subscribe(data => {
        // Csak azokat a napirendi pontokat szűrjük le, ahol van felszólaló
        this.agendaItems = data.agenda_items.filter((item: any) => item.speakers && item.speakers.length > 0);
      });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }
}