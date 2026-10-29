window.KaggriAuth = (() => {
  const key = 'kaggri-demo-role';
  const pendingKey = 'kaggri-pending-action';
  const readWindowState = () => {
    try { return JSON.parse(window.name.startsWith('kaggri-demo:') ? window.name.slice(12) : '{}'); }
    catch (_) { return {}; }
  };
  const writeWindowState = state => { window.name = 'kaggri-demo:' + JSON.stringify(state); };
  const readStorage = name => {
    try { return sessionStorage.getItem(name); } catch (_) { return null; }
  };
  const writeStorage = (name, value) => {
    try { sessionStorage.setItem(name, value); } catch (_) { /* URL and window.name carry the demo session. */ }
  };
  const removeStorage = name => {
    try { sessionStorage.removeItem(name); } catch (_) { /* Storage may be unavailable for file URLs. */ }
  };
  const role = () => {
    const fromUrl = new URLSearchParams(location.search).get('demoRole');
    const value = fromUrl || readStorage(key) || readWindowState().role;
    return value === 'buyer' || value === 'vendor' || value === 'admin' ? value : null;
  };
  const signIn = value => {
    if (value !== 'buyer' && value !== 'vendor' && value !== 'admin') return;
    writeStorage(key, value);
    writeWindowState({ ...readWindowState(), role: value });
  };
  const signOut = () => {
    removeStorage(key);
    removeStorage(pendingKey);
    writeWindowState({});
  };
  const setPendingAction = value => {
    writeStorage(pendingKey, value);
    writeWindowState({ ...readWindowState(), pendingAction: value });
  };
  const takePendingAction = () => {
    const value = readStorage(pendingKey) || readWindowState().pendingAction;
    removeStorage(pendingKey);
    const state = readWindowState();
    delete state.pendingAction;
    writeWindowState(state);
    return value;
  };
  const withRole = (value, selectedRole) => {
    const url = new URL(value, location.href);
    url.searchParams.set('demoRole', selectedRole);
    return url.href;
  };
  const safeDestination = (value, chosenRole) => {
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin || !['http:', 'https:', 'file:'].includes(url.protocol)) return null;
      const pathname = url.pathname.replaceAll('\\', '/');
      if (chosenRole === 'buyer' && /\/kaggri-trade-html-prototype\/index\.html$/.test(pathname)) return url.href;
      if (chosenRole === 'vendor' && /\/vendor-ui\/index\.html$/.test(pathname)) return url.href;
      if (chosenRole === 'admin' && /\/admin-ui\/index\.html$/.test(pathname)) return url.href;
    } catch (_) { /* Invalid destination uses the role default. */ }
    return null;
  };
  return { role, signIn, signOut, safeDestination, setPendingAction, takePendingAction, withRole };
})();
