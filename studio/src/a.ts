import axios from 'axios';

const rulesetRecord = {
  doctype: 'vessel/0.0.2',
  content: {
    type: 'application/javascript',
    main: `function canApply(a, b) { return b.num > a.num; }; module.exports = {canApply: canApply}`,
  },
};

function documentGenesisRecord(rulesetDocId: string) {
  return {
    doctype: 'vessel/document/0.0.1',
    governance: { '/': rulesetDocId },
    content: {
      num: 1,
    },
  };
}

const ENDPOINT = 'http://localhost:3001/api/v0/ceramic';

async function create(record: any) {
  const result = await axios.post(ENDPOINT, record);
  return result.data.docId;
}

async function main() {
  const rulesetDocId = await create(rulesetRecord);
  console.log('Ruleset doc id: ', rulesetDocId);
  // const documentDocId = await create(documentGenesisRecord(rulesetDocId));
  // console.log('Document id', documentDocId);
  // const result = await axios.put(`${ENDPOINT}/${documentDocId}`, {
  //   prev: { '/': documentDocId },
  //   content: {
  //     num: 2,
  //   },
  // });
  // console.log(result.data);
}

main();
