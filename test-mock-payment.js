const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testMockPayment() {
  console.log('🧪 Testing Mock Payment System...\n');

  try {
    // Test 1: Check server health
    console.log('1️⃣ Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server Status:', healthResponse.data.message);
    console.log('🔧 Mode:', healthResponse.data.mode);
    console.log('');

    // Test 2: Create a mock payment
    console.log('2️⃣ Creating mock payment...');
    const paymentResponse = await axios.post(`${BASE_URL}/api/mock-payment`, {
      amount: 100,
      currency: 'INR'
    });
    
    console.log('✅ Mock Payment Result:');
    console.log('   Amount:', paymentResponse.data.savedPayment.amount, paymentResponse.data.savedPayment.currency);
    console.log('   Order ID:', paymentResponse.data.savedPayment.orderId);
    console.log('   Status:', paymentResponse.data.savedPayment.status);
    console.log('');

    // Test 3: Check payment history
    console.log('3️⃣ Checking payment history...');
    const historyResponse = await axios.get(`${BASE_URL}/api/payments`);
    console.log(`✅ Found ${historyResponse.data.length} payments in history`);
    
    if (historyResponse.data.length > 0) {
      const latestPayment = historyResponse.data[0];
      console.log('   Latest Payment:', {
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        status: latestPayment.status,
        date: new Date(latestPayment.createdAt).toLocaleString()
      });
    }
    console.log('');

    // Test 4: Test different amounts and currencies
    console.log('4️⃣ Testing different payment scenarios...');
    const testPayments = [
      { amount: 50, currency: 'USD' },
      { amount: 75, currency: 'EUR' },
      { amount: 200, currency: 'INR' }
    ];

    for (const testPayment of testPayments) {
      console.log(`   Testing ${testPayment.amount} ${testPayment.currency}...`);
      await axios.post(`${BASE_URL}/api/mock-payment`, testPayment);
      console.log(`   ✅ ${testPayment.amount} ${testPayment.currency} payment completed`);
    }
    console.log('');

    // Test 5: Final payment count
    console.log('5️⃣ Final payment count...');
    const finalHistoryResponse = await axios.get(`${BASE_URL}/api/payments`);
    console.log(`✅ Total payments in database: ${finalHistoryResponse.data.length}`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 You can now run the React frontend to see the payments in the UI.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testMockPayment();
}

module.exports = { testMockPayment };
