const urlInput       = document.getElementById('url-input');
const dropZone       = document.getElementById('drop-zone');
const browseBtn      = document.getElementById('browse-btn');
const fileInput      = document.getElementById('file-input');
const filePreview    = document.getElementById('file-preview');
const fileName       = document.getElementById('file-name');
const removeFileBtn  = document.getElementById('remove-file');
const generateBtn    = document.getElementById('generate-btn');
const errorMsg       = document.getElementById('error-msg');

const inputCard      = document.getElementById('input-card');
const resultCard     = document.getElementById('result-card');
const qrImage        = document.getElementById('qr-image');
const qrUrlDisplay   = document.getElementById('qr-url-display');
const downloadBtn    = document.getElementById('download-btn');
const resetBtn       = document.getElementById('reset-btn');

const loadingOverlay = document.getElementById('loading-overlay');
const loadingText    = document.getElementById('loading-text');

let selectedFile = null;
let lastQRDataUrl = null;

// ── File selection ────────────────────────────────────────────────────────────

browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

dropZone.addEventListener('click', (e) => {
  if (e.target !== browseBtn) fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});

removeFileBtn.addEventListener('click', clearFile);

function setFile(file) {
  selectedFile = file;
  urlInput.value = '';
  urlInput.disabled = true;
  fileName.textContent = file.name;
  dropZone.hidden = true;
  filePreview.hidden = false;
  hideError();
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  urlInput.disabled = false;
  dropZone.hidden = false;
  filePreview.hidden = true;
  hideError();
}

// ── Generate ──────────────────────────────────────────────────────────────────

generateBtn.addEventListener('click', async () => {
  hideError();

  const url = urlInput.value.trim();
  const hasUrl  = url !== '';
  const hasFile = selectedFile !== null;

  if (!hasUrl && !hasFile) {
    showError('Please enter a URL or upload a file.');
    return;
  }

  if (hasUrl && !isValidUrl(url)) {
    showError('Please enter a valid URL (e.g. https://example.com).');
    return;
  }

  generateBtn.disabled = true;
  showLoading('Generating QR code...');

  try {
    let targetUrl = url;

    // If a file was provided, upload it first
    if (hasFile) {
      loadingText.textContent = 'Uploading file...';
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const { error } = await uploadRes.json();
        throw new Error(error || 'File upload failed');
      }
      const uploadData = await uploadRes.json();
      targetUrl = uploadData.url;
      loadingText.textContent = 'Generating QR code...';
    }

    // Generate QR
    const qrRes = await fetch('/api/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });
    if (!qrRes.ok) {
      const { error } = await qrRes.json();
      throw new Error(error || 'QR generation failed');
    }
    const { qr } = await qrRes.json();

    // Show result
    lastQRDataUrl = qr;
    qrImage.src = qr;
    qrUrlDisplay.textContent = targetUrl;
    inputCard.hidden = true;
    resultCard.hidden = false;

  } catch (err) {
    showError(err.message);
  } finally {
    generateBtn.disabled = false;
    hideLoading();
  }
});

// ── Download ──────────────────────────────────────────────────────────────────

downloadBtn.addEventListener('click', () => {
  if (!lastQRDataUrl) return;
  const a = document.createElement('a');
  a.href = lastQRDataUrl;
  a.download = 'qr-code.png';
  a.click();
});

// ── Reset ─────────────────────────────────────────────────────────────────────

resetBtn.addEventListener('click', () => {
  urlInput.value = '';
  urlInput.disabled = false;
  clearFile();
  lastQRDataUrl = null;
  resultCard.hidden = true;
  inputCard.hidden = false;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidUrl(str) {
  try { return ['http:', 'https:'].includes(new URL(str).protocol); }
  catch { return false; }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
}

function showLoading(msg) {
  loadingText.textContent = msg;
  loadingOverlay.hidden = false;
}

function hideLoading() {
  loadingOverlay.hidden = true;
}
