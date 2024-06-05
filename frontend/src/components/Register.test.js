import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

jest.mock('axios');

test('Register component renders and handles registration', async () => {
  const responseMessage = { data: { message: 'Registration successful' } };
  axios.post.mockResolvedValue(responseMessage);

  const { getByPlaceholderText, getByRole, getByText } = render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testuser' } });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'Password1!' } });
  fireEvent.change(getByPlaceholderText('email'), { target: { value: 'testuser@example.com' } });

  fireEvent.click(getByRole('button', { name: /register/i }));

  await waitFor(() => {
    expect(getByText('Registration successful')).toBeInTheDocument();
  });
});
