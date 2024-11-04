import { PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';

export const profileLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Profile>(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: [...userIds] },
      },
      include: { memberType: true },
    });

    return userIds.map((userId) =>
      profiles.find((profile) => profile.userId === userId),
    ) as Profile[];
  });
