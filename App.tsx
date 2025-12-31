
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Wand2, 
  Layout, 
  Palette, 
  Layers, 
  Lamp, 
  Box, 
  Square, 
  CheckCircle2, 
  Loader2,
  RefreshCcw,
  Sparkles,
  AlertCircle,
  Table as TableIcon,
  Image as ImageIcon,
  Download,
  Scissors,
  // Fix: Added missing Info icon import
  Info
} from 'lucide-react';
import { 
  DESIGN_STYLES, 
  COLOR_PALETTES, 
  CABINET_MATERIALS, 
  COUNTERTOPS, 
  LIGHTING_TYPES, 
  FLOORING_TYPES,
  REASSURING_MESSAGES
} from './constants';
import { DesignPreferences, GenerationResult, MaterialItem } from './types';
import { redesignKitchen, generateCuttingList } from './services/gemini';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'cutting'>('design');
  
  const [preferences, setPreferences] = useState<DesignPreferences>({
    style: DESIGN_STYLES[0],
    colorPalette: COLOR_PALETTES[0],
    cabinetMaterial: CABINET_MATERIALS[0],
    countertop: COUNTERTOPS[0],
    lighting: LIGHTING_TYPES[0],
    flooring: FLOORING_TYPES[0],
    extraDetails: '',
    userRequests: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRedesign = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const generatedUrl = await redesignKitchen(image, preferences);
      const cuttingListData = await generateCuttingList(preferences);
      
      setResult({
        originalImage: image,
        generatedImage: generatedUrl,
        cuttingList: cuttingListData,
        timestamp: Date.now()
      });
      setActiveTab('design');
    } catch (err: any) {
      setError("خطایی در تولید تصویر رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-['Vazirmatn']">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 leading-none">KitchenAI</h1>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">معمار هوشمند</span>
            </div>
          </div>
          <button 
            onClick={reset}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            شروع دوباره
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm">۱</div>
                <h2 className="font-bold text-zinc-900">بارگذاری عکس آشپزخانه</h2>
              </div>
              
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 transition-all group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">برای آپلود عکس کلیک کنید</p>
                    <p className="text-xs text-zinc-400 mt-1">فرمت‌های JPG, PNG</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src={image} className="w-full h-full object-cover" alt="آپلود شده" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Upload className="w-4 h-4" /> تغییر عکس
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              )}
            </section>

            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm">۲</div>
                <h2 className="font-bold text-zinc-900">تنظیمات طراحی</h2>
              </div>

              <div className="space-y-4">
                <SelectField label="سبک معماری" icon={<Layout className="w-4 h-4" />} value={preferences.style} options={DESIGN_STYLES} onChange={(v) => setPreferences({...preferences, style: v})} />
                <SelectField label="پالت رنگی" icon={<Palette className="w-4 h-4" />} value={preferences.colorPalette} options={COLOR_PALETTES} onChange={(v) => setPreferences({...preferences, colorPalette: v})} />
                <SelectField label="جنس کابینت‌ها" icon={<Layers className="w-4 h-4" />} value={preferences.cabinetMaterial} options={CABINET_MATERIALS} onChange={(v) => setPreferences({...preferences, cabinetMaterial: v})} />
                <SelectField label="صفحه روی کابینت" icon={<Box className="w-4 h-4" />} value={preferences.countertop} options={COUNTERTOPS} onChange={(v) => setPreferences({...preferences, countertop: v})} />
                <SelectField label="نورپردازی" icon={<Lamp className="w-4 h-4" />} value={preferences.lighting} options={LIGHTING_TYPES} onChange={(v) => setPreferences({...preferences, lighting: v})} />
                <SelectField label="کف‌پوش" icon={<Square className="w-4 h-4" />} value={preferences.flooring} options={FLOORING_TYPES} onChange={(v) => setPreferences({...preferences, flooring: v})} />
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">درخواست‌های خاص</label>
                  <textarea 
                    className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="مثلاً: اضافه کردن جزیره، تغییر دستگیره‌ها به طلایی..."
                    value={preferences.userRequests}
                    onChange={(e) => setPreferences({...preferences, userRequests: e.target.value})}
                  />
                </div>
              </div>
              
              <button 
                disabled={!image || isGenerating}
                onClick={handleRedesign}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
                  !image || isGenerating 
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none' 
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال بازطراحی و محاسبه لیست...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    بازطراحی و تولید لیست برش
                  </>
                )}
              </button>
            </section>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            {isGenerating && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold mb-2">هوش مصنوعی در حال کار است</h3>
                <p className="text-zinc-500 max-w-md italic transition-opacity duration-500">
                  "{REASSURING_MESSAGES[loadingMessageIdx]}"
                </p>
              </div>
            )}

            {!isGenerating && !result && !error && (
              <div className="bg-white rounded-2xl border border-zinc-200 border-dashed p-12 flex flex-col items-center justify-center min-h-[600px] text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                  <Layout className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">محل نمایش نتیجه</h3>
                <p className="text-zinc-400 max-w-xs mt-2">
                  پس از انتخاب عکس و تنظیمات، خروجی بازطراحی شده و لیست متریال را اینجا مشاهده خواهید کرد.
                </p>
              </div>
            )}

            {!isGenerating && result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Tabs for Design vs Cutting List */}
                <div className="flex bg-white p-1 rounded-xl border border-zinc-200 w-fit">
                  <button 
                    onClick={() => setActiveTab('design')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'design' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    <ImageIcon className="w-4 h-4" /> طرح پیشنهادی
                  </button>
                  <button 
                    onClick={() => setActiveTab('cutting')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'cutting' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    <TableIcon className="w-4 h-4" /> لیست متریال و برش
                  </button>
                </div>

                {activeTab === 'design' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Camera className="w-3 h-3" /> تصویر اصلی
                        </span>
                        <div className="aspect-[1/1] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                          <img src={result.originalImage} className="w-full h-full object-cover" alt="اصلی" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> طرح نهایی
                        </span>
                        <div className="aspect-[1/1] rounded-2xl overflow-hidden border-2 border-emerald-100 bg-zinc-100 shadow-xl relative group">
                          <img src={result.generatedImage} className="w-full h-full object-cover" alt="بازطراحی" />
                          <div className="absolute top-4 right-4">
                            <a href={result.generatedImage} download="kitchen-design.png" className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-all">
                              <Download className="w-3 h-3" /> دانلود عکس
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                          <Scissors className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-zinc-900">لیست برآورد متریال و برش</h2>
                          <p className="text-sm text-zinc-500 mt-0.5">محاسبه شده بر اساس استانداردهای معماری و طرح فعلی</p>
                        </div>
                      </div>
                      <button className="bg-white border border-zinc-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> خروجی PDF
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-wider">
                            <th className="px-6 py-4 border-b border-zinc-200">ردیف</th>
                            <th className="px-6 py-4 border-b border-zinc-200">آیتم / قطعه</th>
                            <th className="px-6 py-4 border-b border-zinc-200">نوع متریال</th>
                            <th className="px-6 py-4 border-b border-zinc-200">ابعاد تقریبی (سانتی‌متر)</th>
                            <th className="px-6 py-4 border-b border-zinc-200">تعداد / مقدار</th>
                            <th className="px-6 py-4 border-b border-zinc-200">توضیحات فنی</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-sm">
                          {result.cuttingList?.map((item, index) => (
                            <tr key={index} className="hover:bg-zinc-50/80 transition-colors">
                              <td className="px-6 py-4 font-bold text-zinc-400">{index + 1}</td>
                              <td className="px-6 py-4 font-bold text-zinc-900">{item.item}</td>
                              <td className="px-6 py-4 text-zinc-600">
                                <span className="inline-block px-2.5 py-1 bg-zinc-100 rounded-md text-xs font-medium">{item.material}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-zinc-700">{item.dimensions}</td>
                              <td className="px-6 py-4 font-bold text-zinc-900">{item.count}</td>
                              <td className="px-6 py-4 text-zinc-500 text-xs italic">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-6 bg-amber-50 border-t border-amber-100">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                          توجه: ابعاد و مقادیر بالا بر اساس تحلیل هوش مصنوعی از تصویر و استانداردهای عمومی استخراج شده‌اند. 
                          برای اجرای نهایی، اندازه‌گیری دقیق محل پروژه توسط تکنسین الزامی است.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-2xl flex flex-col items-center text-center gap-4">
                <AlertCircle className="w-12 h-12" />
                <div>
                  <h4 className="font-bold text-lg">خطا در پردازش</h4>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button onClick={handleRedesign} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-all">تلاش مجدد</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-400" />
            <p className="text-sm text-zinc-500">© ۲۰۲۴ هوش مصنوعی طراحی آشپزخانه. تمامی حقوق محفوظ است.</p>
          </div>
          <div className="text-xs text-zinc-400">قدرت گرفته از Gemini Pro & Flash</div>
        </div>
      </footer>
    </div>
  );
};

const SelectField: React.FC<{ label: string; icon: React.ReactNode; value: string; options: string[]; onChange: (v: string) => void }> = ({ label, icon, value, options, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">{icon}{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none appearance-none cursor-pointer hover:bg-zinc-100 transition-all">
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default App;
