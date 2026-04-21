# Fejlesztési Dokumentáció – Társasházi Szavazórendszer

**Verzió:** 1.0  
**Technológia:** Angular 21 (Frontend) + Laravel 11 (Backend)  
**Utoljára frissítve:** 2025

---

## 1. Rendszerarchitektúra

A rendszer szétválasztott kliens-szerver architektúrát alkalmaz.

**Backend:** Laravel 11 alapú RESTful API (`http://localhost:8000/api`). Felelős az üzleti logikáért, adattárolásért és a hitelesítésért. A munkamenetek Bearer Token (Laravel Sanctum) alapon működnek.

**Frontend:** Angular 21 Standalone architektúra (`http://localhost:4200`). Reaktív, egységes alkalmazás (SPA), amely RxJS operátorokra és Angular reactive forms-ra épül.

**Kommunikáció:** JSON alapú adatcsere HTTP protokollon keresztül. A hitelesítési token a `sessionStorage`-ban tárolódik.

---

## 2. Projekt struktúra

```
src/app/
├── components/
│   ├── admin/
│   │   ├── admin-dashboard/        # Közös képviselő vezérlőpultja
│   │   ├── create-meeting/         # Közgyűlés létrehozása
│   │   ├── edit-meeting/           # Közgyűlés szerkesztése
│   │   └── edit-user/              # Felhasználókezelés
│   ├── voter-dashboard/            # Tulajdonosi szavazófelület
│   ├── login/                      # Bejelentkezés
│   ├── register/                   # Regisztráció + e-mail megerősítés
│   ├── forgotpassword/             # Jelszóemlékeztető + visszaállítás
│   ├── navbar/                     # Navigációs sáv
│   ├── profile/                    # Felhasználói profil
│   ├── notifications/              # Értesítések
│   ├── speech-request/             # Felszólaláskezelés (admin)
│   ├── help/                       # Súgó oldal
│   └── about/                      # Névjegy oldal
├── services/
│   ├── api.service.ts              # Összes HTTP API hívás
│   ├── auth.service.ts             # Hitelesítés, munkamenet
│   ├── user.service.ts             # Felhasználói adatok kezelése
│   └── theme.service.ts            # Témaváltás (világos/sötét)
├── guards/
│   ├── auth-guard.ts               # Bejelentkezés ellenőrzése
│   └── admin-guard.ts              # Admin jogosultság ellenőrzése
├── models/
│   └── meeting.model.ts            # TypeScript interfészek
├── pipes/
│   └── meetingfilter-pipe.ts       # Közgyűlés-szűrő pipe
├── auth.interceptor.ts             # HTTP interceptor (token csatolás)
├── app.routes.ts                   # Útvonalak definíciója
└── app.config.ts                   # Alkalmazás konfiguráció
```

---

## 3. Útvonaltérkép (Routing)

| Útvonal | Komponens | Védelem |
|---|---|---|
| `/` | → redirect `/login` | – |
| `/login` | `LoginComponent` | – |
| `/register` | `RegisterComponent` | – |
| `/register/confirm/:token` | `ConfirmEmailComponent` | – |
| `/forgot-password` | `ForgotpasswordComponent` | – |
| `/reset-password` | `ResetPasswordComponent` | – |
| `/voter` | `VoterDashboardComponent` | `authGuard` |
| `/admin` | `AdminDashboardComponent` | `authGuard`, `adminGuard` |
| `/admin/create-meeting` | `CreateMeetingComponent` | `authGuard` |
| `/admin/edit-meeting/:id` | `EditMeetingComponent` | `authGuard`, `adminGuard` |
| `/admin/edit-users` | `EditUser` | `authGuard`, `adminGuard` |
| `/admin/speeches` | `SpeechRequestsComponent` | `authGuard`, `adminGuard` |
| `/profile` | `ProfileComponent` | – |
| `/about` | `AboutComponent` | – |
| `/help` | `HelpComponent` | – |

---

## 4. Adatmodellek (TypeScript interfészek)

### User
```typescript
interface User {
  id: number;
  name: string;
  ownership_ratio: number;  // Tulajdoni hányad (0–10000, ahol 10000 = 100%)
  role_id: number;
  is_active: boolean;
}
```

### AgendaItem (Napirendi pont)
```typescript
interface AgendaItem {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  resolutions: Resolution[];
}
```

### Resolution (Határozati javaslat)
```typescript
interface Resolution {
  id: number;
  text: string;
  votes?: any[];
  results?: { yes: number; no: number; abstain: number; };
}
```

---

## 5. Komponensek – részletes leírás

### 5.1. LoginComponent (`login.ts`)

**Feladat:** A rendszer belépési pontja. Azonosítja a felhasználót és meghatározza szerepkörét.

**Megvalósítás:**
- `ReactiveFormsModule` alapú beviteli validáció
- Sikeres bejelentkezés után az `AuthService.login()` elmenti a JWT tokent a `sessionStorage`-ba (`access_token` kulcs alatt)
- A felhasználói adatok szintén `sessionStorage`-ba kerülnek (`current_voter_user` kulcs)
- A háttérkép homályosítása CSS `::before` pseudo-elementtel készült, hogy a `filter: blur()` ne érintse az űrlapot

**Átirányítás bejelentkezés után:**
- `role === "admin"` → `/admin`
- egyéb szerepkör → `/voter`

---

### 5.2. AdminDashboardComponent (`admin-dashboard.ts`)

**Feladat:** A közös képviselő központi munkafelülete. Valós idejű közgyűlés-felügyeletet biztosít.

**Megvalósítás:**

*Lekérdezéses frissítés (Polling):*
```typescript
this.pollingSub = interval(5000)
  .pipe(
    startWith(0),
    switchMap(() => this.apiService.getMeetings().pipe(
      catchError(err => of([]))
    ))
  )
  .subscribe(...)
```
Az `interval(5000)` és `switchMap` operátor kombinációja 5 másodpercenként frissíti az adatokat anélkül, hogy párhuzamos kérések halmozódnának fel.

*Jelenlét-számítás:*
```typescript
calculateAttendance(presentUsers: any[]): number {
  return presentUsers.reduce((sum, u) => sum + (Number(u.ownership_ratio) || 0), 0);
}
```
A `reduce()` összesíti a jelenlévő felhasználók tulajdoni hányadát. Az eredmény 10000-ből értendő (pl. 5001 = 50,01%).

*Határozatképesség-ellenőrzés:*
```typescript
isStartDisabled(meeting: any): boolean {
  if (meeting.is_repeated == 1) return false;  // Megismételt közgyűlésnél nincs küszöb
  return this.calculateAttendance(meeting.present_users) <= 5000;
}
```
Normál közgyűlésnél 50%+1 tulajdoni hányad (>5000) szükséges az indításhoz.

*Napirendi pont állapotváltás:*
- `PENDING` → `ACTIVE`: szavazás megnyitása
- `ACTIVE` → `CLOSED`: szavazás lezárása

---

### 5.3. VoterDashboardComponent (`voter-dashboard.ts`)

**Feladat:** A tulajdonosok szavazati jogának gyakorlási felülete.

**Megvalósítás:**

*Lekérdezéses frissítés:* Azonos az admin polling mechanizmusával (5 másodperces `interval`), de kiegészül `forkJoin`-nal: minden közgyűlés részletes adatait külön API-hívással tölti le párhuzamosan.

*Szavazott tételek nyilvántartása:*
```typescript
votedResolutionIds: Set<number> = new Set();
```
`Set` típusú gyűjtemény tárolja a már megszavazott határozatok azonosítóit. A szavazógombok azonnal eltűnnek a voks leadása után, megakadályozva a dupla szavazást. Az adatok az API válaszából (`refreshStates()`) is visszatölthetők.

*Súlyozott szavazás:* A leadott szavazat értéke a felhasználó `ownership_ratio` értéke – ezt a backend az összesítésnél veszi figyelembe. A frontend csak a szavazatot (`igen` / `nem` / `tartózkodás`) és a `resolution_id`-t küldi el.

*Felhasználói visszajelzés:* SweetAlert2 könyvtár biztosítja a megerősítő és értesítő dialógusokat, szavazattól függő ikonokkal és színekkel.

*Aktivitásfigyelés:* Ha az API 403-as hibát ad vissza, a felhasználó `is_active` értéke `false`-ra állítódik, és az értesítés megjelenik a felületen.

---

### 5.4. CreateMeetingComponent (`create-meeting.component.ts`)

**Feladat:** Közgyűlés és napirendi pontok dinamikus felvétele.

**Megvalósítás:**
- Angular `FormArray` technológiát alkalmaz, így az admin tetszőleges számú napirendi pontot és határozati javaslatot adhat hozzá egyetlen űrlapon belül
- Az űrlap hierarchiája: `FormGroup` → `FormArray (agendaItems)` → `FormGroup` → `FormArray (resolutions)`

---

### 5.5. EditUser (`edit-user.ts`)

**Feladat:** A tulajdoni hányadok és felhasználói adatok módosítása.

**Megvalósítás:**
- Kétirányú adatkötés (`[(ngModel)]`) az értékek szerkesztéséhez
- `calculateTotal()` függvény minden módosításkor lefut és ellenőrzi, hogy a hányadok összege eléri-e a 10000-t (100%)
- Ha az összeg eltér 10000-től, figyelmeztetés jelenik meg
- `toggleUserStatus()` az aktiválás/letiltás gombot vezérli

---

### 5.6. NavbarComponent (`navbar.component.ts`)

**Feladat:** Egységes navigáció és kijelentkezés kezelése.

