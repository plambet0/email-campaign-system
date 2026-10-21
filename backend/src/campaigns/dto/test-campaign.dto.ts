import { IsEmail, IsNotEmpty } from 'class-validator';

export class TestCampaignDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
