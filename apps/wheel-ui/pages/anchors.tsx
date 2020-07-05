import Head from "next/head";
import { Grid, Box } from "@theme-ui/components";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody, TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';

function AnchorsTable(props: { anchors: any }) {
  const row = (anchor: any) => {
    return (
      <TableRow key={anchor.id}>
        <TableCell>{anchor.id}</TableCell>
        <TableCell>{anchor.requestId}</TableCell>
        <TableCell>{anchor.cid}</TableCell>
        <TableCell>{anchor.createdAt}</TableCell>
      </TableRow>
    );
  };

  const rows = () => {
    return props.anchors.map(r => {
      return row(r);
    });
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Id</TableHeader>
          <TableHeader>Request</TableHeader>
          <TableHeader>CID</TableHeader>
          <TableHeader>Created</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{rows()}</TableBody>
    </Table>
  );
}

export default function Anchors() {
  const [anchors, setAnchors] = useState([]);

  useEffect(() => {
    const endpoint = `${process.env.ANCHORING_URL}/api/v0/anchors`;
    fetch(endpoint).then(async response => {
      const data = await response.json();
      setAnchors(data.anchors);
    });
  }, [anchors.length]);

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Anchors</h1>
      <AnchorsTable anchors={anchors} />
    </Box>
  );
}
