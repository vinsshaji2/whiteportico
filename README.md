# White Portico Thekkady — Booking Voucher App

A Flask web application for creating and managing hotel booking vouchers.

## Project Structure

```
white_portico/
├── app.py                  ← Flask application (main entry point)
├── requirements.txt        ← Python dependencies
├── bookings.json           ← Auto-created; stores all bookings
├── templates/
│   ├── base.html           ← Shared header/nav layout
│   ├── index.html          ← New / Edit booking form
│   ├── voucher_partial.html← Live voucher preview (reused in index)
│   ├── voucher.html        ← Full-page saved voucher view
│   └── bookings.html       ← All bookings list
└── static/
    ├── css/style.css       ← All styles
    ├── js/main.js          ← All client-side logic
    └── uploads/            ← Logo stored here (auto-created)
```

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the app
```bash
python app.py
```

### 3. Open in browser
```
http://localhost:5000
```

## Features

- **New Booking form** — Guest info, stay dates, dynamic room rows
- **Auto night calculation** — Computed from arrival/departure dates
- **Multiple rooms** — Add/remove rooms with different types and rates
- **Live voucher preview** — Right panel updates as you type
- **Save bookings** — Stored in `bookings.json`
- **All Bookings list** — Table view with status, balance, actions
- **Edit / Delete** — Manage existing bookings
- **Print / Save PDF** — Browser print dialog
- **Logo upload** — Click the logo area to upload; persists on server

## Adding Your Logo Permanently

1. Place your logo file (e.g. `logo.png`) inside `static/uploads/`
2. The app will detect and display it automatically on next load

## Room Types (customize in app.py)

| Room Type      | Plan | Default Rate |
|---------------|------|-------------|
| Premium AC Room | CP  | ₹1,400      |
| Deluxe Room    | EP   | ₹1,800      |
| Standard Room  | EP   | ₹1,000      |
| Suite          | MAP  | ₹2,800      |
| Custom         | —    | ₹0          |

To change rates or add room types, edit the `ROOM_TYPES` list in `app.py`.
