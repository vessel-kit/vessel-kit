export type Signature = {
  iss: string;
  header: { typ: 'JWT'; alg: string };
  signature: string;
};
