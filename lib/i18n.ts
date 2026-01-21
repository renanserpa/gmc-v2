import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      'pt-BR': {
        translation: {
          login: {
            title: 'Acessar Plataforma',
            description: 'Entre com suas credenciais de acesso.',
            email_placeholder: 'seu@email.com',
            password_placeholder: '••••••••',
            button: 'Entrar',
            loading: 'Autenticando...',
            success: 'Login realizado com sucesso!',
            error: 'Falha ao fazer login. Verifique suas credenciais.',
            back: 'Voltar para seleção de perfis'
          },
          dashboard: {
            welcome: 'Bem-vindo',
            loading: 'Carregando dados...',
            logout_success: 'Você saiu com sucesso.'
          }
        }
      },
      'en': {
        translation: {
          login: {
            title: 'Access Platform',
            description: 'Enter your credentials.',
            email_placeholder: 'you@email.com',
            password_placeholder: '••••••••',
            button: 'Sign In',
            loading: 'Authenticating...',
            success: 'Login successful!',
            error: 'Login failed. Check your credentials.',
            back: 'Back to profile selection'
          },
          dashboard: {
            welcome: 'Welcome',
            loading: 'Loading data...',
            logout_success: 'Logged out successfully.'
          }
        }
      }
    }
  });

export default i18n;