import { ProfileResponseBody } from "~/types/profile.types";

import { convertFileToBase64String } from "~/utils/file.utils.server";
import { prisma } from "~/utils/prisma.utils.server";

const PROFILE_FOR_RESPONSE = {
  id: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  updatedAt: true,
};

const findByUserId = async (
  userId: string,
): Promise<ProfileResponseBody | null> => {
  return await prisma.profile.findUnique({
    where: {
      userId,
    },
    select: PROFILE_FOR_RESPONSE,
  });
};

const update = async (
  userId: string,
  firstName: string | null,
  lastName: string | null,
) => {
  return await prisma.profile.update({
    where: {
      userId,
    },
    data: {
      firstName,
      lastName,
    },
    select: PROFILE_FOR_RESPONSE,
  });
};

const createAvatarByUserId = async (userId: string, file: File) => {
  await prisma.file.deleteMany({
    where: {
      profile: {
        userId,
      },
    },
  });

  const avatar = await prisma.file.create({
    data: {
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
      profile: {
        connectOrCreate: {
          where: {
            userId,
          },
          create: {
            userId,
          },
        },
      },
    },
  });

  return convertFileToBase64String(avatar);
};

const findAvatarByUserId = async (userId: string) => {
  const avatar = await prisma.file.findFirst({
    where: {
      profile: {
        userId,
      },
    },
  });

  return convertFileToBase64String(avatar);
};

const deleteAvatarByUserId = async (userId: string) => {
  await prisma.file.deleteMany({
    where: {
      profile: {
        userId,
      },
    },
  });
};

const profileService = {
  findByUserId,
  update,
  createAvatarByUserId,
  findAvatarByUserId,
  deleteAvatarByUserId,
};

export default profileService;
