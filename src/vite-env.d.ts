/// <reference types="vite/client" />

interface Window {
  global: typeof window;
}

declare module 'setimmediate' {
  global {
    function setImmediate(callback: (...args: any[]) => void, ...args: any[]): number;
    function clearImmediate(immediateId: number): void;
  }
  export = setImmediate;
}