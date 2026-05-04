<script>
import { mapState, mapActions } from 'pinia'
import { useNotificationStore } from '@/stores/notification-store'
import { Bell, BellOff, Check, Trash2 } from 'lucide-vue-next'

export default {
  name: 'NotificationBell',
  components: { Bell, BellOff, Check, Trash2 },
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
div.notification-bell(ref="bellWrapper")
  button.bell-button(
    type="button"
    :class="{ 'bell-button--active': isOpen }"
    aria-label="Notifications"
    @click="toggle"
  )
    Bell(:size="18", :stroke-width="1.75")
    span.badge(v-if="hasUnread") {{ displayCount }}
  Transition(name="dropdown")
    div.dropdown-panel(v-if="isOpen")
      div.dropdown-header
        span.dropdown-title Notifications
        div.dropdown-actions(v-if="notifications.length")
          button.action-btn(type="button", title="Mark all read", @click="markAllAsRead")
            Check(:size="14", :stroke-width="2")
          button.action-btn(type="button", title="Clear all", @click="clearAll")
            Trash2(:size="14", :stroke-width="2")
      div.dropdown-body
        div.empty-state(v-if="!notifications.length")
          BellOff(:size="28", :stroke-width="1.5")
          span No notifications yet
        div.notification-list(v-else)
          div.notification-item(
            v-for="n in notifications"
            :key="n.id"
            :class="{ unread: !n.read, [n.type]: true }"
            @click="handleClickNotification(n)"
          )
            span.notification-dot(v-if="!n.read")
            div.notification-content
              div.notification-title {{ n.title }}
              div.notification-message {{ n.message }}
              div.notification-time {{ formatTime(n.createdAt) }}
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
}

.bell-button {
  position: relative;
  background: transparent;
  border: 1px solid var(--color-border);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: background-color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
}

.bell-button:hover,
.bell-button--active {
  background: var(--color-background-hover);
  border-color: var(--color-border-hover);
  color: var(--color-heading);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  line-height: 1;
  border: 2px solid var(--color-background-card);
}

.dropdown-panel {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  width: 320px;
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
  font-size: 13px;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.dropdown-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease);
}

.action-btn:hover {
  background: var(--color-background-hover);
  color: var(--color-heading);
  border-color: var(--color-border);
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
  padding: 36px 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
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
  transition: background-color var(--duration-fast) var(--ease);
  border-bottom: 1px solid var(--color-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--color-background-hover);
}

.notification-item.unread {
  background-color: var(--color-primary-soft);
}

.notification-dot {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-top: 6px;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-fast) var(--ease), transform var(--duration-fast) var(--ease);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
