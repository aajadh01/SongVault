import QRCode from 'qrcode';

// Generates deterministic soundwave heights based on seed
export const getDeterministicWaveHeights = (seed = 'THR7X9', barCount = 14) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const heights = [];
  for (let i = 0; i < barCount; i++) {
    const angle = (i / (barCount - 1)) * Math.PI;
    const baseWave = Math.sin(angle);
    const pseudo = Math.abs(Math.sin(hash + i * 1.73)) * 0.5 + 0.5;
    const height = Math.max(0.25, Math.min(1.0, baseWave * 0.6 + pseudo * 0.4));
    heights.push(height);
  }
  return heights;
};

// High-resolution Canvas Generator for Soundwave Stickers & Physical License Cards
export const generateSoundwaveStickerPNG = async ({
  topText = 'OUR SONG ♡',
  bottomText = 'SCAN THE CODE',
  cardId = 'THR7X9',
  publicUrl = '',
  theme = 'lavender', // 'lavender', 'white', 'dark', 'rose'
  layout = 'card-print-large', // 'card-print-large', 'qr-right', 'stacked-card', 'qr-left-vinyl'
  qrScaleFactor = 1.35, // 1.0 = standard, 1.35 = card print, 1.6 = extra large
}) => {
  const canvas = document.createElement('canvas');
  const scale = 3; // 3x high-DPI supersampling for crystal print quality

  // Width & height adjusted based on layout
  const isStacked = layout === 'stacked-card';
  const width = (isStacked ? 480 : 860) * scale;
  const height = (isStacked ? 460 : 320) * scale;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Theme color sets
  let capsuleBg = '#EEF0FF';
  let barColor = '#0F1117';
  let textColor = '#0F1117';

  if (theme === 'dark') {
    capsuleBg = '#161622';
    barColor = '#FFFFFF';
    textColor = '#FFFFFF';
  } else if (theme === 'lavender') {
    capsuleBg = '#E8EAFD';
    barColor = '#14162B';
    textColor = '#14162B';
  } else if (theme === 'rose') {
    capsuleBg = '#FFF1F2';
    barColor = '#E11D48';
    textColor = '#881337';
  } else if (theme === 'white') {
    capsuleBg = '#FFFFFF';
    barColor = '#000000';
    textColor = '#000000';
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Top Header Title ("OUR SONG ♡")
  ctx.fillStyle = textColor;
  ctx.font = `900 ${30 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.textAlign = isStacked ? 'center' : 'left';
  ctx.textBaseline = 'top';

  if (isStacked) {
    ctx.fillText(topText.toUpperCase(), width / 2, 22 * scale);
  } else {
    ctx.fillText(topText.toUpperCase(), 40 * scale, 22 * scale);
  }

  // Generate Low-Density Chunky QR Code (errorCorrectionLevel: 'M' for max readability on physical print)
  let qrImg = null;
  if (publicUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        errorCorrectionLevel: 'M', // Chunky modules, easy for phone camera optical focus
        color: {
          dark: barColor,
          light: capsuleBg,
        },
      });

      qrImg = new Image();
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.src = qrDataUrl;
      });
    } catch (e) {
      console.warn('QR generation failed:', e);
    }
  }

  if (isStacked) {
    // STACKED CARD LAYOUT (Soundwave Top + Giant Scannable QR in Center)
    const capsuleX = 35 * scale;
    const capsuleY = 68 * scale;
    const capsuleW = width - (70 * scale);
    const capsuleH = 65 * scale;

    // Mini Soundwave Capsule
    ctx.beginPath();
    ctx.roundRect(capsuleX, capsuleY, capsuleW, capsuleH, capsuleH / 2);
    ctx.fillStyle = capsuleBg;
    ctx.fill();

    // Heart Icon
    const circleX = capsuleX + 34 * scale;
    const circleY = capsuleY + capsuleH / 2;
    const circleR = 22 * scale;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    // Soundwaves
    const waveHeights = getDeterministicWaveHeights(cardId, 16);
    const startX = circleX + circleR + 15 * scale;
    const endX = capsuleX + capsuleW - 25 * scale;
    const barSpacing = (endX - startX) / waveHeights.length;
    const barWidth = 7 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(10 * scale, h * 42 * scale);
      const topY = capsuleY + (capsuleH - currentBarH) / 2;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    // Giant Center QR Code (220px on card)
    if (qrImg) {
      const qrSize = 210 * scale;
      const qrX = (width - qrSize) / 2;
      const qrY = capsuleY + capsuleH + 18 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX - (8 * scale), qrY - (8 * scale), qrSize + (16 * scale), qrSize + (16 * scale), 20 * scale);
      ctx.fillStyle = capsuleBg;
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }

    // Bottom text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${22 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, width / 2, height - (38 * scale));
  } else {
    // HORIZONTAL CAPSULE (Expanded Large QR for Physical Card Print)
    const capsuleX = 35 * scale;
    const capsuleY = 66 * scale;
    const capsuleW = 790 * scale;
    const capsuleH = 145 * scale; // Taller capsule to allow larger QR
    const capsuleRadius = capsuleH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(capsuleX, capsuleY, capsuleW, capsuleH, capsuleRadius);
    ctx.fillStyle = capsuleBg;
    ctx.fill();

    if (theme === 'white') {
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();
    }
    ctx.restore();

    // 1. Left Circle Icon
    const circleX = capsuleX + 65 * scale;
    const circleY = capsuleY + capsuleH / 2;
    const circleR = 42 * scale;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    // Heart Icon inside Circle
    ctx.fillStyle = capsuleBg;
    ctx.beginPath();
    ctx.arc(circleX - 8 * scale, circleY - 4 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.arc(circleX + 8 * scale, circleY - 4 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(circleX - 17 * scale, circleY - 2 * scale);
    ctx.lineTo(circleX + 17 * scale, circleY - 2 * scale);
    ctx.lineTo(circleX, circleY + 16 * scale);
    ctx.closePath();
    ctx.fill();

    // 2. Large QR Code on Right (Expanded 1.35x - 1.6x for Easy Phone Camera Scanning on Plastic Cards)
    const qrSize = Math.min(capsuleH - (12 * scale), 126 * scale * (qrScaleFactor / 1.35));
    const qrX = capsuleX + capsuleW - qrSize - 16 * scale;
    const qrY = capsuleY + (capsuleH - qrSize) / 2;

    // 3. Soundwaves in Center (compacted to give maximum room to QR)
    const waveHeights = getDeterministicWaveHeights(cardId, 14);
    const startX = circleX + circleR + 20 * scale;
    const endX = qrX - 25 * scale;
    const totalWaveWidth = endX - startX;
    const barSpacing = totalWaveWidth / waveHeights.length;
    const barWidth = 10.5 * scale;
    const maxBarH = 88 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(16 * scale, h * maxBarH);
      const topY = capsuleY + (capsuleH - currentBarH) / 2;

      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    // Draw the Large High-Contrast QR Code
    if (qrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 14 * scale);
      ctx.fillStyle = capsuleBg;
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }

    // 4. Bottom Instruction ("SCAN THE CODE ⤹")
    ctx.fillStyle = textColor;
    ctx.font = `bold ${24 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const bottomY = capsuleY + capsuleH + 18 * scale;
    const centerX = width / 2;
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, centerX, bottomY);
  }

  return canvas.toDataURL('image/png');
};
