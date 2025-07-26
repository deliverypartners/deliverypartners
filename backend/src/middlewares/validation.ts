import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createErrorResponse } from '../utils/helpers';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const errorResponse = createErrorResponse(
        'Validation failed',
        JSON.stringify(validationErrors)
      );
      
      res.status(400).json(errorResponse);
      return;
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const errorResponse = createErrorResponse(
        'Invalid parameters',
        JSON.stringify(validationErrors)
      );
      
      res.status(400).json(errorResponse);
      return;
    }

    req.params = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const errorResponse = createErrorResponse(
        'Invalid query parameters',
        JSON.stringify(validationErrors)
      );
      
      res.status(400).json(errorResponse);
      return;
    }

    req.query = value;
    next();
  };
};

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return validateBody(schema);
};
