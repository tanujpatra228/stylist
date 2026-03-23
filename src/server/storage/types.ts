export interface UploadResult {
  publicUrl: string
  thumbnailUrl: string
  storageKey: string
  mimeType: string
  size: number
}

export interface SignedUploadOptions {
  folder?: string
  maxFileSize?: number
  allowedTypes?: string[]
}

export interface SignedUploadResult {
  uploadUrl: string
  fields: Record<string, string>
  storageKey: string
}

export interface ThumbnailOptions {
  width: number
  height: number
  fit?: "cover" | "contain"
}

export interface StorageProvider {
  upload(
    file: Buffer,
    options: { fileName: string; mimeType: string; folder?: string }
  ): Promise<UploadResult>

  getSignedUploadUrl(options: SignedUploadOptions): Promise<SignedUploadResult>

  delete(storageKey: string): Promise<void>

  getThumbnailUrl(storageKey: string, options: ThumbnailOptions): string
}
