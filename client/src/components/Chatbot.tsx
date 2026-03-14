import { useState, useRef, useEffect } from 'react';
import { HiChatBubbleLeftRight, HiXMark, HiPaperAirplane } from 'react-icons/hi2';
import axiosInstance from '../helpers/axiosInstance';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface QuickQuestion {
    question: string;
    answer: string;
}

// Pre-typed questions and answers
const QUICK_QUESTIONS: QuickQuestion[] = [
    {
        question: "What are your operating hours?",
        answer: "We operate from 9:00 AM to 8:00 PM, Monday through Saturday. Orders can be placed anytime through our platform, and pickup/delivery slots are available during these hours."
    },
    {
        question: "How do I track my order?",
        answer: "You can track your order status in real-time from your order history page. The status will update automatically as your laundry progresses through different stages: Order Placed → Pending → Prepared → Picked Up."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept online payments through Razorpay, which supports credit cards, debit cards, UPI, net banking, and digital wallets. Payment is required before order processing begins."
    },
    {
        question: "Can I cancel my order?",
        answer: "Yes, you can cancel your order if it hasn't been picked up yet. Go to your order history and click the cancel button. Refunds will be processed according to our cancellation policy."
    },
    {
        question: "What is your pricing?",
        answer: "Our pricing varies by item type. You can view all available items and their prices in the catalog when placing an order. Prices are displayed per item, and the total is calculated based on quantity."
    },
    {
        question: "How long does laundry take?",
        answer: "Standard processing time is 24-48 hours from order placement. You'll receive notifications when your order status changes, and you can pick it up once it's marked as 'Prepared'."
    }
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! 👋 I'm here to help you with any questions about U-Laundry. Feel free to ask me anything!",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const addMessage = (text: string, isUser: boolean) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleQuickQuestion = (question: string, answer: string) => {
        addMessage(question, true);
        setTimeout(() => {
            addMessage(answer, false);
        }, 500);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        addMessage(userMessage, true);
        setInputValue('');
        setIsLoading(true);

        try {
            // Check if it's a quick question first
            const quickQuestion = QUICK_QUESTIONS.find(
                q => q.question.toLowerCase() === userMessage.toLowerCase()
            );

            if (quickQuestion) {
                setTimeout(() => {
                    addMessage(quickQuestion.answer, false);
                    setIsLoading(false);
                }, 500);
                return;
            }

            // Send to Groq API via backend
            const { data } = await axiosInstance.post('chatbot/ask', {
                question: userMessage
            });

            addMessage(data.data.answer || "I'm sorry, I couldn't process that request. Please try again.", false);
        } catch (error: any) {
            console.error('Chatbot error:', error);
            const errorMessage = error?.response?.data?.message || "I'm having trouble connecting. Please try again later.";
            addMessage(errorMessage, false);
            toast.error('Failed to get response from chatbot');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-primary/50 ${
                    isOpen ? 'rotate-90' : ''
                }`}
                aria-label="Open chatbot"
            >
                {isOpen ? (
                    <HiXMark className="w-6 h-6" />
                ) : (
                    <HiChatBubbleLeftRight className="w-6 h-6" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[600px] max-h-[calc(100vh-8rem)] bg-surface rounded-2xl shadow-2xl border border-accent/20 flex flex-col animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <HiChatBubbleLeftRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">U-Laundry Assistant</h3>
                                <p className="text-xs text-white/80">We're here to help!</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                        message.isUser
                                            ? 'bg-primary text-white rounded-br-sm'
                                            : 'bg-surface border border-accent/20 text-text rounded-bl-sm'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <p className={`text-xs mt-1 ${
                                        message.isUser ? 'text-white/70' : 'text-muted'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-surface border border-accent/20 rounded-2xl rounded-bl-sm px-4 py-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 border-t border-accent/20 bg-surface/50">
                            <p className="text-xs font-semibold text-muted mb-2">Quick questions:</p>
                            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                                {QUICK_QUESTIONS.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickQuestion(item.question, item.answer)}
                                        className="text-left text-xs px-3 py-2 bg-bg hover:bg-accent/10 rounded-lg border border-accent/20 transition-colors text-text"
                                    >
                                        {item.question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-accent/20 bg-surface">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-bg border border-accent/20 rounded-xl text-text placeholder:text-muted focus:outline-none focus:border-primary disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <HiPaperAirplane className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
