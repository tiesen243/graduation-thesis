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
