import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

export const multerConfig = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const destinationPath = './uploads/listings';
            fs.mkdirSync(destinationPath, { recursive: true });
            callback(null, destinationPath);
        },
        filename: (req, file, callback) => {
            const listingId = req.params.id || 'temp';
            const uniqueSuffix = Date.now();
            const ext = extname(file.originalname);
            const filename = `${listingId}_${uniqueSuffix}${ext}`;
            callback(null, filename);
        },
    }),
    fileFilter: (req, file, callback) => {
        // Only allow images
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            return callback(
                new BadRequestException('Only image files are allowed!'),
                false,
            );
        }
        callback(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per image
    },
};