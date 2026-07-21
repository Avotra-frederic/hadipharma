"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationBus = void 0;
class NotificationBus {
    constructor() {
        this.listeners = new Set();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    emit(event, payload) {
        this.listeners.forEach((listener) => {
            try {
                listener(event, payload);
            }
            catch (err) {
                console.error('Notification listener error:', err);
            }
        });
    }
}
exports.notificationBus = new NotificationBus();
