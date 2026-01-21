import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilitySettings } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  dyslexicFont: false,
  highContrast: false,
  colorBlindMode: 'none',
  reducedMotion: false,
  uiMode: 'standard'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children?: ReactNode }) => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const local = localStorage.getItem('maestro_a11y');
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  });

  // Sincroniza com o perfil do banco quando logado
  useEffect(() => {
    if (profile?.accessibility_settings) {
      setSettings(profile.accessibility_settings);
    }
  }, [profile]);

  // Aplica classes no Body para CSS global
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('font-dyslexic', settings.dyslexicFont);
    body.classList.toggle('high-contrast', settings.highContrast);
    body.classList.toggle('reduced-motion', settings.reducedMotion);
    body.classList.toggle('ui-kids', settings.uiMode === 'kids');
    
    // Filtros de Daltonismo
    body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
    if (settings.colorBlindMode !== 'none') {
        body.classList.add(`cb-${settings.colorBlindMode}`);
    }

    localStorage.setItem('maestro_a11y', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (user) {
        await supabase.from('profiles').update({ 
            accessibility_settings: updated 
        }).eq('id', user.id);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider');
  return context;
};
