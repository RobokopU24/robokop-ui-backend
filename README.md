# ROBOKOP Authentication Service

A secure authentication service built with Node.js, Express, and PostgreSQL, supporting OAuth 2.0 (Google and GitHub) and token-based authentication.

## Features

- OAuth 2.0 Authentication
  - Google OAuth integration
  - GitHub OAuth integration
- JWT Token Validation
- Swagger API Documentation
- Secure Session Management with PostgreSQL
- CORS Protection
- Request Logging with Morgan

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- SSL certificates for HTTPS (for local development)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
SESSION_SECRET=your_session_secret

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# CORS
CORS_ORIGIN=https://localhost:3000

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Obtaining OAuth Credentials

#### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add authorized redirect URIs:
   - `https://localhost:3000/api/auth/google/callback` (for local development)
   - Add your production callback URL when deploying
7. Click "Create"
8. Copy the generated Client ID and Client Secret to your `.env` file

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: `https://localhost:3000` (for local development)
   - Authorization callback URL: `https://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy the generated Client ID
6. Click "Generate a new client secret" and copy the generated secret
7. Add both to your `.env` file

### Other Environment Variables

- `SESSION_SECRET`: Generate a secure random string (you can use `openssl rand -base64 32` in terminal)
- `DATABASE_URL`: Your PostgreSQL connection string
- `CORS_ORIGIN`: The URL of your frontend application
- `PORT`: The port your server will run on (default: 3000)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/robokop-auth-test-postgre.git
cd robokop-auth-test-postgre
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
# The application will automatically create the sessions table if it doesn't exist
```

4. Generate SSL certificates for local development:

```bash
# Place your SSL certificates in the root directory:
# - localhost-key.pem
# - localhost.pem
```

5. Start the server:

```bash
npm start
```

The server will start on `https://localhost:3000`

## API Documentation

Access the Swagger documentation at `https://localhost:3000/api-docs`

### Authentication Endpoints

#### Google OAuth

- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

#### GitHub OAuth

- `GET /api/auth/github` - Initiate GitHub OAuth login
- `GET /api/auth/github/callback` - GitHub OAuth callback

#### Token Validation

- `POST /api/auth/validate-token` - Validate JWT token
  ```json
  {
    "token": "your.jwt.token"
  }
  ```

## Security Features

- HTTPS enabled by default
- Secure session management using PostgreSQL
- CORS protection
- HTTP-only cookies
- JWT token validation

## Development

### Project Structure

```
src/
├── auth/
│   └── passport.ts
├── config/
│   └── index.ts
├── controllers/
│   └── oauthController.ts
├── routes/
│   ├── oauthRoutes.ts
│   ├── passkeyRoutes.ts
│   ├── queryRoutes.ts
│   └── userRoutes.ts
└── server.ts
```

### Running Tests

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
