import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import prisma from '../config/database';

// Validation schemas
const createCitySchema = z.object({
  name: z.string().min(1, 'City name is required'),
  state: z.string().min(1, 'State is required'),
  isActive: z.boolean().default(true),
  areas: z.array(z.object({
    name: z.string().min(1, 'Area name is required'),
    isActive: z.boolean().default(true)
  })).optional()
});

const updateCitySchema = z.object({
  name: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

const createAreaSchema = z.object({
  name: z.string().min(1, 'Area name is required'),
  cityId: z.string().min(1, 'City ID is required'),
  isActive: z.boolean().default(true)
});

// Admin Routes
export const createCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createCitySchema.parse(req.body);
    
    const cityData: any = {
      name: validatedData.name,
      state: validatedData.state,
      isActive: validatedData.isActive,
    };

    if (validatedData.areas && validatedData.areas.length > 0) {
      cityData.areas = {
        create: validatedData.areas
      };
    }

    const city = await prisma.city.create({
      data: cityData,
      include: {
        areas: true
      }
    });

    logger.info(`City created: ${city.name}`, { cityId: city.id });
    res.status(201).json({
      success: true,
      data: city,
      message: 'City created successfully'
    });
  } catch (error) {
    logger.error('Error creating city:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create city'
    });
  }
};

export const getAllCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        areas: true,
        _count: {
          select: {
            areas: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
};

export const getCityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
      return;
    }
    
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        areas: true
      }
    });

    if (!city) {
      res.status(404).json({
        success: false,
        message: 'City not found'
      });
      return;
    }

    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    logger.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch city'
    });
  }
};

export const updateCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateCitySchema.parse(req.body);

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
      return;
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.state !== undefined) updateData.state = validatedData.state;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const city = await prisma.city.update({
      where: { id },
      data: updateData,
      include: {
        areas: true
      }
    });

    logger.info(`City updated: ${city.name}`, { cityId: city.id });
    res.json({
      success: true,
      data: city,
      message: 'City updated successfully'
    });
  } catch (error) {
    logger.error('Error updating city:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update city'
    });
  }
};

export const deleteCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
      return;
    }

    // First delete all areas in this city
    await prisma.area.deleteMany({
      where: { cityId: id }
    });

    // Then delete the city
    await prisma.city.delete({
      where: { id }
    });

    logger.info(`City deleted`, { cityId: id });
    res.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting city:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete city'
    });
  }
};

export const toggleCityStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
      return;
    }
    
    const city = await prisma.city.findUnique({
      where: { id }
    });

    if (!city) {
      res.status(404).json({
        success: false,
        message: 'City not found'
      });
      return;
    }

    const updatedCity = await prisma.city.update({
      where: { id },
      data: {
        isActive: !city.isActive
      },
      include: {
        areas: true
      }
    });

    logger.info(`City status toggled: ${updatedCity.name} - ${updatedCity.isActive ? 'Active' : 'Inactive'}`, { cityId: id });
    res.json({
      success: true,
      data: updatedCity,
      message: `City ${updatedCity.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling city status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle city status'
    });
  }
};

// Area management
export const createArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createAreaSchema.parse(req.body);
    
    const area = await prisma.area.create({
      data: validatedData,
      include: {
        city: true
      }
    });

    logger.info(`Area created: ${area.name}`, { areaId: area.id, cityId: area.cityId });
    res.status(201).json({
      success: true,
      data: area,
      message: 'Area created successfully'
    });
  } catch (error) {
    logger.error('Error creating area:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create area'
    });
  }
};

export const updateArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Area ID is required'
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const area = await prisma.area.update({
      where: { id },
      data: updateData,
      include: {
        city: true
      }
    });

    logger.info(`Area updated: ${area.name}`, { areaId: area.id });
    res.json({
      success: true,
      data: area,
      message: 'Area updated successfully'
    });
  } catch (error) {
    logger.error('Error updating area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update area'
    });
  }
};

export const deleteArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Area ID is required'
      });
      return;
    }

    await prisma.area.delete({
      where: { id }
    });

    logger.info(`Area deleted`, { areaId: id });
    res.json({
      success: true,
      message: 'Area deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete area'
    });
  }
};

// Public Routes
export const getActiveCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isActive: true
      },
      include: {
        areas: {
          where: {
            isActive: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    logger.error('Error fetching active cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active cities'
    });
  }
};

export const getCityAreas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cityId } = req.params;
    
    if (!cityId) {
      res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
      return;
    }
    
    const areas = await prisma.area.findMany({
      where: {
        cityId,
        isActive: true
      },
      include: {
        city: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: areas,
      count: areas.length
    });
  } catch (error) {
    logger.error('Error fetching city areas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch city areas'
    });
  }
};