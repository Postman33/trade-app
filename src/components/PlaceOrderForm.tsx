import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

type PlaceOrderFormProps = {
    onPlaceOrder: (side: string, price: number, volume: number) => void
};

const PlaceOrderForm: React.FC<PlaceOrderFormProps> = ({ onPlaceOrder }) => {
    const [side, setSide] = useState<string>('Buy');
    const [price, setPrice] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0);

    const sides = ['Buy', 'Sell'];

    return (
        <div>
            <h2>Place Order</h2>
            <Dropdown value={side} options={sides} onChange={(e) => setSide(e.value)} placeholder="Select Side"/>
            <InputNumber value={price} onValueChange={(e) => setPrice(e.value || -5)} mode="decimal" min={0} placeholder="Price"/>
            <InputNumber aria-label={'testst'} value={volume} onValueChange={(e) => setVolume(e.value || -5)} mode="decimal" min={0} placeholder="Volume"/>
            <Button label="Place Order" onClick={() => onPlaceOrder(side, price, volume)} />
        </div>
    );
};

export default PlaceOrderForm;