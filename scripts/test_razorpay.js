const Razorpay = require('razorpay');
require('dotenv').config({ path: './backend/.env' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testRazorpay() {
  try {
    console.log('Testing Razorpay with ID:', process.env.RAZORPAY_KEY_ID);
    const order = await razorpay.orders.create({
      amount: 1000,
      currency: 'INR',
      receipt: 'test_receipt'
    });
    console.log('Order created successfully:', order.id);
  } catch (err) {
    console.error('Razorpay Test Error:', err);
  }
}

testRazorpay();
