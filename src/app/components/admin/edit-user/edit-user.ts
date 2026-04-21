import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
  private apiService = inject(ApiService);
  private userService = inject(UserService);

  users: any[] = [];
  totalRatio: number = 0;
  loading: boolean = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.data;
        this.calculateTotal();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Hiba:', err);
      }
    });
  }

  calculateTotal() {
    this.totalRatio = this.users.reduce((sum, u) => sum + (Number(u.ownership_ratio) || 0), 0);
  }

  saveUser(user: any) {
    const updateData = {
      ownership_ratio: user.ownership_ratio,
      role_id: user.role_id
    };

    this.apiService.updateUser(user.id, updateData).subscribe({
      next: () => {
        this.calculateTotal();
        Swal.fire({
          icon: 'success',
          title: 'Mentve',
          text: `${user.name} hányada frissítve.`,
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire('Hiba', 'Sikertelen mentés!', 'error');
      }
    });
  }
  toggleUserStatus(user: any) {
    const newStatus = !user.is_active;
    console.log(newStatus);
    const updatedUser = { ...user, is_active: newStatus };
    this.userService.updateUser(updatedUser).subscribe({
      next: (res: any) => {
        const updated = res.data ? res.data : res;
        user.is_active = updated.is_active; // Azonnali frissítés a listában
        Swal.fire({
          icon: user.is_active ? 'success' : 'warning',
          title: user.is_active ? 'Felhasználó aktiválva' : 'Felhasználó letiltva',
          toast: true, position: 'top-end', timer: 2000, showConfirmButton: false
        });
      }, error: (err) => {
        console.error("Hiba történt:", err);
        Swal.fire('Hiba', 'Nem sikerült módosítani a státuszt!', 'error');
      }
    });
  }
}