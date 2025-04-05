import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavInf from '../components/NavInf';
import Footer from '../components/Footer';
import './Chat.css'; // <--- Estilos separados

const Chat = () => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const mockChats = [
            {
                id: 1,
                name: 'Diverso Sports',
                lastMessage: 'Listo, entonces te tengo las camisetas.',
                time: '8:18 PM',
                unreadCount: 9,
                avatar: '/camiseta.avif',
                pinned: true
            },
            {
                id: 2,
                name: 'Juan López',
                lastMessage: 'Tengo una oferta para ti',
                time: '7:30 PM',
                unreadCount: 0,
                avatar: '/camiseta.avif',
            },
            {
                id: 3,
                name: 'Hernán Oviedo',
                lastMessage: 'Entonces son tres docenas de camisetas, ¿verdad?',
                time: 'Ayer',
                unreadCount: 8,
                avatar: '/camiseta.avif',
                pinned: true
            },
            {
                id: 4,
                name: 'María Pérez',
                lastMessage: 'Estoy interesada en las camisetas de la tienda.',
                time: 'Mar 25',
                unreadCount: 99,
                avatar: '/camiseta.avif'
            },
        ];
        setChats(mockChats);
    }, []);

    return (
        <>
            <Header />
            <div className="chat-container">
                <h2 className="chat-title">Mis Chats</h2>
                <div className="chat-list">
                    {chats.map((chat) => (
                        <div className="chat-item" key={chat.id}>
                            <img src={chat.avatar} alt="avatar" className="chat-avatar" />
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
                                <div className="chat-message">{chat.lastMessage}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <NavInf selected="messages" />
            <Footer />
        </>
    );
};

export default Chat;
