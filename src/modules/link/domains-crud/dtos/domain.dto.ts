import { ApiProperty } from "@dataui/crud/lib/crud";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { BaseEntityDto } from "../../../../common/dtos/base-entity.dto";
import { DomainEntity, DomainGroupEnum, DomainTypeEnum } from "../../../../entities/domain.entity";
import { IsUnique } from "../../../../common/validators/is-unique.validator";
import { PartialType } from "@nestjs/swagger";

@Expose()
export class DomainDto extends BaseEntityDto {
  @ApiProperty({ })
  @Expose()
  name: string;

  @ApiProperty({ nullable: true })
  @Expose()
  description: string;

  @ApiProperty({ enum: DomainTypeEnum })
  @Expose()
  type: string;

  @ApiProperty({ enum: DomainGroupEnum })
  @Expose()
  group: string;
}

export class CreateDomainDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  @Transform(params => params.value.trim().toLowerCase())
  @IsUnique(DomainEntity, "name")
  name: string;

  @ApiProperty({})
  @IsString()
  description: string;

  @ApiProperty({ enum: DomainTypeEnum })
  @IsEnum(DomainTypeEnum)
  type: string;

  @ApiProperty({ enum: DomainGroupEnum })
  @IsEnum(DomainGroupEnum)
  group: string;
}

export class UpdateDomainDto extends PartialType(CreateDomainDto) {}
