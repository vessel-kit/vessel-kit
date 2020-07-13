interface ErrorObject {
  code: number;
  message: string;
  data?: any;
}

interface Response<A> {
  result?: A;
  error?: ErrorObject;
}

export interface IProvider {
  send<A = any>(payload: any, origin?: any, callback?: any): Promise<Response<A>>;
}
