# Társasházi Szavazási Rendszer
## Fejlesztői és Felhasználói Dokumentáció

**Vizsgaremek | 2025–2026**

| | |
|---|---|
| **Backend** | PHP 8.2 · Laravel 12 · Laravel Sanctum · MySQL |
| **Frontend** | Angular 21 · Bootstrap 5.3 · TypeScript · SweetAlert2 |
| **Eszközök** | Postman · DBeaver · Visual Studio Code · Git |

---

## Tartalomjegyzék

1. [Bevezetés](#1-bevezetés)
2. [Fejlesztői dokumentáció – Backend](#2-fejlesztői-dokumentáció--backend)
   - 2.1 [Fejlesztéshez használt eszközök és technológiák](#21-fejlesztéshez-használt-eszközök-és-technológiák)
   - 2.2 [Adatbázis felépítés](#22-adatbázis-felépítés)
   - 2.3 [Mappa struktúra](#23-mappa-struktúra)
   - 2.4 [Környezeti változók (.env)](#24-környezeti-változók-env)
   - 2.5 [API végpontok](#25-api-végpontok)
   - 2.6 [Kontrollerek és szervizek](#26-kontrollerek-és-szervizek)
   - 2.7 [Autentikáció – Laravel Sanctum](#27-autentikáció--laravel-sanctum)
   - 2.8 [Továbbfejlesztési lehetőségek](#28-továbbfejlesztési-lehetőségek)
3. [Fejlesztői dokumentáció – Frontend](#3-fejlesztői-dokumentáció--frontend)
   - 3.1 [Mappa struktúra](#31-mappa-struktúra)
   - 3.2 [Fejlesztéshez használt eszközök és technológiák](#32-fejlesztéshez-használt-eszközök-és-technológiák)
   - 3.3 [Komponensek](#33-komponensek)
   - 3.4 [Szervizek](#34-szervizek)
   - 3.5 [Útvonalak és route-védők](#35-útvonalak-és-route-védők)
   - 3.6 [Adatmodellek (TypeScript interfészek)](#36-adatmodellek-typescript-interfészek)
   - 3.7 [Továbbfejlesztési lehetőségek](#37-továbbfejlesztési-lehetőségek)
4. [Felhasználói kézikönyv](#4-felhasználói-kézikönyv)
5. [Összefoglalás](#5-összefoglalás)

---

## 1. Bevezetés

A következő dokumentáció egy társasházak számára készített digitális szavazási és közgyűlés-kezelő rendszert, valamint annak tervezését és megvalósítását mutatja be. A fejlesztés célja egy korszerű, webalapú platform létrehozása volt, amellyel a társasházi közgyűlések hatékonyabban szervezhetők, a szavazás átláthatóan és dokumentáltan zajlik, megkönnyítve a közös képviselők és a tulajdonosok mindennapi munkáját.

A rendszer lehetővé teszi közgyűlések létrehozását és kezelését, napirendi pontok felvételét és státuszkövetését, határozatok rögzítését, valamint a tulajdonosi szavazás elektronikus lebonyolítását. Az alkalmazás két jogosultsági szintet különböztet meg: **Admin** (közös képviselő) és **Tulajdonos** (szavazó felhasználó).

> **Technikai összefoglaló:** A backend Laravel 12 / PHP 8.2 alapon REST API-t biztosít MySQL adatbázissal, Laravel Sanctum token-alapú hitelesítéssel. A frontend Angular 21 keretrendszerben készült, Bootstrap 5 stílusozással, valós idejű adatfrissítéssel (polling).

---

## 2. Fejlesztői dokumentáció – Backend

### 2.1 Fejlesztéshez használt eszközök és technológiák

| Eszköz / Technológia | Verzió | Felhasználás |
|---|---|---|
| PHP | 8.2+ | Szerveroldali programozási nyelv |
| Laravel | 12.x | PHP keretrendszer – routing, ORM, middleware, mail, queue |
| Laravel Sanctum | 4.x | Token-alapú API hitelesítés |
| MySQL | 8.0+ | Relációs adatbázis-kezelő rendszer |
| DBeaver | 25.x | Adatbázis-kezelő GUI |
| Postman | – | API végpontok tesztelése |
| Visual Studio Code | – | Fejlesztői szövegszerkesztő |
| Git | – | Verziókezelő rendszer |

---

### 2.2 Adatbázis felépítés

Az adatbázis MySQL 8.0 alapon fut, a táblák és kapcsolataik Laravel migrációkon keresztül kerülnek létrehozásra. Az adatbázis hét fő táblából áll.

#### `users` – Felhasználók

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `name` | string | Felhasználó teljes neve |
| `email` | string (unique) | E-mail cím, belépéshez |
| `password` | string (hash) | Bcrypt-tel titkosított jelszó |
| `ownership_ratio` | decimal(5,2) | Tulajdoni hányad százalékban (pl. 12.50) |
| `is_active` | boolean | Fiók aktív-e (false = letiltott / elköltözött) |
| `role_id` | bigint (FK) | Kapcsolat a `roles` táblával |
| `email_verified_at` | timestamp | E-mail megerősítés időpontja |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

#### `roles` – Jogkörök

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `name` | string (unique) | Jogkör neve (pl. `admin`, `owner`) |

#### `meetings` – Közgyűlések

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `title` | string | Közgyűlés megnevezése |
| `meeting_date` | datetime | Közgyűlés dátuma és időpontja |
| `location` | string | Helyszín |
| `is_repeated` | boolean | Megismételt közgyűlés-e (határozatképtelenség miatt) |
| `created_by` | bigint (FK) | Létrehozó felhasználó (`users.id`) |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

#### `agenda_items` – Napirendi pontok

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `title` | string | Napirendi pont címe |
| `description` | text (nullable) | Részletes leírás |
| `status` | enum | Állapot: `PENDING` / `ACTIVE` / `CLOSED` |
| `meeting_id` | bigint (FK) | Kapcsolat a `meetings` táblával (cascade delete) |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

#### `resolutions` – Határozatok / Szólásigénylések

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `text` | text | Határozat szövege |
| `requires_unanimous` | boolean | Egyhangúságot igényel-e (38. § (3)) |
| `agenda_item_id` | bigint (FK) | Kapcsolat az `agenda_items` táblával (cascade delete) |
| `user_id` | bigint (FK, nullable) | Kapcsolat a `users` táblával |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

#### `votes` – Szavazatok

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `vote` | enum | Szavazat értéke: `yes` / `no` / `abstain` |
| `user_id` | bigint (FK) | Szavazó felhasználó (cascade delete) |
| `resolution_id` | bigint (FK) | Kapcsolt határozat (cascade delete) |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

> **Egyedi megszorítás:** A `votes` táblában a `(user_id, resolution_id)` párra UNIQUE kényszer vonatkozik, így egy felhasználó ugyanarra a határozatra csak egyszer szavazhat.

#### `meeting_user` – Részvételi kapcsolótábla

| Oszlop | Típus | Leírás |
|---|---|---|
| `id` | bigint (PK) | Egyedi azonosító |
| `meeting_id` | bigint (FK) | Kapcsolat a `meetings` táblával |
| `user_id` | bigint (FK) | Kapcsolat a `users` táblával |
| `created_at / updated_at` | timestamp | Automatikus időbélyegek |

Ez a tábla rögzíti, hogy melyik felhasználó mely közgyűlésen jelent meg. A jelenlévők tulajdoni hányadát a rendszer összesíti a határozatképesség megállapításához (>50% szükséges a rendes közgyűléshez).

---

### 2.3 Mappa struktúra

```
tarsashaz-szavazas-back/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php            (bejelentkezés, regisztráció)
│   │   │   └── api/
│   │   │       ├── AgendaItemController.php
│   │   │       ├── MeetingController.php
│   │   │       ├── ResolutionController.php
│   │   │       ├── UserController.php
│   │   │       └── VoteController.php
│   │   ├── Middleware/
│   │   │   └── AdminMiddleware.php
│   │   ├── Requests/                         (validáció – FormRequest osztályok)
│   │   │   ├── LoginRequest.php
│   │   │   ├── MeetingRequest.php
│   │   │   ├── RegisterRequest.php
│   │   │   └── UpdateMeetingRequest.php
│   │   └── Resources/                        (API erőforrás transzformátorok)
│   │       ├── AgendaItemResource.php
│   │       ├── MeetingResource.php
│   │       ├── ResolutionResource.php
│   │       ├── UserResource.php
│   │       └── VoteResource.php
│   ├── Models/
│   │   ├── AgendaItem.php
│   │   ├── Meeting.php
│   │   ├── Resolution.php
│   │   ├── Role.php
│   │   ├── User.php
│   │   └── Vote.php
│   ├── Services/
│   │   ├── AbilityService.php
│   │   ├── AgendaItemService.php
│   │   ├── MeetingReportService.php
│   │   ├── MeetingService.php
│   │   ├── ResolutionService.php
│   │   ├── UserService.php
│   │   └── VoteService.php
│   ├── Policies/                             (jogosultság-ellenőrzők)
│   │   ├── AgendaItemPolicy.php
│   │   ├── MeetingPolicy.php
│   │   ├── ResolutionPolicy.php
│   │   ├── UserPolicy.php
│   │   └── VotePolicy.php
│   ├── Traits/
│   │   ├── ApiResponse.php
│   │   └── HasRole.php
│   └── Mail/
│       ├── RegisterMail.php
│       └── PasswordResetMail.php
├── database/
│   ├── migrations/                           (séma definíciók)
│   └── seeders/                              (mintaadatok)
├── routes/
│   └── api.php                               (összes API végpont)
└── .env                                      (környezeti változók)
```

---

### 2.4 Környezeti változók (.env)

Az alkalmazás konfigurációja a `.env` fájlból olvasódik be. A fájl sohasem kerül verziókezelésbe (`.gitignore`).

| Változó | Leírás |
|---|---|
| `APP_KEY` | Az alkalmazás titkosítási kulcsa (`php artisan key:generate`) |
| `DB_CONNECTION` | Adatbázis driver (`mysql`) |
| `DB_HOST` | Adatbázis szerver host (pl. `127.0.0.1`) |
| `DB_DATABASE` | Adatbázis neve |
| `DB_USERNAME` / `DB_PASSWORD` | Adatbázis hitelesítési adatok |
| `MAIL_MAILER` | E-mail küldő driver (`smtp` / `log`) |
| `MAIL_HOST` / `MAIL_PORT` | SMTP szerver adatok |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP hitelesítési adatok |
| `MAIL_FROM_ADDRESS` | Feladó e-mail cím |
| `FRONTEND_URL` | Angular app URL-je (pl. `http://localhost:4200`) |
| `SANCTUM_STATEFUL_DOMAINS` | Sanctum által engedélyezett domainek |

---

### 2.5 API végpontok

Minden védett végpont (`auth:sanctum` middleware) esetén az `Authorization` fejlécben Bearer token szükséges. A token a bejelentkezéskor kerül kiadásra.

#### Publikus végpontok (hitelesítés nélkül)

| Metódus | Végpont | Leírás |
|---|---|---|
| `POST` | `/api/login` | Bejelentkezés, token visszaadása |
| `POST` | `/api/register` | Regisztráció, megerősítő e-mail küldése |
| `POST` | `/api/register/confirm` | E-mail megerősítés token alapján |
| `POST` | `/api/forgot-password` | Jelszó-visszaállítási e-mail küldése |
| `POST` | `/api/reset-password` | Jelszó megváltoztatása token alapján |
| `GET` | `/api/reset-password/{token}` | Átirányítás az Angular reset oldalra |

#### Védett végpontok (Bearer token szükséges)

| Metódus | Végpont | Leírás | Hozzáférés |
|---|---|---|---|
| `POST` | `/api/logout` | Kijelentkezés, token törlése | Bejelentkezett |
| `GET` | `/api/users` | Felhasználók listázása | Bejelentkezett |
| `GET` | `/api/users/{user}` | Egy felhasználó adatai | Bejelentkezett |
| `PUT` | `/api/users/{user}` | Felhasználó adatainak módosítása | Admin / saját |
| `PUT` | `/api/users/{user}/toggle-status` | Fiók aktiválása / letiltása | Admin |
| `GET` | `/api/meetings` | Közgyűlések listázása (kapcsolt adatokkal) | Bejelentkezett |
| `GET` | `/api/meetings/{meeting}` | Egy közgyűlés részletei | Bejelentkezett |
| `POST` | `/api/meetings` | Új közgyűlés létrehozása | Admin |
| `PUT` | `/api/meetings/{meeting}` | Közgyűlés módosítása | Admin |
| `DELETE` | `/api/meetings/{meeting}` | Közgyűlés törlése | Admin |
| `POST` | `/api/meetings/{meeting}/attend` | Jelenlét rögzítése (ownership_ratio > 0) | Tulajdonos |
| `PUT` | `/api/meetings/{meeting}/toggle-repeated` | Megismételt közgyűlés jelzőjének váltása | Admin |
| `GET` | `/api/agenda-items` | Napirendi pontok listázása | Bejelentkezett |
| `GET` | `/api/agenda-items/{agendaItem}` | Egy napirendi pont adatai | Bejelentkezett |
| `POST` | `/api/agenda-items` | Napirendi pont hozzáadása | Admin |
| `PUT` | `/api/agenda-items/{agendaItem}` | Napirendi pont módosítása / státuszváltás | Admin |
| `DELETE` | `/api/agenda-items/{agendaItem}` | Napirendi pont törlése | Admin |
| `GET` | `/api/resolutions` | Határozatok listázása | Bejelentkezett |
| `GET` | `/api/resolutions/{resolution}` | Egy határozat adatai | Bejelentkezett |
| `POST` | `/api/resolutions` | Határozat / szólásigény rögzítése | Bejelentkezett |
| `PUT` | `/api/resolutions/{resolution}` | Határozat módosítása | Admin |
| `DELETE` | `/api/resolutions/{resolution}` | Határozat törlése | Admin |
| `GET` | `/api/votes` | Szavazatok listázása | Admin |
| `GET` | `/api/votes/{vote}` | Egy szavazat adatai | Admin |
| `POST` | `/api/votes` | Szavazat leadása | Tulajdonos |
| `PUT` | `/api/votes/{vote}` | Szavazat módosítása | Tulajdonos |
| `DELETE` | `/api/votes/{vote}` | Szavazat törlése | Admin |

---

### 2.6 Kontrollerek és szervizek

#### AuthController

A regisztrációs és belépési folyamatot kezeli. Regisztráció esetén az adatokat ideiglenesen a cache-ben tárolja (10 percig), és megerősítő e-mailt küld. A `confirmRegistration()` végpont validálja a tokent, majd létrehozza a felhasználót az adatbázisban (alapértelmezett `role_id = 2`, `ownership_ratio = 0`).

#### MeetingController

A közgyűlések CRUD műveleteinek vezérlője. A `getMeetings()` és `getMeeting()` végpontok a kapcsolt adatokat (agenda_items, resolutions, votes, present_users) is visszaadják eager loading segítségével. Az `attend()` metódus ellenőrzi, hogy a felhasználónak pozitív tulajdoni hányada van-e (`ownership_ratio > 0`), különben 403-as hibát ad vissza.

#### VoteController

A szavazatkezelő vezérlő. A `create()` metódus delegál a `VoteService`-nek, amely ellenőrzi az egyediségi feltételt. 403-as hibakódot ad vissza duplikált szavazás esetén.

#### AgendaItemController

A napirendi pontok teljes CRUD-ját biztosítja. Háromfázisú állapotgépet valósít meg: `PENDING` → `ACTIVE` → `CLOSED`. Csak `ACTIVE` napirendi ponthoz lehet szavazni.

#### ResolutionController

A határozatok és szólásigénylések kezelése. A `store()` metódus elfogadja mind a formális határozat szövegét, mind a szólásigénylési üzeneteket (username mező alapján megkülönböztethetők).

#### UserController

A felhasználókezelést végzi: listázás, adatmódosítás, fiók aktiválása/letiltása (`toggleStatus`). A `forgotPassword()` és `resetPassword()` metódusok a Laravel beépített jelszó-visszaállítási infrastruktúráját használják.

#### Szervizek (Services/)

| Szerviz | Feladat |
|---|---|
| `MeetingService` | Közgyűlés létrehozás, módosítás, törlés üzleti logikája |
| `VoteService` | Szavazatleadás, duplikáció-ellenőrzés, eredmény aggregálás |
| `AgendaItemService` | Napirendi pont állapotkezelése, cascadelt törlés |
| `ResolutionService` | Határozatok kezelése, szavazati eredmény aggregálás |
| `UserService` | Felhasználó lekérdezés, státuszváltás, tulajdoni hányad frissítés |
| `AbilityService` | Policy-alapú jogosultság-ellenőrzési segédszolgáltatás |
| `MeetingReportService` | Közgyűlési riport / összefoglaló generálásához előkészített szerviz |

---

### 2.7 Autentikáció – Laravel Sanctum

Az API hitelesítés Laravel Sanctum token-alapú módszerrel működik. A bejelentkezéskor a szerver egy plaintext tokent ad vissza, amelyet a kliens minden kérésnél az `Authorization: Bearer <token>` fejlécben küld el. A token a `personal_access_tokens` táblában kerül tárolásra, és kijelentkezéskor törlődik.

> **Inaktív felhasználók:** Ha egy felhasználó `is_active` mezője `false`, a login végpont 403-as hibát ad vissza, és a token nem kerül kiadásra. Ezáltal az elköltözött vagy letiltott tulajdonosok nem tudnak belépni a rendszerbe.

---

### 2.8 Továbbfejlesztési lehetőségek

- Webhook / WebSocket alapú valós idejű szavazatfrissítés (jelenleg polling alapú).
- Részletes audit log: ki, mikor, mit változtatott a rendszerben.
- PDF alapú közgyűlési jegyzőkönyv automatikus generálása a `MeetingReportService` segítségével.
- Kétfaktoros hitelesítés (2FA) bevezetése admin jogkörű felhasználóknak.
- Szavazási határidők kezelése: automatikus `CLOSED` státuszváltás időzítő alapján.
- E-mail értesítők: új közgyűlés meghívó, szavazás megnyitásának jelzése.
- Teljes Policy-rendszer finomhangolása az összes erőforrásra.

---

## 3. Fejlesztői dokumentáció – Frontend

### 3.1 Mappa struktúra

```
tarsashaz-szavazas-front/src/
├── app/
│   ├── components/
│   │   ├── about/                     (Rólunk oldal)
│   │   ├── admin/
│   │   │   ├── admin-dashboard/       (Közös képviselő főoldala)
│   │   │   ├── create-meeting/        (Közgyűlés létrehozása)
│   │   │   ├── edit-meeting/          (Közgyűlés szerkesztése)
│   │   │   └── edit-user/             (Felhasználó szerkesztése)
│   │   ├── forgotpassword/
│   │   │   └── resetpassword/         (Jelszó visszaállítás)
│   │   ├── help/                      (Súgó oldal)
│   │   ├── login/                     (Bejelentkezési oldal)
│   │   ├── navbar/                    (Navigációs sáv)
│   │   ├── notifications/             (Értesítések)
│   │   ├── profile/                   (Felhasználói profil)
│   │   ├── register/
│   │   │   └── confirm-email/         (E-mail megerősítés)
│   │   ├── speech-request/            (Szólásigénylések kezelése)
│   │   └── voter-dashboard/           (Tulajdonos főoldala)
│   ├── guards/
│   │   ├── admin-guard.ts             (Admin jogkör ellenőrzés)
│   │   └── auth-guard.ts              (Bejelentkezés ellenőrzés)
│   ├── models/
│   │   └── meeting.model.ts           (TypeScript interfészek)
│   ├── pipes/
│   │   └── meetingfilter-pipe.ts      (Közgyűlés szűrő pipe)
│   ├── services/
│   │   ├── api.service.ts             (Általános API hívások)
│   │   ├── auth.service.ts            (Hitelesítési logika)
│   │   ├── theme.service.ts           (Témaváltás)
│   │   ├── user.service.ts            (Felhasználó állapot)
│   │   └── voting.ts                  (Szavazással kapcsolatos műveletek)
│   ├── app.routes.ts                  (Útvonalak definíciója)
│   └── auth.interceptor.ts            (HTTP interceptor)
└── assets/kepek/                      (Képek, carousel fotók)
```

---

### 3.2 Fejlesztéshez használt eszközök és technológiák

| Eszköz | Verzió | Felhasználás |
|---|---|---|
| Angular | 21.x | Frontend SPA keretrendszer (standalone komponensek) |
| TypeScript | 5.x | Erősen típusos JavaScript szuperhalmaz |
| Bootstrap | 5.3.8 | CSS keretrendszer reszponzív layouthoz |
| SweetAlert2 | – | Modális dialógusablakok (megerősítések, hibák) |
| RxJS | 7.x | Reaktív programozás, Observable-alapú adatfolyamok |
| Angular HttpClient | – | HTTP kérések kezelése, interceptorok |
| sessionStorage | – | Bejelentkezési token és felhasználói adatok tárolása |
| Visual Studio Code | – | Fejlesztői szövegszerkesztő |

---

### 3.3 Komponensek

#### VoterDashboardComponent
**Útvonal:** `/voter`

A tulajdonos / szavazó felhasználó fő felülete.

- 5 másodpercenkénti polling (`interval` + `switchMap` + `forkJoin`) biztosítja a valós idejű adatfrissítést.
- Jelenlét rögzítése (`attendMeeting`), szavazatleadás (`sendVote`), szólásigény küldése (`requestToSpeak`).
- Szűrés cím, dátum és helyszín alapján (`MeetingfilterPipe`).
- Leadott szavazatok nyilvántartása (`votedResolutionIds: Set<number>`), duplikált szavazás UI-szintű megakadályozása.
- Inaktív fiók esetén a polling 403-as hibát kap, és a felhasználó adatai (`is_active = false`) frissülnek.

**Osztályváltozók:**

| Változó | Típus | Leírás |
|---|---|---|
| `currentUser` | `User \| null` | Bejelentkezett felhasználó adatai |
| `meetings` | `any[]` | Közgyűlések listája |
| `loading` | `boolean` | Betöltési állapot jelzője |
| `isParticipatingMap` | `Map<number, boolean>` | Részvétel nyilvántartás közgyűlésenként |
| `votedResolutionIds` | `Set<number>` | Már szavazott határozatok azonosítói |
| `pollingSub` | `Subscription?` | Polling RxJS feliratkozás (ngOnDestroy-ban leiratkozik) |
| `meetingFilterForm` | `FormGroup` | Szűrő űrlap (cím, dátum, helyszín) |

---

#### AdminDashboardComponent
**Útvonal:** `/admin`

A közös képviselő fő kezelőfelülete.

- Összes közgyűlés listázása 5 másodpercenkénti pollinggal.
- Részvételi arány számítása: `calculateAttendance(presentUsers[])` – a jelenlévők `ownership_ratio` értékeit összeadja.
- Határozatképesség ellenőrzése: `isStartDisabled(meeting)` – 5000/10000 th alatt az indítás tiltott (megismételt közgyűlésnél nem).
- Megismételt közgyűlés jelölése (`toggleRepeated`).
- Napirendi pont státuszváltás: `PENDING → ACTIVE → CLOSED` (`updateStatus`).
- Valós idejű szavazateredmény megjelenítés (`getVoteResults`).

---

#### CreateMeetingComponent
**Útvonal:** `/admin/create-meeting`

Új közgyűlés létrehozása: cím, dátum, helyszín és napirendi pontok megadásával. Dinamikus napirendi pont lista (elemek hozzáadása és eltávolítása). Sikeres mentés után átirányítás az admin főoldalra.

---

#### EditMeetingComponent
**Útvonal:** `/admin/edit-meeting/:id`

Meglévő közgyűlés szerkesztése route paraméter (`id`) alapján. Az aktuális adatok betöltése az API-ból, majd módosítás és mentés. Kizárólag admin felhasználók érhetik el (`authGuard + adminGuard`).

---

#### LoginComponent
**Útvonal:** `/login`

- E-mail + jelszó alapú bejelentkezési űrlap.
- Sikeres belépés esetén a token és a felhasználói adatok `sessionStorage`-ba kerülnek.
- Automatikus átirányítás: admin → `/admin`, tulajdonos → `/voter`.
- Inaktív fiók esetén hibaüzenet megjelenítése.

---

#### RegisterComponent / ConfirmEmailComponent
**Útvonal:** `/register`, `/register/confirm/:token`

Regisztrációs űrlap (név, e-mail cím, jelszó). Regisztráció után megerősítő e-mail kerül kiküldésre. A `ConfirmEmailComponent` kezeli az e-mail linkben érkező token validálását (`POST /api/register/confirm`).

---

#### ForgotpasswordComponent / ResetPasswordComponent
**Útvonal:** `/forgot-password`, `/reset-password`

Elfelejtett jelszó esetén e-mail cím megadása, majd visszaállítási link küldése. A `ResetPasswordComponent` kezeli az új jelszó beállítását a `token + email` páros alapján.

---

#### EditUser
**Útvonal:** `/admin/edit-users`

Admin-felület a felhasználók adatainak módosítására: név, e-mail, tulajdoni hányad. Fiók aktiválása / letiltása (`toggleUserStatus`). Kizárólag admin felhasználók érhetik el.

---

#### NavbarComponent

Reszponzív navigációs sáv Bootstrap alapon. Jogkör alapú menüelemek: admin menük csak adminoknak jelennek meg. Kijelentkezés gomb, aktuális felhasználó neve megjelenítve.

---

#### SpeechRequestsComponent
**Útvonal:** `/admin/speeches`

Az admin számára összesíti a felhasználók szólásigényléseit (resolutions). Megmutatja, ki, melyik napirendi ponthoz kért szót.

---

#### ProfileComponent
**Útvonal:** `/profile`

A bejelentkezett felhasználó saját adatainak megtekintése és szerkesztése.

---

#### HelpComponent / AboutComponent
**Útvonal:** `/help`, `/about`

Statikus tájékoztató oldalak: súgó és az alkalmazásról szóló információk.

---

### 3.4 Szervizek

#### ApiService

Az összes backend API kommunikációt összefogja. Minden metódus a `sessionStorage`-ból olvassa a Bearer tokent és beállítja az `Authorization` fejlécet.

| Metódus | Leírás |
|---|---|
| `getMeetings()` / `getMeeting(id)` | Közgyűlések lekérdezése |
| `createMeeting(data)` / `updateMeeting(id, data)` / `deleteMeeting(id)` | Közgyűlés CRUD |
| `sendVote(resolutionId, vote)` | Szavazat leadása |
| `updateAgendaStatus(id, status)` | Napirendi pont státuszváltása |
| `requestToSpeak(agendaItemId, text, username)` | Szólásigény küldése |
| `getUsers()` / `updateUser(id, data)` / `toggleUserStatus(id)` | Felhasználókezelés |
| `attendMeeting(meetingId)` | Jelenlét rögzítése |
| `toggleRepeated(meetingId)` | Megismételt közgyűlés jelzése |
| `deleteAgendaItem(id)` | Napirendi pont törlése |

#### AuthService

A hitelesítési logikáért felelős szerviz. A bejelentkezés és regisztráció után tárolja a tokent és a felhasználói adatokat.

| Metódus | Leírás |
|---|---|
| `login(credentials)` | Bejelentkezés, token + user mentése sessionStorage-ba |
| `register(userData)` | Regisztráció, megerősítő e-mail indítása |
| `confirmEmail(token)` | E-mail megerősítés token alapján |
| `logout()` | sessionStorage törlése, alapértelmezett téma visszaállítása, /login átirányítás |
| `isLoggedIn()` | Ellenőrzi, hogy van-e bejelentkezett felhasználó |
| `sendPasswordResetEmail(email)` | Jelszó-visszaállítási e-mail kérése |
| `resetPassword(password, token, email)` | Új jelszó beállítása |
| `getCurrentUser()` | Bejelentkezett felhasználó adatai (sessionStorage) |
| `setUser(user)` | Felhasználói adatok mentése sessionStorage-ba |

#### UserService

A bejelentkezett felhasználó adatait kezeli a `sessionStorage`-ban (`setUser`, `getCurrentUser`). Különálló szerviz, hogy a `UserResource` adatai frissíthetők legyenek az `AuthService` érintése nélkül.

#### ThemeService

Témaváltási logikát biztosít (világos / sötét mód). Kijelentkezéskor a `setDefaultTheme()` visszaállítja az alapértelmezett témát.

---

### 3.5 Útvonalak és route-védők

| Útvonal | Komponens | Védő |
|---|---|---|
| `/login` | LoginComponent | – |
| `/register` | RegisterComponent | – |
| `/register/confirm/:token` | ConfirmEmailComponent | – |
| `/forgot-password` | ForgotpasswordComponent | – |
| `/reset-password` | ResetPasswordComponent | – |
| `/voter` | VoterDashboardComponent | `authGuard` |
| `/admin` | AdminDashboardComponent | `authGuard` + `adminGuard` |
| `/admin/create-meeting` | CreateMeetingComponent | `authGuard` |
| `/admin/edit-meeting/:id` | EditMeetingComponent | `authGuard` + `adminGuard` |
| `/admin/speeches` | SpeechRequestsComponent | `authGuard` + `adminGuard` |
| `/admin/edit-users` | EditUser | `authGuard` + `adminGuard` |
| `/profile` | ProfileComponent | – |
| `/about` | AboutComponent | – |
| `/help` | HelpComponent | – |

**authGuard:** Ellenőrzi, hogy érvényes token van-e a `sessionStorage`-ban. Ha nincs, átirányít a `/login` oldalra.

**adminGuard:** Ellenőrzi, hogy a bejelentkezett felhasználónak admin jogköre van-e (`role_id === 1`). Ha nem, visszanavigál az előző oldalra vagy a `/voter` oldalra.

---

### 3.6 Adatmodellek (TypeScript interfészek)

A frontend TypeScript interfészek a `meeting.model.ts` fájlban kerültek definiálásra.

```typescript
export interface User {
  id: number;
  name: string;
  ownership_ratio: number;  // tulajdoni hányad százalékban
  role_id: number;
  is_active: boolean;
}

export interface Resolution {
  id: number;
  text: string;
  votes?: any[];
  results?: {
    yes: number;
    no: number;
    abstain: number;
  };
}

export interface AgendaItem {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  resolutions: Resolution[];
}

export interface Owner {
  id: string;
  name: string;
  share: number;
}

export interface Apartment {
  id: string;
  address: string;
  floor?: string;
  flatNumber?: string;
  hrsz: string;
  totalShare: number;
  owners: Owner[];
}

export interface Vote {
  ownerId: string;
  ownerName: string;
  apartmentAddress: string;
  share: number;
  choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK';
}

export interface AppState {
  totalShareBase: number;     // pl. 10000
  presentShare: number;       // jelenlévők összesített hányada
  apartments: Apartment[];
  agendaItems: AgendaItem[];
  currentUser: Owner | null;
  currentApartment: Apartment | null;
}
```

---

### 3.7 Továbbfejlesztési lehetőségek

- WebSocket / Server-Sent Events alapú valós idejű frissítés a polling helyett.
- Szavazati eredmények vizuális megjelenítése (kördiagram, sávdiagram).
- PWA (Progressive Web App) támogatás – offline használat, push értesítések.
- Exportálás: közgyűlési napirend és határozatok PDF-be mentése a böngészőből.
- Sötét mód teljes körű megvalósítása (ThemeService alapra építve).
- Többnyelvűsítés (i18n) bevezetése Angular `ngx-translate` segítségével.
- Egységtesztek (Jasmine/Karma) és end-to-end tesztek (Cypress / Playwright) bővítése.

---

## 4. Felhasználói kézikönyv

### 4.1 Regisztráció és első belépés

Új felhasználó a `/register` oldalon tud regisztrálni. A regisztrációhoz szükséges az e-mail cím, a teljes név és egy jelszó megadása. Sikeres regisztráció után a rendszer megerősítő e-mailt küld a megadott e-mail címre. Az e-mailben található linkre kattintva aktiválódik a fiók, ezt követően a felhasználó bejelentkezhet a `/login` oldalon.

> **Megjegyzés:** Az újonnan regisztrált felhasználók alapértelmezetten tulajdonosi jogkörrel és 0% tulajdoni hányaddal kerülnek rögzítésre. A tulajdoni hányad értékét a közös képviselő (admin) állítja be a felhasználókezelő felületen.

---

### 4.2 Bejelentkezés

A bejelentkezési oldalon az e-mail cím és jelszó megadása szükséges. Sikeres bejelentkezés után a rendszer automatikusan a megfelelő főoldalra irányít:

- **Admin (közös képviselő)** → `/admin` felület
- **Tulajdonos / szavazó** → `/voter` felület

Ha a fiók inaktív (elköltözött, letiltott), a rendszer hibaüzenetet jelenít meg és a bejelentkezés sikertelen.

**Elfelejtett jelszó:** Az „Elfelejtett jelszó" linkre kattintva megadható az e-mail cím, amire a rendszer jelszó-visszaállítási linket küld. A linkre kattintva a `/reset-password` oldalon adható meg az új jelszó.

---

### 4.3 Tulajdonosi felület (/voter)

A tulajdonosi dashboard a legfontosabb felület a szavazók számára. Az oldal automatikusan frissül 5 másodpercenként.

#### Közgyűlések megtekintése

Az összes közgyűlés listázva jelenik meg dátum, helyszín és cím szerint csoportosítva. A lista szűrhető cím, dátum és helyszín alapján a szűrő mezőkkel.

#### Jelenlét rögzítése

A közgyűlésnél található „Megjelent" gombra kattintva a tulajdonos rögzítheti jelenlétét. Ez szükséges feltétel a szavazáshoz. Csak akkor érhető el, ha a felhasználónak pozitív tulajdoni hányada van (`ownership_ratio > 0`).

#### Szavazás

Amikor egy napirendi pont `ACTIVE` státuszba kerül, a hozzá tartozó határozatokra leadható a szavazat. Három lehetőség áll rendelkezésre:

- **Igen** (`yes`)
- **Nem** (`no`)
- **Tartózkodik** (`abstain`)

Egy szavazó ugyanarra a határozatra csak egyszer szavazhat. A már leadott szavazatot a felület jelzi (a gomb inaktívvá válik).

#### Szólásigénylés

Aktív napirendi ponthoz szólásigénylést lehet benyújtani. A szólásigénylés szövegét a megfelelő mezőbe kell beírni és elküldeni. Az admin felületen a közös képviselő látja az összes beérkezett szólásigénylést.

---

### 4.4 Admin felület (/admin) – Közös képviselő

Az admin felület kizárólag admin jogkörű (közös képviselő) felhasználók számára érhető el.

#### Közgyűlések kezelése

- **Új közgyűlés létrehozása:** `/admin/create-meeting` oldalon cím, dátum, helyszín és napirendi pontok megadásával.
- **Meglévő közgyűlés szerkesztése:** a „Szerkesztés" gombra kattintva (`/admin/edit-meeting/:id`).
- **Közgyűlés törlése:** SweetAlert2 megerősítő dialógus után véglegesen törölhető.
- **Megismételt közgyűlés jelölése:** ha az első közgyűlés határozatképtelen volt (50% alatti részvétel), a „Megismételt" kapcsolóval jelölhető meg. Megismételt közgyűlésen alacsonyabb kvórum elegendő (az `isStartDisabled` feltétel nem érvényes).

#### Napirendi pontok kezelése

- Napirendi pont hozzáadása közgyűlés létrehozásakor vagy szerkesztésekor.
- Státuszváltás: `PENDING` → `ACTIVE` (szavazás megnyitása), `ACTIVE` → `CLOSED` (szavazás lezárása).
- `ACTIVE` állapotban a szavazók leadhatják szavazataikat.
- `CLOSED` után a napirendi pont szavazateredményei véglegesek.

#### Részvétel és határozatképesség

Az admin dashboard mutatja a jelenlévők összesített tulajdoni hányadát. A közgyűlés akkor határozatképes, ha a jelenlévők tulajdoni hányada meghaladja az 50%-ot (5000 / 10000 th). Az „Indítás" gomb addig inaktív, amíg ez a feltétel nem teljesül – kivéve megismételt közgyűlés esetén.

#### Felhasználókezelés (/admin/edit-users)

- Összes felhasználó listázása névvel, e-mail címmel, tulajdoni hányaddal és státusszal.
- **Tulajdoni hányad módosítása:** az admin beállítja a tényleges tulajdoni hányad értékét.
- **Fiók aktiválása / letiltása:** az „Aktív" kapcsolóval vezérelhető.
- Elköltözött tulajdonos esetén a fiók letiltható, így a személy nem tud belépni.

#### Szólásigénylések (/admin/speeches)

Az összes beérkezett szólásigénylést listázza napirendi pont szerint csoportosítva. Segítségével a közös képviselő nyomon követheti, ki kért szót és melyik témában.

---

### 4.5 Jelszókezelés

#### Jelszó módosítása

A profil oldalon (`/profile`) a bejelentkezett felhasználó megváltoztathatja jelszavát a jelenlegi jelszó megadásával.

#### Elfelejtett jelszó

1. A bejelentkezési oldalon kattints az „Elfelejtett jelszó" linkre.
2. Add meg a regisztrált e-mail címet.
3. A rendszer visszaállítási linket küld az e-mail címre.
4. A linkre kattintva a `/reset-password` oldalon add meg az új jelszót és annak megerősítését.

---

## 5. Összefoglalás

A projekt célja egy valós igényre épülő, működőképes társasházi szavazási és közgyűlés-kezelő rendszer elkészítése volt. A fejlesztés során kiemelt figyelmet fordítottunk a biztonságra (token-alapú hitelesítés, inaktív fiókok kezelése, duplikált szavazat megakadályozása), a valós idejű adatfrissítésre (polling), valamint az átlátható, jogkör-alapú hozzáférés-kezelésre.

A backend Laravel 12 / PHP 8.2 alapon REST API-t biztosít, amelyet Laravel Sanctum véd. A frontend Angular 21 standalone komponens-architektúrával készült, Bootstrap 5 és SweetAlert2 felhasználásával. A két réteg között tisztán definiált API-n keresztül folyik a kommunikáció.

**Megvalósított funkcionalitás:**
- Jogkör alapú hozzáférés (admin / tulajdonos)
- Közgyűlések teljes CRUD-ja napirendi pontokkal együtt
- Napirendi pontok háromfázisú állapotgépe (PENDING → ACTIVE → CLOSED)
- Határozatképesség ellenőrzés tulajdoni hányad alapján
- Elektronikus szavazás egyediségi ellenőrzéssel
- Szólásigénylés leadása és kezelése
- Felhasználókezelés (aktiválás, letiltás, tulajdoni hányad szerkesztése)
- Jelszó-visszaállítás e-mailben
- E-mail megerősítéses regisztráció

**Jövőbeli fejlesztési irányok:**

- WebSocket-alapú valós idejű frissítés a polling helyett
- PDF-alapú közgyűlési jegyzőkönyv generálás (`MeetingReportService`)
- Kétfaktoros hitelesítés adminoknak
- Szavazateredmények vizuális megjelenítése (diagramok)
- PWA támogatás mobilon
- Teljes körű Policy-rendszer finomhangolása
