import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Listings')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Health check' })
    getHello(): string {
        return this.appService.getHello();
    }

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

    @Get('all')
    @ApiOperation({ summary: 'Get all active listings' })
    @ApiResponse({ status: 200, description: 'Returns all active listings' })
    async getAllListings() {
        return this.appService.getAllListings();
    }

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

    @Get(':id')
    @ApiOperation({ summary: 'Get listing by ID' })
    @ApiParam({ name: 'id', description: 'Listing ID' })
    @ApiResponse({ status: 200, description: 'Returns listing details' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async getListingById(@Param('id', ParseIntPipe) id: number) {
        return this.appService.getListingById(id);
    }

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
}