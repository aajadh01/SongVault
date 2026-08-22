import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary storage configured.');
} else {
  console.log('📁 Local disk storage configured for media uploads (/uploads).');
}

// Local Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images';
    if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    }
    const uploadPath = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a', 'audio/aac'];
  const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

  if (
    allowedAudio.includes(file.mimetype) ||
    allowedImage.includes(file.mimetype) ||
    allowedVideo.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
});

// Helper to convert uploaded file into accessible URL
export const getFileUrl = (file, req) => {
  if (!file) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  let folder = 'images';
  if (file.mimetype.startsWith('audio/')) folder = 'audio';
  if (file.mimetype.startsWith('video/')) folder = 'videos';
  return `${protocol}://${host}/uploads/${folder}/${file.filename}`;
};
