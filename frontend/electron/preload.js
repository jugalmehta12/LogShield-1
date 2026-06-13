import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('logShield', {
  version: '0.1.0',
});