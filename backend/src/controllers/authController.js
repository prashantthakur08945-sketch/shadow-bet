const supabase = require('../config/supabase');

exports.login = async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      email,
      password,
    });

    if (error) throw error;

    res.status(200).json({ 
      message: 'Logged in successfully', 
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.signup = async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      phone,
      email,
      password,
    });

    if (error) throw error;

    res.status(201).json({ 
      message: 'User created successfully', 
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.error('Error signing up:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { phone, email } = req.body;

  try {
    // In a real app, you would use supabase.auth.signInWithOtp
    // Or call Twilio/MSG91 directly.
    // For this build, we use Supabase Auth for simplicity if configured,
    // otherwise we log the OTP.

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;

    res.status(200).json({ message: 'OTP sent successfully', data });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, email, token } = req.body;

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      email: email,
      token: token,
      type: phone ? 'sms' : 'email',
    });

    if (error) throw error;

    // After verification, Supabase returns a session with JWT.
    res.status(200).json({ 
      message: 'OTP verified', 
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: error.message });
  }
};
