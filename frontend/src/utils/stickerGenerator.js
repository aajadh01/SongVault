import QRCode from 'qrcode';

// Generates deterministic soundwave heights based on seed
export const getDeterministicWaveHeights = (seed = 'THR7X9', barCount = 12) => {
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
    const height = Math.max(0.3, Math.min(1.0, baseWave * 0.65 + pseudo * 0.35));
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
  layout = 'id-card-stamp', // 'id-card-stamp', 'card-print-large', 'stacked-card'
  qrScaleFactor = 1.4, // Sizing scale
}) => {
  const canvas = document.createElement('canvas');
  const scale = 3; // 3x high-DPI supersampling for crystal print quality

  const isStacked = layout === 'stacked-card';
  const isIdStamp = layout === 'id-card-stamp';

  let width = 860 * scale;
  let height = 320 * scale;

  if (isStacked) {
    width = 480 * scale;
    height = 460 * scale;
  } else if (isIdStamp) {
    width = 860 * scale;
    height = 300 * scale;
  }

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
  ctx.font = `900 ${28 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.textAlign = isStacked ? 'center' : 'left';
  ctx.textBaseline = 'top';

  if (isStacked) {
    ctx.fillText(topText.toUpperCase(), width / 2, 20 * scale);
  } else {
    ctx.fillText(topText.toUpperCase(), 35 * scale, 18 * scale);
  }

  // Generate Low-Density Chunky QR Code (errorCorrectionLevel: 'L' produces maximum chunky blocks for small physical cards)
  let qrImg = null;
  if (publicUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        errorCorrectionLevel: 'L', // Lowest density = biggest individual dots for micro physical printing!
        color: {
          dark: '#000000',
          light: '#FFFFFF',
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

  if (isIdStamp) {
    // ID CARD STAMP LAYOUT: Slim soundwave bar on left + Large high-contrast QR Stamp on right (Guaranteed Phone Scan)
    const qrSize = 160 * scale; // Huge square QR stamp
    const qrX = width - qrSize - (35 * scale);
    const qrY = 56 * scale;

    const pillX = 35 * scale;
    const pillY = 96 * scale;
    const pillW = qrX - pillX - (18 * scale);
    const pillH = 82 * scale;
    const pillRadius = pillH / 2;

    // Draw Left Soundwave Pill
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
    ctx.fillStyle = capsuleBg;
    ctx.fill();

    if (theme === 'white') {
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();
    }
    ctx.restore();

    // Heart Circle inside Pill
    const circleX = pillX + 44 * scale;
    const circleY = pillY + pillH / 2;
    const circleR = 28 * scale;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    // White Heart inside Circle
    ctx.fillStyle = capsuleBg;
    ctx.beginPath();
    ctx.arc(circleX - 5.5 * scale, circleY - 3 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.arc(circleX + 5.5 * scale, circleY - 3 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(circleX - 11.5 * scale, circleY - 1.5 * scale);
    ctx.lineTo(circleX + 11.5 * scale, circleY - 1.5 * scale);
    ctx.lineTo(circleX, circleY + 11 * scale);
    ctx.closePath();
    ctx.fill();

    // Soundwaves
    const waveHeights = getDeterministicWaveHeights(cardId, 12);
    const startX = circleX + circleR + 15 * scale;
    const endX = pillX + pillW - 20 * scale;
    const totalWaveWidth = endX - startX;
    const barSpacing = totalWaveWidth / waveHeights.length;
    const barWidth = 9 * scale;
    const maxBarH = 54 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(12 * scale, h * maxBarH);
      const topY = pillY + (pillH - currentBarH) / 2;

      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    // Draw the High-Contrast Large Square QR Stamp on Right
    if (qrImg) {
      ctx.save();
      // Clean white quiet zone container with crisp border
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 16 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = theme === 'dark' ? '#333344' : 'rgba(0,0,0,0.12)';
      ctx.stroke();

      // Draw QR code inside with 6px padding
      const pad = 8 * scale;
      ctx.drawImage(qrImg, qrX + pad, qrY + pad, qrSize - (pad * 2), qrSize - (pad * 2));
      ctx.restore();
    }

    // Bottom Instruction
    ctx.fillStyle = textColor;
    ctx.font = `bold ${22 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, pillX + 10 * scale, pillY + pillH + 18 * scale);
  } else if (isStacked) {
    // STACKED CARD LAYOUT (Soundwave Top + Giant Scannable QR in Center)
    const capsuleX = 35 * scale;
    const capsuleY = 65 * scale;
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
    const waveHeights = getDeterministicWaveHeights(cardId, 14);
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

    // Giant Center QR Code
    if (qrImg) {
      const qrSize = 220 * scale;
      const qrX = (width - qrSize) / 2;
      const qrY = capsuleY + capsuleH + 16 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX - (8 * scale), qrY - (8 * scale), qrSize + (16 * scale), qrSize + (16 * scale), 20 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }

    // Bottom text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${22 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, width / 2, height - (36 * scale));
  } else {
    // HORIZONTAL CAPSULE
    const capsuleX = 35 * scale;
    const capsuleY = 66 * scale;
    const capsuleW = 790 * scale;
    const capsuleH = 145 * scale;
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

    // Left Circle Icon
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

    // Large QR Code on Right
    const qrSize = Math.min(capsuleH - (12 * scale), 126 * scale * (qrScaleFactor / 1.35));
    const qrX = capsuleX + capsuleW - qrSize - 16 * scale;
    const qrY = capsuleY + (capsuleH - qrSize) / 2;

    // Soundwaves
    const waveHeights = getDeterministicWaveHeights(cardId, 12);
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

    // Draw QR Code
    if (qrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 14 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.drawImage(qrImg, qrX + (4 * scale), qrY + (4 * scale), qrSize - (8 * scale), qrSize - (8 * scale));
      ctx.restore();
    }

    // Bottom Instruction
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
