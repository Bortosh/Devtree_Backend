import { CorsOptions } from 'cors'


// Permitir conexiones
// export const corsConfig: CorsOptions = {
//     origin: process.env.FRONTEND_URL,
//     optionsSuccessStatus: 200
// }
export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        if(origin === process.env.FRONTEND_URL) {
            callback(null, true)
        }else {
            callback(new Error('Error de CORS'))
        }
    }
}

