export interface ApiHealth {
  status: 'ok';
  environment: string;
  services: {
    api: 'ok';
    database: 'ok';
  };
}
