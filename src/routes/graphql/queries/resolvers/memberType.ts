import { PrismaClient } from '@prisma/client';
import { ResolverArgs } from '../../types/util.js';

export const memberTypesResolver = (prisma: PrismaClient) => prisma.memberType.findMany();

export const memberTypeResolver = (args: ResolverArgs, prisma: PrismaClient) =>
  prisma.memberType.findUnique({
    where: { id: args.id },
  });
