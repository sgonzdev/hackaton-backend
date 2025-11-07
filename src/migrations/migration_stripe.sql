-- Migración para agregar soporte de Stripe a la tabla compra
-- Ejecutar este script si ya tienes la base de datos creada

USE hackaton_db;

-- Agregar campo para almacenar el payment intent ID de Stripe
ALTER TABLE compra ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Agregar índice para búsquedas por payment intent
CREATE INDEX IF NOT EXISTS idx_compra_stripe_payment_intent ON compra(stripe_payment_intent_id);
