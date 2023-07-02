import React, {useState} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import './OrderInfo.css';
import {Order} from "../models/Order";

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
                <Column field="order_id" header="Order ID" sortable></Column>
                <Column field="timestamp" header="Timestamp" sortable></Column>
                <Column field="last_changed" header="Last Changed" sortable></Column>
                <Column field="instrument" header="Instrument" sortable></Column>
                <Column field="side" header="Side" sortable  ></Column>
                <Column field="price" header="Price" sortable></Column>
                <Column field="volume" header="Volume" sortable></Column>
                <Column body={statusBodyTemplate} header="Status" ></Column>
            </DataTable>
        </div>
    );
};

export default OrderInfo;
