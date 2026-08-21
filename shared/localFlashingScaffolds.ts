export const localFlashingScaffoldArchives = [
  {
    id: "esp32",
    label: "ESP32 local practice scaffold",
    filename: "parkway-esp32-practice-scaffold.zip",
    archiveUrl: "/manus-storage/parkway-esp32-practice-scaffold_0ae677ef.zip",
    sourceLabel: "Arduino-style status and practice loop",
    localStep: "Select your user-owned ESP32 and USB port locally before building or flashing.",
  },
  {
    id: "microchip",
    label: "Microchip local practice scaffold",
    filename: "parkway-microchip-practice-scaffold.zip",
    archiveUrl: "/manus-storage/parkway-microchip-practice-scaffold_799878c9.zip",
    sourceLabel: "Neutral C source and local target-selection guide",
    localStep: "Select the target MCU and programmer in a manufacturer-supported local toolchain.",
  },
] as const;

export type LocalFlashingScaffoldId = (typeof localFlashingScaffoldArchives)[number]["id"];

export function getLocalFlashingScaffold(id: string) {
  return localFlashingScaffoldArchives.find((scaffold) => scaffold.id === id) ?? localFlashingScaffoldArchives[0];
}
