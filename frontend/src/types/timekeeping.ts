/**
 * Timekeeping API Response Types
 */

export type TimekeepingStatus = "CHECK_IN" | "CHECK_OUT";

export interface TimekeepingResponse {
  status: TimekeepingStatus;
  time: string; // ISO date string
  duration?: number; // Hours worked (only for CHECK_OUT)
  message: string;
  timekeeping_id: number;
}

