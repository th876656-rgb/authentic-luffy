import React from 'react';
import { MessageCircle } from 'lucide-react';
import './MessengerChatBubble.css';

const MessengerChatBubble = () => {
    const messengerUrl = 'https://www.facebook.com/messages/t/108426057420816';

    return (
        <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="messenger-bubble"
            aria-label="Chat với chúng tôi trên Messenger"
        >
            <MessageCircle size={28} />
            <span className="bubble-pulse"></span>
        </a>
    );
};

export default MessengerChatBubble;
