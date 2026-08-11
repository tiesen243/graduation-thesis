## @rozumari/oxlint@0.0.3

### Add device management module

- Introduce endpoints to list all devices and fetch a device by ID
- Add contract schemas and linting configurations for device endpoints

## @rozumari/oxlint@0.0.2

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/oxlint@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
