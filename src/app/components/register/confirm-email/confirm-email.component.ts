import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ellenőrzés...</span>
      </div>
      <p>Regisztráció véglegesítése folyamatban, kérjük várjon...</p>
    </div>
  `,
  styles: [`
    .confirm-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 70vh;
      font-family: sans-serif;
    }
    .spinner-border { margin-bottom: 20px; }
  `]
})
export class ConfirmEmailComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.confirmRegistration(token);
    } else {
      this.router.navigate(['/register']);
    }
  }

  confirmRegistration(token: string) {
    this.authService.confirmEmail(token).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sikeres megerősítés!',
          text: 'A fiókja aktiválva lett. Most már bejelentkezhet.',
          icon: 'success',
          confirmButtonColor: '#4a90e2'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Hiba!',
          text: err.error?.message || 'A megerősítő link érvénytelen vagy lejárt.',
          icon: 'error'
        }).then(() => {
          this.router.navigate(['/register']);
        });
      }
    });
  }
}