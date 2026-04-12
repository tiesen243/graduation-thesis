[English](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/CONTRIBUTING.md) | [Tiếng Việt](https://github.com/tiesen243/graduation-thesis/blob/dev/docs/CONTRIBUTING.vi.md)

# Contributing to project

First off, thank you for taking the time to contribute! It is people like you who help make this healthcare IoT system better for the elderly.

As this project involves both **Hardware (Mechanical/Circuitry)** and **Software (Web/Cloud)**, please follow these guidelines to maintain a clean and functional repository.

## 1. Before You Start

Before making any changes, please check the [Issues](https://github.com/your-username/your-repo/issues) list:

- **If an issue exists:** Leave a comment letting us know you are working on it to avoid duplicated effort.
- **If no issue exists:** Please [open a new issue](https://github.com/tiesen243/graduation-thesis/issues/new/choose) first to describe the bug you found or the feature you are proposing.

## 2. Our Development Process

1. **Fork** the repository to your own GitHub account.
2. **Clone** the fork to your local machine.
3. Implement your changes and **Commit** them (see Commit Message Standards below).
4. **Push** to your fork and submit a **Pull Request (PR)** to our `dev` branch.
5. Create a new **Branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-name
   ```

## 3. Commit Message Standards (Commitlint)

We follow the **Conventional Commits** specification. Every commit message must be structured as follows:

`<type>(<scope>): <description>`

### Common Types:

- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes (e.g., updating README).
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `chore`: Updating build tasks, package manager configs, etc.

### Valid Examples:

- `feat(api): add endpoint for medication schedules`
- `fix(sensor): recalibrate load cell threshold`
- `docs: add wiring diagram for Raspberry Pi`
- `hw(mechanical): optimize motor torque for pill dispenser`

## 4. Pull Request Requirements

- Provide a clear description of the changes in the PR.
- Link the corresponding issue (e.g., `Closes #12`).
- Ensure code has been tested on hardware (if applicable) or through unit tests for the Web/App.
- Wait for a review and approval from at least one maintainer (**[Author 1 Name]** or **[Author 2 Name]**).

## 5. Licensing

By contributing to this project, you agree that your contributions will be licensed under the **Apache License 2.0** included in this repository.
