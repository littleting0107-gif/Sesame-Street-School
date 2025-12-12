
import { TimeSlotConfig } from './types';

export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sat: 10:00 - 12:00
// Mon-Fri: 13:30 - 20:30 (8:30 PM)
export const TIME_SLOTS: TimeSlotConfig[] = [
  // Saturday AM
  { id: '10:00', label: '10:00', period: 'AM' },
  { id: '10:30', label: '10:30', period: 'AM' },
  { id: '11:00', label: '11:00', period: 'AM' },
  { id: '11:30', label: '11:30', period: 'AM' },
  { id: '12:00', label: '12:00', period: 'AM' }, // Added to complete the range if needed, or stop at 11:30 for 12:00 end
  
  // Mon-Fri PM
  { id: '13:30', label: '13:30', period: 'PM' },
  { id: '14:00', label: '14:00', period: 'PM' },
  { id: '14:30', label: '14:30', period: 'PM' },
  { id: '15:00', label: '15:00', period: 'PM' },
  { id: '15:30', label: '15:30', period: 'PM' },
  { id: '16:00', label: '16:00', period: 'PM' },
  { id: '16:30', label: '16:30', period: 'PM' },
  { id: '17:00', label: '17:00', period: 'PM' },
  { id: '17:30', label: '17:30', period: 'PM' },
  { id: '18:00', label: '18:00', period: 'PM' },
  { id: '18:30', label: '18:30', period: 'PM' },
  { id: '19:00', label: '19:00', period: 'PM' },
  { id: '19:30', label: '19:30', period: 'PM' },
  { id: '20:00', label: '20:00', period: 'PM' },
  { id: '20:30', label: '20:30', period: 'PM' },
];
