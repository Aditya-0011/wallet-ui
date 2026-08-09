# Wallet UI

The financial dashboard for the platform.

[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

The wallet UI acts as the financial dashboard interface for the platform. It interacts securely with the `wallet` gRPC backend via the API gateway to let you manage balances, track transaction histories, and oversee the platform's financial operations.

## Architecture

This section explains the technologies and physical layout of the wallet UI.

- **Framework**: Built with React 19 and compiled using Vite for hot-module replacement
- **Package manager**: Managed and executed using `bun`
- **Styling**: Styled with Tailwind CSS v4, utilizing `shadcn` tooling and `@base-ui/react` primitives
- **State**: Uses `@tanstack/react-query` for asynchronous state management and `@tanstack/react-form` for complex form handling
- **Data Grids**: Implements highly interactive, paginated financial tables using `@tanstack/react-table`
- **Routing**: Client-side navigation handled by React Router v8

### Project structure

- `public/`: Static assets
- `src/`: React component source code
- `index.html`: Application entrypoint template
- `package.json`: Dependencies and scripts
- `vite.config.ts`: Vite configuration

## Features

This section outlines the capabilities of the wallet UI.

- **Performance**: Bootstrapped with Vite and React 19 Compiler plugins for rendering performance.
- **Design**: Built using `@base-ui/react` and Tailwind CSS, with dynamic theming support.
- **Reactive data**: Uses TanStack Query to provide optimistic updates, caching, and background data synchronization.
- **Type-safe validation**: Forms and API responses validate strictly on the client side using `zod`.
- **Financial Precision**: Relies on `bignumber.js` to ensure zero floating-point precision loss when calculating and rendering transaction balances.

## Platform routing

The wallet dashboard is structured around these core financial entities:

- `/dashboard`: The high-level overview of balances and financial health
- `/transactions`: Add, edit, and track the detailed history of all transactions
- `/categories`: Manage the taxonomy of income and spending categories

## Getting started

This section explains how to run the wallet UI locally.

### Prerequisites

- [Bun](https://bun.sh/) to manage dependencies and run scripts

### Configuration

Export these variables directly in your `.env` file:

| Variable              | Description                                              | Required |
| :-------------------- | :------------------------------------------------------- | :------: |
| `VITE_AUTH_API_URL`   | Endpoint for the public auth API routes                  | **Yes**  |
| `VITE_WALLET_API_URL` | Endpoint for the public wallet API routes                | **Yes**  |
| `VITE_CONSOLE_URL`    | Base URL of the deployed console UI                      | **Yes**  |
| `Development`         | Boolean flag setting the environment to development mode |    No    |

### Running locally

Install dependencies and start the development server:

```bash
bun install
bun run dev
```

### Build for production

Compile the application into static HTML, CSS, and JS assets for deployment:

```bash
bun run build
```
