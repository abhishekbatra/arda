import { Sequelize } from 'sequelize';

export const sequelizeConnection = new Sequelize('sqlite::memory:');