import React from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  HardDrive, 
  Calendar, 
  User, 
  BookOpen,
  ClipboardList,
  Target,
  CheckCircle2,
  Copy,
  Sparkles,
  FileDown
} from 'lucide-react';
import { ScienceFile, STAGE_LABELS, DISCIPLINE_LABELS } from '../types';

interface FileViewerModalProps {
  file: ScienceFile | null;
  onClose: () => void;
  onDownload: (file: ScienceFile) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  onClose,
  onDownload,
}) => {
  if (!file) return null;

  const [copiedObj, setCopiedObj] = React.useState(false);

  const copyObjectives = () => {
    if (file.lessonObjectives) {
      navigator.clipboard.writeText(
        `🎯 أهداف الدرس (${file.title}):\n` +
        file.lessonObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')
      );
      setCopiedObj(true);
      setTimeout(() => setCopiedObj(false), 2000);
    }
  };

  const isSlide = file.fileType === 'gslides' || file.fileType === 'pptx' || file.tags.includes('Google Slides');

  const getResourceTitle = () => {
    if (isSlide) return 'عرض تقديمي تفاعلي (Google Slides)';
    switch (file.resourceType) {
      case 'lesson_plan':
        return 'خطة دراسية / تحضير درس';
      case 'textbook':
        return 'كتاب دراسي مدرسي';
      case 'lesson_objectives':
        return 'أهداف الدرس ونواتج التعلم';
      default:
        return 'مورد علمي';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="file-viewer-modal-box"
        className="relative w-full max-w-4xl h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/anas-school-logo.svg"
                alt="شعار مدرسة أنس بن مالك الخاصة"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {getResourceTitle()}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  مدرسة أنس بن مالك الخاصة • {file.gradeLevel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 mt-0.5">
                {file.title}
              </h2>
            </div>
          </div>

          {/* Action Tools & Close */}
          <div className="flex items-center gap-2">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition shadow-2xs ${
                  isSlide
                    ? 'text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100'
                    : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isSlide ? (
                  <Presentation className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>{isSlide ? 'فتح في Google Slides' : 'فتح في Google'}</span>
              </a>
            )}

            <button
              id="viewer-download-btn"
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ({file.downloadCount})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-100/60 space-y-5">
          
          {/* Top Overview: Textbook info + Objectives Card */}
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* 1. Textbook & Curriculum Mapping Card */}
            {(file.textbookName || file.unitAndChapter) && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">مرجع الكتاب المدرسي المقرر:</p>
                    <p className="text-sm font-bold text-slate-900">{file.textbookName}</p>
                    <p className="text-xs text-slate-600">{file.unitAndChapter}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    {DISCIPLINE_LABELS[file.discipline] || file.discipline}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {file.gradeLevel || STAGE_LABELS[file.stage] || file.stage}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Lesson Objectives Card (🎯 أهداف الدرس ونواتج التعلم) */}
            {file.lessonObjectives && file.lessonObjectives.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-teal-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-teal-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-teal-950">
                        أهداف الدرس ونواتج التعلم المحددة
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        معايير التحقق ونواتج الفهم المستهدفة للطلاب في هذه الحصة
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={copyObjectives}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
                  >
                    {copiedObj ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedObj ? 'تم النسخ' : 'نسخ الأهداف'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {file.lessonObjectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-50/40 border border-teal-100/60">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                        {objective}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Study Plan & Full Content Reader / Presentation View */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {isSlide ? (
                    <>
                      <Presentation className="w-4 h-4 text-amber-600" />
                      <span>محتوى شرائح العرض التقديمي (Google Slides)</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                      <span>تفاصيل الخطة الدراسية وإجراءات التدريس</span>
                    </>
                  )}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {file.fileName}
                </span>
              </div>

              {isSlide && file.webViewLink && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-950">
                        عرض تقديمي تفاعلي مرتبط بـ Google Slides
                      </span>
                    </div>
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح العرض في Google Slides</span>
                    </a>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    يمكنك تشغيل هذا العرض التقديمي مباشرة في الفصل الدراسي أو مشاركته مع الطلاب أو تحميله بصيغة PowerPoint.
                  </p>
                </div>
              )}

              <div className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                {file.rawContent || file.description}
              </div>

              {/* Teacher Info & Actions */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {file.teacherAvatar ? (
                    <img 
                      src={file.teacherAvatar} 
                      alt={file.teacherName} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                      {file.teacherName[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{file.teacherName}</p>
                    <p className="text-[11px] text-slate-500">
                      {isSlide ? 'معد العرض التقديمي والحصة الدراسية' : 'معد الخطة والمادة الدراسية'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isSlide && file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-100 rounded-xl transition"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>عرض في Google Slides</span>
                    </a>
                  )}
                  <button
                    onClick={() => onDownload(file)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الملف</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              تاريخ الرفع: {file.uploadDate}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              الحجم: {file.fileSize}
            </span>
          </div>

          <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-semibold">
            عدد التحميلات: {file.downloadCount}
          </span>
        </div>

      </div>
    </div>
  );
};
