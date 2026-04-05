import { useEffect, useMemo, useState } from 'react';
import {
  CraftAlert,
  CraftButton,
  CraftCard,
  CraftInput,
  CraftLabel,
  CraftProgress,
  CraftTag,
} from '@kuboxx/craft-ui';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3014';

export default function App() {
  const [file, setFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const canSubmit = useMemo(() => Boolean(file) && status !== 'loading', [file, status]);

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourcePreview, resultUrl]);

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setError('');
    setStatus('idle');
    setProgress(0);

    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });

    if (!nextFile) {
      setSourcePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
      return;
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setSourcePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  }

  function uploadWithProgress(formData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/remove-background`);
      xhr.responseType = 'blob';

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const uploadProgress = Math.min(90, Math.round((event.loaded / event.total) * 90));
        setProgress(uploadProgress);
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve(xhr.response);
          return;
        }

        try {
          const text = await xhr.response.text();
          const payload = JSON.parse(text);
          reject(new Error(payload.detail || payload.error || 'Request failed'));
        } catch {
          reject(new Error('Request failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error while uploading image'));
      xhr.send(formData);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Pick an image first.');
      return;
    }

    try {
      setStatus('loading');
      setError('');
      setProgress(8);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });

      const formData = new FormData();
      formData.append('image', file);

      const blob = await uploadWithProgress(formData);
      const objectUrl = URL.createObjectURL(blob);
      setResultUrl(objectUrl);
      setStatus('success');
    } catch (submitError) {
      setStatus('error');
      setProgress(0);
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    }
  }

  return (
    <main className="app-shell">
      <div className="hero-copy compact">
        <CraftTag>Background remover</CraftTag>
        <h1>Remove image backgrounds.</h1>
        <p>Upload a photo, run removal, and download a transparent PNG.</p>
      </div>

      <div className="layout-grid">
        <CraftCard className="panel-card" tint="yellow" elevation="lg">
          <div className="panel-header">
            <div>
              <h2>Upload image</h2>
              <p className="subtle-copy">Fast MVP, cleaner UI, less scrapbook chaos.</p>
            </div>
            <CraftTag>{status}</CraftTag>
          </div>

          <form className="upload-form" onSubmit={handleSubmit}>
            <div className="field-block">
              <CraftLabel htmlFor="image">Image</CraftLabel>
              <CraftInput id="image" type="file" accept="image/*" onChange={handleFileChange} />
              <p className="hint">Best for portraits, profile photos, and clean product shots.</p>
            </div>

            <div className="action-stack">
              <CraftButton type="submit" disabled={!canSubmit} variant="clay" crayon="orange">
                {status === 'loading' ? 'Removing background…' : 'Remove background'}
              </CraftButton>

              {status === 'loading' && (
                <div className="progress-wrap">
                  <div className="progress-label-row">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <CraftProgress value={progress} max={100} crayon="orange" />
                </div>
              )}
            </div>
          </form>

          {error && (
            <CraftAlert tone="danger" live>
              {error}
            </CraftAlert>
          )}
        </CraftCard>

        <div className="preview-grid">
          <CraftCard className="preview-card" tint="blue">
            <div className="preview-header stack-mobile">
              <h3>Original</h3>
              <CraftTag>{file ? truncateFileName(file.name) : 'no file yet'}</CraftTag>
            </div>
            <PreviewBox imageUrl={sourcePreview} emptyLabel="Upload an image to preview it here." />
          </CraftCard>

          <CraftCard className="preview-card" tint="pink">
            <div className="preview-header stack-mobile">
              <h3>Transparent PNG result</h3>
              {resultUrl ? (
                <a className="download-link" href={resultUrl} download="removed-background.png">
                  Download PNG
                </a>
              ) : (
                <CraftTag>waiting</CraftTag>
              )}
            </div>
            <PreviewBox imageUrl={resultUrl} checker emptyLabel="Run the remover and the cutout lands here." />
          </CraftCard>
        </div>
      </div>
    </main>
  );
}

function PreviewBox({ imageUrl, emptyLabel, checker = false }) {
  return (
    <div className={`preview-box ${checker ? 'checker' : ''}`}>
      {imageUrl ? <img src={imageUrl} alt="Preview" className="preview-image" /> : <p>{emptyLabel}</p>}
    </div>
  );
}

function truncateFileName(name) {
  if (name.length <= 22) return name;
  const dotIndex = name.lastIndexOf('.');
  const ext = dotIndex > -1 ? name.slice(dotIndex) : '';
  const base = dotIndex > -1 ? name.slice(0, dotIndex) : name;
  return `${base.slice(0, 14)}…${ext}`;
}
