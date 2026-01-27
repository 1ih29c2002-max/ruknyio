import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UrlShortenerService } from './url-shortener.service';
import { JwtAuthGuard } from '../../../core/common/guards/auth/jwt-auth.guard';
import { CreateShortUrlDto } from './dto';

@ApiTags('URL Shortener')
@Controller()
export class UrlShortenerController {
  constructor(private urlShortener: UrlShortenerService) {}

  /**
   * Redirect short URL to original URL
   */
  @Get('s/:code')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  @ApiResponse({ status: 301, description: 'Redirect to original URL' })
  @ApiResponse({ status: 404, description: 'Short URL not found or expired' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlShortener.resolve(code);

    if (url) {
      return res.redirect(301, url);
    }

    return res.status(404).json({
      statusCode: 404,
      message: 'Short URL not found or has expired',
    });
  }

  /**
   * Create short URL
   */
  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiResponse({ status: 201, description: 'Short URL created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  async createShortUrl(@Request() req, @Body() createDto: CreateShortUrlDto) {
    const expiresAt = createDto.expiresAt
      ? new Date(createDto.expiresAt)
      : undefined;
    const shortUrl = await this.urlShortener.shorten(
      createDto.url,
      req.user.id,
      expiresAt,
    );

    return {
      originalUrl: createDto.url,
      shortUrl,
      expiresAt,
    };
  }

  /**
   * Get user's URL statistics
   */
  @Get('url-shortener/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get URL shortener statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStats(@Request() req) {
    return this.urlShortener.getStats(req.user.id);
  }

  /**
   * Get specific URL stats
   */
  @Get('url-shortener/:code/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific short URL statistics' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Short URL not found' })
  getUrlStats(@Param('code') code: string, @Request() req) {
    return this.urlShortener.getUrlStats(code, req.user.id);
  }

  /**
   * Delete short URL
   */
  @Delete('url-shortener/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete short URL' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  @ApiResponse({ status: 200, description: 'Short URL deleted successfully' })
  @ApiResponse({ status: 404, description: 'Short URL not found' })
  remove(@Param('code') code: string, @Request() req) {
    return this.urlShortener.remove(code, req.user.id);
  }
}
