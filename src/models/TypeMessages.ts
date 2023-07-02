export enum ClientMessages {
    SubscribeMarketData = 1,
    UnsubscribeMarketData,
    GetOrderInfo,
    GetCurrentQuotes,
    PlaceOrder,
    CancelOrder,
    GetOrderByIdInfo,
}

export enum ServerMessages {
    SuccessInfo = 1,
    ErrorInfo,
    CurrentQuotes,
    MarketDataUpdate,
    QuotesInfo,
    OrderInfo,
}
