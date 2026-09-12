/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Atom, 
  FlaskRound, 
  Dna, 
  Globe2, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  BookOpen,
  ClipboardList,
  Target,
  GraduationCap
} from 'lucide-react';
import { 
  ScienceFile, 
  ScienceDiscipline, 
  EducationalStage, 
  CoreResourceType, 
  TeacherUser 
} from './types';
import { INITIAL_SCIENCE_FILES } from './data/initialFiles';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { downloadScienceFile } from './services/googleWorkspace';
import { Navbar } from './components/Navbar';
import { FileCard } from './components/FileCard';
import { FileUploadModal } from './components/FileUploadModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { FileViewerModal } from './components/FileViewerModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ScienceLabWidget } from './components/ScienceLabWidget';
import { SchoolLogo } from './components/SchoolLogo';

export default function App() {
  // Auth state
  const [user, setUser] = useState<TeacherUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Files data state: Initialize with the curated study plans, textbooks, and lesson objectives
  const [files, setFiles] = useState<ScienceFile[]>(() => {
    const saved = localStorage.getItem('science_curriculum_platform_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].resourceType) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored curriculum files', e);
      }
    }
    return INITIAL_SCIENCE_FILES;
  });

  // Save to localStorage when files change
  useEffect(() => {
    localStorage.setItem('science_curriculum_platform_v2', JSON.stringify(files));
  }, [files]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<CoreResourceType>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<ScienceDiscipline>('all');
  const [selectedStage, setSelectedStage] = useState<EducationalStage>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'views'>('newest');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceInitialType, setWorkspaceInitialType] = useState<'gdoc' | 'gsheet'>('gdoc');
  const [isLabToolsOpen, setIsLabToolsOpen] = useState(false);
  const [previewingFile, setPreviewingFile] = useState<ScienceFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<ScienceFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser({
          uid: authUser.uid,
          displayName: authUser.displayName,
          email: authUser.email,
          photoURL: authUser.photoURL,
        });
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setUser({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
        showToast(`أهلاً بك يا أستاذ ${result.user.displayName || ''}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'تعذر تسجيل الدخول بـ Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('تم تسجيل الخروج');
  };

  // Add new file handler
  const handleAddFile = (newFile: ScienceFile) => {
    setFiles((prev) => [newFile, ...prev]);
    showToast(`تمت إضافة "${newFile.title}" بنجاح`);
  };

  // Download file handler
  const handleDownload = (file: ScienceFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, downloadCount: f.downloadCount + 1 } : f))
    );

    if (file.fileType === 'gdoc' && file.googleDriveId) {
      const exportUrl = `https://docs.google.com/document/d/${file.googleDriveId}/export?format=pdf`;
      downloadScienceFile(exportUrl, `${file.title}.pdf`, true);
    } else if (file.fileType === 'gsheet' && file.googleDriveId) {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${file.googleDriveId}/export?format=xlsx`;
      downloadScienceFile(exportUrl, `${file.title}.xlsx`, true);
    } else if (file.url) {
      downloadScienceFile(file.url, file.fileName, false);
    } else {
      const blob = new Blob([file.rawContent || file.description], { type: 'text/plain;charset=utf-8' });
      downloadScienceFile(blob, `${file.fileName}.txt`, false);
    }

    showToast(`جارِ تحميل: ${file.title}`);
  };

  // Preview file handler
  const handlePreview = (file: ScienceFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, viewCount: f.viewCount + 1 } : f))
    );
    setPreviewingFile(file);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
    showToast(`تم حذف "${fileToDelete.title}"`);
    setFileToDelete(null);
  };

  // Filtered and sorted files calculation
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Resource Type Filter: Lesson Plan / Textbook / Objectives
        if (selectedResourceType !== 'all' && file.resourceType !== selectedResourceType) {
          return false;
        }
        // Discipline Filter
        if (selectedDiscipline !== 'all' && file.discipline !== selectedDiscipline) {
          return false;
        }
        // Stage Filter
        if (selectedStage !== 'all' && file.stage !== selectedStage) {
          return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = file.title.toLowerCase().includes(query);
          const matchTextbook = file.textbookName?.toLowerCase().includes(query);
          const matchUnit = file.unitAndChapter?.toLowerCase().includes(query);
          const matchTeacher = file.teacherName.toLowerCase().includes(query);
          const matchObjectives = file.lessonObjectives?.some((o) => o.toLowerCase().includes(query));
          const matchTags = file.tags.some((t) => t.toLowerCase().includes(query));
          return matchTitle || matchTextbook || matchUnit || matchTeacher || matchObjectives || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
        if (sortBy === 'views') return b.viewCount - a.viewCount;
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
  }, [files, selectedResourceType, selectedDiscipline, selectedStage, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const plansCount = files.filter((f) => f.resourceType === 'lesson_plan').length;
    const booksCount = files.filter((f) => f.resourceType === 'textbook').length;
    const objectivesCount = files.filter((f) => f.resourceType === 'lesson_objectives').length;
    return {
      total: files.length,
      plansCount,
      booksCount,
      objectivesCount,
    };
  }, [files]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl animate-in slide-in-from-bottom-3 duration-300 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenWorkspaceCreate={(type) => {
          setWorkspaceInitialType(type || 'gdoc');
          setIsWorkspaceModalOpen(true);
        }}
        onOpenLabTools={() => setIsLabToolsOpen(true)}
        fileCount={files.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner strictly focused on Lesson Plans, Textbooks, and Lesson Objectives */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>منصة العلوم لمدرسة أنس بن مالك الخاصة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                مستودع الخطط الدراسية، الكتب المدرسية، وأهداف الدروس
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                المنصة التعليمية المعتمدة لمعلمي ومعلمات مدرسة أنس بن مالك الخاصة لرفع وتصفح وتحميل الخطط الدراسية، الكتب المدرسية المقررة، وأهداف الدروس ونواتج التعلم للصفوف (خامس - ثاني عشر) لمواد الفيزياء، الكيمياء، الأحياء، العلوم، والعلوم البيئية.
              </p>

              {/* Direct upload shortcuts for the 3 pillars */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  id="hero-upload-plan-btn"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع خطة أو كتاب أو أهداف</span>
                </button>
                <button
                  id="hero-gdoc-plan-btn"
                  onClick={() => {
                    setWorkspaceInitialType('gdoc');
                    setIsWorkspaceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs sm:text-sm border border-white/15 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>خطة درس في Google Docs</span>
                </button>
                <button
                  id="hero-gsheet-plan-btn"
                  onClick={() => {
                    setWorkspaceInitialType('gsheet');
                    setIsWorkspaceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs sm:text-sm border border-white/15 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>مصفوفة أهداف في Google Sheets</span>
                </button>
              </div>
            </div>

            {/* School Official Emblem & Quick Metrics */}
            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
              {/* School Logo Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 shadow-xl">
                <div className="w-20 h-20 sm:w-24 sm:h-24 p-1.5 bg-white rounded-2xl shadow-md ring-2 ring-amber-400/40 flex items-center justify-center shrink-0">
                  <img
                    src="/anas-school-logo.svg"
                    alt="شعار مدرسة أنس بن مالك الخاصة"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-900/40 px-2 py-0.5 rounded-md border border-teal-500/30">
                    الشعار الرسمي
                  </span>
                  <p className="text-sm sm:text-base font-black text-white mt-1">مدرسة أنس بن مالك الخاصة</p>
                  <p className="text-xs text-amber-300 font-bold">تأسست عام 1990</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">قسم العلوم والمختبرات المدرسية</p>
                </div>
              </div>

              {/* Quick Metrics: Plans, Books, Objectives */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-center">
                  <p className="text-lg sm:text-xl font-black text-emerald-400">{stats.plansCount}</p>
                  <p className="text-[10px] text-slate-300 font-medium">خطط دراسية</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-center">
                  <p className="text-lg sm:text-xl font-black text-blue-400">{stats.booksCount}</p>
                  <p className="text-[10px] text-slate-300 font-medium">كتب مدرسية</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-center">
                  <p className="text-lg sm:text-xl font-black text-teal-400">{stats.objectivesCount}</p>
                  <p className="text-[10px] text-slate-300 font-medium">أهداف الدروس</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Filter Tabs: الخطط الدراسية | الكتب الدراسية | أهداف الدرس */}
        <section className="space-y-4">
          
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setSelectedResourceType('all')}
              className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                selectedResourceType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>جميع الملفات ({stats.total})</span>
            </button>

            <button
              id="filter-tab-lesson-plans"
              onClick={() => setSelectedResourceType('lesson_plan')}
              className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                selectedResourceType === 'lesson_plan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 الخطط الدراسية ({stats.plansCount})</span>
            </button>

            <button
              id="filter-tab-textbooks"
              onClick={() => setSelectedResourceType('textbook')}
              className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                selectedResourceType === 'textbook'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📘 الكتب الدراسية ({stats.booksCount})</span>
            </button>

            <button
              id="filter-tab-lesson-objectives"
              onClick={() => setSelectedResourceType('lesson_objectives')}
              className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                selectedResourceType === 'lesson_objectives'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-teal-50 hover:text-teal-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>🎯 أهداف الدرس ونواتج التعلم ({stats.objectivesCount})</span>
            </button>
          </div>

          {/* Quick Stage Pills (صف خامس إلى صف ثاني عشر) */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 text-xs">
            <span className="font-bold text-slate-500 pl-1 shrink-0 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>المرحلة:</span>
            </span>
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                selectedStage === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الكل
            </button>
            {[
              { id: 'grade_5', label: 'صف خامس' },
              { id: 'grade_6', label: 'صف سادس' },
              { id: 'grade_7', label: 'صف سابع' },
              { id: 'grade_8', label: 'صف ثامن' },
              { id: 'grade_9', label: 'صف تاسع' },
              { id: 'grade_10', label: 'صف عاشر' },
              { id: 'grade_11', label: 'صف حادي عشر' },
              { id: 'grade_12', label: 'صف ثاني عشر' },
            ].map((stg) => (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(stg.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                  selectedStage === stg.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {stg.label}
              </button>
            ))}
          </div>

          {/* Search Box & Dropdown Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative w-full md:w-96">
              <input
                id="search-science-files-input"
                type="text"
                placeholder="ابحث بالعنوان، اسم الكتاب المدرسي، الوحدة، أهداف الدرس، أو المعلم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-3 left-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Select Dropdowns: Discipline, Stage, Sort */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              
              {/* Discipline (فيزياء، كيمياء، أحياء، علوم، علوم بيئية) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none py-1 cursor-pointer"
                >
                  <option value="all">كافة المواد (الكل)</option>
                  <option value="physics">فيزياء ⚡</option>
                  <option value="chemistry">كيمياء 🧪</option>
                  <option value="biology">أحياء 🧬</option>
                  <option value="science">علوم 🔬</option>
                  <option value="environmental">علوم بيئية 🌿</option>
                </select>
              </div>

              {/* Stage Filter (صفوف من خامس إلى ثاني عشر) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none py-1 cursor-pointer"
                >
                  <option value="all">كافة الصفوف (الكل)</option>
                  <option value="grade_5">صف خامس</option>
                  <option value="grade_6">صف سادس</option>
                  <option value="grade_7">صف سابع</option>
                  <option value="grade_8">صف ثامن</option>
                  <option value="grade_9">صف تاسع</option>
                  <option value="grade_10">صف عاشر</option>
                  <option value="grade_11">صف حادي عشر</option>
                  <option value="grade_12">صف ثاني عشر</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none py-1 cursor-pointer"
                >
                  <option value="newest">الأحدث رفعاً</option>
                  <option value="downloads">الأكثر تحميلاً</option>
                  <option value="views">الأكثر مشاهدة</option>
                </select>
              </div>

            </div>

          </div>
        </section>

        {/* Files Grid Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>
                {selectedResourceType === 'lesson_plan'
                  ? 'الخطط الدراسية وتحضير الدروس'
                  : selectedResourceType === 'textbook'
                  ? 'الكتب المدرسية المقررة'
                  : selectedResourceType === 'lesson_objectives'
                  ? 'أهداف الدروس ونواتج التعلم'
                  : 'الخطط والكتب وأهداف الدروس المعروضة'}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {filteredFiles.length} عنصر
              </span>
            </h3>

            {searchQuery && (
              <p className="text-xs text-slate-500">
                نتائج البحث عن: <span className="font-bold text-slate-800">"{searchQuery}"</span>
              </p>
            )}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                لم يتم العثور على نتائج تطابق هذا البحث
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                جرّب تعديل معايير البحث أو تصفية الأقسام، أو قم برفع الخطة أو الكتاب الآن!
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedResourceType('all');
                    setSelectedDiscipline('all');
                    setSelectedStage('all');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  إعادة ضبط المرشحات
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>رفع خطة أو كتاب أو أهداف</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  onDelete={(target) => setFileToDelete(target)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        user={user}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleAddFile}
      />

      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        user={user}
        initialType={workspaceInitialType}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSuccess={handleAddFile}
        onRequireAuth={() => {
          setIsWorkspaceModalOpen(false);
          handleLogin();
        }}
      />

      <FileViewerModal
        file={previewingFile}
        onClose={() => setPreviewingFile(null)}
        onDownload={handleDownload}
      />

      {/* Safety Confirmation Dialog for Deletions */}
      <ConfirmationModal
        isOpen={!!fileToDelete}
        title="تأكيد حذف الملف من المنصة"
        message={`هل أنت متأكد من رغبتك في حذف "${fileToDelete?.title}"؟`}
        confirmLabel="نعم، احذف الملف"
        cancelLabel="تراجع"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />

      <ScienceLabWidget
        isOpen={isLabToolsOpen}
        onClose={() => setIsLabToolsOpen(false)}
      />

      {/* Platform Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-0.5 border border-slate-200 shadow-2xs shrink-0">
              <img
                src="/anas-school-logo.svg"
                alt="شعار مدرسة أنس بن مالك الخاصة"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 block">منصة العلوم - مدرسة أنس بن مالك الخاصة (تأسست عام 1990)</span>
              <span className="text-[11px] text-slate-400">الخطط الدراسية، الكتب المدرسية، وأهداف الدروس</span>
            </div>
          </div>
          <p>
            تكامل مع Google Workspace لإعداد وتنزيل خطط ومصفوفات المناهج التعليمية
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLabToolsOpen(true)}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              أدوات المختبر
            </button>
            <span>•</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              رفع خطة أو كتاب
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
