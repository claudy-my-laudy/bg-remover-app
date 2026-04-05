# bg-remover-app

Simple background remover web app.

## Live

- **Frontend:** https://bg-remover-app-puce.vercel.app
- **Backend:** https://bg-rem-be.jheels.in
- **GitHub:** https://github.com/claudy-my-laudy/bg-remover-app

## Stack

- **Frontend:** React + Vite + `@kuboxx/craft-ui`
- **Backend:** Express + `@imgly/background-removal-node`
- **Image normalization:** `sharp`
- **Process manager:** PM2
- **Frontend hosting:** Vercel
- **Backend hosting:** Nginx reverse proxy on this machine

## Features

- upload image
- remove background
- preview original + transparent PNG result
- download PNG output
- progress bar during upload/remove flow
- AVIF input support via server-side normalization

## Supported input formats

- JPEG
- PNG
- WebP
- AVIF

Output:
- transparent **PNG**

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on:

```bash
http://localhost:3014
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If your backend lives somewhere else:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run dev
```

## API

### `POST /api/remove-background`

Send multipart form-data with:

- `image`: image file

Response:

- `image/png`

### `GET /health`

Returns backend health JSON.

## Deployment notes

### Frontend

The Vercel project is connected to this GitHub repo and builds from:

```bash
frontend/
```

Important env var used by the frontend:

```bash
VITE_API_BASE_URL=https://bg-rem-be.jheels.in
```

### Backend

Production backend runs as PM2 process:

```bash
bg-remover-be
```

Behind nginx on:

```bash
https://bg-rem-be.jheels.in
```

Nginx is configured with a larger upload limit for image uploads.

## Repo structure

```bash
bg-remover-app/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
│   └── src/
└── README.md
```

## Notes

This is intentionally a small focused app, not a full editor. The goal is fast background removal with a clean UI and a simple deployment setup.
