import { defineStore } from 'pinia'

const MAX_NOTIFICATIONS = 50

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
    }),
    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length,
        hasUnread: (state) => state.notifications.some(n => !n.read),
    },
    actions: {
        addNotification({ title, message, type = 'info' }) {
            this.notifications.unshift({
                id: Date.now() + Math.random(),
                title,
                message,
                type,
                read: false,
                createdAt: new Date(),
            })

            if (this.notifications.length > MAX_NOTIFICATIONS) {
                this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS)
            }
        },

        markAsRead(notificationId) {
            const notification = this.notifications.find(n => n.id === notificationId)
            if (notification) notification.read = true
        },

        markAllAsRead() {
            this.notifications.forEach(n => { n.read = true })
        },

        clearAll() {
            this.notifications = []
        },
    },
})
