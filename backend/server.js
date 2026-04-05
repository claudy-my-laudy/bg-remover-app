import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { removeBackground } from '@imgly/background-removal-node';

const app = express();
const port = process.env.PORT || 3014;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bg-remover-backend' });
});

app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded. Use field name "image".' });
    }

    const inputBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/png' });

    const outputBlob = await removeBackground(inputBlob, {
      progress: (key, current, total) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[bg-remove] ${key}: ${current}/${total}`);
        }
      },
      output: {
        format: 'image/png',
        quality: 1,
      },
    });

    const arrayBuffer = await outputBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="removed-background.png"');
    return res.send(buffer);
  } catch (error) {
    console.error('Background removal failed:', error);
    return res.status(500).json({
      error: 'Background removal failed.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(port, () => {
  console.log(`bg-remover-backend listening on http://localhost:${port}`);
});
