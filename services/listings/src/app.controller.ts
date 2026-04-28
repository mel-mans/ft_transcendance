import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';

@ApiTags('Listings')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}
    // Health check endpoint
    @Get()
    @ApiOperation({ summary: 'Health check' })
    getHealthCheck() {
        return this.appService.getHealthCheck();
    }
    // Create new listing
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new listing' })
    @ApiBody({ type: CreateListingDto })
    @ApiResponse({ status: 201, description: 'Listing created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createListing(@Req() req: any, @Body() createListingDto: CreateListingDto) {
        const userId = req.user.userId;
        return this.appService.createListing(userId, createListingDto);
    }
    // Get all active listings
    @Get('all')
    @ApiOperation({ summary: 'Get all active listings' })
    @ApiResponse({ status: 200, description: 'Returns all active listings' })
    async getAllListings() {
        return this.appService.getAllListings();
    }
    // Get current user listings
    @UseGuards(JwtAuthGuard)
    @Get('my-listings')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user listings' })
    @ApiResponse({ status: 200, description: 'Returns user listings' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyListings(@Req() req: any) {
        const userId = req.user.userId;
        return this.appService.getMyListings(userId);
    }
    // Get listing recommendations for current user
    @UseGuards(JwtAuthGuard)
    @Get('recommendations')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get listing recommendations for the current user' })
    @ApiResponse({ status: 200, description: 'Returns recommended listings' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getRecommendations(@Req() req: any) {
        const userId = req.user.userId;
        return this.appService.getRecommendations(userId);
    }

    // Get listing by ID
    @Get(':id')
    @ApiOperation({ summary: 'Get listing by ID' })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiResponse({ status: 200, description: 'Returns listing details' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async getListingById(@Param('id', ParseIntPipe) id: number) {
        return this.appService.getListingById(id);
    }
    // Update listing
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update listing' })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiBody({ type: UpdateListingDto })
    @ApiResponse({ status: 200, description: 'Listing updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not your listing' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async updateListing(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
        @Body() updateListingDto: UpdateListingDto,
    ) {
        const userId = req.user.userId;
        return this.appService.updateListing(id, userId, updateListingDto);
    }
    // Delete listing
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete listing' })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - not your listing' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async deleteListing(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const userId = req.user.userId;
        return this.appService.deleteListing(id, userId);
    }
// ========== UPLOAD LISTING PHOTOS ==========
@UseGuards(JwtAuthGuard)
@Post(':id/photos')
@ApiBearerAuth()
@ApiOperation({ summary: 'Upload listing photos (2-6 images)' })
@ApiParam({ name: 'id', description: 'Listing ID' })
@ApiConsumes('multipart/form-data')
@ApiBody({
    schema: {
        type: 'object',
        properties: {
            files: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    },
})
    @ApiResponse({ status: 200, description: 'Photos uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid number of files (need 2-6)' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Not your listing' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @UseInterceptors(FilesInterceptor('files', 6, multerConfig))
    async uploadPhotos(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const userId = req.user.userId;
        return this.appService.uploadListingPhotos(id, userId, files);
    }

    // ========== DELETE SPECIFIC PHOTO ==========
    @UseGuards(JwtAuthGuard)
    @Delete(':id/photos/:photoIndex')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete specific photo from listing' })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiParam({ name: 'photoIndex', description: 'Photo index (0-based)' })
    @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid photo index' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Not your listing' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async deletePhoto(
        @Param('id', ParseIntPipe) id: number,
        @Param('photoIndex', ParseIntPipe) photoIndex: number,
        @Req() req: any,
    ) {
        const userId = req.user.userId;
        return this.appService.deleteListingPhoto(id, userId, photoIndex);
    }


}