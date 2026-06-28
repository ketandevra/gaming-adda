/**
 * Gaming Adda — Google Apps Script extensions
 *
 * MERGE these handlers into your existing Apps Script project
 * (the one deployed at NEXT_PUBLIC_API_URL).
 *
 * 1. Open Apps Script editor for your spreadsheet
 * 2. Add the cases below to your existing doGet / doPost
 * 3. Deploy → New deployment → Web app → Anyone
 * 4. Update NEXT_PUBLIC_API_URL if the /exec URL changes
 */

const ADMIN_MOBILE = '9636933097';

/** Adjust if your tab names differ */
const TAB = {
  BOOKINGS: 'Bookings',
  USERS: 'Users',
  CONSOLES: 'ConsoleTypes',
};

function isAdminMobile_(mobile) {
  return String(mobile || '').replace(/\D/g, '').slice(-10) === ADMIN_MOBILE;
}

function normalizeMobile_(value) {
  var digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
  if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
  return digits;
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function errorResponse_(message) {
  return jsonResponse_({ success: false, message: message });
}

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function getHeaderMap_(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) map[String(headers[i]).trim()] = i;
  }
  return map;
}

/** Find column index by header name (supports aliases and common typos). */
function resolveHeaderColumn_(headers, aliases) {
  for (var i = 0; i < aliases.length; i++) {
    var idx = headers[aliases[i]];
    if (idx !== undefined) return idx;
  }
  return undefined;
}

function rowToBookingObject_(headers, row) {
  function cell(key) {
    var idx = headers[key];
    if (idx === undefined) return undefined;
    var value = row[idx];
    return value === '' ? undefined : value;
  }

  var bookingIdCol = resolveHeaderColumn_(headers, ['bookingId', 'bookindId', 'id']);

  return {
    bookingId: String(
      (bookingIdCol !== undefined ? row[bookingIdCol] : undefined) ??
        cell('bookingId') ??
        cell('id') ??
        '',
    ),
    customerName: cell('customerName') ?? cell('name') ?? '',
    mobile: normalizeMobile_(cell('mobile') ?? cell('phone') ?? cell('customerPhone')),
    consoleId: cell('consoleId') ?? cell('consoleTypeId'),
    consoleName: cell('consoleName'),
    consoleTypeId: cell('consoleTypeId') ?? cell('consoleId'),
    bookingDate: cell('bookingDate') ?? cell('date'),
    startTime: cell('startTime'),
    endTime: cell('endTime'),
    bookingStatus: cell('bookingStatus'),
    paymentStatus: cell('paymentStatus'),
    utrNumber: cell('utrNumber') ?? cell('utr'),
    totalAmount: cell('totalAmount') ?? cell('amount') ?? cell('price'),
    createdAt: cell('createdAt'),
    expiresAt: cell('expiresAt') ?? cell('expiresAT'),
  };
}

/** GET ?action=getBookings */
function handleGetBookings_() {
  var sheet = getSheet_(TAB.BOOKINGS);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return jsonResponse_([]);

  var headers = getHeaderMap_(sheet);
  var bookings = [];
  for (var r = 1; r < data.length; r++) {
    var booking = rowToBookingObject_(headers, data[r]);
    if (booking.bookingId) bookings.push(booking);
  }
  return jsonResponse_(bookings);
}

/** GET ?action=getUser&mobile=9999999999 */
function handleGetUser_(mobile) {
  var normalized = normalizeMobile_(mobile);
  if (normalized.length !== 10) return jsonResponse_(null);

  var sheet = getSheet_(TAB.USERS);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return jsonResponse_(null);

  var headers = getHeaderMap_(sheet);
  for (var r = 1; r < data.length; r++) {
    var rowMobile = normalizeMobile_(rowToBookingObject_(headers, data[r]).mobile);
    if (rowMobile === normalized) {
      return jsonResponse_({
        name: data[r][headers['name'] ?? headers['customerName'] ?? 0],
        mobile: normalized,
      });
    }
  }
  return jsonResponse_(null);
}

/** POST { action: "login", name, mobile } */
function handleLogin_(body) {
  var name = String(body.name || body.customerName || '').trim();
  var mobile = normalizeMobile_(body.mobile ?? body.phone ?? body.customerPhone);
  if (!name || mobile.length !== 10) {
    return errorResponse_('Name and valid mobile are required');
  }

  var sheet = getSheet_(TAB.USERS);
  var data = sheet.getDataRange().getValues();
  var headers = getHeaderMap_(sheet);
  var nameCol = headers['name'] ?? headers['customerName'] ?? 0;
  var mobileCol = headers['mobile'] ?? headers['phone'] ?? 1;

  for (var r = 1; r < data.length; r++) {
    if (normalizeMobile_(data[r][mobileCol]) === mobile) {
      sheet.getRange(r + 1, nameCol + 1).setValue(name);
      return jsonResponse_({ success: true, name: name, mobile: mobile });
    }
  }

  var newRow = new Array(sheet.getLastColumn()).fill('');
  newRow[nameCol] = name;
  newRow[mobileCol] = mobile;
  sheet.appendRow(newRow);
  return jsonResponse_({ success: true, name: name, mobile: mobile });
}

/** POST { action: "verifyPayment", bookingId, fields: { bookingStatus, paymentStatus } } */
function handleVerifyPayment_(body) {
  return handleUpdateBookingStatusFields_(body);
}

/**
 * Same as verifyPayment — kept for scripts that route updateBookingStatusFields separately.
 * POST { action: "updateBookingStatusFields", bookingId, fields: { ... } }
 */
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

  var sheet = getSheet_(TAB.BOOKINGS);
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

/** @returns 1-based column index for getRange(), or null */
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

/*
 * Add to your doGet(e):
 *
 *   var action = e.parameter.action;
 *   if (action === 'getBookings') return handleGetBookings_();
 *   if (action === 'getUser') return handleGetUser_(e.parameter.mobile);
 *
 * Add to your doPost(e):
 *
 *   var body = JSON.parse(e.postData.contents);
 *   if (body.action === 'login') return handleLogin_(body);
 *   if (body.action === 'verifyPayment') return handleVerifyPayment_(body);
 *   if (body.action === 'updateBookingStatusFields') return handleUpdateBookingStatusFields_(body);
 */
