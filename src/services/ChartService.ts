import {useEffect} from "react";
import dayjs from "dayjs";
import {Quote} from "../App";

export function setupChartData(quotes: Quote[] | null,
                               setChartData: (value: (((prevState: {
                                   labels: string[];
                                   datasets: any[]
                               }) => { labels: string[]; datasets: any[] }) | {
                                   labels: string[];
                                   datasets: any[]
                               })) => void) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (quotes != null) {
            setChartData({
                labels: quotes.map(quote => dayjs(quote.timestamp).format("MM/DD HH:mm:ss A")).reverse(),
                datasets: [{
                    label: 'Offer',
                    data: quotes.map(quote => quote.offer).reverse(),
                    fill: false,
                    borderColor: '#4bc0c0'
                },
                    {
                        label: 'Bid',
                        data: quotes.map(quote => quote.bid).reverse(),
                        fill: false,
                        borderColor: '#d5af12'
                    }]
            });
        }
    }, [quotes, setChartData]);
}