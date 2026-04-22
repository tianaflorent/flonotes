import { ServerResponse } from "http";

export const send = (res: ServerResponse, status: number, data: object) => {
  res.writeHead(status);
  res.end(JSON.stringify(data));
};