import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Observable, filter } from 'rxjs';
import { AppState } from '../../models/meeting.model';
import { AuthService } from '../../services/auth.service';
import { VotingService } from '../../services/voting';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  state$: Observable<AppState> | undefined;
  isAdminPage: boolean = false;
  themeService = inject(ThemeService)

  constructor(
    public userService: UserService,
    public authService:AuthService,
    public votingService: VotingService, 
    private router: Router
  ) {
    this.state$ = this.votingService.meetingState$;
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminPage = event.url.includes('/admin');
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
