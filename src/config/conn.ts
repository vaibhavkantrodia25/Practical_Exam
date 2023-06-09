import { DataSource } from 'typeorm';

export const config: any = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  synchronize: true,
  entities: ['dist/**/*.entity.js'],
};

const dataSource = new DataSource(config);
export default dataSource;
