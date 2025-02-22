'use client';
import { useState } from 'react';
import { X, ArrowLeft } from 'phosphor-react';
import { useAuth } from '@/context/AuthContext';
import StyledOTPInput from './OTPInput';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuthDrawer({ isOpen, onClose }) {
  const [step, setStep] = useState('phone'); // phone, otp, name
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const slideAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setError('');
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          phone
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      setStep('otp');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          phone,
          otp
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      if (data.isNewUser) {
        setStep('name');
      } else {
        signIn(data.user, data.token);
        toast.success('Successfully logged in!');
        resetForm();
        onClose();
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          phone,
          name
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      signIn(data.user, data.token);
      toast.success('Account created successfully!');
      resetForm();
      onClose();
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ 
            type: "spring", 
            duration: 0.3,
            bounce: 0.15
          }}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(step === 'otp' || step === 'name') && (
                  <button
                    onClick={() => {
                      if (step === 'name') {
                        setStep('otp');
                      } else {
                        setStep('phone');
                        setOtp('');
                      }
                    }}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={20} className="text-gray-500" />
                  </button>
                )}
                <h2 className="text-xl font-semibold text-gray-900">
                  {step === 'phone' && 'Login / Register'}
                  {step === 'otp' && 'Enter OTP'}
                  {step === 'name' && 'Complete Registration'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-6">
            <AnimatePresence mode="wait">
              {step === 'phone' && (
                <motion.form 
                  key="phone-form"
                  {...slideAnimation}
                  onSubmit={handlePhoneSubmit} 
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 flex">
                      <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full rounded-r-lg border border-gray-300 px-4 py-3 focus:border-[#53D695] focus:ring-[#53D695]"
                        placeholder="Enter your phone number"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="w-full rounded-full bg-[#53D695] px-6 py-3.5 text-white font-medium hover:bg-[#53D695]/90 disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                  )}
                </motion.form>
              )}

              {step === 'otp' && (
                <motion.form 
                  key="otp-form"
                  {...slideAnimation}
                  onSubmit={handleOtpSubmit} 
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter verification code sent to
                    </label>
                    <p className="text-lg font-medium text-gray-900 mb-6">+91 {phone}</p>
                    <StyledOTPInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={4}
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 4}
                    className="w-full rounded-full bg-[#53D695] px-6 py-3.5 text-white font-medium hover:bg-[#53D695]/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handlePhoneSubmit}
                      className="text-[#53D695] font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  </p>
                  {error && (
                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                  )}
                </motion.form>
              )}

              {step === 'name' && (
                <motion.form 
                  key="name-form"
                  {...slideAnimation}
                  onSubmit={handleNameSubmit} 
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#53D695] focus:ring-[#53D695]"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#53D695] px-6 py-3.5 text-white font-medium hover:bg-[#53D695]/90 disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Complete Registration'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
