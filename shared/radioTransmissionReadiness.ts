export const radioTransmissionReadiness = [
  {
    id: "operator-authority",
    label: "Authorised operator and jurisdiction",
    status: "required" as const,
  },
  {
    id: "broadcast-authority",
    label: "Applicable broadcast or transmission authority",
    status: "required" as const,
  },
  {
    id: "music-rights",
    label: "Music rights and reporting model",
    status: "required" as const,
  },
  {
    id: "provider-agreement",
    label: "Written third-party provider agreement",
    status: "required" as const,
  },
  {
    id: "human-release",
    label: "Human launch approval and incident owner",
    status: "required" as const,
  },
] as const;

export function isTransmissionEnabled() {
  return false;
}
