import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/adminRoutes.js';
import siblingRoutes from './routes/siblingRoutes.js';
import recordingRoutes from './routes/recordingRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for rate limiter behind reverse proxies (Render, Vercel)
app.set('trust proxy', 1);

// Flexible and Secure CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile, curl)
    if (!origin) return callback(null, true);

    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';

    // Check if origin matches CLIENT_URL, vercel.app preview/production subdomains, or localhost
    if (
      origin === clientUrl ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Default allow in case of custom domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Logging & Body parsing
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static media files directory for local uploads
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Apply general rate limiting
app.use('/api', generalApiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/siblings', siblingRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/public', publicRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

export default app;
