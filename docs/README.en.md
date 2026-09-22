[English](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.en.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/README.vi.md)

# Rozumari (ローズマリー): Design of an Assistive Smart Pillbox for the Elderly and Children

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
  <a href="https://github.com/tiesen243/graduation-thesis/releases">
    <img src="https://img.shields.io/github/package-json/v/tiesen243/graduation-thesis?filename=packages/firmware/package.json&label=version@eda" alt="Version EDA">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/tiesen243/graduation-thesis" alt="License">
  </a>
</p>

## Introduction

**Rozumari** is an IoT-enabled smart pillbox system designed to assist elderly individuals and young children in adhering to their daily medication schedules. The system automatically unlocks the appropriate compartment at pre-scheduled times, broadcasts audio reminders, and immediately alerts caregivers if a patient misses a dose or opens the wrong compartment.

- **Course Code:** 422001423801

- **Supervisor:** M.Sc. Tran Hong Vinh

### **Name Origin**

**Rozumari** (ローズマリー) is the Japanese word for **Rosemary** — a herb long renowned in medicine for its ability to **stimulate cognitive function, boost mental clarity, and enhance memory**. Inspired by these characteristics, the project was named **Rozumari** to serve as a reliable "memory assistant," helping elderly users take their medication accurately while compensating for age-related memory decline.

### **Team Members**

| **ID**   | **Name**    | **Email**                | **Role** |
| -------- | ----------- | ------------------------ | -------- |
| 22653991 | Tran Tien   | tiesen243@tiesen.id.vn   | Software |
| 22637811 | Dao Anh Huy | ninjahuykunfbi@gmail.com | Hardware |

## **Key Features**

- **Automated Medication Dispensing:** Medications are automatically dropped from the compartment at scheduled times—users cannot open the box manually.
- **On-Device Display & Audio Alerts:** Features an LCD screen to display dosage details and a built-in buzzer to sound alerts when it is time to take medicine.
- **Smart Drop & Adherence Detection:** Automatically checks if the correct amount of medication has been dropped and monitors whether the patient actually took their dose.
- **Real-Time Caregiver Alerts:** Detects missed doses or dispensing anomalies and immediately synchronizes status reports with the server to notify caregivers via email and in-app notifications.
- **Cross-Platform Management:** Web dashboard and mobile application for remotely configuring schedules, managing prescriptions, and tracking adherence history.

## **System Architecture**

1. **Hardware Layer:** Microcontroller interfaced with servo motors (compartment opening), an audio speaker, and sensors to monitor compartment status.
2. **Software Layer:** Backend REST API service for scheduling, a Web dashboard for management, and a Mobile app with Push Notifications for caregivers.
3. **Communication Layer:** Low-latency Wi-Fi protocol for seamless real-time data sync across hardware, cloud services, and client applications.

## **System Architecture**

1. **Hardware Layer:** Microcontroller interfaced with a motor mechanism for automated medication dispensing, an LCD display, a buzzer alert, and sensors to detect pill count and patient pickup status.
2. **Software Layer:** Backend REST API service for schedule management, a Web dashboard for administration, and a Mobile app that features in-app notification centers and email alert triggers.
3. **Communication Layer:** Low-latency Wi-Fi connection utilizing **Real-Time Streaming** protocols for instant bidirectional data sync between the hardware device, cloud server, and client apps.

## Project Structure

```plain
├── apps/
│   ├── api/        # Backend API service for managing schedules & notifications
│   ├── mobile/     # Mobile app for caregivers to monitor status & receive alerts
│   └── web/        # Web dashboard for schedule configuration & system management
├── packages/
│   ├── contract/   # API contracts & shared TypeScript interfaces/types
│   └── eda/        # Electronic Design Automation (EDA) files & schematics
│   ├── firmware/   # Embedded source code for the pillbox microcontroller
│   ├── lib/        # Shared utility libraries across backend and frontend
│   └── ui/         # Shared UI components & design system for Web/Mobile
├── docs/           # Technical documentation & project thesis reports
└── README.md       # Project overview & quickstart instructions
```

## **Future Enhancements**

- **Automated Medication Inventory Tracking:** Implement computer vision or weight-based sensing to automatically count and track remaining pill quantities inside the box, eliminating manual inventory input.
- **Enhanced Medication Verification:** Upgrade from simple infrared (IR) beam-break detection to AI/Camera-based optical recognition to verify whether dropped items are actually medication (preventing false positives from foreign objects).
- **Voice Interaction System:** Integrate voice recognition and audio prompts for direct, hands-free interaction with elderly users.
- **Multi-User Profile Management:** Expand hardware and software capacity to support personalized dispensing schedules for multiple users in a single household.
- **Adherence Analytics:** Utilize machine learning to analyze patient adherence trends and predict potential missed dosage patterns.

## Conclusion

The **Rozumari** system, provides a comprehensive, hardware-software integrated solution aimed at solving medication non-adherence among senior citizens. By replacing manual medication sorting with secure automated dispensing, real-time sensor verification, and multi-channel remote alerts, the system minimizes human error and reduces health risks associated with forgotten or duplicate doses. Furthermore, it delivers peace of mind to family members and caregivers through transparent status tracking, contributing to better long-term healthcare management for elderly individuals living independently.

## License

This project is open-source and available under the Apache License 2.0. See the [LICENSE](https://github.com/tiesen243/graduation-thesis/blob/dev/LICENSE) file for more details.
