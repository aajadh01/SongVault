import QRCode from 'qrcode';

// Generates deterministic soundwave heights based on seed
export const getDeterministicWaveHeights = (seed = 'THR7X9', barCount = 20) => {
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
    const height = Math.max(0.2, Math.min(1.0, baseWave * 0.6 + pseudo * 0.4));
    heights.push(height);
  }
  return heights;
};

// High-resolution Canvas Generator for Soundwave Stickers
export const generateSoundwaveStickerPNG = async ({
  topText = 'OUR SONG ♡',
  bottomText = 'SCAN THE CODE',
  cardId = 'THR7X9',
  publicUrl = '',
  theme = 'lavender', // 'lavender', 'white', 'dark', 'rose'
  layout = 'qr-right', // 'qr-right', 'qr-left-vinyl'
}) => {
  const canvas = document.createElement('canvas');
  const scale = 3; // 3x high-DPI supersampling
  const width = 840 * scale;
  const height = 300 * scale;

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
  ctx.font = `900 ${32 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(topText.toUpperCase(), 40 * scale, 24 * scale);

  // 2. Draw Rounded Capsule Bar
  const capsuleX = 35 * scale;
  const capsuleY = 70 * scale;
  const capsuleW = 770 * scale;
  const capsuleH = 136 * scale;
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

  // Generate QR Data URL
  let qrImg = null;
  if (publicUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        margin: 1,
        errorCorrectionLevel: 'H',
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

  if (layout === 'qr-left-vinyl' && qrImg) {
    // LAYOUT 1: Scannable QR inside circular vinyl on left
    const qrSize = 100 * scale;
    const qrX = capsuleX + 18 * scale;
    const qrY = capsuleY + (capsuleH - qrSize) / 2;

    // Draw circular clip for QR
    ctx.save();
    ctx.beginPath();
    ctx.arc(qrX + qrSize / 2, qrY + qrSize / 2, (qrSize / 2) - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.restore();

    // Draw soundwave bars on the right
    const waveHeights = getDeterministicWaveHeights(cardId, 24);
    const startX = qrX + qrSize + 25 * scale;
    const endX = capsuleX + capsuleW - 35 * scale;
    const totalWaveWidth = endX - startX;
    const barSpacing = totalWaveWidth / waveHeights.length;
    const barWidth = 9.5 * scale;
    const maxBarH = 82 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(14 * scale, h * maxBarH);
      const topY = capsuleY + (capsuleH - currentBarH) / 2;

      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });
  } else {
    // LAYOUT 2: Circular Icon on Left + Center Soundwaves + Scannable QR on Right (Most Popular)
    const circleX = capsuleX + 68 * scale;
    const circleY = capsuleY + capsuleH / 2;
    const circleR = 44 * scale;

    // Draw Left Solid Circle
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = barColor;
    ctx.fill();

    // Draw Heart Symbol in Center of Left Circle
    ctx.fillStyle = capsuleBg;
    ctx.beginPath();
    ctx.arc(circleX - 8 * scale, circleY - 4 * scale, 9.5 * scale, 0, Math.PI * 2);
    ctx.arc(circleX + 8 * scale, circleY - 4 * scale, 9.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(circleX - 18 * scale, circleY - 2 * scale);
    ctx.lineTo(circleX + 18 * scale, circleY - 2 * scale);
    ctx.lineTo(circleX, circleY + 17 * scale);
    ctx.closePath();
    ctx.fill();

    // Draw Soundwaves in Center
    const waveHeights = getDeterministicWaveHeights(cardId, 18);
    const startX = circleX + circleR + 22 * scale;
    const qrSize = 92 * scale;
    const endX = capsuleX + capsuleW - qrSize - 30 * scale;
    const totalWaveWidth = endX - startX;
    const barSpacing = totalWaveWidth / waveHeights.length;
    const barWidth = 9.5 * scale;
    const maxBarH = 82 * scale;

    ctx.fillStyle = barColor;
    waveHeights.forEach((h, idx) => {
      const x = startX + idx * barSpacing + barWidth / 2;
      const currentBarH = Math.max(14 * scale, h * maxBarH);
      const topY = capsuleY + (capsuleH - currentBarH) / 2;

      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, topY, barWidth, currentBarH, barWidth / 2);
      ctx.fill();
    });

    // Draw Crisp Scannable QR code on the right
    if (qrImg) {
      const qrX = capsuleX + capsuleW - qrSize - 22 * scale;
      const qrY = capsuleY + (capsuleH - qrSize) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 12 * scale);
      ctx.fillStyle = capsuleBg;
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.restore();
    }
  }

  // 3. Draw Bottom Instruction ("SCAN THE CODE ⤹")
  ctx.fillStyle = textColor;
  ctx.font = `bold ${24 * scale}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const bottomY = capsuleY + capsuleH + 18 * scale;
  const centerX = width / 2;
  ctx.fillText(`${bottomText.toUpperCase()}  ⤹`, centerX, bottomY);

  return canvas.toDataURL('image/png');
};
