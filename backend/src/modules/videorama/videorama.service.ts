import { prisma } from '../../db/client';
import type { CollectionVisibility, CollectionType } from '@prisma/client';

export const listCollections = async (visibility: CollectionVisibility[]) => {
  return prisma.collection.findMany({
    where: { visibility: { in: visibility } },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const createCollection = async ({
  title,
  description,
  type,
  visibility,
  ownerId
}: {
  title: string;
  description: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  ownerId: string;
}) => {
  return prisma.collection.create({
    data: {
      title,
      description,
      type,
      visibility,
      ownerId
    }
  });
};

export const updateCollection = async ({
  id,
  data
}: {
  id: string;
  data: { title: string; description: string };
}) => {
  return prisma.collection.update({
    where: { id },
    data
  });
};

export const deleteCollection = async (id: string) => {
  return prisma.collection.delete({ where: { id } });
};
