import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ScreenContainer = ({ children }) => {
    const { theme } = useTheme();

    // Garantir que theme existe
    const safeTheme = theme || {
        background: '#FFFFFF',
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: safeTheme.background,
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
                }
            ]}
        >
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

