# Vercel Deployment Rehberi

Bu dokümantasyon, projenin Vercel'e deploy edilmesi için gerekli adımları açıklar.

## Gerekli Environment Variables

Vercel'de aşağıdaki environment variable'ları **mutlaka** ayarlamanız gerekir:

### 1. DATABASE_URL (Zorunlu)

Supabase PostgreSQL connection string'i. Vercel'de **Production**, **Preview** ve **Development** ortamları için ayarlayın.

**Vercel'de ayarlama:**
1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. `DATABASE_URL` adında yeni bir variable ekleyin
3. Değer olarak Supabase connection string'inizi girin:
   - **Transaction Pooler** (serverless için önerilen): `postgresql://postgres.tlyqskrarmomzpvxuvbb:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`
   - **Session Pooler** (migration için): `postgresql://postgres.tlyqskrarmomzpvxuvbb:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
   - **Direct Connection**: `postgresql://postgres:[YOUR-PASSWORD]@db.tlyqskrarmomzpvxuvbb.supabase.co:5432/postgres`

**Önemli:** 
- Production için **Transaction Pooler** kullanın (port 6543)
- Migration'lar için **Session Pooler** veya **Direct Connection** kullanın

### 2. NODE_ENV (Opsiyonel)

Vercel otomatik olarak `NODE_ENV=production` ayarlar, manuel eklemenize gerek yok.

## Build Ayarları

Proje `package.json`'da şu script'leri içerir:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

Bu sayede:
- `postinstall`: Vercel dependency install sonrası otomatik Prisma Client generate eder
- `build`: Build öncesi Prisma Client generate eder ve sonra Next.js build çalışır

## Migration'lar

Vercel'de migration'ları çalıştırmak için:

1. **İlk deploy öncesi:** Local'de migration'ları çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```

2. **Vercel Build Command'e eklemek (opsiyonel):**
   Vercel Dashboard > Settings > Build & Development Settings
   Build Command: `prisma generate && prisma migrate deploy && next build`

   **Not:** Bu genellikle gerekli değildir, çünkü migration'ları local'de çalıştırabilirsiniz.

## Deployment Adımları

1. **GitHub/GitLab'a push edin:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Vercel'e bağlayın:**
   - Vercel Dashboard > New Project
   - GitHub repository'nizi seçin
   - Framework Preset: **Next.js** (otomatik algılanır)

3. **Environment Variables ekleyin:**
   - Settings > Environment Variables
   - `DATABASE_URL` ekleyin (yukarıdaki değerlerle)

4. **Deploy edin:**
   - Deploy butonuna tıklayın
   - Build loglarını kontrol edin

## Sorun Giderme

### Build Hatası: "Prisma Client not generated"

**Çözüm:** `package.json`'da `postinstall` script'inin olduğundan emin olun.

### Build Hatası: "DATABASE_URL is not defined"

**Çözüm:** Vercel Dashboard'da Environment Variables'ı kontrol edin. Production, Preview ve Development için ayrı ayrı eklemeniz gerekebilir.

### Migration Hatası

**Çözüm:** Local'de migration'ları çalıştırın:
```bash
npx prisma migrate deploy
```

### Connection Timeout

**Çözüm:** Transaction Pooler kullanın (port 6543) ve IPv4 uyumlu olduğundan emin olun.

## Önemli Notlar

- `.env` dosyası git'e commit edilmez (`.gitignore`'da)
- Vercel'de environment variable'ları **mutlaka** manuel olarak eklemeniz gerekir
- Production'da asla SQLite kullanmayın, PostgreSQL kullanın
- Supabase connection string'inde password'ü doğru girdiğinizden emin olun




