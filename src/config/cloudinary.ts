import { v2 as cloudinary } from 'cloudinary';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary;