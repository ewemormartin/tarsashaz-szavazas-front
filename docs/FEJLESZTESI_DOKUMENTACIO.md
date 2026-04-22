# Társasház Szavazórendszer – Fejlesztési Dokumentáció

**Projekt neve:** `tarsashaz-szavazo`  
**Verziószám:** 0.0.0  
**Framework:** Angular 21  
**Dokumentáció készítésének dátuma:** 2026-04-22  
**Típus:** Single Page Application (SPA), standalone komponens architektúra

---

## Tartalomjegyzék

1. [Projektáttekintés](#1-projektáttekintés)
2. [Technológiai stack](#2-technológiai-stack)
3. [Projektstruktúra](#3-projektstruktúra)
4. [Konfiguráció és indítás](#4-konfiguráció-és-indítás)
5. [Útvonalkezelés (Routing)](#5-útvonalkezelés-routing)
6. [Adatmodellek](#6-adatmodellek)
7. [Szolgáltatások (Services)](#7-szolgáltatások-services)
   - 7.1 [AuthService](#71-authservice)
   - 7.2 [ApiService](#72-apiservice)
   - 7.3 [UserService](#73-userservice)
   - 7.4 [VotingService](#74-votingservice)
   - 7.5 [ThemeService](#75-themeservice)
8. [Route Guardok](#8-route-guardok)
   - 8.1 [authGuard](#81-authguard)
   - 8.2 [adminGuard](#82-adminguard)
9. [HTTP Interceptor](#9-http-interceptor)
10. [Pipe-ok](#10-pipe-ok)
    - 10.1 [MeetingfilterPipe](#101-meetingfilterpipe)
11. [Komponensek részletes leírása](#11-komponensek-részletes-leírása)
    - 11.1 [AppComponent (Gyökér)](#111-appcomponent-gyökér)
    - 11.2 [NavbarComponent](#112-navbarcomponent)
    - 11.3 [LoginComponent](#113-logincomponent)
    - 11.4 [RegisterComponent](#114-registercomponent)
    - 11.5 [ConfirmEmailComponent](#115-confirmemailcomponent)
    - 11.6 [ForgotpasswordComponent](#116-forgotpasswordcomponent)
    - 11.7 [ResetPasswordComponent](#117-resetpasswordcomponent)
    - 11.8 [VoterDashboardComponent](#118-voterdashboardcomponent)
    - 11.9 [AdminDashboardComponent](#119-admindashboardcomponent)
    - 11.10 [CreateMeetingComponent](#1110-createmeetingcomponent)
    - 11.11 [EditMeetingComponent](#1111-editmeetingcomponent)
    - 11.12 [EditUser](#1112-edituser)
    - 11.13 [SpeechRequestsComponent](#1113-speechrequestscomponent)
    - 11.14 [ProfileComponent](#1114-profilecomponent)
    - 11.15 [AboutComponent](#1115-aboutcomponent)
    - 11.16 [HelpComponent](#1116-helpcomponent)
    - 11.17 [NotificationsComponent](#1117-notificationscomponent)
12. [Authentikáció és jogosultságkezelés](#12-authentikáció-és-jogosultságkezelés)
13. [API végpontok összefoglalása](#13-api-végpontok-összefoglalása)
14. [Témakezelés](#14-témakezelés)
15. [Valós idejű adatfrissítés (Polling)](#15-valós-idejű-adatfrissítés-polling)
16. [Szavazati logika](#16-szavazati-logika)
17. [Ismert problémák és fejlesztési javaslatok](#17-ismert-problémák-és-fejlesztési-javaslatok)

---

## 1. Projektáttekintés

A **Társasház Szavazórendszer** egy webalapú szavazási platform, amelyet társasházi közgyűlések digitális lebonyolítására terveztek. A rendszer két fő szerepkört különböztet meg:

- **Tulajdonos (voter):** megtekintheti az aktív közgyűléseket, részt vehet rajtuk, szavazhat a határozatokra, és írásos észrevételt tehet napirendi pontokhoz.
- **Admin (közös képviselő):** létrehozhatja, szerkesztheti és törölheti a közgyűléseket, kezelheti a napirendi pontok státuszát, megtekintheti a szavazati eredményeket és a felszólalásokat, valamint kezelheti a regisztrált felhasználókat.

A rendszer Angular 21-es keretrendszerre épül, kizárólag **standalone komponens architektúrával**, és egy Laravel-alapú REST API backendhez kapcsolódik (`http://localhost:8000/api`).

---

## 2. Technológiai stack

| Kategória | Technológia | Verzió |
|---|---|---|
| Frontend keretrendszer | Angular | ^21.0.0 |
| Programozási nyelv | TypeScript | ~5.9.2 |
| UI keretrendszer | Bootstrap | ^5.3.8 |
| Ikonok | Bootstrap Icons (CDN) | 1.11.3 |
| Értesítési modál könyvtár | SweetAlert2 | ^11.26.19 |
| Reaktív programozás | RxJS | ~7.8.0 |
| Csomagkezelő | npm | 11.3.0 |
| Fejlesztői szerver | Angular DevKit / Vite | ^21.2.0 |
| Kódformázás | Prettier | (beépítve package.json-ba) |

---

## 3. Projektstruktúra

```
voter_frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # Gyökér komponens
│   │   ├── app.component.html        # Gyökér sablon (NavBar + RouterOutlet)
│   │   ├── app.config.ts             # Alkalmazás-konfiguráció (DI providers)
│   │   ├── app.routes.ts             # Útvonalak definíciója
│   │   ├── auth.interceptor.ts       # JWT token injektálása HTTP kérésekbe
│   │   │
│   │   ├── components/               # Minden UI komponens
│   │   │   ├── about/                # Rólunk oldal
│   │   │   ├── admin/
│   │   │   │   ├── admin-dashboard/  # Admin főoldal
│   │   │   │   ├── create-meeting/   # Közgyűlés létrehozása
│   │   │   │   ├── edit-meeting/     # Közgyűlés szerkesztése
│   │   │   │   └── edit-user/        # Felhasználók kezelése
│   │   │   ├── forgotpassword/       # Jelszóemlékeztető
│   │   │   │   └── resetpassword/    # Jelszó visszaállítása
│   │   │   ├── help/                 # Súgó oldal
│   │   │   ├── login/                # Bejelentkezési oldal
│   │   │   ├── navbar/               # Navigációs sáv
│   │   │   ├── notifications/        # Értesítések (placeholder)
│   │   │   ├── profile/              # Profil oldal
│   │   │   ├── register/             # Regisztrációs oldal
│   │   │   │   └── confirm-email/    # E-mail megerősítés
│   │   │   ├── speech-request/       # Felszólalások nézet (admin)
│   │   │   └── voter-dashboard/      # Szavazói főoldal
│   │   │
│   │   ├── guards/
│   │   │   ├── auth-guard.ts         # Bejelentkezettség ellenőrzés
│   │   │   └── admin-guard.ts        # Admin jogosultság ellenőrzés
│   │   │
│   │   ├── models/
│   │   │   └── meeting.model.ts      # TypeScript interfészek
│   │   │
│   │   ├── pipes/
│   │   │   └── meetingfilter-pipe.ts # Közgyűlés-szűrő pipe
│   │   │
│   │   └── services/
│   │       ├── api.service.ts        # REST API hívások
│   │       ├── auth.service.ts       # Autentikáció logika
│   │       ├── theme.service.ts      # Témaváltás kezelése
│   │       ├── user.service.ts       # Felhasználókezelés
│   │       └── voting.ts             # Szavazási állapot (BehaviorSubject)
│   │
│   ├── assets/
│   │   └── kepek/                    # Statikus képek (carousel, háttér)
│   ├── index.html                    # HTML belépési pont
│   ├── main.ts                       # Angular bootstrap
│   └── styles.css                    # Globális CSS / téma változók
│
├── angular.json                      # Angular CLI konfiguráció
├── package.json                      # NPM függőségek
├── proxy.conf.json                   # Fejlesztői proxy beállítások
└── tsconfig.json                     # TypeScript konfiguráció
```

---

## 4. Konfiguráció és indítás

### Fejlesztői indítás

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása (alapértelmezett: http://localhost:4200)
npm start
# vagy
ng serve
```

### Proxy konfiguráció

A `proxy.conf.json` fájl lehetővé teszi, hogy a fejlesztői szerveren futó Angular alkalmazás az `/api` végpontokra tett kéréseket automatikusan a Laravel backend felé (`http://localhost:8000`) továbbítsa:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": { "^/api": "" }
  }
}
```

> **Megjegyzés:** A proxy csak `ng serve --proxy-config proxy.conf.json` paranccsal aktiválódik. A jelenlegi kódban a service-ek közvetlenül `http://localhost:8000/api` URL-t használnak, ezért a proxy konfigurációja jelenleg nem érvényesül.

### Build

```bash
# Éles build
npm run build

# Fejlesztői watch mód
npm run watch
```

### Tesztek futtatása

```bash
npm test
```

### Alkalmazás-konfiguráció (`app.config.ts`)

Az alkalmazás gyökérszintű DI (Dependency Injection) konfigurációját ez a fájl tartalmazza:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

- **`provideZoneChangeDetection`**: optimalizált change detection (`eventCoalescing: true`).
- **`provideRouter(routes)`**: az alkalmazás útvonaltáblájának regisztrálása.
- **`provideHttpClient + withInterceptors`**: a globális HTTP kliens regisztrálása az `authInterceptor`-ral együtt, amely minden kéréshez hozzáadja a JWT tokent.

---

## 5. Útvonalkezelés (Routing)

**Fájl:** `src/app/app.routes.ts`

Az alkalmazás összes útvonala egy tömbben van definiálva. A route guardok (`canActivate`) döntik el, hogy az adott útvonal elérhető-e.

| Útvonal | Komponens | Guard(ok) | Leírás |
|---|---|---|---|
| `/` | – | – | Átirányít `/login`-ra |
| `/login` | `LoginComponent` | – | Bejelentkezési oldal |
| `/register` | `RegisterComponent` | – | Regisztrációs oldal |
| `/register/confirm/:token` | `ConfirmEmailComponent` | – | E-mail megerősítés tokennel |
| `/forgot-password` | `ForgotpasswordComponent` | – | Jelszóemlékeztető |
| `/reset-password` | `ResetPasswordComponent` | – | Jelszó visszaállítása |
| `/voter` | `VoterDashboardComponent` | `authGuard` | Tulajdonos főoldal |
| `/admin` | `AdminDashboardComponent` | `authGuard`, `adminGuard` | Admin főoldal |
| `/admin/create-meeting` | `CreateMeetingComponent` | `authGuard` | Közgyűlés létrehozása |
| `/admin/edit-meeting/:id` | `EditMeetingComponent` | `authGuard`, `adminGuard` | Közgyűlés szerkesztése |
| `/admin/speeches` | `SpeechRequestsComponent` | `authGuard`, `adminGuard` | Felszólalások nézet |
| `/admin/edit-users` | `EditUser` | `authGuard`, `adminGuard` | Felhasználók kezelése |
| `/about` | `AboutComponent` | – | Rólunk oldal |
| `/help` | `HelpComponent` | – | Súgó oldal |
| `/profile` | `ProfileComponent` | – | Profil oldal |

> **Megjegyzés:** Az `/admin/create-meeting` útvonalon csak `authGuard` van, de `adminGuard` nincs – ez potenciális biztonsági résnek tekinthető.

---

## 6. Adatmodellek

**Fájl:** `src/app/models/meeting.model.ts`

A fájl tartalmazza az összes TypeScript interfészt, amelyeket az alkalmazás az adatszerkezetek leírására használ.

### `User`

```typescript
interface User {
  id: number;
  name: string;
  ownership_ratio: number;  // Tulajdoni hányad (pl. 245 a 10000-ből)
  role_id: number;          // 1 = admin, egyéb = tulajdonos
  is_active: boolean;       // Fiók aktív-e
}
```

### `Resolution` (Határozat)

```typescript
interface Resolution {
  id: number;
  text: string;
  votes?: any[];          // Szavazatok tömbje
  results?: {
    yes: number;
    no: number;
    abstain: number;
  };
}
```

### `AgendaItem` (Napirendi pont)

```typescript
interface AgendaItem {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  resolutions: Resolution[];
}
```

### `Owner` és `Apartment` (Tulajdonos és Lakás)

Ezek az interfészek egy korábbi, lokális állapotkezelési megközelítés maradványai, jelenleg aktívan nem használtak a főbb komponensekben:

```typescript
interface Owner {
  id: string;
  name: string;
  share: number;
}

interface Apartment {
  id: string;
  address: string;
  floor?: string;
  flatNumber?: string;
  hrsz: string;
  totalShare: number;
  owners: Owner[];
}
```

### `Vote` (Szavazat – helyi modell)

```typescript
interface Vote {
  ownerId: string;
  ownerName: string;
  apartmentAddress: string;
  share: number;
  choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK';
}
```

### `AppState` (Alkalmazás állapot)

Szintén egy korábbi state-management kísérlet maradványa, a `VotingService`-szel együtt; aktívan nem használt:

```typescript
interface AppState {
  totalShareBase: number;
  presentShare: number;
  apartments: Apartment[];
  agendaItems: AgendaItem[];
  currentUser: Owner | null;
  currentApartment: Apartment | null;
}
```

---

## 7. Szolgáltatások (Services)

### 7.1 AuthService

**Fájl:** `src/app/services/auth.service.ts`  
**Scope:** `providedIn: 'root'`

Ez a szolgáltatás kezeli a felhasználói autentikáció teljes életciklusát: bejelentkezés, kijelentkezés, regisztráció, e-mail megerősítés és jelszóvisszaállítás.

**Tárolt adatok:**

| Tároló | Kulcs | Tartalom |
|---|---|---|
| `sessionStorage` | `current_voter_user` | Bejelentkezett felhasználó JSON-objektuma |
| `sessionStorage` | `access_token` | JWT bearer token |
| `localStorage` | `token` | JWT bearer token (az interceptor innen olvassa) |

> **Megjegyzés:** Az alkalmazásban inkonzisztencia van a token tárolási helye között. Az `AuthService` a `sessionStorage`-ba ír (`access_token` kulcs), az `ApiService` szintén `sessionStorage`-ból olvas, de a `LoginComponent` a `localStorage`-ba is elmenti (`access_token`), az `authInterceptor` pedig a `localStorage`-ból (`token` kulcs) olvassa. Ez duplikált tárolást okoz.

**Főbb metódusok:**

| Metódus | Paraméterek | Visszatérési érték | Leírás |
|---|---|---|---|
| `setUser(user)` | `User` | `void` | Eltárolja a felhasználó adatait `sessionStorage`-ban |
| `getCurrentUser()` | – | `User \| null` | Visszaadja a bejelentkezett felhasználót |
| `login(credentials)` | `{email, password}` | `Observable<any>` | POST `/api/login`, tokenát menti |
| `register(userData)` | `any` | `Observable<any>` | POST `/api/register` |
| `confirmEmail(token)` | `string` | `Observable<any>` | POST `/api/register/confirm` |
| `logout()` | – | `void` | Törli a session adatokat, visszaállítja a témát, átirányít `/login`-ra |
| `isLoggedIn()` | – | `boolean` | `true`, ha a user kulcs megvan `sessionStorage`-ban |
| `sendPasswordResetEmail(email)` | `string` | `Observable<any>` | POST `/api/forgot-password` |
| `resetPassword(password, token, email)` | `string, string, string` | `Observable<any>` | POST `/api/reset-password` |

**Függőségek:** `HttpClient`, `ThemeService`, `Router` (lazy Injector-on keresztül körkörös függőség elkerülése végett)

---

### 7.2 ApiService

**Fájl:** `src/app/services/api.service.ts`  
**Scope:** `providedIn: 'root'`  
**Alap URL:** `http://localhost:8000/api`

Ez a szolgáltatás felelős az összes REST API hívásért. Minden metódus manuálisan olvassa ki a tokent a `sessionStorage`-ból és adja hozzá a kérés fejlécéhez.

> **Megjegyzés:** Az `authInterceptor` automatikusan injektálja a tokent minden kérésbe, ezért a manuális token-kezelés az `ApiService`-ben redundáns. Ez duplikált fejléceket okoz.

**Metódusok teljes listája:**

| Metódus | HTTP | Végpont | Leírás |
|---|---|---|---|
| `getMeetings()` | GET | `/meetings` | Összes közgyűlés listája |
| `getMeeting(id)` | GET | `/meetings/:id` | Egy közgyűlés részletei |
| `createMeeting(data)` | POST | `/meetings` | Új közgyűlés létrehozása |
| `updateMeeting(id, data)` | PUT | `/meetings/:id` | Közgyűlés módosítása |
| `deleteMeeting(id)` | DELETE | `/meetings/:id` | Közgyűlés törlése |
| `toggleRepeated(meetingId)` | PUT | `/meetings/:id/toggle-repeated` | Megismételt státusz váltása |
| `attendMeeting(meetingId)` | POST | `/meetings/:id/attend` | Jelenlét regisztrálása |
| `updateAgendaStatus(id, status)` | PUT | `/agenda-items/:id` | Napirendi pont státuszának frissítése |
| `deleteAgendaItem(id)` | DELETE | `/agenda-items/:id` | Napirendi pont törlése |
| `getAgendaItems(meetingId)` | GET | `/agenda-items` | Napirendi pontok listája |
| `sendVote(resolutionId, vote)` | POST | `/votes` | Szavazat leadása |
| `requestToSpeak(agendaItemId, comment, username)` | POST | `/resolutions/` | Felszólalás / észrevétel küldése |
| `getUsers()` | GET | `/users` | Összes felhasználó listája |
| `updateUser(userId, data)` | PUT | `/users/:id` | Felhasználó adatainak módosítása |
| `toggleUserStatus(userId)` | PUT | `/users/:id/toggle-status` | Felhasználó aktiválása/tiltása |

---

### 7.3 UserService

**Fájl:** `src/app/services/user.service.ts`  
**Scope:** `providedIn: 'root'`  
**Alap URL:** `http://localhost:8000/api/users`

A bejelentkezett felhasználó adatait kezeli, valamint adminisztrátori felhasználókezelési funkciókat biztosít.

**Metódusok:**

| Metódus | Leírás |
|---|---|
| `getCurrentUser()` | `sessionStorage`-ból olvassa a felhasználót (`current_voter_user` kulcs) |
| `setUser(user)` | `localStorage`-ba menti a felhasználót (`current_voter_user` kulcs) |
| `getUsers()` | GET `/api/users` – összes felhasználó |
| `updateUser(user)` | PUT `/api/users/:id` – felhasználó adatainak frissítése |
| `deleteUser(id)` | POST `/api/users/:id` – törlés (hibás HTTP metódus, DELETE kellene) |
| `createUser(user)` | POST `/api/users/:user` – felhasználó létrehozása (hibásan implementált) |

> **Megjegyzés:** A `setUser` metódus `localStorage`-ba ír, míg a `getCurrentUser` `sessionStorage`-ból olvas – ez inkonzisztencia, amely hibás működést okozhat böngésző-újratöltés esetén.

---

### 7.4 VotingService

**Fájl:** `src/app/services/voting.ts`  
**Scope:** `providedIn: 'root'`

Reaktív állapotkezelést biztosít a közgyűlés állapotához egy `BehaviorSubject`-en keresztül. A `NavbarComponent` figyeli a `meetingState$` Observable-t.

**Fontosabb tagok:**

```typescript
private meetingState = new BehaviorSubject<any>(null);
meetingState$ = this.meetingState.asObservable();
```

> **Megjegyzés:** A `getMeetingDetails` és `submitVote` metódusok relatív URL-eket használnak (`/meetings/:id`, `/votes`) abszolút URL helyett, ami fejlesztői szerveren csak a proxy bekapcsolásakor működik helyesen. A tényleges szavazáshoz az `ApiService`-t használja a `VoterDashboardComponent`.

---

### 7.5 ThemeService

**Fájl:** `src/app/services/theme.service.ts`  
**Scope:** `providedIn: 'root'`

Az alkalmazás vizuális témáját kezeli Angular `signal`-ok és `effect` segítségével.

**Elérhető témák:**

| CSS osztály | Leírás |
|---|---|
| `light-theme` | Világos alaptéma (alapértelmezett) |
| `dark-theme` | Sötét téma |
| `blue-theme` | Kék téma |
| `contrast-theme` | Magas kontrasztú téma |
| `f1-theme` | F1 verseny-inspirált téma |

**Működési elv:**

1. Az aktuális téma neve egy Angular `signal`-ban van tárolva (`localStorage`-ból inicializálva).
2. Egy `effect` figyeli a signal változásait, és automatikusan:
   - beállítja a megfelelő CSS osztályt a `document.body`-n,
   - a Bootstrap sötét módját (`data-bs-theme`) is frissíti dark/contrast/f1 témáknál.
3. A `setTheme(newTheme)` metódus váltja a témát.
4. A `setDefaultTheme()` kijelentkezéskor állítja vissza a `light-theme`-re.

---

## 8. Route Guardok

### 8.1 authGuard

**Fájl:** `src/app/guards/auth-guard.ts`  
**Típus:** `CanActivateFn` (funkcionális guard)

Ellenőrzi, hogy a felhasználó be van-e jelentkezve az `AuthService.isLoggedIn()` metóduson keresztül. Ha nincs bejelentkezve, átirányít a `/login` oldalra.

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
```

**Ismertetés:** Az `isLoggedIn()` csupán a `sessionStorage`-ban lévő `current_voter_user` kulcs meglétét ellenőrzi – nem validálja a JWT token érvényességét a szerveren.

---

### 8.2 adminGuard

**Fájl:** `src/app/guards/admin-guard.ts`  
**Típus:** `CanActivateFn` (funkcionális guard)

Ellenőrzi, hogy a bejelentkezett felhasználó `role` mezője `"admin"` értékű-e. Ha nem, megtagadja a hozzáférést (de nem irányít át, csak `false`-t ad vissza).

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const user = userService.getCurrentUser();
  if (user && user.role === "admin") {
    return true;
  } else {
    return false;
  }
};
```

> **Megjegyzés:** Az `adminGuard` nem irányít át elutasítás esetén, csak megtagadja a navigációt. Felhasználói élmény szempontjából érdemes lenne a `/voter` oldalra vagy egy hibaoldalra irányítani.

---

## 9. HTTP Interceptor

**Fájl:** `src/app/auth.interceptor.ts`

Funkcionális `HttpInterceptorFn`, amely automatikusan hozzáadja a JWT Bearer tokent minden kimenő HTTP kérés fejlécéhez.

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
```

**Fontos:** Az interceptor a `localStorage`-ból olvassa a tokent a `'token'` kulcs alapján. A `LoginComponent` azonban a `'access_token'` kulcsra menti a tokent a `localStorage`-ba. Ezért az interceptor jelenlegi állapotban **nem működik** helyesen – mindig üres tokent talál, hacsak külön nem kerül mentésre a `'token'` kulcsra.

---

## 10. Pipe-ok

### 10.1 MeetingfilterPipe

**Fájl:** `src/app/pipes/meetingfilter-pipe.ts`  
**Típus:** standalone, `pure: false`

Dinamikusan szűri a közgyűlések listáját a `VoterDashboardComponent` szűrőűrlapjának értékei alapján.

**Paraméterek:**
- `meetings: any[]` – a szűrni kívánt közgyűlések tömbje
- `filters: any` – egy objektum, amelynek kulcsai a közgyűlés mezőnevei, értékei a keresési kifejezések

**Működési logika:**

A pipe minden közgyűlést az összes aktív szűrőfeltétel ellen ellenőriz (`Object.keys(filters).every(...)`):
- Ha a szűrőérték üres (`null`, `undefined`, `''`), az adott szűrőt figyelmen kívül hagyja.
- String mezők esetén case-insensitive részegyezést keres (`includes`).
- Szám mezők esetén string konvertálás után szintén részegyezést keres.

**Használat a templateben:**

```html
*ngFor="let meeting of meetings | meetingfilter: meetingFilterForm.value"
```

> **Megjegyzés:** A `pure: false` beállítás miatt a pipe minden change detection ciklusban újrafut, ami nagy listák esetén teljesítményproblémát okozhat.

---

## 11. Komponensek részletes leírása

### 11.1 AppComponent (Gyökér)

**Selector:** `app-root`  
**Fájlok:** `app.component.ts`, `app.component.html`, `app.component.css`

Az alkalmazás gyökerét képező komponens. Egyetlen feladata a `NavbarComponent` és a `RouterOutlet` megjelenítése. A `title` property értéke `'tarsashaz-szavazo'`.

```html
<!-- app.component.html -->
<app-navbar></app-navbar>
<router-outlet></router-outlet>
```

---

### 11.2 NavbarComponent

**Selector:** `app-navbar`  
**Fájlok:** `navbar.component.ts`, `navbar.component.html`, `navbar.component.css`

A globálisan megjelenő navigációs sáv. Figyeli az aktív útvonalat, és ez alapján tünteti fel a megfelelő menüpontokat.

**Fontosabb tulajdonságok:**

| Property | Típus | Leírás |
|---|---|---|
| `isAdminPage` | `boolean` | `true`, ha az aktuális URL tartalmazza `/admin`-t |
| `themeService` | `ThemeService` | Témaváltáshoz injektálva |

**Főbb funkciók:**
- Bejelentkezett felhasználó nevének megjelenítése (`userService.getCurrentUser()`).
- Szerepkör alapú menüpontok megjelenítése (admin vs. voter).
- Témaváltó gombok (Light, Dark, Blue, Contrast, F1).
- `logout()` metódus meghívja az `AuthService.logout()`-ot, majd navigál a `/` útvonalra.
- A `Router` NavigationEnd eseményeire feliratkozva frissíti az `isAdminPage` flaget.

**Függőségek:** `UserService`, `AuthService`, `VotingService`, `Router`, `ThemeService`

---

### 11.3 LoginComponent

**Selector:** `app-login`  
**Fájlok:** `login.ts`, `login.html`, `login.css`  
**Útvonal:** `/login`

A bejelentkezési felületet és logikát megvalósító komponens.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `loginForm` | `FormGroup` | Reaktív űrlap (`email`, `password` mezők) |
| `loading` | `boolean` | Töltési indikátor megjelenítéséhez |
| `errorMessage` | `string` | Szerveroldali hibaüzenet megjelenítéséhez |

**Validáció:**
- `email`: kötelező, érvényes e-mail formátum
- `password`: kötelező, minimum 6 karakter

**Működési folyamat:**

1. A konstruktor meghívja az `AuthService.logout()`-ot, hogy biztosítsa a tiszta állapotot (pl. visszanavigáláskor).
2. Az `onSubmit()` hívja az `AuthService.login()`-t.
3. Sikeres válasz esetén:
   - A tokent `localStorage`-ba menti (`access_token` kulcsra).
   - A felhasználó adatait a `UserService.setUser()`-rel elmenti.
   - Szerepkör alapján navigál: `admin` → `/admin`, egyéb → `/voter`.
4. Hiba esetén az `errorMessage` propertyba kerül a szerverüzenet.

**Függőségek:** `FormBuilder`, `AuthService`, `Router`, `UserService`

---

### 11.4 RegisterComponent

**Selector:** `app-register`  
**Fájlok:** `register.component.ts`, `register.component.html`, `register.component.css`  
**Útvonal:** `/register`

Új felhasználói fiók létrehozásának felülete.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `registerForm` | `FormGroup` | Reaktív űrlap |
| `loading` | `boolean` | Töltési indikátor |

**Validáció:**
- `name`: kötelező, minimum 3 karakter
- `email`: kötelező, érvényes formátum
- `password`: kötelező, minimum 6 karakter
- `password_confirmation`: kötelező; egyedi `passwordMatchValidator` ellenőrzi, hogy egyezik-e a `password` mezővel

**Sikeres regisztráció után:** SweetAlert2 modállal tájékoztatja a felhasználót, majd a `/login` oldalra navigál.

**Függőségek:** `FormBuilder`, `AuthService`, `Router`

---

### 11.5 ConfirmEmailComponent

**Selector:** `app-confirm-email`  
**Fájlok:** `confirm-email.component.ts`  
**Útvonal:** `/register/confirm/:token`

E-mail-alapú fiók-megerősítést valósít meg. A sablon közvetlenül a TypeScript fájlban van definiálva (nem külön HTML fájlban).

**Működési folyamat:**

1. Az `ngOnInit()` kinyeri a tokent az URL-ből (`route.snapshot.paramMap.get('token')`).
2. Ha nincs token, visszairányít a `/register` oldalra.
3. Ha van token, hívja az `AuthService.confirmEmail(token)`-t (POST `/api/register/confirm`).
4. Sikeres megerősítés után SweetAlert2 értesítés, majd navigálás `/login`-ra.
5. Hiba esetén (érvénytelen/lejárt link) szintén SweetAlert2, majd visszairányítás `/register`-re.

**UI:** Loading spinnerrel ellátott várakozási képernyő a megerősítés idején.

---

### 11.6 ForgotpasswordComponent

**Selector:** `app-forgotpassword`  
**Fájlok:** `forgotpassword.component.ts`, `.html`, `.css`  
**Útvonal:** `/forgot-password`

Elfelejtett jelszó esetén e-mail küldését teszi lehetővé.

**Validáció:** Csak az e-mail mező van, kötelező és érvényes formátum szükséges.

**Működés:**
- `onSubmit()` hívja az `AuthService.sendPasswordResetEmail(email)`-t (POST `/api/forgot-password`).
- Sikeres küldés után SweetAlert2 értesítés, az űrlap kiürül.
- Hiba esetén a szerver hibaüzenetét jeleníti meg.

---

### 11.7 ResetPasswordComponent

**Selector:** `app-reset-password`  
**Fájlok:** `resetpassword.component.ts`, `.html`  
**Útvonal:** `/reset-password?token=...&email=...`

Jelszóvisszaállítási folyamat második lépése.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `token` | `string` | URL query paraméterből kiolvasva |
| `email` | `string` | URL query paraméterből kiolvasva |
| `message` | `string` | Visszajelzési szöveg |
| `loading` | `boolean` | Töltési indikátor |

**Validáció:**
- `password`: kötelező, minimum 8 karakter
- `password_confirmation`: kötelező; `passwordMatchValidator` ellenőrzi az egyezőséget

**Sikeres visszaállítás után:** Szöveg üzenet, majd 3 másodperc után automatikus navigálás `/login`-ra.

---

### 11.8 VoterDashboardComponent

**Selector:** `app-voter-dashboard`  
**Fájlok:** `voter-dashboard.ts`, `voter-dashboard.html`, `voter-dashboard.css`  
**Útvonal:** `/voter`  
**Guard:** `authGuard`

A tulajdonosok (szavazók) főoldala. Ez az alkalmazás legkomplexebb komponense.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `currentUser` | `User \| null` | Bejelentkezett felhasználó |
| `meetings` | `any[]` | Összes közgyűlés részletes adatokkal |
| `loading` | `boolean` | Szavazás és csatlakozás közben aktív |
| `filterOn` | `boolean` | Szűrőpanel látható-e |
| `isParticipatingMap` | `Map<number, boolean>` | Melyik közgyűlésre regisztrált jelenlétként a felhasználó |
| `votedResolutionIds` | `Set<number>` | Azon határozatok ID-i, amelyekre már szavazott |
| `spokenAgendaItemIds` | `Set<number>` | Azon napirendi pontok, ahol felszólt |
| `meetingFilterForm` | `FormGroup` | Szűrőűrlap (title, meeting_date, location) |

**Valós idejű adatfrissítés (Polling):**

A `startPolling()` metódus 5 másodpercenként frissíti az adatokat RxJS operátorokkal:

```
interval(5000)
  -> startWith(0)           // Azonnal elindul
  -> switchMap(getMeetings) // Listázza a közgyűléseket
  -> tap(aktivitás ellenőrzés)
  -> catchError(403 kezelés -> inaktív felhasználó)
  -> map(adat normalizálás)
  -> switchMap(forkJoin(getMeeting(id) for each)) // Részletes adatok betöltése
  -> subscribe(meetings frissítés + refreshStates)
```

**Főbb metódusok:**

| Metódus | Leírás |
|---|---|
| `refreshStates()` | Frissíti az `isParticipatingMap`-et és `votedResolutionIds`-t az aktuális backend adatok alapján |
| `onVote(resolutionId, choice)` | Szavazatot küld az API felé; SweetAlert2 visszajelzéssel |
| `onSpeak(agendaItemId)` | SweetAlert2 textarea modált nyit; az elküldött szöveget az API-ra küldi |
| `onJoinMeeting(meetingId)` | Jelenlét regisztrálása az `attendMeeting` API végponton |
| `isMeetingClosed(meeting)` | `true`, ha minden napirendi pont `CLOSED` státuszú |
| `hasVotedOnAgendaItem(agendaItem)` | `true`, ha a felhasználó már szavazott bármely határozatra az adott napirendponton belül |
| `getStatusClass(status)` | Bootstrap CSS osztályt ad vissza a státusz badgéhez |
| `closefilter()` | Szűrőpanel ki/be kapcsolása |

**Felhasználói aktivitás kezelése:**
- Ha a polling `403 Forbidden` hibát kap, az `currentUser.is_active = false` értékre állítódik, és a UI letiltott állapotot mutat.
- Ha a polling sikerül, az `is_active` visszaáll `true`-ra.

**Függőségek:** `ApiService`, `UserService`, `AuthService`, `FormBuilder`

---

### 11.9 AdminDashboardComponent

**Selector:** `app-admin-dashboard`  
**Fájlok:** `admin-dashboard.ts`, `admin-dashboard.html`, `admin-dashboard.css`  
**Útvonal:** `/admin`  
**Guard:** `authGuard`, `adminGuard`

A közös képviselő (admin) főoldala. A szavazási folyamat irányítása, eredmények megtekintése és a közgyűlések kezelése innen történik.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `meetings` | `any[]` | Összes közgyűlés adatai (5 mp polling) |
| `totalOwnershipInHouse` | `number` | Fixen 10000 (a határozatképesség alap) |
| `today` | `Date` | Aktuális dátum megjelenítéséhez |
| `loading` | `boolean` | Töltési indikátor |

**Határozatképességi logika:**

A `isStartDisabled(meeting)` metódus dönti el, hogy az admin elindíthatja-e a szavazást:
- Ha a közgyűlés `is_repeated = true` (megismételt), a korlát feloldva → mindig engedélyezett.
- Egyébként a jelenlévők összesített `ownership_ratio`-ja > 5000 kell (az össztulajdon >50%-a).

**Szavazati eredmények számítása (`getVoteResults(item)`):**

A határozathoz kapcsolódó összes szavazatból (`item.resolutions[0].votes`) összesíti a `yes`, `no`, `abstain` összegeket, ahol az egyes szavazatok súlya a szavazó `ownership_ratio`-ja.

**Elfogadottság ellenőrzése (`isAccepted(item, meeting)`):**
- **Megismételt közgyűlésen:** egyszerű többség elegendő (`yes > no`).
- **Normál közgyűlésen:** abszolút többség szükséges (`yes > 5000`).

**Napirendi pontok kezelése:**

- `updateStatus(itemId, newStatus)` – ACTIVE vagy CLOSED státuszra állítja a napirendi pontot az API-n keresztül.
- `isMeetingLocked(agendas)` – `true`, ha bármely napirendi pont már nem `PENDING`.

**Felszólalások megjelenítése (`showSpeeches(meeting)`):**

SweetAlert2 modálban jeleníti meg az összes felszólalást (amelyek `user_id !== null` a `resolutions` táblában), formázott HTML-ben.

**Egyéb funkciók:**
- `onDeleteMeeting(meetingId)` – Megerősítő SweetAlert2 modál után törli a közgyűlést.
- `onToggleRepeated(meetingId)` – Megismételt közgyűlés státuszát váltja, és frissíti a lokális listát.
- `printReport()` – `window.print()` hívásával nyomtatható nézetet indít.
- `getSpeechCount(meeting)` – Felszólalások számát adja vissza egy közgyűléshez.

**Függőségek:** `ApiService`

---

### 11.10 CreateMeetingComponent

**Selector:** `app-create-meeting`  
**Fájlok:** `create-meeting.component.ts`, `.html`, `.css`  
**Útvonal:** `/admin/create-meeting`  
**Guard:** `authGuard`

Új közgyűlés és hozzá tartozó napirendi pontok létrehozásának felülete.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `meetingForm` | `FormGroup` | Fő reaktív űrlap |
| `agendaItems` | `FormArray` | Dinamikusan bővíthető napirendi pontok tömbje |
| `loading` | `boolean` | Mentési folyamat közben aktív |

**Napirendi pont struktúrája (egyetlen elem):**

```typescript
this.fb.group({
  title: ['', Validators.required],
  description: [''],
  resolution_text: ['', Validators.required],
  username: this.userService.getCurrentUser().name
})
```

**Dinamikus napirendi pontok:**
- `addAgendaItem()` – Új üres pontot ad a `FormArray`-hez, SweetAlert2 toast visszajelzéssel.
- `removeAgendaItem(index)` – Töröl egy pontot (minimum 1 maradnia kell).

**Mentési folyamat (`onSubmit`):**
1. Érvénytelen form esetén jelöli az összes mezőt és SweetAlert2 hibát jelez.
2. A dátum értékét ISO 8601 formátumra konvertálja (`new Date(rawDate).toISOString()`).
3. Az `ApiService.createMeeting(formData)` hívása után sikeres mentésnél visszairányít az `/admin` oldalra.

**Függőségek:** `FormBuilder`, `ApiService`, `Router`, `UserService`

---

### 11.11 EditMeetingComponent

**Selector:** `app-edit-meeting`  
**Fájlok:** `edit-meeting.component.ts`, `.html`  
**Útvonal:** `/admin/edit-meeting/:id`  
**Guard:** `authGuard`, `adminGuard`

Meglévő közgyűlés alapadatainak (cím, dátum, helyszín) szerkesztése.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `editForm` | `FormGroup` | Reaktív szerkesztési űrlap |
| `meetingId` | `number` | Az URL-ből kiolvasott ID |
| `loading` | `boolean` | Betöltési és mentési indikátor |

**Működés:**
1. `ngOnInit()` kinyeri az ID-t az URL-ből és meghívja a `loadMeetingData()`-t.
2. `loadMeetingData()` betölti az adatokat az API-ból és a dátumot `YYYY-MM-DDTHH:mm` formátumra hozza (datetime-local input kompatibilitáshoz).
3. `onSubmit()` csak akkor küld, ha az űrlap érvényes; siker után visszairányít `/admin`-ra.

**Függőségek:** `ActivatedRoute`, `ApiService`, `FormBuilder`, `Router`

---

### 11.12 EditUser

**Selector:** `app-edit-user`  
**Fájlok:** `edit-user.ts`, `edit-user.html`, `edit-user.css`  
**Útvonal:** `/admin/edit-users`  
**Guard:** `authGuard`, `adminGuard`

Felhasználók tulajdoni hányadának és szerepkörének szerkesztése, illetve fiók aktiválása/tiltása.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `users` | `any[]` | Összes felhasználó listája |
| `totalRatio` | `number` | Az összes felhasználó `ownership_ratio`-jának összege |
| `loading` | `boolean` | Betöltési indikátor |

**Főbb metódusok:**

| Metódus | Leírás |
|---|---|
| `loadUsers()` | Betölti a felhasználólistát az API-ból (`res.data`) |
| `calculateTotal()` | Újraszámolja az összes tulajdoni hányad összegét |
| `saveUser(user)` | Elmenti az `ownership_ratio` és `role_id` módosításokat (SweetAlert2 toast) |
| `toggleUserStatus(user)` | Váltja a felhasználó `is_active` státuszát; a `UserService.updateUser()`-t hívja |

**Függőségek:** `ApiService`, `UserService`

---

### 11.13 SpeechRequestsComponent

**Selector:** `app-speech-requests`  
**Fájlok:** `speech-request.component.ts`, `.html`, `.css`  
**Útvonal:** `/admin/speeches`  
**Guard:** `authGuard`, `adminGuard`

Valós idejű nézet az admin számára a beérkező felszólalási kérelmek figyeléséhez.

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `meetingId` | `number` | Fixen `1` – jelenleg hardkódolt |
| `agendaItems` | `any[]` | Csak azok a napirendi pontok, ahol van felszólaló |

**Polling:**
- 4 másodpercenként lekérdezi az 1-es ID-jű meeting adatait.
- Csak azokat a napirendi pontokat tárolja, ahol `item.speakers && item.speakers.length > 0`.

> **Megjegyzés:** A `meetingId` hardkódolt értéke (`1`) erős korlát – egy valós rendszerben ez dinamikus paraméter kellene legyen.

**Függőségek:** `ApiService`

---

### 11.14 ProfileComponent

**Selector:** `app-profile`  
**Fájlok:** `profile.ts`, `profile.html`, `profile.css`  
**Útvonal:** `/profile`

A bejelentkezett felhasználó adatait jeleníti meg (csak olvasható nézet).

**Állapotok:**

| Property | Típus | Leírás |
|---|---|---|
| `currentOwner` | `any` | A `UserService.getCurrentUser()` által visszaadott felhasználó objektum |

**Függőségek:** `UserService`

---

### 11.15 AboutComponent

**Selector:** `app-about`  
**Fájlok:** `about.ts`, `about.html`, `about.css`  
**Útvonal:** `/about`

Statikus „Rólunk" oldal. Nem tartalmaz logikát, csak HTML tartalmat. Carousel-t tartalmaz a `src/assets/kepek/` mappából betöltött képekkel.

---

### 11.16 HelpComponent

**Selector:** `app-help`  
**Fájlok:** `help.ts`, `help.html`, `help.css`  
**Útvonal:** `/help`

Statikus súgó/útmutató oldal. Nem tartalmaz logikát.

---

### 11.17 NotificationsComponent

**Selector:** `app-notifications`  
**Fájlok:** `notifications.ts`, `notifications.html` (üres), `notifications.css` (üres)  
**Útvonal:** nincs hozzárendelve

Jelenleg teljesen üres, placeholder komponens. Értesítési funkció tervezett, de még nincs implementálva.

---

## 12. Authentikáció és jogosultságkezelés

### Bejelentkezési folyamat teljes képe

```
Felhasználó kitölti az űrlapot
        │
        ▼
LoginComponent.onSubmit()
        │
        ▼
AuthService.login() → POST /api/login
        │
        ▼ (sikeres válasz: {token, user})
┌───────────────────────────────────────┐
│ sessionStorage.setItem('access_token')│
│ sessionStorage.setItem('current_voter_user') │
│ localStorage.setItem('access_token')  │  ← LoginComponent
│ UserService.setUser() →               │
│   localStorage.setItem('current_voter_user') │
└───────────────────────────────────────┘
        │
        ▼
role === 'admin' → /admin
role !== 'admin' → /voter
```

### Jogosultság-ellenőrzési rétegek

1. **Frontend route guard (`authGuard`):** sessionStorage kulcs meglétét ellenőrzi.
2. **Frontend route guard (`adminGuard`):** `user.role === 'admin'` ellenőrzés.
3. **HTTP Bearer token (`authInterceptor`):** minden API kéréshez csatolja a tokent (bár jelenleg hibás kulcsot keres).
4. **Szerveroldali validáció:** a Laravel backend maga is ellenőrzi a JWT tokent és a szerepköröket.

### Kijelentkezési folyamat

```
AuthService.logout()
    │
    ├── sessionStorage.removeItem('current_voter_user')
    ├── sessionStorage.removeItem('access_token')
    ├── ThemeService.setDefaultTheme() → light-theme
    └── Router.navigate(['/login'])
```

> **Megjegyzés:** A `localStorage`-ban tárolt `access_token` és `current_voter_user` értékek a kijelentkezéskor **nem törlődnek**, ami biztonsági szempontból problémás lehet.

---

## 13. API végpontok összefoglalása

Az alkalmazás a következő REST API végpontokat használja (alap URL: `http://localhost:8000/api`):

### Autentikáció

| Metódus | Végpont | Leírás |
|---|---|---|
| POST | `/login` | Bejelentkezés (visszaad: `token`, `user`) |
| POST | `/register` | Regisztráció |
| POST | `/register/confirm` | E-mail megerősítés tokennel |
| POST | `/forgot-password` | Jelszóemlékeztető e-mail küldése |
| POST | `/reset-password` | Jelszó visszaállítása |

### Közgyűlések

| Metódus | Végpont | Leírás |
|---|---|---|
| GET | `/meetings` | Összes közgyűlés |
| GET | `/meetings/:id` | Egy közgyűlés részletei |
| POST | `/meetings` | Új közgyűlés létrehozása |
| PUT | `/meetings/:id` | Közgyűlés módosítása |
| DELETE | `/meetings/:id` | Közgyűlés törlése |
| POST | `/meetings/:id/attend` | Jelenlét regisztrálása |
| PUT | `/meetings/:id/toggle-repeated` | Megismételt státusz váltása |

### Napirendi pontok

| Metódus | Végpont | Leírás |
|---|---|---|
| GET | `/agenda-items` | Napirendi pontok listája |
| PUT | `/agenda-items/:id` | Státusz frissítése (ACTIVE/CLOSED) |
| DELETE | `/agenda-items/:id` | Napirendi pont törlése |

### Szavazás

| Metódus | Végpont | Leírás |
|---|---|---|
| POST | `/votes` | Szavazat leadása (`resolution_id`, `vote`) |

### Határozatok / Felszólalások

| Metódus | Végpont | Leírás |
|---|---|---|
| POST | `/resolutions/` | Felszólalás / észrevétel küldése |

### Felhasználók

| Metódus | Végpont | Leírás |
|---|---|---|
| GET | `/users` | Összes felhasználó |
| PUT | `/users/:id` | Felhasználó módosítása |
| PUT | `/users/:id/toggle-status` | Aktiválás/tiltás |

---

## 14. Témakezelés

A `ThemeService` Angular `signal` és `effect` primitíveket használva reaktív témakezelést valósít meg.

**Téma váltásának folyamata:**

```
ThemeService.setTheme('dark-theme')
        │
        ▼
signal értéke megváltozik
        │
        ▼
effect() automatikusan lefut
        │
        ├── sessionStorage.setItem('theme', 'dark-theme')
        ├── document.body.classList.remove(...minden téma)
        ├── document.body.classList.add('dark-theme')
        └── document.documentElement.setAttribute('data-bs-theme', 'dark')
```

**Globális CSS változók** (`styles.css`) az egyes témákhoz eltérő CSS custom property értékeket definiálnak (pl. `--primary-color`, `--background-color`), amelyeket a komponens stíluslapok `var()` függvénnyel használnak.

**F1 téma különlegessége:** Versenyautó-pálya inspirált vizuális megjelenés, saját háttérképpel (`f1-tema.jpg`).

---

## 15. Valós idejű adatfrissítés (Polling)

Az alkalmazás két komponensben is alkalmaz intervallum-alapú pollingot a szerver adatainak frissítésére, WebSocket helyett:

### VoterDashboardComponent polling

- **Intervallum:** 5 másodperc
- **Scope:** Összes közgyűlés, majd minden egyes közgyűlés részletei (`forkJoin`)
- **Mellékhatás:** 403-as hiba esetén felhasználói inaktivitás detektálás

### AdminDashboardComponent polling

- **Intervallum:** 5 másodperc
- **Scope:** Összes közgyűlés listája

### SpeechRequestsComponent polling

- **Intervallum:** 4 másodperc
- **Scope:** 1 db közgyűlés adatai

### Életciklus kezelés

Minden polling komponens az `OnDestroy` interfészt implementálja, és az `ngOnDestroy()`-ban leiratkozik:

```typescript
ngOnDestroy(): void {
  this.pollingSub?.unsubscribe();
}
```

---

## 16. Szavazati logika

### Szavazati folyamat

1. A tulajdonos csatlakozik a közgyűléshez (`onJoinMeeting`).
2. Az admin aktiválja a napirendi pontot (`ACTIVE` státusz).
3. A tulajdonos szavaz az aktív napirendi ponthoz tartozó határozatra (`onVote`).
4. Az API rögzíti a szavazatot a felhasználó `ownership_ratio`-jával együtt.
5. Az admin bezárja a szavazást (`CLOSED` státusz).

### Szavazati súlyok

Minden szavazat értéke a szavazó **tulajdoni hányada** (0–10000 közötti érték, ahol az egész ház összesen 10000). Ez garantálja, hogy a nagyobb tulajdonnal bírók szavazata arányosan többet nyomjon.

### Határozatképesség

- **Normál közgyűlés:** jelenlévők összesített tulajdoni hányada > 5000/10000 szükséges a szavazás megkezdéséhez.
- **Megismételt közgyűlés (`is_repeated = true`):** nincs határozatképességi korlát – a jelenlévők bármilyen arány mellett szavazhatnak.

### Határozat elfogadása

- **Normál:** `yes > 5000` (az egész ház több mint felének igenje szükséges – abszolút többség).
- **Megismételt:** `yes > no` (egyszerű relatív többség a leadott szavazatok között).

---

## 17. Ismert problémák és fejlesztési javaslatok

### Biztonsági problémák

| # | Probléma | Javaslat |
|---|---|---|
| 1 | Az `authInterceptor` a `localStorage`-ból olvassa a `'token'` kulcsot, de a token mindig `'access_token'` kulcsra kerül mentésre | Egységesíteni kell a kulcsnevet; preferált: `'access_token'` |
| 2 | Kijelentkezéskor a `localStorage`-ban maradnak az autentikációs adatok | `logout()`-ban törölni kell a `localStorage`-t is |
| 3 | A `UserService.setUser()` `localStorage`-ba ír, de `getCurrentUser()` `sessionStorage`-ból olvas | Egységes tárolási helyet kell választani |
| 4 | Az `/admin/create-meeting` útvonalon hiányzik az `adminGuard` | Hozzáadni az `adminGuard`-ot |
| 5 | Az `adminGuard` nem irányít át megtagadáskor | Hozzáadni `router.navigate(['/voter'])` vagy `['/']` hívást |

### Architekturális problémák

| # | Probléma | Javaslat |
|---|---|---|
| 6 | Az `ApiService` metódusai manuálisan kezelik a tokent, holott az interceptor ezt elvégzi | Eltávolítani a manuális header-kezelést az `ApiService`-ből |
| 7 | A `SpeechRequestsComponent` hardkódolt `meetingId = 1` értéket használ | Route paramétert vagy state managementet alkalmazni |
| 8 | A `UserService.deleteUser()` POST metódust küld DELETE helyett | Kijavítani `http.delete()`-re |
| 9 | A `VotingService` relatív URL-eket (`/meetings/:id`) használ | Abszolút URL-ekre cserélni |
| 10 | Az `AppState`, `Owner`, `Apartment` interfészek és a `VotingService.meetingState$` nincsenek aktívan használva | Vagy teljes körű state managementre integrálni, vagy eltávolítani |

### Teljesítménybeli problémák

| # | Probléma | Javaslat |
|---|---|---|
| 11 | A `MeetingfilterPipe` `pure: false` beállítással fut – minden change detection ciklusban lefut | `pure: true`-ra átírni és a szűrést komponens szinten triggerelni |
| 12 | A VoterDashboard egyszerre minden meeting részletét lekéri `forkJoin`-nal – sok meeting esetén sok párhuzamos kérés | Lapozást (pagination) vagy virtuális scrollt implementálni |
| 13 | Polling helyett WebSocket / Server-Sent Events hatékonyabb lenne valós idejű frissítéshez | Laravel Echo + Pusher/WebSocket integrálása hosszú távon |

### UI/UX javaslatok

| # | Probléma | Javaslat |
|---|---|---|
| 14 | A `NotificationsComponent` teljesen üres | Értesítési rendszer implementálása (pl. szavazás megnyílt) |
| 15 | A `ProfileComponent` csak olvasható | Profil szerkesztési lehetőség hozzáadása (pl. jelszócsere) |
| 16 | Nincs 404-es hibaoldal definiálva | `**` wildcard route hozzáadása egy `NotFoundComponent`-tel |

---

*Dokumentáció vége*
