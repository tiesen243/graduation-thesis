## @rozumari/api@0.0.18

### Fix various UI errors and component rendering glitches:

- Resolved layout alignment and spacing issues in core UI components.
- Updated skeleton fallbacks to match exact component structures.
- Improved overall visual stability and edge-case handling.

## @rozumari/api@0.0.17

### Add schedules management and schedule creation pages

- Added schedules view with weekly navigation, skeleton loading, and empty states
- Created form for setting up medication dispensing schedules with compartment items and time pickers
- Updated API contracts and UI components to support schedule management

### Implement user and admin dashboards with real-time analytics charts and low stock alerts.

- Added `AdminDashboard` component featuring medication schedule metrics, device connectivity status, and alert logs using Shadcn Charts.
- Added `UserDashboard` component displaying daily dose schedules, device status, notifications, and low-stock medicine compartment alerts.
- Added in-memory repository implementations and contracts for dashboard data querying.

## @rozumari/api@0.0.16

### Add Notification API

- Introduced new Notification API endpoints for managing and delivering notifications.
- Added API contracts, schemas, and request/response DTOs for notification payloads.

### Add Notification UI

- Implemented a new Notification UI component for displaying notifications to users.

## @rozumari/api@0.0.15

### Restructure application architecture:

- Reorganize directory structure and module layout for better maintainability.
- Refactor infrastructure layers and dependency injection logic.

## @rozumari/api@0.0.14

### Summary of Changes

- **`@rozumari/firmware`**: Added core firmware modules and essential hardware communication logic.
- **`@rozumari/api`**: Completed core functional APIs and main endpoint implementations.
- **Packages Patch Bump**: Patch update across `@rozumari/web`, `@rozumari/contract`, `@rozumari/ui`, `@rozumari/lib`, and `@rozumari/mobile` to align dependency versions.

## @rozumari/api@0.0.13

### Added core features and database migrations

- **Firmware**: Implemented core firmware functionalities for device interaction.
- **Schedule**: Added full schedule management support across API, Web, and Contracts.
- **Database**: Applied new database migrations.

## @rozumari/api@0.0.12

### Added user management feature

- Added UpdateUserDto and DeleteUserDto, PATCH /api/users/:id and DELETE /api/users/:id endpoints in contract
- Added email and role fields to ListUsersDto output
- Implemented UpdateUserUseCase (update user role) and DeleteUserUseCase (soft delete) in apps/api
- Added users management page with DataTable in apps/web, edit user role dialog (RadioGroup) and delete user dialog (AlertDialog)

### Heading

## @rozumari/api@0.0.11

### Added update device feature

- Added UpdateDeviceDto and PATCH /api/devices/:id endpoint in contract (name, position)
- Implemented UpdateDeviceUseCase in apps/api (update device nickname and position)
- Added update device dialog UI in apps/web DeviceInfo Configure button

### Added link device feature

- Added LinkDeviceDto and POST /api/devices/:id/link endpoint in contract
- Implemented LinkDeviceUseCase in apps/api (link unlinked device to current user)
- Added link device dialog UI in apps/web (user inputs device id)

## @rozumari/api@0.0.10

### Added change password feature

- Added change password contract (DTO + endpoint)
- Implemented change password use case with OAuth account creation support
- Added session invalidation on password change
- Added change password page in web app
- Added navigation to change password in sidebar user menu

## @rozumari/api@0.0.9

### Added forgot password features

- Added send email using Resend
- Added welcome email
- Added send forgot password email
- Added reset password functionality

## @rozumari/api@0.0.8

### Added Facebook OAuth authentication provider.

- Integrated Facebook OAuth 2.0 flow into the authentication infrastructure.
- Added user profile retrieval (`id`, `name`, `picture`, `email`) via Facebook Graph API v26.0.
- Fixed query parameters formatting for HTTP requests and resolved PKCE `code_verifier` validation issues.

## @rozumari/api@0.0.7

### Added device sse

## @rozumari/api@0.0.6

### Add device management module

- Introduce endpoints to list all devices and fetch a device by ID
- Add contract schemas and linting configurations for device endpoints

### Layout & Navigation

- **Landing Page:** Added initial landing page layout.
- **Dashboard:** Implemented dashboard layout with responsive sidebar navigation.
- **Authentication Flows:** Added automatic route redirection based on user auth status:
  - Authenticated users -> Redirect to `/dashboard`
  - Unauthenticated users -> Redirect to `/login`

## @rozumari/api@0.0.5

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/api@0.0.4

### Core Authentication & Authorization System

- Added `login`, `register`, and `whoami` API endpoints.
- Introduced `authMiddleware` to secure protected routes and handle user sessions.

### Complete Auth features & UI

- **Authentication Core (`@rozumari/api`):**
  - Implemented core auth flow endpoints: `login`, `register`, `refresh`, and `whoami`.
  - Added OAuth support with **Google Sign-In**.

- **User Interface (`@rozumari/web`):**
  - Added interactive UI forms for **Login** and **Registration**.
  - Integrated Google OAuth login button into the auth UI.
  - Added auto token refresh mechanism on **401 Unauthorized** errors.

### OAuth 2.0 Integration with Google

- Added Google OAuth 2.0 authentication endpoints (`redirect` and `callback`).
- Integrated secure PKCE/State validation using HttpOnly cookies with CSRF protection.
- Handled dynamic user provisioning and automated Google account linking.

## @rozumari/api@0.0.3

### Added

- **Security**: Added a secret key requirement to both password hashing and verification functions for enhanced security.
- **Testing**: Added comprehensive unit tests for `encoding` helpers, `Password` utilities, and `JWT` handling.

### Fixed

- **Database**: Fixed a logical operator bug in the query builder where `OR` was incorrectly used instead of `AND` when constructing `WHERE` clauses.

## @rozumari/api@0.0.2

### Patch Changes

- Add Google OAuth support to API
- Refactor dependency injection for storage infrastructure

## @rozumari/api@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
