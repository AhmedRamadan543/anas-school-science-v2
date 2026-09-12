import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Target,
  FileDown
} from 'lucide-react';
import { ScienceFile, ScienceDiscipline, EducationalStage, TeacherUser } from '../types';
import { createGoogleDoc, createGoogleSheet, createGoogleSlide, downloadScienceFile } from '../services/googleWorkspace';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  user: TeacherUser | null;
  initialType?: 'gdoc' | 'gsheet' | 'gslides';
  onClose: () => void;
  onSuccess: (newFile: ScienceFile) => void;
  onRequireAuth: () => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  user,
  initialType = 'gdoc',
  onClose,
  onSuccess,
  onRequireAuth,
}) => {
  const [resourceType, setResourceType] = useState<'gdoc' | 'gsheet' | 'gslides'>(initialType);
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<Exclude<ScienceDiscipline, 'all'>>('physics');
  const [stage, setStage] = useState<Exclude<EducationalStage, 'all'>>('grade_5');
  const [gradeLevel, setGradeLevel] = useState('صف خامس');
  const [textbookName, setTextbookName] = useState('كتاب العلوم');
  const [unitAndChapter, setUnitAndChapter] = useState('الوحدة الأولى: المادة والطاقة');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('plan_with_objectives');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdResource, setCreatedResource] = useState<{
    id: string;
    webViewLink: string;
    exportPdfUrl?: string;
    exportOfficeUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Science templates for Google Docs focused on Lesson Plans & Lesson Objectives
  const docTemplates = [
    {
      id: 'plan_with_objectives',
      title: 'خطة درس متكاملة مع أهداف الدرس ونواتج التعلم',
      desc: 'تتضمن جدول الأهداف (معرفية، مهارية، وجدانية)، استراتيجيات التدريس، وموضع الدرس في الكتاب.',
      defaultTitle: 'خطة درس: قوانين نيوتن وتطبيقات القوة',
      objectives: [
        'أن يوضح الطالب قانون نيوتن الأول للقصور الذاتي بدقة.',
        'أن يستنتج الطالب العلاقة الرياضية لقانون نيوتن الثاني (F = m × a).',
        'أن يحل الطالب مسائل حسابية لإيجاد القوة المحصلة والتسارع.',
        'أن يربط الطالب بين القصور الذاتي واستخدام حزام الأمان في المركبات.'
      ],
      body: `## 📋 خطة درس العلوم النموذجية
المادة: فيزياء 1 | الصف: الأول الثانوي
مرجع الكتاب المدرسي: كتاب فيزياء 1 - الفصل 4 (ص 88 - 95)

### 🎯 أولاً: أهداف الدرس ونواتج التعلم المستهدفة:
1. الهدف المعرفي: يوضح الطالب مفهوم القوة والقصور الذاتي وقانون نيوتن الأول.
2. الهدف الرياضي: يطبق العلاقة F = m * a لحساب القوة المحصلة والتسارع.
3. الهدف المهاري: يرسم مخطط الجسم الحر للقوى المؤثرة في اتجاه الحركة.
4. الهدف الوجداني: يقدر الطالب أهمية وسائل السلامة في وسائل النقل.

### 📘 ثانياً: صفحات وأنشطة الكتاب المدرسي:
- قراءة استكشافية لصفحة 88 بالكتاب.
- حل المسائل التدريبية (مسألة 12 و 14 صفحة 92).
- نشاط التجربة الاستهلالية ص 87.

### ⏱️ ثالثاً: خطوات تنفيذ الحصة (45 دقيقة):
- التهيئة والتمهيد (5 دقائق): عرض تجربة قصور ذاتي باستخدام عملة نقدية وكوب ماء.
- التدريس والنمذجة (15 دقيقة): شرح العلاقة الطردية والعكسية واستنتاج القانون.
- التطبيق التشاركي (15 دقيقة): حل تمارين جماعية في أوراق العمل.
- الغلق والتقويم الختامي (10 دقائق): بطاقة خروج لقياس تحقق الأهداف.`,
    },
    {
      id: 'lesson_objectives_doc',
      title: 'وثيقة صياغة أهداف الدرس ونواتج التعلم المعيارية',
      desc: 'صياغة أهداف تعليمية وفق هرم بلوم ومؤشرات قياس الأداء للدرس.',
      defaultTitle: 'وثيقة أهداف درس: الجدول الدوري والتوزيع الإلكتروني',
      objectives: [
        'أن يحدد الطالب موضع العنصر في الجدول الدوري استناداً لعدده الذري.',
        'أن يربط الطالب بين عدد إلكترونات التكافؤ ورقم المجموعة.',
        'أن يستنتج الطالب تدرج الخواص الدورية (نصف القطر وطاقة التأين).'
      ],
      body: `## 🎯 وثيقة أهداف الدرس ونواتج التعلم المعيارية
المقرر: كيمياء | الصف: الثاني الثانوي
الكتاب المدرسي: كتاب كيمياء 2 - الفصل الثاني (ص 52 - 68)

### مستويات الأهداف وفق هرم بلوم:
1. التذكر: يعدد الطالب خواص الفلزات واللافلزات وأشباه الفلزات.
2. الفهم: يفسر الطالب سبب تشابه الخواص الكيميائية لعناصر المجموعة الواحدة.
3. التطبيق: يكتب الطالب التوزيع الإلكتروني لأول 20 عنصراً في الجدول الدوري.
4. التحليل: يحلل الطالب منحنى تدرج الكهروسالبية عبر الدورات والمجموعات.

### أدوات قياس وتحقق الأهداف:
- أسئلة شفهية استكشافية أثناء الحصة.
- ورقة تدريب تفاعلية لحل توزيعات العناصر.
- تقويم ختامي بربط العنصر بموقعه في الجدول الدوري.`,
    },
  ];

  // Science templates for Google Sheets focused on Study Plans & Curriculum Distribution
  const sheetTemplates = [
    {
      id: 'semester_study_plan',
      title: 'جدول توزيع الخطة الدراسية الفصلية للعلوم',
      desc: 'جدول أسابيع الفصل الدراسي مع عناوين الدروس، صفحات الكتاب المدرسي، وأهداف كل حصة.',
      defaultTitle: 'جدول توزيع الخطة الدراسية لمنهج العلوم',
      objectives: [
        'توزيع مفردات المنهج على أسابيع الفصل الدراسي.',
        'ربط كل درس بصفحات الكتاب وأهدافه المحددة.',
        'متابعة نسب إنجاز الخطة الدراسية بصورة أسبوعية.'
      ],
      headers: ['الأسبوع', 'موضوع الدرس', 'صفحات الكتاب المدرسي', 'أهداف الدرس ونواتج التعلم', 'الاستراتيجية', 'حالة التنفيذ'],
      rows: [
        ['الأسبوع 1', 'طبيعة العلم والقياس', 'ص 12 - 20', 'تعريف المنهج العلمي والفرضيات', 'استقصاء موجه', 'تم الإنجاز بنجاح'],
        ['الأسبوع 2', 'المادة وحالاتها', 'ص 22 - 34', 'التمييز بين التغير الفيزيائي والكيميائي', 'خرائط مفاهيم', 'تم الإنجاز بنجاح'],
        ['الأسبوع 3', 'الذرات والعناصر', 'ص 36 - 48', 'تركيب الذرة (بروتونات ونيوترونات)', 'تعلم تعاوني', 'قيد التنفيذ'],
        ['الأسبوع 4', 'المركبات والتفاعلات', 'ص 50 - 64', 'قانون حفظ الكتلة والمعادلات', 'تجارب معملية', 'مجدول'],
      ],
    },
    {
      id: 'objectives_tracking_matrix',
      title: 'مصفوفة تتبع تحقق أهداف الدروس للطلاب',
      desc: 'جدول لرصد نسب إتقان الطلاب لكل هدف من أهداف الدرس المحددة.',
      defaultTitle: 'مصفوفة رصد تحقق أهداف ونواتج التعلم',
      objectives: [
        'رصد درجات تحقق الأهداف المعرفية والمهارية لكل طالب.',
        'حساب نسبة إتقان الهدف على مستوى الفصل بالكامل.'
      ],
      headers: ['رقم الطالب', 'اسم الطالب', 'الهدف 1: الفهم (5)', 'الهدف 2: التطبيق (5)', 'الهدف 3: المهارة (5)', 'المجموع (15)', 'نسبة الإتقان %'],
      rows: [
        ['1', 'أحمد بن محمد', '5', '5', '4', '14', '93%'],
        ['2', 'سعد بن فهد', '4', '4', '5', '13', '87%'],
        ['3', 'فيصل بن ناصر', '5', '5', '5', '15', '100%'],
        ['4', 'سلطان بن عبدالله', '4', '3', '4', '11', '73%'],
      ],
    },
  ];

  // Science templates for Google Slides presentations
  const slideTemplates = [
    {
      id: 'presentation_lesson_explainer',
      title: 'عرض تقديمي متكامل لشرح الدرس ونواتج التعلم',
      desc: 'شرائح لشرح مفاهيم الدرس، نواتج التعلم، التفاعل الصفي، والتقويم الختامي.',
      defaultTitle: 'عرض تقديمي: قوانين نيوتن وتطبيقات القوة',
      objectives: [
        'استيعاب القوانين الفيزيائية الأساسية وتطبيقاتها.',
        'ربط المفاهيم بمواقف وأمثلة واقعية من الحياة اليومية.',
        'تقويم الفهم وتفعيل المشاركة الصفية التفاعلية.'
      ],
      slides: [
        {
          title: 'أهداف الدرس ونواتج التعلم المستهدفة',
          bullets: [
            'التعرف على مفهوم القصور الذاتي وقوانين الحركة',
            'استنتاج العلاقات الرياضية بين القوة والكتلة والتسارع',
            'حل مسائل تدريبية محاكية للاختبارات المعيارية'
          ]
        },
        {
          title: 'المفاهيم العلمية والمحتوى الدراسي',
          bullets: [
            'قانون نيوتن الأول: يظل الجسم الساكن ساكناً والمتحرك متحركاً بسرعة ثابتة ما لم تؤثر عليه قوة محصلة',
            'قانون نيوتن الثاني: القوة المحصلة = الكتلة × التسارع (F = m × a)',
            'قانون نيوتن الثالث: لكل فعل رد فعل مساوٍ له في المقدار ومعاكس له في الاتجاه'
          ]
        },
        {
          title: 'النشاط التفاعلي والتطبيق الصفي',
          bullets: [
            'تحليل مواقف الأمان في السيارات وحزام الأمان والوسائد الهوائية',
            'مناقشة جماعية في مجموعات التعلم النشط',
            'استخراج القوة المحصلة في مخططات الأجسام الحرة'
          ]
        },
        {
          title: 'التقويم الختامي والتكليف المنزلي',
          bullets: [
            'سؤال التحدي السريع لبطاقة الخروج من الحصة',
            'حل المسائل التدريبية بالكتاب المدرسي ص 44',
            'توثيق الملاحظات في كراسة العلوم'
          ]
        }
      ]
    },
    {
      id: 'presentation_lab_experiment',
      title: 'عرض تقديمي للتجارب المعملية والاستقصاء العلمي',
      desc: 'شرائح لإرشادات السلامة، أدوات التجربة، خطوات العمل المخبري، وتحليل النتائج.',
      defaultTitle: 'عرض تقديمي: تجربة تفاعلات الأحماض والقواعد ومؤشرات pH',
      objectives: [
        'اتباع إرشادات السلامة في مختبر العلوم.',
        'استخدام الكواشف الكيميائية للتمييز بين المواد.',
        'تسجيل ومقارنة النتائج المخبرية في جداول الرصد.'
      ],
      slides: [
        {
          title: 'إرشادات السلامة والأمان في مختبر العلوم',
          bullets: [
            'ارتداء معطف المختبر والنظارات الواقية طوال فترة العمل',
            'التعامل بحذر شديد مع المحاليل والأحماض والحرارة',
            'غسل اليدين والتخلص السليم من النفايات الكيميائية'
          ]
        },
        {
          title: 'الأدوات والمواد المستخدمة في التجربة',
          bullets: [
            'أنابيب اختبار وحامل أنابيب وماصات مدرجة',
            'أوراق تباع الشمس وكاشف الفينولفثالين ومقياس pH الرقمي',
            'عينات محاليل: حمض الهيدروكلوريك المخفف، هيدروكسيد الصوديوم، عصير ليمون، ماء مقطر'
          ]
        },
        {
          title: 'خطوات العمل والمشاهدات المخبرية',
          bullets: [
            'إضافة قطرات من الكواشف إلى كل أنبوب اختبار',
            'ملاحظة التغير اللوني وتسجيل قراءة الرقم الهيدروجيني بدقة',
            'تصنيف العينات إلى حمضية، قاعدية، أو متعادلة'
          ]
        },
        {
          title: 'الاستنتاج والتقرير المخبري',
          bullets: [
            'المحاليل ذات الرقم الهيدروجيني أقل من 7 حمضية، وأكثر من 7 قاعدية',
            'تدوين النتائج في دفتر التجارب العملية',
            'تنظيف أدوات المختبر وإعادتها لأماكنها المخصصة'
          ]
        }
      ]
    },
    {
      id: 'presentation_revision_quiz',
      title: 'عرض تقديمي لمراجعة واختبارات العلوم التفاعلية',
      desc: 'شرائح لمراجعة الوحدة، بنك أسئلة تفاعلية ومسائل تدريبية لاختبارات الطلاب.',
      defaultTitle: 'عرض مراجعة شاملة: الخلية والوراثة والتركيب الحيوي',
      objectives: [
        'استرجاع المفاهيم العلمية الأساسية المقررة.',
        'حل بنك أسئلة تدريبية تحاكي الاختبارات الدورية.',
        'تعزيز مهارات التفكير العلمي وحل المشكلات.'
      ],
      slides: [
        {
          title: 'خريطة المفاهيم الرئيسية للوحدة',
          bullets: [
            'الخلية كوحدة بناء أساسية للكائنات الحية',
            'مقارنة بين الخلية النباتية والخلية الحيوانية',
            'قوانين الوراثة المندلية وتضاعف المادة الوراثية DNA'
          ]
        },
        {
          title: 'مسائل وتحديات علمية تفاعلية',
          bullets: [
            'السؤال الأول: اختر الإجابة الصحيحة مع التعليل العلمي',
            'السؤال الثاني: ما أثر غياب البلاستيدات الخضراء على الكائن الحي؟',
            'السؤال الثالث: استخدام مربع بانيت لتوقع النتائج الوراثية'
          ]
        },
        {
          title: 'مفاتيح الإجابة النموذجية والتغذية الراجعة',
          bullets: [
            'توضيح الحلول خطوة بخطوة بالاستناد لمعايير الكتاب',
            'تحديد الأخطاء الشائعة لتجنبها في الاختبارات',
            'نصائح للاستذكار الفعال وتلخيص الدروس'
          ]
        }
      ]
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (resourceType === 'gdoc') {
      const tmpl = docTemplates.find((t) => t.id === templateId);
      if (tmpl) setTitle(tmpl.defaultTitle);
    } else if (resourceType === 'gsheet') {
      const tmpl = sheetTemplates.find((t) => t.id === templateId);
      if (tmpl) setTitle(tmpl.defaultTitle);
    } else {
      const tmpl = slideTemplates.find((t) => t.id === templateId);
      if (tmpl) setTitle(tmpl.defaultTitle);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!title.trim()) {
      setErrorMessage('يرجى تحديد عنوان للخطة أو العرض أو أهداف الدرس');
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      if (resourceType === 'gdoc') {
        const tmpl = docTemplates.find((t) => t.id === selectedTemplate) || docTemplates[0];
        const result = await createGoogleDoc(title.trim(), discipline, tmpl.body);
        
        setCreatedResource({
          id: result.id,
          webViewLink: result.webViewLink,
          exportPdfUrl: result.exportPdfUrl,
          exportOfficeUrl: result.exportOfficeUrl,
        });

        const newFile: ScienceFile = {
          id: `gdoc-${result.id}`,
          title: title.trim(),
          resourceType: selectedTemplate === 'lesson_objectives_doc' ? 'lesson_objectives' : 'lesson_plan',
          discipline,
          stage,
          gradeLevel,
          term: 'الفصل الدراسي الحالي',
          textbookName: textbookName.trim() || 'كتاب العلوم المعتمد',
          unitAndChapter: unitAndChapter.trim() || 'الوحدة المقررة',
          lessonObjectives: tmpl.objectives,
          description: tmpl.desc,
          fileType: 'gdoc',
          fileName: `${title.trim()}.gdoc`,
          fileSize: '115 KB',
          uploadDate: new Date().toISOString().split('T')[0],
          teacherName: user.displayName || 'معلم العلوم',
          teacherAvatar: user.photoURL || undefined,
          downloadCount: 0,
          viewCount: 1,
          webViewLink: result.webViewLink,
          googleDriveId: result.id,
          rawContent: tmpl.body,
          tags: ['خطة دراسية', 'Google Docs', 'أهداف الدرس', discipline],
        };
        onSuccess(newFile);
      } else if (resourceType === 'gsheet') {
        const tmpl = sheetTemplates.find((t) => t.id === selectedTemplate) || sheetTemplates[0];
        const result = await createGoogleSheet(title.trim(), tmpl.headers, tmpl.rows);

        setCreatedResource({
          id: result.id,
          webViewLink: result.webViewLink,
          exportPdfUrl: result.exportPdfUrl,
          exportOfficeUrl: result.exportOfficeUrl,
        });

        const newFile: ScienceFile = {
          id: `gsheet-${result.id}`,
          title: title.trim(),
          resourceType: 'lesson_plan',
          discipline,
          stage,
          gradeLevel,
          term: 'الفصل الدراسي الحالي',
          textbookName: textbookName.trim() || 'كتاب العلوم المعتمد',
          unitAndChapter: unitAndChapter.trim() || 'الوحدة المقررة',
          lessonObjectives: tmpl.objectives,
          description: tmpl.desc,
          fileType: 'gsheet',
          fileName: `${title.trim()}.gsheet`,
          fileSize: '180 KB',
          uploadDate: new Date().toISOString().split('T')[0],
          teacherName: user.displayName || 'معلم العلوم',
          teacherAvatar: user.photoURL || undefined,
          downloadCount: 0,
          viewCount: 1,
          webViewLink: result.webViewLink,
          googleDriveId: result.id,
          rawContent: `${tmpl.headers.join(' | ')}\n` + tmpl.rows.map((r) => r.join(' | ')).join('\n'),
          tags: ['خطة دراسية', 'Google Sheets', 'توزيع منهج', discipline],
        };
        onSuccess(newFile);
      } else {
        // Google Slides creation
        const tmpl = slideTemplates.find((t) => t.id === selectedTemplate) || slideTemplates[0];
        const result = await createGoogleSlide(title.trim(), discipline, tmpl.slides);

        setCreatedResource({
          id: result.id,
          webViewLink: result.webViewLink,
          exportPdfUrl: result.exportPdfUrl,
          exportOfficeUrl: result.exportOfficeUrl,
        });

        const rawSlidesText = tmpl.slides.map((s, idx) => 
          `الشريحة ${idx + 1}: ${s.title}\n` + s.bullets.map(b => `• ${b}`).join('\n')
        ).join('\n\n');

        const newFile: ScienceFile = {
          id: `gslides-${result.id}`,
          title: title.trim(),
          resourceType: 'lesson_plan',
          discipline,
          stage,
          gradeLevel,
          term: 'الفصل الدراسي الحالي',
          textbookName: textbookName.trim() || 'كتاب العلوم المعتمد',
          unitAndChapter: unitAndChapter.trim() || 'الوحدة المقررة',
          lessonObjectives: tmpl.objectives,
          description: tmpl.desc,
          fileType: 'gslides',
          fileName: `${title.trim()}.gslides`,
          fileSize: '2.5 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          teacherName: user.displayName || 'معلم العلوم',
          teacherAvatar: user.photoURL || undefined,
          downloadCount: 0,
          viewCount: 1,
          webViewLink: result.webViewLink,
          googleDriveId: result.id,
          rawContent: rawSlidesText,
          tags: ['عرض تقديمي', 'Google Slides', 'مدرسة أنس بن مالك', discipline],
        };
        onSuccess(newFile);
      }
    } catch (err: any) {
      console.error('Failed to create Workspace resource:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بخدمات Google');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="google-workspace-modal-box"
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
                <span>إنشاء خطة دراسية أو أهداف درس</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تكامل Google Workspace لمدرسة أنس بن مالك الخاصة (نماذج معتمدة)
              </p>
            </div>
          </div>
          <button
            id="close-workspace-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth prompt if logged out */}
        {!user && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <p className="text-xs font-semibold">
                لإنشاء مستندات أو جداول في حساب Google الخاص بك، يلزم تسجيل الدخول بحساب Google أولاً.
              </p>
            </div>
            <button
              onClick={onRequireAuth}
              className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              تسجيل الدخول الآن
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner if already created */}
        {createdResource && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                {resourceType === 'gslides'
                  ? 'تم حفظ العرض التقديمي بنجاح في Google Drive ومشاركته في منصة العلوم!'
                  : 'تم حفظ الخطة بنجاح في Google Drive ومشاركتها في منصة العلوم للمعلمين!'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <a
                href={createdResource.webViewLink}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                  resourceType === 'gslides'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : resourceType === 'gsheet'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {resourceType === 'gslides' ? (
                  <Presentation className="w-3.5 h-3.5" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>
                  {resourceType === 'gslides'
                    ? 'فتح وتعديل العرض في Google Slides'
                    : resourceType === 'gsheet'
                    ? 'فتح وتعديل الجدول في Google Sheets'
                    : 'فتح وتعديل الخطة في Google Docs'}
                </span>
              </a>
              {createdResource.exportOfficeUrl && (
                <button
                  onClick={() =>
                    downloadScienceFile(
                      createdResource.exportOfficeUrl!,
                      resourceType === 'gslides' ? `${title}.pptx` : `${title}.xlsx`,
                      true
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {resourceType === 'gslides' ? 'تنزيل PowerPoint (PPTX)' : 'تنزيل Excel (XLSX)'}
                  </span>
                </button>
              )}
              {createdResource.exportPdfUrl && (
                <button
                  onClick={() => downloadScienceFile(createdResource.exportPdfUrl!, `${title}.pdf`, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>تنزيل نسخة PDF</span>
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 space-y-5">
          
          {/* Resource Type Tabs: Google Docs, Google Sheets, Google Slides */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر التطبيق عبر Google Workspace:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Google Docs */}
              <button
                type="button"
                id="select-gdoc-tab"
                onClick={() => {
                  setResourceType('gdoc');
                  const tmpl = docTemplates[0];
                  setSelectedTemplate(tmpl.id);
                  setTitle(tmpl.defaultTitle);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition cursor-pointer text-right ${
                  resourceType === 'gdoc'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${resourceType === 'gdoc' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Google Docs</p>
                  <p className="text-[10px] text-slate-500 truncate">خطة درس نموذجية</p>
                </div>
              </button>

              {/* Google Sheets */}
              <button
                type="button"
                id="select-gsheet-tab"
                onClick={() => {
                  setResourceType('gsheet');
                  const tmpl = sheetTemplates[0];
                  setSelectedTemplate(tmpl.id);
                  setTitle(tmpl.defaultTitle);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition cursor-pointer text-right ${
                  resourceType === 'gsheet'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${resourceType === 'gsheet' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Google Sheets</p>
                  <p className="text-[10px] text-slate-500 truncate">توزيع منهج وأهداف</p>
                </div>
              </button>

              {/* Google Slides */}
              <button
                type="button"
                id="select-gslides-tab"
                onClick={() => {
                  setResourceType('gslides');
                  const tmpl = slideTemplates[0];
                  setSelectedTemplate(tmpl.id);
                  setTitle(tmpl.defaultTitle);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border transition cursor-pointer text-right ${
                  resourceType === 'gslides'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${resourceType === 'gslides' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600'}`}>
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Google Slides</p>
                  <p className="text-[10px] text-slate-500 truncate">عرض تقديمي للدرس</p>
                </div>
              </button>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {resourceType === 'gslides' 
                ? 'اختر نموذج العرض التقديمي في Google Slides:'
                : 'اختر نموذج الخطة أو أهداف الدرس:'}
            </label>
            <div className="space-y-2">
              {(resourceType === 'gdoc' 
                ? docTemplates 
                : resourceType === 'gsheet' 
                ? sheetTemplates 
                : slideTemplates
              ).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-right ${
                    selectedTemplate === tmpl.id
                      ? resourceType === 'gslides'
                        ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500/20'
                        : resourceType === 'gsheet'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20'
                        : 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {resourceType === 'gslides' ? (
                          <Presentation className="w-3.5 h-3.5 text-amber-600" />
                        ) : resourceType === 'gsheet' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{tmpl.title}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {tmpl.desc}
                      </p>
                    </div>
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      {selectedTemplate === tmpl.id && (
                        <span className={`w-2 h-2 rounded-full ${
                          resourceType === 'gslides' ? 'bg-amber-600' : resourceType === 'gsheet' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`} />
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان الخطة الدراسية / أهداف الدرس: *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: خطة درس قوانين نيوتن وتطبيقات القوة"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>

          {/* Textbook mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                اسم الكتاب المدرسي المقرر:
              </label>
              <input
                type="text"
                value={textbookName}
                onChange={(e) => setTextbookName(e.target.value)}
                placeholder="مثال: كتاب الفيزياء 1"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                الوحدة والفصل ورقم الصفحات:
              </label>
              <input
                type="text"
                value={unitAndChapter}
                onChange={(e) => setUnitAndChapter(e.target.value)}
                placeholder="مثال: الفصل 4 (ص 88 - ص 95)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Discipline and Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المادة الدراسية:
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
                المرحلة / الصف الدراسي:
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

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-sm transition disabled:opacity-60 cursor-pointer ${
                resourceType === 'gslides'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : resourceType === 'gsheet'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارِ الإنشاء عبر Google Workspace...</span>
                </>
              ) : (
                <>
                  {resourceType === 'gslides' ? (
                    <Presentation className="w-4 h-4" />
                  ) : resourceType === 'gsheet' ? (
                    <FileSpreadsheet className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>
                    {resourceType === 'gslides'
                      ? 'إنشاء عرض Google Slides وحفظه'
                      : 'إنشاء وحفظ في Google Drive'}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
