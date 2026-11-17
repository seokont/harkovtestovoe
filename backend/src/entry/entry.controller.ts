import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EntryService } from './entry.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { QueryEntriesDto } from './dto/query-entries.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard.js';

@Controller('entries')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @Post()
  create(@Body() dto: CreateEntryDto) {
    return this.entryService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryEntriesDto) {
    return this.entryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.entryService.update(id, req.user!.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.entryService.remove(id, req.user!.userId);
  }
}
