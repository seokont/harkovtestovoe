import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';
import type { Express } from 'express';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.gif', '.png']);
const MAX_TEXT_BYTES = 100 * 1024;

@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = extname(file.originalname).toLowerCase();
    if (!IMAGE_EXT.has(ext)) {
      throw new BadRequestException('Only JPG, GIF and PNG images are allowed');
    }

    const outExt = ext === '.jpeg' ? '.jpg' : ext;
    const name = `${randomUUID()}${outExt}`;
    const dir = join(process.cwd(), 'uploads', 'images');
    await mkdir(dir, { recursive: true });

    // Proportional shrink to fit within 320x240, never enlarge smaller images.
    let pipeline = sharp(file.buffer).resize({
      width: 320,
      height: 240,
      fit: 'inside',
      withoutEnlargement: true,
    });
    if (outExt === '.gif') pipeline = pipeline.gif();
    else if (outExt === '.png') pipeline = pipeline.png();
    else pipeline = pipeline.jpeg({ quality: 85 });

    await pipeline.toFile(join(dir, name));

    return { url: `/uploads/images/${name}` };
  }

  @Post('text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_TEXT_BYTES },
    }),
  )
  async uploadText(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = extname(file.originalname).toLowerCase();
    if (ext !== '.txt') throw new BadRequestException('Only TXT files are allowed');

    if (file.size > MAX_TEXT_BYTES) {
      throw new BadRequestException('Text file must not exceed 100 KB');
    }

    const name = `${randomUUID()}.txt`;
    const dir = join(process.cwd(), 'uploads', 'files');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), file.buffer);

    return { url: `/uploads/files/${name}` };
  }
}
