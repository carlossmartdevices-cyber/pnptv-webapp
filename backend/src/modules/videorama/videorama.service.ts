import { prisma } from '../../db/prisma';

export const listCollections = async (role: 'FREE' | 'PRIME' | 'ADMIN') => {
  const visibilityFilter = role === 'FREE' ? ['PUBLIC'] : ['PUBLIC', 'PRIME'];
  return prisma.collection.findMany({
    where: { visibility: { in: visibilityFilter } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCollection = async (id: string) => {
  return prisma.collection.findUnique({ where: { id }, include: { items: true } });
};

export const createCollection = async (ownerId: string, data: {
  type: 'PLAYLIST' | 'PODCAST';
  title: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIME';
  items: { title: string; url: string; duration?: number }[];
}) => {
  return prisma.collection.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      ownerId,
      items: {
        create: data.items.map((item) => ({
          title: item.title,
          url: item.url,
          duration: item.duration,
        })),
      },
    },
    include: { items: true },
  });
};

export const updateCollection = async (id: string, data: {
  title?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIME';
}) => {
  return prisma.collection.update({
    where: { id },
    data,
    include: { items: true },
  });
};

export const deleteCollection = async (id: string) => {
  return prisma.collection.delete({ where: { id } });
};
