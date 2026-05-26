let intervalId: ReturnType<typeof setInterval> | null = null;
const TICK_INTERVAL = 25;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case 'start':
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        self.postMessage('tick');
      }, TICK_INTERVAL);
      break;

    case 'stop':
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      break;
  }
};