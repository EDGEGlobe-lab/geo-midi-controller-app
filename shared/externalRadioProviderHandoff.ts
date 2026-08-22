export const externalRadioProviderHandoff = {
  label: "Open iHeartRadio",
  url: "https://www.iheart.com/",
  mode: "external-provider-destination" as const,
  autoplay: false,
  embedsThirdPartyStream: false,
  relaysThirdPartyAudio: false,
};

export function isSafeExternalRadioProviderHandoff(
  handoff = externalRadioProviderHandoff
) {
  const url = new URL(handoff.url);
  return (
    url.protocol === "https:" &&
    handoff.mode === "external-provider-destination" &&
    !handoff.autoplay &&
    !handoff.embedsThirdPartyStream &&
    !handoff.relaysThirdPartyAudio
  );
}
