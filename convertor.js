import { Op, Sequelize } from "sequelize";
import { Account, accounts, Transaction, TransactionLedgerEntry } from "./models.js";

/**
 * converts user's Dream tokens to USD
 */
export class Converter {
	/**
	 * Converts all of user's current Dream token balance to USD and
	 * records it to ledger
	 * @param {string} userId Id of the `User` who will receive USD
	 * @returns `Object` of the form:
	 * ```
	 * {
	 * 		transaction,
	 * 		usdAmount,
	 * 		fees
	 * }
	 * ```
	 */
	async convert(userId) {
		// TODO: how much of Dream balance to convert can be an argument to `convert`
		// so as to specialise this method only for recording conversions
		const now = new Date();
		const before = new Date();
		before.setHours(before.getHours() - 1);

		const dreamAccountBalances = await TransactionLedgerEntry.findAll({
			attributes: [
				'entryType',
				[
					Sequelize.fn(
						'SUM', 
						Sequelize.col('amount')
					),
					'totalAmount',
				]
			],
			group: ['entryType'],
			where: {
				'$account.name$': accounts.UserDreamAccount,
				'$account.UserId$': userId,
				'$account.currency$': 'DREAM',
				createdAt: {
					[Op.between]: [before, now],
				},
			},
			include: [{
				model: Account,
			}],
		});

		const debits = dreamAccountBalances.find(balance => balance.dataValues.entryType === 'd')?.dataValues.totalAmount || 0;
		const credits = dreamAccountBalances.find(balance => balance.dataValues.entryType === 'c')?.dataValues.totalAmount || 0;
		
		console.log("debits:", debits);
		console.log("credits:", credits);

		const dreamHolding = debits - credits;

		if (dreamHolding > 0) {
			const conversionRate = 0.15;
			const usdAmount = dreamHolding * conversionRate;
			const fees = usdAmount * 0.001; // hard coding to 1% fees

			const platformDreamAccount = await Account.findOne({
				where: {
					name: accounts.PlatformDreamAccount,
				}
			});

			const platformDreamToUSDAccount = await Account.findOne({
				where: {
					name: accounts.PlatformDreamToUSDAccount,
				}
			});

			const platformUSDCashAccount = await Account.findOne({
				where: {
					name: accounts.PlatformUSDCashAccount,
				}
			});

			const platformFeesAccount = await Account.findOne({
				where: {
					name: accounts.PlatformFeesAccount,
				}
			});

			const userDreamAccount = await Account.findOne({
				where: {
					UserId: userId,
					name: accounts.UserDreamAccount,
				}
			});

			const userUSDAccount = await Account.findOne({
				where: {
					UserId: userId,
					name: accounts.UserUSDAccount,
				}
			});

			const transaction = await Transaction.create({
				description: `Converting ${dreamHolding} tokens to USD for user 
				account ${userUSDAccount.id}`,
			});

			// Transfer dream from user to platform account

			await TransactionLedgerEntry.create({
				amount: dreamHolding,
				entryType: 'c',
				AccountId: userDreamAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: dreamHolding,
				entryType: 'd',
				AccountId: platformDreamAccount.id,
				TransactionId: transaction.id,
			});

			// Convert dream

			await TransactionLedgerEntry.create({
				amount: dreamHolding,
				entryType: 'c',
				AccountId: platformDreamAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: dreamHolding,
				entryType: 'd',
				AccountId: platformDreamToUSDAccount.id,
				TransactionId: transaction.id,
			});

			// Register payout to user and fees
			await TransactionLedgerEntry.create({
				amount: usdAmount,
				entryType: 'c',
				AccountId: platformUSDCashAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: usdAmount,
				entryType: 'd',
				AccountId: userUSDAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: fees,
				entryType: 'c',
				AccountId: platformUSDCashAccount.id,
				TransactionId: transaction.id,
			});

			await TransactionLedgerEntry.create({
				amount: fees,
				entryType: 'd',
				AccountId: platformFeesAccount.id,
				TransactionId: transaction.id,
			});

			return {
				transaction,
				usdAmount,
				fees,
			}
		} else {
			return null;
		}
	}
}