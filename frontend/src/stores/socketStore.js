import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { useOrderStore } from './orderStore'
import { useAccountStore } from './accountStore'

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
                this.joinRooms()
            })

            socket.on('disconnect', () => {
                this.connected = false
            })

            socket.on('order:updated', (order) => {
                const orderStore = useOrderStore()
                orderStore.applyOrderUpdate(order)
            })

            socket.on('order:created', (order) => {
                const orderStore = useOrderStore()
                orderStore.applyOrderCreated(order)
            })

            socket.on('order:deleted', ({ orderId }) => {
                const orderStore = useOrderStore()
                orderStore.applyOrderDeleted(orderId)
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

            if (this.connected) {
                this.joinRooms()
            }
        },

        joinRooms() {
            const accountStore = useAccountStore()
            if (accountStore.customerId) {
                socket.emit('join:customer', accountStore.customerId)
            }
            if (accountStore.companyId) {
                socket.emit('join:company', accountStore.companyId)
            }
        },

        joinOrderRoom(orderId) {
            socket.emit('join:order', orderId)
        },

        leaveOrderRoom(orderId) {
            socket.emit('leave:order', orderId)
        },
    },
})