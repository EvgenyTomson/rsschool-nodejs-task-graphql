import { Post, PrismaClient, Profile } from '@prisma/client';
import DataLoader from 'dataloader';
import { ResolverArgs } from '../../types/util.js';

export const userResolver = async (args: ResolverArgs, prisma: PrismaClient) => {
  const user = await prisma.user.findUnique({ where: { id: args.id } });

  if (!user) {
    return null;
  }

  const userSuscriptions = await prisma.subscribersOnAuthors.findMany({
    where: { subscriberId: user.id },
  });

  const userFollowList = await prisma.user.findMany({
    where: {
      id: {
        in: userSuscriptions.map((subscription) => subscription.authorId),
      },
    },
  });

  const usersFollowingByUser = await Promise.all(
    userFollowList.map(async (author) => {
      const authorSubsData = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: author.id },
      });

      const subscribersOfThisAuthor = await prisma.user.findMany({
        where: {
          id: {
            in: authorSubsData.map((subscription) => subscription.subscriberId),
          },
        },
      });

      return { ...author, subscribedToUser: subscribersOfThisAuthor };
    }),
  );

  const subscriptionsOnUser = await prisma.subscribersOnAuthors.findMany({
    where: { authorId: user.id },
  });

  const usersSubscribedOnUser = await prisma.user.findMany({
    where: {
      id: {
        in: subscriptionsOnUser.map((subscription) => subscription.subscriberId),
      },
    },
  });

  const userFollowers = await Promise.all(
    usersSubscribedOnUser.map(async (subscriber) => {
      const subscriberAuthorsData = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: subscriber.id },
      });

      const authorsForThisSubscriber = await prisma.user.findMany({
        where: {
          id: {
            in: subscriberAuthorsData.map((subscription) => subscription.authorId),
          },
        },
      });

      return { ...subscriber, userSubscribedTo: authorsForThisSubscriber };
    }),
  );

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const posts = await prisma.post.findMany({ where: { authorId: user.id } });

  return {
    ...user,
    profile: profile ? { ...profile, memberType: { id: profile.memberTypeId } } : null,
    posts,
    userSubscribedTo: usersFollowingByUser,
    subscribedToUser: userFollowers,
  };
};

export const usersResolver = async (
  prisma: PrismaClient,
  profileLoader: DataLoader<string, Profile, string>,
  postsLoader: DataLoader<string, Post[], string>,
  fields: Record<string, unknown>,
) => {
  const fieldsKeys = Object.keys(fields);

  const users = await prisma.user.findMany({
    include: Object.fromEntries(
      Object.keys(fields)
        .filter((field) => !['id', 'name', 'balance'].includes(field))
        .map((field) => [field, true]),
    ),
  });

  if (fieldsKeys.includes('posts') && fieldsKeys.includes('profile')) {
    const profiles = await Promise.all(users.map((user) => profileLoader.load(user.id)));

    await Promise.all(users.map((user) => postsLoader.load(user.id)));
    await prisma.memberType.findMany();

    return users.map((user, index) => ({
      ...user,
      profile: profiles[index],
    }));
  } else {
    return users;
  }
};
