import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString, IsOptional, MinLength, MaxLength, Min, Max, IsInt, Matches, IsIn, IsBoolean, IsDateString } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ example: 'johndoe', description: 'Username', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(20, { message: 'Username must not exceed 20 characters' })
    username?: string;

    @ApiProperty({ example: 'John Doe', description: 'Full name (first and last name)', required: false })
    @IsString()
    @IsOptional()
    @Matches(/^[a-zA-ZÀ-ÿ\s]+\s+[a-zA-ZÀ-ÿ\s]+$/, {
        message: 'Name must be a full name (first and last name)',
    })
    name?: string;

    @ApiProperty({ example: 24, description: 'Age', required: false })
    @IsInt()
    @IsOptional()
    @Min(18)
    @Max(100)
    age?: number;

    @ApiProperty({ example: '42 student looking for roommate', description: 'Bio', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
    bio?: string;

    @ApiProperty({ 
        example: 'male', 
        description: 'Sex/Gender',
        enum: ['male', 'female', 'other'],
        required: false 
    })
    @IsString()
    @IsOptional()
    @IsIn(['male', 'female', 'other'])
    sex?: string;

    // ========== LOCATION & BUDGET (ALL OPTIONAL) ==========

    @ApiProperty({ example: 'Casablanca', description: 'Preferred location', required: false })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ example: '2026-04-01', description: 'Move-in date', required: false })
    @IsDateString()
    @IsOptional()
    moveInDate?: string;

    @ApiProperty({ example: 5000, description: 'Monthly budget', required: false })
    @IsInt()
    @IsOptional()
    budget?: number;

    @ApiProperty({ 
        example: 'MAD', 
        description: 'Currency',
        enum: ['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'],
        required: false
    })
    @IsString()
    @IsOptional()
    @IsIn(['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'])
    currency?: string;

    // ========== LIFESTYLE PREFERENCES (ALL OPTIONAL) ==========

    @ApiProperty({ example: false, description: 'Smoker', required: false })
    @IsBoolean()
    @IsOptional()
    smoker?: boolean;

    @ApiProperty({ example: true, description: 'Quiet hours', required: false })
    @IsBoolean()
    @IsOptional()
    quietHours?: boolean;

    @ApiProperty({ example: false, description: 'Early bird', required: false })
    @IsBoolean()
    @IsOptional()
    earlyBird?: boolean;

    @ApiProperty({ example: true, description: 'Night owl', required: false })
    @IsBoolean()
    @IsOptional()
    nightOwl?: boolean;

    @ApiProperty({ example: true, description: 'Pet friendly', required: false })
    @IsBoolean()
    @IsOptional()
    petFriendly?: boolean;

    @ApiProperty({ example: true, description: 'Cooks', required: false })
    @IsBoolean()
    @IsOptional()
    cooks?: boolean;

    @ApiProperty({ example: true, description: 'Gamer', required: false })
    @IsBoolean()
    @IsOptional()
    gamer?: boolean;

    @ApiProperty({ example: false, description: 'Social', required: false })
    @IsBoolean()
    @IsOptional()
    social?: boolean;

    @ApiProperty({ example: true, description: 'Studious', required: false })
    @IsBoolean()
    @IsOptional()
    studious?: boolean;

    @ApiProperty({ example: true, description: 'Clean', required: false })
    @IsBoolean()
    @IsOptional()
    clean?: boolean;
}