# Deployment Verification Notes

## 2026-08-22

The configured local port `3000` and the available Manus project domain currently resolve to the separate **GEO Signal concept experience**, not to the cloned `geo-midi-controller-app` repository. Therefore, they cannot be used as evidence that the target repository’s Signals workspace or return-to-start controls have been deployed.

The target repository must be started on its own isolated local port for browser validation. A production deployment should be verified only after the hosting configuration explicitly points to the target repository revision.

## Local Browser Verification

The isolated target application was started on `localhost:3001` and opened with `?view=Signals`. The Signals workspace rendered the read-only GitHub metrics panel, including verified counts, separately labelled target ranges, midpoint thresholds, refresh status, and the repository link.

The persistent **START** control changed the URL from `?view=Signals` to `?view=Arrangement` and returned the content to the Arrangement workspace. This validates the direct return-to-start flow in the target application. It is local browser evidence, not production deployment evidence.

## Local Original-Audio Verification

The three previous preview asset URLs redirected to inaccessible objects. They were replaced with uploaded original project-audio previews. All three updated source paths returned `200 audio/mpeg` through the target application’s storage route.

The Radio workspace loaded the selected original programme with a detected duration of `04:59`. Selecting the **Play Night Drive FM** control explicitly enabled the browser audio graph and advanced the elapsed timer to `00:01`; the button then changed to **Pause Night Drive FM**. This confirms user-initiated local browser playback for the declared original audio source. It does not evidence third-party radio transmission, relay, or provider catalogue access.
