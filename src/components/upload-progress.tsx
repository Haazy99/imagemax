import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { FileImage, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadProgressProps {
  fileName: string
  progress: number
  onCancel: () => void
}

export function UploadProgress({ fileName, progress, onCancel }: UploadProgressProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileImage className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {fileName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {progress}% uploaded
        </p>
      </CardContent>
    </Card>
  )
} 