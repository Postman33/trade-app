// OrderInfo.tsx
import React from 'react';
import { Order } from '../App';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

type OrderInfoProps = {
    orders: Order[]
};

const OrderInfo: React.FC<OrderInfoProps> = ({ orders }) => {
    const statusBodyTemplate = (rowData: Order) => {
        return (
            <Tag severity={rowData.status === 'Active' ? 'success' : 'danger'}
                 icon={rowData.status === 'Active' ? 'pi-check' : 'pi-times'}>
                {rowData.status}
            </Tag>
        );
    };

    return (
        <div>
            <h2>Order Information</h2>
            <DataTable value={orders} paginator rows={10}>
                <Column field="order_id" header="Order ID"></Column>
                <Column field="timestamp" header="Timestamp"></Column>
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