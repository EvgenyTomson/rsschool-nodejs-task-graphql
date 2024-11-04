import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  ExecutionResult,
  GraphQLSchema,
  Source,
  graphql,
  parse,
  validate,
} from 'graphql';
import { resourcesQuery } from './queries/mainQuery.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { profileLoader } from './loaders/profile.js';
import { postsLoader } from './loaders/post.js';
import DataLoader from 'dataloader';
import { Post, Profile } from '@prisma/client';
import depthLimit from 'graphql-depth-limit';
import { mutations } from './mutations/mutations.js';

const depth = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const ResourcesSchema = (
    profileLoader: DataLoader<string, Profile, string>,
    postsLoader: DataLoader<string, Post[], string>,
  ) =>
    new GraphQLSchema({
      query: resourcesQuery(prisma, profileLoader, postsLoader),
      mutation: mutations(prisma),
    });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    handler(req) {
      const { query, variables } = req.body;
      const resourcesSchema = ResourcesSchema(profileLoader(prisma), postsLoader(prisma));

      const validateErrors = validate(
        resourcesSchema,
        parse(new Source(req.body.query)),
        [depthLimit(depth)],
      );

      if (validateErrors.length) {
        return { errors: validateErrors } as ExecutionResult;
      }

      return graphql({
        schema: resourcesSchema,
        source: query,
        variableValues: variables,
      });
    },
  });
};

export default plugin;
