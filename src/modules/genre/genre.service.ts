import { Genre } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { slugify } from "../../utils/slugify";
import { CreateGenreInput, UpdateGenreInput } from "./genre.validation";

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

  async getById(id: string): Promise<Genre> {
    const genre = await prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw ApiError.notFound("Genre not found");
    }
    return genre;
  },

  async update(id: string, input: UpdateGenreInput): Promise<Genre> {
    const existing = await prisma.genre.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Genre not found");
    }

    if (input.name && input.name !== existing.name) {
      const nameTaken = await prisma.genre.findFirst({
        where: { name: input.name, id: { not: id } },
      });
      if (nameTaken) {
        throw ApiError.conflict("A genre with this name already exists");
      }
    }

    let slug: string | undefined;
    if (input.slug || input.name) {
      const baseSlug = slugify(input.slug ?? input.name ?? existing.name);
      if (!baseSlug) {
        throw ApiError.badRequest(
          "Could not derive a valid slug from the name",
        );
      }
      if (baseSlug !== existing.slug) {
        slug = await ensureUniqueSlug(baseSlug, id);
      }
    }

    return prisma.genre.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
      },
    });
  },

  async remove(id: string): Promise<void> {
    const existing = await prisma.genre.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Genre not found");
    }

    const mediaCount = await prisma.mediaGenre.count({
      where: { genreId: id },
    });
    if (mediaCount > 0) {
      throw ApiError.conflict(
        "This genre is still linked to media and cannot be deleted. Remove it from all media first.",
      );
    }

    await prisma.genre.delete({ where: { id } });
  },
};
