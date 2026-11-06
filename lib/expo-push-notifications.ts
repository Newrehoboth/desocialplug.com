import User from '@/models/User';

interface PushMessage {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data?: any;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const user = await User.findById(userId).select('expoPushToken').lean();
    
    if (!user || !user.expoPushToken) {
      console.log(`No push token found for user ${userId}`);
      return null;
    }

    return await sendExpoPushNotification(user.expoPushToken, title, body, data);
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return null;
  }
}

/**
 * Send push notification to all users (global notification)
 */
export async function sendPushNotificationToAllUsers(
  title: string,
  body: string,
  data?: any
) {
  try {
    const users = await User.find({ expoPushToken: { $exists: true, $ne: null } })
      .select('expoPushToken')
      .lean();

    if (users.length === 0) {
      console.log('No users with push tokens found');
      return { sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      users.map((user) =>
        sendExpoPushNotification(user.expoPushToken!, title, body, data)
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`Push notifications sent: ${sent}, failed: ${failed}`);
    return { sent, failed };
  } catch (error) {
    console.error('Error sending push notifications to all users:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send push notification using Expo Push API
 */
async function sendExpoPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message: PushMessage = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
    priority: 'high',
    channelId: 'default',
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data?.status === 'error') {
      console.error('Expo push notification error:', result.data.message);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error calling Expo push API:', error);
    return null;
  }
}
