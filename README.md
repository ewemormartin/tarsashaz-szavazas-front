# TarsashazSzavazo

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



Mentsd el ezt a fájlt **FEJLESZTESI_DOKUMENTACIO.md** néven. Ez a dokumentum kifejezetten a technikai megvalósításra, a komponensek belső logikájára és a fejlesztői döntésekre fókuszál.

---

# Fejlesztési Dokumentáció - Társasházi Szavazórendszer

## 1. Rendszerarchitektúra összefoglaló
A szoftver egy modern **Full-Stack** alkalmazás, amely szétválasztott kliens-szerver architektúrát használ.
- **Backend:** Laravel 11 alapú RESTful API, amely az üzleti logikáért, az adattárolásért és a biztonságért felel.
- **Frontend:** Angular 18 alapú Standalone architektúra, amely reaktív felhasználói élményt nyújt.
- **Kommunikáció:** JSON formátumú adatcsere HTTP protokollon keresztül, Bearer Token (Sanctum) hitelesítéssel.

---

## 2. Frontend Komponensek (Angular)

### 2.1. Login (Bejelentkezés)
- **Fájl:** `login.component.ts`
- **Miért:** Ez a rendszer belépési pontja. Itt dől el a felhasználó szerepköre.
- **Hogyan:** `ReactiveFormsModule`-t használunk a bemeneti adatok validálására. A sikeres bejelentkezés után a válaszban érkező JWT tokent és a felhasználói adatokat az `AuthService` segítségével tároljuk.
- **Technikai részlet:** A háttérkép homályosítása CSS `::before` pseudo-elementtel készült, hogy a `filter: blur()` ne érintse az űrlapot, így az éles és olvasható marad.

### 2.2. AdminDashboard (Vezérlőpult)
- **Fájl:** `admin-dashboard.component.ts`
- **Miért:** Ez a közös képviselő központi munkafelülete.
- **Hogyan:** 
    - **Polling (Lekérdezés):** Az `interval(5000)` és `switchMap` operátorok segítségével 5 másodpercenként frissítjük az adatokat. Ez biztosítja a "valós idejű" élményt (pl. látni, ahogy érkeznek a szavazatok).
    - **Összesítés:** A `calculateAttendance()` metódus a JavaScript `reduce()` függvényét használja a jelenlévők tulajdoni hányadának összegzésére.
- **Funkció:** Itt történik a napirendi pontok állapotának (PENDING -> ACTIVE -> CLOSED) kezelése.

### 2.3. VoterDashboard (Szavazófelület)
- **Fájl:** `voter-dashboard.component.ts`
- **Miért:** A tulajdonosok itt gyakorolják szavazati jogukat.
- **Hogyan:** 
    - **Súlyozott szavazás:** A leadott voks nem 1 egységet ér, hanem a felhasználó `ownership_ratio` értékét képviseli a backend oldali összesítésnél.
    - **Állapotmegőrzés:** A `votedResolutionIds` (Set típus) tárolja a már megszavazott pontokat, így a gombok azonnal eltűnnek a voks leadása után, megakadályozva a többszörös szavazást.
- **UX:** SweetAlert2-t használunk a visszajelzésekhez, ami a választott opciótól függően (Igen/Nem/Tartózkodás) különböző ikonokat és színeket jelenít meg.

### 2.4. CreateMeeting (Közgyűlés létrehozása)
- **Fájl:** `create-meeting.component.ts`
- **Miért:** Rugalmas adatfelvételt tesz lehetővé.
- **Hogyan:** Az Angular `FormArray` technológiáját használja. Ez lehetővé teszi, hogy az admin dinamikusan adjon hozzá tetszőleges számú napirendi pontot és határozati javaslatot egyetlen űrlapon belül.

### 2.5. EditUser (Felhasználókezelés)
- **Fájl:** `edit-user.component.ts`
- **Miért:** A tulajdoni hányadok (th.) pontos beállítása elengedhetetlen a törvényes működéshez.
- **Hogyan:** Kétirányú adatfelvételt (`[(ngModel)]`) alkalmazunk. Minden módosításkor lefut a `calculateTotal()` függvény, ami figyelmezteti az admint, ha a hányadok összege eltér a 10000-től (100%).

### 2.6. Navbar (Navigációs sáv)
- **Fájl:** `navbar.component.ts`
- **Miért:** Egységes navigáció és kijelentkezés kezelése.
- **Hogyan:** Figyeli a Router eseményeit (`NavigationEnd`). Csak bejelentkezett állapotban látható, és a `role_id` alapján dinamikusan szűri, hogy az "Admin" vagy a "Lakó" menüpontok jelenjenek meg.

---

## 3. Frontend Szolgáltatások és Biztonság

### 3.1. AuthService
- Kezeli a `localStorage`-ba történő mentést.
- Felelős a token alapú munkamenet ellenőrzéséért (`isLoggedIn()`).

### 3.2. AuthInterceptor
- **Miért:** Hogy ne kelljen minden egyes API hívásnál kézzel hozzáadni a tokent.
- **Hogyan:** Minden kimenő HTTP kérést elfog, és automatikusan belehelyezi az `Authorization: Bearer <token>` fejlécet.

### 3.3. Guards (Útvonalvédelem)
- **AuthGuard:** Megakadályozza a védett oldalak elérését bejelentkezés nélkül.
- **AdminGuard:** Biztosítja, hogy a lakók ne tudjanak belépni az adminisztrációs felületekre (pl. `/admin`).
