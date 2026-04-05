# bg-remover-app

Background removal MVP with:

- **Frontend:** React + Vite + `@kuboxx/craft-ui`
- **Backend:** Express + `@imgly/background-removal-node`

## Run locally

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3014`

### 2) Frontend

Install frontend deps and start Vite:

```bash
cd ../bg-remover-app/frontend
npm install
npm run dev
```

If your backend lives somewhere else:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run dev
```

## API

### `POST /api/remove-background`

Form-data:

- `image`: image file

Returns: `image/png`

## Deploy shape

- Frontend → Vercel
- Backend → this machine via PM2 + reverse proxy
- Suggested backend port → `3014`
