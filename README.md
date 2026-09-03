# Rin-Email

Vercel Serverless Function for sending emails via SMTP. Used as an email relay for Rin blog on Cloudflare Workers.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_PASS` | Yes | API password for authenticating requests from Rin blog |
| `SMTP_HOST` | Conditional | SMTP server host (e.g. `smtp.163.com`). Required if `SMTP_SERVICE` is not set. |
| `SMTP_PORT` | No | SMTP port (default: `465`) |
| `SMTP_USER` | Yes | SMTP authentication username |
| `SMTP_PASS` | Yes | SMTP authentication password |
| `SMTP_MAIL` | Yes | Sender email address |
| `SMTP_SERVICE` | Conditional | Nodemailer built-in service name (e.g. `qq`, `gmail`, `163`). Alternative to `SMTP_HOST`. |
| `SMTP_SECURE` | No | Enable SSL/TLS. `true` or `false` (default: `true` for port 465) |
| `EMAIL_DOMAIN` | No | JSON array of allowed recipient domains (e.g. `["qq.com","example.com"]`). Empty = no restriction. |

## Configuration Examples

### Option 1: Using built-in service (recommended for Chinese email providers)

```
SMTP_SERVICE=qq
SMTP_USER=your@qq.com
SMTP_PASS=your-authorization-code
SMTP_MAIL=your@qq.com
EMAIL_PASS=your-api-password
```

### Option 2: Using custom SMTP server

```
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@163.com
SMTP_PASS=your-authorization-code
SMTP_MAIL=your@163.com
EMAIL_PASS=your-api-password
```

### Option 3: Gmail

```
SMTP_SERVICE=gmail
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_MAIL=your@gmail.com
EMAIL_PASS=your-api-password
```

## Deployment

1. Fork or clone this repository
2. Deploy to Vercel (connect GitHub repo or use Vercel CLI)
3. Configure environment variables in Vercel Dashboard (Settings → Environment Variables)
4. Deploy

## API Endpoint

### POST /api/send

Send an email.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Hello",
  "text": "Email body",
  "pass": "your-EMAIL_PASS"
}
```

**Response:**
- `200 OK` - `{ "success": true }`
- `400 Bad Request` - Missing fields or domain not allowed
- `401 Unauthorized` - Invalid password
- `500 Internal Server Error` - SMTP configuration error or sending failed

## Usage in Rin Blog

Set these environment variables in your Rin Cloudflare Worker:

- `EMAIL_RESEND_URL` = `https://your-rin-email-project.vercel.app/api/send`
- `EMAIL_RESEND_PASS` = same as `EMAIL_PASS` in this project

## Notes

- `EMAIL_PASS` is the API password to authenticate requests from Rin blog. It should be different from `SMTP_PASS`.
- For 163/QQ email providers, use their authorization code (not login password) as `SMTP_PASS`.
- `SMTP_SERVICE` and `SMTP_HOST` are mutually exclusive. Use one or the other.
