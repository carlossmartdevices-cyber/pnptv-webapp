const roleHierarchy = {
    FREE: 0,
    PRIME: 1,
    ADMIN: 2,
};
const isPrimeOrAbove = (role) => roleHierarchy[role] >= roleHierarchy.PRIME;
const isAdmin = (role) => roleHierarchy[role] >= roleHierarchy.ADMIN;
const isOwner = (resource) => Boolean(resource?.ownerId && resource?.requesterId && resource.ownerId === resource.requesterId);
export const can = (role, action, resource) => {
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
export const canAccessVideorama = (role, visibility) => {
    if (visibility === 'PUBLIC')
        return true;
    return isPrimeOrAbove(role);
};
