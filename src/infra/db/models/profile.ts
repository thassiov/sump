import { DataTypes, Model } from 'sequelize';

import { db } from '../db';

class ProfileModel extends Model {}

ProfileModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'profile',
    paranoid: true,
  }
);

export { ProfileModel };
