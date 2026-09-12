export type ScienceDiscipline = 
  | 'all'
  | 'physics'        // فيزياء
  | 'chemistry'      // كيمياء
  | 'biology'        // أحياء
  | 'science'        // علوم
  | 'environmental'; // علوم بيئية

export type EducationalStage = 
  | 'all'
  | 'grade_5'   // صف خامس
  | 'grade_6'   // صف سادس
  | 'grade_7'   // صف سابع
  | 'grade_8'   // صف ثامن
  | 'grade_9'   // صف تاسع
  | 'grade_10'  // صف عاشر
  | 'grade_11'  // صف حادي عشر
  | 'grade_12'; // صف ثاني عشر

export const STAGE_LABELS: Record<Exclude<EducationalStage, 'all'>, string> = {
  grade_5: 'صف خامس',
  grade_6: 'صف سادس',
  grade_7: 'صف سابع',
  grade_8: 'صف ثامن',
  grade_9: 'صف تاسع',
  grade_10: 'صف عاشر',
  grade_11: 'صف حادي عشر',
  grade_12: 'صف ثاني عشر',
};

export const DISCIPLINE_LABELS: Record<Exclude<ScienceDiscipline, 'all'>, string> = {
  physics: 'فيزياء',
  chemistry: 'كيمياء',
  biology: 'أحياء',
  science: 'علوم',
  environmental: 'علوم بيئية',
};

export type CoreResourceType = 
  | 'all'
  | 'lesson_plan'       // خطة دراسية / تحضير درس
  | 'textbook'          // كتاب دراسي / وحدة منهجية
  | 'lesson_objectives'; // أهداف الدرس ونواتج التعلم

export interface ScienceFile {
  id: string;
  title: string;
  resourceType: Exclude<CoreResourceType, 'all'>; // خطة دراسية أو كتاب دراسي أو أهداف درس
  discipline: Exclude<ScienceDiscipline, 'all'>;
  stage: Exclude<EducationalStage, 'all'>;
  gradeLevel: string; // e.g. "صف تاسع" أو "صف ثاني عشر"
  term: string; // e.g. "الفصل الدراسي الأول"
  textbookName: string; // e.g. "كتاب الفيزياء - مدرسة أنس بن مالك"
  unitAndChapter: string; // e.g. "الوحدة الأولى: الميكانيكا والطاقة"
  lessonObjectives: string[]; // أهداف الدرس السلوكية والتعليمية المحددة بدقة
  description: string;
  fileType: 'gdoc' | 'gsheet' | 'gslides' | 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'text';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  teacherName: string;
  teacherAvatar?: string;
  downloadCount: number;
  viewCount: number;
  url?: string;
  googleDriveId?: string;
  webViewLink?: string;
  rawContent?: string;
  tags: string[];
}


export interface TeacherUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
