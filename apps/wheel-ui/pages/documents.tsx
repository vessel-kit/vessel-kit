import { DateTime } from 'luxon'
import { Box } from "@theme-ui/components";
import React from "react";
import {
  Table,
  TableBody, TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Link
} from 'carbon-components-react';

import useSWR from 'swr'
import { RecordType } from '../styling/document'


function DocumentsTable(props: { documents: any }) {
  const row = (document: any) => {
    return (
      <TableRow key={document.docId} >
        <TableCell><Link href={`/document?docId=${document.docId}`}>{document.docId}</Link></TableCell>
        <TableCell>{document.cid}</TableCell>
        <TableCell><RecordType recordType={document.recordType}></RecordType></TableCell>
        <TableCell>{DateTime.fromMillis(document.time * 1000).setZone('UTC').toLocal().toString()}</TableCell>
      </TableRow>
    );
  };

  const rows = () => {
    return props.documents?.map(r => {
      return row(r);
    });
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>DocId</TableHeader>
          <TableHeader>Last CID</TableHeader>
          <TableHeader>Record type</TableHeader>
          <TableHeader>Time</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{rows()}</TableBody>
    </Table>
  );
}

export default function Documents() {
  const endpoint = `${process.env.WHEEL_URL}/api/v0/ceramic`;
  const fetcher = url => fetch(url).then(r => r.json())
  const { data } = useSWR(endpoint, fetcher)

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Documents</h1>
      <DocumentsTable documents={data} />
    </Box>
  );
}
