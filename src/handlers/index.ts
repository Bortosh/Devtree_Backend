import slug from 'slug'
import colors from 'colors'
import { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateJWT } from '../utils/jwt'

export const createAccount = async (req: Request, res: Response) => {

    try {

        const body = new User(req.body)

        const { email, password } = body

        const userExist = await User.findOne({ email })
        if (userExist) {
            const error = new Error('Un usuario con ese email ya esta registrado')
            res.status(409).json({ error: error.message })
            return
        }

        const handle = slug(req.body.handle, '')
        const handleExist = await User.findOne({ handle })
        if (handleExist) {
            const error = new Error('Nombre de usuario no disponible')
            res.status(409).json({ error: error.message })
            return
        }

        body.password = await hashPassword(password)
        body.handle = handle

        await body.save()
        res.status(201).send('Registro creado correctamente')
    } catch (error) {
        console.log(colors.bgRed.white.bold(error))
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const login = async (req: Request, res: Response) => {

    const { email, password } = req.body

    // REVISAR SI EL USUARIO ESTA REGISTRADO
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('El usuario no existe')
        res.status(404).json({ error: error.message })
        return
    }

    // COMPROBAR PASSWORD
    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
        const error = new Error('Password Incorrecto')
        res.status(401).json({ error: error.message })
        return
    }

    const token = generateJWT({ id: user._id })

    res.send(token)

}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    
    try {

        const { description } = req.body

        const handle = slug(req.body.handle, '')
        const handleExist = await User.findOne({ handle })
        if (handleExist && handleExist.email !== req.user.email) {
            const error = new Error('Nombre de usuario no disponible')
            res.status(409).json({ error: error.message })
            return
        }

        // ACTUALIZAR USUARIO
        req.user.handle = handle
        req.user.description = description
        await req.user.save()
        res.send('Perfil actualizado correctamente')


    } catch (e) {
        const error = new Error('Hubo un error')
        res.status(500).json({error: error.message})
        return
    }

}

