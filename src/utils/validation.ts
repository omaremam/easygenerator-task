import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequiredFields = (
  fields: string[],
  body: any
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = fields.filter(field => !body[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const createValidationMiddleware = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { isValid, missingFields } = validateRequiredFields(requiredFields, req.body);

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: {
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}; 