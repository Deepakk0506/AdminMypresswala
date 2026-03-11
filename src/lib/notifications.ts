import { supabase } from "./supabaseClient";

export interface NotificationData {
  title: string;
  message: string;
  type: 'general' | 'shop_approval' | 'shop_rejection' | 'order_update' | 'promotion' | 'system';
  relatedShopId?: string;
  userId?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  // Send notification for shop submission
  static async sendShopSubmissionNotification(shopId: string, shopName: string) {
    const notification: NotificationData = {
      title: "New Shop Submission",
      message: `${shopName} has submitted an application to join the platform`,
      type: 'shop_approval',
      relatedShopId: shopId,
      data: {
        shopName,
        action: 'submitted',
        timestamp: new Date().toISOString()
      }
    };

    return await this.createNotification(notification);
  }

  // Send notification for shop approval
  static async sendShopApprovalNotification(shopId: string, shopName: string, shopEmail: string) {
    const notification: NotificationData = {
      title: "Shop Approved!",
      message: `Congratulations! ${shopName} has been approved and is now active on the platform`,
      type: 'shop_approval',
      relatedShopId: shopId,
      data: {
        shopName,
        shopEmail,
        action: 'approved',
        timestamp: new Date().toISOString()
      }
    };

    return await this.createNotification(notification);
  }

  // Send notification for shop rejection
  static async sendShopRejectionNotification(shopId: string, shopName: string, shopEmail: string, reason?: string) {
    const notification: NotificationData = {
      title: "Shop Application Update",
      message: `Your shop application for ${shopName} requires review${reason ? `. Reason: ${reason}` : ''}`,
      type: 'shop_rejection',
      relatedShopId: shopId,
      data: {
        shopName,
        shopEmail,
        reason,
        action: 'rejected',
        timestamp: new Date().toISOString()
      }
    };

    return await this.createNotification(notification);
  }

  // Send notification for shop activation
  static async sendShopActivationNotification(shopId: string, shopName: string) {
    const notification: NotificationData = {
      title: "Shop Activated",
      message: `${shopName} is now live and ready to accept orders`,
      type: 'shop_approval',
      relatedShopId: shopId,
      data: {
        shopName,
        action: 'activated',
        timestamp: new Date().toISOString()
      }
    };

    return await this.createNotification(notification);
  }

  // Create notification in database
  private static async createNotification(notification: NotificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          related_shop_id: notification.relatedShopId,
          user_id: notification.userId,
          data: notification.data,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating notification:', error);
      return { success: false, error };
    }
  }

  // Get notifications for admin (shop approvals)
  static async getAdminNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('type', ['shop_approval', 'shop_rejection'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting admin notifications:', error);
      return [];
    }
  }

  // Get notifications for specific shop
  static async getShopNotifications(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('related_shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting shop notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId?: string) {
    try {
      let query = supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
