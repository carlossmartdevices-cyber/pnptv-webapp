import { describe, expect, it } from 'vitest';
import { can } from '@shared/rbac';

describe('rbac can()', () => {
  it('permite crear hangouts solo a PRIME/ADMIN', () => {
    expect(can('FREE', 'hangouts.create')).toBe(false);
    expect(can('PRIME', 'hangouts.create')).toBe(true);
    expect(can('ADMIN', 'hangouts.create')).toBe(true);
  });

  it('permite editar own solo a PRIME/ADMIN si owner', () => {
    expect(
      can('PRIME', 'videorama.editOwn', { ownerId: '1', requesterId: '1' })
    ).toBe(true);
    expect(
      can('PRIME', 'videorama.editOwn', { ownerId: '1', requesterId: '2' })
    ).toBe(false);
    expect(
      can('FREE', 'videorama.editOwn', { ownerId: '1', requesterId: '1' })
    ).toBe(false);
  });
});
