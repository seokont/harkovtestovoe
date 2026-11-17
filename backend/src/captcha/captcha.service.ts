import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface CaptchaRecord {
  answer: string;
  expiresAt: number;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class CaptchaService {
  private readonly store = new Map<string, CaptchaRecord>();
  private readonly ttlMs = 5 * 60 * 1000;

  create(): { captchaId: string; svg: string } {
    let answer = '';
    for (let i = 0; i < 5; i++) {
      answer += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    const svg = this.renderSvg(answer);
    const id = randomUUID();
    this.store.set(id, { answer: answer.toLowerCase(), expiresAt: Date.now() + this.ttlMs });
    this.cleanup();
    return { captchaId: id, svg };
  }

  verify(id: string, answer: string): boolean {
    const rec = this.store.get(id);
    if (!rec) return false;
    this.store.delete(id); // single-use
    if (Date.now() > rec.expiresAt) return false;
    return rec.answer === (answer ?? '').trim().toLowerCase();
  }

  private renderSvg(text: string): string {
    const width = 150;
    const height = 50;
    let glyphs = '';
    for (let i = 0; i < text.length; i++) {
      const x = 18 + i * 26;
      const y = 30 + Math.floor(Math.random() * 10) - 5;
      const rot = Math.floor(Math.random() * 40) - 20;
      const color = `hsl(${Math.floor(Math.random() * 360)}, 60%, 35%)`;
      glyphs += `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" font-family="Verdana, Arial, sans-serif" font-size="30" font-weight="bold" fill="${color}">${text[i]}</text>`;
    }
    let noise = '';
    for (let i = 0; i < 6; i++) {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      noise += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="hsl(${Math.floor(Math.random() * 360)}, 50%, 70%)" stroke-width="1" />`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f0f2f7" />${noise}${glyphs}</svg>`;
  }

  private cleanup() {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (v.expiresAt < now) this.store.delete(k);
    }
  }
}
