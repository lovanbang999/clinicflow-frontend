# ClinicFlow Frontend

<p align="center">
  <strong>Smart Clinic Appointment & Queue Management System</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.0-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Internationalization](#internationalization)
- [Routing & Navigation](#routing--navigation)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Theming](#theming)
- [Building for Production](#building-for-production)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

---

## About

**ClinicFlow Frontend** is a modern, responsive web application built with Next.js 16 that provides an intuitive interface for clinic appointment management. It supports multiple user roles with dedicated dashboards, bilingual support (English/Vietnamese), and a comprehensive booking system with smart suggestions.

**User Experience Highlights:**
- Modern, clean UI with dark mode support
- Fully responsive design (mobile, tablet, desktop)
- Bilingual interface (English/Vietnamese)
- Fast page loads with Next.js App Router
- Real-time notifications and status updates
- Smart booking suggestions
- Accessible components (ARIA support)

---

## Key Features

### Public Pages
- **Landing Page**: Hero section, features showcase, services overview, call-to-action
- **Doctor Directory**: Browse doctors with filtering and search
- **Services Catalog**: View available clinic services with pricing
- **Authentication**: Register, login, email verification with OTP

### Patient Dashboard
- **Book Appointments**: Multi-step booking flow
  - Select service → Choose doctor → Pick date & time
  - Smart slot suggestions based on availability
  - Real-time slot availability checking
- **My Bookings**: View appointment history and upcoming appointments
- **Queue Status**: Check position in waiting queue
- **Profile Management**: Update personal information and avatar

### Doctor Dashboard
- **Schedule Management**:
  - Set weekly working hours
  - Add break times (lunch, meetings)
  - Mark off days (vacations, holidays)
- **Appointment List**: View daily/weekly appointments
- **Patient Information**: Access patient details during appointments
- **Status Updates**: Mark appointments as completed, no-show, etc.

### Receptionist Dashboard
- **Check-in System**: Quick patient check-in
- **Queue Management**:
  - View waiting queue
  - Manually promote patients from queue
  - Adjust priorities for emergencies
- **Booking Overview**: View all appointments across doctors
- **Patient Search**: Quick lookup by name, phone, or booking ID

### Admin Dashboard
- **User Management**: CRUD operations for all users
- **Service Management**: Add, edit, remove clinic services
- **System Configuration**: Manage settings and permissions
- **Reports**: View statistics and analytics (planned)

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|----------|
| **Next.js** | 16.1.0 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|----------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible component library |
| **Radix UI** | Latest | Headless UI primitives |
| **Lucide React** | 0.562.0 | Icon library |
| **next-themes** | 0.4.6 | Dark mode support |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|----------|
| **Zustand** | 5.0.9 | Lightweight state management |
| **Axios** | 1.13.2 | HTTP client |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 3.x | Schema validation |

### Internationalization
| Technology | Version | Purpose |
|------------|---------|----------|
| **next-intl** | 4.6.1 | i18n for Next.js |

### Utilities
| Technology | Version | Purpose |
|------------|---------|----------|
| **date-fns** | 4.1.0 | Date manipulation |
| **clsx** | 2.x | Conditional classNames |
| **tailwind-merge** | 2.x | Merge Tailwind classes |
| **sonner** | 2.0.7 | Toast notifications |

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **Yarn** (v1.22.x or higher) - `npm install -g yarn`
- **Git** - [Download](https://git-scm.com/downloads)
- **Backend API** - Running at `http://localhost:8080` (see [Backend README](../backend/README.md))

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ClinicFlow/frontend
```

### 2. Install Dependencies

```bash
yarn install
```

This installs all required packages including Next.js, React, Tailwind CSS, and UI components.

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="ClinicFlow"

# Default Locale
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |  Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (for redirects) | `http://localhost:3000` |  Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ClinicFlow` |  Optional |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language | `vi` (Vietnamese) |  Optional |

**Note**: All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
yarn dev
```

The application will be available at **[http://localhost:3001](http://localhost:3001)** (or the port specified in package.json).

### Production Build

Build and start the optimized production version:

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Linting

Run ESLint to check code quality:

```bash
yarn lint
```

---

## Project Structure

```
frontend/
├── public/                     # Static assets
│   └── empty-state/           # Empty state images
├── messages/                   # Internationalization files
│   ├── en/                    # English translations
│   │   ├── auth.json
│   │   ├── booking.json
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   ├── doctors.json
│   │   ├── errors.json
│   │   ├── landing.json
│   │   ├── queue.json
│   │   ├── services.json
│   │   └── validation.json
│   └── vi/                    # Vietnamese translations
│       └── (same structure)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── (auth)/        # Auth pages (login, register)
│   │   │   ├── (dashboard)/   # Dashboard pages (protected)
│   │   │   │   ├── patient/   # Patient dashboard
│   │   │   │   ├── doctor/    # Doctor dashboard
│   │   │   │   ├── receptionist/  # Receptionist dashboard
│   │   │   │   └── admin/     # Admin dashboard
│   │   │   ├── doctors/       # Public doctor directory
│   │   │   ├── services/      # Public services catalog
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Landing page
│   │   ├── api/               # API routes (Next.js route handlers)
│   │   ├── globals.css        # Global styles
│   │   └── not-found.tsx      # 404 page
│   ├── components/            # React components
│   │   ├── booking/          # Booking flow components
│   │   │   ├── BookingSteps.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DoctorSelector.tsx
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── SmartSuggestions.tsx
│   │   │   └── TimeSlotGrid.tsx
│   │   ├── common/           # Shared components
│   │   │   ├── Avatar.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ...
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── doctors/          # Doctor-related components
│   │   ├── landing/          # Landing page sections
│   │   ├── layout/           # Layout components (Navbar, Sidebar, Footer)
│   │   ├── queue/            # Queue management components
│   │   ├── services/         # Service-related components
│   │   └── ui/               # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── ...
│   ├── i18n/                 # Internationalization config
│   │   ├── index.ts          # i18n setup
│   │   ├── navigation.ts     # Localized navigation
│   │   ├── request.ts        # Request-based locale
│   │   └── routing.ts        # Route configuration
│   ├── lib/                  # Utilities and libraries
│   │   ├── api/              # API client modules
│   │   │   ├── auth.ts       # Auth endpoints
│   │   │   ├── bookings.ts   # Booking endpoints
│   │   │   ├── doctors.ts    # Doctor endpoints
│   │   │   ├── queue.ts      # Queue endpoints
│   │   │   ├── schedules.ts  # Schedule endpoints
│   │   │   ├── services.ts   # Service endpoints
│   │   │   └── users.ts      # User endpoints
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand stores
│   │   │   ├── authStore.ts      # Authentication state
│   │   │   ├── bookingStore.ts   # Booking flow state
│   │   │   └── uiStore.ts        # UI state (theme, sidebar)
│   │   └── utils/            # Helper functions
│   ├── styles/
│   │   └── themes.ts         # Theme configuration
│   └── types/                # TypeScript type definitions
│       ├── api.ts            # API response types
│       ├── auth.ts           # Auth types
│       ├── booking.ts        # Booking types
│       ├── doctor.ts         # Doctor types
│       ├── service.ts        # Service types
│       └── ...
├── .env.local                # Environment variables (create this)
├── .env.example              # Example environment file
├── components.json           # shadcn/ui configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Internationalization

The application supports **English** and **Vietnamese** using `next-intl`.

### Supported Locales

- **Vietnamese (vi)** - Default
- **English (en)**

### Switching Languages

Users can switch languages via the language selector in the navbar. The selected locale is persisted in localStorage.

### Adding New Translations

1. **Add translation keys** to message files:
   ```json
   // messages/en/common.json
   {
     "welcome": "Welcome to ClinicFlow",
     "book_now": "Book Now"
   }
   ```

2. **Use in components**:
   ```tsx
   import { useTranslations } from 'next-intl';
   
   export default function Component() {
     const t = useTranslations('common');
     return <h1>{t('welcome')}</h1>;
   }
   ```

### Translation File Structure

| File | Content |
|------|----------|
| `auth.json` | Login, register, verification |
| `booking.json` | Booking flow, appointments |
| `common.json` | Shared text (buttons, labels) |
| `dashboard.json` | Dashboard-specific text |
| `doctors.json` | Doctor-related content |
| `errors.json` | Error messages |
| `landing.json` | Landing page content |
| `queue.json` | Queue management text |
| `services.json` | Service-related content |
| `validation.json` | Form validation messages |

---

## Routing & Navigation

### Route Structure

The application uses Next.js App Router with internationalized routes:

```
/[locale]                    # Language-specific routes
├── /                        # Landing page (public)
├── /login                   # Login page (public)
├── /register                # Registration (public)
├── /doctors                 # Doctor directory (public)
├── /services                # Services catalog (public)
└── /dashboard               # Protected routes
    ├── /patient             # Patient dashboard
    │   ├── /book            # Book appointment
    │   ├── /bookings        # My bookings
    │   └── /profile         # Profile settings
    ├── /doctor              # Doctor dashboard
    │   ├── /schedule        # Manage schedule
    │   └── /patients        # View patients
    ├── /receptionist        # Receptionist dashboard
    │   ├── /checkin         # Check-in patients
    │   └── /queue           # Manage queue
    └── /admin               # Admin dashboard
        ├── /users           # User management
        ├── /services        # Service management
        └── /reports         # Analytics
```

### Navigation Components

Use the custom `Link` component for internationalized navigation:

```tsx
import { Link } from '@/i18n/navigation';

<Link href="/doctors">View Doctors</Link>
```

### Protected Routes

Dashboard routes are protected with authentication middleware. Unauthenticated users are redirected to `/login`.

---

## State Management

The application uses **Zustand** for state management with localStorage persistence.

### Auth Store

Manages authentication state:

```typescript
import { useAuthStore } from '@/lib/store/authStore';

const { user, tokens, login, logout } = useAuthStore();
```

**State:**
- `user`: Current user object
- `tokens`: Access & refresh tokens
- `isAuthenticated`: Boolean flag

**Actions:**
- `login(user, tokens)`: Set authenticated user
- `logout()`: Clear auth state
- `updateUser(data)`: Update user profile

### Booking Store

Manages the multi-step booking flow:

```typescript
import { useBookingStore } from '@/lib/store/bookingStore';

const { service, doctor, date, setService } = useBookingStore();
```

**State:**
- `service`: Selected service
- `doctor`: Selected doctor
- `date`: Selected date
- `timeSlot`: Selected time slot
- `currentStep`: Current booking step (1-4)

### UI Store

Manages UI state (theme, sidebar, modals):

```typescript
import { useUIStore } from '@/lib/store/uiStore';

const { theme, sidebarOpen, toggleSidebar } = useUIStore();
```

---

## API Integration

The application uses Axios for HTTP requests with automatic token refresh.

### API Client Structure

```typescript
// lib/api/bookings.ts
import api from './client';

export const bookingsApi = {
  create: (data: CreateBookingDto) => 
    api.post('/bookings', data),
  
  getMyBookings: () => 
    api.get('/bookings/my-bookings'),
  
  cancel: (id: string) => 
    api.delete(`/bookings/${id}`),
};
```

### Using API in Components

```tsx
import { bookingsApi } from '@/lib/api/bookings';
import { useMutation, useQuery } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['bookings'],
  queryFn: bookingsApi.getMyBookings,
});

// Mutate data
const { mutate } = useMutation({
  mutationFn: bookingsApi.create,
  onSuccess: () => {
    toast.success('Booking created!');
  },
});
```

### Automatic Token Refresh

The API client automatically:
1. Attaches access token to requests
2. Intercepts 401 errors
3. Refreshes token using refresh token
4. Retries original request
5. Logs out if refresh fails

---

## Theming

The application supports light and dark modes using `next-themes`.

### Theme Toggle

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>
```

### Customizing Colors

Edit `src/styles/themes.ts` and `tailwind.config.ts` to customize the color palette.

### CSS Variables

Theme colors are defined as CSS variables in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## Building for Production

### Build the Application

```bash
yarn build
```

This creates an optimized production build in the `.next` folder.

### Start Production Server

```bash
yarn start
```

### Deployment Options

#### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

Build and run:

```bash
docker build -t clinicflow-frontend .
docker run -p 3000:3000 clinicflow-frontend
```

#### Static Export (if applicable)

```bash
yarn build
yarn export
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `yarn dev` | Start development server with hot reload |
| **Build** | `yarn build` | Create production build |
| **Start** | `yarn start` | Start production server |
| **Lint** | `yarn lint` | Run ESLint |
| **Lint Fix** | `yarn lint --fix` | Auto-fix linting issues |
| **Type Check** | `yarn tsc --noEmit` | Check TypeScript types |
| **Format** | `yarn prettier --write .` | Format code with Prettier |

---

## Troubleshooting

### Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**: Kill the process or change the port:
```bash
# Find and kill process
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change port
PORT=3002 yarn dev
```

### API Connection Failed

**Error**: `Network Error` or `Failed to fetch`

**Solutions**:
1. Ensure backend is running at `http://localhost:8080`
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Verify CORS settings in backend
4. Check browser console for details

### Build Errors

**Error**: `Module not found` or `Type error`

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
yarn install
yarn build
```

### Slow Development Server

**Solutions**:
1. Increase Node memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" yarn dev
   ```
2. Disable source maps temporarily:
   ```js
   // next.config.ts
   productionBrowserSourceMaps: false
   ```

### Hydration Errors

**Error**: `Hydration failed` or `Text content does not match`

**Common causes**:
- Using `localStorage` during SSR
- Date formatting differences
- Theme flickering

**Solutions**:
- Use `useEffect` for client-only code
- Use `suppressHydrationWarning` sparingly
- Ensure consistent rendering on server and client

### Image Loading Issues

**Error**: `Invalid src prop`

**Solution**: Add image domain to `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
  ],
}
```

---

## License

This project is part of the ClinicFlow system. See the root LICENSE file for details.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Follow the code style (ESLint + Prettier)
4. Write meaningful commit messages
5. Test thoroughly
6. Push and create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive component names
- Add JSDoc comments for complex functions

---

## Support

For issues and questions:
- Create an issue in the repository
- Check the [Backend API Documentation](http://localhost:8080/api-docs)
- Review the [Project Documentation](../docs/)

---

**Built with ❤️ using Next.js 16 & React 19**
