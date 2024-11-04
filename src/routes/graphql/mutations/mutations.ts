import { PrismaClient } from '@prisma/client';
import { GraphQLBoolean, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { UserType, ChangeUserInputType, CreateUserInputType } from '../types/user.js';
import { PostType, ChangePostInputType, CreatePostInputType } from '../types/post.js';
import {
  ProfileType,
  ChangeProfileInputType,
  CreateProfileInput,
} from '../types/profile.js';

export const mutations = (prisma: PrismaClient) => {
  return new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: UserType,
        args: {
          dto: { type: CreateUserInputType },
        },
        resolve: (_, args) => {
          return prisma.user.create({
            data: args.dto,
          });
        },
      },

      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedUser = await prisma.user.delete({ where: { id: args.id } });
          return Boolean(deletedUser);
        },
      },

      changeUser: {
        type: UserType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangeUserInputType },
        },
        resolve: (_, args) => {
          return prisma.user.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },

      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: CreateProfileInput },
        },
        resolve: (_, args) => {
          return prisma.profile.create({
            data: args.dto,
          });
        },
      },

      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedProfile = await prisma.profile.delete({ where: { id: args.id } });
          return Boolean(deletedProfile);
        },
      },

      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangeProfileInputType },
        },
        resolve: (_, args) => {
          return prisma.profile.update({
            where: { id: args.id },
            data: args.dto,
          });
        },
      },

      createPost: {
        type: PostType,
        args: {
          dto: { type: CreatePostInputType },
        },
        resolve: (_, args) => {
          return prisma.post.create({
            data: args.dto,
          });
        },
      },

      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const deletedPost = await prisma.post.delete({ where: { id: args.id } });
          return Boolean(deletedPost);
        },
      },

      changePost: {
        type: PostType,
        args: {
          id: { type: UUIDType },
          dto: { type: ChangePostInputType },
        },
        resolve: async (_, args) => {
          const updatedPost = await prisma.post.update({
            where: { id: args.id },
            data: args.dto,
          });
          return updatedPost;
        },
      },

      subscribeTo: {
        type: GraphQLBoolean,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const authorExists = await prisma.user.findUnique({
            where: { id: args.authorId },
          });

          if (!authorExists) return false;

          const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });

          if (existingSubscription) return true;

          const updatedUser = await prisma.user.update({
            where: {
              id: args.userId,
            },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
          return Boolean(updatedUser);
        },
      },

      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: UUIDType },
          authorId: { type: UUIDType },
        },
        resolve: async (_, args) => {
          const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });

          if (!existingSubscription) return true;

          const canceledSubscription = await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });
          return Boolean(canceledSubscription);
        },
      },
    },
  });
};
