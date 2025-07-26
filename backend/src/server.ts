import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import 'express-async-errors';

import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import vehicleRoutes from './routes/vehicles';
import driverRoutes from './routes/drivers';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import couponRoutes from './routes/coupons';
import cityRoutes from './routes/cities';
import supportRoutes from './routes/support';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// ✅ Apply CORS middleware first
const allowedOrigins = [
  'https://deliverypartners.in', 
  'https://www.deliverypartners.in',
  'http://deliverypartners.in',   // Keep HTTP for fallback
  'http://www.deliverypartners.in',
  'http://localhost:3000',         // For development
  'http://31.97.226.57:3000'       // For production server(TESTING)
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
};

app.use(cors(corsOptions));

// ✅ Security middleware
app.use(helmet());

// ✅ Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.nodeEnv === 'development' ? 10000 : config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/api/health' ||
           req.path.startsWith('/api/uploads/') ||
           (config.nodeEnv === 'development' && req.path.startsWith('/api/auth'));
  }
});
app.use(limiter);

// ✅ Compression middleware
app.use(compression());

// ✅ Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static file serving
const uploadsPath = path.resolve(__dirname, config.nodeEnv === 'production' ? '../uploads' : '../uploads');
console.log('📁 Uploads path resolved to:', uploadsPath);
console.log('📁 __dirname is:', __dirname);
console.log('📁 Environment:', config.nodeEnv);
app.use('/api/uploads', express.static(uploadsPath));

// ✅ Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// ✅ Request debug log
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Delivery Partner Backend API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/support', supportRoutes);

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ✅ Global error handler
app.use(errorHandler);

// ✅ Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📱 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/api/health`);
});

// ✅ Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;