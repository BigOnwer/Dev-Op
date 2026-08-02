import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  secure: true
});


export async function UploadAvatar(image: string) {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      const result = await cloudinary.uploader.upload(image, options);
      return result.secure_url;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upload avatar");
    }
}