import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import * as fs from 'fs';      // ← ADD
import * as path from 'path';  // ← ADD
import axios from 'axios';

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
                        bio: true,
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
                        bio: true,
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
                        bio: true,
                    },
                },
            },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        return listing;
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
                        bio: true,
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
                        bio: true,
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
                        bio: true,
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

    // ========== AI RECOMMENDATIONS ==========
    async getAIRecommendations(userId: number) {
        try {
            // 1. Get current user's data (for AI processing only)
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true }
            });

            if (!currentUser || !currentUser.preferences) {
                throw new NotFoundException('User preferences not found. Please complete your profile first.');
            }

            // 2. Get all listings with their owners' data (internal use only)
            const listingsInternal = await this.prisma.listing.findMany({
                where: {
                    isActive: true,
                    userId: { not: userId }  // Exclude user's own listings
                },
                include: {
                    user: {
                        include: { preferences: true }
                    }
                }
            });

            // 3. Get safe listings for response (without sensitive data)
            const listingsSafe = await this.prisma.listing.findMany({
                where: {
                    isActive: true,
                    userId: { not: userId }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                            bio: true,
                        }
                    }
                }
            });

            if (listingsInternal.length === 0) {
                return {
                    recommendations: [],
                    message: 'No listings available yet'
                };
            }

            // 4. Format data for AI service (using internal data)
            const targetUser = this.formatUserForAI(currentUser);
            const candidates = listingsInternal
                .filter(l => l.user.preferences)  // Only include users with preferences
                .map(listing => this.formatUserForAI(listing.user));

            if (candidates.length === 0) {
                return {
                    recommendations: listingsSafe.slice(0, 5),  // Return first 5 as fallback (safe data)
                    message: 'AI recommendations not available, showing recent listings',
                    aiScore: null
                };
            }

            // 5. Call AI service
            const aiResponse = await axios.post(
                'http://ai:3006/api/ai/match',
                {
                    target_user: targetUser,
                    candidates: candidates
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000  // 5 second timeout
                }
            );

            // 6. Find the recommended listing (use safe data for response)
            const bestMatchId = aiResponse.data.best_match_id;
            const recommendedListing = listingsSafe.find(l => l.userId === bestMatchId);

            if (!recommendedListing) {
                throw new NotFoundException('Recommended listing not found');
            }

            return {
                recommendation: recommendedListing,
                aiScore: aiResponse.data.confidence_score,
                algorithm: aiResponse.data.algorithm_used,
                exploration: aiResponse.data.exploration,
                allListings: listingsSafe  // ✅ Return SAFE data (no email/password)
            };

        } catch (error) {
            console.error('AI recommendation error:', error);
            
            // Fallback: return simple recommendations if AI fails (with safe user data)
            const fallbackListings = await this.prisma.listing.findMany({
                where: {
                    isActive: true,
                    userId: { not: userId }
                },
                include: { 
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                            bio: true,
                        }
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            });

            return {
                recommendations: fallbackListings,
                message: 'AI service unavailable, showing recent listings',
                aiScore: null
            };
        }
    }

    // Helper: Format user data for AI service
    private formatUserForAI(user: any) {
        const prefs = user.preferences;
        
        return {
            user_id: user.id,
            budget_max: prefs?.budget || 1000,
            cleanliness: this.mapCleanToScale(prefs?.clean),
            sleep_schedule: prefs?.nightOwl ? 'night_owl' : 'early_bird',
            smoker: prefs?.smoker || false,
            has_pets: prefs?.petFriendly || false
        };
    }

    // Helper: Map boolean clean to 1-5 scale
    private mapCleanToScale(clean?: boolean): number {
        return clean ? 5 : 2;  // Clean people = 5, not clean = 2
    }

    // ========== RECORD USER FEEDBACK FOR ML ==========
    async recordListingInteraction(
        userId: number,
        listingId: number,
        action: 'view' | 'like' | 'contact' | 'reject'
    ) {
        try {
            // Get user and listing owner data (internal use only for AI)
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true }
            });

            const listing = await this.prisma.listing.findUnique({
                where: { id: listingId },
                include: {
                    user: { include: { preferences: true } }
                }
            });

            if (!user || !listing) return;

            // Send feedback to AI service (internal data, not exposed to client)
            await axios.post(
                'http://ai:3006/api/ai/feedback',
                {
                    target_user: this.formatUserForAI(user),
                    candidate_user: this.formatUserForAI(listing.user),
                    action: action
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 3000
                }
            );

            console.log(`✅ Recorded ${action} interaction for user ${userId} on listing ${listingId}`);

        } catch (error) {
            console.error('Failed to record AI feedback:', error.message);
            // Don't fail the main operation if AI feedback fails
        }
    }
}