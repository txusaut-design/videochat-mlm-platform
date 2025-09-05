import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend running'
  });
});

// Endpoint de registro corregido
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  
  // Simular registro exitoso
  res.json({ 
    success: true, 
    data: {
      user: {
        id: '1',
        username: req.body.username,
        email: req.body.email,
        walletAddress: req.body.walletAddress,
        hasActiveMembership: false,
        referralCode: 'REF123',
        created_at: new Date().toISOString()
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token'
    },
    message: 'User registered successfully'
  });
});

// Endpoint de login corregido
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  res.json({ 
    success: true, 
    data: {
      user: {
        id: '1',
        username: 'testuser',
        email: req.body.email,
        hasActiveMembership: false
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token'
    },
    message: 'Login successful'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});