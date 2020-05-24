import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Box } from '@theme-ui/components';
import { Modal, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip } from 'carbon-components-react';
import { DateTime } from 'luxon';
import styled from '@emotion/styled';
import { css } from 'theme-ui';
import { Stamp16 } from '@carbon/icons-react';
import { PALETTE } from '@potter/ui-shared';

interface RequestRecord {
  id: string;
  status: string;
  docId: string;
  createdAt: string;
  updatedAt: string;
  cid: string;
}

interface FetchResponse {
  requests: RequestRecord[];
  totalCount: number;
  pageSize: number;
}

const DocumentIdE = styled.p(
  css({
    fontSize: 'smaller',
  }),
);

function RequestsTable(props: { requests: RequestRecord[] }) {
  const [modal, setModal] = useState(undefined);

  const tooltipContents = (request: RequestRecord) => {
    const timeFormat = { hour: 'numeric', minute: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' };
    if (request.status === 'COMPLETED') {
      const updatedAt = DateTime.fromISO(request.updatedAt);
      const createdAt = DateTime.fromISO(request.createdAt);
      return (
        <>
          <p>Completed: {updatedAt.toLocaleString(timeFormat)}</p>
          <p>Requested: {createdAt.toLocaleString(timeFormat)}</p>
        </>
      );
    } else {
      return (
        <>
          <p>Requested: {request.createdAt}</p>
        </>
      );
    }
  };

  const row = (request: RequestRecord) => {
    const stamp = () => {
      if (request.status.toUpperCase() === 'COMPLETED') {
        return (
          <Stamp16
            style={{ verticalAlign: 'bottom', fill: PALETTE.gray[7], cursor: 'pointer' }}
            onClick={() => setModal(request)}
          />
        );
      } else {
        return <></>;
      }
    };

    return (
      <TableRow key={request.id}>
        <TableCell>
          <p>{request.cid}</p>
          <DocumentIdE>{request.docId}</DocumentIdE>
        </TableCell>
        <TableCell>
          <Tooltip triggerText={request.status}>{tooltipContents(request)}</Tooltip>
          {stamp()}
        </TableCell>
      </TableRow>
    );
  };

  const rows = () => {
    return props.requests.map(r => {
      return row(r);
    });
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Record</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{rows()}</TableBody>
      </Table>
      <Modal
        modalHeading={'Proof'}
        passiveModal={true}
        open={Boolean(modal)}
        onRequestClose={() => setModal(undefined)}
      >
        <dl>
          <dt>
            <strong>Update</strong>
          </dt>
          <dd>{modal?.cid}</dd>
          <dt>
            <strong>Merkle Root</strong>
          </dt>
          <dd>{modal?.anchor?.merkleRoot}</dd>
          <dt>
            <strong>Path</strong>
          </dt>
          <dd>{modal?.anchor?.path || 'Empty'}</dd>
          <dt>
            <strong>Blockchain Transaction</strong>
          </dt>
          <dd>
            {modal?.anchor?.ethereumTxHash} on {modal?.anchor?.chainId}
          </dd>
          <dt>
            <strong>Proof CID</strong>
          </dt>
          <dd>{modal?.anchor?.proofCid}</dd>
        </dl>
      </Modal>
    </>
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
      <Head>
        <title>Requests - Ceramic Anchoring</title>
      </Head>
      <h1>Requests</h1>
      <RequestsTable requests={requests} />
    </Box>
  );
}
