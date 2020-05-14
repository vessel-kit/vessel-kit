import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Grid, Box } from "@theme-ui/components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'carbon-components-react';

interface RequestRecord {
  id: string;
  status: string;
  docId: string;
  createdAt: string;
  cid: string;
}

interface FetchResponse {
  requests: RequestRecord[];
  totalCount: number;
  pageSize: number;
}

function RequestsTable(props: { requests: RequestRecord[] }) {
  const row = (request: RequestRecord) => {
    return (
      <TableRow key={request.id}>
        <TableCell>{request.id}</TableCell>
        <TableCell>{request.docId}</TableCell>
        <TableCell>{request.cid}</TableCell>
        <TableCell>{request.status}</TableCell>
      </TableRow>
    );
  };

  const rows = () => {
    return props.requests.map(r => {
      return row(r);
    });
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Id</TableHeader>
          <TableHeader>docId</TableHeader>
          <TableHeader>CID</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{rows()}</TableBody>
    </Table>
  );
}

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const endpoint = `${process.env.ANCHORING_URL}/api/v0/requests`;
    fetch(endpoint).then(async response => {
      const data: FetchResponse = await response.json();
      setRequests(data.requests);
    });
  }, [requests.length]);

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Requests</h1>
      <RequestsTable requests={requests} />
    </Box>
  );
}
