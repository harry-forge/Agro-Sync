// Crash Analysis Helper - Run this in browser console after login crash

// 1. Add comprehensive error logging to detect common crash patterns
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const crashLogs = [];

console.error = (...args) => {
  crashLogs.push({
    type: 'ERROR',
    timestamp: new Date().toISOString(),
    message: args.join(' '),
    stack: new Error().stack
  });
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  crashLogs.push({
    type: 'WARN', 
    timestamp: new Date().toISOString(),
    message: args.join(' ')
  });
  originalConsoleWarn.apply(console, args);
};

// 2. Check for common crash patterns
const checkCrashPatterns = () => {
  const patterns = [
    'Cannot read property',
    'undefined is not an object',
    'Navigation',
    'Router',
    'Reanimated',
    'Worklets',
    'TypeError',
    'ReferenceError'
  ];
  
  const suspiciousLogs = crashLogs.filter(log => 
    patterns.some(pattern => 
      log.message.toLowerCase().includes(pattern.toLowerCase())
    )
  );
  
  return suspiciousLogs;
};

// 3. Analyze route state
const analyzeRouteState = () => {
  try {
    // Check if expo-router has any state issues
    const routerState = window.__EXPO_ROUTER_STATE__;
    return {
      routerState: routerState || 'Not available',
      currentUrl: window.location.href,
      hasRouter: typeof window.__EXPO_ROUTER__ !== 'undefined'
    };
  } catch (e) {
    return { error: e.message };
  }
};

// 4. Check Reanimated/Worklets status
const checkReanimatedStatus = () => {
  try {
    return {
      global_reanimated: typeof global.__reanimatedWorkletInit !== 'undefined',
      global_worklets: typeof global.__workletInit !== 'undefined',
      window_reanimated: typeof window._WORKLET !== 'undefined'
    };
  } catch (e) {
    return { error: e.message };
  }
};

// 5. Export comprehensive crash report
window.getCrashReport = () => {
  return {
    timestamp: new Date().toISOString(),
    crashLogs: crashLogs,
    suspiciousLogs: checkCrashPatterns(),
    routeAnalysis: analyzeRouteState(),
    reanimatedStatus: checkReanimatedStatus(),
    userAgent: navigator.userAgent,
    totalLogs: crashLogs.length
  };
};

console.log('🔍 Crash analysis helper loaded. After reproducing crash, run: getCrashReport()');