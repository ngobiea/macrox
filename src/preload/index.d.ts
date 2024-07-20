import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      recordAction: (action: boolean) => void;
      playActions: () => void;
      saveActions: (actions: action[]) => void;
      onUpdateActions: (callback: (actions: action[]) => void) => void;
      deleteAction: (actionId: string) => void;
    };
  }

  interface Action {
    id: string;
    type: string;
    key: string;
    x: number;
    y: number;
    state: string;
    delay: number;
  }
}
