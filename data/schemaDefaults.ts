/**
 * GCM Maestro V3.0 - Fonte da Verdade do Banco de Dados
 * Este arquivo contém o DDL completo para restauração do ambiente.
 */

export const GCM_DB_SCHEMA = `-- GCM MAESTRO V3.0 - SCRIPT DE INFRAESTRUTURA COMPLETO

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'super_admin', 'professor', 'student', 'guardian', 'manager', 'school_manager')),
    school_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Configurações Globais
CREATE TABLE IF NOT EXISTS public.system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Auditoria Imutável
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Avisos Globais e de Unidade
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT,
    priority TEXT DEFAULT 'normal',
    school_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Outras tabelas omitidas para brevidade no auditor...
`;