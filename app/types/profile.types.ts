import { Profile } from "@prisma/client";

export type ProfileResponseBody = Omit<Profile, "userId">;
