import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/common/guards/auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard quick stats for current user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'object',
          properties: {
            active: { type: 'number' },
            total: { type: 'number' },
          },
        },
        products: {
          type: 'object',
          properties: {
            active: { type: 'number' },
            total: { type: 'number' },
          },
        },
        forms: {
          type: 'object',
          properties: {
            active: { type: 'number' },
            total: { type: 'number' },
          },
        },
        views: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            thisMonth: { type: 'number' },
          },
        },
      },
    },
  })
  async getQuickStats(@Request() req) {
    return this.dashboardService.getQuickStats(req.user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity for current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: ['event_registration', 'store_order', 'form_submission'],
          },
          title: { type: 'string' },
          description: { type: 'string' },
          avatar: { type: 'string', nullable: true },
          href: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getRecentActivity(@Request() req, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(
      req.user.id,
      limit ? Number(limit) : 10,
    );
  }
}
