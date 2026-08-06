import { Genre } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { slugify } from "../../utils/slugify";
import { CreateGenreInput } from "./genre.validation";

const ensureUniqueSlug = async (
  baseSlug: string,
  excludeId?: string,
): Promise<string> => {
  let candidate = baseSlug;
  let attempt = 1;

  while (
    await prisma.genre.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
  ) {
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }

  return candidate;
};

export const genreService = {
  async create(input: CreateGenreInput): Promise<Genre> {
    const existingName = await prisma.genre.findUnique({
      where: { name: input.name },
    });
    if (existingName) {
      throw ApiError.conflict("A genre with this name already exists");
    }

    const baseSlug = slugify(input.slug ?? input.name);
    if (!baseSlug) {
      throw ApiError.badRequest("Could not derive a valid slug from the name");
    }
    const slug = await ensureUniqueSlug(baseSlug);

    return prisma.genre.create({ data: { name: input.name, slug } });
  },

  async list(): Promise<Genre[]> {
    return prisma.genre.findMany({ orderBy: { name: "asc" } });
  },
};
