import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent {
  // Modern Angular: inject() használata a konstruktor helyett
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  public router = inject(Router);
  private userService= inject(UserService);

  meetingForm: FormGroup;
  loading: boolean = false;

  constructor() {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      meeting_date: ['', Validators.required],
      location: ['', Validators.required],
      agenda_items: this.fb.array([this.createAgendaItem()]) 
    });
    
  }

  // Getter a FormArray-hez
  get agendaItems() {
    return this.meetingForm.get('agenda_items') as FormArray;
  }

  // Új napirendi pont struktúra létrehozása
  createAgendaItem(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      resolution_text: ['', Validators.required],
      username:this.userService.getCurrentUser().name
    });
  }

  // Új pont hozzáadása a listához
  addAgendaItem() {
    this.agendaItems.push(this.createAgendaItem());
    
    // Opcionális: SweetAlert toast visszajelzés az adminnak
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
    });
    Toast.fire({
      icon: 'success',
      title: 'Új napirendi pont hozzáadva'
    });
  }

  // Pont eltávolítása (minimum 1 maradnia kell)
  removeAgendaItem(index: number) {
    if (this.agendaItems.length > 1) {
      this.agendaItems.removeAt(index);
    } else {
      Swal.fire({
        title: 'Figyelem!',
        text: 'Legalább egy napirendi pont megadása kötelező.',
        icon: 'warning',
        confirmButtonColor: '#0d6efd'
      });
    }
  }

  onSubmit() {
    if (this.meetingForm.invalid) {
      // Ha érvénytelen, megjelöljük a mezőket, hogy pirosodjanak
      this.meetingForm.markAllAsTouched();
      Swal.fire({
        title: 'Hiányzó adatok!',
        text: 'Kérjük, töltse ki az összes kötelező mezőt a mentés előtt.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.loading = true;

    // Adatok előkészítése
    const formData = { ...this.meetingForm.value };
    const rawDate = formData.meeting_date; 
    formData.meeting_date = new Date(rawDate).toISOString();

    this.apiService.createMeeting(formData).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: 'Sikeres mentés!',
          text: 'A közgyűlés és a napirendi pontok rögzítve lettek a rendszerben.',
          icon: 'success',
          confirmButtonColor: '#2ecc71'
        }).then(() => {
          this.router.navigate(['/admin']);
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Mentési hiba:', err);
        Swal.fire({
          title: 'Szerver hiba!',
          text: err.error?.message || 'Nem sikerült elmenteni a közgyűlést. Próbálja újra később.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}