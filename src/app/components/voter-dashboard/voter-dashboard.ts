import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service'; // Kijelentkezéshez kell
import { AgendaItem, User } from '../../models/meeting.model';
import { interval, startWith, Subscription, switchMap, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'; // Fontos operátorok
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MeetingfilterPipe } from '../../pipes/meetingfilter-pipe';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-voter-dashboard',
  templateUrl: './voter-dashboard.html',
  styleUrls: ['./voter-dashboard.css'],
  standalone: true,
  imports: [CommonModule, MeetingfilterPipe, FormsModule, ReactiveFormsModule]
})
export class VoterDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  meetings: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  filterOn = false;
  isParticipatingMap: Map<number, boolean> = new Map();
  private pollingSub?: Subscription;
  votedResolutionIds: Set<number> = new Set();
  spokenAgendaItemIds: Set<number> = new Set();
  builder = inject(FormBuilder);

  meetingFilterForm = this.builder.group({
    title: [''],
    meeting_date: [''],
    location: ['']
  });

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();
    this.startPolling();
  }

  startPolling(): void {
    this.pollingSub = interval(5000).pipe(
      startWith(0),
      switchMap(() => this.apiService.getMeetings().pipe(
        tap(() => {
          if (this.currentUser && !this.currentUser.is_active) {
            this.currentUser.is_active = true;
            this.userService.setUser(this.currentUser);
          }
        }),
        catchError((err) => {
          if (err.status === 403 && this.currentUser) {
            this.currentUser.is_active = false;
            this.userService.setUser(this.currentUser);
          }
          return of([]);
        })
      )),
      map((res: any) => (res && res.data ? res.data : res)),
      switchMap((meetingsArray: any[]) => {
        if (!Array.isArray(meetingsArray) || meetingsArray.length === 0) return of([]);
        const detailRequests = meetingsArray.map(m =>
          this.apiService.getMeeting(m.id).pipe(
            map(mRes => mRes.data ? mRes.data : mRes),
            catchError(() => of(null))
          )
        );
        return forkJoin(detailRequests);
      })
    ).subscribe((results: any[]) => {
      if (results) {
        this.meetings = results.filter(d => d !== null);
        this.refreshStates();
      }
    });
  }

  private refreshStates(): void {
    if (!this.currentUser || !this.meetings) return;
    const newVotedSet = new Set<number>();

    this.meetings.forEach(m => {
      const isPresent = m.present_users?.some((u: any) => String(u.id) === String(this.currentUser?.id));
      this.isParticipatingMap.set(m.id, isPresent);

      m.agenda_items?.forEach((item: any) => {
        item.resolutions?.forEach((res: any) => {
          const hasVoted = res.votes?.some((v: any) => String(v.user_id) === String(this.currentUser?.id));
          if (hasVoted) { newVotedSet.add(Number(res.id)); }
        });
      });
    });
    this.votedResolutionIds = newVotedSet;
  }

  hasVotedOnAgendaItem(agendaItem: any): boolean {
    if (!agendaItem.resolutions) return false;
    return agendaItem.resolutions.some((res: any) => this.votedResolutionIds.has(res.id));
  }

  onVote(resolutionId: number, choice: 'yes' | 'no' | 'abstain'): void {
    if (this.votedResolutionIds.has(resolutionId) || this.loading) return;
    this.loading = true;
    this.apiService.sendVote(resolutionId, choice).subscribe({
      next: () => {
        this.votedResolutionIds.add(resolutionId);
        this.loading = false;
        Swal.fire({ title: 'Szavazat rögzítve', icon: 'success', timer: 1500, showConfirmButton: false });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({ title: 'Hiba történt', text: err.error.message, icon: 'error' });
      }
    });
  }

  onSpeak(agendaItemId: number): void {
    Swal.fire({
      title: 'Felszólalás / Észrevétel',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Küldés',
      inputValidator: (value) => !value ? 'Nem küldhet üres hozzászólást!' : null
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.requestToSpeak(agendaItemId, result.value, this.currentUser?.name).subscribe({
          next: () => {
            this.spokenAgendaItemIds.add(agendaItemId);
            Swal.fire('Elküldve', 'Észrevételét rögzítettük.', 'success');
          },
          error: () => Swal.fire('Hiba', 'Nem sikerült elküldeni.', 'error')
        });
      }
    });
  }

  onJoinMeeting(meetingId: number): void {
    this.loading = true;
    this.apiService.attendMeeting(meetingId).subscribe({
      next: () => {
        this.isParticipatingMap.set(meetingId, true);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Hiba', 'Nem sikerült csatlakozni.', 'error');
      }
    });
  }
  isMeetingClosed(meeting: any): boolean {
    if (!meeting.agenda_items || meeting.agenda_items.length === 0) return false;

    return meeting.agenda_items.every((item: any) => item.status === 'CLOSED');
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'bg-success text-white' : (status === 'CLOSED' ? 'bg-secondary text-white' : 'bg-warning text-dark');
  }

  closefilter() { this.filterOn = !this.filterOn; }

  ngOnDestroy(): void { this.pollingSub?.unsubscribe(); }
}