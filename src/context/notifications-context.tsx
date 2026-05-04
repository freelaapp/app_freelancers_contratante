import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  vagaId: string;
  vagaTitle: string;
  read: boolean;
  createdAt: string;
};

type NotificationsContextType = {
  notifications: AppNotification[];
  hasUnread: boolean;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const STORAGE_KEY = "@app_notifications";

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  hasUnread: false,
  addNotification: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setNotifications(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  function persist(next: AppNotification[]) {
    setNotifications(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "read" | "createdAt">) => {
      const newNotif: AppNotification = {
        ...n,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev].slice(0, 50);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <NotificationsContext.Provider value={{ notifications, hasUnread, addNotification, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
