import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AgendaItem, User } from '../../../models/meeting.model';
import { Subscription, interval, of } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  meetings: any[] = [];
  totalOwnershipInHouse: number = 10000;
  loading: boolean = false;
  private pollingSub?: Subscription;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.startPolling();
  }

  startPolling(): void {
    this.pollingSub = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.getMeetings().pipe(
          catchError(err => {
            console.error('Admin polling hiba:', err);
            return of([]);
          })
        ))
      )
      .subscribe({
        next: (res: any) => {
          const data = res.data ? res.data : res;
          this.meetings = Array.isArray(data) ? data : [];
        }
      });
  }

  calculateAttendance(presentUsers: any[] | undefined): number {
    if (!presentUsers || !Array.isArray(presentUsers)) return 0;
    return presentUsers.reduce((sum, u) => sum + (Number(u.ownership_ratio) || 0), 0);
  }

  // --- EZT HIÁNYOLTA A FORDÍTÓ ---
  isStartDisabled(meeting: any): boolean {
    if (meeting.is_repeated == 1 || meeting.is_repeated == true) {
      return false;
    }
    const attendance = this.calculateAttendance(meeting.present_users);
    return attendance <= 5000;
  }

  updateStatus(itemId: number, newStatus: 'ACTIVE' | 'CLOSED'): void {
    this.apiService.updateAgendaStatus(itemId, newStatus).subscribe({
      next: (updatedItem) => {
        this.meetings.forEach(m => {
          const index = m.agenda_items.findIndex((i: any) => i.id === updatedItem.id);
          if (index !== -1) {
            m.agenda_items[index] = updatedItem;
          }
        });
      },
      error: () => Swal.fire('Hiba', 'Nem sikerült frissíteni a státuszt!', 'error')
    });
  }

  getVoteResults(item: any) {
    const votes = item.resolutions?.[0]?.votes || [];
    const results = { yes: 0, no: 0, abstain: 0 };
    votes.forEach((v: any) => {
      const weight = Number(v.user?.ownership_ratio) || 0;
      const voteVal = String(v.vote).toLowerCase();
      if (voteVal === 'igen' || voteVal === 'yes') results.yes += weight;
      else if (voteVal === 'nem' || voteVal === 'no') results.no += weight;
      else if (voteVal === 'tartozkodas' || voteVal === 'abstain') results.abstain += weight;
    });
    return results;
  }

  getItemVoteSum(item: any): number {
    const votes = item.resolutions?.[0]?.votes;
    if (!votes || !Array.isArray(votes)) return 0;
    return votes.reduce((sum: number, v: any) => sum + (Number(v.user?.ownership_ratio) || 0), 0);
  }

  getSpeechCount(meeting: any): number {
    let count = 0;
    meeting.agenda_items?.forEach((item: any) => {
      // Csak azokat szűrjük le, ahol a user_id NEM null
      const speeches = item.resolutions?.filter((r: any) => r.user_id !== null);
      count += speeches?.length || 0;
    });
    return count;
  }

  showSpeeches(meeting: any) {
    let content = '<div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 5px;">';
    let hasSpeeches = false;

    meeting.agenda_items?.forEach((item: any) => {
      const speeches = item.resolutions?.filter((r: any) => r.user_id !== null);
      
      if (speeches && speeches.length > 0) {
        hasSpeeches = true;
        content += `
          <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0dcaf0; color: white; padding: 10px 15px; font-weight: bold; font-size: 0.9rem;">
              <i class="bi bi-bookmark-fill me-2"></i>Napirend: ${item.title}
            </div>
            <div style="padding: 10px; background: #fff;">`;

        speeches.forEach((s: any) => {
          const userName = s.user?.name || 'Névtelen hozzászóló';
          const userRatio = s.user?.ownership_ratio || '0';
          content += `
            <div style="margin-bottom: 10px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0dcaf0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong style="color: #333;">👤 ${userName}</strong>
                <span style="font-size: 0.75rem; font-weight: bold; color: #0dcaf0;">${userRatio} th.</span>
              </div>
              <div style="color: #555; line-height: 1.4; font-size: 0.95rem; font-style: italic;">
                "${s.text}"
              </div>
            </div>`;
        });
        content += `</div></div>`;
      }
    });

    content += '</div>';

    if (!hasSpeeches) {
      Swal.fire('Nincs felszólalás', 'Ehhez a közgyűléshez még nem érkezett tulajdonosi észrevétel.', 'info');
      return;
    }

    Swal.fire({
      title: '<span style="font-size: 1.5rem; font-weight: 800;">🎤 Felszólalások listája</span>',
      html: content,
      width: '700px',
      confirmButtonText: 'Értettem',
      confirmButtonColor: '#0dcaf0',
      customClass: { popup: 'rounded-4 shadow-lg' }
    });
  }

  onDeleteMeeting(meetingId: number): void {
    Swal.fire({
      title: 'Biztosan törlöd?',
      text: "Minden adat véglegesen elvész!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Igen, töröld!',
      cancelButtonText: 'Mégse'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMeeting(meetingId).subscribe({
          next: () => {
            this.meetings = this.meetings.filter(m => m.id !== meetingId);
            Swal.fire('Törölve!', 'A közgyűlés eltávolítva.', 'success');
          }
        });
      }
    });
  }

onToggleRepeated(meetingId: number) {
  this.apiService.toggleRepeated(meetingId).subscribe({
    next: (updatedMeeting: any) => {
      this.meetings = this.meetings.map(m => 
        m.id === meetingId ? { ...m, is_repeated: updatedMeeting.is_repeated } : m
      );
      
      Swal.fire({
        title: 'Siker',
        text: 'A határozatképességi korlát feloldva!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Hiba', 'Nem sikerült az átállítás a szerveren!', 'error');
    }
  });
}
isAccepted(item: any, meeting: any): boolean {
  const results = this.getVoteResults(item);
  
  if (meeting.is_repeated) {
    return results.yes > results.no;
  }
  
  return results.yes > 5000;
}
  
  isMeetingLocked(agendas: any[]): boolean {
    if (!agendas || agendas.length === 0) return false;
    return agendas.some(a => a.status !== 'PENDING');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'CLOSED': return 'bg-secondary';
      default: return 'bg-warning text-dark';
    }
  }

  printReport(): void { window.print(); }
  ngOnDestroy(): void { this.pollingSub?.unsubscribe(); }
}