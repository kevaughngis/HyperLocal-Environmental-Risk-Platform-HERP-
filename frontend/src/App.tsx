import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Wind,
  Droplets,
  AlertTriangle,
  Sun,
  ShieldCheck,
  Map as MapIcon,
  Activity,
  Flame,
  Flower2,
  Sprout,
  BarChart3,
  Info,
  Layers,
  MessageSquare,
  Bell,
  X,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import { getHealth, getAssessment, getReports, createReport } from './api/client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CommunityReport {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  createdAt: string;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

interface Assessment {
  riskScore: number;
  location: { name: string; lat: number; lon: number };
  weather: { temp: number; condition: string; windSpeed: number };
  airQuality: { aqi: number; pm25: number };
  uvIndex: number;
  pollen: { tree: number; grass: number; weed: number };
  floodRisk: { level: string; score: number };
  soil: { moisture: number; temperature: number };
  satellite: { ndvi: number; lastPass: string; cloudCover: number };
  wildfire: { status: string; details: string };
  compliance: { status: string; reminders: string[] };
  aiRisk?: { hazards: string[]; level: string; explanation: string; trend?: string };
  recommendations: string[];
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'Flooding', description: '', lat: 0, lon: 0 });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    getHealth()
      .then(res => setBackendStatus(res.data.message))
      .catch(() => setBackendStatus('Backend Unreachable'));

    getAssessment()
      .then(res => {
        setAssessment(res.data);
        // Generate notifications based on assessment
        const newNotifications: AppNotification[] = [];
        if (res.data.riskScore > 70) {
          newNotifications.push({
            id: 'risk-critical',
            title: 'Critical Risk Alert',
            message: 'Environmental risk has exceeded critical thresholds. Review safety protocols.',
            severity: 'critical',
            timestamp: new Date()
          });
        }
        res.data.compliance.reminders.forEach((rem: string, i: number) => {
          if (rem.includes('MANDATORY') || rem.includes('BAN')) {
             newNotifications.push({
               id: `comp-${i}`,
               title: 'Compliance Action Required',
               message: rem,
               severity: 'warning',
               timestamp: new Date()
             });
          }
        });
        setNotifications(newNotifications);
      })
      .catch(err => console.error("Failed to fetch assessment", err));

    getReports()
      .then(res => setReports(res.data))
      .catch(err => console.error("Failed to fetch reports", err));
  }, []);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;
    try {
      await createReport({
        ...newReport,
        lat: newReport.lat || assessment.location.lat,
        lon: newReport.lon || assessment.location.lon
      });
      setShowReportModal(false);
      setNewReport({ type: 'Flooding', description: '', lat: 0, lon: 0 });
      // Refresh reports
      const res = await getReports();
      setReports(res.data);
    } catch (err) {
      console.error("Failed to submit report", err);
    }
  };

  // Calculate simulated ESG metrics based on environment
  const esgMetrics = assessment ? {
    carbonImpact: (assessment.airQuality.pm25 * 0.4).toFixed(1),
    sustainabilityScore: Math.max(0, 100 - assessment.riskScore),
    complianceLevel: assessment.compliance.reminders.length === 0 ? 100 : (100 - assessment.compliance.reminders.length * 15)
  } : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 tracking-tight">HERP</h1>
          <p className="text-slate-400 text-sm">HyperLocal Environmental Risk Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
          >
            <MessageSquare size={18} /> Report Hazard
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[3000] overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h4 className="font-bold">Notifications</h4>
                  <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-750 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${n.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                          <span className="text-xs font-bold uppercase tracking-wider">{n.title}</span>
                        </div>
                        <p className="text-sm text-slate-300">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block mt-2">{n.timestamp.toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
            <Activity size={18} className={backendStatus.includes('running') ? 'text-green-500' : 'text-red-500'} />
            <span className="text-sm font-medium">{backendStatus}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Overall Risk Score */}
        <div className="col-span-1 md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Environmental Risk</h2>
          <div className="relative flex items-center justify-center">
             <div className={`w-32 h-32 rounded-full border-8 ${assessment && assessment.riskScore > 50 ? 'border-red-500' : 'border-blue-500'} flex items-center justify-center transition-all duration-1000`}>
                <span className="text-4xl font-bold">{assessment?.riskScore ?? '--'}</span>
             </div>
          </div>
          <p className={`mt-4 ${assessment && assessment.riskScore > 50 ? 'text-red-400' : 'text-green-400'} font-bold text-center uppercase tracking-wider`}>
            {assessment ? (assessment.riskScore > 60 ? 'HIGH RISK' : (assessment.riskScore > 30 ? 'MODERATE RISK' : 'LOW RISK')) : 'Loading...'}
          </p>
          {assessment?.aiRisk?.trend && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700/50">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trend:</span>
               <span className={`text-xs font-bold ${assessment.aiRisk.trend === 'Rising' ? 'text-red-400' : (assessment.aiRisk.trend === 'Falling' ? 'text-green-400' : 'text-blue-400')}`}>
                 {assessment.aiRisk.trend}
               </span>
            </div>
          )}
          {assessment?.aiRisk?.explanation && (
            <p className="text-xs text-slate-400 mt-4 text-center italic border-t border-slate-700 pt-3">
              "{assessment.aiRisk.explanation}"
            </p>
          )}
        </div>

        {/* Interactive Map */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden min-h-[400px] relative shadow-lg">
          <div className="absolute top-4 left-12 z-[1000] bg-slate-900/80 p-2 rounded border border-slate-700 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <MapIcon size={14} /> Interactive Map
            </span>
          </div>
          <MapContainer center={[45.4215, -75.6972]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <MapEvents onMapClick={(lat, lon) => {
              setNewReport(prev => ({ ...prev, lat, lon }));
              setShowReportModal(true);
            }} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution='&copy; <a href="https://www.sentinel-hub.com/">Sentinel Hub</a>'
                  url="https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {assessment && (
              <Marker position={[assessment.location.lat, assessment.location.lon]}>
                <Popup>
                  <div className="text-slate-900">
                    <strong className="block text-blue-600">{assessment.location.name}</strong>
                    Assessment: {assessment.riskScore}/100 <br/>
                    Status: {assessment.aiRisk?.level}
                  </div>
                </Popup>
              </Marker>
            )}

            {reports.map(report => (
              <Marker key={report.id} position={[report.latitude, report.longitude]}>
                <Popup>
                  <div className="text-slate-900">
                    <strong className="block text-red-600">{report.type}</strong>
                    <p className="text-sm">{report.description}</p>
                    <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ESG & Analytics Panel */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4">
            <BarChart3 className="text-purple-400" size={32} />
            <div>
               <h3 className="text-sm text-slate-400 uppercase font-bold">Sustainability Score</h3>
               <p className="text-2xl font-bold text-purple-300">{esgMetrics?.sustainabilityScore ?? '--'}/100</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Activity className="text-green-400" size={32} />
            <div>
               <h3 className="text-sm text-slate-400 uppercase font-bold">Compliance Health</h3>
               <p className="text-2xl font-bold text-green-300">{esgMetrics?.complianceLevel ?? '--'}%</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Droplets className="text-cyan-400" size={32} />
            <div>
               <h3 className="text-sm text-slate-400 uppercase font-bold">Local Env. Impact</h3>
               <p className="text-2xl font-bold text-cyan-300">{esgMetrics?.carbonImpact ?? '--'} Index</p>
            </div>
          </div>
        </div>

        {/* Risk Panels */}
        <Panel icon={<Wind className="text-blue-400" />} title="Air Quality" value={assessment ? (assessment.airQuality.aqi > 100 ? "Poor" : (assessment.airQuality.aqi > 50 ? "Moderate" : "Good")) : "--"} detail={`AQI: ${assessment?.airQuality.aqi.toFixed(1) ?? '--'}`} />
        <Panel icon={<Cloud className="text-slate-300" />} title="Weather" value={assessment?.weather.condition ?? "--"} detail={`${assessment?.weather.temp.toFixed(1) ?? '--'}°C | ${assessment?.weather.windSpeed.toFixed(0) ?? '--'} km/h`} />
        <Panel icon={<Sun className="text-yellow-400" />} title="UV Index" value={assessment ? (assessment.uvIndex > 7 ? "Extreme" : (assessment.uvIndex > 4 ? "High" : "Low")) : "--"} detail={`Index: ${assessment?.uvIndex.toFixed(1) ?? "--"}`} />
        <Panel icon={<Droplets className="text-blue-500" />} title="Flood Risk" value={assessment?.floodRisk.level ?? "--"} detail={`Risk Score: ${assessment?.floodRisk.score ?? "--"}`} />
        <Panel icon={<Flame className="text-orange-600" />} title="Wildfire Smoke" value={assessment?.wildfire.status ?? "--"} detail={assessment?.wildfire.details ?? "--"} />
        <Panel icon={<Flower2 className="text-pink-400" />} title="Pollen" value={assessment ? (assessment.pollen.tree >= 4 ? "Critical" : (assessment.pollen.tree >= 2 ? "High" : "Low")) : "--"} detail={`Tree/Grass/Weed: ${assessment?.pollen.tree}/${assessment?.pollen.grass}/${assessment?.pollen.weed}`} />
        <Panel icon={<Sprout className="text-green-600" />} title="Soil & Vegetation" value={assessment ? (assessment.soil.moisture > 30 ? "Optimal" : (assessment.soil.moisture < 15 ? "Drought" : "Dry")) : "--"} detail={`Moisture: ${assessment?.soil.moisture.toFixed(0) ?? '--'}% | NDVI: ${assessment?.satellite.ndvi.toFixed(2) ?? '--'}`} />
        <Panel icon={<Layers className="text-indigo-400" />} title="Satellite" value={assessment ? (assessment.satellite.ndvi > 0.6 ? "Healthy" : "Stressed") : "--"} detail={`Pass: ${assessment ? new Date(assessment.satellite.lastPass).toLocaleDateString() : '--'}`} />
        <Panel icon={<ShieldCheck className="text-green-500" />} title="Compliance" value={assessment?.compliance.status ?? "--"} detail={`${assessment?.compliance.reminders.length ?? 0} active alerts`} />
        <Panel icon={<AlertTriangle className="text-orange-500" />} title="AI Risk Level" value={assessment?.aiRisk?.level ?? "Stable"} detail={assessment?.aiRisk?.hazards.length ? `${assessment.aiRisk.hazards.length} compound hazards` : "No combined threats"} />
      </main>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="text-blue-400" /> Actionable Recommendations
          </h2>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-[150px]">
            {assessment ? (
               <ul className="space-y-3">
                  {assessment.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-slate-300">
                      <span className="text-blue-500 font-bold">•</span> {rec}
                    </li>
                  ))}
               </ul>
            ) : <p className="text-slate-500">Generating recommendations...</p>}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-green-400" /> Compliance Notifications
          </h2>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-[150px]">
            {assessment ? (
               <div className="space-y-3">
                  {assessment.compliance.reminders.map((rem, i) => (
                    <div key={i} className={`p-3 rounded border ${rem.includes('MANDATORY') || rem.includes('BAN') ? 'bg-red-900/20 border-red-500/50 text-red-300' : 'bg-blue-900/20 border-blue-500/50 text-blue-300'}`}>
                       <span className="font-semibold block text-xs uppercase tracking-wider mb-1">Trigger: Weather Event</span>
                       {rem}
                    </div>
                  ))}
               </div>
            ) : <p className="text-slate-500">Checking compliance...</p>}
          </div>
        </div>
      </section>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-blue-400" /> Report Local Hazard
              </h3>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              {newReport.lat !== 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-300">
                  <MapPin size={14} />
                  <span>Location pinned: {newReport.lat.toFixed(4)}, {newReport.lon.toFixed(4)}</span>
                </div>
              )}
              <div>
                <label htmlFor="hazard-type" className="block text-sm font-medium text-slate-400 mb-1">Hazard Type</label>
                <select
                  id="hazard-type"
                  value={newReport.type}
                  onChange={e => setNewReport({...newReport, type: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-blue-500"
                >
                  <option>Flooding</option>
                  <option>Smoke/Fire</option>
                  <option>Fallen Tree/Debris</option>
                  <option>Localized Pollution</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="hazard-description" className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  id="hazard-description"
                  required
                  rows={3}
                  value={newReport.description}
                  onChange={e => setNewReport({...newReport, description: e.target.value})}
                  placeholder="Tell us what you see..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ icon, title, value, detail }: { icon: React.ReactNode, title: string, value: string, detail: string }) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors cursor-default shadow-lg group">
      <div className="flex items-center gap-3 mb-3">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="font-semibold text-slate-300 group-hover:text-white transition-colors">{title}</h3>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-slate-400 text-sm">{detail}</span>
      </div>
    </div>
  );
}

export default App;
