import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { Response } from 'express';
import { S3Service } from '../../shared/services/s3.service';

/**
 * Files Controller - Serves S3 assets via presigned URL redirects
 *
 * This controller is VERSION_NEUTRAL meaning it's accessible at /api/users/...
 * without the /v1 version prefix. This allows raw S3 keys stored in the database
 * to be resolved to presigned URLs without breaking existing data.
 */
@Controller({ version: VERSION_NEUTRAL })
export class FilesController {
  private readonly bucket = process.env.S3_BUCKET || 'rukny-storage';

  constructor(private readonly s3Service: S3Service) {}

  @Get('users/:userId/profile/avatar/:filename')
  async getAvatar(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!userId || !filename) throw new NotFoundException();
    const key = `users/${userId}/profile/avatar/${filename}`;
    const url = await this.s3Service.getPresignedGetUrl(this.bucket, key, 3600);
    return res.redirect(url);
  }

  @Get('users/:userId/profile/cover/:filename')
  async getCover(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!userId || !filename) throw new NotFoundException();
    const key = `users/${userId}/profile/cover/${filename}`;
    const url = await this.s3Service.getPresignedGetUrl(this.bucket, key, 3600);
    return res.redirect(url);
  }
}
