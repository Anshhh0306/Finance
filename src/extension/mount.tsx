import { createRoot } from 'react-dom/client';
import styles from './styles.css';
import { CommitGuardModal } from './modal/CommitGuardModal';
import type { CheckoutInfo } from './types';

export const HOST_ID = 'commitguard-extension-root';

/**
 * Renders the modal inside a shadow root, so the site's CSS cannot restyle it and its Tailwind
 * styles cannot leak into the site.
 */
export function openModal(info: CheckoutInfo, { onContinue = () => {}, onCancel = () => {} } = {}) {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;
  const mountPoint = document.createElement('div');
  shadow.append(style, mountPoint);
  (document.body ?? document.documentElement).appendChild(host);

  const root = createRoot(mountPoint);
  const close = () => {
    root.unmount();
    host.remove();
  };
  root.render(
    <CommitGuardModal
      info={info}
      onContinue={() => {
        close();
        onContinue();
      }}
      onCancel={() => {
        close();
        onCancel();
      }}
    />,
  );
}
