import React from 'react';
import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';

jest.mock('axios');

// Mock window.alert
window.alert = jest.fn();

test('VerifyEmail component renders and verifies email', async () => {
  const responseMessage = { data: { message: 'Email verified successfully' } };
  axios.get.mockResolvedValue(responseMessage);

  const { getByText } = render(
    <MemoryRouter initialEntries={['/verify-email?token=testtoken']}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(getByText('Verifying email...')).toBeInTheDocument();

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Email verified successfully');
  });
});
