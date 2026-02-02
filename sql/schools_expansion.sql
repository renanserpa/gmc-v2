-- GCM MAESTRO - EXPANSÃO DO SCHEMA DE ESCOLAS (SPRINT 1.1)

ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS fee_per_student DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS contact_manager TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Adiciona comentário para documentação do DB
COMMENT ON COLUMN public.schools.contract_status IS 'Status do contrato: trial, active, suspended, canceled';
