import { useState, useRef } from "react"
import { Upload, Loader2, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  getUploadSignature,
  saveWardrobeItem,
} from "@/server/functions/wardrobe"

interface UploadDialogProps {
  onItemUploaded: () => void
}

export function UploadDialog({ onItemUploaded }: UploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (!dropped?.type.startsWith("image/")) {
      toast.error("Please drop an image file")
      return
    }
    setFile(dropped)
    setPreview(URL.createObjectURL(dropped))
  }

  async function handleUpload() {
    if (!file) return

    setUploading(true)
    setProgress(10)

    try {
      // 1. Get signed upload params from server
      const signature = (await getUploadSignature()) as {
        uploadUrl: string
        fields: Record<string, string>
      }
      setProgress(20)

      // 2. Upload directly to Cloudinary
      const formData = new FormData()
      Object.entries(signature.fields).forEach(([key, val]) => {
        formData.append(key, val)
      })
      formData.append("file", file)

      const uploadRes = await fetch(signature.uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed")
      }

      const uploadData = await uploadRes.json()
      setProgress(60)

      // 3. Send to server for AI analysis
      setUploading(false)
      setAnalyzing(true)

      await saveWardrobeItem({
        data: {
          publicUrl: uploadData.secure_url,
          storageKey: uploadData.public_id,
        },
      })

      setProgress(100)
      toast.success("Item added to your wardrobe!")

      // Reset and close
      resetState()
      setOpen(false)
      onItemUploaded()
    } catch (error: unknown) {
      const err = error as Error
      console.error("Upload failed:", err.message || err)
      toast.error("Failed to upload item. Please try again.")
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  function resetState() {
    setFile(null)
    setPreview(null)
    setProgress(0)
    setUploading(false)
    setAnalyzing(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetState()
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="size-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Wardrobe Item</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50"
          >
            <ImageIcon className="size-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={preview}
                alt="Preview"
                className="size-full object-cover"
              />
            </div>

            {(uploading || analyzing) && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-center text-xs text-muted-foreground">
                  {uploading
                    ? "Uploading image..."
                    : "AI is analyzing your item..."}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetState}
                disabled={uploading || analyzing}
                className="flex-1"
              >
                Change
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || analyzing}
                className="flex-1"
              >
                {uploading || analyzing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {uploading ? "Uploading..." : "Analyzing..."}
                  </>
                ) : (
                  "Upload & Analyze"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
