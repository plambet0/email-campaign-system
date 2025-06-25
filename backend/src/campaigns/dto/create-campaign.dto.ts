import { IsString, IsArray, IsObject, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class SmtpConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  pass: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsString()
  @IsNotEmpty()
  htmlTemplate: string;

  @IsObject()
  smtpConfig: SmtpConfigDto;
}