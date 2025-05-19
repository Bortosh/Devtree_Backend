import slug from 'slug'
import formidable from 'formidable'
import { v4 as uuid } from 'uuid'
import cloudinary from '../config/cloudinary'
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

        const { description, links } = req.body

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
        req.user.links = links
        await req.user.save()
        res.send('Perfil actualizado correctamente')


    } catch (e) {
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
        return
    }

}


export const uploadImage = async (req: Request, res: Response) => {

    const form = formidable({ multiples: false })


    try {
        form.parse(req, (error, field, files) => {

            cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid() }, async function (error, result) {

                if (error) {
                    const errorImage = new Error('Hubo un error al subir la imagen')
                    res.status(500).json({ error: errorImage.message })
                    return
                }

                if (result) {
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.status(201).json({ image: result.secure_url })
                }
            })

        })
    } catch (e) {
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
        return
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {

    try {
        const {handle} = req.params

        const user = await User.findOne({handle}).select('-_id -__v -email -password')

        if(!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }

        res.status(200).json(user)

    } catch (e) {
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
        return
    }
}

export const searchByHandle = async (req: Request, res: Response) => {

    try {
        
        const {handle} = req.body
        const userExist = await User.findOne({handle})

        if(userExist) {
            const error = new Error(`${handle} ya está registrado`)
            res.status(409).json({error: error.message})
            return
        }

        res.send(`${handle} está disponible`)

    } catch (e) {
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
        return
    }


}