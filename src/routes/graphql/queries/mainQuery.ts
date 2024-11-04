import { Post, PrismaClient, Profile } from '@prisma/client';
import { GraphQLList, GraphQLObjectType } from 'graphql';
import { MemberTypeIdEnum, MemberTypeType } from '../types/memberType.js';
import { PostType } from '../types/post.js';
import { ProfileType } from '../types/profile.js';
import { UserType } from '../types/user.js';
import { UUIDType } from '../types/uuid.js';
import { memberTypeResolver } from './resolvers/memberType.js';
import { memberTypesResolver } from './resolvers/memberType.js';
import { postResolver } from './resolvers/post.js';
import { postsResolver } from './resolvers/post.js';
import { profileResolver } from './resolvers/profile.js';
import { profilesResolver } from './resolvers/profile.js';
import { userResolver } from './resolvers/user.js';
import { usersResolver } from './resolvers/user.js';
import DataLoader from 'dataloader';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { ResolverArgs } from '../types/util.js';

export const resourcesQuery = (
  prisma: PrismaClient,
  profileLoader: DataLoader<string, Profile, string>,
  postsLoader: DataLoader<string, Post[], string>,
) => {
  return new GraphQLObjectType({
    name: 'Query',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        resolve: () => memberTypesResolver(prisma),
      },

      memberType: {
        type: MemberTypeType,
        args: {
          id: { type: MemberTypeIdEnum },
        },
        resolve: (_, args: ResolverArgs) => memberTypeResolver(args, prisma),
      },

      users: {
        type: new GraphQLList(UserType),
        resolve: (_data, _args, _context, resolveInfo) => {
          const parsedResolveInfoFragment = parseResolveInfo(resolveInfo) as ResolveTree;
          const { fields } = simplifyParsedResolveInfoFragmentWithType(
            parsedResolveInfoFragment,
            UserType,
          );
          return usersResolver(prisma, profileLoader, postsLoader, fields);
        },
      },

      user: {
        type: UserType,
        args: {
          id: { type: UUIDType },
        },
        resolve: (_, args: ResolverArgs) => userResolver(args, prisma),
      },

      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: () => profilesResolver(prisma),
      },

      profile: {
        type: ProfileType,
        args: {
          id: { type: UUIDType },
        },
        resolve: (_, args: ResolverArgs) => profileResolver(args, prisma),
      },

      posts: {
        type: new GraphQLList(PostType),
        resolve: () => postsResolver(prisma),
      },

      post: {
        type: PostType,
        args: {
          id: { type: UUIDType },
        },
        resolve: (_, args: ResolverArgs) => postResolver(args, prisma),
      },
    },
  });
};
