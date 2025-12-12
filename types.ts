
export type SessionPeriod = 'AM' | 'PM';

export type ComputerId = 'A' | 'B' | 'C';

export interface TimeSlotConfig {
  id: string;
  label: string; // e.g., "08:00"
  period: SessionPeriod;
}

// A specific booked slot on a specific date
export interface BookedSlot {
  date: string; // ISO String "YYYY-MM-DD"
  timeId: string;
  computerId: ComputerId;
}

// A student's entire booking record (can contain multiple slots)
export interface StudentBooking {
  id: string;
  name: string;
  studentClass: string;
  bookings: BookedSlot[]; // List of slots booked by this student
  timestamp: number;
}
