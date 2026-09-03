## @rozumari/web@0.0.17

### Fix various UI errors and component rendering glitches:

- Resolved layout alignment and spacing issues in core UI components.
- Updated skeleton fallbacks to match exact component structures.
- Improved overall visual stability and edge-case handling.

## @rozumari/web@0.0.16

### Add schedules management and schedule creation pages

- Added schedules view with weekly navigation, skeleton loading, and empty states
- Created form for setting up medication dispensing schedules with compartment items and time pickers
- Updated API contracts and UI components to support schedule management

### Implement user and admin dashboards with real-time analytics charts and low stock alerts.

- Added `AdminDashboard` component featuring medication schedule metrics, device connectivity status, and alert logs using Shadcn Charts.
- Added `UserDashboard` component displaying daily dose schedules, device status, notifications, and low-stock medicine compartment alerts.
- Added in-memory repository implementations and contracts for dashboard data querying.

## @rozumari/web@0.0.15

### Add Notification UI

- Implemented a new Notification UI component for displaying notifications to users.

## @rozumari/web@0.0.14

### Summary of Changes

- **`@rozumari/firmware`**: Added core firmware modules and essential hardware communication logic.
- **`@rozumari/api`**: Completed core functional APIs and main endpoint implementations.
- **Packages Patch Bump**: Patch update across `@rozumari/web`, `@rozumari/contract`, `@rozumari/ui`, `@rozumari/lib`, and `@rozumari/mobile` to align dependency versions.

## @rozumari/web@0.0.13

### Added core features and database migrations

- **Firmware**: Implemented core firmware functionalities for device interaction.
- **Schedule**: Added full schedule management support across API, Web, and Contracts.
- **Database**: Applied new database migrations.

## @rozumari/web@0.0.12

### Added user management feature

- Added UpdateUserDto and DeleteUserDto, PATCH /api/users/:id and DELETE /api/users/:id endpoints in contract
- Added email and role fields to ListUsersDto output
- Implemented UpdateUserUseCase (update user role) and DeleteUserUseCase (soft delete) in apps/api
- Added users management page with DataTable in apps/web, edit user role dialog (RadioGroup) and delete user dialog (AlertDialog)

## @rozumari/web@0.0.11

### Added update device feature

- Added UpdateDeviceDto and PATCH /api/devices/:id endpoint in contract (name, position)
- Implemented UpdateDeviceUseCase in apps/api (update device nickname and position)
- Added update device dialog UI in apps/web DeviceInfo Configure button

### Added link device feature

- Added LinkDeviceDto and POST /api/devices/:id/link endpoint in contract
- Implemented LinkDeviceUseCase in apps/api (link unlinked device to current user)
- Added link device dialog UI in apps/web (user inputs device id)

## @rozumari/web@0.0.10

### Added change password feature

- Added change password contract (DTO + endpoint)
- Implemented change password use case with OAuth account creation support
- Added session invalidation on password change
- Added change password page in web app
- Added navigation to change password in sidebar user menu

### Added account page

- Added dashboard account page showing user details from whoami
- Added mock avatar upload (local preview only)
- Added navigation link to Account in sidebar user menu

## @rozumari/web@0.0.9

### Added forgot password features

- Added send email using Resend
- Added welcome email
- Added send forgot password email
- Added reset password functionality

## @rozumari/web@0.0.8

### Added Facebook OAuth authentication provider.

- Integrated Facebook OAuth 2.0 flow into the authentication infrastructure.
- Added user profile retrieval (`id`, `name`, `picture`, `email`) via Facebook Graph API v26.0.
- Fixed query parameters formatting for HTTP requests and resolved PKCE `code_verifier` validation issues.

## @rozumari/web@0.0.7

### Improvements

- Update landing page
- Update form components using FormBuilder

## @rozumari/web@0.0.6

### Added device sse

## @rozumari/web@0.0.5

### Layout & Navigation

- **Landing Page:** Added initial landing page layout.
- **Dashboard:** Implemented dashboard layout with responsive sidebar navigation.
- **Authentication Flows:** Added automatic route redirection based on user auth status:
  - Authenticated users -> Redirect to `/dashboard`
  - Unauthenticated users -> Redirect to `/login`

## @rozumari/web@0.0.4

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/web@0.0.3

### Fix base URL retrieval using Vercel environment variables

- Applied the required `VITE_` prefix to Vercel environment variables so Vite can properly expose them to the client bundle.

## @rozumari/web@0.0.2

### Complete Auth features & UI

- **Authentication Core (`@rozumari/api`):**
  - Implemented core auth flow endpoints: `login`, `register`, `refresh`, and `whoami`.
  - Added OAuth support with **Google Sign-In**.

- **User Interface (`@rozumari/web`):**
  - Added interactive UI forms for **Login** and **Registration**.
  - Integrated Google OAuth login button into the auth UI.
  - Added auto token refresh mechanism on **401 Unauthorized** errors.

### Initialized Web Application Architecture

- **Web App Structure:** Initialized core architecture powered by **React Router v8**, **Tailwind CSS**, and **shadcn/ui**.
- **Monorepo Integration:** Established cross-package linkages across:
  - `@rozumari/web`: Main web application routes and setup.
  - `@rozumari/ui`: Shared component layer with Tailwind and shadcn styling.

## @rozumari/web@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
