# Design: izSend

## Mục tiêu
Làm 1 web share file đơn giản với 3 kiểu share sau khi upload:
1) Link random slug (`/f/:slug`)
2) Short code (`/c/:code`) dẫn tới trang download
3) QR code (encode link tới trang download)

Passcode là **tùy chọn**: nếu user đặt passcode thì áp dụng cho cả 3 kiểu share.

## Ràng buộc
- Max file size: **50MB**
- Hết hạn sau **7 ngày**: xóa file trên storage + dọn metadata DB
- Không giới hạn lượt tải; có rate limit theo **IP** để chống spam

## Kiến trúc (phương án đã chốt)
- Upload đi qua API (Fastify) → S3
- Download: trang download gọi API để xin **presigned GET URL TTL ngắn** → browser tải trực tiếp từ S3

## Data model (Postgres)
Bảng `files`:
- `id` UUID PK
- `slug` TEXT UNIQUE
- `code` TEXT UNIQUE
- `original_name` TEXT
- `content_type` TEXT
- `size_bytes` BIGINT
- `s3_key` TEXT UNIQUE
- `passcode_hash` TEXT NULL
- `created_at` TIMESTAMPTZ
- `expires_at` TIMESTAMPTZ
- `deleted_at` TIMESTAMPTZ NULL

## API
- `POST /api/files` (multipart: `file`, optional `passcode`)
  - trả về: `slug`, `code`, `expiresAt`, `requiresPasscode`
- `GET /api/files/slug/:slug` → metadata
- `GET /api/files/code/:code` → metadata
- `POST /api/files/:id/presign` body `{ passcode? }` → `{ url }`

## Rate limit (theo IP)
- Upload: chặt hơn
- Presign: vừa phải

## Cleanup job
- Định kỳ query file hết hạn (`expires_at < now()` và `deleted_at is null`)
- Xóa object S3 (`DeleteObject`)
- Set `deleted_at`

## UX
- Upload page: chọn file + (optional) passcode → upload → hiển thị share link + code + QR
- Download page:
  - nếu cần passcode: yêu cầu nhập
  - nút Download → gọi presign → redirect sang presigned URL
  - nếu expired: thông báo “file đã hết hạn”