import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { adminGuard } from '../../guards/admin-guard';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.authService.logout();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if(response.token) {
          localStorage.setItem('access_token', response.token);
          this.userService.setUser(response.user);
        }
        
        if (response.user.role === "admin") {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/voter']);
        }
        console.clear();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Hiba történt a bejelentkezés során.';
      }
    });
  }
}