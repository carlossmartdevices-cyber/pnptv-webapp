import { describe, expect, it } from 'vitest';
import { can } from '@shared/rbac';

describe('rbac can()', () => {
  it('permite FREE ver y unirse a hangouts públicos', () => {
    expect(can('FREE', 'hangouts.listPublic')).toBe(true);
    expect(can('FREE', 'hangouts.joinPublic')).toBe(true);
  });

  it('bloquea FREE para crear hangouts', () => {
    expect(can('FREE', 'hangouts.create')).toBe(false);
  });

  it('permite PRIME editar propios contenidos', () => {
    expect(can('PRIME', 'videorama.editOwn', { ownerId: '1', actorId: '1' })).toBe(true);
  });

  it('ADMIN puede hacer cualquier acción', () => {
    expect(can('ADMIN', 'videorama.deleteAny')).toBe(true);
  });
});
