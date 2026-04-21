import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css'],
})
export class ForgotpasswordComponent {
  // Modern Angular: inject() használata
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm: FormGroup;
  loading = false;
  message = '';

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    const email = this.forgotPasswordForm.value.email;

    this.authService.sendPasswordResetEmail(email).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'A jelszóvisszaállító hivatkozást sikeresen elküldtük!';
        
        // Professzionális visszajelzés
        Swal.fire({
          title: 'E-mail elküldve!',
          text: 'Kérjük, ellenőrizze a beérkező leveleit (és a spam mappát is) a jelszó visszaállításához.',
          icon: 'success',
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Értettem'
        });

        // Form kiürítése
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.message = 'Hiba történt a küldés során.';
        
        Swal.fire({
          title: 'Hiba!',
          text: err.error?.message || 'A megadott e-mail címmel nem található felhasználó, vagy technikai hiba történt.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Próbálja újra'
        });
      }
    });
  }
}