frogMonitor.init({
  silentConsole: true,
  maxBreadcrumbs: 10,
  dsn: 'http://localhost:2025/errors/upload',
  throttleDelayTime: 0,
  onRouteChange(from, to) {
    console.log('onRouteChange: _', from, to);
  },
});
