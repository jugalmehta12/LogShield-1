import { useEffect, useState } from 'react';
import realtimeSocket from '../services/websocket';

export function useRealtimeSocket() {
  const [connectionStatus, setConnectionStatus] = useState(realtimeSocket.getConnectionStatus());

  useEffect(() => {
    const unsubscribe = realtimeSocket.subscribeToStatus(setConnectionStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  return { connectionStatus };
}
