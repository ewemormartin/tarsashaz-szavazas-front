import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], // 6 karakteres minimum
      password_confirmation: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator // Egyedi validátor a jelszóegyezéshez
    });
  }

  // Jelszó egyezőség ellenőrzése
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    
    if (password !== confirmPassword) {
      control.get('password_confirmation')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: 'Sikeres regisztráció!',
            text: 'Fiókját létrehoztuk. Most már bejelentkezhet!',
            icon: 'success',
            confirmButtonText: 'Tovább a belépéshez',
            confirmButtonColor: '#0d6efd'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            title: 'Hiba',
            text: err.error?.message || 'A regisztráció sikertelen. Próbálja újra!',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched(); // Megjeleníti a hibákat, ha üresen küldik el
    }
  }
}