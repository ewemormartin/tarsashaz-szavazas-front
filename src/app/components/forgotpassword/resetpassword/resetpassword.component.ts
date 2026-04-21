import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './resetpassword.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  standalone: true
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  message: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Kiolvassuk a tokent és az emailt az URL-ből
    this.token = this.route.snapshot.queryParams['token'];
    this.email = this.route.snapshot.queryParams['email'];
  }

  // Ellenőrizzük, hogy a két jelszó egyezik-e
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    const data = {
      token: this.token,
      email: this.email,
      password: this.resetForm.value.password,
      password_confirmation: this.resetForm.value.password_confirmation
    };

    this.authService.resetPassword(data.password, data.token, data.email).subscribe({
      next: () => {
        this.message = 'Sikeres jelszócsere! Átirányítás a bejelentkezéshez...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.message = 'Hiba történt. Valószínűleg lejárt a link.';
        this.loading = false;
      }
    });
  }
}