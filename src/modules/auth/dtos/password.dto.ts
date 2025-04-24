import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";
import { Transform } from "class-transformer";

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}

export class GetPasswordResponseDto {
  @ApiProperty({ nullable: true })
  updatedAt: Date;
}

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsUrl({ require_tld: false, require_protocol: true })
  endpointUrl: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;
}

export class ResetPasswordWithCodeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}
