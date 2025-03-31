import { Router } from "express";
import { body } from 'express-validator'
import { createAccount, login } from './handlers';
import { handleInputErrors } from "./middleware/validation";

const router = Router()

// ROUTING

// AUTENTICACION Y REGISTRO
router.post('/auth/register',
    body('handle')
        .notEmpty()
        .withMessage('El Handle no puede ir vacio'),
    body('name')
        .notEmpty()
        .withMessage('El Nombre no puede ir vacio'),
    body('email')
        .isEmail()
        .withMessage('El Email no válido'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('El password es obligatorio'),
    handleInputErrors,
    createAccount
)

router.post('/auth/login',
    body('email')
        .isEmail()
        .withMessage('El Email no válido'),
    body('password')
        .notEmpty()
        .withMessage('El password es obligatorio'),
    handleInputErrors,
    login)


export default router