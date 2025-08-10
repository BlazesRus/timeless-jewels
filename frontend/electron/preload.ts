// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

//IPC & Secure API Exposure:
//Defining clear IPC channels and expose only the methods your renderer needs.
contextBridge.exposeInMainWorld('api', {
  // One-way send: renderer ? main
  send: (channel: 'log-event' | 'perform-action', data: any) => {
    const valid = ['log-event', 'perform-action'];
    if (valid.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Invoke/return: renderer ? main
  invoke: (channel: 'get-config'): Promise<WindowState> => {
    if (channel === 'get-config') {
      return ipcRenderer.invoke(channel);
    }
    return Promise.reject('Invalid IPC channel');
  }
});