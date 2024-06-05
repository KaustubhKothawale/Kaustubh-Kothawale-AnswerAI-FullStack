import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Chat from './Chat';
import { io } from 'socket.io-client';

jest.mock('axios');
jest.mock('socket.io-client');

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

test('Chat component renders and fetches user info', async () => {
  const user = { username: 'testuser', email: 'testuser@example.com', tokenUsage: 10, tokenUsageLimit: 100 };
  axios.get.mockResolvedValueOnce({ data: user });

  const socketMock = {
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
  };
  io.mockReturnValue(socketMock);

  const { getByText } = render(
    <MemoryRouter>
      <Chat token="testtoken" onLogout={() => {}} />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(getByText('testuser')).toBeInTheDocument();
    expect(getByText('testuser@example.com')).toBeInTheDocument();
  });
});

test('Chat component sends a message and receives a response', async () => {
  const socketMock = {
    on: jest.fn(),
    emit: jest.fn((event, payload, callback) => {
      if (event === 'sendMessage') {
        callback({ data: { sessionId: 'testSessionId' } });
      }
    }),
    close: jest.fn(),
  };
  io.mockReturnValue(socketMock);

  axios.get.mockResolvedValueOnce({ data: { username: 'testuser', email: 'testuser@example.com' } });
  axios.get.mockResolvedValueOnce({ data: [] });

  const { getByPlaceholderText, getByRole } = render(
    <MemoryRouter>
      <Chat token="testtoken" onLogout={() => {}} />
    </MemoryRouter>
  );

  fireEvent.change(getByPlaceholderText('Type a message...'), { target: { value: 'Hello' } });
  fireEvent.click(getByRole('button', { name: /send/i }));

  await waitFor(() => {
    expect(socketMock.emit).toHaveBeenCalledWith('sendMessage', { message: 'Hello' }, expect.any(Function));
  });

  // Check if the response callback was invoked and state was updated accordingly
  expect(socketMock.emit).toHaveBeenCalled();
  expect(socketMock.emit.mock.calls[0][0]).toBe('sendMessage');
  expect(socketMock.emit.mock.calls[0][1]).toEqual({ message: 'Hello' });
  expect(socketMock.emit.mock.calls[0][2]).toBeInstanceOf(Function);
});
