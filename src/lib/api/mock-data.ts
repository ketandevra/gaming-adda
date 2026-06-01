import type { Booking, GameConsole, TimeSlot } from "@/types";

export const mockConsoles: GameConsole[] = [
  {
    id: "ps5-1",
    name: "PlayStation 5 Pro Station",
    platform: "playstation",
    description: "4K HDR display, DualSense controllers, top titles pre-installed.",
    hourlyRate: 250,
    maxPlayers: 2,
    isActive: true,
  },
  {
    id: "xbox-1",
    name: "Xbox Series X Lounge",
    platform: "xbox",
    description: "Game Pass Ultimate library, surround sound, comfy seating.",
    hourlyRate: 220,
    maxPlayers: 4,
    isActive: true,
  },
  {
    id: "switch-1",
    name: "Nintendo Switch Party Pod",
    platform: "nintendo",
    description: "Perfect for Mario Kart nights with friends and family.",
    hourlyRate: 180,
    maxPlayers: 4,
    isActive: true,
  },
  {
    id: "pc-1",
    name: "Elite Gaming PC Rig",
    platform: "pc",
    description: "RTX 4080, 240Hz monitor, mechanical keyboard — esports ready.",
    hourlyRate: 300,
    maxPlayers: 1,
    isActive: true,
  },
  {
    id: "vr-1",
    name: "VR Arena",
    platform: "vr",
    description: "Meta Quest 3 with room-scale tracking and premium titles.",
    hourlyRate: 350,
    maxPlayers: 1,
    isActive: true,
  },
];

function buildSlotsForDate(consoleId: string, date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const console_ = mockConsoles.find((c) => c.id === consoleId);
  const rate = console_?.hourlyRate ?? 200;

  for (let hour = 10; hour < 22; hour++) {
    const start = `${date}T${String(hour).padStart(2, "0")}:00:00`;
    const end = `${date}T${String(hour + 1).padStart(2, "0")}:00:00`;
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
