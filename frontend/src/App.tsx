import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Wind,
  Droplets,
  AlertTriangle,
  Sun,
  Thermometer,
  ShieldCheck,
  Map as MapIcon,
  Activity,
  Flame,
  Flower2,
  Sprout,
  BarChart3,
  Info
} from 'lucide-react';
import { getHealth, getAssessment } from './api/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface Assessment {
  riskScore: number;
  location: { name: string; lat: number; lon: number };
  weather: { temp: number; condition: string; windSpeed: number };
  airQuality: { aqi: number; pm25: number };
  uvIndex: number;
  pollen: { tree: number; grass: number; weed: number };
  floodRisk: { level: string; score: number };
  soil: { moisture: number; temperature: number };
  wildfire: { status: string; details: string };
  compliance: { status: string; reminders: string[] };
  aiRisk?: { hazards: string[]; level: string; explanation: string };
  recommendations: string[];
}

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    getHealth()
      .then(res => setBackendStatus(res.data.message))
      .catch(() => setBackendStatus('Backend Unreachable'));

    getAssessment()
      .then(res => setAssessment(res.data))
      .catch(err => console.error("Failed to fetch assessment", err));
  }, []);

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
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
          <Activity size={18} className={backendStatus.includes('running') ? 'text-green-500' : 'text-red-500'} />
          <span className="text-sm font-medium">{backendStatus}</span>
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
          <p className={`mt-4 ${assessment && assessment.riskScore > 50 ? 'text-red-400' : 'text-green-400'} font-bold text-center`}>
            {assessment ? (assessment.riskScore > 60 ? 'HIGH RISK' : (assessment.riskScore > 30 ? 'MODERATE RISK' : 'LOW RISK')) : 'Loading...'}
          </p>
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
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
        <Panel icon={<Sprout className="text-green-600" />} title="Soil" value={assessment ? (assessment.soil.moisture > 30 ? "Optimal" : (assessment.soil.moisture < 15 ? "Drought" : "Dry")) : "--"} detail={`Moisture: ${assessment?.soil.moisture.toFixed(0) ?? '--'}%`} />
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
