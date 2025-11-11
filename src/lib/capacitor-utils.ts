import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

// Camera utilities
export const captureImage = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
};

export const pickImage = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

// Geolocation utilities
export const getCurrentLocation = async () => {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      timestamp: coordinates.timestamp,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Notification utilities
export const initializePushNotifications = async () => {
  try {
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      await PushNotifications.register();
    }

    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ' + JSON.stringify(notification));
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification);
    });
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

export const scheduleExpiryNotification = async (
  itemId: string,
  itemName: string,
  expiryDate: string
) => {
  try {
    // Request permissions
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Schedule notification 3 days before expiry
    if (daysUntilExpiry > 3) {
      const notificationDate = new Date(expiry);
      notificationDate.setDate(notificationDate.getDate() - 3);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(itemId.replace(/\D/g, '').slice(0, 9)),
            title: 'Item Expiring Soon',
            body: `${itemName} will expire in 3 days`,
            schedule: { at: notificationDate },
          },
        ],
      });
    }

    // Schedule notification on expiry day
    if (daysUntilExpiry >= 0) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(itemId.replace(/\D/g, '').slice(0, 9)) + 1,
            title: 'Item Expired',
            body: `${itemName} expires today!`,
            schedule: { at: expiry },
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const checkExpiringItems = (items: any[]): any[] => {
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringItems: any[] = [];

  const checkItem = (item: any) => {
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      if (expiryDate <= threeDaysFromNow && expiryDate >= today) {
        expiringItems.push(item);
      }
    }
    if (item.children) {
      item.children.forEach(checkItem);
    }
  };

  items.forEach(checkItem);
  return expiringItems;
};
