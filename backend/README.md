// README.md
# VideoChat MLM Platform - Backend

## 🚀 Features

- **user.Authentication**: JWT-based authentication system
- **Video Chat Rooms**: Real-time video chat with up to 10 participants
- **MLM System**: 5-level commission structure
- **Blockchain Integration**: USDC payments on Polygon network
- **Real-time Communication**: WebRTC + Socket.IO
- **Admin Panel**: Complete administration interface
- **Automated Payments**: Smart commission distribution

## 🛠 Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL
- **Real-time**: Socket.IO + WebRTC
- **Blockchain**: Ethers.js + Polygon + USDC
- **Authentication**: JWT
- **Caching**: Redis (optional)

## 📦 Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Setup PostgreSQL database
5. Run migrations: `npm run db:migrate`
6. Start development server: `npm run dev`

## 🗄 Database Setup

```sql
-- Create database
CREATE DATABASE videochat_mlm;

-- Run the schema from database_schema.sql
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - user.registration
- `POST /api/auth/login` - user.login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Rooms
- `GET /api/rooms` - Get all active rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room

### Payments
- `GET /api/payments/wallet-info` - Get payment info
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### MLM
- `GET /api/mlm/stats` - Get MLM statistics
- `GET /api/mlm/referral-link` - Get referral link
- `GET /api/mlm/commissions` - Get commissions

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/user.` - Get all user.
- `GET /api/admin/transactions` - Get transactions

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 🚀 Deployment

1. Build: `npm run build`
2. Start: `npm start`
3. Setup reverse proxy (nginx)
4. Configure SSL certificate
5. Setup process manager (PM2)

## 📝 License

MIT License