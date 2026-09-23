## @rozumari/firmware@0.1.5

### Patch Changes

- added buzzer
- fix i18n content

## @rozumari/firmware@0.1.4

### Patch Changes

- supported i18n for firmware

### Patch Changes

- Bump deps

## @rozumari/firmware@0.1.3

### Patch Changes

- Clamp capacity values to a minimum of zero during subtraction mode to prevent negative values.
- Update dispensing logic to track actual dropped item counts and immediately deduct slot capacity upon physical release.

## @rozumari/firmware@0.1.2

### Patch Changes

- Config timeout for drop and open pill box
- Fix default values for create schedule form

## @rozumari/firmware@0.1.1

### Patchs Changes

- added update-capcity api
- completed drop pill workflow

## @rozumari/firmware@0.1.0

### Minor Changes

- Bump all monorepo packages to version 0.1.0 baseline.
- Synchronize core services, clients, and internal shared libraries across the project.

## @rozumari/firmware@0.0.6

### Bug Fixes

- Remove postinstall command
- Bump firmware version

## @rozumari/firmware@0.0.5

### Added BLE Device Configuration & Fixed Multi-byte Payload Transmission

- Added BLE device configuration features and timezone-aware sync time selection.

- Fixed multi-byte BLE frame handling on React Native to correctly parse 16-bit device info payloads without truncation

- Upgraded firmware communication handlers to support 3-byte data frames for transmitting complete configuration states (UTC, language, and sync time)

- Optimized configuration builder and parser logic with robust fallback mechanisms to eliminate default value bottlenecks and parsing errors

## @rozumari/firmware@0.0.4

### Add core hardware and network components:

- Add buzzer module support
- Integrate API client for HTTP communication
- Implement real-time SSE streaming handler

## @rozumari/firmware@0.0.3

### Summary of Changes

- **`@rozumari/firmware`**: Added core firmware modules and essential hardware communication logic.
- **`@rozumari/api`**: Completed core functional APIs and main endpoint implementations.
- **Packages Patch Bump**: Patch update across `@rozumari/web`, `@rozumari/contract`, `@rozumari/ui`, `@rozumari/lib`, and `@rozumari/mobile` to align dependency versions.

## @rozumari/firmware@0.0.2

### Added core features and database migrations

- **Firmware**: Implemented core firmware functionalities for device interaction.
- **Schedule**: Added full schedule management support across API, Web, and Contracts.
- **Database**: Applied new database migrations.

## @rozumari/firmware@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
