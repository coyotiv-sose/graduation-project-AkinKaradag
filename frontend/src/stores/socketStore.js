import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { useOrderStore } from './orderStore'
import { useAccountStore } from './accountStore'
import { useNotificationStore } from './notificationStore'

export const socket = io('http://localhost:3000', {
    withCredentials: true,
})

export const useSocketStore = defineStore('Socket', {
    state: () => ({
        connected: false,
    }),
    actions: {
        init() {
            socket.on('connect', () => {
                this.connected = true
            })

            socket.on('disconnect', () => {
                this.connected = false
            })

            socket.on('order:updated', (order) => {
                const orderStore = useOrderStore()
                const notificationStore = useNotificationStore()
                orderStore.applyOrderUpdate(order)

                const stateLabel = order.state?.replace('_', ' ').toLowerCase() || 'updated'
                notificationStore.addNotification({
                    title: 'Order Updated',
                    message: `Order to ${order.destination || 'N/A'} is now ${stateLabel}`,
                    type: 'info',
                })
            })

            socket.on('order:created', (order) => {
                const orderStore = useOrderStore()
                const notificationStore = useNotificationStore()
                orderStore.applyOrderCreated(order)

                notificationStore.addNotification({
                    title: 'New Order',
                    message: `Order from ${order.origin || 'N/A'} to ${order.destination || 'N/A'} created`,
                    type: 'success',
                })
            })

            socket.on('order:deleted', ({ orderId }) => {
                const orderStore = useOrderStore()
                const notificationStore = useNotificationStore()
                orderStore.applyOrderDeleted(orderId)

                notificationStore.addNotification({
                    title: 'Order Removed',
                    message: `An order has been removed`,
                    type: 'warning',
                })
            })

            socket.on('orders:refresh', () => {
                const orderStore = useOrderStore()
                const accountStore = useAccountStore()
                if (accountStore.companyId) {
                    orderStore.getOrdersByCompany(accountStore.companyId)
                } else if (accountStore.customerId) {
                    orderStore.getOrders(accountStore.customerId)
                }
            })

            socket.on('notification', (payload) => {
                const notificationStore = useNotificationStore()
                notificationStore.addNotification(payload)
            })
        },

        joinOrderRoom(orderId) {
            socket.emit('join:order', orderId)
        },

        leaveOrderRoom(orderId) {
            socket.emit('leave:order', orderId)
        },
    },
})