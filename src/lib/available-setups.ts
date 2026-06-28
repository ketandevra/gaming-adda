export interface AvailableSetup {
  id: string;
  label: string;
  color: string;
}

export const availableSetups: AvailableSetup[] = [
  { id: "ps5-premium", label: "PS5-Premium", color: "#4da3ff" },
  { id: "ps5-standard", label: "PS5-Standard", color: "#0070cc" },
  { id: "8-ball-pool", label: "8 Ball Pool", color: "#16a34a" },
  { id: "air-hockey", label: "Air Hockey", color: "#06b6d4" },
  { id: "table-tennis", label: "Table Tennis", color: "#f97316" },
  { id: "foosball", label: "Foosball", color: "#ca8a04" },
];
