# Rin-Email

Vercel Serverless Function for sending emails via SMTP. Used as an email relay for Rin blog on Cloudflare Workers.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SMTP_HOST` | Yes | SMTP server host (e.g. `smtp.163.com`) |
| `SMTP_PORT` | No | SMTP port (default: `465`) |
| `SMTP_USER` | Yes | SMTP authentication username |
| `SMTP_PASS` | Yes | SMTP authentication password |
| `SMTP_MAIL` | Yes | Sender email address |
| `EMAIL_DOMAIN` | No | JSON array of allowed recipient domains (e.g. `["qq.com","example.com"]`). Empty = no restriction. |
| `EMAIL_PASS` | Yes | API password for authenticating requests from Rin blog |

## Deployment

```bash
# Install dependencies
npm install

# Deploy to Vercel
vercel --prod
```

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
