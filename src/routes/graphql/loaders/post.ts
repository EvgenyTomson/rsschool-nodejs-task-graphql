import { Post, PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export const postsLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Post[]>(async (userIds) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: [...userIds] },
      },
    });

    const usersPosts = new Map<string, Post[]>();
    posts.forEach((post) => {
      usersPosts.has(post.authorId)
        ? usersPosts.get(post.authorId)?.push(post)
        : usersPosts.set(post.authorId, [post]);
    });

    return userIds.map((userId) => usersPosts.get(userId) || []);
  });
