export const ReservationStatus = {
  TENTATIVE: 'tentative',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
} as const;

export interface Reservation {
  id: string;
  user_id: string;
  event_id: string;
  status: typeof ReservationStatus[keyof typeof ReservationStatus];
  paid: boolean;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  line_uid: string;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reservation_id: string;
  transaction_id: string;
  status: typeof PaymentStatus[keyof typeof PaymentStatus];
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  extendedProperties?: {
    private?: {
      capacity?: string;
      current?: string;
    };
  } | null;
}

export interface BookingRequest {
  line_uid: string;
  event_id: string;
  user_name: string;
  user_email?: string;
  user_phone?: string;
}

export interface WorkflowContext {
  reservation?: Reservation;
  user?: User;
  calendar_event?: CalendarEvent;
  payment?: Payment;
  error?: string;
}
