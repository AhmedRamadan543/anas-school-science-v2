import React from 'react';
import { 
  Atom, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Presentation,
  LogOut, 
  Sparkles,
  BookOpen,
  ClipboardList,
  Target
} from 'lucide-react';
import { TeacherUser } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface NavbarProps {
  user: TeacherUser | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onOpenWorkspaceCreate: (initialType?: 'gdoc' | 'gsheet' | 'gslides') => void;
  onOpenLabTools: () => void;
  fileCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  onOpenUpload,
  onOpenWorkspaceCreate,
  onOpenLabTools,
  fileCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200/80 ring-2 ring-emerald-50 shrink-0">
              <img
                src="/anas-school-logo.svg"
                alt="شعار مدرسة أنس بن مالك الخاصة"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 font-sans">
                  منصة العلوم لمدرسة أنس بن مالك الخاصة
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ClipboardList className="w-3 h-3" />
                  الخطط والكتب والأهداف
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                مستودع الخطط الدراسية، الكتب المدرسية، وأهداف ونواتج تعلم مواد العلوم (خامس - ثاني عشر)
              </p>
            </div>
          </div>

          {/* Central Quick Indicators */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              id="nav-open-lab-tools-btn"
              onClick={onOpenLabTools}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
              title="مساعد المختبر ومعادلات العلوم"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>مساعد المختبر والمعادلات</span>
            </button>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {fileCount} خطط وكتب وأهداف
            </span>
          </div>

          {/* Action Buttons: Upload & Workspace & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Create Google Docs / Sheets / Slides Button */}
            <button
              id="nav-create-google-resource-btn"
              onClick={() => onOpenWorkspaceCreate('gslides')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition shadow-xs cursor-pointer"
              title="إنشاء عرض تقديمي في Google Slides، أو خطة في Google Docs، أو مصفوفة أهداف في Sheets"
            >
              <div className="flex items-center -space-x-1.5 space-x-reverse">
                <FileText className="w-4 h-4 text-blue-600" />
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <Presentation className="w-4 h-4 text-amber-500" />
              </div>
              <span className="hidden sm:inline">مستندات وعروض Google</span>
              <span className="sm:hidden">Google Slides / Docs</span>
            </button>

            {/* Upload File Button */}
            <button
              id="nav-upload-file-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 rounded-xl shadow-sm shadow-emerald-600/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>رفع خطة / كتاب / أهداف</span>
            </button>

            {/* Google Authentication Control */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'المعلم'}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.displayName ? user.displayName[0] : 'ع'}
                  </div>
                )}
                <div className="hidden sm:block text-right pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user.displayName || 'معلم العلوم'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                    متصل بـ Google
                  </p>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-google-signin-btn"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingIn ? 'جارِ الدخول...' : 'تسجيل الدخول بـ Google'}
                </span>
                <span className="sm:hidden">
                  {isLoggingIn ? '...' : 'دخول'}
                </span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
