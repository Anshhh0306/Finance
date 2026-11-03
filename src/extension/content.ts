/**
 * Content script. Holds back the click on a checkout's final "Pay" / "Place order" button, shows
 * the real cost of the chosen payment option, and replays the click if the user continues.
 */
import { findCommitButton, replayClick } from './intercept';
import { LAUNCHER_ID, addLauncher } from './launcher';
import { HOST_ID, openModal } from './mount';
import { detectSurface, scrapeCheckout } from './scrape';

const surface = detectSurface(location.hostname);

if (surface) {
  // Capture phase, so this runs before the site's own click handlers.
  window.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest(`#${HOST_ID}, #${LAUNCHER_ID}`)) return;

      const button = findCommitButton(target);
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openModal(scrapeCheckout(surface, button), { onContinue: () => replayClick(button) });
    },
    true,
  );

  const showLauncher = () => addLauncher(() => openModal(scrapeCheckout(surface, null)));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showLauncher);
  else showLauncher();
}
