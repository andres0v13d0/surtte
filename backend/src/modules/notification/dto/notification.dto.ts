import { IsString, IsOptional, IsObject, IsNotEmpty, IsNumber } from 'class-validator';

export class SendNotificationDto {
  @IsNumber()
  @IsOptional()
  userId?: number; 

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string; 

  @IsObject()
  @IsOptional()
  data?: Record<string, any>; 
}
