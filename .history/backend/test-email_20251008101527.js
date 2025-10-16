const { sendPasswordResetEmail, sendWelcomeEmail } = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing email service...\n');

  // Test 1: Welcome Email
  console.log('📧 Test 1: Sending welcome email...');
  try {
    const welcomeResult = await sendWelcomeEmail('test@example.com', 'Test User');
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📧 Message ID:', welcomeResult.messageId);
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }
  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Password Reset Email
  console.log('🔐 Test 2: Sending password reset email...');
  try {
    const resetResult = await sendPasswordResetEmail('test@example.com', 'test-token-123');
    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Message ID:', resetResult.messageId);
    } else {
      console.log('❌ Password reset email failed:', resetResult.error);
    }
  } catch (error) {
    console.log('❌ Password reset email error:', error.message);
  }

  console.log('\n🎉 Email testing completed!');
  process.exit(0);
}

testEmail();
