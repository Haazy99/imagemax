import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  currentUsage: number
  limit: number
  onUpgrade?: () => void
}

export function UpgradePrompt({ currentUsage, limit, onUpgrade }: UpgradePromptProps) {
  const usagePercentage = (currentUsage / limit) * 100

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Storage Quota Exceeded</CardTitle>
        <CardDescription>
          You've used {usagePercentage.toFixed(1)}% of your storage quota
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Upgrade to our Pro plan to get:
        </p>
        <ul className="mt-2 space-y-2 text-sm">
          <li>✓ 1GB storage (10x more)</li>
          <li>✓ Priority processing</li>
          <li>✓ Advanced features</li>
          <li>✓ No file expiration</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/pricing">
            Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 