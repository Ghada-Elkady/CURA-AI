# 🏥 CURA AI - Responsive Healthcare Operations & Appointment Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CURA AI** is a modern, responsive healthcare management and doctor appointment booking web application inspired by the [CURA Figma Design System](https://www.figma.com/design/efNqIJNKBQ5KnRoy2XuNyH/CURA?node-id=0-1&t=W9GW0x7qSNNTbokb-1).

---

## ✨ Features

- **🎨 Figma Design System Alignment**: Clean cyan (`#0ABDE3`) and dark navy (`#0A3D62`) aesthetic, glassmorphism headers, rounded pills, star ratings, and card layouts.
- **📱 Mobile-First Responsive Layout**: Frame-centered mobile preview on desktop viewports and full-bleed layout on mobile devices.
- **⚡ Interactive Booking Flow**:
  - Specialty categories & top doctor carousels.
  - Real-time search with multi-criteria filters (specialty, rating, gender, fee range).
  - Interactive date picker and morning/afternoon/evening time slot grid.
  - Consultation mode toggle (In-Person vs. Online Video Call).
  - Booking confirmation & appointment management.
- **📋 User Management**:
  - Auth flows (Login, Sign Up, Forgot Password) with form validation.
  - User profile with notifications settings and theme options.
  - Appointment history tabs (Upcoming, Completed, Cancelled).
- **🔌 Dual Mode**: Built-in mock data fallback for immediate offline/standalone demoing, alongside full REST API integration support.

---

## 🛠️ Project Structure

```text
CURA-AI/
├── frontend/                   # Next.js 14 Responsive UI Frontend
│   ├── app/                    # App Router (Pages & Layouts)
│   │   ├── (auth)/             # Login, Signup, Forgot Password
│   │   ├── (main)/             # Home, Search, Doctors, Booking, Appointments, Profile
│   │   ├── globals.css         # Tailwind directives & design tokens
│   │   └── layout.tsx          # Root provider & shell container
│   ├── components/             # Reusable UI components
│   │   ├── appointments/       # Appointment cards & lists
│   │   ├── booking/            # Date pickers & time slot grids
│   │   ├── doctors/            # Doctor cards & specialty chips
│   │   ├── layout/             # TopBar & BottomNav
│   │   └── ui/                 # Star ratings, status badges, toasts
│   ├── lib/                    # Utilities, API client, Zustand stores, Mock data
│   └── public/                 # Static icons & assets
└── backend/                    # FastAPI Python Backend Services
    └── app/                    # Auth, Doctor, Appointment & Review APIs
```

---

## 🚀 Quick Start

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the app!

### 2. Frontend Production Build

```bash
cd frontend
npm run build
npm start
```

---

## 🎨 Figma Design Reference

This application faithfully implements the design components, color tokens, and navigation flows defined in the official CURA Figma specifications:
- [Figma Design Canvas](https://www.figma.com/design/efNqIJNKBQ5KnRoy2XuNyH/CURA?node-id=0-1&t=W9GW0x7qSNNTbokb-1)

---

## 📄 License

Distributed under the MIT License.
