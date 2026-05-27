import { Invoice, InvoiceStatus } from '@/lib/api/billing/billing';
import { format } from 'date-fns';

export const printInvoice = (inv: Invoice, t: (key: string) => string) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const itemsHtml = inv.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">${item.itemName}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: right; font-size: 13px; font-family: monospace;">${formatMoney(item.unitPrice)}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: center; font-size: 13px; font-family: monospace;">${item.quantity}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: right; font-weight: bold; font-size: 13px; font-family: monospace;">${formatMoney(item.totalPrice)}</td>
    </tr>
  `
    )
    .join('');

  const formattedDate = format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm');
  const formattedPaidDate = inv.paidAt ? format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm') : '';

  const methodLabel = inv.payments?.[0]?.paymentMethod
    ? t(`receipt.${inv.payments[0].paymentMethod.toLowerCase()}`)
    : '';

  const paidAmount = inv.status === InvoiceStatus.PAID
    ? Number(inv.patientCoPayment || 0)
    : (inv.payments && inv.payments.length > 0
        ? inv.payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0)
        : 0);

  const docHtml = `
    <html>
      <head>
        <title>Invoice - ${inv.invoiceNumber}</title>
        <style>
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #1e293b; 
            margin: 40px; 
            line-height: 1.5;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
          .clinic-info { font-size: 12px; }
          .clinic-name { font-size: 16px; font-weight: 800; color: #1392ec; text-transform: uppercase; margin-bottom: 4px; }
          .clinic-detail { color: #64748b; margin-bottom: 2px; }
          .invoice-meta { text-align: right; font-size: 12px; color: #64748b; }
          .invoice-meta strong { color: #0f172a; }
          .invoice-title { text-align: center; font-size: 20px; font-weight: 900; margin: 30px 0; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; background: #f8fafc; padding: 16px; border-radius: 12px; }
          .info-item { margin-bottom: 8px; }
          .info-item span { color: #64748b; font-weight: 500; }
          .info-item strong { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #f1f5f9; padding: 12px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
          .summary-table { width: 45%; margin-left: auto; margin-bottom: 40px; font-size: 13px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; }
          .summary-total { font-weight: 800; border-top: 2px solid #0f172a; border-bottom: 0; padding-top: 12px; font-size: 16px; color: #1392ec; }
          .footer-signatures { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; page-break-inside: avoid; }
          .signature-box { text-align: center; width: 45%; }
          .signature-title { font-weight: 700; color: #0f172a; }
          .signature-space { height: 100px; }
          @media print {
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-info">
            <div class="clinic-name">${t('receipt.clinicName')}</div>
            <div class="clinic-detail">${t('receipt.clinicAddress')}</div>
            <div class="clinic-detail">${t('receipt.clinicPhone')}</div>
          </div>
          <div class="invoice-meta">
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">#${inv.invoiceNumber}</div>
            <div>Ngày tạo: <strong>${formattedDate}</strong></div>
          </div>
        </div>
        
        <hr style="border: 0; border-top: 2px solid #1392ec; margin-bottom: 20px;" />
        
        <div class="invoice-title">${t('receipt.title')}</div>
        
        <div class="info-grid">
          <div>
            <div class="info-item"><span>${t('receipt.patientName')}:</span> <strong>${inv.booking?.patientProfile?.fullName || ''}</strong></div>
            <div class="info-item"><span>${t('receipt.patientCode')}:</span> <strong>${inv.booking?.patientProfile?.patientCode || '-'}</strong></div>
          </div>
          <div>
            <div class="info-item"><span>${t('receipt.doctor')}:</span> <strong>${inv.booking?.doctor?.fullName || t('unknownDoctor')}</strong></div>
            <div class="info-item"><span>${t('receipt.paymentDate')}:</span> <strong>${formattedPaidDate || '-'}</strong></div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${t('receipt.itemName')}</th>
              <th style="text-align: right; width: 130px;">${t('receipt.price')}</th>
              <th style="text-align: center; width: 60px;">${t('receipt.qty')}</th>
              <th style="text-align: right; width: 130px;">${t('receipt.amount')}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="summary-table">
          <div class="summary-row">
            <span>${t('receipt.subtotal')}:</span>
            <span style="font-family: monospace;">${formatMoney(inv.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>${t('receipt.insuranceCovered')}:</span>
            <span style="font-family: monospace;">${formatMoney(inv.insuranceAmount)}</span>
          </div>
          <div class="summary-row">
            <span>${t('receipt.coPayment')}:</span>
            <span style="font-family: monospace;">${formatMoney(inv.patientCoPayment)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>${t('receipt.paidAmount')}:</span>
            <span style="font-family: monospace;">${formatMoney(paidAmount)}</span>
          </div>
          ${
            inv.status === InvoiceStatus.PAID
              ? `
          <div class="summary-row" style="border-bottom: 0; font-size: 11px; color: #64748b; padding-top: 8px;">
            <span>${t('receipt.paymentMethod')}:</span>
            <strong>${methodLabel}</strong>
          </div>
          `
              : ''
          }
        </div>
        
        <div class="footer-signatures">
          <div class="signature-box">
            <div class="signature-title">${t('receipt.signaturePatient')}</div>
            <div class="signature-space"></div>
          </div>
          <div class="signature-box">
            <div class="signature-title">${t('receipt.signatureStaff')}</div>
            <div class="signature-space"></div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(docHtml);
  printWindow.document.close();
};
