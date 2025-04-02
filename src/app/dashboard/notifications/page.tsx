'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to ImageMax!',
      message: 'Thank you for joining ImageMax. Start processing your images today!',
      timestamp: '2 hours ago',
      read: false,
      type: 'info',
    },
    {
      id: '2',
      title: 'Background Remover Update',
      message: 'We\'ve improved our background removal algorithm for better results.',
      timestamp: '1 day ago',
      read: false,
      type: 'success',
    },
    {
      id: '3',
      title: 'Storage Warning',
      message: 'You\'re approaching your storage limit. Consider upgrading your plan.',
      timestamp: '2 days ago',
      read: true,
      type: 'warning',
    },
    {
      id: '4',
      title: 'Processing Complete',
      message: 'Your image has been successfully processed.',
      timestamp: '3 days ago',
      read: true,
      type: 'success',
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated with ImageMax
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
          <Button variant="destructive" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start justify-between rounded-lg border p-4",
                !notification.read && "bg-muted/50"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{notification.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 