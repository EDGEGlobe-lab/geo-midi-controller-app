# Cross-Device Radio Boundary

PARKWAY targets modern browser environments on current iPhone/iPad, Android, macOS, Windows, Linux, and Chromium-family devices. This is a browser support target, not a guarantee for every operating-system version, audio driver, browser extension, device output route, network state, or accessibility configuration.

The radio player starts only from a user interaction. Media and Web Audio playback can be blocked until a click, tap, or key interaction, so the interface exposes a clear Play/Enable Stereo action and explains output failures instead of silently retrying. [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

The workspace must retain visible focus indicators, semantic button labels, keyboard operation, touch targets, readable contrast, and reflow at zoom. Reduced-motion settings are respected. These choices follow W3C guidance that accessible media players work without a mouse, at enlarged zoom, and with screen readers. [W3C WAI Media Players](https://www.w3.org/WAI/media/av/player/)

The radio catalogue contains project-preview audio only. It collects no listening analytics, location, advertising profile, protected characteristic, third-party credentials, or external broadcast account data. The UI does not impersonate or affiliate with iHeartRadio, Rova, MediaWorks, or any third-party broadcaster.

Visual review completed on a 1280px desktop viewport and a 375px compact mobile viewport. The station catalogue reflows from three cards to a single touch-oriented column; play, save, and station-selection controls retain clear labels and touch-sized targets. Full device validation still depends on the user’s actual browser, output route, accessibility tools, and network.
