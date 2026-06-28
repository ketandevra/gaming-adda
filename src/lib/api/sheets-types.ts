/** Raw shapes returned by the Google Apps Script API */

export interface SheetsConsoleType {
  id: number;
  name: string;
  pricePerHour: number;
}

export interface SheetsAvailableSlot {
  startTime: string;
  endTime: string;
  totalConsoles: number;
  bookedConsoles: number;
  remaining: number;
  available: boolean;
}

export interface SheetsErrorResponse {
  success: false;
  message: string;
}

export interface SheetsBooking {
  id?: number | string;
  bookingId?: number | string;
  consoleTypeId?: number;
  consoleId?: number;
  consoleName?: string;
  date?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  customerName?: string;
  name?: string;
  customerEmail?: string;
  email?: string;
  customerPhone?: string;
  mobile?: string;
  phone?: string;
  totalAmount?: number;
  price?: number;
  status?: string;
  bookingStatus?: string;
  booking_status?: string;
  paymentStatus?: string;
  payment_status?: string;
  payment?: string;
  expiresAt?: string;
  expiresAT?: string;
  amount?: number;
  total?: number;
  notes?: string;
  createdAt?: string;
  utrNumber?: string;
  utr?: string;
  transactionReference?: string;
}
