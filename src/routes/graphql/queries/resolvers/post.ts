import { PrismaClient } from '@prisma/client';
import { ResolverArgs } from '../../types/util.js';

export const postsResolver = (prisma: PrismaClient) => prisma.post.findMany();

export const postResolver = (args: ResolverArgs, prisma: PrismaClient) =>
  prisma.post.findUnique({ where: { id: args.id } });
