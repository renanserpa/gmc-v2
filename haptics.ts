// src/lib/haptics.ts
export const haptics = {
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) { console.warn('Vibration not supported'); }
    }
  },
  tick: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(5); } catch (e) { }
    }
  },
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(20); } catch (e) { }
    }
  },
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) { }
    }
  },
  fever: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([30, 50, 30, 50, 100]); } catch (e) { }
    }
  },
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([10, 30, 10]); } catch (e) { }
    }
  },
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([50, 30, 50]); } catch (e) { }
    }
  },
  metronomeBeat: (isDownbeat: boolean) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { isDownbeat ? navigator.vibrate(150) : navigator.vibrate(40); } catch (e) {}
      }
  }
};
