import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  secure: true
});


export async function UploadAvatar(
  buffer: Buffer,
  userId: string,
  mimetype: string
): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: userId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            {width: 512, height: 512, crop: 'fill', gravity: 'face'},
            {fetch_format: 'auto', quality: 'auto'},
          ],
        },
        (error, result) => {
          if (error || !result)  return reject(error)
          resolve(result.secure_url)
        }
      )

      stream.end(buffer)
    })
}