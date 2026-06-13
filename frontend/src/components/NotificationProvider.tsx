"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, message: string) => {
    setNotifications((prev) => {
      // Prevent duplicate messages if the exact same message is already visible
      if (prev.some((n) => n.message === message)) return prev;
      
      const id = Math.random().toString(36).substr(2, 9);
      const newNotif = { id, type, message };
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 4000);
      
      return [...prev, newNotif];
    });
  }, [removeNotification]);

  const success = useCallback((msg: string) => notify('success', msg), [notify]);
  const error = useCallback((msg: string) => notify('error', msg), [notify]);
  const warning = useCallback((msg: string) => notify('warning', msg), [notify]);
  const info = useCallback((msg: string) => notify('info', msg), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <NotificationCard 
              key={notif.id} 
              notification={notif} 
              onClose={() => removeNotification(notif.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// ==========================================
// Notification Card Component
// ==========================================
const NotificationCard = ({ notification, onClose }: { notification: NotificationItem; onClose: () => void }) => {
  const { type, message } = notification;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      colors: 'bg-emerald-50 dark:bg-[#06150D] border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300',
      iconColor: 'text-emerald-500',
      glow: 'shadow-[0_10px_40px_rgba(16,185,129,0.15)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.2)]'
    },
    error: {
      icon: AlertCircle,
      colors: 'bg-rose-50 dark:bg-[#1A0B10] border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300',
      iconColor: 'text-rose-500',
      glow: 'shadow-[0_10px_40px_rgba(244,63,94,0.15)] dark:shadow-[0_10px_40px_rgba(244,63,94,0.2)]'
    },
    warning: {
      icon: AlertTriangle,
      colors: 'bg-amber-50 dark:bg-[#1A140B] border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300',
      iconColor: 'text-amber-500',
      glow: 'shadow-[0_10px_40px_rgba(245,158,11,0.15)] dark:shadow-[0_10px_40px_rgba(245,158,11,0.2)]'
    },
    info: {
      icon: Info,
      colors: 'bg-blue-50 dark:bg-[#0B121A] border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300',
      iconColor: 'text-blue-500',
      glow: 'shadow-[0_10px_40px_rgba(59,130,246,0.15)] dark:shadow-[0_10px_40px_rgba(59,130,246,0.2)]'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl ${config.colors} ${config.glow} relative overflow-hidden group`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20"></div>
      
      <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 text-sm font-medium pr-6 leading-tight">
        {message}
      </div>
      
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
