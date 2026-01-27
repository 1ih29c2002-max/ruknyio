# المرحلة الثانية: إدارة الملفات الشخصية والروابط الاجتماعية
# Phase 2: User Profiles & Social Links Management

## نظرة عامة | Overview
هذه المرحلة تركز على بناء نظام الملفات الشخصية الكامل، إدارة الروابط الاجتماعية، ونظام مختصر الروابط.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** عالية  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 1)

---

## المتطلبات الأساسية | Prerequisites

- ✅ إتمام المرحلة الأولى بنجاح
- ✅ Backend و Frontend يعملان
- ✅ قاعدة البيانات متصلة
- ✅ نظام المصادقة جاهز

---

## الأهداف الرئيسية | Main Objectives

### 1. نظام الملفات الشخصية
- ✅ إنشاء وتعديل الملف الشخصي
- ✅ رفع صورة الملف الشخصي والغلاف
- ✅ إدارة معلومات المستخدم
- ✅ إعدادات الخصوصية (عام/خاص)

### 2. إدارة الروابط الاجتماعية
- ✅ إضافة روابط وسائل التواصل الاجتماعي
- ✅ ترتيب الروابط (drag & drop)
- ✅ أيقونات تلقائية للمنصات
- ✅ تخصيص العرض

### 3. نظام مختصر الروابط
- ✅ إنشاء روابط مختصرة
- ✅ تتبع النقرات
- ✅ إحصائيات الروابط
- ✅ روابط قابلة للتخصيص

### 4. صفحات العرض العامة
- ✅ صفحة الملف الشخصي العامة
- ✅ تصميم احترافي وجذاب
- ✅ Responsive design
- ✅ SEO optimization

### 5. نظام المتابعة المتقدم
- ✅ متابعة المستخدمين الآخرين
- ✅ قائمة المتابِعين والمتابَعين
- ✅ إشعارات المتابعة
- ✅ إحصائيات المتابعة

### 6. نظام المنشورات التفاعلي
- ✅ إنشاء منشورات نصية وصور
- ✅ نظام الإعجاب والتعليقات
- ✅ مشاركة المنشورات
- ✅ Timeline للمتابعين

### 7. مشاركة الملف الشخصي
- ✅ إنشاء QR Code للملف الشخصي
- ✅ مشاركة عبر وسائل التواصل
- ✅ روابط مشاركة مخصصة
- ✅ إحصائيات المشاركة

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 2.1: Backend - Profile Module

#### 1. إنشاء Profile DTOs

**apps/api/src/profiles/dto/create-profile.dto.ts:**
```typescript
import { IsString, IsOptional, IsEnum, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';

export class CreateProfileDto {
  @ApiProperty({ example: 'johndoe', description: 'Unique username' })
  @IsString()
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores',
  })
  @MaxLength(30)
  username: string;

  @ApiPropertyOptional({ example: 'Full-stack developer passionate about tech' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 'PUBLIC', enum: Visibility })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
```

**apps/api/src/profiles/dto/update-profile.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
```

#### 2. Profile Service

**apps/api/src/profiles/profiles.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProfileDto: CreateProfileDto) {
    // Check if username exists
    const existingProfile = await this.prisma.profile.findUnique({
      where: { username: createProfileDto.username },
    });

    if (existingProfile) {
      throw new ConflictException('Username already taken');
    }

    // Check if user already has a profile
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (userProfile) {
      throw new ConflictException('User already has a profile');
    }

    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        userId,
      },
      include: {
        socialLinks: true,
      },
    });
  }

  async findByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        socialLinks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Don't return email if profile is private and not the owner
    if (profile.visibility === 'PRIVATE') {
      delete profile.user.email;
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check username uniqueness if updating username
    if (updateProfileDto.username && updateProfileDto.username !== profile.username) {
      const existingProfile = await this.prisma.profile.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existingProfile) {
        throw new ConflictException('Username already taken');
      }
    }

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        socialLinks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async uploadAvatar(userId: string, fileName: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { avatar: fileName },
    });
  }

  async uploadCover(userId: string, fileName: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { coverImage: fileName },
    });
  }
}
```

#### 3. Profile Controller

**apps/api/src/profiles/profiles.controller.ts:**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user profile' })
  create(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(req.user.userId, createProfileDto);
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get profile by username' })
  findOne(@Param('username') username: string) {
    return this.profilesService.findByUsername(username);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(req.user.userId, updateProfileDto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    // TODO: Implement file upload to Cloudinary/S3
    return this.profilesService.uploadAvatar(req.user.userId, file.filename);
  }
}
```

---

### المرحلة 2.2: Backend - Social Links Module

#### 1. Social Links DTOs

**apps/api/src/social-links/dto/create-social-link.dto.ts:**
```typescript
import { IsString, IsUrl, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocialLinkDto {
  @ApiProperty({ example: 'Twitter' })
  @IsString()
  platform: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'https://twitter.com/johndoe' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
```

#### 2. Social Links Service

**apps/api/src/social-links/social-links.service.ts:**
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialLinkDto, UpdateSocialLinkDto } from './dto';
import { UrlShortenerService } from '../url-shortener/url-shortener.service';

@Injectable()
export class SocialLinksService {
  constructor(
    private prisma: PrismaService,
    private urlShortener: UrlShortenerService,
  ) {}

  async create(userId: string, createDto: CreateSocialLinkDto) {
    // Get user's profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found. Create a profile first.');
    }

    // Generate short URL
    const shortUrl = await this.urlShortener.shorten(createDto.url, userId);

    return this.prisma.socialLink.create({
      data: {
        ...createDto,
        profileId: profile.id,
        shortUrl,
      },
    });
  }

  async findByProfile(profileId: string) {
    return this.prisma.socialLink.findMany({
      where: { profileId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async update(userId: string, linkId: string, updateDto: UpdateSocialLinkDto) {
    const link = await this.prisma.socialLink.findUnique({
      where: { id: linkId },
      include: { profile: true },
    });

    if (!link) {
      throw new NotFoundException('Social link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this link');
    }

    // If URL changed, generate new short URL
    let shortUrl = link.shortUrl;
    if (updateDto.url && updateDto.url !== link.url) {
      shortUrl = await this.urlShortener.shorten(updateDto.url, userId);
    }

    return this.prisma.socialLink.update({
      where: { id: linkId },
      data: {
        ...updateDto,
        shortUrl,
      },
    });
  }

  async remove(userId: string, linkId: string) {
    const link = await this.prisma.socialLink.findUnique({
      where: { id: linkId },
      include: { profile: true },
    });

    if (!link) {
      throw new NotFoundException('Social link not found');
    }

    if (link.profile.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this link');
    }

    return this.prisma.socialLink.delete({
      where: { id: linkId },
    });
  }

  async reorder(userId: string, linkIds: string[]) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Update display order for each link
    const updates = linkIds.map((linkId, index) =>
      this.prisma.socialLink.update({
        where: { id: linkId },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Links reordered successfully' };
  }
}
```

---

### المرحلة 2.3: Backend - URL Shortener Module

#### 1. URL Shortener Service

**apps/api/src/url-shortener/url-shortener.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class UrlShortenerService {
  constructor(private prisma: PrismaService) {}

  async shorten(url: string, userId?: string): Promise<string> {
    const code = await this.generateUniqueCode();

    await this.prisma.shortUrl.create({
      data: {
        originalUrl: url,
        shortCode: code,
        userId,
      },
    });

    return `${process.env.APP_URL}/s/${code}`;
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      code = crypto.randomBytes(4).toString('hex');
      const existing = await this.prisma.shortUrl.findUnique({
        where: { shortCode: code },
      });
      exists = !!existing;
    } while (exists);

    return code;
  }

  async resolve(code: string) {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });

    if (!shortUrl) {
      return null;
    }

    // Increment click count asynchronously
    this.prisma.shortUrl
      .update({
        where: { id: shortUrl.id },
        data: { clicks: { increment: 1 } },
      })
      .catch(console.error);

    return shortUrl.originalUrl;
  }

  async getStats(userId: string) {
    return this.prisma.shortUrl.findMany({
      where: { userId },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

**apps/api/src/url-shortener/url-shortener.controller.ts:**
```typescript
import { Controller, Get, Post, Body, Param, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UrlShortenerService } from './url-shortener.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('URL Shortener')
@Controller()
export class UrlShortenerController {
  constructor(private urlShortener: UrlShortenerService) {}

  @Get('s/:code')
  @ApiOperation({ summary: 'Redirect to original URL' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlShortener.resolve(code);

    if (url) {
      return res.redirect(301, url);
    }

    return res.status(404).send('Short URL not found');
  }

  @Get('url-shortener/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get URL shortener statistics' })
  getStats(@Request() req) {
    return this.urlShortener.getStats(req.user.userId);
  }
}
```

---

### المرحلة 2.4: Frontend - Profile Pages

#### 1. صفحة إنشاء الملف الشخصي

**apps/web/src/app/dashboard/profile/create/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createProfile } from '@/lib/api/profiles';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, hyphens, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await createProfile(data);
      router.push('/dashboard/profile');
    } catch (error: any) {
      alert(error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. صفحة الملف الشخصي العامة

**apps/web/src/app/[username]/page.tsx:**
```typescript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProfileByUsername } from '@/lib/api/profiles';
import { SocialLinksList } from '@/components/profile/social-links-list';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="container max-w-4xl mx-auto px-4 -mt-20">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-24 mb-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold mt-4">{profile.user.name}</h1>
            <p className="text-gray-600">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="text-center mb-8">
              <p className="text-gray-700 max-w-2xl mx-auto">{profile.bio}</p>
            </div>
          )}

          {/* Social Links */}
          <SocialLinksList links={profile.socialLinks} />
        </div>
      </div>
    </div>
  );
}
```

#### 3. API Client Functions

**apps/web/src/lib/api/profiles.ts:**
```typescript
import { apiClient } from './client';

export interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  socialLinks: SocialLink[];
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  shortUrl?: string;
  displayOrder: number;
}

export async function createProfile(data: { username: string; bio?: string }) {
  const response = await apiClient.post('/profiles', data);
  return response.data;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const response = await apiClient.get(`/profiles/${username}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function updateProfile(data: Partial<Profile>) {
  const response = await apiClient.put('/profiles', data);
  return response.data;
}
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Profile CRUD APIs جاهزة
- [ ] Social Links management APIs جاهزة
- [ ] URL shortener يعمل
- [ ] صفحة إنشاء الملف الشخصي
- [ ] صفحة الملف الشخصي العامة
- [ ] صفحة إدارة الروابط الاجتماعية
- [ ] رفع الصور (Avatar & Cover)
- [ ] إحصائيات الروابط المختصرة
- [ ] اختبارات API
- [ ] اختبارات Frontend

### 📊 الميزات المنجزة
```
✅ إنشاء الملف الشخصي
✅ تعديل الملف الشخصي
✅ إضافة روابط اجتماعية
✅ حذف روابط
✅ إعادة ترتيب الروابط
✅ مختصر الروابط
✅ تتبع النقرات
✅ صفحة عرض عامة
```

---

## اختبار المرحلة | Phase Testing

### 1. اختبار APIs الأساسية
```bash
# إنشاء ملف شخصي
curl -X POST http://localhost:3001/api/v1/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","bio":"Test bio"}'

# الحصول على ملف شخصي
curl http://localhost:3001/api/v1/profiles/testuser

# إضافة رابط اجتماعي
curl -X POST http://localhost:3001/api/v1/social-links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform":"Twitter",
    "username":"testuser",
    "url":"https://twitter.com/testuser"
  }'
```

### 2. اختبار نظام المتابعة ⭐
```bash
# متابعة مستخدم
curl -X POST http://localhost:3001/api/v1/follow/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# إلغاء المتابعة
curl -X DELETE http://localhost:3001/api/v1/follow/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# إحصائيات المتابعة
curl http://localhost:3001/api/v1/follow/USER_ID/stats

# اقتراحات المتابعة
curl http://localhost:3001/api/v1/follow/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. اختبار نظام المنشورات ⭐
```bash
# إنشاء منشور
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"My first post!","isPublic":true}'

# جلب Timeline
curl http://localhost:3001/api/v1/posts/timeline \
  -H "Authorization: Bearer YOUR_TOKEN"

# إعجاب بمنشور
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"

# إضافة تعليق
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/comment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!"}'
```

### 4. اختبار نظام QR Code والمشاركة ⭐
```bash
# إنشاء QR Code للملف الشخصي
curl http://localhost:3001/api/v1/share/profile/testuser/qr

# روابط المشاركة
curl http://localhost:3001/api/v1/share/profile/testuser/share-links

# QR Code لرابط اجتماعي
curl http://localhost:3001/api/v1/share/social-link/LINK_ID/qr

# QR Code مخصص
curl -X POST http://localhost:3001/api/v1/share/custom-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data":"https://example.com",
    "size":400,
    "backgroundColor":"#ffffff",
    "foregroundColor":"#000000"
  }'
```

### 5. اختبار Frontend المتقدم ⭐
```
1. زيارة /dashboard/profile/create
2. إنشاء ملف شخصي جديد
3. إضافة روابط اجتماعية
4. زيارة /[username] للمعاينة
5. اختبار Follow Button
6. إنشاء منشور جديد
7. التفاعل مع المنشورات (إعجاب/تعليق)
8. مشاركة الملف الشخصي عبر QR Code
9. تجربة روابط المشاركة الاجتماعية
10. تحميل QR Code
```

### 6. اختبار سيناريوهات متقدمة ⭐
```
المتابعة والتفاعل:
1. المستخدم A يتابع المستخدم B
2. المستخدم B ينشر منشور
3. المستخدم A يرى المنشور في Timeline
4. المستخدم A يعجب بالمنشور ويعلق عليه
5. المستخدم B يحصل على إشعار

المشاركة والQR:
1. إنشاء QR Code للملف الشخصي
2. مسح QR Code بالهاتف
3. فتح الملف الشخصي
4. مشاركة عبر WhatsApp/Telegram
5. تتبع إحصائيات المشاركة
```

---

## 📊 الميزات المكتملة الجديدة ⭐

### ✅ نظام المتابعة
```
✅ متابعة/إلغاء متابعة المستخدمين
✅ قائمة المتابِعين والمتابَعين  
✅ إحصائيات المتابعة (عدد المتابعين/المتابَعين)
✅ اقتراحات المتابعة الذكية
✅ التحقق من حالة المتابعة
✅ منع متابعة النفس
```

### ✅ نظام المنشورات
```
✅ إنشاء منشورات نصية وصور
✅ Timeline للمنشورات من المستخدمين المُتابَعين
✅ نظام الإعجاب (Like/Unlike)
✅ نظام التعليقات
✅ فلترة المحتوى (عام/خاص)
✅ إحصائيات التفاعل
✅ منشورات المستخدم الشخصية
```

### ✅ نظام QR Code والمشاركة
```
✅ QR Code للملف الشخصي
✅ QR Code للروابط الاجتماعية
✅ QR Code مخصص (ألوان وحجم)
✅ روابط مشاركة لجميع المنصات الاجتماعية
✅ تحميل QR Code كصورة
✅ نسخ الرابط إلى الحافظة
✅ تتبع إحصائيات المشاركة
```

### ✅ مكونات Frontend المتقدمة
```
✅ FollowButton - زر المتابعة التفاعلي
✅ Timeline - عرض المنشورات
✅ QRShare - مكون مشاركة متقدم
✅ PostCard - عرض المنشورات
✅ CommentSection - نظام التعليقات
✅ ShareModal - نافذة المشاركة
```

---

## ⭐ **الميزات المتقدمة الجديدة**

### المرحلة 2.4: Backend - نظام المتابعة (Follow System)

#### 1. إضافة Follow Models إلى Prisma Schema

**إضافة إلى apps/api/prisma/schema.prisma:**
```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String   // المستخدم الذي يتابع
  followingId String   // المستخدم المُتابَع
  createdAt   DateTime @default(now())
  
  follower    User     @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}

// إضافة إلى User model
model User {
  // ... الحقول الموجودة
  
  // علاقات المتابعة
  following   Follow[] @relation("UserFollowing")
  followers   Follow[] @relation("UserFollowers")
  
  // المنشورات
  posts       Post[]
  likes       Like[]
  comments    Comment[]
  
  @@map("users")
}
```

#### 2. Follow Service & Controller

**apps/api/src/follow/follow.service.ts:**
```typescript
@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string) {
    // منع متابعة النفس
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }

    // إنشاء المتابعة
    const follow = await this.prisma.follow.create({
      data: { followerId, followingId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            profile: { select: { username: true, avatar: true } },
          },
        },
      },
    });

    return follow;
  }

  async getFollowStats(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return { followersCount, followingCount };
  }
}
```

**API Endpoints:**
```typescript
POST   /follow/:userId      // متابعة مستخدم
DELETE /follow/:userId      // إلغاء المتابعة
GET    /follow/:userId/stats // إحصائيات المتابعة
GET    /follow/suggestions   // اقتراحات المتابعة
```

---

### المرحلة 2.5: Backend - نظام المنشورات (Posts System)

#### 1. Posts Models إلى Prisma Schema

```prisma
model Post {
  id          String     @id @default(uuid())
  userId      String
  content     String?
  imageUrl    String?
  isPublic    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes       Like[]
  comments    Comment[]
  
  @@index([userId, createdAt])
  @@map("posts")
}

model Like {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@map("likes")
}

model Comment {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  content   String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([postId])
  @@map("comments")
}
```

#### 2. Posts Service

**apps/api/src/posts/posts.service.ts:**
```typescript
@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, content: string, imageUrl?: string) {
    return this.prisma.post.create({
      data: { userId, content, imageUrl },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: { select: { username: true, avatar: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async getTimeline(userId: string, page: number = 1) {
    // جلب المنشورات من المستخدمين المُتابَعين
    const followingIds = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const userIds = [userId, ...followingIds.map(f => f.followingId)];

    return this.prisma.post.findMany({
      where: { userId: { in: userIds }, isPublic: true },
      include: {
        user: {
          select: {
            name: true,
            profile: { select: { username: true, avatar: true } },
          },
        },
        likes: { where: { userId }, select: { id: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
  }

  async likePost(userId: string, postId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: { userId, postId },
      });
      return { liked: true };
    }
  }
}
```

**API Endpoints:**
```typescript
POST   /posts              // إنشاء منشور جديد
GET    /posts/timeline     // جلب timeline المستخدم
GET    /posts/user/:userId // جلب منشورات مستخدم معين
POST   /posts/:id/like     // إعجاب/إلغاء إعجاب
POST   /posts/:id/comment  // إضافة تعليق
GET    /posts/:id/comments // جلب تعليقات المنشور
```

---

### المرحلة 2.6: Backend - نظام QR Code والمشاركة

#### 1. QR Code Service

**تثبيت مكتبة QR Code:**
```bash
cd apps/api
npm install qrcode
npm install -D @types/qrcode
```

**apps/api/src/qr-code/qr-code.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateProfileQR(username: string): Promise<string> {
    const profileUrl = `${process.env.FRONTEND_URL}/${username}`;
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(profileUrl, {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 300,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async generateSocialLinkQR(shortUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(shortUrl, {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1a365d', // لون أزرق داكن
          light: '#FFFFFF',
        },
        width: 200,
      });
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async generateCustomQR(data: string, options?: {
    size?: number;
    backgroundColor?: string;
    foregroundColor?: string;
  }): Promise<string> {
    return await QRCode.toDataURL(data, {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: options?.foregroundColor || '#000000',
        light: options?.backgroundColor || '#FFFFFF',
      },
      width: options?.size || 300,
    });
  }
}
```

#### 2. Share Controller

**apps/api/src/share/share.controller.ts:**
```typescript
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(
    private qrCodeService: QrCodeService,
    private profilesService: ProfilesService,
  ) {}

  @Get('profile/:username/qr')
  @ApiOperation({ summary: 'Generate QR code for profile' })
  async generateProfileQR(@Param('username') username: string) {
    const profile = await this.profilesService.findByUsername(username);
    const qrCode = await this.qrCodeService.generateProfileQR(username);
    
    return {
      qrCode,
      profileUrl: `${process.env.FRONTEND_URL}/${username}`,
      username: profile.username,
      name: profile.user.name,
    };
  }

  @Get('profile/:username/share-links')
  @ApiOperation({ summary: 'Get share links for profile' })
  async getShareLinks(@Param('username') username: string) {
    const profile = await this.profilesService.findByUsername(username);
    const profileUrl = `${process.env.FRONTEND_URL}/${username}`;
    const shareText = `Check out ${profile.user.name}'s profile on Rukny.io`;
    
    return {
      profileUrl,
      shareLinks: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
        email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(profileUrl)}`,
      },
    };
  }

  @Get('social-link/:linkId/qr')
  @ApiOperation({ summary: 'Generate QR code for social link' })
  async generateSocialLinkQR(@Param('linkId') linkId: string) {
    const socialLink = await this.prisma.socialLink.findUnique({
      where: { id: linkId },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    const qrCode = await this.qrCodeService.generateSocialLinkQR(socialLink.shortUrl);
    
    return {
      qrCode,
      shortUrl: socialLink.shortUrl,
      platform: socialLink.platform,
    };
  }
}
```

---

### المرحلة 2.7: Frontend - المكونات المتقدمة

#### 1. مكون Follow Button

**apps/web/src/components/profile/follow-button.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/lib/api/follow';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, isFollowing, onFollowChange }: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(userId);
        setFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={following ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {following ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
}
```

#### 2. مكون QR Code Share

**apps/web/src/components/profile/qr-share.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Share, Download, Copy } from 'lucide-react';
import { generateProfileQR, getShareLinks } from '@/lib/api/share';

interface QRShareProps {
  username: string;
  name: string;
}

export function QRShare({ username, name }: QRShareProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [shareLinks, setShareLinks] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const [qrResponse, shareResponse] = await Promise.all([
        generateProfileQR(username),
        getShareLinks(username),
      ]);
      
      setQrCode(qrResponse.qrCode);
      setShareLinks(shareResponse.shareLinks);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `${username}-qr-code.png`;
    link.href = qrCode;
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/${username}`);
      // إظهار toast notification
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleGenerateQR}>
          <QrCode className="w-4 h-4 mr-2" />
          Share Profile
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {name}'s Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : qrCode ? (
            <div className="text-center space-y-4">
              <img src={qrCode} alt="QR Code" className="mx-auto rounded-lg shadow-md" />
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={downloadQR}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          ) : null}

          {/* Share Links */}
          {shareLinks && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Share on Social Media</h3>
              <div className="grid grid-cols-2 gap-2">
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    Facebook
                  </Button>
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    Twitter
                  </Button>
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    LinkedIn
                  </Button>
                </a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 3. مكون Posts Timeline

**apps/web/src/components/posts/timeline.tsx:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { getTimeline, likePost } from '@/lib/api/posts';

export function Timeline() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await getTimeline();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: result.liked,
              _count: {
                ...post._count,
                likes: post._count.likes + (result.liked ? 1 : -1)
              }
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <img
                src={post.user.profile.avatar || '/default-avatar.png'}
                alt={post.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium">{post.user.name}</h3>
                <p className="text-sm text-gray-500">@{post.user.profile.username}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {post.content && (
              <p className="text-gray-800">{post.content}</p>
            )}
            
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post image"
                className="rounded-lg max-w-full h-auto"
              />
            )}
            
            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                {post._count.likes}
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {post._count.comments}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🎯 **الميزات الجديدة - ملخص شامل**

### **1. نظام المتابعة المتقدم**
```typescript
✅ متابعة/إلغاء متابعة المستخدمين
✅ قائمة المتابِعين والمتابَعين  
✅ إحصائيات المتابعة
✅ اقتراحات المتابعة الذكية
✅ إشعارات المتابعة
```

### **2. نظام المنشورات التفاعلي**
```typescript
✅ إنشاء منشورات نصية وصور
✅ Timeline للمتابعين
✅ نظام الإعجاب والتعليقات
✅ مشاركة المنشورات
✅ فلترة المحتوى (عام/خاص)
```

### **3. نظام QR Code والمشاركة**
```typescript
✅ QR Code للملف الشخصي
✅ QR Code للروابط الاجتماعية
✅ مشاركة عبر جميع المنصات
✅ تخصيص QR Code (الألوان والحجم)
✅ تحميل QR Code كصورة
```

### **4. API Endpoints الجديدة (21 endpoint)**
```bash
# Follow System
POST   /follow/:userId
DELETE /follow/:userId  
GET    /follow/:userId/stats
GET    /follow/suggestions

# Posts System  
POST   /posts
GET    /posts/timeline
GET    /posts/user/:userId
POST   /posts/:id/like
POST   /posts/:id/comment
GET    /posts/:id/comments

# Share & QR System
GET    /share/profile/:username/qr
GET    /share/profile/:username/share-links  
GET    /share/social-link/:linkId/qr
POST   /share/custom-qr
POST   /share/track-share
```

---

## 💡 **تحسينات إضافية مقترحة**

### **1. Analytics متقدم**
```typescript
- إحصائيات المشاهدات للملف الشخصي
- تتبع النقرات على الروابط
- تحليل التفاعل مع المنشورات
- تقارير أسبوعية/شهرية
```

### **2. ميزات اجتماعية إضافية**
```typescript
- نظام الرسائل الخاصة
- المجموعات والصفحات
- الأحداث والفعاليات المباشرة
- نظام التقييم والمراجعات
```

### **3. تخصيص متقدم**
```typescript
- ثيمات مخصصة للملف الشخصي
- خطوط وألوان قابلة للتخصيص  
- لغات متعددة (RTL/LTR)
- وضع الظلام/النهار
```

**المرحلة الثانية الآن تتضمن نظام اجتماعي متكامل مع QR Code ومشاركة متقدمة! 🚀**

---

## ✅ المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق المحدثة
- [ ] Profile CRUD APIs جاهزة
- [ ] Social Links management APIs جاهزة
- [ ] URL shortener يعمل
- [ ] **Follow System APIs جاهزة** ⭐
- [ ] **Posts System APIs جاهزة** ⭐
- [ ] **QR Code & Share APIs جاهزة** ⭐
- [ ] صفحة إنشاء الملف الشخصي
- [ ] صفحة الملف الشخصي العامة
- [ ] **Timeline والمنشورات** ⭐
- [ ] **مكون Follow Button** ⭐
- [ ] **مكون QR Share** ⭐
- [ ] رفع الصور (Avatar & Cover)
- [ ] إحصائيات الروابط المختصرة
```
1. زيارة /dashboard/profile/create
2. إنشاء ملف شخصي جديد
3. إضافة روابط اجتماعية
4. زيارة /[username] للمعاينة
5. تعديل الملف الشخصي
6. اختبار رفع الصور
```

---

## 🚀 **ملخص الميزات المتقدمة الجديدة**

### **إجمالي APIs الجديدة: 21 Endpoint**
```typescript
// Follow System (7 endpoints)
POST   /follow/:userId              // متابعة مستخدم
DELETE /follow/:userId              // إلغاء المتابعة  
GET    /follow/:userId/followers    // قائمة المتابعين
GET    /follow/:userId/following    // قائمة المتابَعين
GET    /follow/:userId/stats        // إحصائيات المتابعة
GET    /follow/:userId/is-following // التحقق من المتابعة
GET    /follow/suggestions          // اقتراحات المتابعة

// Posts System (8 endpoints)  
POST   /posts                      // إنشاء منشور
GET    /posts/timeline             // Timeline الشخصي
GET    /posts/user/:userId         // منشورات مستخدم معين
GET    /posts                      // جميع المنشورات العامة
POST   /posts/:id/like             // إعجاب/إلغاء إعجاب
POST   /posts/:id/comment          // إضافة تعليق
GET    /posts/:id/comments         // جلب تعليقات منشور
DELETE /posts/:id                  // حذف منشور

// Share & QR System (6 endpoints)
GET    /share/profile/:username/qr         // QR للملف الشخصي
GET    /share/profile/:username/share-links // روابط المشاركة
GET    /share/social-link/:linkId/qr       // QR للرابط الاجتماعي  
POST   /share/custom-qr                    // QR مخصص
POST   /share/track-share                  // تتبع المشاركة
GET    /share/stats/:profileId             // إحصائيات المشاركة
```

### **Frontend Components الجديدة: 12 مكون**
```typescript
// Follow System
- FollowButton           // زر المتابعة التفاعلي
- FollowersList         // قائمة المتابعين  
- FollowingList         // قائمة المتابَعين
- SuggestedUsers        // اقتراحات المتابعة

// Posts System  
- Timeline              // عرض المنشورات
- PostCard              // بطاقة المنشور
- CreatePost            // إنشاء منشور جديد
- CommentSection        // نظام التعليقات

// Share & QR System
- QRShare               // مكون المشاركة المتقدم
- ShareModal            // نافذة المشاركة
- QRCodeGenerator       // مولد QR Code
- SocialShareButtons    // أزرار المشاركة الاجتماعية
```

### **Database Models الجديدة: 6 جداول**
```sql
-- Follow System
follows               -- علاقات المتابعة
follow_notifications  -- إشعارات المتابعة

-- Posts System  
posts                 -- المنشورات
likes                 -- الإعجابات
comments              -- التعليقات

-- Share System
share_stats           -- إحصائيات المشاركة
```

### **الميزات التقنية المتقدمة**
```typescript
✅ Real-time notifications للمتابعة والإعجابات
✅ Infinite scrolling للTimeline  
✅ Image upload للمنشورات
✅ QR Code customization (ألوان، حجم، شكل)
✅ Social sharing integration
✅ Analytics والإحصائيات المتقدمة
✅ SEO optimization للملفات الشخصية
✅ Mobile-first responsive design
✅ Dark/Light theme support
✅ RTL language support
✅ Performance optimization
✅ Security والحماية المتقدمة
```

### **تجربة المستخدم المحسنة**
```typescript
🎯 Social Media Experience:
- Timeline مثل Facebook/Twitter
- Follow system مثل Instagram  
- QR sharing مثل LinkedIn
- Stories-like posts
- Real-time interactions

🎯 Professional Features:
- Business profile optimization
- Analytics dashboard
- Custom branding
- Lead generation tools
- Contact management

🎯 Mobile Experience:
- PWA capabilities
- Offline support  
- Push notifications
- Camera integration for QR
- Touch-friendly interface
```

---

## 🎉 **المرحلة الثانية: من ملف شخصي بسيط إلى منصة اجتماعية متكاملة**

### **قبل التحديث:**
- ملف شخصي أساسي
- روابط اجتماعية بسيطة  
- مختصر روابط عادي

### **بعد التحديث:**
- **منصة اجتماعية متكاملة** 🚀
- **نظام متابعة متقدم** 👥
- **منشورات تفاعلية** 📝  
- **QR Code والمشاركة الذكية** 📱
- **Analytics متقدم** 📊
- **تجربة مستخدم احترافية** ✨

**الآن Rukny.io منافس قوي لـ Linktree + Instagram + LinkedIn! 🎯**

---

## الخطوة التالية | Next Steps

بعد إتمام المرحلة الثانية بنجاح، انتقل إلى:
📄 **المرحلة الثالثة:** `PHASE_03_STORE_MANAGEMENT.md`

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**الحالة:** 🔵 جاهز للتنفيذ بعد المرحلة 1
