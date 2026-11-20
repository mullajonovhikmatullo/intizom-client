const MAX_SIDE = 1024;

/**
 * Shrink a picked photo before upload (phone photos are often 5-12 MB).
 * EXIF orientation is applied by createImageBitmap; the server re-encodes anyway.
 * Falls back to the original file if the browser can't decode it.
 */
export async function prepareAvatarImage(file: File): Promise<{ blob: Blob; name: string }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) throw new Error("encode failed");
    return { blob, name: "avatar.jpg" };
  } catch {
    return { blob: file, name: file.name || "avatar" };
  }
}
