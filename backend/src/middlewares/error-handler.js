import { validationResult } from "express-validator";


const customError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error); // Forward error to the error handler
};

/**
 * Custom default middleware for handling errors
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        status: statusCode,
        errors: err.errors || null,
    });
};

/**
 * Middleware for handling validation errors
 */
const validationErrorHandler = (req, res, next) => {
    const errors = validationResult(req).formatWith((error) => ({
        msg: error.msg,
        param: error.param,
    }));

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            status: 400,
            errors: errors.array({ onlyFirstError: true }),
        });
    }

    next();
};

export {customError, notFoundHandler, errorHandler, validationErrorHandler };