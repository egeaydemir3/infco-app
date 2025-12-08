# Environment Variables Setup

Bu dokümantasyon, projenin local geliştirme ortamı için gerekli environment variable'ları açıklar.

## Local Geliştirme İçin Gerekli Değişkenler

### 1. DATABASE_URL (Zorunlu)

Prisma veritabanı bağlantı URL'i. Local development için SQLite kullanılıyor.

**Local Development:**
```
DATABASE_URL="file:./dev.db"
```

**Production:**
Production ortamında PostgreSQL, MySQL veya başka bir veritabanı kullanıyorsanız, ilgili connection string'i kullanın:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 2. NODE_ENV (Opsiyonel)

Next.js otomatik olarak development/production modunu algılar, ancak manuel olarak da ayarlanabilir.

**Local Development:**
```
NODE_ENV="development"
```

**Production:**
```
NODE_ENV="production"
```

## Dosya Yapısı

- `.env` - Local development için gerçek değerler (git'e commit edilmez)
- `.env.example` - Template dosya, hangi değişkenlerin gerekli olduğunu gösterir (git'e commit edilir)

## Kurulum

1. Proje kök dizininde `.env` dosyasının olduğundan emin olun
2. `.env.example` dosyasını referans alarak `.env` dosyasını oluşturun
3. Gerekli değerleri `.env` dosyasına ekleyin

## Prisma Configuration

Prisma, `prisma.config.ts` dosyasında `dotenv/config` import ederek `.env` dosyasını otomatik olarak yükler. Bu sayede `DATABASE_URL` otomatik olarak okunur.

## Production Deployment

Production ortamında (örneğin Vercel, Supabase, vb.) bu environment variable'ları platform'un environment variable ayarlarından eklemeniz gerekir:

1. Vercel için: Project Settings > Environment Variables
2. Supabase için: Project Settings > Environment Variables
3. Diğer platformlar için ilgili dokümantasyonu kontrol edin

**Önemli:** Production'da `DATABASE_URL` mutlaka gerçek veritabanı connection string'i olmalıdır. SQLite local development için kullanılır, production'da önerilmez.

## Kullanılan Environment Variables

Projede şu environment variable'lar kullanılıyor:

- `DATABASE_URL` - Prisma veritabanı bağlantısı için (zorunlu)
- `NODE_ENV` - Next.js ortam modu için (opsiyonel, Next.js otomatik algılar)

## Notlar

- `.env` dosyası `.gitignore` içinde olduğu için git'e commit edilmez
- `.env.example` dosyası template olarak git'e commit edilir
- Production'da asla `.env` dosyasını commit etmeyin
- Secret key'ler ve hassas bilgiler için production ortamında güvenli environment variable yönetimi kullanın


