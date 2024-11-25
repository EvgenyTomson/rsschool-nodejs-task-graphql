import { PrismaClient } from '@prisma/client';
import { ResolverArgs } from '../../types/util.js';

export const profilesResolver = (prisma: PrismaClient) => prisma.profile.findMany();

export const profileResolver = (args: ResolverArgs, prisma: PrismaClient) =>
  prisma.profile.findUnique({ where: { id: args.id } });
