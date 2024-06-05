import React, { useState, useEffect , useRef} from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Chat.css';

const Chat = ({ token, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3002/auth/user', {
        headers: { Authorization: token }
      });
      setUser(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:3002/sessions/history', {
        headers: { Authorization: token }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching session history:', error);
    }
  };
  // update user info and session history on initial load
  useEffect(() => {
    fetchUserInfo();
    fetchSessions();
  }, [token,sessionId,messages]);
  // use effeact to scroll to bottom of chat window
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  // use effect to connect to socket server
  useEffect(() => {
    const newSocket = io('http://localhost:3002', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => prevMessages[prevMessages.length-1].sender === 'bot' ? [...prevMessages.slice(0,prevMessages.length-1), { sender: 'bot', text: prevMessages[prevMessages.length-1].text + message.text }] : [...prevMessages, message]);
    });
    newSocket.on('sessionId', (data) => {
      setSessionId(data.sessionId);
    });
    newSocket.on('end _of_response', () => {
      fetchUserInfo();
    });

    newSocket.on('messageError', (error) => {
      console.error('Message error:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setLoading(true);
    try {
      const payload = {
        message: input
      };
      if (sessionId) {
        payload.sessionId = sessionId;
      }
      socket.emit('sendMessage', payload, (response) => {
        setLoading(false);
        if (response.error) {
          console.error('Error sending message:', response.error);
        }
        console.log("socket emit response",response);
        setSessionId(response.data.sessionId);
      });
      // const response = await axios.post('http://localhost:3002/chat', payload,{headers: { Authorization: token }});
      // const botMessage = { sender: 'bot', text: response.data.reply };
      // setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
        if(error.response.status === 429){
            const errorMessage = { sender: 'bot', text: error.response.data.message };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }else{
            console.error('Error sending message:', error);
            const errorMessage = { sender: 'bot', text: 'Something went wrong. Please try again.' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    } finally {
      setLoading(false);
      fetchUserInfo();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleSessionClick = (session) => {
    fetchSessions();
    setSelectedSession(session);
    setSessionId(session.sessionId);
    setMessages(session.chat.map(chat => ({ sender: 'user', text: chat.message, timestamp: chat.timestamp }))
      .concat(session.chat.map(chat => ({ sender: 'bot', text: chat.response, timestamp: chat.timestamp })))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  const newSession = () => {
    setSessionId(null);
    setMessages([]);
    setSelectedSession(null);
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="user-info">
          {user && (
            <>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
              <p>Daily usage: {user.tokenUsage}/{user.tokenUsageLimit}</p>
            </>
          )}
        </div>
        <button onClick={newSession}>New Session</button>
        <button onClick={onLogout}>Logout</button>
        <div className="session-history">
          <h3>Session History</h3>
          {sessions.slice().reverse().map(session => (
            <div key={session._id} className="session" onClick={() => handleSessionClick(session)}>
              <p>{formatDate(session.chat[0]?.timestamp)}</p>
              <p style={{fontSize:'12px'}}>Session ID: {session.sessionId}</p>
              
            </div>
          ))}
        </div>
      </div>
      <div className="main-chat">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} style={{alignItems:"flex-end"}} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message bot">Loading...</div>}
          <div ref={messagesEndRef} />
        </div >
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
          {/* <button onClick={onLogout}>Logout</button> */}
        </div>
      </div>
    </div>
  );
};

export default Chat;
