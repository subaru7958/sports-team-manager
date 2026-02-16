import Joi from 'joi';

// Create Group Validation Schema
const createGroupSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Group name is required',
        'string.empty': 'Group name cannot be empty'
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required',
        'string.empty': 'Category cannot be empty'
    }),
    discipline: Joi.string().lowercase().required().messages({
        'any.required': 'Discipline is required'
    }),
    seasonId: Joi.string().required().messages({
        'any.required': 'Season ID is required'
    }),
    coaches: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'At least one coach must be assigned',
        'any.required': 'Coaches are required'
    }),
    players: Joi.array().items(Joi.string()).optional().default([])
});

// Update Group Validation Schema
const updateGroupSchema = Joi.object({
    name: Joi.string().trim(),
    category: Joi.string(),
    discipline: Joi.string().lowercase(),
    seasonId: Joi.string(),
    coaches: Joi.array().items(Joi.string()).min(1),
    players: Joi.array().items(Joi.string())
}).min(1); // Ensure at least one field is being updated

export const validateCreateGroup = (req, res, next) => {
    const { error } = createGroupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

export const validateUpdateGroup = (req, res, next) => {
    const { error } = updateGroupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};
