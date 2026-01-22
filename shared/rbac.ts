export type Role = 'FREE' | 'PRIME' | 'ADMIN';

export type Action =
  | 'hangouts.listPublic'
  | 'hangouts.joinPublic'
  | 'hangouts.joinPrivate'
  | 'hangouts.create'
  | 'videorama.playPublic'
  | 'videorama.playPrime'
  | 'videorama.create'
  | 'videorama.editOwn'
  | 'videorama.editAny'
  | 'videorama.deleteOwn'
  | 'videorama.deleteAny';

export type ResourceContext = {
  ownerId?: string | number | null;
  actorId?: string | number | null;
  visibility?: 'PUBLIC' | 'PRIME';
};

export const can = (role: Role, action: Action, resource?: ResourceContext) => {
  if (role === 'ADMIN') {
    return true;
  }

  switch (action) {
    case 'hangouts.listPublic':
    case 'hangouts.joinPublic':
    case 'hangouts.joinPrivate':
    case 'videorama.playPublic':
      return true;
    case 'hangouts.create':
    case 'videorama.create':
    case 'videorama.playPrime':
      return role === 'PRIME';
    case 'videorama.editOwn':
    case 'videorama.deleteOwn':
      if (role !== 'PRIME') {
        return false;
      }
      return Boolean(resource?.ownerId && resource?.actorId && resource.ownerId === resource.actorId);
    case 'videorama.editAny':
    case 'videorama.deleteAny':
      return false;
    default:
      return false;
  }
};
