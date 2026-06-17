import { useEffect, useRef } from 'react';
import realtimeSocket from '../services/websocket';

export function useRealtimeUpdates(handlers = {}) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const unsubscribe = realtimeSocket.subscribeToMessages((message) => {
      const handler = handlersRef.current?.[message.type];
      if (typeof handler === 'function') {
        handler(message.data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
