// App.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Dropdown} from 'primereact/dropdown';
import QuoteInfo from './components/QuoteInfo';
import OrderInfo from "./components/OrderInfo";
import PlaceOrderForm from "./components/PlaceOrderForm";
import {Toast} from 'primereact/toast';
import {Chart} from 'primereact/chart';
import dayjs from "dayjs";
import {setupChartData} from "./services/ChartService";


export type Quote = {
    bid: number,
    offer: number,
    min_amount: number,
    max_amount: number,
    timestamp: string
};

export type Order = {
    order_id: string,
    timestamp: string,
    instrument: string,
    side: string,
    price: string,
    volume: number,
    status: string,
    last_changed: string
};

type AppProps = {};


const App: React.FC<AppProps> = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [quotes, setQuotes] = useState<Quote[] | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const toast = useRef<Toast>(null); // Add this line

    const [chartData, setChartData] = useState<{ labels: string[], datasets: any[] }>({
        labels: [],
        datasets: [
            {
                label: 'Offer',
                data: [],
                fill: false,
                borderColor: '#4bc0c0'
            }
        ]
    });
    const chartOptions = {
        animation: false,

        title: {
            display: true,
            text: 'Offer Chart',
            fontSize: 16
        },
        legend: {
            position: 'top'
        },
        scales: {
            yAxis: {
                min: 0, // Минимальное значение оси Y
                max: 250, // Максимальное значение оси Y
            }
        },

        responsive: true,
        maintainAspectRatio: false
    };
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8765');
        setSocket(ws);
        return () => {
            ws.close();
        };
    }, []);

    setupChartData(quotes, setChartData);

    useEffect(() => {
        if (socket == null)
            return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message)

            if (message.messageType === 'CurrentQuotes' && selectedTicker != null) {
                setQuote(message.message as Quote);
            } else if (message.messageType === 'OrderInfo') {
                let orders = message.message as Order[]
                orders.map( order => {
                    if (order.side === 'Sell'){
                        order.price = ">" + order.price
                    } else {
                        order.price = "<" + order.price
                    }
                    return order
                })
                setOrders(message.message as Order[]);
                console.log(message)
            }
            else if (message.messageType === 'MarketDataUpdate'){
                console.log(message.message as Quote)
                setQuote(message.message as Quote);
            }
            else if (message.messageType === 'QuotesInfo'){
                setQuotes(message.message as Quote[])
            }

        };
        socket.onerror = function(error) {
            // Show a toast notification about the error
            if (toast && toast.current) toast.current.show({severity: 'error', summary: 'Network error', detail: 'We will try to reconnect after 5 seconds'});
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                setSocket(new WebSocket('ws://localhost:8765'));
            }, 5000);
        };


        window.onbeforeunload = () => {
            if (selectedTicker) {
                socket.send(JSON.stringify({
                    messageType: 'UnsubscribeMarketData',
                    message: {instrument: selectedTicker}
                }));
            }

        }

        let id = setInterval(() => {
            if (socket == null) {
                clearInterval(id);
                return
            }

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
        <div style={{'padding': '20px'}}>
            <Toast ref={toast}/> {/* Add this line */}
            <h1>Market data app</h1>

            <Dropdown value={selectedTicker} options={tickers} onChange={(e) => selectTicker(e.value)}
                      placeholder="Select a Ticker"/>
            {selectedTicker &&
                <QuoteInfo quote={quote}/>}
            {selectedTicker &&
                <Chart type="line" height={'300px'} data={chartData} options={chartOptions}/>
            }

            {selectedTicker && <PlaceOrderForm onPlaceOrder={placeOrder}/>}
            {selectedTicker && <OrderInfo orders={orders.filter(order => order.instrument === selectedTicker)}/>}

        </div>

    );
};

export default App;
