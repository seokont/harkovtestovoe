import { CaptchaService } from './captcha.service.js';

describe('CaptchaService', () => {
  it('creates an SVG captcha', () => {
    const svc = new CaptchaService();
    const { captchaId, svg } = svc.create();
    expect(captchaId).toBeTruthy();
    expect(svg).toContain('<svg');
  });

  it('rejects a wrong answer and an unknown id', () => {
    const svc = new CaptchaService();
    const { captchaId } = svc.create();
    expect(svc.verify(captchaId, '00000')).toBe(false);
    expect(svc.verify('missing-id', 'abcde')).toBe(false);
  });
});
