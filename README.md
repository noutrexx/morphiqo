# Morphiqo

Morphiqo, React + TypeScript + Vite ile yapılmış basit bir dosya dönüştürme arayüzüdür.

Bu proje öğrenci projesi mantığında tutuldu: kod parçaları küçük, isimler anlaşılır ve backend entegrasyonu sade bir API client üzerinden hazırlandı.

## Çalıştırma

```bash
npm install
npm run dev
```

## Backend ayarı

Backend varsa `.env` dosyasına şunu yaz:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Backend yoksa uygulama geliştirme modunda mock fallback kullanır.

## Planlanan API

- `POST /api/convert`: Dosyayı `multipart/form-data` ile yükler ve job oluşturur.
- `GET /api/jobs/:jobId`: Job durumunu ve progress bilgisini döner.
- `GET /api/jobs/:jobId/download`: Tamamlanan dosyayı indirir.

## Backend motor fikri

- Image: Sharp veya ImageMagick
- Video/audio: FFmpeg
- Word, Excel, PowerPoint -> PDF: LibreOffice headless
- Markdown, HTML, TXT -> PDF/DOCX: Pandoc
- Archive: 7zip

## Ana dosyalar

- `src/config/conversionRules.ts`: Formatlar ve dönüşüm kuralları.
- `src/services/conversionService.ts`: API client, polling ve mock fallback.
- `src/hooks/useConversionManager.ts`: Queue, history ve job yönetimi.
- `src/components/ConversionQueue.tsx`: İşlem kuyruğu.
- `src/components/ConversionHistory.tsx`: Sol panel ve localStorage geçmişi.
