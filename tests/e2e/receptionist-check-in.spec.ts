import { test, expect } from '@playwright/test';

// Common auth state injection
const mockAuthState = () => {
  return {
    state: {
      user: {
        id: 'rec-1',
        email: 'receptionist@smartclinic.com',
        fullName: 'Receptionist Test',
        role: 'RECEPTIONIST'
      },
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      isAuthenticated: true
    },
    version: 0
  };
};

test.describe('Receptionist Check-in', () => {
  test.beforeEach(async ({ page }) => {
    // Block external requests
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('fonts.googleapis.com') || 
        url.includes('fonts.gstatic.com') ||
        url.includes('google.com') ||
        url.includes('analytics') ||
        url.startsWith('https://') && !url.includes('localhost')
      ) {
        return route.abort();
      }
      route.continue();
    });

    // Inject auth state
    await page.addInitScript((state) => {
      window.localStorage.setItem('auth-storage', JSON.stringify(state));
    }, mockAuthState());

    // Mock API requests
    await page.route('**/api/users/me', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { id: 'rec-1', role: 'RECEPTIONIST', fullName: 'Receptionist Test' } }
      });
    });

    await page.route('**/api/bookings/dashboard/receptionist-stats', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { 
          pending: { value: 5, trend: 10, trendDir: 'up' }, 
          confirmed: { value: 2, trend: 0, trendDir: 'neutral' }, 
          completed: { value: 10, trend: -5, trendDir: 'down' }, 
          cancelled: { value: 1, trend: 0, trendDir: 'neutral' } 
        } }
      });
    });

    await page.route('**/api/users/public/doctors*', async route => {
      await route.fulfill({
        status: 200,
        json: { data: [
          { id: 'doc-1', fullName: 'Dr. John Doe' }
        ] }
      });
    });

    await page.route('**/api/services', async route => {
      await route.fulfill({
        status: 200,
        json: { data: [
          { id: 'srv-1', name: 'General Consultation' }
        ] }
      });
    });

    await page.route('**/api/bookings*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: { data: {
            bookings: [
              {
                id: 'booking-1',
                bookingCode: 'B-12345',
                patientProfile: { fullName: 'Test Patient', patientCode: 'P-001' },
                doctor: { fullName: 'Dr. John Doe' },
                service: { name: 'General Consultation' },
                status: 'PENDING',
                bookingDate: new Date().toISOString(),
                startTime: '09:00',
                type: 'CONSULTATION',
                services: []
              }
            ],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
          } }
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should display bookings and stats successfully', async ({ page }) => {
    await page.goto('/vi/receptionist/check-in');
    
    // Wait for the page to load
    await expect(page.locator('text=Test Patient').first()).toBeVisible();
    await expect(page.locator('text=Dr. John Doe').first()).toBeVisible();
  });
});
