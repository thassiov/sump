import { DatabaseInstanceError } from 'src/lib/errors';
import { db } from './db';
import { AccountModel } from './models/account';
import { ProfileModel } from './models/profile';
import { logger } from 'src/lib/logger';

AccountModel.hasOne(ProfileModel, {
  onDelete: 'CASCADE',
  foreignKey: {
    name: 'accountId',
    allowNull: false,
  },
});
ProfileModel.belongsTo(AccountModel);

async function syncDb(): Promise<void> {
  try {
    logger.info('Syncing models to the database');
    await db.sync();
  } catch (error) {
    throw new DatabaseInstanceError({
      cause: error as Error,
      details: { op: 'Syncing models to the database' },
    });
  }
}

export { AccountModel, ProfileModel, syncDb, db };
