import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos");
  process.exit(1);
}

// Cliente com Service Role para ignorar RLS e Constraints no momento do seed
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const CORE_USERS = [
  { email: "adm@adm.com", role: "super_admin", name: "Admin Global" },
  { email: "d@adm.com", role: "school_manager", name: "Diretora Lúcia" },
  { email: "p@adm.com", role: "professor", name: "Prof. Renan" },
  { email: "a@adm.com", role: "student", name: "Aluno Enzo" }
];

async function seed() {
  console.log("🛠️ Iniciando Reparo e Provisionamento...");

  for (const user of CORE_USERS) {
    try {
      console.log(`\n📧 Processando: ${user.email}`);

      // 1. Tentar localizar usuário no Auth
      // FIX: Added error handling and explicit typing for find callback to resolve 'never' type error
      const { data: list, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      let authUser = list?.users?.find((u: any) => u.email === user.email);

      if (!authUser) {
        // Criar no Auth se não existir
        const { data: created, error: authErr } = await supabase.auth.admin.createUser({
          email: user.email,
          password: '123456',
          email_confirm: true,
          user_metadata: { full_name: user.name, role: user.role }
        });
        if (authErr) throw authErr;
        authUser = created.user;
        if (!authUser) throw new Error("Falha ao criar usuário Auth");
        console.log(`✅ Auth criado: ${authUser.id}`);
      }

      // 2. Garantir sincronia na tabela Profiles
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: authUser.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (profileErr) {
        if (profileErr.code === '23514') {
          console.error("🚨 Erro de Constraint! Papel inválido enviado ao banco.");
          console.error("Verifique se o SQL de fix_auth_emergency foi executado no Supabase.");
        }
        throw profileErr;
      }
      
      console.log(`✨ Perfil [${user.role}] sincronizado.`);

    } catch (e: any) {
      console.error(`❌ Falha em ${user.email}:`, e.message);
    }
  }

  console.log("\n🏁 Seed Finalizado.");
}

seed();
