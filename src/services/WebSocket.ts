export class SmartWebSocket extends WebSocket {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(url: string) {
        super(url);
    }

    public smartSend(data: any, onerror?: () => void) {
        if (this.readyState === WebSocket.OPEN) {
            this.send(data);
        } else {
            console.error('WebSocket соединение не готово');
            if (onerror) onerror()
        }
    }
}