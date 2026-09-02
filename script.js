import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('paciente'); // 'paciente' | 'medico'
  const [activeSection, setActiveSection] = useState('medicoes'); // 'medicoes' | 'remedios' | 'educativo'
  
  // Form states
  const [glicemia, setGlicemia] = useState('');
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  
  // Data states
  const [historico, setHistorico] = useState([]);
  const [medicamentos, setMedicamentos] = useState([
    { id: '1', nome: 'Losartana 50mg', horario: '08:00', tomado: true },
    { id: '2', nome: 'Metformina 850mg', horario: '12:00', tomado: false },
  ]);

  // Carregar dados salvos
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem('@vida_recife_medicoes');
      if (dadosSalvos) setHistorico(JSON.parse(dadosSalvos));
    } catch (e) {
      console.error('Erro ao carregar dados', e);
    }
  };

  const salvarMedicao = async () => {
    if (!glicemia && (!sistolica || !diastolica)) {
      alert('Preencha ao menos a glicemia ou a pressão arterial.');
      return;
    }

    const novaMedicao = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      glicemia: glicemia ? Number(glicemia) : null,
      sistolica: sistolica ? Number(sistolica) : null,
      diastolica: diastolica ? Number(diastolica) : null,
      alerta: (glicemia > 180 || sistolica > 140 || diastolica > 90),
    };

    const novoHistorico = [novaMedicao, ...historico];
    setHistorico(novoHistorico);

    try {
      await AsyncStorage.setItem('@vida_recife_medicoes', JSON.stringify(novoHistorico));
      setGlicemia('');
      setSistolica('');
      setDiastolica('');
      alert('Registro salvo com sucesso!');
    } catch (e) {
      alert('Erro ao salvar os dados.');
    }
  };

  const toggleMedicamento = (id) => {
    setMedicamentos(medicamentos.map(med => 
      med.id === id ? { ...med, tomado: !med.tomado } : med
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />

      {/* Header do App */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vida+ Recife</Text>
          <Text style={styles.headerSubtitle}>"Cuidar hoje para viver melhor amanhã."</Text>
        </View>
        <View style={styles.odsBadge}>
          <Text style={styles.odsText}>ODS 3</Text>
        </View>
      </View>

      {/* Seletor de Perfil (Paciente vs Profissional) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'paciente' && styles.tabActive]}
          onPress={() => setActiveTab('paciente')}>
          <Text style={[styles.tabText, activeTab === 'paciente' && styles.tabTextActive]}>
            Área do Paciente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'medico' && styles.tabActive]}
          onPress={() => setActiveTab('medico')}>
          <Text style={[styles.tabText, activeTab === 'medico' && styles.tabTextActive]}>
            Painel Saúde (UBS)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'paciente' ? (
          <>
            {/* Navegação Secundária Paciente */}
            <View style={styles.subTabBar}>
              <TouchableOpacity 
                style={[styles.subTab, activeSection === 'medicoes' && styles.subTabActive]}
                onPress={() => setActiveSection('medicoes')}>
                <Text style={styles.subTabText}>Registro</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.subTab, activeSection === 'remedios' && styles.subTabActive]}
                onPress={() => setActiveSection('remedios')}>
                <Text style={styles.subTabText}>Remédios</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.subTab, activeSection === 'educativo' && styles.subTabActive]}
                onPress={() => setActiveSection('educativo')}>
                <Text style={styles.subTabText}>Química & Saúde</Text>
              </TouchableOpacity>
            </View>

            {activeSection === 'medicoes' && (
              <View>
                {/* Form Registro */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Novo Registro de Saúde</Text>
                  
                  <Text style={styles.label}>Glicemia (mg/dL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 105"
                    keyboardType="numeric"
                    value={glicemia}
                    onChangeText={setGlicemia}
                  />

                  <Text style={styles.label}>Pressão Arterial (PAS / PAD)</Text>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.flex1, { marginRight: 8 }]}
                      placeholder="Sistólica (120)"
                      keyboardType="numeric"
                      value={sistolica}
                      onChangeText={setSistolica}
                    />
                    <TextInput
                      style={[styles.input, styles.flex1]}
                      placeholder="Diastólica (80)"
                      keyboardType="numeric"
                      value={diastolica}
                      onChangeText={setDiastolica}
                    />
                  </View>

                  <TouchableOpacity style={styles.btnPrimary} onPress={salvarMedicao}>
                    <Text style={styles.btnPrimaryText}>Salvar Medição</Text>
                  </TouchableOpacity>
                </View>

                {/* Histórico Recente */}
                <Text style={styles.sectionHeader}>Histórico Recente</Text>
                {historico.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma medição registrada ainda.</Text>
                ) : (
                  historico.map((item) => (
                    <View key={item.id} style={[styles.card, item.alerta && styles.cardAlert]}>
                      <View style={styles.rowSpace}>
                        <Text style={styles.dateText}>{item.data} às {item.hora}</Text>
                        {item.alerta && <Text style={styles.alertTag}>Atenção</Text>}
                      </View>
                      <View style={styles.rowMargin}>
                        {item.glicemia && (
                          <Text style={styles.metricText}>Glicemia: <Text style={styles.bold}>{item.glicemia} mg/dL</Text></Text>
                        )}
                        {item.sistolica && item.diastolica && (
                          <Text style={styles.metricText}>Pressão: <Text style={styles.bold}>{item.sistolica}/{item.diastolica} mmHg</Text></Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeSection === 'remedios' && (
              <View>
                <Text style={styles.sectionHeader}>Minha Medicação Hoje</Text>
                {medicamentos.map((med) => (
                  <TouchableOpacity 
                    key={med.id} 
                    style={[styles.card, styles.rowSpace]}
                    onPress={() => toggleMedicamento(med.id)}>
                    <View>
                      <Text style={styles.medName}>{med.nome}</Text>
                      <Text style={styles.medTime}>Horário: {med.horario}</Text>
                    </View>
                    <View style={[styles.checkbox, med.tomado && styles.checkboxChecked]}>
                      <Text style={styles.checkboxText}>{med.tomado ? '✓' : ''}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeSection === 'educativo' && (
              <View>
                <Text style={styles.sectionHeader}>Entendendo a Química do Seu Corpo</Text>
                
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Glicose e Metabolismo</Text>
                  <Text style={styles.cardBody}>
                    A glicose ($C_6H_{12}O_6$) é a principal fonte de energia. A insulina atua como uma chave química permitindo a entrada da glicose nas células. Evite picos de açúcar no sangue.
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Sódio e Pressão Arterial</Text>
                  <Text style={styles.cardBody}>
                    O excesso de Cloreto de Sódio ($NaCl$) retém água no vaso sanguíneo por osmose, aumentando o volume de sangue e elevando a pressão arterial.
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          /* Visão do Profissional / UBS */
          <View>
            <Text style={styles.sectionHeader}>Painel de Monitoramento (Atenção Básica)</Text>
            
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.statNumber}>{historico.length}</Text>
                <Text style={styles.statLabel}>Registros</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FFEBEE' }]}>
                <Text style={[styles.statNumber, { color: '#C62828' }]}>
                  {historico.filter(h => h.alerta).length}
                </Text>
                <Text style={styles.statLabel}>Alertas</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Alertas de Risco Recentes</Text>
            {historico.filter(h => h.alerta).length === 0 ? (
              <Text style={styles.emptyText}>Nenhum paciente em situação de risco registrada.</Text>
            ) : (
              historico.filter(h => h.alerta).map((item) => (
                <View key={item.id} style={[styles.card, styles.cardAlert]}>
                  <Text style={styles.alertPatient}>Paciente: Maria da Silva (CPF: ***.458.114-**)</Text>
                  <Text style={styles.alertDetail}>
                    Glicemia/PA alterada registrada em {item.data} às {item.hora}
                  </Text>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => alert('Encaminhado para busca ativa da UBS.')}>
                    <Text style={styles.btnSecondaryText}>Solicitar Busca Ativa</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: '#0066CC',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  odsBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  odsText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', elevation: 2 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#0066CC' },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#0066CC', fontWeight: 'bold' },

  subTabBar: { flexDirection: 'row', marginVertical: 10, paddingHorizontal: 15 },
  subTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E0E0E0', marginRight: 8 },
  subTabActive: { backgroundColor: '#0066CC' },
  subTabText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  content: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 8, padding: 15, marginBottom: 12, elevation: 1 },
  cardAlert: { borderLeftWidth: 4, borderLeftColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  cardBody: { fontSize: 13, color: '#555', lineHeight: 18 },
  
  label: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowMargin: { marginTop: 8 },
  flex1: { flex: 1 },

  btnPrimary: { backgroundColor: '#0066CC', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  btnPrimaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnSecondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D32F2F', padding: 8, borderRadius: 4, marginTop: 8, alignItems: 'center' },
  btnSecondaryText: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },

  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginVertical: 10 },
  dateText: { fontSize: 12, color: '#888' },
  metricText: { fontSize: 14, color: '#444' },
  bold: { fontWeight: 'bold', color: '#000' },
  alertTag: { backgroundColor: '#D32F2F', color: '#FFF', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
  emptyText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 15 },

  medName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  medTime: { fontSize: 12, color: '#666' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#0066CC', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#0066CC' },
  checkboxText: { color: '#FFF', fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { flex: 0.48, padding: 15, borderRadius: 8, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#0066CC' },
  statLabel: { fontSize: 12, color: '#555' },
  alertPatient: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  alertDetail: { fontSize: 12, color: '#666', marginTop: 2 },
});