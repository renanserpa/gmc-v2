
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.");
  (process as any).exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Default School for test users
const DEFAULT_SCHOOL_ID = '00000000-0000-0000-0000-000000000001';

const CORE_USERS = [
  { email: 'adm@adm.com', role: 'super_admin', name: 'Super Maestro Root' },
  { email: 'd@adm.com', role: 'manager', name: 'Gestor da Unidade' },
  { email: 'p@adm.com', role: 'professor', name: 'Professor Titular' },
  { email: 'a@adm.com', role: 'student', name: 'Aluno Rockstar' },
  { email: 'r@adm.com', role: 'guardian', name: 'Responsável Atento' }
];

async function seed() {
  console.log("🚀 Iniciando provisionamento crítico de usuários...");

  // 0. Ensure default school exists
  const { error: schoolError } = await supabase
    .from('schools')
    .upsert({
      id: DEFAULT_SCHOOL_ID,
      name: 'Escola Central OlieMusic',
      slug: 'central',
      branding: { primaryColor: '#38bdf8', secondaryColor: '#a78bfa', borderRadius: '24px', logoUrl: null }
    }, { onConflict: 'id' });

  if (schoolError) console.warn("⚠️ Aviso ao criar escola padrão:", schoolError.message);

  for (const user of CORE_USERS) {
    try {
      // 1. Check if user exists in Auth
      let userId: string | undefined;
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) throw listError;
      
      const existingUser = usersData.users.find(u => u.email === user.email);
      
      if (existingUser) {
        userId = existingUser.id;
        console.log(`ℹ️ Usuário ${user.email} já existe no Auth. UUID: ${userId}`);
      } else {
        // 2. Create in Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: '123456',
          email_confirm: true,
          user_metadata: { full_name: user.name, role: user.role }
        });

        if (authError) throw authError;
        userId = authUser.user.id;
        console.log(`✅ Usuário ${user.email} criado com sucesso.`);
      }

      // 3. Upsert in Profiles
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: user.email,
            full_name: user.name,
            role: user.role,
            school_id: DEFAULT_SCHOOL_ID,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) throw profileError;
        console.log(`   └─ Perfil [${user.role}] sincronizado.`);
        
        // 4. Special handling for student role
        if (user.role === 'student') {
          const { error: studentError } = await supabase
            .from('students')
            .upsert({
              auth_user_id: userId,
              name: user.name,
              instrument: 'Guitarra',
              school_id: DEFAULT_SCHOOL_ID,
              xp: 150,
              coins: 15,
              current_level: 2,
              current_streak_days: 1
            }, { onConflict: 'auth_user_id' });
            
          if (studentError) console.warn(`   └─ ⚠️ Erro ao provisionar dados de estudante:`, studentError.message);
          else console.log(`   └─ Dados de estudante provisionados.`);
        }
      }

    } catch (err: any) {
      console.error(`❌ Erro ao processar ${user.email}:`, err.message);
    }
  }

  console.log("\n🏁 Provisionamento de segurança concluído. Todos os usuários podem logar com a senha '123456'.");
}

seed();
