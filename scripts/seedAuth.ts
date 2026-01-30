
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.");
  // Fix: Cast process to any to resolve 'Property exit does not exist on type Process' error
  (process as any).exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const TEST_USERS = [
  { email: 'adm@adm.com', role: 'admin', name: 'Super Admin' },
  { email: 'a@adm.com', role: 'admin', name: 'Admin Root' },
  { email: 'p@adm.com', role: 'professor', name: 'Professor Titular' },
  { email: 'r@adm.com', role: 'guardian', name: 'Responsável' },
  { email: 'g@adm.com', role: 'manager', name: 'Gestor Unidade' }
];

async function seed() {
  console.log("🚀 Iniciando provisionamento Maestro...");

  for (const user of TEST_USERS) {
    try {
      // 1. Criar no Auth (ou pegar se existir)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: '123456',
        email_confirm: true,
        user_metadata: { full_name: user.name, role: user.role }
      });

      let userId;

      if (authError) {
        if (authError.message.includes('already registered')) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const found = existingUsers.users.find(u => u.email === user.email);
          userId = found?.id;
          console.log(`ℹ️ Usuário ${user.email} já existe. UUID: ${userId}`);
        } else {
          throw authError;
        }
      } else {
        userId = authUser.user.id;
        console.log(`✅ Usuário ${user.email} criado com sucesso.`);
      }

      // 2. Upsert no Profile
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: user.email,
            full_name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
        console.log(`   └─ Perfil ${user.role} sincronizado.`);
      }

    } catch (err: any) {
      console.error(`❌ Erro ao processar ${user.email}:`, err.message);
    }
  }

  console.log("\n🏁 Provisionamento concluído.");
}

seed();
