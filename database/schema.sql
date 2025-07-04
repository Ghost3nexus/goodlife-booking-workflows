
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
    paid BOOLEAN DEFAULT FALSE,
    transaction_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'JPY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_line_uid ON users(line_uid);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_event_id ON reservations(event_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all reservations" ON reservations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reservations 
            WHERE reservations.id = payments.reservation_id 
            AND reservations.user_id::text = auth.uid()::text
        )
    );

CREATE OR REPLACE FUNCTION create_reservation_with_lock(
    p_user_id UUID,
    p_event_id TEXT,
    p_status TEXT,
    p_paid BOOLEAN,
    p_transaction_id TEXT DEFAULT NULL
) RETURNS reservations AS $$
DECLARE
    new_reservation reservations;
    current_count INTEGER;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext(p_event_id));
    
    SELECT COUNT(*) INTO current_count
    FROM reservations 
    WHERE event_id = p_event_id 
    AND status != 'cancelled';
    
    INSERT INTO reservations (user_id, event_id, status, paid, transaction_id)
    VALUES (p_user_id, p_event_id, p_status, p_paid, p_transaction_id)
    RETURNING * INTO new_reservation;
    
    RETURN new_reservation;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
