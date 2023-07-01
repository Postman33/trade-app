// OrderInfo.tsx
import React from 'react';
import { Order } from '../App';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import './OrderInfo.css';

type OrderInfoProps = {
    orders: Order[]
};

const OrderInfo: React.FC<OrderInfoProps> = ({ orders }) => {
    const statusBodyTemplate = (rowData: Order) => {
        return (
            <Tag severity={rowData.status === 'Active' ? 'success' : 'danger'}
                 icon={rowData.status === 'Active' ? 'pi pi-check' : 'pi pi-times'}>
                {rowData.status}
            </Tag>
        );
    };


    return (
        <div>
            <h2>Order Information</h2>
            <DataTable value={orders} paginator rows={4}
                       rowClassName={(rowData) =>
                           ({'buyOrder': rowData.side === 'Buy', 'sellOrder': rowData.side === 'Sell'})}

            >
                <Column field="order_id" header="Order ID"></Column>
                <Column field="timestamp" header="Timestamp"></Column>
                <Column field="last_changed" header="last_changed"></Column>
                <Column field="instrument" header="Instrument"></Column>
                <Column field="side" header="Side"></Column>
                <Column field="price" header="Price"></Column>
                <Column field="volume" header="Volume"></Column>
                <Column body={statusBodyTemplate} header="Status"></Column>
            </DataTable>
        </div>
    );
};

export default OrderInfo;