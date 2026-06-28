/**
 * PASTE into your Apps Script project (Bookings sheet).
 *
 * 1. Copy handleUpdateBookingStatusFields_ + helpers below into handleVerifyPayment_
 *    (or alias: handleVerifyPayment_ calls handleUpdateBookingStatusFields_)
 * 2. In doPost:
 *      if (body.action === 'verifyPayment') return handleVerifyPayment_(body);
 * 3. REMOVE any old verifyPayment block that uses fixed columns 9 and 10
 * 4. Deploy → Manage deployments → New version → Deploy
 */

function handleVerifyPayment_(body) {
  return handleUpdateBookingStatusFields_(body);
}

function handleUpdateBookingStatusFields_(body) {
  var bookingId = String(body.bookingId || '').trim();
  if (!bookingId) return errorResponse_('bookingId is required');

  var fields = body.fields || {};
  var bookingStatus = String(
    fields.bookingStatus || body.bookingStatus || 'Confirmed',
  ).trim();
  var paymentStatus = String(
    fields.paymentStatus || body.paymentStatus || 'Paid',
  ).trim();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bookings');
  if (!sheet) return errorResponse_('Sheet not found: Bookings');

  var headersRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idCol1 = findHeaderColumn1Based_(headersRow, ['bookingId', 'bookindId', 'id']);
  var statusCol1 = findHeaderColumn1Based_(headersRow, ['bookingStatus']);
  var paymentCol1 = findHeaderColumn1Based_(headersRow, ['paymentStatus']);

  if (!idCol1) return errorResponse_('bookingId column not found');
  if (!statusCol1 || !paymentCol1) {
    return errorResponse_('bookingStatus / paymentStatus columns not found');
  }

  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idCol1 - 1]).trim() === bookingId) {
      sheet.getRange(r + 1, statusCol1).setValue(bookingStatus);
      sheet.getRange(r + 1, paymentCol1).setValue(paymentStatus);
      return jsonResponse_({
        success: true,
        bookingId: bookingId,
        bookingStatus: bookingStatus,
        paymentStatus: paymentStatus,
        updatedColumns: {
          bookingStatus: statusCol1,
          paymentStatus: paymentCol1,
        },
      });
    }
  }
  return errorResponse_('Booking not found');
}

function findHeaderColumn1Based_(headersRow, aliases) {
  for (var c = 0; c < headersRow.length; c++) {
    var header = normalizeHeaderKey_(headersRow[c]);
    if (!header) continue;
    for (var a = 0; a < aliases.length; a++) {
      if (header === normalizeHeaderKey_(aliases[a])) {
        return c + 1;
      }
    }
  }
  return null;
}

function normalizeHeaderKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '');
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function errorResponse_(message) {
  return jsonResponse_({ success: false, message: message });
}
