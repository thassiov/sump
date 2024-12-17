import { DataTypes, InitOptions, Model, ModelAttributes } from 'sequelize';

import { db } from '../db';

const entityAttributes: ModelAttributes = {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  handle: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
};

const entityOptions: InitOptions = {
  sequelize: db,
  modelName: 'account',
  paranoid: true,
};

class AccountModel extends Model {}

// this function relies on side effects to work properly.
// @TODO fix it (maybe)
function initEntity(initEntityAttributes: ModelAttributes): void {
  AccountModel.init(initEntityAttributes, entityOptions);
}

export { AccountModel, entityAttributes, initEntity };
