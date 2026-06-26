import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import {
  Cloud,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  Activity,
  Flame,
  Flower2,
  Sprout
} from 'lucide-react-native';
import { getAssessment } from './src/api/client';
import { OfflineSyncService } from './src/services/OfflineSyncService';

interface Assessment {
  riskScore: number;
  location: { name: string };
  weather: { temp: number; condition: string };
  airQuality: { aqi: number };
  uvIndex: number;
  pollen: { tree: string; grass: string; weed: string };
  floodRisk: { level: string; description: string };
  soil: { moisture: number; temperature: number };
  wildfire: { status: string; details: string };
  compliance: { status: string; reminders: string[] };
  recommendations: string[];
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      // Default to Ottawa coordinates
      const response = await getAssessment(45.4215, -75.6972);
      setAssessment(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();

    // Initial sync
    OfflineSyncService.syncReports();

    // Periodically try to sync every 5 minutes
    const syncInterval = setInterval(() => {
      OfflineSyncService.syncReports();
    }, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>HERP</Text>
            <Text style={styles.subtitle}>HyperLocal Environmental Risk Platform</Text>
          </View>
          <View style={styles.statusBadge}>
            <Activity size={16} color={error ? "#ef4444" : "#22c55e"} />
            <Text style={styles.statusText}>{error ? "Offline" : "Live"}</Text>
          </View>
        </View>

        {assessment && (
          <>
            {/* Risk Score */}
            <View style={styles.riskCard}>
              <Text style={styles.cardTitle}>Environmental Risk - {assessment.location.name}</Text>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreText}>{assessment.riskScore}</Text>
              </View>
              <Text style={[styles.riskLevel, { color: assessment.riskScore > 50 ? '#ef4444' : '#4ade80' }]}>
                {assessment.riskScore > 50 ? 'High Risk' : 'Low Risk Overall'}
              </Text>
            </View>

            {/* Grid-like layout for panels */}
            <View style={styles.grid}>
              <Panel icon={<Wind color="#60a5fa" />} title="Air Quality" value={assessment.airQuality.aqi > 50 ? "Moderate" : "Good"} detail={`AQI: ${assessment.airQuality.aqi.toFixed(1)}`} />
              <Panel icon={<Cloud color="#cbd5e1" />} title="Weather" value={assessment.weather.condition} detail={`${assessment.weather.temp.toFixed(1)}°C`} />
              <Panel icon={<Sun color="#facc15" />} title="UV Index" value={assessment.uvIndex > 5 ? "High" : "Low"} detail={assessment.uvIndex.toFixed(1)} />
              <Panel icon={<Droplets color="#3b82f6" />} title="Flood Risk" value={assessment.floodRisk.level} detail={assessment.floodRisk.description} />
              <Panel icon={<Flame color="#ea580c" />} title="Wildfire Smoke" value={assessment.wildfire.status} detail={assessment.wildfire.details} />
              <Panel icon={<Flower2 color="#f472b6" />} title="Pollen" value={assessment.pollen.tree.toString()} detail={`Tree: ${assessment.pollen.tree}`} />
              <Panel icon={<Sprout color="#16a34a" />} title="Soil" value={assessment.soil.moisture > 30 ? "Optimal" : "Dry"} detail={`Moist: ${assessment.soil.moisture.toFixed(0)}%`} />
              <Panel icon={<ShieldCheck color="#22c55e" />} title="Compliance" value={assessment.compliance.status} detail={`${assessment.compliance.reminders.length} reminders`} />
            </View>

            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                 <Activity size={20} color="#60a5fa" />
                 <Text style={styles.aiTitle}>AI Recommendations</Text>
              </View>
              <View style={styles.aiContent}>
                {assessment.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.aiText}>• {rec}</Text>
                ))}
              </View>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={fetchAssessment}>Retry</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Panel({ icon, title, value, detail }: { icon: any, title: string, value: string, detail: string }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        {icon}
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      <Text style={styles.panelValue}>{value}</Text>
      <Text style={styles.panelDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '500',
  },
  riskCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: 'bold',
  },
  riskLevel: {
    color: '#4ade80',
    marginTop: 16,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  panel: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    width: '48%',
    marginBottom: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  panelTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  panelValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  panelDetail: {
    color: '#94a3b8',
    fontSize: 12,
  },
  aiSection: {
    marginTop: 12,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiContent: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
  },
  aiText: {
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 4,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
  },
  retryText: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
  }
});
