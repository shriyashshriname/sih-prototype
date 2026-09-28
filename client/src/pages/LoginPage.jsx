import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  Compass, 
  Activity,
  ChevronDown,
  Zap,
  MapPin,
  Users,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// Animated number counter
function AnimatedStat({ value, label, color = 'text-white' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const step = Math.max(1, Math.ceil(end / 25));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-center">
      <div className={`text-2xl sm:text-3xl font-black leading-none ${color}`}>{count}</div>
      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{label}</div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [role, setRole] = useState('District Officer');
  const [email, setEmail] = useState('collector.pune@maharashtra.gov.in');
  const [password, setPassword] = useState('aegis-officer-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Unable to sign in. Check your credentials and try again.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(role, {
        name: role === 'District Officer' ? 'Dr. Rajesh Deshmukh, IAS' 
            : role === 'Fire Department' ? 'Chief Fire Officer'
            : role === 'Police Department' ? 'Superintendent of Police'
            : role === 'Hospital / Medical' ? 'Chief Medical Officer'
            : 'Duty Commander',
        email,
      });
      setLoading(false);
      setSuccessMessage('✓ Authentication successful');
      toast.success(`Signed in as ${role}. Command Center session verified.`);
      setTimeout(() => navigate(from, { replace: true }), 300);
    }, 480);
  };

  const handleDemoAccess = (selectedRole) => {
    setErrorMessage('');
    setDemoLoadingRole(selectedRole);
    setTimeout(() => {
      login(selectedRole, {
        name: selectedRole === 'District Officer' ? 'Dr. Rajesh Deshmukh, IAS' : 'Emergency Agency Controller',
        email: selectedRole === 'District Officer' ? 'collector.pune@maharashtra.gov.in' : 'ndrf.pune@gov.in',
      });
      setDemoLoadingRole('ready');
      setSuccessMessage('✓ Demo environment ready');
      toast.success(`Demo environment ready. Signed in as ${selectedRole}.`);
      setTimeout(() => navigate('/dashboard', { replace: true }), 350);
    }, 480);
  };

  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col relative overflow-hidden">

      {/* ── Layered Background ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary large glow — left */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[130px]" />
        {/* Secondary glow — right auth side */}
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[110px]" />
        {/* Bottom accent */}
        <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-indigo-700/8 rounded-full blur-[120px] -translate-x-1/2" />

        {/* Fine grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />

        {/* Topographic SVG curves */}
        <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M -100,220 C 200,140 420,310 800,200 S 1400,250 1800,160 S 2200,280 2400,220" stroke="rgba(99,130,230,0.12)" strokeWidth="1.5" />
          <path d="M -100,360 C 250,280 500,440 900,330 S 1500,380 1900,290 S 2300,410 2500,350" stroke="rgba(99,130,230,0.09)" strokeWidth="1.5" />
          <path d="M -100,500 C 300,420 580,580 1000,470 S 1600,510 2000,420 S 2400,540 2600,480" stroke="rgba(99,130,230,0.07)" strokeWidth="1.5" />
          <path d="M -100,640 C 350,560 650,720 1100,610 S 1700,650 2100,560 S 2500,680 2700,620" stroke="rgba(99,130,230,0.05)" strokeWidth="1.5" />
          {/* Diagonal accent line */}
          <line x1="52%" y1="0" x2="52%" y2="100%" stroke="rgba(99,130,230,0.08)" strokeWidth="1" strokeDasharray="6 8" />
        </svg>
      </div>

      {/* ── Global Header ─── */}
      <header className="relative z-30 flex-shrink-0 w-full h-[68px] flex items-center justify-between px-6 sm:px-10 lg:px-14 border-b border-white/[0.07] bg-[#070d1f]/80 backdrop-blur-xl">
        {/* Brand */}
        <div onClick={() => navigate('/')} className="flex items-center gap-3.5 cursor-pointer group select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-cyber font-extrabold text-[17px] tracking-wider text-white group-hover:text-blue-200 transition-colors">AEGIS</span>
              <span className="hidden sm:inline text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/50">SIH26191</span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-medium tracking-wide leading-none mt-0.5">AI Disaster Risk Intelligence</p>
          </div>
        </div>

        {/* Status pills */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-emerald-400 text-[11px] font-cyber font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>SYSTEM SECURE</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/25 text-blue-400 text-[11px] font-cyber font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span>PRODUCTION STATE</span>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="group text-[13px] font-tech font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </header>

      {/* ── Main Two-Column Content ─── */}
      <main className="relative z-20 flex-1 w-full flex flex-col lg:flex-row">

        {/* ═══════════════════════════════════
            LEFT COLUMN — Hero / Product Story
            ═══════════════════════════════════ */}
        <div className={`w-full lg:w-[54%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-10 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/[0.07] transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <div className="max-w-[580px] w-full mx-auto lg:mx-0 space-y-7">

            {/* Kicker badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 self-start animate-fade-in shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-cyber font-bold uppercase tracking-widest">Maharashtra Live Production Environment</span>
            </div>

            {/* Main headline */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-[38px] sm:text-[46px] lg:text-[50px] font-tech font-black tracking-tight leading-[1.08] uppercase">
                <span className="text-white">INTELLIGENCE</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
                  FOR SAFER DECISIONS.
                </span>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-slate-400 leading-relaxed font-normal max-w-[480px]">
                AI-assisted multi-hazard analysis — identifying vulnerable habitations, prioritizing relocation needs, and evaluating geographically viable safe sites across Maharashtra.
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: MapPin, label: '17 Habitations Tracked' },
                { icon: ShieldCheck, label: 'Multi-Hazard Risk Engine' },
                { icon: Users, label: 'Multi-Agency Coordination' },
                { icon: Zap, label: 'Real-Time Alert System' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[12px] font-tech font-bold tracking-wide uppercase">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* GIS Visualization Panel */}
            <div className="hidden sm:block bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-sm relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.25s' }}>
              {/* Panel header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span className="text-[13px] font-tech font-bold text-slate-200 uppercase tracking-wide">Maharashtra Spatial Risk Model</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-cyber text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                  <span className="font-bold">Live Data</span>
                </div>
              </div>

              {/* SVG GIS Canvas */}
              <div className="relative w-full h-[190px]">
                <svg viewBox="0 0 540 220" className="w-full h-full overflow-visible" fill="none">
                  {/* Grid */}
                  {[45, 110, 175].map(y => <line key={y} x1="30" y1={y} x2="510" y2={y} stroke="#334155" strokeWidth="0.6" strokeDasharray="4 5" opacity="0.4" />)}
                  {[130, 260, 400].map(x => <line key={x} x1={x} y1="15" x2={x} y2="205" stroke="#334155" strokeWidth="0.6" strokeDasharray="4 5" opacity="0.4" />)}

                  {/* Maharashtra boundary */}
                  <path
                    d="M 125,38 C 175,22 250,26 335,30 C 400,32 460,50 478,82 C 492,108 456,144 414,163 C 362,182 310,192 248,200 C 195,207 168,214 148,204 C 128,194 118,157 113,117 C 108,77 114,50 125,38 Z"
                    fill="#1e293b" fillOpacity="0.5" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4"
                  />
                  {/* Western Ghats */}
                  <path d="M 120,50 Q 128,95 132,142 T 146,200" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.25" />

                  {/* Raigad — hazard */}
                  <circle cx="122" cy="95" r="10" fill="#f59e0b" opacity="0.2" className="radar-ping" />
                  <circle cx="122" cy="95" r="5" fill="#f59e0b" />
                  <text x="66" y="91" fill="#fbbf24" fontSize="10.5" fontWeight="bold" fontFamily="inherit">Raigad</text>
                  <text x="60" y="103" fill="#94a3b8" fontSize="8" fontFamily="inherit">Flood · Landslide</text>

                  {/* Pune — command hub */}
                  <circle cx="200" cy="112" r="11" fill="#3b82f6" opacity="0.22" className="animate-pulse" />
                  <circle cx="200" cy="112" r="5.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="213" y="110" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="inherit">Pune</text>
                  <text x="213" y="123" fill="#60a5fa" fontSize="8.5" fontFamily="inherit">Command · Safe Sites</text>

                  {/* Ratnagiri */}
                  <circle cx="130" cy="148" r="3.5" fill="#f59e0b" />
                  <text x="74" y="151" fill="#cbd5e1" fontSize="9.5" fontWeight="600" fontFamily="inherit">Ratnagiri</text>

                  {/* Kolhapur */}
                  <circle cx="168" cy="178" r="4" fill="#ea580c" />
                  <circle cx="168" cy="178" r="8" fill="#ea580c" opacity="0.18" className="animate-pulse" />
                  <text x="178" y="182" fill="#cbd5e1" fontSize="9.5" fontWeight="600" fontFamily="inherit">Kolhapur</text>

                  {/* Safe Site */}
                  <circle cx="238" cy="94" r="4.5" fill="#10b981" />
                  <circle cx="238" cy="94" r="8" fill="#10b981" opacity="0.22" className="animate-pulse" />
                  <path d="M 200,112 L 238,94" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="248" y="97" fill="#34d399" fontSize="8.5" fontWeight="600" fontFamily="inherit">Safe Site A-1</text>

                  {/* Transit arc — Raigad to Pune */}
                  <path d="M 122,95 C 148,80 170,90 200,112" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 4" className="animate-dash-flow" />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-0 left-0 flex items-center gap-3 text-[10px] text-slate-400 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Hazard Zone</span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Command</span>
                  <span className="text-slate-600">→</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Safe Site</span>
                </div>
              </div>
            </div>

            {/* Animated stats row */}
            <div className="flex items-center justify-between py-4 px-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <AnimatedStat value={17} label="Habitations Monitored" color="text-white" />
              <div className="h-10 w-px bg-slate-700" />
              <AnimatedStat value={6} label="Red-Zone Areas" color="text-amber-400" />
              <div className="h-10 w-px bg-slate-700" />
              <AnimatedStat value={4} label="Immediate Relocations" color="text-blue-400" />
              <div className="h-10 w-px bg-slate-700" />
              <AnimatedStat value={8} label="Safe Sites Ready" color="text-emerald-400" />
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════
            RIGHT COLUMN — Authentication Panel
            ═══════════════════════════════════ */}
        <div className={`w-full lg:w-[46%] flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 lg:py-0 relative transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '0.15s' }}>

          {/* Subtle right-column atmospheric elements */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute right-8 top-1/4 space-y-1.5 opacity-[0.07] font-mono text-[9px] text-blue-300 hidden xl:block">
              <div>● AEGIS_SYSTEM_READY</div>
              <div>● GIS_ENGINE_ACTIVE</div>
              <div>● LIVE_DATA_FEED_OK</div>
              <div>● RELOCATION_PLANNER_OK</div>
              <div>● ALERT_SYSTEM_ARMED</div>
            </div>
            <Shield className="absolute -right-6 -bottom-6 w-56 h-56 text-blue-400 opacity-[0.03] stroke-[0.5]" />
          </div>

          {/* ── THE AUTH CARD ── */}
          <div
            className="w-full max-w-[500px] rounded-2xl flex flex-col relative z-10 animate-scale-in overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px -16px rgba(0,0,0,0.45), 0 8px 24px -4px rgba(15,23,42,0.12)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            {/* Blue top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 flex-shrink-0" />

            <div className="p-8 sm:p-9 space-y-5 text-slate-900">

              {/* Card Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    Authorized Officer Access
                  </span>
                </div>
                <h2 className="text-[26px] sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                  Sign In to<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Command Center</span>
                </h2>
                <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
                  Access the Aegis disaster intelligence workspace.
                </p>
              </div>

              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11.5px] font-bold text-slate-600 uppercase tracking-wider">
                  Access As
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === 'District Officer') setEmail('collector.pune@maharashtra.gov.in');
                      else if (newRole === 'Disaster Management Officer') setEmail('ddmo.pune@maharashtra.gov.in');
                      else if (newRole === 'Emergency Agency') setEmail('ndrf.pune@gov.in');
                      else if (newRole === 'Fire Department') setEmail('fire.ops@pune.gov.in');
                      else if (newRole === 'Police Department') setEmail('police.control@mahapolice.gov.in');
                      else if (newRole === 'Hospital / Medical') setEmail('cmo.health@maharashtra.gov.in');
                      else setEmail('field.officer@maharashtra.gov.in');
                    }}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pr-10 text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none hover:bg-slate-100/80"
                  >
                    <option value="District Officer">District Officer / Collector (Executive)</option>
                    <option value="Disaster Management Officer">Disaster Management Officer (DDMO)</option>
                    <option value="Emergency Agency">Emergency Agency (NDRF / SDRF)</option>
                    <option value="Fire Department">Fire Department (Search & Rescue)</option>
                    <option value="Police Department">Police Department (Crowd Control / Traffic)</option>
                    <option value="Hospital / Medical">Hospital / Medical Response (Health)</option>
                    <option value="Field Officer">Field Officer (Taluka Incident Command)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Enterprise Security Notice */}
              <div className="rounded-xl overflow-hidden border border-blue-200/60" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)' }}>
                <div className="px-4 py-3 border-b border-blue-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-cyber font-bold text-blue-900 uppercase tracking-widest">Restricted Government System</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Secured
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[12px] text-blue-800/80 leading-relaxed font-medium">
                    This system is restricted to authorized personnel from the Government of Maharashtra and affiliated disaster management agencies. All access is logged and monitored.
                  </p>
                </div>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Sign in failed.</strong> Check your credentials and try again.</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[12.5px] text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Credential Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-700">
                    Official Email / Service ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.name@maharashtra.gov.in"
                      className="w-full h-12 bg-slate-50/80 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      style={{ paddingLeft: '44px', paddingRight: '16px' }}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 bg-slate-50/80 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot row */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[12.5px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Contact the State IT Cell to reset your Command Center credentials.')}
                    className="text-[12.5px] text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={loading || Boolean(demoLoadingRole)}
                  className="w-full h-[52px] text-white text-[13.5px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                  style={{
                    background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #1e50d8)',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.40), 0 2px 6px rgba(37,99,235,0.15)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.50), 0 3px 8px rgba(37,99,235,0.20)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.40), 0 2px 6px rgba(37,99,235,0.15)'; }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      <span>Signing in to Command Center...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust note */}
              <div className="text-center pt-1 space-y-1 border-t border-slate-100">
                <p className="text-[11.5px] text-slate-500 font-medium">Authorized personnel only.</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  AI-assisted recommendations remain subject to human authority validation.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ─── */}
      <footer className="relative z-30 flex-shrink-0 w-full h-11 flex items-center justify-between px-6 sm:px-10 lg:px-14 border-t border-white/[0.07] bg-[#070d1f]/80 backdrop-blur-xl text-[11.5px] text-slate-500">
        <span className="font-tech font-bold text-slate-400">AEGIS v2.0 SYSTEM</span>
        <div className="flex items-center gap-2 font-tech font-bold tracking-wide">
          <span>MAHARASHTRA COMMAND</span>
          <span className="text-slate-700">·</span>
          <span className="text-sky-400/80">LIVE PRODUCTION ENVIRONMENT</span>
          <span className="text-slate-700">·</span>
          <span>SECURE</span>
        </div>
      </footer>

    </div>
  );
}
