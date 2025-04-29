import React, { useState, useRef, useEffect } from 'react';
import './UserChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faPaperclip, faArrowLeft, faCircleStop } from '@fortawesome/free-solid-svg-icons';

const initialMessages = [
  { type: 'text', text: 'Look, I wanted to work today...', sender: 'left' },
  { type: 'text', text: 'Are you really sure?', sender: 'right' },
  { type: 'product', product: { title: 'Camiseta Diverso', quantity: 10, sizes: 'XL, XXL', image: '/camiseta.avif' }, sender: 'right' },
  { type: 'product', product: { title: 'Camiseta Diverso', quantity: 10, sizes: 'XL, XXL', image: '/camiseta.avif' }, sender: 'left' },
  { type: 'text', text: 'Do you feel that there is nothing to do', sender: 'right' },
  { type: 'text', text: 'Perhaps...', sender: 'left' },
  { type: 'text', text: 'Let\'s go out to see the latest exhibition', sender: 'left' },
  { type: 'text', text: 'Are you really sure?', sender: 'right' }
];

export default function UserChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const chunksRef = useRef([]);
  const chatEndRef = useRef(null); // Para scroll automático

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'text', text: input.trim(), sender: 'right' }]);
    setInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);

        setMessages(prev => [...prev, { type: 'audio', audio: audioURL, sender: 'right' }]);
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
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const handleSendProduct = () => {
    setMessages(prev => [...prev, {
      type: 'product',
      product: { title: 'Nueva Camiseta', quantity: 5, sizes: 'M, L', image: '/camiseta.avif' },
      sender: 'right'
    }]);
  };

  const renderMessage = (msg, index) => {
    if (msg.type === 'text') {
      return (
        <div key={index} className={`chat-message ${msg.sender}`}>
          {msg.text}
        </div>
      );
    }

    if (msg.type === 'audio') {
      return (
        <div key={index} className={`chat-message ${msg.sender}`}>
          <audio controls src={msg.audio} />
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
        <button className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} className="back-icon" />
        </button>
        <div className='chat-header-info'>
            <h1>Diverso Sports</h1>
            <p>En línea</p>
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
          onChange={e => setInput(e.target.value)}
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
