import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateOutfitSuggestions } from "@/server/functions/outfit"

const OCCASIONS = [
  { label: "Work / Office", value: "work" },
  { label: "Casual / Weekend", value: "casual" },
  { label: "Date Night", value: "date-night" },
  { label: "Formal / Events", value: "formal" },
  { label: "Outdoor / Active", value: "outdoor" },
  { label: "Athletic", value: "athletic" },
]

const SEASONS = [
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Fall", value: "fall" },
  { label: "Winter", value: "winter" },
]

interface GenerationDialogProps {
  onGenerated: () => void
}

export function GenerationDialog({ onGenerated }: GenerationDialogProps) {
  const [open, setOpen] = useState(false)
  const [occasion, setOccasion] = useState("")
  const [season, setSeason] = useState("")
  const [mood, setMood] = useState("")
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      await generateOutfitSuggestions({
        data: {
          occasion: occasion || undefined,
          season: season || undefined,
          mood: mood || undefined,
          count: 2,
        },
      })
      toast.success("Outfits generated!")
      setOpen(false)
      resetState()
      onGenerated()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || "Failed to generate outfits")
    }
    setGenerating(false)
  }

  function resetState() {
    setOccasion("")
    setSeason("")
    setMood("")
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
          <Sparkles className="size-4" />
          Generate Outfit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate AI Outfit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Any occasion" />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Any season" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mood / Vibe (optional)</Label>
            <Input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., relaxed, bold, professional"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating outfits...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
