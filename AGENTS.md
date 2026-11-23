# AGENTS.md — Developer & AI Agent Architecture Guide

This document describes the architectural layout, conventions, and operational patterns for the **Trevel Tourism & Fleet Management System**.

---

## 1. Project Overview & Philosophy

- **Domain**: Premium Tourism Bus Fleet Operation & Charter Reservation (PO. Trevel Wisata Nusantara, East Java & Bali).
- **Aesthetic**: High-End Swiss Editorial Transit & Tactile Skeuomorphic Ticket.
- **Tech Stack**: React 18, Vite, Tailwind CSS, Framer Motion, TanStack Query v5, Recharts, React Hook Form, date-fns (locale `id`), canvas-confetti, sonner.
- **Language**: JavaScript (ES2022+ / JSX), clean modern syntax without TypeScript.

---

## 2. Directory Structure

```
trevel-management-system/
├── index.html                 # Entry point with Google Fonts (Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono)
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration with React plugin
├── tailwind.config.js         # Custom theme: canvas, obsidian, cobalt, terminal, ticket colors & fonts
├── postcss.config.js          # PostCSS with Tailwind and Autoprefixer
├── netlify.toml               # Netlify build configuration with SPA fallback rewrite
├── README.md                  # Human user documentation
├── AGENTS.md                  # This architecture guide
└── src/
    ├── main.jsx               # React 18 createRoot, QueryClientProvider, Sonner Toaster
    ├── App.jsx                # Layout controller, global navigation, optimistic mutations
    ├── api.js                 # Google Apps Script client and response mapping
    ├── data/catalog.js        # Fleet, partners & status constants shared by frontend and server
    ├── admin/                 # Admin panel: AdminApp, AdminLogin, AdminDashboard, ReservationManager, FleetManager, SettingsManager
    ├── utils.js               # IDR currency formatting, date helpers, barcode generator, collision matrix
    ├── styles.css             # Base styles, grid pattern, print stylesheets, ticket notches, rubber stamp
    └── components/
        ├── Navbar.jsx         # Sticky floating glassmorphism island, live WIB clock, status pill
        ├── HomeHero.jsx       # Company profile, live stats, popular East Java routes, crew safety SOP
        ├── FleetCatalog.jsx   # Bus cards (Zotopia, Cocomelon), specifications, direct booking triggers
        ├── SeatMapModal.jsx   # Interactive seat plan generated from each bus capacity
        ├── BookingForm.jsx    # React Hook Form, pax counter, cost calculator, split layout
        ├── RangeCalendar.jsx  # Custom range calendar with collision detection matrix & tooltips
        ├── TicketPreview.jsx  # Skeuomorphic thermal ticket with radial notches, barcode, spring stamp
        ├── ScheduleView.jsx   # Toggle 30-day Gantt timeline & searchable data grid with ticket stacks
        └── ExecutiveRecap.jsx # KPI cards, Recharts Bar Chart & Donut Chart, partner loyalty leaderboard
```

---

## 3. Key Conventions & Invariants

### 3.1. Fleet Representation
There are two primary executive buses in service:
1. `zotopia`: Jetbus 5 Royal Coach | Plate `N 7122 UZ` | Capacity 33 Seats | Color `#1D4ED8`
2. `cocomelon`: Avante H8 Prime | Plate `N 7890 UZ` | Capacity 33 Seats | Color `#059669`
Both have a standard charter base rate of `Rp3.500.000` / day.

### 3.2. Collision Detection Matrix
In `src/utils.js`:
- `isDateBookedForBus(dateStr, busId, bookings)`: Inspects if a single date intersects any existing active reservation for the specified bus.
- `checkRangeCollision(startStr, endStr, busId, bookings)`: Inspects if a selected date interval overlaps any existing booking. If an overlap occurs, the user is blocked from making the reservation.
- Notice: **Zotopia on 2026-10-23** (`TRV-261023-901`) is specifically reserved for *Mitra Wisata Tour* to serve as a demonstrative collision baseline.

### 3.3. Backend, Persistence & Access Split
- **Data source**: `src/api.js` calls the configured Google Apps Script web app. `GET` reads `armada`, `penyewa`, and `booking`, then maps the sheet fields to the UI model. Public and admin booking creation use `POST` to the same endpoint.
- **Admin panel** (`/panel-bugar-indah`, `src/admin/`): login and CRUD actions use the Apps Script action API. Admin credentials are configured in the spreadsheet menu and the password hash is stored in Script Properties. Apps Script validates expiring session tokens for all admin actions.
- **Fleet catalog CRUD**: the admin `Katalog Bus` view creates, updates, and deletes rows in `Armada`; deleting a bus with active bookings is blocked. Optional catalog fields are stored in columns `Body_Type`, `Chassis`, `Year`, `Tagline`, `Color_Hex`, `Image`, and `Facilities`.
- **Booking CRUD**: the admin panel creates, updates status/price/admin notes, and deletes rows in `Booking`. Public booking creation remains unauthenticated by design and is validated server-side in Apps Script.
- **AI Analyst** needs a separate backend/API and is not provided by the Apps Script data endpoint.
- **Legacy Netlify files** under `netlify/` and `db/` are not used by the current frontend data flow. Do not treat their migrations as the active database or restore from a dump.
- Status values: `Menunggu Konfirmasi`, `Terkonfirmasi`, `Selesai`, `Dibatalkan` (see `src/data/catalog.js`). Cancelled bookings never block dates.

### 3.4. Printing Support
The tactile ticket (`TicketPreview.jsx`) includes print CSS defined in `src/styles.css`. Elements with `.no-print` are omitted, and `.print-ticket-root` renders cleanly as an operational travel permit (*Surat Jalan*).

---

## 4. Maintenance Guidelines

- **No Build Artifacts**: Never commit or emit `dist/` or `.vite/` files into the repository.
- **Date Formatting**: Always use `date-fns` with `{ locale: id }` to preserve standardized Indonesian date nomenclature (e.g., `Oktober`, `November`, `Senin`, `Selasa`).
- **Currency**: Always use `formatIDR()` from `src/utils.js` for Rupiah outputs.
