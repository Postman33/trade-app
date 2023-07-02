// App.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Dropdown} from 'primereact/dropdown';
import QuoteInfo from './components/QuoteInfo';
import OrderInfo from "./components/OrderInfo";
import PlaceOrderForm from "./components/PlaceOrderForm";
import {Toast} from 'primereact/toast';
import {Chart} from 'primereact/chart';
import {setupChartData} from "./services/ChartService";
import {SmartWebSocket} from "./services/WebSocket";
import {Quote} from "./models/Quote";
import {Order} from "./models/Order";
import {ClientMessages, ServerMessages} from "./models/TypeMessages";


type AppProps = {};


const App: React.FC<AppProps> = () => {
    const [socket, setSocket] = useState<SmartWebSocket | null>(null);
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

    const toastShow = (severity: 'success' | 'info' | 'warn' | 'error' | undefined, summary: string, detail: string)=>{
        if (toast && toast.current) toast.current.show({severity: severity, summary: summary, detail: detail});
    }
    const sendingError = (commText: string )=>{
       return ()=>{ toastShow( 'error', 'Network error',  'Message was not delivered \n' + commText)};
    }
    const reconnectWithToast = (TIMEOUT: number = 5000)=>{
        toastShow( 'error', 'Network error',  'We will try to reconnect after 5 seconds');
        setTimeout(() => {
            setSocket(new SmartWebSocket('ws://localhost:8765'));
        }, TIMEOUT);
    }
    useEffect(() => {
        const ws = new SmartWebSocket('ws://localhost:8765');
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

            if (message.messageType === ServerMessages.CurrentQuotes && selectedTicker != null) {
                setQuote(message.message as Quote);
            } else if (message.messageType === ServerMessages.OrderInfo) {
                setOrders(message.message as Order[]);
                console.log(message)
            }
            else if (message.messageType === ServerMessages.MarketDataUpdate){
                console.log(message.message as Quote)
                setQuote(message.message as Quote);
            }
            else if (message.messageType === ServerMessages.QuotesInfo){

                setQuotes(message.message as Quote[])
            }

        };
        socket.onerror = function(error) {
            reconnectWithToast(5000);
        };


        window.onbeforeunload = () => {
            if (selectedTicker) {
                socket.smartSend(JSON.stringify({
                    messageType: ClientMessages.UnsubscribeMarketData,
                    message: {instrument: selectedTicker}
                }), sendingError("UnsubscribeMarketData"));
            }

        }

        let id = setInterval(() => {
            if (socket.readyState !== WebSocket.OPEN) {
                clearInterval(id);
                return
            }
            socket.smartSend(JSON.stringify({
                messageType: ClientMessages.GetOrderInfo
            }), ()=> {

            });

        }, 5000);

    }, [socket, selectedTicker]);

    const tickers = ['IM', 'TG', 'BJ']; // Put your actual tickers here

    const selectTicker = (ticker: string) => {
        if (socket == null)
            return;
        if (ticker != null) socket.smartSend(JSON.stringify({
            messageType: ClientMessages.UnsubscribeMarketData,
            message: {instrument: ticker}
        }), sendingError("UnsubscribeMarketData"));
        setSelectedTicker(ticker);

        socket.smartSend(JSON.stringify({
            messageType: ClientMessages.SubscribeMarketData,
            message: {instrument: ticker}
        }), sendingError("SubscribeMarketData"));
        socket.smartSend(JSON.stringify({
            messageType: ClientMessages.GetOrderInfo
        }), sendingError("GetOrderInfo"));
    };

    const placeOrder = (side: string, price: number, volume: number) => {
        if (socket == null || selectedTicker == null)
            return;
        socket.smartSend(JSON.stringify({
            messageType: ClientMessages.PlaceOrder,
            message: {
                instrument: selectedTicker,
                side: side,
                price: price,
                volume: volume
            }
        }), sendingError("PlaceOrder"));
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
