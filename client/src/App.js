import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [payments, setPayments] = useState([]);
  const [serverMode, setServerMode] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    fetchPayments();
    checkServerMode();
  }, []);

  const checkServerMode = async () => {
    try {
      const response = await axios.get('/api/health');
      setServerMode(response.data.mode);
    } catch (error) {
      console.error('Error checking server mode:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      const data = response.data;

      // ✅ ensure payments is always an array
      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data.payments)) {
        setPayments(data.payments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const orderResponse = await axios.post('/api/create-order', {
        amount: parseFloat(amount),
        currency
      });

      const order = orderResponse.data;

      if (serverMode === 'Mock Payment System') {
        await handleMockPayment(order);
      } else {
        await handleRazorpayPayment(order);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create payment order' });
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async (order) => {
    try {
      setMessage({ type: 'info', text: 'Processing mock payment...' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const verifyResponse = await axios.post('/api/verify-payment', {
        orderId: order.id,
        paymentId: 'mock_payment_' + Date.now(),
        signature: 'mock_signature_' + Math.random().toString(36).substr(2, 9),
        amount: parseFloat(amount),
        currency
      });

      if (verifyResponse.data.verified) {
        setMessage({ type: 'success', text: 'Mock payment successful! (This was a test payment)' });
        setAmount('');
        fetchPayments();
      } else {
        setMessage({ type: 'error', text: 'Mock payment verification failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Mock payment failed' });
    }
  };

  const handleRazorpayPayment = async (order) => {
    try {
      const options = {
        // eslint-disable-next-line no-undef
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'Your Company Name',
        description: 'Payment for services',
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post('/api/verify-payment', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: parseFloat(amount),
              currency
            });

            if (verifyResponse.data.verified) {
              setMessage({ type: 'success', text: 'Payment successful!' });
              setAmount('');
              fetchPayments();
            } else {
              setMessage({ type: 'error', text: 'Payment verification failed' });
            }
          } catch (error) {
            setMessage({ type: 'error', text: 'Payment verification failed' });
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#667eea'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initialize Razorpay payment' });
    }
  };

  const handleQuickMockPayment = async () => {
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Processing quick mock payment...' });

    try {
      const response = await axios.post('/api/mock-payment', {
        amount: parseFloat(amount),
        currency
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Quick mock payment completed! (This was a test payment)' });
        setAmount('');
        fetchPayments();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Quick mock payment failed' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ safe filters
  const filteredPayments = Array.isArray(payments)
    ? payments.filter(payment =>
        (filterCurrency === 'ALL' || payment.currency === filterCurrency) &&
        (filterStatus === 'ALL' || payment.status?.toLowerCase().includes(filterStatus.toLowerCase()))
      )
    : [];

  // ✅ safe summary
  const paymentSummary = Array.isArray(payments)
    ? payments.reduce((acc, payment) => {
        acc.total += payment.amount || 0;
        acc.count += 1;
        acc.byCurrency[payment.currency] =
          (acc.byCurrency[payment.currency] || 0) + (payment.amount || 0);
        return acc;
      }, { total: 0, count: 0, byCurrency: {} })
    : { total: 0, count: 0, byCurrency: {} };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all payment history?')) return;
    setShowLoader(true);
    try {
      await axios.delete('/api/payments');
      setPayments([]);
      setMessage({ type: 'success', text: 'Payment history cleared!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear payment history' });
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="card">
          <h1>💳 Payment Gateway</h1>
          <p>Test your payments with our secure payment system</p>

          {serverMode && (
            <div className={`mode-indicator ${serverMode === 'Mock Payment System' ? 'mock' : 'razorpay'}`}>
              <strong>Mode:</strong> {serverMode}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="button-group">
            <button className="btn" onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>

            {serverMode === 'Mock Payment System' && (
              <button
                className="btn btn-secondary"
                onClick={handleQuickMockPayment}
                disabled={loading}
                style={{ marginLeft: '10px' }}
              >
                Quick Mock Payment
              </button>
            )}
          </div>

          {showLoader && (
            <div className="loader">
              <div className="spinner"></div>
              <span>Processing...</span>
            </div>
          )}

          {message && (
            <div className={`message ${message.type === 'success' ? 'success' : message.type === 'error' ? 'error' : 'info'}`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="card payment-history">
          <h2>
            Payment History
            <span className="badge">{filteredPayments.length}</span>
          </h2>
          <div className="summary">
            <strong>Total Payments:</strong> {paymentSummary.count} <br />
            <strong>Total Amount:</strong> {paymentSummary.total} <br />
            <strong>By Currency:</strong>
            {Object.entries(paymentSummary.byCurrency).map(([cur, amt]) => (
              <span key={cur} className="currency-badge">{cur}: {amt}</span>
            ))}
          </div>
          <div className="filters">
            <label>
              Currency:
              <select value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)}>
                <option value="ALL">All</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label>
              Status:
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ALL">All</option>
                <option value="success">Success</option>
                <option value="mock">Mock</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            {serverMode === 'Mock Payment System' && (
              <button className="btn btn-danger" onClick={handleClearHistory}>Clear History</button>
            )}
          </div>
          {filteredPayments.length === 0 ? (
            <p>No payments found</p>
          ) : (
            filteredPayments.map((payment, index) => (
              <div key={index} className="payment-item">
                <h4>
                  Payment #{index + 1}
                  <span className={`status-badge ${payment.status?.includes('success') ? 'success' : 'error'}`}>
                    {payment.status}
                  </span>
                </h4>
                <p><strong>Order ID:</strong> {payment.orderId}</p>
                <p><strong>Payment ID:</strong> {payment.paymentId}</p>
                <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                <p><strong>Date:</strong> {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
