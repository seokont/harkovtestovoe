import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Entry } from './entry.model.js';
import { User } from '../user/user.model.js';
import { UserService } from '../user/user.service.js';
import { CaptchaService } from '../captcha/captcha.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { UpdateEntryDto } from './dto/update-entry.dto.js';
import { QueryEntriesDto, SortBy, SortOrder } from './dto/query-entries.dto.js';
import { isBalancedXhtml, sanitizeCommentHtml } from '../common/html.js';

export interface CommentNode {
  id: string;
  text: string;
  imagePath: string | null;
  textFilePath: string | null;
  parentId: string | null;
  userId: string;
  userName: string;
  email: string;
  homePage: string;
  createdAt: string;
  children: CommentNode[];
}

export interface EntryListResult {
  items: CommentNode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type EntryWithUser = Entry & { user?: User };

@Injectable()
export class EntryService {
  constructor(
    @InjectModel(Entry) private readonly entryModel: typeof Entry,
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateEntryDto): Promise<{ entry: CommentNode; token: string }> {
    if (!this.captchaService.verify(dto.captchaId, dto.captchaAnswer)) {
      throw new BadRequestException('Invalid or expired CAPTCHA');
    }

    if (dto.parentId) {
      const parent = await this.entryModel.findByPk(dto.parentId);
      if (!parent) throw new BadRequestException('Parent comment does not exist');
    }

    if (!isBalancedXhtml(dto.text)) {
      throw new BadRequestException('Invalid HTML: tags must be properly closed (valid XHTML)');
    }

    const text = sanitizeCommentHtml(dto.text).trim();
    if (!text) throw new BadRequestException('Comment text is required');

    const user = await this.userService.findOrCreate({
      userName: dto.userName,
      email: dto.email,
      homePage: dto.homePage,
    });

    const entry = await this.entryModel.create({
      userId: user.id,
      parentId: dto.parentId ?? null,
      text,
      imagePath: dto.imagePath ?? null,
      textFilePath: dto.textFilePath ?? null,
    });

    const node = this.toNode(entry, user);
    const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });

    await this.invalidateCache();
    this.eventEmitter.emit('comment.created', { node });

    return { entry: node, token };
  }

  async findAll(query: QueryEntriesDto): Promise<EntryListResult> {
    const sortBy: SortBy = query.sortBy ?? 'createdAt';
    const order: SortOrder = query.order ?? 'DESC';
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    const cacheKey = `entries:${sortBy}:${order}`;
    const cached = await this.cacheManager.get<{ roots: CommentNode[] }>(cacheKey);

    let roots: CommentNode[];
    if (cached?.roots) {
      roots = cached.roots;
    } else {
      const entries = (await this.entryModel.findAll({
        include: [{ model: User }],
      })) as EntryWithUser[];

      const nodes = new Map<string, CommentNode>();
      const flat: CommentNode[] = entries.map((e) => {
        const node = this.toNode(e, e.user);
        nodes.set(e.id, node);
        return node;
      });

      roots = [];
      for (const node of flat) {
        if (node.parentId && nodes.has(node.parentId)) {
          nodes.get(node.parentId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }
      roots.sort(this.comparator(sortBy, order));
      await this.cacheManager.set(cacheKey, { roots }, 30_000);
    }

    const total = roots.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const items = roots.slice(offset, offset + limit);

    return { items, total, page, limit, totalPages };
  }

  async findOne(id: string): Promise<Entry | null> {
    return this.entryModel.findByPk(id);
  }

  async update(id: string, userId: string, dto: UpdateEntryDto): Promise<Entry> {
    const entry = await this.entryModel.findByPk(id);
    if (!entry) throw new NotFoundException('Comment not found');
    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (dto.text !== undefined) {
      if (!isBalancedXhtml(dto.text)) {
        throw new BadRequestException('Invalid HTML: tags must be properly closed');
      }
      entry.text = sanitizeCommentHtml(dto.text).trim();
    }
    await entry.save();
    await this.invalidateCache();
    return entry;
  }

  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    const entry = await this.entryModel.findByPk(id);
    if (!entry) throw new NotFoundException('Comment not found');
    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await entry.destroy();
    await this.invalidateCache();
    return { deleted: true };
  }

  private toNode(entry: Entry, user?: User): CommentNode {
    return {
      id: entry.id,
      text: entry.text,
      imagePath: entry.imagePath,
      textFilePath: entry.textFilePath,
      parentId: entry.parentId,
      userId: entry.userId,
      userName: user?.userName ?? 'Anonym',
      email: user?.email ?? '',
      homePage: user?.homePage ?? '',
      createdAt: entry.createdAt.toISOString(),
      children: [],
    };
  }

  private comparator(sortBy: SortBy, order: SortOrder) {
    const dir = order === 'ASC' ? 1 : -1;
    return (a: CommentNode, b: CommentNode) => {
      let av: string | number;
      let bv: string | number;
      if (sortBy === 'userName') {
        av = a.userName.toLowerCase();
        bv = b.userName.toLowerCase();
      } else if (sortBy === 'email') {
        av = a.email.toLowerCase();
        bv = b.email.toLowerCase();
      } else {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    };
  }

  private async invalidateCache() {
    try {
      await this.cacheManager.clear();
    } catch {
      // best-effort
    }
  }
}
