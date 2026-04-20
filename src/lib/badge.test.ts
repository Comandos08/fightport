import { describe, it, expect } from 'vitest';
import { formatBadgeCount } from './badge';

describe('formatBadgeCount', () => {
  it('retorna null para 0', () => {
    expect(formatBadgeCount(0)).toBeNull();
  });

  it('retorna null para valores negativos', () => {
    expect(formatBadgeCount(-1)).toBeNull();
    expect(formatBadgeCount(-100)).toBeNull();
  });

  it('retorna null para null/undefined', () => {
    expect(formatBadgeCount(null)).toBeNull();
    expect(formatBadgeCount(undefined)).toBeNull();
  });

  it('retorna null para NaN/Infinity', () => {
    expect(formatBadgeCount(NaN)).toBeNull();
    expect(formatBadgeCount(Infinity)).toBeNull();
  });

  it('retorna string do número de 1 a 9', () => {
    for (let i = 1; i <= 9; i++) {
      expect(formatBadgeCount(i)).toBe(String(i));
    }
  });

  it('retorna "9+" para valores acima de 9', () => {
    expect(formatBadgeCount(10)).toBe('9+');
    expect(formatBadgeCount(12)).toBe('9+');
    expect(formatBadgeCount(99)).toBe('9+');
    expect(formatBadgeCount(1000)).toBe('9+');
  });

  it('arredonda valores fracionários para baixo', () => {
    expect(formatBadgeCount(2.7)).toBe('2');
    expect(formatBadgeCount(9.9)).toBe('9');
    expect(formatBadgeCount(10.1)).toBe('9+');
  });
});
