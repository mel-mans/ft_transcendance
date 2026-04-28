import { IsString, IsInt, IsBoolean, IsDateString, IsNotEmpty, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
    // ========== BASIC INFO (ALL REQUIRED) ==========
    
    @ApiProperty({ example: 'Cozy Apartment near Campus' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Paris 13e' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: 650 })
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    price: number;

    @ApiProperty({ example: 'EUR', enum: ['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'])
    currency: string;

    @ApiProperty({ example: '2026-02-01' })
    @IsDateString()
    @IsNotEmpty()
    availableDate: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    spotsTotal: number;

    @ApiProperty({ example: 0 })
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    spotsFilled: number;

    @ApiProperty({ example: 'Nice apartment with balcony and great view...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    // ========== AMENITIES (ALL REQUIRED BOOLEANS) ==========

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasWifi: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasKitchen: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    hasLaundry: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasMetroNearby: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    hasGarden: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasParking: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    petsOK: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    hasGym: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    hasAC: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    isSecure: boolean;
}