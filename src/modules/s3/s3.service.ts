import { Injectable } from "@nestjs/common";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { RequestPresigningArguments } from "@smithy/types";

@Injectable()
export class S3Service {
  public client: S3Client;
  private bucketName: string;
  private folder: string;

  constructor(
    configService: ConfigService,
  ) {
    try {
      const s3Config = {
        region: configService.getOrThrow("s3.region"),
        accessKeyId: configService.getOrThrow("s3.accessKeyId"),
        secretAccessKey: configService.getOrThrow("s3.secretAccessKey"),
        bucketName: configService.getOrThrow("s3.bucketName"),
        folder: configService.get("s3.folder", "n-crawl/"),
      };

      this.bucketName = s3Config.bucketName;
      this.folder = s3Config.folder;
      this.client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      });
    }
    catch (error) {
      throw new Error("S3 configuration is missing", error);
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
