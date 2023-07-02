export type Order = {
    order_id: string,
    timestamp: string,
    instrument: string,
    side: string,
    price: number,
    volume: number,
    status: string,
    last_changed: string
};