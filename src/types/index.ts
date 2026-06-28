export type ConsolePlatform =
  | "playstation"
  | "xbox"
  | "nintendo"
  | "pc"
  | "vr"
  | "other";

export interface GameConsole {
  id: string;
  name: string;
  platform: ConsolePlatform;
  description?: string;
  imageUrl?: string;
  hourlyRate: number;
  maxPlayers: number;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  consoleId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price?: number;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Booking {
  id: string;
  consoleId: string;
  consoleName?: string;
  slotId: string;
  /** All slot ids when booked together */
  slotIds?: string[];
  /** Underlying API booking ids when grouped for display */
  bookingIds?: string[];
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  /** YYYY-MM-DD when provided by API and valid */
  bookingDate?: string;
  startTime: string;
  endTime: string;
  totalAmount?: number;
  /** Raw status from API (`bookingStatus` column) */
  bookingStatus?: string;
  /** Raw payment status from API (`paymentStatus` column) */
  paymentStatus?: string;
  /** ISO datetime — pay & submit UTR before this time */
  expiresAt?: string;
  status: BookingStatus;
  createdAt?: string;
  bookedAt?: string;
  notes?: string;
  utrNumber?: string;
}

export interface SubmitBookingUtrPayload {
  bookingId: string;
  utrNumber: string;
  mobile?: string;
}

export interface VerifyBookingPaymentPayload {
  bookingId: string;
  customerPhone?: string;
}

export interface CreateBookingPayload {
  consoleId: string;
  slotIds: string[];
  customerName: string;
  mobile: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  message?: string;
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}
