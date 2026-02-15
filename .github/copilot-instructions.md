# GitHub Copilot Instructions for TCW1

## Project Overview

TCW1 is a full-stack interactive web application for managing cryptocurrency (Bitcoin, Ethereum, USDT) and PayPal payments with wallet functionality. The application includes real-time features like chat and video calls powered by WebRTC and Socket.io.

**Live Demo**: https://tcw1.org  
**API Endpoint**: https://api.tcw1.org

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express with TypeScript
- **Real-time**: Socket.io for WebSocket connections
- **Crypto Libraries**: bitcoinjs-lib, ethers.js
- **Authentication**: Passport.js with Google OAuth 2.0, JWT
- **Database**: MongoDB with Mongoose
- **Security**: bcryptjs for password hashing, speakeasy for 2FA
- **Email**: SendGrid integration
- **Payment**: PayPal API integration

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS3 with modern features (gradients, animations)
- **Routing**: React Router v7
- **Real-time**: Socket.io-client
- **Video**: simple-peer for WebRTC
- **HTTP Client**: Axios

## Project Structure

```
TCW1/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server entry point
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middleware (auth, CORS, rate limiting)
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic layer
│   │   └── types/             # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # Global styles and animations
│   │   ├── main.tsx           # React entry point
│   │   ├── components/        # React components
│   │   ├── services/          # API client services
│   │   ├── types/             # TypeScript interfaces
│   │   └── styles/            # Additional CSS files
│   ├── index.html
│   ├── package.json
│   └── vite.config.mts
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD deployment workflow
│
└── [Documentation Files]
    ├── README.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── QUICK_START.md
```

## Coding Standards

### TypeScript
- **Strict Mode**: Always use TypeScript strict mode
- **Type Safety**: Prefer explicit types over `any`. Use proper interfaces and types
- **Async/Await**: Use async/await over promises for better readability
- **Error Handling**: Always wrap async operations in try-catch blocks

### Code Style
- **Naming Conventions**:
  - Components: PascalCase (e.g., `WalletDashboard.tsx`)
  - Files: kebab-case for routes, camelCase for services
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Interfaces: PascalCase with descriptive names
- **Imports**: Group imports (React, external libraries, internal modules)
- **Comments**: Use JSDoc for functions, inline comments for complex logic only

### React Conventions
- **Functional Components**: Use functional components with hooks
- **Component Structure**: Props interface first, then component definition
- **State Management**: Use React hooks (useState, useEffect, useContext)
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleClick`)

### Backend Conventions
- **Route Organization**: Separate routes by domain (wallet, PayPal, auth)
- **Service Layer**: Business logic in services, not in routes
- **Middleware**: Use Express middleware for cross-cutting concerns
- **Error Responses**: Consistent error response format with status codes

## Development Workflow

### Setup
```bash
# Backend setup
cd backend && npm install
npm run dev  # Runs on port 3001

# Frontend setup (in new terminal)
cd frontend && npm install
npm run dev  # Runs on port 3000
```

### Building
```bash
# Backend build
cd backend && npm run build  # Compiles TypeScript to dist/

# Frontend build
cd frontend && npm run build  # Creates optimized production build
```

### Testing
- Currently using manual testing and verification
- When adding tests, follow existing patterns in the repository
- Test files should be colocated with source files or in `__tests__` directories

### Linting
```bash
# Frontend linting
cd frontend && npm run lint
```

## API Design

### Endpoint Structure
- **Base URL**: `/api` prefix for all API routes
- **Versioning**: Not currently versioned (future: `/api/v1`)
- **REST Conventions**: 
  - GET for reading data
  - POST for creating resources
  - PUT/PATCH for updates
  - DELETE for removals

### Response Format
```typescript
// Success response
{
  success: true,
  data: { ... },
  message?: string
}

// Error response
{
  success: false,
  error: string,
  message?: string
}
```

### Authentication
- JWT tokens for API authentication
- Google OAuth 2.0 for user login
- Passport.js strategies for authentication
- 2FA support with speakeasy

## Security Considerations

### Critical Security Rules
- **Never commit secrets**: Use environment variables for all sensitive data
- **Input Validation**: Validate and sanitize all user inputs
- **CORS**: Configure properly for production domains
- **Rate Limiting**: Apply rate limiting to prevent abuse
- **Password Security**: Always hash passwords with bcrypt (min 10 rounds)
- **SQL Injection**: Use parameterized queries/ORM methods only
- **XSS Prevention**: Sanitize data before rendering in React

### Environment Variables
- Use `.env` files for local development (never commit these)
- Use `.env.example` or `.env.template` for documentation
- Azure App Service configuration for production secrets

## Deployment

### Azure App Service
The application is deployed to Azure App Service:
- **Frontend**: tcw1-frontend.azurewebsites.net
- **Backend**: tcw1-backend.azurewebsites.net
- **Custom Domain**: Configured via Cloudflare DNS

### Deployment Process
```bash
# Deploy both apps
./deploy.sh both

