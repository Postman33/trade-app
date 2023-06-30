// App.tsx
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import QuoteInfo from './components/QuoteInfo';
import OrderInfo from "./components/OrderInfo";
import PlaceOrderForm from "./components/PlaceOrderForm";


export type Quote = {
    bid: number,
    offer: number,
    min_amount: number,
    max_amount: number
};

export type Order = {
    order_id: string,
    timestamp: string,
    instrument: string,
    side: string,
    price: number,
    volume: number,
    status: string
};

type AppProps = {};

const App: React.FC<AppProps> = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8765');
        setSocket(ws);
        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (socket == null)
            return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.messageType === 'CurrentQuotes' && selectedTicker != null) {
                setQuote(message.message as Quote);
            } else if (message.messageType === 'OrderInfo') {
                setOrders(message.message as Order[]);
            }
            else if (message.messageType === 'MarketDataUpdate'){
                console.log(message.message as Quote)
                setQuote(message.message as Quote);
            }
            console.log(message.message as Quote)

        };


        setInterval(() => {
            socket.send(JSON.stringify({
                messageType: 'GetOrderInfo'
            }));
        }, 5000);

    }, [socket, selectedTicker]);

    const tickers = ['IM', 'TG', 'BJ']; // Put your actual tickers here

    const selectTicker = (ticker: string) => {
        if (socket == null)
            return;
        if (ticker != null) socket.send(JSON.stringify({
            messageType: 'UnsubscribeMarketData',
            message: { instrument: ticker }
        }));
        setSelectedTicker(ticker);

        socket.send(JSON.stringify({
            messageType: 'SubscribeMarketData',
            message: { instrument: ticker }
        }));
        socket.send(JSON.stringify({
            messageType: 'GetOrderInfo'
    }));
    };

    const placeOrder = (side: string, price: number, volume: number) => {
        if (socket == null || selectedTicker == null)
            return;
        socket.send(JSON.stringify({
            messageType: 'PlaceOrder',
            message: {
                instrument: selectedTicker,
                side: side,
                price: price,
                volume: volume
            }
        }));
    };

    return (
        <div>
            <h1>Market data app</h1>
            <Dropdown value={selectedTicker} options={tickers} onChange={(e) => selectTicker(e.value)} placeholder="Select a Ticker"/>
            <QuoteInfo quote={quote} />
            <PlaceOrderForm onPlaceOrder={placeOrder} />
            <OrderInfo orders={orders} />
        </div>
    );
};

export default App;
