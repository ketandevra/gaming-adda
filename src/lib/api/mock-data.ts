import type { Booking, GameConsole, TimeSlot } from "@/types";

export const mockConsoles: GameConsole[] = [
  {
    id: "ps5-premium",
    name: "PS5-Premium",
    platform: "playstation",
    description: "4K HDR display, premium seating, DualSense controllers, top titles.",
    hourlyRate: 300,
    maxPlayers: 2,
    isActive: true,
  },
  {
    id: "ps5-standard",
    name: "PS5-Standard",
    platform: "playstation",
    description: "PS5 console with controller, great for casual gaming sessions.",
    hourlyRate: 250,
    maxPlayers: 2,
    isActive: true,
  },
  {
    id: "8-ball-pool",
    name: "8 Ball Pool",
    platform: "other",
    description: "Full-size pool table with cues and balls — perfect for friendly matches.",
    hourlyRate: 200,
    maxPlayers: 4,
    isActive: true,
  },
  {
    id: "air-hockey",
    name: "Air Hockey",
    platform: "other",
    description: "Fast-paced air hockey table with paddles and puck.",
    hourlyRate: 180,
    maxPlayers: 2,
    isActive: true,
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    platform: "other",
    description: "Ping pong table with paddles and balls for singles or doubles.",
    hourlyRate: 180,
    maxPlayers: 4,
    isActive: true,
  },
  {
    id: "foosball",
    name: "Foosball",
    platform: "other",
    description: "Classic table football — great for quick competitive games.",
    hourlyRate: 150,
    maxPlayers: 4,
    isActive: true,
  },
];

function nextDateString(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildSlotsForDate(consoleId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const console_ = mockConsoles.find((c) => c.id === consoleId);
  const rate = console_?.hourlyRate ?? 200;

  for (let hour = 10; hour < 24; hour++) {
    const start = `${date}T${String(hour).padStart(2, "0")}:00:00`;
    const end =
      hour === 23
        ? `${nextDateString(date)}T00:00:00`
        : `${date}T${String(hour + 1).padStart(2, "0")}:00:00`;
    const booked = (hour + consoleId.length) % 5 === 0;

    slots.push({
      id: `${consoleId}-${date}-${hour}`,
      consoleId,
      startTime: start,
      endTime: end,
      isAvailable: !booked,
      price: rate,
    });
  }

  return slots;
}

const mockBookingsStore: Booking[] = [];

export function getMockSlots(consoleId: string, date: string): TimeSlot[] {
  return buildSlotsForDate(consoleId, date);
}

export function getMockConsoles(): GameConsole[] {
  return mockConsoles.filter((c) => c.isActive);
}

export function getMockConsole(id: string): GameConsole | undefined {
  return mockConsoles.find((c) => c.id === id);
}

export function createMockBooking(
  payload: Omit<Booking, "id" | "createdAt" | "status">,
): Booking {
  const booking: Booking = {
    ...payload,
    id: `bk-${Date.now()}`,
    bookingStatus: payload.bookingStatus ?? "Confirmed",
    paymentStatus: payload.paymentStatus ?? "Pending",
    expiresAt:
      payload.expiresAt ??
      new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  mockBookingsStore.unshift(booking);
  return booking;
}

export function getMockBookingsByContact(
  email?: string,
  phone?: string,
): Booking[] {
  if (!email && !phone) return [];
  return mockBookingsStore.filter(
    (b) =>
      (email &&
        b.customerEmail?.toLowerCase() === email.toLowerCase()) ||
      (phone &&
        b.customerPhone?.replace(/\D/g, "") === phone.replace(/\D/g, "")),
  );
}

export function getMockBooking(id: string): Booking | undefined {
  return mockBookingsStore.find((b) => b.id === id);
}

export function getAllMockBookings(): Booking[] {
  return [...mockBookingsStore];
}

export function verifyMockBookingPayment(bookingId: string): Booking | null {
  const booking = getMockBooking(bookingId);
  if (!booking) return null;
  booking.bookingStatus = "Confirmed";
  booking.paymentStatus = "Paid";
  booking.status = "confirmed";
  return booking;
}

function tomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ensureMockAdminSampleBookings(): void {
  if (mockBookingsStore.length > 0) return;

  const date = tomorrowDateString();

  createMockBooking({
    consoleId: "ps5-premium",
    consoleName: "PS5-Premium",
    slotId: `ps5-premium-${date}-18`,
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    customerEmail: "9876543210@gaming-adda.local",
    bookingDate: date,
    startTime: "18:00",
    endTime: "19:00",
    totalAmount: 300,
    bookingStatus: "Reserved",
    paymentStatus: "Utr Submitted",
    utrNumber: "123456789012",
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  createMockBooking({
    consoleId: "ps5-standard",
    consoleName: "PS5-Standard",
    slotId: `ps5-standard-${date}-20`,
    customerName: "Priya Patel",
    customerPhone: "9123456789",
    customerEmail: "9123456789@gaming-adda.local",
    bookingDate: date,
    startTime: "20:00",
    endTime: "21:00",
    totalAmount: 250,
    bookingStatus: "Reserved",
    paymentStatus: "Pending",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  createMockBooking({
    consoleId: "8-ball-pool",
    consoleName: "8 Ball Pool",
    slotId: `8-ball-pool-${date}-16`,
    customerName: "Amit Kumar",
    customerPhone: "9988776655",
    customerEmail: "9988776655@gaming-adda.local",
    bookingDate: date,
    startTime: "16:00",
    endTime: "17:00",
    totalAmount: 200,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
  });

  createMockBooking({
    consoleId: "air-hockey",
    consoleName: "Air Hockey",
    slotId: `air-hockey-${date}-14`,
    customerName: "Sneha Reddy",
    customerPhone: "9111222333",
    customerEmail: "9111222333@gaming-adda.local",
    bookingDate: date,
    startTime: "14:00",
    endTime: "15:00",
    totalAmount: 180,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
  });
}
