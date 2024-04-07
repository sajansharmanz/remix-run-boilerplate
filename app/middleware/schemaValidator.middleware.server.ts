/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

import { ValidationError } from "~/errors";

const schemaValidator = (
  schema: z.ZodObject<any, any> | z.ZodEffects<z.ZodString, any, any>,
  data: unknown,
) => {
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.flatten().fieldErrors;

    throw new ValidationError(errorMessages);
  }

  return validationResult.data;
};

export default schemaValidator;
