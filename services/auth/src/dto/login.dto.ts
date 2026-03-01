import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';  // ← ADD

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email or username' })  // ← ADD
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'MyPassword123', description: 'User password' })  // ← ADD
  @IsString()
  @IsNotEmpty()
  password: string;
}