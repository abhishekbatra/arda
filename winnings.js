import { Op } from "sequelize";
import { Account, accounts, Transaction, TransactionLedgerEntry } from "./models.js";

export class DailyWinningsLimitError extends Error {
	constructor(message) {
		super(message);
	}
}

export class WinningsInterface {
	/**
	 * Adds winnings to user account. Capped at 5 tokens per day.
	 * @param {string} userId id of a `User` instance
	 * @param {number} winningsAmount Amount of Dream tokens won 
	 * @returns Winnings `Transaction` instance.
	 */
	async addWinnings(userId, winningsAmount) {
		const winningsToday = await this.getDailyWinnings(userId);
		console.log(`winnings today = ${winningsToday}`);
		if (winningsToday < 5) {
			// TODO: what if this transaction causes the winnings to 
			// cross 5
			
			const platformDreamAccount = await Account.findOne({
				where: {
					name: accounts.PlatformDreamAccount,
				}
			});
			
			const userWinningsAccount = await Account.findOne({
				where: {
					UserId: userId,
					name: accounts.UserWinningsAccount,
				}
			});

			const userDreamAccount = await Account.findOne({
				where: {
					UserId: userId,
					name: accounts.UserDreamAccount,
				}
			});

			const transaction = await Transaction.create({
				description: `Adding ${winningsAmount} tokens to user 
				account ${userDreamAccount.id} as winnings`,
			});

			await TransactionLedgerEntry.create({
				amount: winningsAmount,
				entryType: 'c',
				AccountId: platformDreamAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: winningsAmount,
				entryType: 'd',
				AccountId: userWinningsAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: winningsAmount,
				entryType: 'c',
				AccountId: userWinningsAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: winningsAmount,
				entryType: 'd',
				AccountId: userDreamAccount.id,
			});

			return transaction;
		} else {
			throw new DailyWinningsLimitError("Daily winnings crossed 5 tokens");
		}
	}

	/**
	 * Get the winnings accumulated by the user in the last hour.
	 * @param {string} userId id of a `User` instance
	 * @returns `Promise<number>` promise that resolves to winnings
	 * value for the day
	 */
	async getHourlyWinnings(userId) {
		const now = new Date();
		const before = new Date();
		before.setHours(before.getHours() - 1);
		
		return await this.getWinningsSince(userId, before);
	}

	/**
	 * Get the winnings accumulated by the user today.
	 * @param {string} userId id of a `User` instance
	 * @returns `Promise<number>` promise that resolves to winnings
	 * value for the day
	 */
	 async getDailyWinnings(userId) {
		const now = new Date();
		const before = new Date();
		before.setHours(0);
		
		return await this.getWinningsSince(userId, before);
	}

	/**
	 * Get the winnings accumulated by the user since given time. Currently 
	 * ignores user timezone and relies universally on server
	 * timezone.
	 * @param {string} userId id of a `User` instance
	 * @param {Date}	since time since winnings to be calculated
	 * @returns `Promise<number>` promise that resolves to winnings
	 * value for the day
	 */
	async getWinningsSince(userId, since) {
		const now = new Date();
		
		return await TransactionLedgerEntry.sum('amount', {
			where: {
				'$account.name$': accounts.UserWinningsAccount,
				'$account.UserId$': userId,
				'$account.currency$': 'DREAM',
				createdAt: {
					[Op.between]: [since, now],
				},
				entryType: 'd',
			},
			include: [{
				model: Account,
			}]
		});
	}
}