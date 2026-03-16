const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const extractBtn = document.getElementById('extractBtn');
const palette = document.getElementById('palette');
const preview = document.getElementById('preview');
const uploadContent = document.getElementById('uploadContent');

let selectedFile = null;

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());

// File selected
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleFile(file);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#fff';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = '';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  selectedFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.hidden = false;
    uploadContent.hidden = true;
    uploadArea.classList.add('has-image');
  };
  reader.readAsDataURL(file);

  // Enable button
  extractBtn.disabled = false;
  palette.innerHTML = '';
}

// Extract colors
extractBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  palette.innerHTML = '<div class="loading">Extracting colors...</div>';
  extractBtn.disabled = true;

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await fetch('/get-palette', {
      method: 'POST',
      body: formData
    });

    const colors = await response.json();
    await displayPalette(colors);
  } catch (err) {
    palette.innerHTML = '<div class="loading">Something went wrong. Try again.</div>';
  } finally {
    extractBtn.disabled = false;
  }
});

async function displayPalette(colors) {
  palette.innerHTML = '<div class="loading">Getting color names...</div>';

  const cards = await Promise.all(colors.map(async (hex) => {
    const clean = hex.replace('#', '');
    try {
      const res = await fetch(`https://www.thecolorapi.com/id?hex=${clean}`);
      const data = await res.json();
      const name = data.name.value;
      return { hex, name };
    } catch {
      return { hex, name: '' };
    }
  }));

  palette.innerHTML = '';

  cards.forEach(({ hex, name }) => {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.innerHTML = `
      <div class="color-swatch" style="background: ${hex}"></div>
      <div class="color-info">
        <div class="color-name">${name}</div>
        <div class="color-hex">${hex}</div>
        <div class="color-copy">Click to copy</div>
      </div>
    `;

    // Copy to clipboard
    card.addEventListener('click', () => {
      navigator.clipboard.writeText(hex);
      const copyText = card.querySelector('.color-copy');
      copyText.textContent = 'Copied!';
      copyText.classList.add('copied');
      setTimeout(() => {
        copyText.textContent = 'Click to copy';
        copyText.classList.remove('copied');
      }, 2000);
    });

    palette.appendChild(card);
  });
}
