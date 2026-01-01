
import io from 'socket.io-client';
import { EXPO_PUBLIC_API_URL } from '@env';

// Extract base URL (remove /api/v1)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace('/api/v1', '')
    : 'http://localhost:3000';

class SocketService {
    socket = null;

    connect() {
        this.socket = io(BASE_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    joinOrder(orderId) {
        if (this.socket) {
            this.socket.emit('join_order', orderId);
        }
    }

    leaveOrder(orderId) {
        if (this.socket) {
            this.socket.emit('leave_order', orderId);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    // Delivery Agent emits location
    updateLocation(orderId, location) {
        if (this.socket) {
            this.socket.emit('location_update', { orderId, ...location });
        }
    }
}

export default new SocketService();
