# Rent Invoice Monorepo

A professional monorepo setup for the Rent Invoice application.

## Project Structure

```
root/
├── frontend/        # React + Vite + TypeScript frontend
├── backend/         # Backend placeholder (Node.js/Express)
├── shared/          # Shared types and utilities
├── docs/            # Documentation
├── scripts/         # Build and deployment scripts
├── package.json     # Root package.json with scripts
└── README.md
```

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Placeholder (to be implemented)
- **Shared**: TypeScript types and utilities

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend:
   ```bash
   npm run dev
   ```
4. For backend (placeholder):
   ```bash
   npm run backend
   ```

## Development

- `npm run dev` - Start frontend development server
- `npm run frontend` - Start frontend
- `npm run backend` - Start backend (placeholder)
- `npm run build` - Build frontend for production
- `npm run test` - Run frontend tests

## Folder Structure Details

### Frontend
```
frontend/src/
├── assets/          # Static assets
├── components/      # Reusable UI components
│   ├── ui/          # Shadcn/ui components
│   └── common/      # Common components
├── features/        # Feature-specific components
│   ├── invoice/     # Invoice related components
│   └── dashboard/   # Dashboard components
├── layouts/         # Layout components
├── pages/           # Page components
├── routes/          # Routing configuration
├── services/        # API services
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── styles/          # Global styles
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

### Backend (Placeholder)
```
backend/
├── src/
│   ├── controllers/ # Route controllers
│   ├── routes/      # API routes
│   ├── models/      # Data models
│   ├── services/    # Business logic
│   ├── middlewares/ # Express middlewares
│   ├── config/      # Configuration
│   └── utils/       # Utilities
├── package.json
└── README.md
```

### Shared
```
shared/
├── types/           # Shared TypeScript types
└── utils/           # Shared utility functions
```
