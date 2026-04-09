import { defineStore } from 'pinia'
import io from 'socket.io-client'

export const useSocketStore = defineStore('Socket', {
    state: () => ({
        connected: false,
    }),
    actions: {
        init() {
            socket.on('connect', () => {
                this.connected = true
                console.log('connected to server')
            })
            socket.on('disconnect', () => {
                this.connected = false
                console.log('disconnected from server')
            })
        }
    }


})

export const socket = io('http://localhost:3000')