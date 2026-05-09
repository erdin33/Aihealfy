import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ChevronRight, 
  Info, 
  Scale, 
  Ruler, 
  User, 
  Calendar, 
  Utensils, 
  Heart, 
  RefreshCcw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { calculateBMI, getBMIStatus, calculateBMR, calculateTDEE, UserHealthData, ActivityLevel } from './types';
import { generateHealthAdvice } from './services/geminiService';

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  
  // Result State
  const [healthData, setHealthData] = useState<UserHealthData | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      setError('Mohon masukkan data yang valid.');
      setLoading(false);
      return;
    }

    const bmi = calculateBMI(w, h);
    const bmiStatus = getBMIStatus(bmi);
    const bmr = calculateBMR(w, h, a, gender);
    const tdee = calculateTDEE(bmr, activityLevel);

    const data: UserHealthData = {
      weight: w,
      height: h,
      age: a,
      gender,
      activityLevel,
      bmi,
      bmiStatus,
      tdee
    };

    setHealthData(data);

    try {
      const result = await generateHealthAdvice(data);
      setAdvice(result);
      setStep(2);
    } catch (err) {
      setError('Gagal menghasilkan saran kesehatan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAdvice(null);
    setHealthData(null);
  };

  const splitAdvice = (text: string | null) => {
    if (!text) return {};
    const patterns = [
      { key: 'ANALYSIS', regex: /(?:1\.\s+)?ANALISIS SINGKAT:([\s\S]*?)(?=\d\.\s+|TARGET NUTRISI|$)/i },
      { key: 'MACROS', regex: /(?:2\.\s+)?TARGET NUTRISI:([\s\S]*?)(?=\d\.\s+|REKOMENDASI MAKANAN|$)/i },
      { key: 'MENU', regex: /(?:3\.\s+)?REKOMENDASI MAKANAN[^:]*:([\s\S]*?)(?=\d\.\s+|TIPS GAYA HIDUP|$)/i },
      { key: 'TIPS', regex: /(?:4\.\s+)?TIPS GAYA HIDUP:([\s\S]*?)(?=$)/i }
    ];

    const result: Record<string, string> = {};
    patterns.forEach(p => {
      const match = text.match(p.regex);
      if (match && match[1]) {
        result[p.key] = match[1].trim();
      }
    });

    return result;
  };

  const adviceSections = splitAdvice(advice);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-200">
      <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shadow-brand-200">
              <Heart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight underline underline-offset-4 decoration-brand-200">Healify AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">Personal Health Dashboard</p>
            {step === 2 && (
              <button 
                onClick={resetForm}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm transition-colors py-2 px-4 rounded-xl hover:bg-brand-50"
              >
                <RefreshCcw className="w-4 h-4" />
                Hitung Ulang
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={cn(
        "mx-auto transition-all duration-500",
        step === 1 ? "max-w-4xl px-6 py-12" : "max-w-7xl px-0 md:px-6 md:py-8"
      )}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-3 tracking-tight">Kenali Tubuhmu, Atur Nutrisimu</h2>
                <p className="text-slate-600">Berikan detail tubuh Anda untuk mendapatkan analisis kesehatan personal dari AI kami.</p>
              </div>

              <form onSubmit={handleCalculate} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Gender Selector */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Jenis Kelamin</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 transition-all font-medium",
                          gender === 'male' 
                            ? "border-brand-600 bg-brand-50 text-brand-700" 
                            : "border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-500"
                        )}
                      >
                        <User className="w-5 h-5 text-brand-500" />
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 transition-all font-medium",
                          gender === 'female' 
                            ? "border-brand-600 bg-brand-50 text-brand-700" 
                            : "border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-500"
                        )}
                      >
                        <User className="w-5 h-5 text-brand-500" />
                        Perempuan
                      </button>
                    </div>
                  </div>

                  {/* Weight Input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Scale className="w-4 h-4 text-brand-500" /> Berat Badan (kg)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="65"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-lg"
                    />
                  </div>

                  {/* Height Input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-brand-500" /> Tinggi Badan (cm)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-lg"
                    />
                  </div>

                  {/* Age Input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-500" /> Umur (Tahun)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium text-lg"
                    />
                  </div>

                  {/* Activity Level Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-brand-500" /> Aktivitas
                    </label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none font-medium"
                    >
                      <option value="sedentary">Jarang olahraga</option>
                      <option value="light">Ringan (1-3x)</option>
                      <option value="moderate">Moderat (3-5x)</option>
                      <option value="active">Aktif (6-7x)</option>
                      <option value="veryActive">Sangat Berat</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-5 px-8 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-brand-100",
                    loading 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Sedang Menganalisis...
                    </>
                  ) : (
                    <>
                      Analisis Sekarang
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-200 pt-10">
                <div className="text-center group">
                  <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm transition-transform group-hover:-translate-y-1">
                    <Info className="w-6 h-6 text-brand-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dukungan AI</h4>
                  <p className="text-sm text-slate-600">Terintegrasi dengan Gemini AI.</p>
                </div>
                <div className="text-center group">
                  <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm transition-transform group-hover:-translate-y-1">
                    <Utensils className="w-6 h-6 text-brand-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Local Focus</h4>
                  <p className="text-sm text-slate-600">Menu makanan khas Indonesia.</p>
                </div>
                <div className="text-center group">
                  <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm transition-transform group-hover:-translate-y-1">
                    <Heart className="w-6 h-6 text-brand-500" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Healthy Habits</h4>
                  <p className="text-sm text-slate-600">Tips praktis jangka panjang.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-14rem)]"
            >
              {/* Sidebar: Health Profile */}
              <aside className="lg:w-80 space-y-6 flex flex-col shrink-0">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 h-full">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">Profil Kesehatan</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-500 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-slate-300" /> Berat Badan
                        </span>
                        <span className="font-bold text-slate-800">{healthData?.weight} <span className="text-xs font-normal text-slate-400">kg</span></span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-500 flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-slate-300" /> Tinggi Badan
                        </span>
                        <span className="font-bold text-slate-800">{healthData?.height} <span className="text-xs font-normal text-slate-400">cm</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
                    <div className="text-xs text-brand-700 font-bold mb-2 uppercase tracking-tight">Indeks Massa Tubuh (IMT)</div>
                    <div className="text-4xl font-display font-bold text-brand-900 tracking-tight">{healthData?.bmi}</div>
                    <div className={cn(
                      "text-sm font-bold mt-2",
                      healthData?.bmiStatus === 'Normal' ? "text-brand-600" : "text-orange-600"
                    )}>
                      Status: {healthData?.bmiStatus}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                    <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-widest">Target Kalori (TDEE)</div>
                    <div className="text-3xl font-display font-bold italic tracking-tighter text-brand-400">
                      {healthData?.tdee} <span className="text-xs font-normal opacity-70 uppercase tracking-normal">kkal/hari</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
                      * Disclaimer: Ini adalah saran AI. Konsultasi dokter tetap disarankan.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Main Content: AI Response */}
              <div className="flex-1 space-y-8">
                {/* Section 1: Analysis */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span> Analisis Singkat
                  </h2>
                  <div className="markdown-body">
                    <ReactMarkdown>{adviceSections.ANALYSIS || 'Menganalisis...'}</ReactMarkdown>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Section 2: Macros */}
                  <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Target Makronutrisi</h2>
                    <div className="markdown-body">
                      <ReactMarkdown>{adviceSections.MACROS || ''}</ReactMarkdown>
                    </div>
                  </section>

                  {/* Section 4: Tips */}
                  <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Tips Gaya Hidup</h2>
                    <div className="markdown-body">
                      <ReactMarkdown>{adviceSections.TIPS || ''}</ReactMarkdown>
                    </div>
                  </section>
                </div>

                {/* Section 3: Menu */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Rekomendasi Menu (Indonesia)</h2>
                  <div className="markdown-body">
                    <ReactMarkdown>{adviceSections.MENU || ''}</ReactMarkdown>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-xs mt-12 mb-8 mx-auto max-w-7xl px-6">
        <p className="tracking-widest uppercase mb-2">Developed by Erdinnur Hidayat</p>
        <p>© 2026 Healify AI — Digital Health Solutions</p>
      </footer>
    </div>
  );
}

