import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString, IsOptional, MinLength, MaxLength, Min, Max, IsInt } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'johndoe', description: 'Username', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  username?: string;

  @IsString()
  @IsOptional()
  name?: string;  // ← Changed from firstName/lastName

  @IsInt()
  @IsOptional()
  @Min(18)
  @Max(100)
  age?: number;  // ← NEW

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;
}