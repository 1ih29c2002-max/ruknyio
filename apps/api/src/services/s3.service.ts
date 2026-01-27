import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;

  constructor() {
    const region = process.env.AWS_REGION || 'eu-north-1';
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const clientConfig: any = { region };
    if (endpoint) {
      clientConfig.endpoint = endpoint;
      clientConfig.forcePathStyle = true;
    }
    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = { accessKeyId, secretAccessKey };
    }
    this.client = new S3Client(clientConfig);
  }

  async uploadBuffer(
    bucket: string,
    key: string,
    buffer: any,
    contentType: string,
  ) {
    // Normalize various input shapes to a Buffer/Uint8Array and provide ContentLength
    let body: Uint8Array | Buffer;
    try {
      if (Buffer.isBuffer(buffer)) {
        body = buffer;
      } else if (buffer && buffer instanceof Uint8Array) {
        body = buffer;
      } else if (buffer && typeof buffer.arrayBuffer === 'function') {
        const ab = await buffer.arrayBuffer();
        body = Buffer.from(new Uint8Array(ab));
      } else if (buffer && Array.isArray(buffer.data)) {
        // Handle serialized Buffer objects { type: 'Buffer', data: [...] }
        body = Buffer.from(buffer.data);
      } else if (buffer && buffer.buffer && buffer.byteLength) {
        // TypedArray-like with .buffer
        body = Buffer.from(buffer.buffer);
      } else if (typeof buffer === 'string') {
        body = Buffer.from(buffer);
      } else {
        throw new BadRequestException('Invalid buffer type for S3 upload');
      }
    } catch (err) {
      this.logger.error(
        `Failed to normalize upload buffer for key=${key}: ${err}`,
      );
      throw err;
    }

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: (body as Buffer).length,
      // Note: ACL removed - bucket may have Block Public Access enabled
    });
    try {
      this.logger.debug(
        `uploadBuffer: putting object to bucket=${bucket} key=${key} length=${(body as Buffer).length}`,
      );
      await this.client.send(cmd);
      return key;
    } catch (err: any) {
      this.logger.error(
        `S3 upload failed for bucket=${bucket} key=${key}: ${err?.name || err}`,
      );
      // Map common S3 error to friendlier message
      if (err && err.name === 'NoSuchBucket') {
        throw new BadRequestException(`S3 bucket does not exist: ${bucket}`);
      }
      throw err;
    }
  }

  async onModuleInit() {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) return;
    try {
      const cmd = new HeadBucketCommand({ Bucket: bucket });
      await this.client.send(cmd);
      this.logger.log(`S3 bucket reachable: ${bucket}`);
    } catch (err: any) {
      this.logger.warn(
        `S3 bucket check failed for ${bucket}: ${err?.name || err}`,
      );
    }
  }

  async deleteObject(bucket: string, key: string) {
    try {
      const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await this.client.send(cmd);
      return true;
    } catch (e) {
      this.logger.warn(`Failed deleting s3 object ${key}: ${e}`);
      return false;
    }
  }

  async getPresignedPutUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresInSeconds = 3600,
  ) {
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // Note: ACL removed - bucket may have Block Public Access enabled
      // Images will be served via presigned GET URLs instead
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSeconds });
  }

  /**
   * Generate a presigned GET URL for reading a private S3 object
   * Used when bucket has Block Public Access enabled
   */
  async getPresignedGetUrl(
    bucket: string,
    key: string,
    expiresInSeconds = 3600,
  ) {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSeconds });
  }

  /**
   * Convert multiple keys to presigned GET URLs
   */
  async getPresignedGetUrls(
    bucket: string,
    keys: string[],
    expiresInSeconds = 3600,
  ): Promise<string[]> {
    return Promise.all(
      keys.map((key) => this.getPresignedGetUrl(bucket, key, expiresInSeconds)),
    );
  }
}

export default S3Service;
