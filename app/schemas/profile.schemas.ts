import { z } from "zod";

const update = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
});

const profileSchemas = {
  update,
};

export default profileSchemas;
