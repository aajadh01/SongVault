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
    const height = Math.max(0.3, Math.min(1.0, baseWave * 0.65 + pseudo * 0.35));
    heights.push(height);
  }
  return heights;
};

// High-resolution Canvas Generator for Soundwave Stickers & Physical License Cards
export const generateSoundwaveStickerPNG = async ({
  topText = 'OUR SONG ♡',
  bottomText = 'SCAN TO UNLOCK',
  cardId = 'THR7X9',
  publicUrl = '',
  theme = 'lavender', // 'lavender', 'white', 'dark', 'rose'
  layout = 'canva-deluxe-passport', // 'canva-deluxe-passport', 'canva-card-box', 'id-card-stamp', 'card-print-large'
  transparentBg = true,
}) => {
  const canvas = document.createElement('canvas');
  const scale = 3; // 3x high-DPI supersampling for crisp print quality

  const isDeluxe = layout === 'canva-deluxe-passport';
  const isCanvaBox = layout === 'canva-card-box';
  const isIdStamp = layout === 'id-card-stamp';

  let width = 640 * scale;
  let height = 480 * scale;

  if (isIdStamp) {
    width = 860 * scale;
    height = 300 * scale;
  } else if (layout === 'card-print-large') {
    width = 860 * scale;
    height = 320 * scale;
  } else if (isCanvaBox) {
    width = 520 * scale;
    height = 520 * scale;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Theme color sets (matched to Canva template palette)
  let capsuleBg = '#EEF0FF';
  let barColor = '#14162B';
  let textColor = '#14162B';

  if (theme === 'dark') {
    capsuleBg = '#161622';
    barColor = '#FFFFFF';
    textColor = '#FFFFFF';
  } else if (theme === 'lavender') {
    capsuleBg = '#E6E9FD';
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

  // Generate Low-Density Chunky QR Code
  let qrImg = null;
  if (publicUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        errorCorrectionLevel: 'L',
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

  if (isDeluxe) {
    // ══════════════════════════════════════════════════════════════════════
    // CANVA DELUXE PASSPORT LAYOUT (Soundwave + Stamp + Details + QR Code)
    // ══════════════════════════════════════════════════════════════════════

    // 1. Top Section: OUR SONG ♡ with Soundwave Pill
    ctx.fillStyle = textColor;
    ctx.font = `900 ${22 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(topText.toUpperCase(), 25 * scale, 20 * scale);

    const pillX = 25 * scale;
    const pillY = 54 * scale;
    const pillW = width - (50 * scale);
    const pillH = 50 * scale;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = capsuleBg;
    ctx.fill();
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'rgba(20, 22, 43, 0.12)';
    ctx.stroke();
    ctx.restore();

    // Heart inside Pill
    const circleX = pillX + 25 * scale;
    const circleY = pillY + pillH / 2;
    const circleR = 17 * scale;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    ctx.fillStyle = capsuleBg;
    ctx.beginPath();
    ctx.arc(circleX - 3.5 * scale, circleY - 2 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.arc(circleX + 3.5 * scale, circleY - 2 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(circleX - 7.5 * scale, circleY - 1 * scale);
    ctx.lineTo(circleX + 7.5 * scale, circleY - 1 * scale);
    ctx.lineTo(circleX, circleY + 7 * scale);
    ctx.closePath();
    ctx.fill();

    // Soundwave Bars
    const waveHeights = getDeterministicWaveHeights(cardId, 22);
    const startX = circleX + circleR + 15 * scale;
    const endX = pillX + pillW - 20 * scale;
    const barSpacing = (endX - startX) / waveHeights.length;
    const barWidth = 6.5 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(8 * scale, h * 32 * scale);
      const topY = pillY + (pillH - currentBarH) / 2;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    // 2. Middle Grid: Left Info Badges + Right Large QR Stamp
    const qrSize = 210 * scale;
    const qrX = width - qrSize - (25 * scale);
    const qrY = pillY + pillH + 18 * scale;

    // Draw the High-Scan QR Code on Right
    if (qrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX - (6 * scale), qrY - (6 * scale), qrSize + (12 * scale), qrSize + (12 * scale), 20 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2.5 * scale;
      ctx.strokeStyle = 'rgba(20, 22, 43, 0.15)';
      ctx.stroke();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }

    // Left Badges & Details Box (Fills the white space beautifully!)
    const infoX = 25 * scale;
    const infoY = qrY - (6 * scale);
    const infoW = qrX - infoX - (18 * scale);
    const infoH = qrSize + (12 * scale);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, infoW, infoH, 18 * scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'rgba(20, 22, 43, 0.1)';
    ctx.stroke();
    ctx.restore();

    // Info Details Content inside Box
    let currentTextY = infoY + 20 * scale;

    // 1. Secret Key Tag
    ctx.fillStyle = '#E6E9FD';
    ctx.beginPath();
    ctx.roundRect(infoX + 16 * scale, currentTextY, infoW - (32 * scale), 36 * scale, 10 * scale);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = `bold ${13 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`🔒 6-DIGIT SECRET PIN`, infoX + 26 * scale, currentTextY + 11 * scale);

    currentTextY += 52 * scale;

    // 2. Validity Tag
    ctx.fillStyle = '#64748B';
    ctx.font = `bold ${11 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.fillText(`VALIDITY:`, infoX + 20 * scale, currentTextY);
    ctx.fillStyle = textColor;
    ctx.font = `900 ${13 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.fillText(`LIFETIME OF MEMORIES ♡`, infoX + 20 * scale, currentTextY + 18 * scale);

    currentTextY += 46 * scale;

    // 3. Official Bond Seal
    ctx.fillStyle = '#64748B';
    ctx.font = `bold ${11 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.fillText(`VAULT CODE:`, infoX + 20 * scale, currentTextY);
    ctx.fillStyle = '#E11D48';
    ctx.font = `900 ${15 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.fillText(`★ ${cardId} ★`, infoX + 20 * scale, currentTextY + 18 * scale);

    // 3. Bottom Instruction Line under QR
    ctx.fillStyle = textColor;
    ctx.font = `900 ${16 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, qrX + qrSize / 2, qrY + qrSize + 22 * scale);

  } else if (isCanvaBox) {
    // CANVA CARD BOX LAYOUT
    ctx.fillStyle = textColor;
    ctx.font = `900 ${26 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(topText.toUpperCase(), width / 2, 28 * scale);

    const pillX = 35 * scale;
    const pillY = 70 * scale;
    const pillW = width - (70 * scale);
    const pillH = 58 * scale;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = capsuleBg;
    ctx.fill();
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'rgba(20, 22, 43, 0.12)';
    ctx.stroke();
    ctx.restore();

    // Heart
    const circleX = pillX + 28 * scale;
    const circleY = pillY + pillH / 2;
    const circleR = 19 * scale;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    // Soundwaves
    const waveHeights = getDeterministicWaveHeights(cardId, 16);
    const startX = circleX + circleR + 14 * scale;
    const endX = pillX + pillW - 20 * scale;
    const barSpacing = (endX - startX) / waveHeights.length;
    const barWidth = 6.5 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(9 * scale, h * 38 * scale);
      const topY = pillY + (pillH - currentBarH) / 2;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    if (qrImg) {
      const qrSize = 250 * scale;
      const qrX = (width - qrSize) / 2;
      const qrY = pillY + pillH + 16 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX - (8 * scale), qrY - (8 * scale), qrSize + (16 * scale), qrSize + (16 * scale), 20 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = 'rgba(20, 22, 43, 0.15)';
      ctx.stroke();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }

    ctx.fillStyle = textColor;
    ctx.font = `bold ${20 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, width / 2, height - (36 * scale));

  } else if (isIdStamp) {
    // ID CARD STAMP
    const qrSize = 160 * scale;
    const qrX = width - qrSize - (35 * scale);
    const qrY = 56 * scale;
    const pillX = 35 * scale;
    const pillY = 96 * scale;
    const pillW = qrX - pillX - (18 * scale);
    const pillH = 82 * scale;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = capsuleBg;
    ctx.fill();
    ctx.restore();

    const circleX = pillX + 44 * scale;
    const circleY = pillY + pillH / 2;
    ctx.beginPath();
    ctx.arc(circleX, circleY, 28 * scale, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    const waveHeights = getDeterministicWaveHeights(cardId, 12);
    const startX = circleX + (28 * scale) + 15 * scale;
    const endX = pillX + pillW - 20 * scale;
    const barSpacing = (endX - startX) / waveHeights.length;
    const barWidth = 9 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(12 * scale, h * 54 * scale);
      const topY = pillY + (pillH - currentBarH) / 2;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    if (qrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 16 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();

      const pad = 8 * scale;
      ctx.drawImage(qrImg, qrX + pad, qrY + pad, qrSize - (pad * 2), qrSize - (pad * 2));
      ctx.restore();
    }

    ctx.fillStyle = textColor;
    ctx.font = `bold ${22 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, pillX + 10 * scale, pillY + pillH + 18 * scale);

  } else {
    // HORIZONTAL CAPSULE
    const capsuleX = 35 * scale;
    const capsuleY = 66 * scale;
    const capsuleW = 790 * scale;
    const capsuleH = 145 * scale;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(capsuleX, capsuleY, capsuleW, capsuleH, capsuleH / 2);
    ctx.fillStyle = capsuleBg;
    ctx.fill();
    ctx.restore();

    const circleX = capsuleX + 65 * scale;
    const circleY = capsuleY + capsuleH / 2;
    ctx.beginPath();
    ctx.arc(circleX, circleY, 42 * scale, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    const qrSize = 126 * scale;
    const qrX = capsuleX + capsuleW - qrSize - 16 * scale;
    const qrY = capsuleY + (capsuleH - qrSize) / 2;

    const waveHeights = getDeterministicWaveHeights(cardId, 12);
    const startX = circleX + (42 * scale) + 20 * scale;
    const endX = qrX - 25 * scale;
    const barSpacing = (endX - startX) / waveHeights.length;
    const barWidth = 10.5 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(16 * scale, h * 88 * scale);
      const topY = capsuleY + (capsuleH - currentBarH) / 2;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    if (qrImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 14 * scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.drawImage(qrImg, qrX + (4 * scale), qrY + (4 * scale), qrSize - (8 * scale), qrSize - (8 * scale));
      ctx.restore();
    }

    ctx.fillStyle = textColor;
    ctx.font = `bold ${24 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, width / 2, capsuleY + capsuleH + 18 * scale);
  }

  return canvas.toDataURL('image/png');
};
