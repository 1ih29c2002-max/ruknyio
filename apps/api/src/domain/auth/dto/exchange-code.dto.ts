import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeCodeDto {
  @ApiProperty({
    description: 'One-time OAuth code',
    minLength: 64,
    maxLength: 128,
  })
  @IsString()
  @Length(32, 256)
  code: string;
}
