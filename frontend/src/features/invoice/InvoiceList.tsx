import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InvoiceList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Invoice list component - placeholder</p>
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
