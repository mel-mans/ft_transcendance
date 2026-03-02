import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) {}

    getHello(): string {
        return 'Hello from Listings Service!';
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
}