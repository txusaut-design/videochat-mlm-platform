-- VideoChat MLM Platform Database Schema

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    referrer_id UUID REFERENCES users(id),
    membership_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos adicionales de perfil
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT
);

-- Tabla para el árbol genealógico MLM
CREATE TABLE mlm_tree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES users(id),
    level INTEGER NOT NULL DEFAULT 1,
    path TEXT NOT NULL, -- Ruta completa en el árbol (ej: "1.2.3.4.5")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Tabla de salas de videochat
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    topic VARCHAR(200),
    creator_id UUID NOT NULL REFERENCES users(id),
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT false,
    password_hash VARCHAR(255), -- Para salas privadas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de participantes en salas
CREATE TABLE room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(room_id, user_id, joined_at)
);

-- Tabla de transacciones de membresía
CREATE TABLE membership_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_hash VARCHAR(66) UNIQUE NOT NULL, -- Hash de la transacción en Polygon
    amount DECIMAL(18,6) NOT NULL, -- Cantidad en USDC (18 decimales)
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    block_number BIGINT,
    block_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    membership_days INTEGER DEFAULT 28,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de comisiones MLM
CREATE TABLE mlm_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES membership_transactions(id),
    beneficiary_id UUID NOT NULL REFERENCES users(id), -- Usuario que recibe la comisión
    payer_id UUID NOT NULL REFERENCES users(id), -- Usuario que pagó la membresía
    level INTEGER NOT NULL, -- Nivel en el MLM (1-5)
    amount DECIMAL(18,6) NOT NULL, -- Cantidad de comisión en USDC
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    paid_at TIMESTAMP,
    transaction_hash VARCHAR(66), -- Hash de la transacción de pago de comisión
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes en salas (opcional, para chat de texto)
CREATE TABLE room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, system, announcement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones del sistema
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_users_referrer ON users(referrer_id);
CREATE INDEX idx_users_membership ON users(membership_expires_at);
CREATE INDEX idx_mlm_tree_parent ON mlm_tree(parent_id);
CREATE INDEX idx_mlm_tree_level ON mlm_tree(level);
CREATE INDEX idx_rooms_creator ON rooms(creator_id);
CREATE INDEX idx_rooms_active ON rooms(is_active);
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
CREATE INDEX idx_room_participants_user ON room_participants(user_id);
CREATE INDEX idx_membership_transactions_user ON membership_transactions(user_id);
CREATE INDEX idx_membership_transactions_status ON membership_transactions(status);
CREATE INDEX idx_mlm_commissions_beneficiary ON mlm_commissions(beneficiary_id);
CREATE INDEX idx_mlm_commissions_transaction ON mlm_commissions(transaction_id);

-- Funciones y triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuraciones iniciales del sistema
INSERT INTO system_config (key, value, description) VALUES
('membership_price_usdc', '10.000000', 'Precio mensual de membresía en USDC'),
('membership_duration_days', '28', 'Duración de membresía en días'),
('mlm_level1_commission', '3.500000', 'Comisión nivel 1 en USDC'),
('mlm_level2_commission', '1.000000', 'Comisión nivel 2 en USDC'),
('mlm_level3_commission', '1.000000', 'Comisión nivel 3 en USDC'),
('mlm_level4_commission', '1.000000', 'Comisión nivel 4 en USDC'),
('mlm_level5_commission', '1.000000', 'Comisión nivel 5 en USDC'),
('max_room_participants', '10', 'Máximo de participantes por sala'),
('usdc_contract_address', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 'Dirección del contrato USDC en Polygon'),
('platform_wallet_address', '', 'Dirección de wallet de la plataforma para recibir pagos');