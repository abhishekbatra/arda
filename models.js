import { DataTypes, Model } from "sequelize";
import { sequelizeConnection } from "./sequelize.js";

// Models
export class User extends Model {}

User.init({
	firstName: {
		type: DataTypes.STRING(30),
		allowNull: false,
	},
	lastName: DataTypes.STRING(30),
}, {
	sequelize: sequelizeConnection,
});

User.afterCreate(async (user, options) => {
	const userWinningsAccount = await Account.create({
		name: accounts.UserWinningsAccount,
		currency: 'DREAM',
		UserId: user.id,
	});

	await Account.create({
		name: accounts.UserUSDAccount,
		currency: 'USD',
		UserId: user.id,
	});

	await Account.create({
		name: accounts.UserDreamAccount,
		currency: 'DREAM',
		UserId: user.id,
	});

	await Account.create({
		name: accounts.UserUSDConversionAccount,
		currency: 'USD',
		UserId: user.id,
	});
});

export class Account extends Model {}

Account.init({
	name: DataTypes.STRING(10),
	currency: {
		type: DataTypes.STRING(5),
		allowNull: false,
		validate: {
			isIn: [['USD', 'DREAM']],
		}
	},
}, {
	sequelize: sequelizeConnection,
});

User.hasMany(Account, {
	foreignKey: {
		allowNull: true,
	}
});
Account.belongsTo(User);

export class Transaction extends Model {}

Transaction.init({
	description: DataTypes.STRING(200),
}, {
	sequelize: sequelizeConnection
});

export class TransactionLedgerEntry extends Model {}

TransactionLedgerEntry.init({
	amount: {
		type: DataTypes.NUMBER({precision: 23, scale: 8}),
		allowNull: false,
	},
	entryType: {
		type: DataTypes.CHAR(1),
		validate: {
			isIn: [['c', 'd']],
		}
	},
}, {
	sequelize: sequelizeConnection,
});

Transaction.hasMany(TransactionLedgerEntry);
TransactionLedgerEntry.belongsTo(Transaction);
Account.hasMany(TransactionLedgerEntry);
TransactionLedgerEntry.belongsTo(Account);

await User.sync();
await Account.sync();
await Transaction.sync();
await TransactionLedgerEntry.sync();

// One off row names
export const accounts = {
	PlatformUSDCashAccount: 'Platform USD Cash',
	PlatformDreamAccount: 'Platform Dream tokens',
	PlatformFeesAccount: 'Platform Fees',
	UserWinningsAccount: 'User Winnings',
	UserUSDAccount: 'User USD',
	UserDreamAccount: 'User Dream tokens',
	UserUSDConversionAccount: 'User Token Conversions',
}