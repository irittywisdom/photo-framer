const uploadInput = document.getElementById('upload');
const uploadedImage = document.getElementById('uploadedImage');
const frameContainer = document.getElementById('frameContainer');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

let scale = 1;
let posX = 0, posY = 0;
let startX = 0, startY = 0;
let initialDistance = 0;
let isDragging = false;

// Upload Image
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage.src = event.target.result;
    scale = 1;
    posX = 0;
    posY = 0;
    updateTransform();
  };
  reader.readAsDataURL(file);
});

// Update image transform
function updateTransform() {
  uploadedImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Reset button
resetBtn.addEventListener('click', () => {
  scale = 1;
  posX = 0;
  posY = 0;
  updateTransform();
});

// Mouse drag (desktop)
frameContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

frameContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

frameContainer.addEventListener('mouseup', () => isDragging = false);
frameContainer.addEventListener('mouseleave', () => isDragging = false);

// Touch gestures (mobile)
frameContainer.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) { // single finger drag
    startX = e.touches[0].clientX - posX;
    startY = e.touches[0].clientY - posY;
  } else if (e.touches.length === 2) { // pinch
    initialDistance = getDistance(e.touches[0], e.touches[1]) / scale;
  }
});

frameContainer.addEventListener('touchmove', (e) => {
  e.preventDefault(); // prevent scrolling
  if (e.touches.length === 1) { // drag
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
  } else if (e.touches.length === 2) { // pinch zoom
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    scale = newDistance / initialDistance;
  }
  updateTransform();
}, { passive: false });

function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx*dx + dy*dy);
}

// Download 1:1 image
downloadBtn.addEventListener('click', async () => {
  if (!uploadedImage.src) {
    alert("Please upload a photo first!");
    return;
  }

  await Promise.all([
    imageLoaded(uploadedImage),
    imageLoaded(document.getElementById('footerFrame'))
  ]);

  html2canvas(frameContainer, {
    useCORS: true,
    allowTaint: true,
    scale: 2,
    width: 350,
    height: 350
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'profile-frame.png';
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

function imageLoaded(img) {
  return new Promise((resolve) => {
    if (img.complete) resolve();
    else img.onload = resolve;
  });
}
