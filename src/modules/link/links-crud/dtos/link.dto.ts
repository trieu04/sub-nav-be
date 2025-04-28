import { ApiProperty } from "@dataui/crud/lib/crud";
import { PartialType } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { BaseEntityDto } from "../../../../common/dtos/base-entity.dto";

@Exclude()
export class LinkDto extends BaseEntityDto {
  @Expose()
  @ApiProperty({ nullable: true })
  name: string;

  @ApiProperty({ nullable: true })
  @Expose()
  description: string;

  @ApiProperty({ nullable: true })
  @Expose()
  destination: string;

  @ApiProperty({ nullable: true })
  @Expose()
  key: string;

  @ApiProperty({ nullable: true })
  @Expose()
  url: string;

  @ApiProperty({ nullable: true })
  @Expose()
  domainName: string;
}

export class CreateLinkDto {
  @ApiProperty({})
  @IsString()
  name: string;

  @ApiProperty({})
  @IsString()
  description: string;

  @ApiProperty({ require: true })
  @IsString()
  @IsUrl({ require_tld: false })
  destination: string;

  @ApiProperty({ require: true })
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @ApiProperty({ type: String, require: false, nullable: true })
  @IsString()
  key: string | null;
}

export class UpdateLinkDto extends PartialType(CreateLinkDto) {
  @ApiProperty({ })
  @IsString()
  key?: string;
}
