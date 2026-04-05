[English](https://github.com/tiesen243/graduation-thesis/blob/main/docs/README.en.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/main/docs/README.vi.md)

# Graduation Thesis: Design of a Smart Pillbox for Seniors

<p align="center">
  <a href="https://github.com/tiesen243/graduation-thesis/releases">
    <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/api/package.json&label=version@api" alt="Version API">
  </a>
  <a href="https://github.com/tiesen243/graduation-thesis/releases">
    <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/web/package.json&label=version@web" alt="Version Web">
  </a>
  <a href="https://github.com/tiesen243/graduation-thesis/releases">
    <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=apps/mobile/package.json&label=version@mobile" alt="Version Mobile">
  </a>
  <a href="https://github.com/tiesen243/graduation-thesis/releases">
    <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=packages/firmware/package.json&label=version@firmware" alt="Version Firmware">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/tiesen243/graduation-thesis" alt="License">
  </a>
</p>

## Introduction

The system automatically opens the designated pill compartment at scheduled times, broadcasts audio reminders, and sends notifications to caregivers if the patient misses a dose or takes medication from the incorrect compartment.

**Course Code:** [code]

**Supervisor:** Tran Hong Vinh

**Group:** [name]

**Members:**

| **ID**   | **Name**   | **Email** | **Role** |
| -------- | ---------|-- | -------- |
| 22653991 | Tran Tien | tiesen243@tiesen.id.vn | Software |
| \_       | Dao Anh Huy| | Hardware |

## System Architecture

The system consists of three main components:

1. **Hardware**: The pillbox is equipped with a microcontroller, servo motors for opening compartments, a speaker for audio reminders, and sensors to detect if the compartment has been opened.

2. **Software**: The software component includes a scheduling system to manage medication times, a notification system to alert caregivers, and an interface for users to input their medication schedules.

3. **Communication**: The system uses wireless communication (Wi-Fi) to connect the hardware and software components, allowing for real-time updates and notifications.

## Features

- **Automated Compartment Opening**: The system automatically opens the correct compartment at the scheduled time.
- ...

## Project Structure

```plain
├── apps/
│   ├── api/                # API endpoints for managing medication schedules and notifications
│   ├── web/                # Web interface for users to input medication schedules and view notifications
│   └── mobile/             # Mobile application for caregivers to receive notifications
├── packages/
│   ├── firmware/           # Firmware for the microcontroller controlling the pillbox
│   ├── pcb/                # Design files for the printed circuit board (PCB)
│   └── proteus/            # Simulation files for testing the hardware design
├── docs/                   # Documentation for the project
└── README.md               # Project overview and instructions
```

## Conclusion

This smart pillbox system aims to improve medication adherence among seniors, providing a convenient and reliable way to manage their medication schedules while offering peace of mind to caregivers. Future work may include integrating additional features such as voice recognition for user interaction and expanding the system to support multiple users in a household.

## License

This project is open-source and available under the Apache License 2.0. See the [LICENSE](./LICENSE) file for more details.
