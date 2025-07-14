# Workspace Setup Guide

This project requires the following tools and versions:

## Prerequisites

- **Java Version:** 17 or higher (LTS recommended)
- **Node.js Version:** 18.x or higher (LTS recommended)
- **React:** Managed via project dependencies (see package.json)
- **User:** Ensure you are using a user account with sufficient permissions to install software and run builds.

## Checking Your Versions

### Check Java Version
```sh
java -version
```
- Output should show `17` or higher (e.g., `openjdk version "17.0.8"`)

### Check Node.js Version
```sh
node -v
```
- Output should show `v18.x` or higher

### Check npm Version
```sh
npm -v
```
- Output should show `8.x` or higher

## Installation

### Install Java (if not already installed)
- **Windows:**
  - Download from [Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/)
  - Follow the installer instructions
- **macOS:**
  - Use [Homebrew](https://brew.sh/):
    ```sh
    brew install openjdk@17
    ```
- **Linux:**
  - Use your package manager, e.g.:
    ```sh
    sudo apt-get install openjdk-17-jdk
    ```

### Install Node.js (if not already installed)
- **Windows/Mac/Linux:**
  - Download from [Node.js Downloads](https://nodejs.org/en/download/)
  - Choose the LTS version (18.x or higher)
  - Follow the installer instructions
  - Alternatively, use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) for easy version switching:
    ```sh
    nvm install 18
    nvm use 18
    ```

## React Setup
- React and related dependencies are managed via the project's `package.json`.
- To install all dependencies, run:
```sh
npm install
```

## User Account
- Use a user account with permissions to install and run Java and Node.js.
- If using a shared or CI environment, ensure the correct user context is set.

## Troubleshooting
- If you encounter version issues, check your `PATH` and `JAVA_HOME`/`NODE_HOME` environment variables.
- For further help, see the official [Java Documentation](https://docs.oracle.com/en/java/) and [Node.js Documentation](https://nodejs.org/en/docs/).

