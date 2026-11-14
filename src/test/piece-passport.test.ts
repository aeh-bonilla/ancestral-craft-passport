import { describe, expect, it } from 'vitest';
import { piecePassportUrl } from '@/lib/piece-passport';
import { pieces } from '@/lib/toltek';

describe('piece passport QR destination', () => {
  it('resolves every craft to its own public record', () => {
    for (const piece of pieces) {
      const url = new URL(piecePassportUrl(piece));
      expect(url.origin).toBe('https://ancestral-craft-passport.lovable.app');
      expect(url.pathname).toBe('/verificar');
      expect(url.searchParams.get('id')).toBe(piece.id);
    }
    expect(new Set(pieces.map(piecePassportUrl)).size).toBe(pieces.length);
  });
});