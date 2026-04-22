import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-meeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-meeting.component.html'
})
export class EditMeetingComponent implements OnInit {
  editForm: FormGroup;
  meetingId!: number;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      meeting_date: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.meetingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMeetingData();
  }

  loadMeetingData(): void {
    this.loading = true;
    this.apiService.getMeeting(this.meetingId).subscribe({
      next: (data) => {
        const formattedDate = data.meeting_date ? new Date(data.meeting_date).toISOString().slice(0, 16) : '';
        
        this.editForm.patchValue({
          title: data.title,
          meeting_date: formattedDate,
          location: data.location
        });
        this.loading = false;
      },
      error: () => {
        Swal.fire('Hiba', 'Nem sikerült betölteni a közgyűlés adatait.', 'error');
        this.router.navigate(['/admin']);
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.apiService.updateMeeting(this.meetingId, this.editForm.value).subscribe({
        next: () => {
          Swal.fire('Siker', 'Közgyűlés adatai frissítve!', 'success');
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          Swal.fire('Hiba', err.error.message || 'Sikertelen módosítás', 'error');
        }
      });
    }
  }
}