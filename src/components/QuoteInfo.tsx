import React from 'react';
import {Quote} from "../models/Quote";

type QuoteInfoProps = {
    quote: Quote | null
};

const QuoteInfo: React.FC<QuoteInfoProps> = ({ quote }) => {
    if (quote == null) {
        return null;
    }
    return (
        <div>
            <h2>Quote Information</h2>
    <p>Bid: {quote.bid}</p>
    <p>Offer: {quote.offer}</p>
    </div>
);
};

export default QuoteInfo;