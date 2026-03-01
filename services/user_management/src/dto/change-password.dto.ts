import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class ChangePasswordDto {
    @ApiProperty({ example: 'OldPassword123', description: 'Current password' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ example: 'NewPassword123', description: 'New password (min 8 chars, uppercase, lowercase, number)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'New password must contain uppercase, lowercase, and number',
    })
    newPassword: string;
}
