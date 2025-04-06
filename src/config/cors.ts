import { CorsOptions } from 'cors'

// ESTO HAY QUE ARREGLARLO
// CAMBIAR LA CONDICION DE LA LINEA 8 POR ESTA CONDICION origin === process.env.FRONTEND_URL

// export const corsConfig: CorsOptions = {
//     origin: function(origin, callback) {
//         if(!origin || origin === process.env.FRONTEND_URL) {
//             callback(null, true)
//         }else {
//             callback(new Error('Error de CORS'))
//         }
//     }
// }

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {

        const whiteList = [process.env.FRONTEND_URL]


        if(process.argv[2] === '--api') {
            whiteList.push(undefined)
        }

        if(whiteList.includes(origin)) {
            callback(null, true)
        }else {
            callback(new Error('Error de CORS'))
        }
    }
}

