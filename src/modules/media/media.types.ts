import { Media, Genre } from "../../../generated/prisma/client";

export type MediaWithGenres = Media & {
  mediaGenres: { genre: Genre }[];
};

export interface MediaResponse extends Omit<Media, never> {
  genres: Genre[];
}
