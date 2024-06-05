import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import VerifyEmail from './components/VerifyEmail';

// Mocking child components
jest.mock('./components/Login', () => jest.fn(() => <div>Login Component</div>));
jest.mock('./components/Register', () => jest.fn(() => <div>Register Component</div>));
jest.mock('./components/Chat', () => jest.fn(() => <div>Chat Component</div>));
jest.mock('./components/VerifyEmail', () => jest.fn(() => <div>VerifyEmail Component</div>));

describe('App component', () => {
  test('renders Login component by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Component')).toBeInTheDocument();
  });

  test('renders Register component when navigated to /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Register Component')).toBeInTheDocument();
  });

  test('renders VerifyEmail component when navigated to /verify-email', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('VerifyEmail Component')).toBeInTheDocument();
  });

  test('renders Chat component when navigated to /chat with token', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App initialToken="testtoken" />
      </MemoryRouter>
    );

    expect(screen.getByText('Chat Component')).toBeInTheDocument();
  });

  test('redirects to Login component when navigating to /chat without token', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Component')).toBeInTheDocument();
  });
});
