import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import './UserChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faPaperclip, faArrowLeft, faCircleStop, faPlay } from '@fortawesome/free-solid-svg-icons';

export default function UserChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [receiverName] = useState(localStorage.getItem('receiverName') || 'Usuario');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const chunksRef = useRef([]);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://api.surtte.com/chat/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const convo = res.data;
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        const formattedMessages = convo.map((m) => {
          let msg = { sender: m.senderId === usuario.id ? 'right' : 'left' };
          try {
            const parsed = JSON.parse(m.message);
            if (parsed?.type === 'PRODUCT') {
              msg.type = 'product';
              msg.product = {
                title: parsed.name,
                quantity: parsed.quantity,
                sizes: parsed.sizes || 'N/A',
                image: parsed.imageUrl || '/camiseta.avif',
              };
            }
          } catch {
            if (m.messageType === 'AUDIO' && m.fileUrl) {
              msg.type = 'audio';
              msg.audio = m.fileUrl;
            } else {
              msg.type = 'text';
              msg.text = m.message;
            }
          }
          return msg;
        });

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    };

    const checkOnlineStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://api.surtte.com/chat/is-online/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsOnline(res.data);
      } catch (error) {
        console.error('Error verificando estado en línea:', error);
      }
    };

    fetchData();
    checkOnlineStatus();
  }, [id]);

  useEffect(() => {
    const connectSocket = () => {
      const tokenFirebase = localStorage.getItem('token');
      if (!tokenFirebase) return;

      const socket = io('https://api.surtte.com', {
        transports: ['websocket'],
        auth: { token: tokenFirebase },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🟢 Socket conectado');
      });

      socket.on('receiveMessage', (newMessage) => {
        setMessages((prev) => [...prev, parseIncomingMessage(newMessage)]);
        if (Notification.permission === 'granted') {
          new Notification('Nuevo mensaje', {
            body: newMessage.message.length > 50 ? `${newMessage.message.substring(0, 50)}...` : newMessage.message,
          });
        }
      });
    };

    connectSocket();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseIncomingMessage = (m) => {
    try {
      const parsed = JSON.parse(m.message);
      if (parsed?.type === 'PRODUCT') {
        return {
          type: 'product',
          product: {
            title: parsed.name,
            quantity: parsed.quantity,
            sizes: parsed.sizes || 'N/A',
            image: parsed.imageUrl || '/camiseta.avif',
          },
          sender: 'left',
        };
      }
    } catch {}

    if (m.messageType === 'AUDIO' && m.fileUrl) {
      return { type: 'audio', audio: m.fileUrl, sender: 'left' };
    }

    return { type: 'text', text: m.message, sender: 'left' };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const payload = {
      senderId: usuario.id,
      receiverId: parseInt(id),
      message: input.trim(),
      messageType: 'TEXT',
    };

    socketRef.current.emit('sendMessage', payload);
    setMessages((prev) => [...prev, { type: 'text', text: input.trim(), sender: 'right' }]);
    setInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const token = localStorage.getItem('token');

        const signedRes = await axios.post('https://api.surtte.com/chat/upload', {
          filename: `audio-${Date.now()}.webm`,
          mimeType: 'audio/webm',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { signedUrl, finalUrl } = signedRes.data;

        await fetch(signedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'audio/webm',
          },
        });

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        socketRef.current.emit('sendMessage', {
          senderId: usuario.id,
          receiverId: parseInt(id),
          message: '',
          messageType: 'AUDIO',
          fileUrl: finalUrl,
        });

        setMessages((prev) => [...prev, { type: 'audio', audio: finalUrl, sender: 'right' }]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('No se pudo acceder al micrófono');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleButtonClick = () => {
    if (input.trim()) {
      handleSend();
    } else {
      isRecording ? stopRecording() : startRecording();
    }
  };

  const handleSendProduct = () => {
    setMessages((prev) => [...prev, {
      type: 'product',
      product: { title: 'Nueva Camiseta', quantity: 5, sizes: 'M, L', image: '/camiseta.avif' },
      sender: 'right',
    }]);
  };

  const handlePlayAudio = (index, url) => {
    if (playingAudioIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioIndex(null);
      return;
    }
  
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  
    const newAudio = new Audio(url);
    audioRef.current = newAudio;
    setPlayingAudioIndex(index);
  
    newAudio.play();
  
    newAudio.onended = () => {
      setPlayingAudioIndex(null);
      audioRef.current = null;
    };
  };

  const renderMessage = (msg, index) => {
    if (msg.type === 'text') {
      return <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>;
    }
    if (msg.type === 'audio') {
      return (
        <div key={index} className={`chat-message ${msg.sender}`} style={{ display: 'flex', alignItems: 'center' }}>
          <audio id={`audio-${index}`} src={msg.audio} hidden />
          <button onClick={() => handlePlayAudio(index, msg.audio)} className="audio-play-button">
            <FontAwesomeIcon icon={playingAudioIndex === index ? faCircleStop : faPlay} size="lg" />
          </button>
        </div>
      );
    }
    if (msg.type === 'product') {
      return (
        <div key={index} className={`product-sended ${msg.sender}`}>
          <img src={msg.product.image} alt="product" className="product-image" />
          <div className="product-info">
            <h2>{msg.product.title}</h2>
            <p><strong>Cantidad:</strong> {msg.product.quantity}</p>
            <p><strong>Talla:</strong> {msg.product.sizes}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/messages')}>
          <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
        </button>
        <div className='chat-header-info'>
          <h1>{receiverName}</h1>
          <p>{isOnline ? 'En línea' : 'Desconectado'}</p>
        </div>
      </div>

      <div className="chat-body">
        {messages.map(renderMessage)}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-section">
        <button className="share-button" onClick={handleSendProduct}>
          <FontAwesomeIcon icon={faPaperclip} className="share-icon" />
        </button>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleButtonClick}>
          {input.trim() ? (
            <FontAwesomeIcon icon={faPaperPlane} className="send-icon" />
          ) : (
            <FontAwesomeIcon
              icon={isRecording ? faCircleStop : faMicrophone}
              className="send-icon"
              beat={isRecording}
            />
          )}
        </button>
      </div>
    </div>
  );
}
