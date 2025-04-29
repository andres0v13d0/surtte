import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import NavInf from '../../components/NavInf/NavInf';
import Footer from '../../components/Footer/Footer';
import './Chat.css';

const Chat = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
     

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem('token');
                const usuario = JSON.parse(localStorage.getItem('usuario'));

                if (!usuario || !token) {
                    console.warn('Usuario o token no disponible');
                    return;
                }

                const res = await axios.get('https://api.surtte.com/chat/conversations', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = res.data;

                const chatsFormatted = data.map((convo) => {
                    return {
                        id: convo.userId,
                        name: convo.otherUserName || 'Usuario',
                        lastMessage: convo.lastMessage?.message || '',
                        time: formatDate(convo.lastMessage?.createdAt),
                        timeRaw: convo.lastMessage?.createdAt,
                        unreadCount: convo.unreadCount || 0,
                        pinned: false
                    };
                });

                chatsFormatted.sort((a, b) => new Date(b.timeRaw) - new Date(a.timeRaw));

                setChats(chatsFormatted);
            } catch (err) {
                console.error('Error al traer conversaciones:', err);
            }
        };

        fetchChats();
    }, []);

    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (isYesterday) return 'Ayer';

        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    return (
        <>
            <Header />
            <div className="chat-container">
                <h2 className="chat-title">Mis Chats</h2>
                <div className="chat-list">
                    {chats.length === 0 ? (
                        <p className="no-chats">No tienes conversaciones aún.</p>
                    ) : (
                        chats.map((chat) => (
                            <div
                                className="chat-item"
                                key={chat.id}
                                onClick={() => {
                                    localStorage.setItem('receiverName', chat.name);
                                    navigate(`/messages/user-chat/${chat.id}`);
                                }} 
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="chat-info">
                                    <div className="chat-header">
                                        <span className="chat-name">
                                            {chat.name}
                                            {chat.pinned && <span className="pin-icon">📌</span>}
                                            {chat.unreadCount > 0 && (
                                                <span className="chat-unread"> {chat.unreadCount}</span>
                                            )}
                                        </span>
                                        <span className="chat-time">{chat.time}</span>
                                    </div>
                                    <div className="chat-message">
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(chat.lastMessage);
                                                if (parsed?.type === 'PRODUCT') {
                                                    return `Producto: ${parsed.name || 'desconocido'}`;
                                                }
                                            } catch (e) {}
                                            return chat.lastMessage;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <NavInf selected="messages" />
            <Footer />
        </>
    );
};

export default Chat;
