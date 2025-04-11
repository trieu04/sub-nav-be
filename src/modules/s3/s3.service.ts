import { Injectable, Logger } from "@nestjs/common";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { RequestPresigningArguments } from "@smithy/types";
import { createConfigErrorProxy } from "../../common/proxies/create-config-error.proxy";

@Injectable()
export class S3Service {
  public client: S3Client;
  private bucketName: string;
  private folder: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(
    configService: ConfigService,
  ) {
    const region = configService.get<string>("s3.region");
    const accessKeyId = configService.get<string>("s3.accessKeyId");
    const secretAccessKey = configService.get<string>("s3.secretAccessKey");
    const bucketName = configService.get<string>("s3.bucketName");
    const folder = configService.get<string>("s3.folder");

    if (region && accessKeyId && secretAccessKey && bucketName && folder) {
      this.bucketName = bucketName;
      this.folder = folder;
      this.client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    else {
      this.logger.warn(
        "S3 configuration (region, accessKeyId, secretAccessKey, bucketName or folder) is missing. "
        + "S3Service will be unavailable and throw errors on use.",
      );
      return createConfigErrorProxy(this);
    }
  }

  async generatePreSignedUrls(keys: string[], options?: RequestPresigningArguments) {
    const urlPromises = keys.map(key => this.generatePreSignedUrl(key, options));

    const result = await Promise.allSettled(urlPromises);

    return result.map(result => result.status === "fulfilled" ? result.value : null);
  }

  async generatePreSignedUrl(key: string, options?: RequestPresigningArguments) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.client, command, options);
  }

  async generatePutObjectPresignedUrl(key: string, options?: RequestPresigningArguments) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.folder + key,
    });

    return await getSignedUrl(this.client, command, options); ;
  };
}
