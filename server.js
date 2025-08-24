import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Razorpay from 'razorpay';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dhruvjain527:s5X0lzGxT9gKdLxc@cluster0.4epxn5k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
console.log('🔗 Connecting to MongoDB:', mongoUri);
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Razorpay instance (only if keys are provided and not dummy)
function isDummyKey(key) {
  if (!key) return true;
  const dummyPatterns = [
    'your_key_id', 'your_key_secret', 'rzp_test_YOUR_KEY_ID', 'rzp_test_YOUR_KEY_SECRET'
  ];
  return dummyPatterns.some(pattern => key.includes(pattern));
}

let razorpay = null;
if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  !isDummyKey(process.env.RAZORPAY_KEY_ID) &&
  !isDummyKey(process.env.RAZORPAY_KEY_SECRET)
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay integration enabled');
} else {
  console.log('⚠️  Razorpay keys not found or are dummy - using mock payment system');
}

// Payment Schema
const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  signature: String,
  amount: Number,
  currency: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Mock payment functions
const generateMockOrder = (amount, currency) => {
  return {
    id: 'mock_order_' + Date.now(),
    amount: amount * 100,
    currency: currency,
    receipt: 'mock_receipt_' + Date.now(),
    status: 'created'
  };
};

const generateMockPayment = (orderId, amount, currency) => {
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: 'mock_payment_' + Date.now(),
    razorpay_signature: 'mock_signature_' + Math.random().toString(36).substr(2, 9)
  };
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    mode: razorpay ? 'Razorpay' : 'Mock Payment System'
  });
});

// Create order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (razorpay) {
      // Real Razorpay integration
      const options = {
        amount: amount * 100,
        currency,
        receipt: 'receipt_' + Date.now(),
      };
      try {
        const order = await razorpay.orders.create(options);
        res.json(order);
      } catch (err) {
        // Enhanced error handling for authentication issues
        if (err.statusCode === 401 && err.error && err.error.code === 'BAD_REQUEST_ERROR') {
          console.error('❌ Razorpay authentication failed. Check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.');
          return res.status(401).json({
            error: 'Razorpay authentication failed. Please check your API keys.',
            details: err.error.description
          });
        }
        console.error('Error creating Razorpay order:', err);
        return res.status(500).json({ error: 'Failed to create Razorpay order', details: err.error?.description || err.message });
      }
    } else {
      // Mock payment system
      const mockOrder = generateMockOrder(amount, currency);
      console.log('📝 Mock order created:', mockOrder);
      res.json(mockOrder);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount, currency } = req.body;
    if (!orderId || !paymentId || !signature || !amount) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }
    
    if (razorpay) {
      // Real Razorpay verification
      const text = orderId + '|' + paymentId;
      // Use dynamic import for crypto in ES modules
      const crypto = await import('crypto');
      const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generated_signature === signature) {
        const payment = new Payment({
          orderId,
          paymentId,
          signature,
          amount,
          currency: currency || 'INR',
          status: 'success'
        });
        await payment.save();
        res.json({ verified: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ verified: false, message: 'Invalid signature' });
      }
    } else {
      // Mock payment verification
      console.log('🔍 Mock payment verification:', { orderId, paymentId, signature });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always succeed in mock mode
      const payment = new Payment({
        orderId,
        paymentId,
        signature,
        amount,
        currency: currency || 'INR',
        status: 'success (mock)'
      });
      await payment.save();
      
      res.json({ 
        verified: true, 
        message: 'Mock payment verified successfully! (This is a test payment)' 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment history
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Clear payment history (mock mode only)
app.delete('/api/payments', async (req, res) => {
  if (!razorpay) {
    try {
      await Payment.deleteMany({});
      res.json({ success: true, message: 'Payment history cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear payment history' });
    }
  } else {
    res.status(403).json({ error: 'Not allowed in Razorpay mode' });
  }
});

// Mock payment endpoint for testing without frontend
app.post('/api/mock-payment', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Create mock order
    const mockOrder = generateMockOrder(amount, currency);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock payment response
    const mockPayment = generateMockPayment(mockOrder.id, amount, currency);
    
    // Save to database
    const payment = new Payment({
      orderId: mockOrder.id,
      paymentId: mockPayment.razorpay_payment_id,
      signature: mockPayment.razorpay_signature,
      amount,
      currency,
      status: 'success (mock)'
    });
    await payment.save();
    
    res.json({
      success: true,
      message: 'Mock payment completed successfully!',
      order: mockOrder,
      payment: mockPayment,
      savedPayment: payment
    });
  } catch (error) {
    console.error('Error in mock payment:', error);
    res.status(500).json({ error: 'Mock payment failed' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  if (!razorpay) {
    console.log(`🧪 Mock payment endpoint: http://localhost:${PORT}/api/mock-payment`);
  }
});
