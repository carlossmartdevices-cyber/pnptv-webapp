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

export type Resource = {
  ownerId?: string;
  requesterId?: string;
  visibility?: 'PUBLIC' | 'PRIME';
};

const roleHierarchy: Record<Role, number> = {
  FREE: 0,
  PRIME: 1,
  ADMIN: 2,
};

const isPrimeOrAbove = (role: Role) => roleHierarchy[role] >= roleHierarchy.PRIME;
const isAdmin = (role: Role) => roleHierarchy[role] >= roleHierarchy.ADMIN;

const isOwner = (resource?: Resource) =>
  Boolean(resource?.ownerId && resource?.requesterId && resource.ownerId === resource.requesterId);

export const can = (role: Role, action: Action, resource?: Resource) => {
  switch (action) {
    case 'hangouts.listPublic':
    case 'hangouts.joinPublic':
      return true;
    case 'hangouts.joinPrivate':
      return true;
    case 'hangouts.create':
      return isPrimeOrAbove(role);
    case 'videorama.playPublic':
      return true;
    case 'videorama.playPrime':
      return isPrimeOrAbove(role);
    case 'videorama.create':
      return isPrimeOrAbove(role);
    case 'videorama.editAny':
    case 'videorama.deleteAny':
      return isAdmin(role);
    case 'videorama.editOwn':
    case 'videorama.deleteOwn':
      return isPrimeOrAbove(role) && isOwner(resource);
    default:
      return false;
  }
};

export const canAccessVideorama = (role: Role, visibility: 'PUBLIC' | 'PRIME') => {
  if (visibility === 'PUBLIC') return true;
  return isPrimeOrAbove(role);
};
