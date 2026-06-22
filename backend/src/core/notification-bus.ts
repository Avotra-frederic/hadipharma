type Listener = (event: string, payload: unknown) => void;

class NotificationBus {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: string, payload: unknown): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }
}

export const notificationBus = new NotificationBus();
