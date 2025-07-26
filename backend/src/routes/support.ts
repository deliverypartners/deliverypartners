import express from 'express';
import { SupportController } from '../controllers/supportController';

const router = express.Router();
const supportController = new SupportController();

// Submit support form
router.post('/submit', (req, res) => supportController.submitSupportForm(req, res));

// Test support email (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test-email', (req, res) => supportController.testSupportEmail(req, res));
}

export default router;
