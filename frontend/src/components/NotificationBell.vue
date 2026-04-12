<script>
import { mapState, mapActions } from 'pinia'
import { useNotificationStore } from '@/stores/notificationStore'

export default {
  name: 'NotificationBell',
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    ...mapState(useNotificationStore, ['notifications', 'unreadCount', 'hasUnread']),
    displayCount() {
      return this.unreadCount > 9 ? '9+' : this.unreadCount
    },
  },
  methods: {
    ...mapActions(useNotificationStore, ['markAsRead', 'markAllAsRead', 'clearAll']),
    toggle() {
      this.isOpen = !this.isOpen
    },
    close() {
      this.isOpen = false
    },
    handleClickNotification(notification) {
      this.markAsRead(notification.id)
    },
    handleClickOutside(event) {
      if (this.$refs.bellWrapper && !this.$refs.bellWrapper.contains(event.target)) {
        this.close()
      }
    },
    formatTime(date) {
      const now = new Date()
      const diff = now - new Date(date)
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      return `${Math.floor(hours / 24)}d ago`
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
}
</script>

<template lang="pug">
.notification-bell(ref="bellWrapper")
  button.bell-button(@click="toggle" aria-label="Notifications")
    svg.bell-icon(
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    )
      path(d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9")
      path(d="M13.73 21a2 2 0 0 1-3.46 0")
    span.badge(v-if="hasUnread") {{ displayCount }}

  Transition(name="dropdown")
    .dropdown-panel(v-if="isOpen")
      .dropdown-header
        span.dropdown-title Notifications
        .dropdown-actions(v-if="notifications.length")
          button.action-btn(@click="markAllAsRead") Mark all read
          button.action-btn(@click="clearAll") Clear
      .dropdown-body
        .empty-state(v-if="!notifications.length")
          svg.empty-icon(
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          )
            path(d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9")
            path(d="M13.73 21a2 2 0 0 1-3.46 0")
            line(x1="1" y1="1" x2="23" y2="23")
          span No notifications yet
        .notification-list(v-else)
          .notification-item(
            v-for="n in notifications"
            :key="n.id"
            :class="{ unread: !n.read, [n.type]: true }"
            @click="handleClickNotification(n)"
          )
            .notification-dot(v-if="!n.read")
            .notification-content
              .notification-title {{ n.title }}
              .notification-message {{ n.message }}
              .notification-time {{ formatTime(n.createdAt) }}
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
}

.bell-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  color: var(--color-text);
}

.bell-button:hover {
  background-color: var(--color-primary-light);
}

.bell-icon {
  width: 22px;
  height: 22px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
  border: 2px solid var(--color-background-card);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-height: 420px;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.dropdown-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-heading);
}

.dropdown-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-primary);
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: var(--color-primary-light);
}

.dropdown-body {
  overflow-y: auto;
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.empty-icon {
  width: 36px;
  height: 36px;
  opacity: 0.4;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--color-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--color-primary-light);
}

.notification-item.unread {
  background-color: rgba(21, 115, 71, 0.04);
}

[data-theme='dark'] .notification-item.unread {
  background-color: rgba(46, 204, 113, 0.06);
}

.notification-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-top: 5px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-heading);
  margin-bottom: 2px;
}

.notification-message {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.7;
  margin-top: 4px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
