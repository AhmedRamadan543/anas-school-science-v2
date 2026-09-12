import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertCircle,
  BookOpen,
  ClipboardList,
  Target,
  HardDrive,
  Plus,
  Trash2
} from 'lucide-react';
import { ScienceFile, ScienceDiscipline, EducationalStage, CoreResourceType, TeacherUser } from '../types';
import { uploadFileToDrive } from '../services/googleWorkspace';

interface FileUploadModalProps {
  isOpen: boolean;
  user: TeacherUser | null;
  onClose: () => void;
  onUploadSuccess: (newFile: ScienceFile) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  user,
  onClose,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resourceType, setResourceType] = useState<Exclude<CoreResourceType, 'all'>>('lesson_plan');
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<Exclude<ScienceDiscipline, 'all'>>('physics');
  const [stage, setStage] = useState<Exclude<EducationalStage, 'all'>>('grade_5');
  const [gradeLevel, setGradeLevel] = useState('صف خامس');
  const [textbookName, setTextbookName] = useState('');
  const [unitAndChapter, setUnitAndChapter] = useState('');
  const [objectivesText, setObjectivesText] = useState(
    '• أن يحدد الطالب المفهوم العلمي بدقة.\n• أن يطبق القوانين الرياضية في حل المسائل.\n• أن ينفذ النشاط المعملي بمراعاة معايير الأمان.'
  );
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState(user?.displayName || 'معلم العلوم');
  const [uploadToDrive, setUploadToDrive] = useState(!!user);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const determineFileType = (fileName: string): ScienceFile['fileType'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'docx';
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'xlsx';
    if (ext === 'ppt' || ext === 'pptx') return 'pptx';
    return 'text';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('يرجى كتابة عنوان للملف أو الدرس');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let driveLink: string | undefined;
      let driveId: string | undefined;

      // Optional Drive Sync
      if (selectedFile && uploadToDrive && user) {
        try {
          const driveResult = await uploadFileToDrive(selectedFile, description);
          driveLink = driveResult.webViewLink;
          driveId = driveResult.id;
        } catch (driveErr: any) {
          console.warn('Drive sync failed, continuing locally:', driveErr);
        }
      }

      const localBlobUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined;
      
      // Parse objectives into array
      const objectivesArray = objectivesText
        .split('\n')
        .map((line) => line.replace(/^[•\-\*\d\.]+\s*/, '').trim())
        .filter(Boolean);

      const fileName = selectedFile ? selectedFile.name : `${title.trim()}.pdf`;
      const fileSize = selectedFile ? formatFileSize(selectedFile.size) : '1.2 MB';

      const fullContent = `# ${title}\n` +
        `النوع: ${resourceType === 'lesson_plan' ? 'خطة دراسية' : resourceType === 'textbook' ? 'كتاب دراسي' : 'أهداف الدرس'}\n` +
        `الكتاب المدرسي: ${textbookName || 'المنهج المعتمد'}\n` +
        `الوحدة / الفصل: ${unitAndChapter || 'غير محدد'}\n` +
        `الصف الدراسي: ${gradeLevel}\n\n` +
        `## 🎯 أهداف الدرس ونواتج التعلم:\n` +
        objectivesArray.map((obj, i) => `${i + 1}. ${obj}`).join('\n') +
        `\n\n## 📝 تفاصيل وملاحظات التدريس:\n` +
        (description || 'خطة ومادة تعليمية جاهزة للتحميل والاستفادة منها داخل الفصل والمختبر.');

      const newScienceFile: ScienceFile = {
        id: `sci-${Date.now()}`,
        title: title.trim(),
        resourceType,
        discipline,
        stage,
        gradeLevel,
        term: 'الفصل الدراسي الحالي',
        textbookName: textbookName.trim() || 'كتاب العلوم المعتمد',
        unitAndChapter: unitAndChapter.trim() || 'الوحدة المقررة',
        lessonObjectives: objectivesArray.length > 0 ? objectivesArray : ['تحقيق نواتج التعلم المحددة في الدرس'],
        description: description.trim() || 'خطة ومادة دراسية تشمل الأهداف والكتاب المدرسي.',
        fileType: selectedFile ? determineFileType(selectedFile.name) : 'pdf',
        fileName,
        fileSize,
        uploadDate: new Date().toISOString().split('T')[0],
        teacherName: teacherName.trim() || 'معلم العلوم',
        teacherAvatar: user?.photoURL || undefined,
        downloadCount: 0,
        viewCount: 1,
        url: localBlobUrl,
        webViewLink: driveLink,
        googleDriveId: driveId,
        rawContent: fullContent,
        tags: [
          resourceType === 'lesson_plan' ? 'خطة دراسية' : resourceType === 'textbook' ? 'كتاب دراسي' : 'أهداف الدرس',
          discipline,
          gradeLevel,
        ],
      };

      onUploadSuccess(newScienceFile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="file-upload-modal-box"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/5 max-h-[92vh] overflow-y-auto custom-scrollbar text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img
                src="/anas-school-logo.svg"
                alt="شعار مدرسة أنس بن مالك الخاصة"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>رفع: خطة دراسية / كتاب مدرسي / أهداف الدرس</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مستودع مدرسة أنس بن مالك الخاصة لمواد العلوم (خامس - ثاني عشر)
              </p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* Main Resource Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              حدد نوع المحتوى المراد رفعه: *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setResourceType('lesson_plan')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                  resourceType === 'lesson_plan'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ClipboardList className={`w-5 h-5 mb-1 ${resourceType === 'lesson_plan' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">خطة دراسية</span>
                <span className="text-[10px] text-slate-500">تحضير وإجراءات</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('textbook')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                  resourceType === 'textbook'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BookOpen className={`w-5 h-5 mb-1 ${resourceType === 'textbook' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">كتاب دراسي</span>
                <span className="text-[10px] text-slate-500">كتاب المنهج / وحدة</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('lesson_objectives')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                  resourceType === 'lesson_objectives'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Target className={`w-5 h-5 mb-1 ${resourceType === 'lesson_objectives' ? 'text-teal-700' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">أهداف الدرس</span>
                <span className="text-[10px] text-slate-500">نواتج التعلم والمؤشرات</span>
              </button>

            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان {resourceType === 'lesson_plan' ? 'الخطة الدراسية' : resourceType === 'textbook' ? 'الكتاب المدرسي' : 'أهداف الدرس'}: *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: خطة درس قوانين نيوتن في الحركة"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Textbook Info & Chapter Mapping */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>بيانات الكتاب المدرسي وموضع الدرس في المنهج:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  اسم الكتاب الدراسي المقرر:
                </label>
                <input
                  type="text"
                  placeholder="مثال: كتاب الفيزياء 1 أو كتاب العلوم"
                  value={textbookName}
                  onChange={(e) => setTextbookName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  الوحدة والفصل ورقم الصفحات:
                </label>
                <input
                  type="text"
                  placeholder="مثال: الوحدة 3 - الفصل 4 (ص 88 - ص 95)"
                  value={unitAndChapter}
                  onChange={(e) => setUnitAndChapter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Lesson Objectives Field (🎯 أهداف الدرس) */}
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-teal-600" />
                <span>أهداف الدرس ونواتج التعلم (اكتب كل هدف في سطر): *</span>
              </label>
              <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md font-semibold">
                معرفية • مهارية • وجدانية
              </span>
            </div>
            <textarea
              rows={4}
              value={objectivesText}
              onChange={(e) => setObjectivesText(e.target.value)}
              placeholder="اكتب أهداف الدرس المحددة هنا، مثلاً:
• أن يستنتج الطالب مفهوم حفظ الكتلة في التفاعلات الكيميائية.
• أن يزن الطالب معادلة التفاعل بطريقة صحيحة.
• أن يقدر الطالب دور الكيمياء في الصناعات الدوائية."
              className="w-full px-3 py-2 text-xs bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 leading-relaxed font-sans"
            />
          </div>

          {/* Discipline and Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المادة الدراسية: *
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="physics">فيزياء ⚡</option>
                <option value="chemistry">كيمياء 🧪</option>
                <option value="biology">أحياء 🧬</option>
                <option value="science">علوم 🔬</option>
                <option value="environmental">علوم بيئية 🌿</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المرحلة / الصف الدراسي: *
              </label>
              <select
                value={stage}
                onChange={(e) => {
                  const val = e.target.value as Exclude<EducationalStage, 'all'>;
                  setStage(val);
                  const stageNames: Record<string, string> = {
                    grade_5: 'صف خامس',
                    grade_6: 'صف سادس',
                    grade_7: 'صف سابع',
                    grade_8: 'صف ثامن',
                    grade_9: 'صف تاسع',
                    grade_10: 'صف عاشر',
                    grade_11: 'صف حادي عشر',
                    grade_12: 'صف ثاني عشر',
                  };
                  setGradeLevel(stageNames[val] || val);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
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
          </div>

          {/* File Upload Drop Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الملف المرفق (كتاب PDF، خطة Word، جدول Excel، أو عرض تقديمي):
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex items-center gap-3 text-emerald-800">
                  <FileCheck className="w-6 h-6 text-emerald-600" />
                  <div className="text-right">
                    <p className="text-xs font-bold">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500">
                      الحجم: {formatFileSize(selectedFile.size)} • انقر لتغيير الملف
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    اسحب ملف الكتاب أو الخطة هنا، أو <span className="text-emerald-600 underline">اختر من جهازك</span>
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, Word (.docx), Excel (.xlsx), PPTX</p>
                </div>
              )}
            </div>
          </div>

          {/* Teacher name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المعلم / المعلمة:
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {/* Google Drive sync toggle */}
          {user && (
            <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-800">
                  حفظ نسخة أيضاً في Google Drive
                </span>
              </div>
              <input
                type="checkbox"
                checked={uploadToDrive}
                onChange={(e) => setUploadToDrive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارِ النشر والحفظ...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>نشر في المنصة للمعلمين</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
