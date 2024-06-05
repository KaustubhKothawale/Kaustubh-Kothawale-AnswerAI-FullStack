import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isUsernameTouched, setIsUsernameTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validateUsername = (username) => {
    return username.length >= 3;
  };
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (isUsernameTouched && !validateUsername(e.target.value)) {
      setUsernameError('Username must be at least 3 characters long.');
    } else {
      setUsernameError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (isPasswordTouched && !validatePassword(e.target.value)) {
      setPasswordError('Password must be at least 8 characters long, and include at least one number, one uppercase letter, and one special character.');
    } else {
      setPasswordError('');
    }
  };



  const handleEmailBlur = () => {
    setIsEmailTouched(true);
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleUsernameBlur = () => {
    setIsUsernameTouched(true);
    if (!validateUsername(username)) {
      setUsernameError('Username must be at least 3 characters long.');
    } else {
      setUsernameError('');
    }
  };

  const handlePasswordBlur = () => {
    setIsPasswordTouched(true);
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long, and include at least one number, one uppercase letter, and one special character.');
    } else {
      setPasswordError('');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3002/auth/register', { username, password, email });
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  


  return (
    <div>
      <h2>Register</h2>
      <div className='register-input-grid'>
      <input
        type="text"
        placeholder="Username"
        value={username}
         onChange={handleUsernameChange}
        onBlur={handleUsernameBlur}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        required
      />
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        required
      />
      <div>{isUsernameTouched && usernameError && <p className='register-error-messages ' >{usernameError}</p>}</div>
      <div>{isPasswordTouched && passwordError && <p className='register-error-messages '>{passwordError}</p>}</div>
      <div>{isEmailTouched && emailError && <p className='register-error-messages '>{emailError}</p>}</div>
      </div>
      <button onClick={handleRegister}>Register</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
