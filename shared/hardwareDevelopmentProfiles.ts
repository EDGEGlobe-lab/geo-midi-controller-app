export const hardwareDevelopmentProfiles = [
  {
    id: "esp32",
    label: "ESP32 controller",
    category: "Microcontroller",
    description: "Draft an Arduino-style sketch for a user-owned ESP32 project before any local build or flash action.",
    localRequirement: "User-authorised local companion and USB-attached board required for compile or flash.",
    templateFilename: "parkway_esp32_controller.ino",
    template: `// PARKWAY ESP32 project template\n// Local build and flash only. No remote device control.\n\nconstexpr int statusLedPin = 2;\n\nvoid setup() {\n  pinMode(statusLedPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(statusLedPin, HIGH);\n  delay(250);\n  digitalWrite(statusLedPin, LOW);\n  delay(750);\n}`,
  },
  {
    id: "microchip",
    label: "Microchip MCU project",
    category: "Microcontroller",
    description: "Prepare a minimal C source scaffold for a user-owned Microchip microcontroller project.",
    localRequirement: "Use the manufacturer-supported local toolchain and explicitly select the target board before programming.",
    templateFilename: "parkway_microchip_main.c",
    template: `/* PARKWAY Microchip MCU project template\n * Build and programming happen locally after explicit device selection.\n */\n\n#include <stdint.h>\n\nint main(void) {\n  for (;;) {\n    /* Add board-specific initialisation in the authorised local project. */\n  }\n  return 0;\n}`,
  },
  {
    id: "motherboard",
    label: "Motherboard software notes",
    category: "Computer platform",
    description: "Document firmware, driver, or operating-system integration work without writing to motherboard firmware.",
    localRequirement: "PARKWAY does not modify BIOS, UEFI, boot settings, drivers, or motherboard power controls.",
    templateFilename: "parkway_platform_notes.md",
    template: `# PARKWAY platform integration notes\n\n- Target platform: user-defined\n- Local test environment: user-defined\n- Recovery plan: record before any local firmware or driver change\n- PARKWAY boundary: no remote BIOS/UEFI, driver, or power control\n`,
  },
  {
    id: "memory-reader",
    label: "Memory-card reader workflow",
    category: "Removable-media workflow",
    description: "Prepare a local software workflow for an approved removable-media reader without inspecting card contents in PARKWAY.",
    localRequirement: "Do not upload raw card images, private files, credentials, or keys. Review files locally before choosing a project asset.",
    templateFilename: "parkway_media_reader_notes.md",
    template: `# PARKWAY removable-media workflow\n\n1. Attach the reader locally and verify the intended medium.\n2. Review files locally; do not share raw card contents with PARKWAY.\n3. Add only a chosen, rights-cleared project asset through the project asset library.\n4. Eject the medium safely using the local operating system.\n`,
  },
] as const;

export type HardwareDevelopmentProfile = (typeof hardwareDevelopmentProfiles)[number];

export function getHardwareDevelopmentProfile(profileId: string) {
  return hardwareDevelopmentProfiles.find((profile) => profile.id === profileId) ?? hardwareDevelopmentProfiles[0];
}
