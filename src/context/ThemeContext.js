/**
 * ThemeContext - VERSÃO PRODUÇÃO
 * Garante tema disponível IMEDIATAMENTE, antes de qualquer componente
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';

// ⭐ CRÍTICO: Tema padrão FORA do componente (sempre disponível)
const DEFAULT_THEME = COLORS.dark || {
    primary: '#00D4FF',
    primaryDark: '#0099CC',
    secondary: '#7C3AED',
    background: '#0A0A0A',
    backgroundCard: '#141414',
    backgroundModal: '#1A1A1A',
    text: '#EEEEEE',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    success: '#00FF88',
    danger: '#FF4444',
    warning: '#FFB800',
    info: '#00BFFF',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#888888',
    overlay: 'rgba(0,0,0,0.7)',
};

// ⭐ Context com valor padrão SEMPRE presente
const ThemeContext = createContext({
    theme: DEFAULT_THEME,
    themeMode: 'dark',
    activeScheme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
    isDark: true,
    isLoading: false,
});

const THEME_STORAGE_KEY = '@finance_theme_preference';

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();

    // ⭐ Inicia com valor padrão imediatamente (não null, não undefined)
    const [themeMode, setThemeMode] = useState('dark');
    const [isLoading, setIsLoading] = useState(false); // false = não bloqueia

    // Carrega preferência DEPOIS que o app já está rodando
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                setThemeMode(savedTheme);
            }
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
            // Em caso de erro, mantém o padrão 'dark'
        } finally {
            setIsLoading(false);
        }
    };

    const saveThemePreference = async (mode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
        }
    };

    const toggleTheme = async () => {
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newMode);
        await saveThemePreference(newMode);
    };

    const setTheme = async (mode) => {
        if (mode === 'light' || mode === 'dark') {
            setThemeMode(mode);
            await saveThemePreference(mode);
        }
    };

    // Determina qual tema usar
    const getActiveScheme = () => {
        if (themeMode === 'system') {
            return systemScheme || 'dark';
        }
        return themeMode;
    };

    const activeScheme = getActiveScheme();

    // ⭐ SEMPRE retorna um tema válido (com múltiplos fallbacks)
    const theme = COLORS?.[activeScheme] || COLORS?.dark || DEFAULT_THEME;

    const value = {
        theme,
        themeMode,
        activeScheme,
        toggleTheme,
        setTheme,
        isDark: activeScheme === 'dark',
        isLoading,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    // ⭐ Fallback se Context não estiver disponível (importante em produção)
    if (!context || !context.theme) {
        console.warn('useTheme: Context não disponível, usando tema padrão');
        return {
            theme: DEFAULT_THEME,
            themeMode: 'dark',
            activeScheme: 'dark',
            toggleTheme: () => { },
            setTheme: () => { },
            isDark: true,
            isLoading: false,
        };
    }

    return context;
}
