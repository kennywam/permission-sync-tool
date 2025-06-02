# Contributing to Permission Sync Tool

Thank you for considering contributing to the Permission Sync Tool! This document outlines the process and guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Conventional Commits

This project follows the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). All commit messages must adhere to this format to ensure clear communication and automated versioning.

### Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

The **header** is mandatory and must conform to the following format:

- **type**: What kind of change is this commit making? (required)
- **scope**: What part of the codebase does this commit modify? (optional)
- **description**: A short description of the change (required)

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Scope

The scope is optional and should be the name of the module affected (as perceived by the person reading the changelog).

#### Examples

```
feat(roles): add ability to specify custom conditions
fix(sync): resolve unique constraint error on permission creation
docs(readme): update installation instructions
```

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Submit a pull request.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   npm run install-db
   ```
4. Build the project:
   ```
   npm run build
   ```

## Running Tests

```
npm test
```

## Linting

```
npm run lint
```

## Formatting

```
npm run format
```

Thank you for contributing to Permission Sync Tool!