# Deploy individually
./deploy.sh frontend
./deploy.sh backend

# Monitor deployment
./monitor.sh yourdomain.com
```

### CI/CD
- GitHub Actions workflow in `.github/workflows/deploy.yml`
- Automatic deployment on push to main branch
- Build and test before deployment

## Real-time Features

### WebSocket Events
- **Connection**: Established via Socket.io on app load
- **Chat**: Real-time messaging between users
- **Notifications**: Transaction updates, payment confirmations
- **Video Calls**: WebRTC signaling through Socket.io

### Implementation Notes
- Socket.io server runs alongside Express on backend
- Frontend connects with `socket.io-client`
- Use `socket.emit()` to send events
- Use `socket.on()` to listen for events
- Always handle disconnection gracefully

## Payment Integration

### Cryptocurrency
- **Bitcoin**: Using bitcoinjs-lib for address generation and transactions
- **Ethereum**: Using ethers.js for blockchain interactions
- **USDT**: Tether on Ethereum blockchain

### PayPal
- PayPal REST API integration
- Sandbox mode for development
- Production credentials required for live deployment

## Common Tasks

### Adding a New API Endpoint
1. Define route in `backend/src/routes/[domain].routes.ts`
2. Implement business logic in `backend/src/services/[domain].service.ts`
3. Add TypeScript types in `backend/src/types/index.ts`
4. Update API client in `frontend/src/services/api.ts`
5. Test the endpoint manually or with tests

### Adding a New Component
1. Create component file in `frontend/src/components/`
2. Define props interface
3. Implement functional component with hooks
4. Add CSS in `App.css` or component-specific file
5. Export and use in parent components

### Database Operations
1. Define schema in `backend/src/models/`
2. Use Mongoose methods for CRUD operations
3. Handle errors properly with try-catch
4. Index frequently queried fields

## Documentation

### Key Documentation Files
- **README.md**: Project overview, quick start, basic usage
- **ARCHITECTURE.md**: System architecture, deployment diagrams
- **DEPLOYMENT.md**: Detailed Azure deployment instructions
- **QUICK_START.md**: 30-minute setup guide
- **BLOCKCHAIN_FEATURES.md**: Cryptocurrency integration details
- **CLOUDFLARE_SETUP.md**: DNS and domain configuration
- **GOOGLE_OAUTH_SETUP.md**: OAuth configuration guide

### When to Update Documentation
- New features or major changes
- API endpoint additions/modifications
- Configuration changes
- Deployment process updates

## Known Limitations

### Demo/Development Nature
This is primarily a demonstration application. For production use, implement:
- Comprehensive test coverage
- Database connection pooling and optimization
- Proper error logging and monitoring
- Professional email service integration
- Real blockchain network integration (currently uses testnet/mock)
- Enhanced security measures and auditing
- Horizontal scaling capabilities

## Tips for Copilot

### When Writing Code
- Follow existing patterns in the codebase
- Maintain consistent code style with existing files
- Use TypeScript types from existing type definitions
- Preserve existing error handling patterns
- Keep components focused and reusable

### When Modifying Code
- Make minimal changes to accomplish the task
- Don't refactor unrelated code
- Preserve existing functionality
- Update related tests if they exist
- Consider backward compatibility

### When Debugging
- Check browser console for frontend errors
- Review backend logs for API errors
- Verify environment variables are set
- Check CORS configuration for cross-origin issues
- Ensure ports 3000 and 3001 are available

## Getting Help

### Resources
- Project Issues: https://github.com/xxd232/TCW1/issues
- Documentation: See docs in repository root
- Azure Docs: https://learn.microsoft.com/azure
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

### Common Problems
- **Port in use**: Kill process on port 3000/3001
- **Module not found**: Run `npm install` in correct directory
- **CORS errors**: Check CORS_ORIGIN environment variable
- **Build failures**: Verify Node.js version (18+)
- **TypeScript errors**: Check tsconfig.json configuration
