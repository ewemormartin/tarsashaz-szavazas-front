import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { VoterDashboardComponent } from './components/voter-dashboard/voter-dashboard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { CreateMeetingComponent } from './components/admin/create-meeting/create-meeting.component';
import { AboutComponent } from './components/about/about';
import { SpeechRequestsComponent } from './components/speech-request/speech-request.component';
import { EditMeetingComponent } from './components/admin/edit-meeting/edit-meeting.component';
import { RegisterComponent } from './components/register/register.component';
import { EditUser } from './components/admin/edit-user/edit-user';
import { ConfirmEmailComponent } from './components/register/confirm-email/confirm-email.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { ResetPasswordComponent } from './components/forgotpassword/resetpassword/resetpassword.component';
import { HelpComponent } from './components/help/help';
import { ProfileComponent } from './components/profile/profile';


export const routes: Routes = [
  {
    path: 'admin/create-meeting', 
    component: CreateMeetingComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin/edit-meeting/:id', 
    component: EditMeetingComponent, 
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: '', redirectTo: '/login', pathMatch: 'full' 
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Bejelentkezés - Szavazórendszer'
  },
  { 
    path: 'register', component: RegisterComponent 
  },
  {
    path: 'voter',
    component: VoterDashboardComponent,
    canActivate: [authGuard], // Csak bejelentkezve érhető el
    title: 'Szavazás - Tulajdonosi felület'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard], // Bejelentkezve ÉS admin joggal érhető el
    title: 'Adminisztráció - Közös képviselő'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'Rólunk - Szavazórendszer'
  },
  { path: 'admin/speeches',
     component: SpeechRequestsComponent,
     canActivate: [authGuard, adminGuard] 
  },
   { 
    path: 'admin/edit-users', 
    component: EditUser, 
    canActivate: [authGuard, adminGuard] 
  },
  {
    path:'register/confirm/:token',
    component: ConfirmEmailComponent
  },
  { path: 'forgot-password', component: ForgotpasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {path:"help",component:HelpComponent},
  {path:"profile",component:ProfileComponent},

];