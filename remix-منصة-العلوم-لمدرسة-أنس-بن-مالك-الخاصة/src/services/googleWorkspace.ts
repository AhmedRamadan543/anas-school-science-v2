import { getAccessToken } from './firebaseAuth';

export interface CreatedGoogleResource {
  id: string;
  title: string;
  type: 'gdoc' | 'gsheet' | 'gslides';
  webViewLink: string;
  exportPdfUrl?: string;
  exportOfficeUrl?: string;
}

/**
 * Creates a science lesson plan or document in Google Docs
 */
export async function createGoogleDoc(
  title: string,
  scienceTopic: string,
  contentBody: string
): Promise<CreatedGoogleResource> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لإنشاء مستند');
  }

  // 1. Create empty Google Doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `${title} - [منصة العلوم]`,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل في إنشاء مستند Google Docs');
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // 2. Insert science lesson content into the document
  const fullText = `🔬 ${title}\n` +
    `موضوع الدرس: ${scienceTopic}\n` +
    `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}\n` +
    `المصدر: منصة العلوم التعليمية للمعلمين\n` +
    `--------------------------------------------------\n\n` +
    `${contentBody}\n\n` +
    `--------------------------------------------------\n` +
    `ملاحظات المعلم وتقييم الطلاب:\n` +
    `• أهداف التعلم المحققة: [   ]\n` +
    `• أسئلة التفكير الناقد والمناقشة: \n`;

  try {
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullText,
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Could not insert initial text into doc:', e);
  }

  return {
    id: documentId,
    title: title,
    type: 'gdoc',
    webViewLink: `https://docs.google.com/document/d/${documentId}/edit`,
    exportPdfUrl: `https://docs.google.com/document/d/${documentId}/export?format=pdf`,
    exportOfficeUrl: `https://docs.google.com/document/d/${documentId}/export?format=docx`,
  };
}

/**
 * Creates a science lab results or calculation sheet in Google Sheets
 */
export async function createGoogleSheet(
  title: string,
  headers: string[],
  initialRows: string[][]
): Promise<CreatedGoogleResource> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لإنشاء جدول البيانات');
  }

  const rowDataList = [
    {
      values: headers.map((h) => ({
        userEnteredValue: { stringValue: h },
        userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor: { red: 0.1, green: 0.6, blue: 0.5 }, // Emerald theme
        },
      })),
    },
    ...initialRows.map((row) => ({
      values: row.map((cell) => ({
        userEnteredValue: { stringValue: cell },
      })),
    })),
  ];

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${title} - [منصة العلوم]`,
      },
      sheets: [
        {
          properties: {
            title: 'رصد النتائج المخبرية',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: rowDataList,
            },
          ],
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل في إنشاء جدول Google Sheets');
  }

  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;

  return {
    id: spreadsheetId,
    title: title,
    type: 'gsheet',
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    exportPdfUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf`,
    exportOfficeUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`,
  };
}

/**
 * Creates a science lesson presentation in Google Slides
 */
export async function createGoogleSlide(
  title: string,
  scienceTopic: string,
  slidesData: Array<{ title: string; bullets: string[] }>
): Promise<CreatedGoogleResource> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لإنشاء العرض التقديمي');
  }

  // 1. Create the base presentation
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `${title} - مدرسة أنس بن مالك الخاصة`,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل في إنشاء عرض Google Slides');
  }

  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;

  // 2. Add slide requests using batchUpdate
  try {
    const requests: any[] = [];

    slidesData.forEach((slideItem, index) => {
      const slidePageId = `slide_page_${index}_${Date.now()}`;
      const titleBoxId = `title_box_${index}_${Date.now()}`;
      const bodyBoxId = `body_box_${index}_${Date.now()}`;

      // Create slide with blank layout
      requests.push({
        createSlide: {
          objectId: slidePageId,
          insertionIndex: index + 1,
          slideLayoutReference: {
            predefinedLayout: 'BLANK',
          },
        },
      });

      // Add Title text box
      requests.push({
        createShape: {
          objectId: titleBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slidePageId,
            size: {
              width: { magnitude: 650, unit: 'PT' },
              height: { magnitude: 60, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 35,
              translateY: 25,
              unit: 'PT',
            },
          },
        },
      });

      requests.push({
        insertText: {
          objectId: titleBoxId,
          text: `🔬 ${slideItem.title}`,
        },
      });

      // Add Body text box
      const bodyContent = slideItem.bullets.map((b) => `• ${b}`).join('\n') + 
        `\n\n[مدرسة أنس بن مالك الخاصة - قسم العلوم | المادة: ${scienceTopic}]`;

      requests.push({
        createShape: {
          objectId: bodyBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slidePageId,
            size: {
              width: { magnitude: 650, unit: 'PT' },
              height: { magnitude: 280, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 35,
              translateY: 95,
              unit: 'PT',
            },
          },
        },
      });

      requests.push({
        insertText: {
          objectId: bodyBoxId,
          text: bodyContent,
        },
      });
    });

    if (requests.length > 0) {
      await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });
    }
  } catch (slideErr) {
    console.warn('Could not populate initial slides into Google Slides:', slideErr);
  }

  return {
    id: presentationId,
    title: title,
    type: 'gslides',
    webViewLink: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    exportPdfUrl: `https://docs.google.com/presentation/d/${presentationId}/export/pdf`,
    exportOfficeUrl: `https://docs.google.com/presentation/d/${presentationId}/export/pptx`,
  };
}

/**
 * Upload a science file directly to Google Drive
 */
export async function uploadFileToDrive(
  file: File,
  description: string
): Promise<{ id: string; name: string; webViewLink: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لرفع الملف إلى Google Drive');
  }

  const metadata = {
    name: file.name,
    description: `${description} [منصة العلوم]`,
    mimeType: file.type || 'application/octet-stream',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'تعذر رفع الملف إلى Google Drive');
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
}

/**
 * Download or trigger download for any file or Google Doc/Sheet export
 */
export async function downloadScienceFile(
  urlOrBlob: string | Blob,
  fileName: string,
  isGoogleExport: boolean = false
) {
  if (isGoogleExport && typeof urlOrBlob === 'string') {
    const token = await getAccessToken();
    if (token) {
      // Fetch with auth header to get the exported file
      try {
        const response = await fetch(urlOrBlob, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          triggerBrowserDownload(downloadUrl, fileName);
          return;
        }
      } catch (err) {
        console.warn('Direct fetch export failed, opening web export link:', err);
      }
    }
    // Fallback: open export link in new window/tab
    window.open(urlOrBlob, '_blank');
    return;
  }

  if (typeof urlOrBlob === 'string') {
    triggerBrowserDownload(urlOrBlob, fileName);
  } else {
    const downloadUrl = URL.createObjectURL(urlOrBlob);
    triggerBrowserDownload(downloadUrl, fileName);
  }
}

function triggerBrowserDownload(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
