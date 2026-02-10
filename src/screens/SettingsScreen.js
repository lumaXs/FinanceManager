/**
 * SettingsScreen - Configurações
 * Tela de configurações e opções do aplicativo
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { ACCOUNT_TYPES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import storageService from '../services/storageService';

export function SettingsScreen() {
    const { theme, toggleTheme, isDark, isLoading } = useTheme();
    const [accountType, setAccountType] = useState(ACCOUNT_TYPES.PERSONAL);
    const [notifications, setNotifications] = useState(true);
    const [biometry, setBiometry] = useState(false);

    // Aguardar carregamento do tema
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D4FF" />
            </View>
        );
    }

    // Garantir que theme existe
    const safeTheme = theme || {
        background: '#FFFFFF',
        backgroundCard: '#F5F5F5',
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        primary: '#00D4FF',
        white: '#FFFFFF',
    };

    const styles = getStyles(safeTheme);

    const handleAccountTypeChange = async (type) => {
        setAccountType(type);
        await storageService.setAccountType(type);
        Alert.alert(
            'Tipo de Conta Alterado',
            `Agora você está usando o modo ${type === 'personal' ? 'Pessoa Física' : 'Pessoa Jurídica'}`
        );
    };

    const handleExportData = async () => {
        Alert.alert(
            'Exportar Dados',
            'Deseja exportar todas as suas transações?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Exportar',
                    onPress: async () => {
                        try {
                            const data = await storageService.exportData();
                            Alert.alert(
                                'Sucesso',
                                'Dados exportados! Em breve teremos compartilhamento.'
                            );
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível exportar os dados');
                        }
                    },
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Limpar Todos os Dados',
            'Esta ação não pode ser desfeita. Todos os seus dados serão excluídos permanentemente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar Tudo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await storageService.clearAll();
                            Alert.alert('Sucesso', 'Todos os dados foram removidos');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível limpar os dados');
                        }
                    },
                },
            ]
        );
    };

    const renderOption = (icon, title, subtitle, onPress, rightElement) => (
        <TouchableOpacity
            style={[styles.option, { borderBottomColor: safeTheme.backgroundCard + '50' }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[styles.optionIcon, { backgroundColor: safeTheme.primary + '20' }]}>
                <FontAwesome5 name={icon} size={18} color={safeTheme.primary} />
            </View>
            <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: safeTheme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.optionSubtitle, { color: safeTheme.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement || <FontAwesome5 name="chevron-right" size={16} color={safeTheme.textMuted} />}
        </TouchableOpacity>
    );

    const renderSection = (title, children) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: safeTheme.textSecondary }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: safeTheme.backgroundCard }]}>{children}</View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: safeTheme.text }]}>Configurações</Text>
                </View>

                {/* Aparência */}
                {renderSection(
                    'Aparência',
                    <>
                        {renderOption(
                            isDark ? 'moon' : 'sun',
                            'Tema',
                            isDark ? 'Modo Escuro' : 'Modo Claro',
                            toggleTheme,
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: safeTheme.textMuted, true: safeTheme.primary }}
                                thumbColor={safeTheme.white}
                            />
                        )}
                    </>
                )}

                {/* Tipo de Conta */}
                {renderSection(
                    'Tipo de Conta',
                    <>
                        <TouchableOpacity
                            style={[
                                styles.accountTypeButton,
                                { borderBottomColor: safeTheme.backgroundCard + '50' },
                                accountType === ACCOUNT_TYPES.PERSONAL && { backgroundColor: safeTheme.primary, borderBottomWidth: 0 },
                            ]}
                            onPress={() => handleAccountTypeChange(ACCOUNT_TYPES.PERSONAL)}
                        >
                            <FontAwesome5
                                name="user"
                                size={20}
                                color={
                                    accountType === ACCOUNT_TYPES.PERSONAL
                                        ? safeTheme.white
                                        : safeTheme.textSecondary
                                }
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text
                                    style={[
                                        styles.accountTypeTitle,
                                        { color: safeTheme.text },
                                        accountType === ACCOUNT_TYPES.PERSONAL && { color: safeTheme.white },
                                    ]}
                                >
                                    Pessoa Física
                                </Text>
                                <Text
                                    style={[
                                        styles.accountTypeSubtitle,
                                        { color: safeTheme.textSecondary },
                                        accountType === ACCOUNT_TYPES.PERSONAL && { color: safeTheme.white + '90' },
                                    ]}
                                >
                                    Para uso pessoal
                                </Text>
                            </View>
                            {accountType === ACCOUNT_TYPES.PERSONAL && (
                                <FontAwesome5 name="check-circle" size={20} color={safeTheme.white} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.accountTypeButton,
                                { borderBottomColor: safeTheme.backgroundCard + '50' },
                                accountType === ACCOUNT_TYPES.BUSINESS && { backgroundColor: safeTheme.primary, borderBottomWidth: 0 },
                            ]}
                            onPress={() => handleAccountTypeChange(ACCOUNT_TYPES.BUSINESS)}
                        >
                            <FontAwesome5
                                name="briefcase"
                                size={20}
                                color={
                                    accountType === ACCOUNT_TYPES.BUSINESS
                                        ? safeTheme.white
                                        : safeTheme.textSecondary
                                }
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text
                                    style={[
                                        styles.accountTypeTitle,
                                        { color: safeTheme.text },
                                        accountType === ACCOUNT_TYPES.BUSINESS && { color: safeTheme.white },
                                    ]}
                                >
                                    Pessoa Jurídica
                                </Text>
                                <Text
                                    style={[
                                        styles.accountTypeSubtitle,
                                        { color: safeTheme.textSecondary },
                                        accountType === ACCOUNT_TYPES.BUSINESS && { color: safeTheme.white + '90' },
                                    ]}
                                >
                                    Para empresas
                                </Text>
                            </View>
                            {accountType === ACCOUNT_TYPES.BUSINESS && (
                                <FontAwesome5 name="check-circle" size={20} color={safeTheme.white} />
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* Preferências */}
                {renderSection(
                    'Preferências',
                    <>
                        {renderOption(
                            'bell',
                            'Notificações',
                            'Receber lembretes e alertas',
                            null,
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: safeTheme.textMuted, true: safeTheme.primary }}
                                thumbColor={safeTheme.white}
                            />
                        )}
                        {renderOption(
                            'fingerprint',
                            'Biometria',
                            'Proteger com digital ou Face ID',
                            null,
                            <Switch
                                value={biometry}
                                onValueChange={setBiometry}
                                trackColor={{ false: safeTheme.textMuted, true: safeTheme.primary }}
                                thumbColor={safeTheme.white}
                            />
                        )}
                    </>
                )}

                {/* Dados */}
                {renderSection(
                    'Dados',
                    <>
                        {renderOption(
                            'download',
                            'Exportar Dados',
                            'Fazer backup das suas transações',
                            handleExportData
                        )}
                        {renderOption(
                            'trash',
                            'Limpar Dados',
                            'Remover todas as transações',
                            handleClearData
                        )}
                    </>
                )}

                {/* Sobre */}
                {renderSection(
                    'Sobre',
                    <>
                        {renderOption('info-circle', 'Versão', '2.0.0', null, null)}
                        {renderOption('github', 'Open Source', 'Veja no GitHub', () => { })}
                        {renderOption('heart', 'Avaliar App', 'Deixe sua avaliação', () => { })}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContent: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    optionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    accountTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    accountTypeTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    accountTypeSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
});

