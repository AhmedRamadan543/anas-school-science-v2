import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileDown, 
  Eye, 
  Trash2, 
  BookOpen,
  ClipboardList,
  Target,
  Layers,
  Calendar,
  HardDrive,
  CheckCircle2,
  Atom,
  FlaskRound,
  Dna,
  Globe2
} from 'lucide-react';
import { ScienceFile, DISCIPLINE_LABELS, STAGE_LABELS } from '../types';

interface FileCardProps {
  file: ScienceFile;
  onPreview: (file: ScienceFile) => void;
  onDownload: (file: ScienceFile) => void;
  onDelete: (file: ScienceFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
  onDelete,
}) => {
  // Resource category badge (خطة دراسية / كتاب دراسي / أهداف درس)
  const getResourceBadge = () => {
    switch (file.resourceType) {
      case 'lesson_plan':
        return {
          label: 'خطة دراسية',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case 'textbook':
        return {
          label: 'كتاب دراسي',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-700" />,
        };
      case 'lesson_objectives':
        return {
          label: 'أهداف الدرس ونواتج التعلم',
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
          icon: <Target className="w-3.5 h-3.5 text-teal-700" />,
        };
      default:
        return {
          label: 'مورد تعليمي',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
    }
  };

  const getDisciplineIcon = () => {
    switch (file.discipline) {
      case 'chemistry':
        return <FlaskRound className="w-3.5 h-3.5 text-emerald-600" />;
      case 'physics':
        return <Atom className="w-3.5 h-3.5 text-blue-600" />;
      case 'biology':
        return <Dna className="w-3.5 h-3.5 text-teal-600" />;
      case 'environmental':
        return <Globe2 className="w-3.5 h-3.5 text-green-600" />;
      case 'science':
      default:
        return <FlaskRound className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const resBadge = getResourceBadge();
  const subjectName = DISCIPLINE_LABELS[file.discipline] || file.discipline;
  const stageName = file.gradeLevel || STAGE_LABELS[file.stage] || file.stage;

  return (
    <div 
      id={`file-card-${file.id}`}
      className="group relative flex flex-col justify-between rounded-3xl bg-white p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 text-right"
      dir="rtl"
    >
      <div>
        {/* Top Type Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${resBadge.bg}`}>
            {resBadge.icon}
            <span>{resBadge.label}</span>
          </span>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {getDisciplineIcon()}
            <span>{subjectName} • {stageName}</span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-base font-bold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition cursor-pointer"
          onClick={() => onPreview(file)}
        >
          {file.title}
        </h3>

        {/* Linked Textbook & Chapter Box */}
        {(file.textbookName || file.unitAndChapter) && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
            {file.textbookName && (
              <p className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">{file.textbookName}</span>
              </p>
            )}
            {file.unitAndChapter && (
              <p className="text-slate-600 text-[10px] truncate pr-4">
                {file.unitAndChapter}
              </p>
            )}
          </div>
        )}

        {/* Lesson Objectives Snippet (🎯 أهداف الدرس) */}
        {file.lessonObjectives && file.lessonObjectives.length > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-teal-50/40 border border-teal-200/70">
            <p className="text-[11px] font-bold text-teal-900 flex items-center gap-1 mb-1.5">
              <Target className="w-3.5 h-3.5 text-teal-600" />
              <span>أهداف الدرس ({file.lessonObjectives.length} أهداف):</span>
            </p>
            <ul className="space-y-1 pr-1">
              {file.lessonObjectives.slice(0, 2).map((obj, i) => (
                <li key={i} className="text-[11px] text-slate-700 line-clamp-1 leading-tight flex items-start gap-1.5">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
              {file.lessonObjectives.length > 2 && (
                <li className="text-[10px] text-teal-700 font-semibold pr-3 pt-0.5">
                  + {file.lessonObjectives.length - 2} أهداف أخرى داخل الملف...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {file.description}
        </p>
      </div>

      {/* Footer Details & Action Controls */}
      <div className="pt-3 border-t border-slate-100">
        
        {/* Teacher & Metadata row */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-2">
            {file.teacherAvatar ? (
              <img 
                src={file.teacherAvatar} 
                alt={file.teacherName} 
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                {file.teacherName[0]}
              </div>
            )}
            <span className="font-semibold text-slate-700 truncate max-w-[120px]">
              {file.teacherName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-400" />
              {file.fileSize}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5 flex-1">
            {/* Preview / Open Button */}
            <button
              id={`open-preview-btn-${file.id}`}
              onClick={() => onPreview(file)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>فتح ومعاينة</span>
            </button>

            {/* Download Button */}
            <button
              id={`download-file-btn-${file.id}`}
              onClick={() => onDownload(file)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
              title="تحميل الملف إلى جهازك"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تحميل ({file.downloadCount})</span>
            </button>
          </div>

          {/* Delete Action */}
          <button
            id={`delete-file-btn-${file.id}`}
            onClick={() => onDelete(file)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="حذف من المنصة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
};
