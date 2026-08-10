import { db } from '@/lib/db';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'ORDER' | 'PROMO' | 'SYSTEM';
  link?: string;
}

export class NotificationService {
  static async send(params: CreateNotificationParams) {
    try {
      const notification = await db.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'INFO',
          link: params.link,
        },
      });
      // In production, trigger email/SMS dispatch here via Resend, SendGrid, or AWS SES
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    return db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
