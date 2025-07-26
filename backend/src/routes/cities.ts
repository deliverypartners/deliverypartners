import { Router } from 'express';
import {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
  toggleCityStatus,
  createArea,
  updateArea,
  deleteArea,
  getActiveCities,
  getCityAreas
} from '../controllers/cityController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public routes - for frontend city selection
router.get('/active', getActiveCities);
router.get('/:cityId/areas', getCityAreas);

// Admin routes - require authentication
router.use(authenticate);

// City management
router.post('/', createCity);
router.get('/', getAllCities);
router.get('/:id', getCityById);
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);
router.patch('/:id/toggle-status', toggleCityStatus);

// Area management
router.post('/areas', createArea);
router.put('/areas/:id', updateArea);
router.delete('/areas/:id', deleteArea);

export default router;