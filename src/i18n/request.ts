import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [
    common, landing, auth, doctors, validation, booking, services, errors,
    // Admin
    adminLayout, adminOverview, adminUsers, adminDoctors, adminPatients,
    adminCategories, adminServices, adminSchedules, adminInvoices,
    adminAnalytics, adminSettings, adminRooms, adminRevenueReport, adminMedicines,
    // Doctor
    doctorLayout, doctorWorkspace, doctorPatients, doctorSchedule, doctorSettings,
    // Receptionist
    receptionistLayout, receptionistOverview, receptionistCheckIn,
    receptionistQueue, receptionistPatients, receptionistWalkinBooking,
    receptionistBilling, receptionistLabs, receptionistReports, receptionistSettings,
    // Patient
    patientOverview,
    // Shared
    emr, technicianWorklist, chat,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/landing.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/doctors.json`),
    import(`../../messages/${locale}/validation.json`),
    import(`../../messages/${locale}/booking.json`),
    import(`../../messages/${locale}/services.json`),
    import(`../../messages/${locale}/errors.json`),
    // Admin
    import(`../../messages/${locale}/admin/layout.json`),
    import(`../../messages/${locale}/admin/overview.json`),
    import(`../../messages/${locale}/admin/users.json`),
    import(`../../messages/${locale}/admin/doctors.json`),
    import(`../../messages/${locale}/admin/patients.json`),
    import(`../../messages/${locale}/admin/categories.json`),
    import(`../../messages/${locale}/admin/services.json`),
    import(`../../messages/${locale}/admin/schedules.json`),
    import(`../../messages/${locale}/admin/invoices.json`),
    import(`../../messages/${locale}/admin/analytics.json`),
    import(`../../messages/${locale}/admin/settings.json`),
    import(`../../messages/${locale}/admin/rooms.json`),
    import(`../../messages/${locale}/admin/revenue-report.json`),
    import(`../../messages/${locale}/admin/medicines.json`),
    // Doctor
    import(`../../messages/${locale}/doctor/layout.json`),
    import(`../../messages/${locale}/doctor/workspace.json`),
    import(`../../messages/${locale}/doctor/patients.json`),
    import(`../../messages/${locale}/doctor/schedule.json`),
    import(`../../messages/${locale}/doctor/settings.json`),
    // Receptionist
    import(`../../messages/${locale}/receptionist/layout.json`),
    import(`../../messages/${locale}/receptionist/overview.json`),
    import(`../../messages/${locale}/receptionist/check-in.json`),
    import(`../../messages/${locale}/receptionist/queue.json`),
    import(`../../messages/${locale}/receptionist/patients.json`),
    import(`../../messages/${locale}/receptionist/walkin-booking.json`),
    import(`../../messages/${locale}/receptionist/billing.json`),
    import(`../../messages/${locale}/receptionist/labs.json`),
    import(`../../messages/${locale}/receptionist/reports.json`),
    import(`../../messages/${locale}/receptionist/settings.json`),
    // Patient
    import(`../../messages/${locale}/patient/overview.json`),
    // Shared
    import(`../../messages/${locale}/emr/index.json`),
    import(`../../messages/${locale}/technician/worklist.json`),
    import(`../../messages/${locale}/chat.json`),
  ]);

  return {
    locale,
    messages: {
      // Core
      common: common.default,
      landing: landing.default,
      auth: auth.default,
      doctors: doctors.default,
      validation: validation.default,
      booking: booking.default,
      services: services.default,
      errors: errors.default,
      // Admin
      adminLayout: adminLayout.default,
      adminOverview: adminOverview.default,
      adminUsers: adminUsers.default,
      adminDoctors: adminDoctors.default,
      adminPatients: adminPatients.default,
      adminCategories: adminCategories.default,
      adminServices: adminServices.default,
      adminSchedules: adminSchedules.default,
      adminInvoices: adminInvoices.default,
      adminAnalytics: adminAnalytics.default,
      adminSettings: adminSettings.default,
      adminRooms: adminRooms.default,
      adminRevenueReport: adminRevenueReport.default,
      adminMedicines: adminMedicines.default,
      // Doctor
      doctorLayout: doctorLayout.default,
      doctorWorkspace: doctorWorkspace.default,
      doctorPatients: doctorPatients.default,
      doctorSchedule: doctorSchedule.default,
      doctorSettings: doctorSettings.default,
      // Receptionist
      receptionistLayout: receptionistLayout.default,
      receptionistOverview: receptionistOverview.default,
      receptionistCheckIn: receptionistCheckIn.default,
      receptionistQueue: receptionistQueue.default,
      receptionistPatients: receptionistPatients.default,
      receptionistWalkinBooking: receptionistWalkinBooking.default,
      receptionistBilling: receptionistBilling.default,
      receptionistLabs: receptionistLabs.default,
      receptionistReports: receptionistReports.default,
      receptionistSettings: receptionistSettings.default,
      // Patient
      patientOverview: patientOverview.default,
      // Shared
      emr: emr.default,
      technicianWorklist: technicianWorklist.default,
      chat: chat.default,
    }
  };
});
