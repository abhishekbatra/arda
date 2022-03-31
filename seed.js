import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { Converter } from "./convertor.js";
import { accounts, Account, User } from "./models.js";

async function seedPlatformAccounts() {
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

	// create platform dream to usd conversion account
	await Account.create({
		name: accounts.PlatformDreamToUSDAccount,
		currency: 'DREAM',
	});
}

async function setupPeriodicConversionTask() {
	const scheduler = new ToadScheduler();
	const task = new AsyncTask(
		'conversion task',
		async () => {
			const converter = new Converter();
			const users = await User.findAll();
			
			for (let index=0; index < users.length; index++) {
				const conversionRes = await converter.convert(users[index].id);
				console.log("conversionRes:", JSON.stringify(conversionRes, null, 2));
			}
		},
		(error) => {
			console.error(error);
		}
	);
	const job = new SimpleIntervalJob({ seconds: 15}, task);
	scheduler.addSimpleIntervalJob(job);
}

export async function runSeedTasks() {
	await seedPlatformAccounts();
	await setupPeriodicConversionTask();
}