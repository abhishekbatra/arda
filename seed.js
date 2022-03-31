import { accounts, Account } from "./models.js";

export async function seedPlatformAccounts() {
	// create platform USD account
	await Account.create({
		name: accounts.PlatformUSDCashAccount,
		currency: 'USD',
	});

	// create platform Dream account
	await Account.create({
		name: accounts.PlatformDreamAccount,
		currency: 'DREAM',
	});

	// create platform fees account
	await Account.create({
		name: accounts.PlatformFeesAccount,
		currency: 'USD',
	});
}