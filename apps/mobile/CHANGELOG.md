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
