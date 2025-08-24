# 💳 Razorpay MERN Payment Gateway

A complete MERN stack application with Razorpay payment integration. This project demonstrates how to integrate Razorpay payment gateway into a React frontend with Node.js backend and MongoDB database.

## ✨ Features

- **Secure Payment Processing** - Integrated with Razorpay payment gateway
- **Real-time Payment Verification** - Server-side signature verification
- **Payment History** - Track all successful payments
- **Multi-currency Support** - INR, USD, EUR
- **Responsive Design** - Modern UI with mobile optimization
- **MongoDB Integration** - Persistent storage of payment records
- **🧪 Mock Payment System** - Test without real payment keys!

## 🚀 Tech Stack

- **Frontend**: React.js, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Payment Gateway**: Razorpay (with fallback to mock system)
- **Styling**: Custom CSS with modern design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- **Optional**: Razorpay account with API keys

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd razorpay-mern
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=your mongo uri
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
PORT=5000
NODE_ENV=development
```

**🎯 Important**: You can leave the Razorpay keys empty to use the mock payment system!

## 🧪 Testing Without Razorpay Keys

### **Option 1: Mock Payment System (Recommended for Development)**
If you don't provide Razorpay API keys, the app automatically switches to mock mode:

1. **No API keys needed** - Just leave them empty in `.env`
2. **Instant testing** - No external dependencies
3. **Full payment flow** - Simulates real payment processing
4. **Database integration** - All payments are saved to MongoDB

### **Option 2: Razorpay Test Keys**
For testing with real Razorpay integration:

1. Sign up at [Razorpay](https://razorpay.com/) (free)
2. Get test mode API keys (start with `rzp_test_`)
3. Update your `.env` file
4. Use test cards for payments

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
```bash
npm run dev
```

2. **In a new terminal, start the React frontend:**
```bash
npm run client
```

3. **Open your browser and navigate to:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Testing the Mock System

1. **Quick test with curl:**
```bash
# Test server health
curl http://localhost:5000/api/health

# Create a mock payment
curl -X POST http://localhost:5000/api/mock-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR"}'

# Check payment history
curl http://localhost:5000/api/payments
```

2. **Use the test script:**
```bash
node test-mock-payment.js
```

## 📱 Usage

### Mock Payment Mode
1. **Enter Payment Amount**: Input the amount you want to test
2. **Select Currency**: Choose from INR, USD, or EUR
3. **Click "Quick Mock Payment"**: Instant test payment
4. **View History**: Check payment history below the form

### Real Razorpay Mode
1. **Enter Payment Amount**: Input the amount you want to pay
2. **Select Currency**: Choose from INR, USD, or EUR
3. **Click "Pay Now"**: This will create a Razorpay order
4. **Complete Payment**: Use Razorpay's secure payment interface
5. **View History**: Check payment history below the form

## 🔒 Security Features

- **Signature Verification**: All payments are verified server-side
- **Environment Variables**: Sensitive data stored in `.env` files
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation of all inputs
- **Mock System Safety**: No real money involved in test mode

## 📊 API Endpoints

- `GET /api/health` - Server health check and mode detection
- `POST /api/create-order` - Create payment order (Razorpay or mock)
- `POST /api/verify-payment` - Verify payment signature
- `GET /api/payments` - Get payment history
- `POST /api/mock-payment` - Quick mock payment (mock mode only)

## 🗄️ Database Schema

```javascript
Payment {
  orderId: String,
  paymentId: String,
  signature: String,
  amount: Number,
  currency: String,
  status: String,
  createdAt: Date
}
```

## 🧪 Testing

### Mock Payment System
- **No external dependencies** required
- **Instant payment processing** simulation
- **Full database integration** for testing
- **Multiple currency support**

### Razorpay Test Mode
- **Test Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

## 📁 Project Structure

```
razorpay-mern/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main component with mock/real payment logic
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server.js              # Express server with dual payment modes
├── test-mock-payment.js   # Test script for mock payments
├── package.json           # Backend dependencies
├── env.example            # Environment variables template
├── setup.js               # Automated setup script
├── .gitignore             # Git ignore rules
└── README.md              # Comprehensive documentation
```

## 🚨 Important Notes

- **Mock mode is perfect for development** - No real money involved
- **Real Razorpay keys are optional** - App works without them
- **MongoDB must be running** - Ensure MongoDB is started before running the app
- **Environment detection** - App automatically detects available payment modes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check if you're in mock or Razorpay mode
5. Use the test script to verify backend functionality

## 🔗 Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
