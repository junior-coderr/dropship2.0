import OtpInput from 'react-otp-input';
import { motion } from 'framer-motion';

const StyledOTPInput = ({ value, onChange, numInputs = 4, disabled = false }) => {
  return (
    <OtpInput
      value={value}
      onChange={onChange}
      numInputs={numInputs}
      disabled={disabled}
      renderInput={(props) => (
        <motion.input
          {...props}
          whileFocus={{ scale: 1.05 }}
          initial={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      )}
      containerStyle="flex gap-3 justify-center"
      inputStyle={{
        width: '56px',
        height: '56px',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        fontSize: '24px',
        fontWeight: '500',
        textAlign: 'center',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#F9FAFB',
      }}
      focusStyle={{
        border: '2px solid #53D695',
        boxShadow: '0 0 0 4px rgba(83, 214, 149, 0.1)',
        background: '#FFFFFF',
        transform: 'translateY(-2px)',
      }}
    />
  );
};

export default StyledOTPInput;
