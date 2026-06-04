# Morphiqo

Morphiqo, React + TypeScript + Vite ile yapılmış basit bir dosya dönüştürme arayüzüdür.

Bu proje öğrenci projesi mantığında tutuldu: kod parçaları küçük, isimler anlaşılır ve backend entegrasyonu sade bir API client üzerinden hazırlandı.

## Çalıştırma

```bash
npm install
npm run dev
```

Frontend varsayılan olarak Vite ile çalışır:

```bash
http://localhost:5173
```

Backend'i ayrı terminalde çalıştır:

```bash
npm run dev:api
```

Backend varsayılan olarak şurada çalışır:

```bash
http://localhost:3000
```

## Backend ayarı

Backend varsa `.env` dosyasına şunu yaz:

```bash
VITE_API_BASE_URL=http://localhost:3000
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

Backend yoksa frontend geliştirme modunda mock fallback kullanır.

## Planlanan API

- `POST /api/convert`: Dosyayı `multipart/form-data` ile yükler ve job oluşturur.
- `GET /api/jobs/:jobId`: Job durumunu ve progress bilgisini döner.
- `GET /api/jobs/:jobId/download`: Tamamlanan dosyayı indirir.
- `GET /api/formats`: Formatları ve motor planını döner.

## Backend motor fikri

- Image: Sharp veya ImageMagick
- Video/audio: FFmpeg
- Word, Excel, PowerPoint -> PDF: LibreOffice headless
- Markdown, HTML, TXT -> PDF/DOCX: Pandoc
- Archive: 7zip

## Şu an çalışan backend

- Express + TypeScript server hazır.
- `uploads` ve `outputs` klasörleri otomatik oluşur.
- In-memory job store kullanılır.
- Maksimum dosya boyutu 100 MB.
- Dosya adları temizlenir.
- Sadece desteklenen uzantılara izin verilir.
- Sharp ile `jpg`, `png`, `webp` dönüşümleri çalışır.
- FFmpeg ve LibreOffice için servis altyapısı hazırdır.
- Komutlar `spawn` ile çalışır, kullanıcı dosya adı direkt shell'e verilmez.

Örnek istek:

```bash
curl -F "file=@example.png" -F "targetFormat=webp" http://localhost:3000/api/convert
```

## Ana dosyalar

- `src/config/conversionRules.ts`: Formatlar ve dönüşüm kuralları.
- `src/services/clientConversionService.ts`: Frontend API client, polling ve mock fallback.
- `src/services/conversionService.ts`: Backend dönüşüm yönlendirme servisi.
- `src/server.ts`: Express backend başlangıcı.
- `src/routes/convert.ts`: Upload ve job oluşturma endpoint'i.
- `src/routes/jobs.ts`: Status ve download endpoint'leri.
- `src/services/imageService.ts`: Sharp image dönüşümleri.
- `src/hooks/useConversionManager.ts`: Queue, history ve job yönetimi.
- `src/components/ConversionQueue.tsx`: İşlem kuyruğu.
- `src/components/ConversionHistory.tsx`: Sol panel ve localStorage geçmişi.
