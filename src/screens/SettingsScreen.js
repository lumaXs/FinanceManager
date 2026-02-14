/**
 * SettingsScreen - Configurações
 * Tela de configurações e opções do aplicativo
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
    Linking,
    Share,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ScreenContainer } from '../components/ScreenContainer';
import { ACCOUNT_TYPES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import storageService from '../services/storageService';

export function SettingsScreen() {
    const { theme, toggleTheme, isDark, isLoading } = useTheme();
    const [accountType, setAccountType] = useState(ACCOUNT_TYPES.PERSONAL);
    const [notifications, setNotifications] = useState(true);
    const [biometry, setBiometry] = useState(false);
    const [biometryAvailable, setBiometryAvailable] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    // Carregar configurações salvas
    useEffect(() => {
        loadSettings();
        checkBiometry();
    }, []);

    const checkBiometry = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setBiometryAvailable(compatible && enrolled);
        } catch (error) {
            console.log('Erro ao verificar biometria:', error);
            setBiometryAvailable(false);
        }
    };

    const loadSettings = async () => {
        try {
            setLoadingSettings(true);

            // Carregar tipo de conta
            const savedAccountType = await storageService.getAccountType();
            if (savedAccountType) {
                setAccountType(savedAccountType);
            }

            // Carregar configuração de notificações
            const savedNotifications = await storageService.get('settings_notifications');
            if (savedNotifications !== null) {
                setNotifications(savedNotifications === 'true');
            }

            // Carregar configuração de biometria
            const savedBiometry = await storageService.get('settings_biometry');
            if (savedBiometry !== null) {
                setBiometry(savedBiometry === 'true');
            }
        } catch (error) {
            console.log('Erro ao carregar configurações:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    // Aguardar carregamento do tema e configurações
    if (isLoading || loadingSettings) {
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

    const handleNotificationsToggle = async (value) => {
        setNotifications(value);
        await storageService.set('settings_notifications', value.toString());

        if (value) {
            Alert.alert(
                'Notificações Ativadas',
                'Você receberá lembretes sobre suas transações e metas.'
            );
        }
    };

    const handleBiometryToggle = async (value) => {
        if (value && !biometryAvailable) {
            Alert.alert(
                'Biometria Indisponível',
                'Seu dispositivo não possui biometria configurada ou não é compatível.'
            );
            return;
        }

        if (value) {
            // Testar autenticação antes de ativar
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Autentique para ativar a proteção biométrica',
                    fallbackLabel: 'Usar senha',
                    cancelLabel: 'Cancelar',
                });

                if (result.success) {
                    setBiometry(true);
                    await storageService.set('settings_biometry', 'true');
                    Alert.alert(
                        'Biometria Ativada',
                        'O app agora está protegido com biometria.'
                    );
                } else {
                    Alert.alert('Autenticação Cancelada', 'A biometria não foi ativada.');
                }
            } catch (error) {
                console.log('Erro na autenticação:', error);
                Alert.alert('Erro', 'Não foi possível ativar a biometria.');
            }
        } else {
            setBiometry(false);
            await storageService.set('settings_biometry', 'false');
            Alert.alert('Biometria Desativada', 'A proteção biométrica foi removida.');
        }
    };

    const handleExportData = async () => {
        Alert.alert(
            'Exportar Dados',
            'Deseja exportar todas as suas transações em formato JSON?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Exportar',
                    onPress: async () => {
                        try {
                            // Mostrar loading
                            Alert.alert('Exportando...', 'Preparando seus dados...');

                            // Pegar todos os dados
                            const data = await storageService.exportData();

                            // Criar arquivo JSON
                            const fileName = `finance-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
                            const fileUri = FileSystem.documentDirectory + fileName;

                            await FileSystem.writeAsStringAsync(
                                fileUri,
                                JSON.stringify(data, null, 2)
                            );

                            // Verificar se pode compartilhar
                            const canShare = await Sharing.isAvailableAsync();

                            if (canShare) {
                                await Sharing.shareAsync(fileUri, {
                                    mimeType: 'application/json',
                                    dialogTitle: 'Exportar dados do Finance Manager',
                                });
                            } else {
                                Alert.alert(
                                    'Dados Exportados',
                                    `Arquivo salvo em: ${fileUri}`
                                );
                            }
                        } catch (error) {
                            console.log('Erro ao exportar:', error);
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
                            Alert.alert(
                                'Sucesso',
                                'Todos os dados foram removidos. O app será reiniciado.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Recarregar as configurações
                                            loadSettings();
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível limpar os dados');
                        }
                    },
                },
            ]
        );
    };

    const handleOpenGitHub = () => {
        Alert.alert(
            'Finance Manager',
            'Este é um projeto open source. Quer ver o código no GitHub?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Abrir GitHub',
                    onPress: () => {
                        Linking.openURL('https://github.com/lumaXs/FinanceManager');
                    }
                }
            ]
        );
    };

    const handleRateApp = () => {
        const storeUrl = Platform.select({
            ios: 'https://apps.apple.com/app/id123456789', // Substituir com ID real
            android: 'https://play.google.com/store/apps/details?id=com.financemanager', // Substituir com ID real
        });

        Alert.alert(
            'Avaliar App',
            'Sua avaliação é muito importante para nós! Deseja avaliar o Finance Manager?',
            [
                { text: 'Mais Tarde', style: 'cancel' },
                {
                    text: 'Avaliar',
                    onPress: () => {
                        if (storeUrl) {
                            Linking.openURL(storeUrl);
                        } else {
                            Alert.alert('Em breve!', 'O app ainda não está publicado nas lojas.');
                        }
                    }
                }
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
                            notifications ? 'Ativadas' : 'Desativadas',
                            null,
                            <Switch
                                value={notifications}
                                onValueChange={handleNotificationsToggle}
                                trackColor={{ false: safeTheme.textMuted, true: safeTheme.primary }}
                                thumbColor={safeTheme.white}
                            />
                        )}
                        {renderOption(
                            'fingerprint',
                            'Biometria',
                            biometry ? 'Protegido' : biometryAvailable ? 'Desativado' : 'Indisponível',
                            null,
                            <Switch
                                value={biometry}
                                onValueChange={handleBiometryToggle}
                                disabled={!biometryAvailable}
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
                        {renderOption('github', 'Open Source', 'Veja no GitHub', handleOpenGitHub)}
                        {renderOption('heart', 'Avaliar App', 'Deixe sua avaliação', handleRateApp)}
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

