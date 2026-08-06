import { Prisma } from "../../../generated/prisma/client";

const reviewAuthorSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;

const reviewMediaSelect = {
  id: true,
  title: true,
  slug: true,
} satisfies Prisma.MediaSelect;

export const reviewWithAuthorInclude = {
  user: { select: reviewAuthorSelect },
} satisfies Prisma.ReviewInclude;

export const reviewWithAuthorAndMediaInclude = {
  user: { select: reviewAuthorSelect },
  media: { select: reviewMediaSelect },
} satisfies Prisma.ReviewInclude;

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: typeof reviewWithAuthorInclude;
}>;
export type ReviewWithAuthorAndMedia = Prisma.ReviewGetPayload<{
  include: typeof reviewWithAuthorAndMediaInclude;
}>;
