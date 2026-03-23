import { v2 as cloudinary } from "cloudinary"
import type {
  StorageProvider,
  UploadResult,
  SignedUploadOptions,
  SignedUploadResult,
  ThumbnailOptions,
} from "../types"

export class CloudinaryProvider implements StorageProvider {
  private cloudName: string

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set"
      )
    }

    this.cloudName = cloudName

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
  }

  async upload(
    file: Buffer,
    options: { fileName: string; mimeType: string; folder?: string }
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "ai-stylist",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"))
            return
          }
          resolve({
            publicUrl: result.secure_url,
            thumbnailUrl: this.getThumbnailUrl(result.public_id, {
              width: 300,
              height: 300,
            }),
            storageKey: result.public_id,
            mimeType: `image/${result.format}`,
            size: result.bytes,
          })
        }
      )
      uploadStream.end(file)
    })
  }

  async getSignedUploadUrl(
    options: SignedUploadOptions
  ): Promise<SignedUploadResult> {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = options.folder || "ai-stylist"

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      fields: {
        api_key: process.env.CLOUDINARY_API_KEY!,
        timestamp: String(timestamp),
        signature,
        folder,
      },
      storageKey: "",
    }
  }

  async delete(storageKey: string): Promise<void> {
    await cloudinary.uploader.destroy(storageKey)
  }

  getThumbnailUrl(storageKey: string, options: ThumbnailOptions): string {
    const crop = options.fit === "contain" ? "fit" : "fill"
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_${crop},w_${options.width},h_${options.height},q_auto,f_auto/${storageKey}`
  }
}
