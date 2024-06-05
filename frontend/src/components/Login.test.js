import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

jest.mock('axios');

test('Login component renders and handles login', async () => {
  const onLoginMock = jest.fn();
  const responseMessage = { data: { token: 'testtoken' } };
  axios.post.mockResolvedValue(responseMessage);

  const { getByPlaceholderText, getByRole } = render(
    <MemoryRouter>
      <Login onLogin={onLoginMock} />
    </MemoryRouter>
  );

  fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testuser' } });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password' } });

  fireEvent.click(getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(onLoginMock).toHaveBeenCalledWith('testtoken');
  });
});
