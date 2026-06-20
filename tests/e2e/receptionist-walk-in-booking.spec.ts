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

test.describe('Receptionist Walk-in Booking', () => {
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

    // Mock APIs
    await page.route('**/api/users/public/doctors*', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { users: [
          { id: 'doc-1', fullName: 'Dr. Smith', doctorProfile: { specialties: ['Cardiology'] }, workingHours: [{ dayOfWeek: 'MONDAY' }, { dayOfWeek: 'TUESDAY' }, { dayOfWeek: 'WEDNESDAY' }, { dayOfWeek: 'THURSDAY' }, { dayOfWeek: 'FRIDAY' }, { dayOfWeek: 'SATURDAY' }, { dayOfWeek: 'SUNDAY' }] },
          { id: 'doc-2', fullName: 'Dr. Jones', doctorProfile: { specialties: ['General'] }, workingHours: [{ dayOfWeek: 'MONDAY' }, { dayOfWeek: 'TUESDAY' }, { dayOfWeek: 'WEDNESDAY' }, { dayOfWeek: 'THURSDAY' }, { dayOfWeek: 'FRIDAY' }, { dayOfWeek: 'SATURDAY' }, { dayOfWeek: 'SUNDAY' }] }
        ] } }
      });
    });

    await page.route('**/api/users/receptionist/patients*', async route => {
      await route.fulfill({
        status: 200,
        json: { data: {
          items: [
            { id: 'pat-1', fullName: 'Jane Doe', phone: '0987654321', dateOfBirth: '1990-01-01' }
          ],
          total: 1
        } }
      });
    });

    await page.route('**/api/schedules/available-slots*', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { availableSlots: [
          { time: '09:00', bookedCount: 0, maxSlots: 2, available: true },
          { time: '09:30', bookedCount: 0, maxSlots: 2, available: true },
          { time: '10:00', bookedCount: 0, maxSlots: 2, available: true },
          { time: '14:00', bookedCount: 0, maxSlots: 2, available: true }
        ], total: 4 } }
      });
    });

    await page.route('**/api/bookings/receptionist', async route => {
      await route.fulfill({
        status: 201,
        json: { data: {
          id: 'booking-123',
          bookingCode: 'B-WALKIN',
          status: 'PENDING'
        } }
      });
    });
  });

  test('should load walk-in booking page without errors', async ({ page }) => {
    await page.goto('/vi/receptionist/walkin-booking');
    
    // Check if main UI elements are visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check that we can type in the phone number to search for patient
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('should show empty state when patient not found', async ({ page }) => {
    await page.route('**/api/users/receptionist/patients*', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { items: [], total: 0 } }
      });
    });

    await page.goto('/vi/receptionist/walkin-booking');
    
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('1111111111');
    await searchInput.press('Enter');

    // Just ensuring we don't crash and we can see something indicating empty
    await expect(page.locator('text=/Không tìm thấy|0/i').first()).toBeVisible();
  });

  test('should successfully complete a walk-in booking with doctor filtering', async ({ page }) => {
    await page.goto('/vi/receptionist/walkin-booking');
    
    // Step 1: Patient Selection
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('0987654321');
    await searchInput.press('Enter');

    // The whole patient card is a group, we can just click the button with 'Chọn' or 'Select'
    const selectPatientBtn = page.locator('button').filter({ hasText: /Chọn|Select/i }).first();
    await expect(selectPatientBtn).toBeVisible();
    await selectPatientBtn.click();

    // Step 2: Doctor Selection
    await expect(page.getByText('Dr. Smith')).toBeVisible();
    
    // Test Doctor Search
    const docSearchInput = page.getByPlaceholder(/Tìm tên bác sĩ/i).first();
    if (await docSearchInput.isVisible()) {
      await docSearchInput.fill('Jones');
      await expect(page.getByText('Dr. Jones')).toBeVisible();
      await expect(page.getByText('Dr. Smith')).toBeHidden();
      // clear search
      await docSearchInput.fill('');
    }

    // Select Doctor by clicking the card (div.group)
    const doctorCard = page.locator('div.group').filter({ hasText: 'Dr. Smith' });
    await doctorCard.click();

    // Step 3: Appointment Time (Walk-in is default)
    // Add symptom notes
    const noteTextarea = page.locator('textarea');
    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Patient has headache');
    }

    // Click Submit Booking
    const submitBtn = page.getByRole('button', { name: /Xác nhận vào hàng chờ|Xác nhận đặt lịch/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify Success Screen
    await expect(page.getByText(/Thành công|Success/i).first()).toBeVisible();
    await expect(page.getByText('B-WALKIN').first()).toBeVisible();
  });

  test('should handle booking API failure gracefully', async ({ page }) => {
    // Override the bookings API to fail
    await page.route('**/api/bookings/receptionist', async route => {
      await route.fulfill({
        status: 500,
        json: { message: 'Internal Server Error' }
      });
    });

    await page.goto('/vi/receptionist/walkin-booking');
    
    // Step 1: Patient Selection
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('0987654321');
    await searchInput.press('Enter');
    
    const selectPatientBtn = page.locator('button').filter({ hasText: /Chọn|Select/i }).first();
    await selectPatientBtn.click();

    // Step 2: Doctor Selection
    await expect(page.getByText('Dr. Smith')).toBeVisible();
    const doctorCard = page.locator('div.group').filter({ hasText: 'Dr. Smith' });
    await doctorCard.click();

    // Step 3: Submit Booking
    const submitBtn = page.getByRole('button', { name: /Xác nhận vào hàng chờ|Xác nhận đặt lịch/i });
    await submitBtn.click();

    // Verify that the success screen is not shown and we are still on the form
    await expect(page.getByText('B-WALKIN').first()).toBeHidden();
    
    // Check that submit button is still available
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('should successfully complete a pre-booking with date and slot selection', async ({ page }) => {
    await page.goto('/vi/receptionist/walkin-booking');
    
    // Step 1: Patient Selection
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('0987654321');
    await searchInput.press('Enter');
    const selectPatientBtn = page.locator('button').filter({ hasText: /Chọn|Select/i }).first();
    await selectPatientBtn.click();

    // Step 2: Doctor Selection
    await expect(page.getByText('Dr. Smith')).toBeVisible();
    const doctorCard = page.locator('div.group').filter({ hasText: 'Dr. Smith' });
    await doctorCard.click();

    // Step 3: Switch to Pre-Booking
    const preBookingBtn = page.locator('button').filter({ hasText: /Đặt trước/i });
    await expect(preBookingBtn).toBeVisible();
    await preBookingBtn.click();

    // The submit button should be disabled because no slot is selected
    const submitBtn = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
    await expect(submitBtn).toBeDisabled();

    // Select a time slot
    const timeSlot = page.locator('button').filter({ hasText: '10:00' }).first();
    await expect(timeSlot).toBeVisible();
    await timeSlot.click();

    // Submit button should now be enabled
    await expect(submitBtn).toBeEnabled();
    
    // Add patient notes
    const noteTextarea = page.locator('textarea').first();
    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Patient needs a general checkup');
    }

    // Submit Booking
    await submitBtn.click();

    // Verify Success Screen
    await expect(page.getByText(/Thành công|Success/i).first()).toBeVisible();
    await expect(page.getByText('B-WALKIN').first()).toBeVisible();
  });

  test('should disable submit if pre-booking slot is not selected', async ({ page }) => {
    await page.goto('/vi/receptionist/walkin-booking');
    
    // Step 1 & 2
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('0987654321');
    await searchInput.press('Enter');
    await page.locator('button').filter({ hasText: /Chọn|Select/i }).first().click();
    await page.locator('div.group').filter({ hasText: 'Dr. Smith' }).click();

    // Step 3: Switch to Pre-Booking
    const preBookingBtn = page.locator('button').filter({ hasText: /Đặt trước/i });
    await preBookingBtn.click();

    // Do NOT select a slot
    const submitBtn = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
    
    // Ensure button is disabled
    await expect(submitBtn).toBeDisabled();
  });

  test('should show empty state when searching for a non-existent doctor', async ({ page }) => {
    await page.goto('/vi/receptionist/walkin-booking');
    
    // Select patient to go to step 2
    const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên, SĐT/i).first();
    await searchInput.fill('0987654321');
    await searchInput.press('Enter');
    await page.locator('button').filter({ hasText: /Chọn|Select/i }).first().click();

    // Search for doctor that doesn't exist
    const docSearchInput = page.getByPlaceholder(/Tìm tên bác sĩ/i).first();
    await docSearchInput.fill('NonExistentDoctorName');
    
    // Verify empty state
    await expect(page.getByText(/Không tìm thấy bác sĩ|No doctors found/i).first()).toBeVisible();
  });
});
