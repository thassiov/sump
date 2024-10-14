import { DataTypes, Model } from 'sequelize';

import { db } from '../db';

class AccountModel extends Model {}

AccountModel.init(
  {
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
  },
  {
    sequelize: db,
    modelName: 'account',
    paranoid: true,
  }
);

export { AccountModel };