**Megvalósítás:**
- Figyeli a Router `NavigationEnd` eseményeit
- Csak bejelentkezett állapotban jelenik meg
- `role === "admin"` esetén az adminisztrációs menüpontok láthatók
- Egyéb szerepkörnél csak a tulajdonosi menüpontok elérhetők

---

## 6. Szolgáltatások (Services)

### 6.1. AuthService (`auth.service.ts`)

| Metódus | Leírás |
|---|---|
| `login(credentials)` | Bejelentkezési kérés, token + user mentése |
| `register(userData)` | Regisztrációs kérés |
| `logout()` | Munkamenet törlése, téma visszaállítása, átirányítás |
| `isLoggedIn()` | Ellenőrzi, hogy van-e érvényes munkamenet |
| `getCurrentUser()` | Visszaadja a tárolt felhasználói objektumot |
| `setUser(user)` | Felhasználói adatok mentése `sessionStorage`-ba |
| `sendPasswordResetEmail(email)` | Jelszó-visszaállítási e-mail kérése |
| `resetPassword(...)` | Új jelszó beállítása tokennel |

**Tárolás:** `sessionStorage` (böngészőlap bezárásakor automatikusan törlődik).

---

### 6.2. ApiService (`api.service.ts`)

Minden HTTP kommunikációt egyetlen szolgáltatás végez. A token minden hívásban kézileg kerül a fejlécbe (`Authorization: Bearer <token>`).

| Metódus | HTTP | Végpont |
|---|---|---|
| `getMeetings()` | GET | `/meetings` |
| `getMeeting(id)` | GET | `/meetings/:id` |
| `createMeeting(data)` | POST | `/meetings` |
| `updateMeeting(id, data)` | PUT | `/meetings/:id` |
| `deleteMeeting(id)` | DELETE | `/meetings/:id` |
| `updateAgendaStatus(id, status)` | PUT | `/agenda-items/:id` |
| `deleteAgendaItem(id)` | DELETE | `/agenda-items/:id` |
| `sendVote(resolutionId, vote)` | POST | `/votes` |
| `getUsers()` | GET | `/users` |
| `updateUser(id, data)` | PUT | `/users/:id` |
| `toggleUserStatus(id)` | PUT | `/users/:id/toggle-status` |
| `attendMeeting(id)` | POST | `/meetings/:id/attend` |
| `toggleRepeated(id)` | PUT | `/meetings/:id/toggle-repeated` |
| `requestToSpeak(...)` | POST | `/resolutions/` |

---

### 6.3. ThemeService (`theme.service.ts`)

Kezeli a világos/sötét megjelenési mód váltását. Kijelentkezéskor az `AuthService` meghívja a `setDefaultTheme()` metódust.

---

## 7. Biztonság

### 7.1. AuthInterceptor (`auth.interceptor.ts`)

Funkcionális HTTP interceptor (`HttpInterceptorFn`), amely minden kimenő kérésre automatikusan ráfűzi az `Authorization: Bearer <token>` fejlécet, ha van érvényes token a `localStorage`-ban.

> **Megjegyzés:** Az interceptor jelenleg `localStorage`-ból olvassa a tokent, míg az `AuthService` `sessionStorage`-ba ír. Egységesítés szükséges lehet, ha az interceptort aktívan alkalmazzák.

### 7.2. AuthGuard (`auth-guard.ts`)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  if (authService.isLoggedIn()) return true;
  else { router.navigate(['/login']); return false; }
};
```
Megakadályozza a védett útvonalak elérését bejelentkezés nélkül.

### 7.3. AdminGuard (`admin-guard.ts`)

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const user = userService.getCurrentUser();
  return user && user.role === "admin";
};
```
Biztosítja, hogy a `/admin` prefix alatti oldalakra csak adminisztrátorok léphessenek be.

---

## 8. Pipes

### MeetingfilterPipe (`meetingfilter-pipe.ts`)

A `VoterDashboardComponent`-ben használt szűrő pipe. Lehetővé teszi a közgyűlések cím, dátum és helyszín szerinti szűrését a `meetingFilterForm` form adatai alapján.

---

## 9. Külső függőségek

| Csomag | Verzió | Felhasználás |
|---|---|---|
| `@angular/core` | 21.x | Keretrendszer |
| `@angular/forms` | 21.x | Reactive Forms, FormArray |
| `@angular/router` | 21.x | SPA routing, Guards |
| `@angular/common/http` | 21.x | HTTP kommunikáció |
| `rxjs` | – | Aszinkron adatfolyamok, polling |
| `sweetalert2` | – | Felhasználói értesítések és dialógusok |

---

## 10. Fejlesztési környezet beállítása

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
ng serve

# Az alkalmazás elérhető: http://localhost:4200
# A backend alapértelmezett URL-je: http://localhost:8000/api
```

Az API alap URL-je az `api.service.ts` és `auth.service.ts` fájlokban a `private baseUrl` változóban van megadva. Éles üzemeltetéshez ezt environment változókra érdemes cserélni (`environment.ts`).

---
