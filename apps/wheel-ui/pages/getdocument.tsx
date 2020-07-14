import { Box } from '@theme-ui/components';
import React, { useState } from 'react';
import { Button, FormGroup, TextInput } from 'carbon-components-react';

import Router from 'next/router';

export default function GetDocument() {
  const [docId, setDocId] = useState('');

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Document Request</h1>
      <FormGroup legendText={''}>
        <TextInput
          id="docIDInput"
          labelText="Enter document CID"
          placeholder="Document CID"
          onInput={e => setDocId(e.currentTarget.value)}
        />
      </FormGroup>
      <Button
        kind="primary"
        tabIndex={0}
        type="submit"
        disabled={!docId.length}
        onClick={e => {
          e.preventDefault();
          Router.push(`/document/${docId}`);
        }}
      >
        Submit
      </Button>
    </Box>
  );
}
