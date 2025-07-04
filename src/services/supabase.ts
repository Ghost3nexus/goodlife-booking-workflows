import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';
import { Reservation, User, Payment } from '../types';

export class SupabaseService {
  private client;
  private serviceClient;

  constructor() {
    this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    this.serviceClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.serviceClient
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByLineUid(line_uid: string): Promise<User | null> {
    const { data, error } = await this.serviceClient
      .from('users')
      .select('*')
      .eq('line_uid', line_uid)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createReservationWithLock(
    reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Reservation> {
    const { data, error } = await this.serviceClient.rpc('create_reservation_with_lock', {
      p_user_id: reservationData.user_id,
      p_event_id: reservationData.event_id,
      p_status: reservationData.status,
      p_paid: reservationData.paid,
      p_transaction_id: reservationData.transaction_id
    });

    if (error) throw error;
    return data;
  }

  async updateReservationStatus(id: string, status: string): Promise<Reservation> {
    const { data, error } = await this.serviceClient
      .from('reservations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await this.serviceClient
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePaymentStatus(transaction_id: string, status: string): Promise<Payment> {
    const { data, error } = await this.serviceClient
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('transaction_id', transaction_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReservationsByEventId(event_id: string): Promise<Reservation[]> {
    const { data, error } = await this.serviceClient
      .from('reservations')
      .select('*')
      .eq('event_id', event_id)
      .neq('status', 'cancelled');

    if (error) throw error;
    return data || [];
  }
}
