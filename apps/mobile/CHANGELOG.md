## @rozumari/mobile@0.0.15

### Bug Fixes

- Fix App Links domain verification failed state by adding missing `http` scheme to Expo `intentFilters`
- Ensure `android:autoVerify="true"` attribute is correctly generated in `AndroidManifest.xml`

## @rozumari/mobile@0.0.14

### Config Deep Linking for Web and Mobile

- Add Universal Links and App Links configuration for Expo mobile app (`com.rozumari.mobile`) and Web (`rozumari.vercel.app`).
- Add `.well-known` configuration files (`apple-app-site-association` and `assetlinks.json`) for deep link domain verification.
- Implement URL route mapping between Web React Router (`/dashboard/*`) and Mobile Expo Router routes (`/(tabs)/*`).
- Add `redirectSystemPath` handler to parse and map incoming web URLs to corresponding app screens seamlessly.

## @rozumari/mobile@0.0.13

### Bug figs

- Failed to install `tools` on `android-actions/setup-android`

## @rozumari/mobile@0.0.12

### Schedule Management Enhancements

- Added full schedule management capabilities across Web and Mobile, including creating, editing, and listing schedules.
- Supported compartment item slot selection with quantity and required flag configurations.
- Refactored date range selection logic for seamless date picking.
- Standardized UI components (`InputGroup`, form fields) for parity between Web and React Native.
- Fixed `ON CONFLICT` database queries to properly update `is_required` status on existing schedule items.
- Fixed pull-to-refresh behavior on empty schedule list views in Mobile.

## @rozumari/mobile@0.0.10

### Added BLE Device Configuration & Fixed Multi-byte Payload Transmission

- Added BLE device configuration features and timezone-aware sync time selection.

- Fixed multi-byte BLE frame handling on React Native to correctly parse 16-bit device info payloads without truncation

- Upgraded firmware communication handlers to support 3-byte data frames for transmitting complete configuration states (UTC, language, and sync time)

- Optimized configuration builder and parser logic with robust fallback mechanisms to eliminate default value bottlenecks and parsing errors

## @rozumari/mobile@0.0.9

### Bug Fixes

- Added missing postinstall script to build all dependencies packages.

## @rozumari/mobile@0.0.8

### Bug Fixes & Improvements

- **Branding:** Updated app icon branding for both web and mobile applications.
- **Fix:** Fixed timezone offset issues affecting schedule timing and notifications.

## @rozumari/mobile@0.0.7

### Patch Changes

- **@rozumari/mobile**: Added BLE connection handling with Bluetooth permissions and device state checks.
- **@rozumari/ui**: Added `Select` component supporting single/multi-selection with bottom sheet modal UI.

## @rozumari/mobile@0.0.6

### Bug Fixes

- Infinite loop in the root

## @rozumari/mobile@0.0.5

### Bug Fixes

- Add root `index.tsx` route to prevent `Unmatched Route` errors on production builds
- Merge theme initialization and auth redirect logic in root layout effect

## @rozumari/mobile@0.0.4

### Fix action

- Add automatic artifact downloading from EAS
- Update mobile release workflow triggers

## @rozumari/mobile@0.0.3

### Feature Additions & Mobile Navigation Restructuring

### `@rozumari/api`

- Added endpoint for fetching unread notifications count.

### `@rozumari/web`

- Fixed and polished UI layouts and styling across core components.

### `@rozumari/mobile`

- Added schedule viewing feature.
- Implemented notification management flow (list view and detail inspector).
- Restructured navigation architecture: organized root-level tabs with nested stack navigators for improved screen isolation and deep linking.

### Setup & Migration

- Set up the mobile app architecture with Expo, React Native, and Uniwind, and migrated key UI components from Web (Shadcn UI / Base-UI) to React Native.
- **Expo & Uniwind Integration**: Initialized Expo architecture with Uniwind styling and Metro bundler configuration.

### Component Migration

- **`Typography`**: Added `TypographyContext` to prevent style recursion and implemented native A11y roles (`header`, `aria-level`).
- **`Card`**: Converted layout from CSS Grid to Flexbox; isolated `CardTitle` and `CardDescription` via `Typography` to eliminate selector recursion.
- **`Avatar`**: Refactored to Flexbox with auto-scaling container support (`size-*`) and active image load state handling (`isLoaded`, `hasError`).
- **`Checkbox`**: Replaced Web primitives with `Pressable` and `lucide-react-native`; added native touch target sizes and A11y states.
- **`Input`**: Migrated to `TextInput` with explicit padding resets (`p-0`), JS-driven focus rings, and proper `placeholderTextColor` mapping.
- **`RadioGroup`**: Introduced context-driven state management and expanded touch target bounds across both control and label.

## @rozumari/mobile@0.0.2

### Summary of Changes

- **`@rozumari/firmware`**: Added core firmware modules and essential hardware communication logic.
- **`@rozumari/api`**: Completed core functional APIs and main endpoint implementations.
- **Packages Patch Bump**: Patch update across `@rozumari/web`, `@rozumari/contract`, `@rozumari/ui`, `@rozumari/lib`, and `@rozumari/mobile` to align dependency versions.

## @rozumari/mobile@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
