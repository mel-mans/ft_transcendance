import { IsString, IsInt, IsBoolean, IsDateString, IsIn, Min, Max, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProfileDto {
    // ========== BASIC INFO (REQUIRED) ==========
    
    @ApiProperty({ example: 'johndoe', description: 'Username (min 3 chars)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'John Doe', description: 'Full name (first and last name)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-ZÀ-ÿ\s]+\s+[a-zA-ZÀ-ÿ\s]+$/, {
        message: 'Name must be a full name (first and last name)',
    })
    name: string;

    @ApiProperty({ example: 24, description: 'Age (18-100)' })
    @IsInt()
    @IsNotEmpty()
    @Min(18)
    @Max(100)
    age: number;

    // ========== ADD THIS ==========
    @ApiProperty({ 
        example: 'male', 
        description: 'Sex/Gender',
        enum: ['male', 'female', 'other']
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['male', 'female', 'other'])
    sex: string;
    // ==============================

    @ApiProperty({ example: 'Casablanca', description: 'Preferred location' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: '2026-04-01', description: 'Move-in date (ISO format)' })
    @IsDateString()
    @IsNotEmpty()
    moveInDate: string;

    @ApiProperty({ example: 5000, description: 'Monthly budget' })
    @IsInt()
    @IsNotEmpty()
    budget: number;

    @ApiProperty({ 
        example: 'MAD', 
        description: 'Currency code',
        enum: ['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD']
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'])
    currency: string;

    @ApiProperty({ example: '42 student looking for roommate', description: 'About you' })
    @IsString()
    @IsNotEmpty()
    bio: string;

    // ========== LIFESTYLE PREFERENCES (REQUIRED) ==========

    @ApiProperty({ example: false, description: 'Smoker' })
    @IsBoolean()
    @IsNotEmpty()
    smoker: boolean;

    @ApiProperty({ example: true, description: 'Prefers quiet hours' })
    @IsBoolean()
    @IsNotEmpty()
    quietHours: boolean;

    @ApiProperty({ example: false, description: 'Early bird' })
    @IsBoolean()
    @IsNotEmpty()
    earlyBird: boolean;

    @ApiProperty({ example: true, description: 'Night owl' })
    @IsBoolean()
    @IsNotEmpty()
    nightOwl: boolean;

    @ApiProperty({ example: true, description: 'Pet friendly' })
    @IsBoolean()
    @IsNotEmpty()
    petFriendly: boolean;

    @ApiProperty({ example: true, description: 'Cooks regularly' })
    @IsBoolean()
    @IsNotEmpty()
    cooks: boolean;

    @ApiProperty({ example: true, description: 'Gamer' })
    @IsBoolean()
    @IsNotEmpty()
    gamer: boolean;

    @ApiProperty({ example: false, description: 'Social/outgoing' })
    @IsBoolean()
    @IsNotEmpty()
    social: boolean;

    @ApiProperty({ example: true, description: 'Studious' })
    @IsBoolean()
    @IsNotEmpty()
    studious: boolean;

    @ApiProperty({ example: true, description: 'Clean/tidy' })
    @IsBoolean()
    @IsNotEmpty()
    clean: boolean;
}