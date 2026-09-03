## @rozumari/ui@0.0.4

### Fix various UI errors and component rendering glitches:

- Resolved layout alignment and spacing issues in core UI components.
- Updated skeleton fallbacks to match exact component structures.
- Improved overall visual stability and edge-case handling.

## @rozumari/ui@0.0.3

### Add schedules management and schedule creation pages

- Added schedules view with weekly navigation, skeleton loading, and empty states
- Created form for setting up medication dispensing schedules with compartment items and time pickers
- Updated API contracts and UI components to support schedule management

### Implement user and admin dashboards with real-time analytics charts and low stock alerts.

- Added `AdminDashboard` component featuring medication schedule metrics, device connectivity status, and alert logs using Shadcn Charts.
- Added `UserDashboard` component displaying daily dose schedules, device status, notifications, and low-stock medicine compartment alerts.
- Added in-memory repository implementations and contracts for dashboard data querying.

## @rozumari/ui@0.0.2

### Summary of Changes

- **`@rozumari/firmware`**: Added core firmware modules and essential hardware communication logic.
- **`@rozumari/api`**: Completed core functional APIs and main endpoint implementations.
- **Packages Patch Bump**: Patch update across `@rozumari/web`, `@rozumari/contract`, `@rozumari/ui`, `@rozumari/lib`, and `@rozumari/mobile` to align dependency versions.

## @rozumari/ui@0.0.1

### Initialized Web Application Architecture

- **Web App Structure:** Initialized core architecture powered by **React Router v8**, **Tailwind CSS**, and **shadcn/ui**.
- **Monorepo Integration:** Established cross-package linkages across:
  - `@rozumari/web`: Main web application routes and setup.
  - `@rozumari/ui`: Shared component layer with Tailwind and shadcn styling.

### Introduced initial suite of 20 core UI components for `@rozumari/ui`:

- **Form Controls:** `Button`, `Checkbox`, `Field`, `Input`, `Label`, `RadioGroup`, `Select`, `Switch`
- **Overlays & Feedback:** `AlertDialog`, `Dialog`, `DropdownMenu`, `Sheet`, `Toast`, `Tooltip`
- **Navigation & Layout:** `Card`, `Separator`, `Sidebar`, `Tabs`
- **Data Display:** `Avatar`, `Skeleton`, `Table`, `Typography`
