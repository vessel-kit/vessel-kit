import Head from 'next/head';
import { Grid, Box } from '@theme-ui/components';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'carbon-components-react';
import { DateTime } from 'luxon';

function TransactionsTable(props: { transactions: any }) {
  const row = (transaction: any) => {
    const date = DateTime.fromISO(transaction.createdAt).toLocaleString({
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    return (
      <TableRow key={transaction.id}>
        <TableCell>{transaction.txHash}</TableCell>
        <TableCell>{transaction.chainId}</TableCell>
        <TableCell>{date}</TableCell>
      </TableRow>
    );
  };

  const rows = () => {
    return props.transactions.map(r => {
      return row(r);
    });
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Hash</TableHeader>
          <TableHeader>Chain</TableHeader>
          <TableHeader>Created</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{rows()}</TableBody>
    </Table>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const endpoint = `${process.env.ANCHORING_URL}/api/v0/transactions`;
    fetch(endpoint).then(async response => {
      const data = await response.json();
      setTransactions(data.transactions);
    });
  }, [transactions.length]);

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <Head>
        <title>Transactions - Ceramic Anchoring</title>
      </Head>
      <h1>Transactions</h1>
      <TransactionsTable transactions={transactions} />
    </Box>
  );
}
