import { File as DBFile } from "@prisma/client";
import { UploadHandlerPart } from "@remix-run/node";

import { ValidationError } from "~/errors";

export const convertFileToBase64String = (
  file: DBFile | null,
): string | null => {
  if (file === undefined || file === null) {
    return null;
  }

  const bufferToBase64 = file.buffer.toString("base64");

  const base64String = `data:${file.mimetype};base64,${bufferToBase64}`;

  return base64String;
};

export const avatarUploadHandler = async ({
  name,
  contentType,
  data,
}: UploadHandlerPart) => {
  if (name === "avatar") {
    const allowedImageTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
      "image/tiff",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(contentType)) {
      throw new ValidationError({ FileTypeError: ["Invalid file type"] });
    }

    const crypto = await import("node:crypto");
    const randomId = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${randomId}`;

    const fileBits = [];
    for await (const x of data) {
      fileBits.push(x);
    }

    return new File(fileBits, filename, { type: contentType });
  }

  const fileBits = [];
  for await (const x of data) {
    fileBits.push(x);
  }

  return new Blob(fileBits).text();
};
