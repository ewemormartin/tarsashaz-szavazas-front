import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  currentOwner: any;

  ngOnInit(): void {
    // Lekérjük a bejelentkezett felhasználót
    this.currentOwner = this.userService.getCurrentUser();
  }
}