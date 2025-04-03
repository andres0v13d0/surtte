import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import NavInf from '../components/NavInf';
import Footer from '../components/Footer';

const Chat = () => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            const mockChats = [
                { id: 1, name: 'Juan', lastMessage: 'Hola, ¿cómo estás?' },
                { id: 2, name: 'María', lastMessage: '¿Qué tal el proyecto?' },
                { id: 3, name: 'Carlos', lastMessage: 'Nos vemos mañana.' },
            ];
            setChats(mockChats);
        };

        fetchChats();
    }, []);

    return (
        <>
            <Header />
            <div style={styles.container}>
                <h2>Mis Chats</h2>
                <div style={styles.chatList}>
                    {chats.map((chat) => (
                        <div key={chat.id} style={styles.chatItem}>
                            <div style={styles.chatName}>{chat.name}</div>
                            <div style={styles.lastMessage}>{chat.lastMessage}</div>
                        </div>
                    ))}
                </div>
            </div>
            <NavInf selected="messages" />
            <Footer />
        </>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    chatList: {
        marginTop: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        overflow: 'hidden',
    },
    chatItem: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        cursor: 'pointer',
        backgroundColor: '#f9f9f9',
    },
    chatName: {
        fontWeight: 'bold',
    },
    lastMessage: {
        color: '#555',
        fontSize: '14px',
    },
};

export default Chat;