export const DEFAULT_STAFF = [
  { id: "u1", name: "Isabel", role: "Owner", capacityHours: 40 },
  { id: "u2", name: "Maria S.", role: "Seamstress", capacityHours: 30 },
  { id: "u3", name: "Elena V.", role: "Consultant", capacityHours: 25 },
  { id: "u4", name: "Sofia G.", role: "Event Planner", capacityHours: 35 },
];

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  capacityHours: number;
};
