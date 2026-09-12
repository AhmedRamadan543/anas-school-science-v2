import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FlaskRound, 
  Atom, 
  Calculator, 
  Search, 
  Check, 
  Copy,
  Layers
} from 'lucide-react';

interface ScienceLabWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ELEMENTS_DATA = [
  { symbol: 'H', name: 'هيدروجين', number: 1, mass: '1.008', group: 'لا فلز', color: 'bg-rose-100 text-rose-800' },
  { symbol: 'He', name: 'هيليوم', number: 2, mass: '4.0026', group: 'غاز خامل', color: 'bg-purple-100 text-purple-800' },
  { symbol: 'C', name: 'كربون', number: 6, mass: '12.011', group: 'لا فلز', color: 'bg-slate-200 text-slate-800' },
  { symbol: 'N', name: 'نيتروجين', number: 7, mass: '14.007', group: 'لا فلز', color: 'bg-blue-100 text-blue-800' },
  { symbol: 'O', name: 'أكسجين', number: 8, mass: '15.999', group: 'لا فلز', color: 'bg-sky-100 text-sky-800' },
  { symbol: 'Na', name: 'صوديوم', number: 11, mass: '22.990', group: 'فلز قلوي', color: 'bg-amber-100 text-amber-800' },
  { symbol: 'Mg', name: 'ماغنيسيوم', number: 12, mass: '24.305', group: 'فلز قلوي ترابي', color: 'bg-orange-100 text-orange-800' },
  { symbol: 'Al', name: 'ألومنيوم', number: 13, mass: '26.982', group: 'فلز بعد انتقالي', color: 'bg-emerald-100 text-emerald-800' },
  { symbol: 'Si', name: 'سيليكون', number: 14, mass: '28.085', group: 'شبه فلز', color: 'bg-teal-100 text-teal-800' },
  { symbol: 'Cl', name: 'كلور', number: 17, mass: '35.45', group: 'هالوجين', color: 'bg-lime-100 text-lime-800' },
  { symbol: 'Fe', name: 'حديد', number: 26, mass: '55.845', group: 'فلز انتقالي', color: 'bg-amber-100 text-amber-900' },
  { symbol: 'Cu', name: 'نحاس', number: 29, mass: '63.546', group: 'فلز انتقالي', color: 'bg-amber-200 text-amber-900' },
  { symbol: 'Au', name: 'ذهب', number: 79, mass: '196.97', group: 'فلز نفيس', color: 'bg-yellow-200 text-yellow-900' },
];

export const ScienceLabWidget: React.FC<ScienceLabWidgetProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'calc'>('elements');
  const [searchElement, setSearchElement] = useState('');
  
  // Quick physics/chemistry calculator
  const [calcType, setCalcType] = useState<'ohm' | 'density' | 'velocity'>('ohm');
  const [val1, setVal1] = useState<string>('12');
  const [val2, setVal2] = useState<string>('2');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredElements = ELEMENTS_DATA.filter(
    (el) =>
      el.name.includes(searchElement) ||
      el.symbol.toLowerCase().includes(searchElement.toLowerCase()) ||
      el.group.includes(searchElement)
  );

  const calculateResult = () => {
    const num1 = parseFloat(val1) || 0;
    const num2 = parseFloat(val2) || 0;

    if (calcType === 'ohm') {
      // V = I * R => calculate Resistance R = V / I
      const r = num2 !== 0 ? (num1 / num2).toFixed(2) : 'غير معرف (قسمة على صفر)';
      return {
        formula: 'R = V / I',
        label: 'المقاومة الكهربائية (أوم Ω)',
        value: `${r} Ω`,
      };
    } else if (calcType === 'density') {
      // Density = Mass / Volume
      const d = num2 !== 0 ? (num1 / num2).toFixed(3) : 'غير معرف';
      return {
        formula: 'الكثافة = الكتلة ÷ الحجم',
        label: 'الكثافة (جم/سم³)',
        value: `${d} g/cm³`,
      };
    } else {
      // Velocity = Distance / Time
      const v = num2 !== 0 ? (num1 / num2).toFixed(2) : 'غير معرف';
      return {
        formula: 'السرعة = المسافة ÷ الزمن',
        label: 'السرعة المتجهة (م/ث)',
        value: `${v} m/s`,
      };
    }
  };

  const result = calculateResult();

  const handleCopyResult = () => {
    navigator.clipboard.writeText(`${result.formula} => ${result.value}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="science-lab-widget-box"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 text-right"
        dir="rtl"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <FlaskRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                مساعد معلم العلوم المخبري
              </h3>
              <p className="text-xs text-slate-500">
                أدوات مساعدة سريعة لإعداد الدروس وحسابات التجارب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'elements'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الجدول الدوري السريع والعناصر
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'calc'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            حاسبة معادلات الفيزياء والكيمياء
          </button>
        </div>

        {/* Content Tab 1: Periodic Elements */}
        {activeTab === 'elements' && (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث باسم العنصر أو رمزه الكيميائي (مثل: Fe أو أكسجين)..."
                value={searchElement}
                onChange={(e) => setSearchElement(e.target.value)}
                className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-1">
              {filteredElements.map((el) => (
                <div
                  key={el.symbol}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-400">#{el.number}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${el.color}`}>
                      {el.symbol}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{el.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>الكتلة: {el.mass}</span>
                    <span className="text-[10px]">{el.group}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab 2: Formula Calculator */}
        {activeTab === 'calc' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setCalcType('ohm');
                  setVal1('12');
                  setVal2('2');
                }}
                className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                  calcType === 'ohm'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                قانون أوم (R = V/I)
              </button>
              <button
                onClick={() => {
                  setCalcType('density');
                  setVal1('50');
                  setVal2('25');
                }}
                className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                  calcType === 'density'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                الكثافة (m / V)
              </button>
              <button
                onClick={() => {
                  setCalcType('velocity');
                  setVal1('100');
                  setVal2('5');
                }}
                className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                  calcType === 'velocity'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                السرعة (d / t)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {calcType === 'ohm' ? 'فرق الجهد V (فولت):' : calcType === 'density' ? 'الكتلة m (جرام):' : 'المسافة d (متر):'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={val1}
                  onChange={(e) => setVal1(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {calcType === 'ohm' ? 'شدة التيار I (أمبير):' : calcType === 'density' ? 'الحجم V (سم³):' : 'الزمن t (ثانية):'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={val2}
                  onChange={(e) => setVal2(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition text-center font-bold"
                />
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800">{result.label}</span>
                <p className="text-xl font-black text-emerald-900 mt-0.5">{result.value}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5 font-mono">{result.formula}</p>
              </div>

              <button
                onClick={handleCopyResult}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl hover:bg-emerald-100/50 transition shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ القيمة'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
