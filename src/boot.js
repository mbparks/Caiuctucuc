// Browser boot loader. Keep this file small and dependency-free so deployment
// failures report a useful message instead of a black screen or "unknown error".

function esc(text) {
  return String(text || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function shortUrl(url) {
  try {
    const u = new URL(url, location.href);
    return u.pathname.replace(/^\//, '') + (u.search || '');
  } catch {
    return url || '';
  }
}

function describeError(err) {
  if (!err) return window.__CAIUCTUCUC_ERR || 'No browser error was reported.';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.reason) return describeError(err.reason);
  if (err.target && (err.target.src || err.target.href)) return 'Could not load ' + shortUrl(err.target.src || err.target.href);
  try { return JSON.stringify(err); }
  catch { return String(err); }
}

function deploymentHint(message) {
  const m = String(message || '').toLowerCase();
  if (location.protocol === 'file:') {
    return 'This was opened from disk. Serve the folder over http, for example: python3 -m http.server 8000';
  }
  if (m.includes('dynamically imported module') || m.includes('failed to fetch') || m.includes('load') || m.includes('404')) {
    return 'On shared hosting this usually means the upload is incomplete, a file path has the wrong letter case, or a .js file is being served as the wrong type. Upload the whole built dist folder, including src and assets, and preserve lowercase paths exactly.';
  }
  if (m.includes('mime') || m.includes('text/html')) {
    return 'The server is not serving JavaScript as JavaScript. Check that .js files are uploaded as files, not redirected to an HTML error page.';
  }
  return 'Open the browser developer console and Network tab. The first red src/*.js or assets/*.json request is the file to fix on the server.';
}

function showBootFailure(summary, detail) {
  if (window.__CAIUCTUCUC_BOOT_FAILURE_SHOWN) return;
  window.__CAIUCTUCUC_BOOT_FAILURE_SHOWN = true;
  const message = describeError(detail || window.__CAIUCTUCUC_ERR);
  window.__CAIUCTUCUC_ERR = message;
  const stage = document.getElementById('stage');
  if (!stage) return;
  const box = document.createElement('div');
  box.style.cssText = 'max-width:42rem;padding:1.2rem 1.5rem;border:1px solid #7a715c;background:#1d1a14;line-height:1.5';
  box.innerHTML =
    '<p style="letter-spacing:.2em;color:#9a4a32;margin:0 0 .6rem">THE GAME DID NOT START</p>' +
    '<p><b>' + esc(summary || 'The browser could not start the game.') + '</b></p>' +
    '<p>First error: <span style="font-family:monospace">' + esc(message) + '</span></p>' +
    '<p style="color:#d8cfb8">' + esc(deploymentHint(message)) + '</p>';
  stage.replaceChildren(box);
}

window.__CAIUCTUCUC_SHOW_BOOT_FAILURE = showBootFailure;

window.addEventListener('error', e => {
  if (!window.__CAIUCTUCUC_ERR) window.__CAIUCTUCUC_ERR = describeError(e);
}, true);

window.addEventListener('unhandledrejection', e => {
  if (!window.__CAIUCTUCUC_ERR) window.__CAIUCTUCUC_ERR = describeError(e.reason || e);
}, true);

setTimeout(() => {
  if (!window.__CAIUCTUCUC_BOOTED && !window.__CAIUCTUCUC_BOOT_FAILURE_SHOWN) {
    showBootFailure('The main game module did not finish booting.', window.__CAIUCTUCUC_ERR);
  }
}, 4500);

try {
  await import('./render_integrity.js');
} catch (err) {
  console.warn('[caiuctucuc] Render integrity guard did not load:', describeError(err));
}

try {
  await import('./main.js');
  if (!window.__CAIUCTUCUC_BOOTED) throw new Error('main.js imported, but did not mark the game as booted.');
} catch (err) {
  showBootFailure('The main game module could not be imported.', err);
}

if (window.__CAIUCTUCUC_BOOTED) {
  try {
    await import('./gameplay_boost.js');
  } catch (err) {
    console.warn('[caiuctucuc] Trail helper did not load:', describeError(err));
  }
  try {
    await import('./world_expansion.js');
  } catch (err) {
    console.warn('[caiuctucuc] World expansion did not load:', describeError(err));
  }
  try {
    await import('./ui_cohesion.js');
  } catch (err) {
    console.warn('[caiuctucuc] UI cohesion did not load:', describeError(err));
  }
  try {
    await import('./ui_overlay_manager.js');
  } catch (err) {
    console.warn('[caiuctucuc] Overlay manager did not load:', describeError(err));
  }
  try {
    await import('./command_center.js');
  } catch (err) {
    console.warn('[caiuctucuc] Command center did not load:', describeError(err));
  }
}
