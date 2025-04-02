"use client"

import { useToast as useToastBase } from "@/components/ui/use-toast"

export function useToast() {
  const { toast } = useToastBase()

  return {
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
      })
    },
    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "destructive",
      })
    },
    loading: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
      })
    },
  }
} 