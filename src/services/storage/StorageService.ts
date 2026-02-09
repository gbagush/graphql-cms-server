import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export interface UploadOptions {
  overwrite?: boolean;
}

export class StorageService {
  async upload(
    base64Data: string,
    publicId: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const { overwrite = false } = options;

    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        public_id: publicId,
        overwrite,
        resource_type: "image",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error("Storage upload error:", error);
      throw new Error("Failed to upload image");
    }
  }

  async delete(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Storage delete error:", error);
      return false;
    }
  }
}
