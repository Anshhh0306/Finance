export const LAUNCHER_ID = 'commitguard-launcher';

/** A small pill in the corner that opens CommitGuard on demand, without waiting for a checkout click. */
export function addLauncher(onOpen: () => void) {
  if (document.getElementById(LAUNCHER_ID)) return;

  const pill = document.createElement('button');
  pill.id = LAUNCHER_ID;
  pill.type = 'button';
  pill.title = 'See the real cost of paying here';
  pill.style.cssText = [
    'position: fixed',
    'bottom: 24px',
    'right: 24px',
    'z-index: 2147483640',
    'display: flex',
    'align-items: center',
    'gap: 8px',
    'padding: 10px 18px',
    'border: 1px solid #C9A227',
    'border-radius: 9999px',
    'background: #0B1D3A',
    'color: #ffffff',
    'font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'box-shadow: 0 10px 25px -5px rgba(11, 29, 58, 0.45)',
    'cursor: pointer',
  ].join(';');

  const dot = document.createElement('span');
  dot.style.cssText = 'width: 8px; height: 8px; border-radius: 50%; background: #C9A227';
  const label = document.createElement('span');
  label.textContent = 'CommitGuard: real cost';
  pill.append(dot, label);

  pill.addEventListener('click', (event) => {
    event.stopPropagation();
    onOpen();
  });
  (document.body ?? document.documentElement).appendChild(pill);
}
