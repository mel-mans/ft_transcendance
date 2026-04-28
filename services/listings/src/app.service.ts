import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
    private readonly startTime = Date.now();

    constructor(private prisma: PrismaService) {}

    async getHealthCheck() {
        let dbStatus = 'ok';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch {
            dbStatus = 'error';
        }

        return {
            status: dbStatus === 'ok' ? 'ok' : 'error',
            service: 'listings',
            version: '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            timestamp: new Date().toISOString(),
            checks: {
                database: dbStatus,
            },
        };
    }

    // Create listing
    async createListing(userId: number, createListingDto: CreateListingDto) {
        const {
            title,
            location,
            price,
            currency,
            availableDate,
            spotsTotal,
            spotsFilled,
            description,
            hasWifi,
            hasKitchen,
            hasLaundry,
            hasMetroNearby,
            hasGarden,
            hasParking,
            petsOK,
            hasGym,
            hasAC,
            isSecure,
        } = createListingDto;

        const listing = await this.prisma.listing.create({
            data: {
                userId,
                title,
                location,
                price,
                currency,
                availableDate: new Date(availableDate),
                spotsTotal,
                spotsFilled,  // No default, use what user provides
                description,
                hasWifi,      // Required, no default
                hasKitchen,
                hasLaundry,
                hasMetroNearby,
                hasGarden,
                hasParking,
                petsOK,
                hasGym,
                hasAC,
                isSecure,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return {
            message: 'Listing created successfully',
            listing,
        };
    }

    // Get all listings
    async getAllListings() {
        const listings = await this.prisma.listing.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return listings;
    }

    // Get listing by ID
    async getListingById(id: number) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        return listing;
    }

    // Get listing recommendations for a user
    async getRecommendations(userId: number) {
        const allListings = await this.prisma.listing.findMany({
            where: {
                isActive: true,
                userId: { not: userId },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const recommendation = allListings.length > 0 ? allListings[0] : null;

        return {
            recommendation,
            allListings,
            algorithm: 'content_fallback',
        };
    }

    // Get my listings
    async getMyListings(userId: number) {
        const listings = await this.prisma.listing.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return listings;
    }

    // Update listing
    async updateListing(id: number, userId: number, updateListingDto: UpdateListingDto) {
        // Check if listing exists and belongs to user
        const listing = await this.prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        if (listing.userId !== userId) {
            throw new ForbiddenException('You can only update your own listings');
        }

        // Update listing
        const updated = await this.prisma.listing.update({
            where: { id },
            data: {
                ...updateListingDto,
                availableDate: updateListingDto.availableDate
                    ? new Date(updateListingDto.availableDate)
                    : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return {
            message: 'Listing updated successfully',
            listing: updated,
        };
    }

    // Delete listing
    async deleteListing(id: number, userId: number) {
        // Check if listing exists and belongs to user
        const listing = await this.prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        if (listing.userId !== userId) {
            throw new ForbiddenException('You can only delete your own listings');
        }

        await this.prisma.listing.delete({
            where: { id },
        });

        return {
            message: 'Listing deleted successfully',
        };
    }

    // ========== UPLOAD LISTING PHOTOS ==========
    async uploadListingPhotos(listingId: number, userId: number, files: Express.Multer.File[]) {
        // Validate file count
        if (!files || files.length < 2) {
            throw new BadRequestException('Minimum 2 photos required');
        }

        if (files.length > 6) {
            throw new BadRequestException('Maximum 6 photos allowed');
        }

        // Check if listing exists and belongs to user
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        if (listing.userId !== userId) {
            // Delete uploaded files if not authorized
            files.forEach(file => fs.unlinkSync(file.path));
            throw new ForbiddenException('You can only upload photos to your own listings');
        }

        // Check if listing already has photos (max 6 total)
        const currentPhotoCount = listing.images.length;
        const newPhotoCount = files.length;
        const totalPhotos = currentPhotoCount + newPhotoCount;

        if (totalPhotos > 6) {
            // Delete uploaded files
            files.forEach(file => fs.unlinkSync(file.path));
            throw new BadRequestException(
                `Cannot add ${newPhotoCount} photos. Listing already has ${currentPhotoCount} photos. Maximum is 6.`
            );
        }

        // Generate photo URLs
        const photoUrls = files.map(file => `/uploads/listings/${file.filename}`);

        // Add photos to existing images array
        const updatedImages = [...listing.images, ...photoUrls];

        // Update listing
        const updatedListing = await this.prisma.listing.update({
            where: { id: listingId },
            data: { images: updatedImages },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return {
            message: `${files.length} photo(s) uploaded successfully`,
            totalPhotos: updatedImages.length,
            listing: updatedListing,
        };
    }

    // ========== DELETE LISTING PHOTO ==========
    async deleteListingPhoto(listingId: number, userId: number, photoIndex: number) {
        // Check if listing exists and belongs to user
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        if (listing.userId !== userId) {
            throw new ForbiddenException('You can only delete photos from your own listings');
        }

        // Check if photo index is valid
        if (photoIndex < 0 || photoIndex >= listing.images.length) {
            throw new BadRequestException(`Invalid photo index. Listing has ${listing.images.length} photos.`);
        }

        // Get photo URL to delete
        const photoToDelete = listing.images[photoIndex];

        // Delete physical file
        const photoPath = path.join('./uploads/listings', path.basename(photoToDelete));
        if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
        }

        // Remove photo from array
        const updatedImages = listing.images.filter((_, index) => index !== photoIndex);

        // Check if minimum photos requirement is met
        if (updatedImages.length < 2 && updatedImages.length > 0) {
            throw new BadRequestException('Cannot delete photo. Listings must have at least 2 photos or none.');
        }

        // Update listing
        const updatedListing = await this.prisma.listing.update({
            where: { id: listingId },
            data: { images: updatedImages },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return {
            message: 'Photo deleted successfully',
            totalPhotos: updatedImages.length,
            listing: updatedListing,
        };
    }
}