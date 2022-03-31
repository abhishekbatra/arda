import express from "express";
import { Account, User } from "./models.js";
import { seedPlatformAccounts } from "./seed.js";
import { DailyWinningsLimitError, WinningsInterface } from "./winnings.js";

const app = express();
const port = parseInt(process.env.PORT || "8080");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/users/get', async (req, res) => {
	const users = await User.findAll();
	res.send({
		result: { users },
	});
});

app.post('/users/create', async (req, res) => {
	const { firstName, lastName } = req.body;
	const user = await User.create({
		firstName,
		lastName,
	});

	res.send({
		result: { user },
	});
});

app.post('/users/:userId/winnings/add', async (req, res, next) => {
	const userId = req.params.userId;
	const { winnings } = req.body;
	const winningsInterface = new WinningsInterface();

	try {
		const transaction = await winningsInterface.addWinnings(userId, winnings);
		
		res.send({
			result: {
				transaction,
			}
		});
	} catch(error) {
		console.error(error);
		if (error instanceof DailyWinningsLimitError) {
			res.send({
				error: {
					type: 'DailyWinningsLimitError',
					message: 'User has reached winnings limit of 5 tokens per day'
				}
			});
		}
		next(error);
	}
});

app.get('/users/:userId/winnings/daily', async (req, res) => {
	const userId = req.params.userId;
	const winningsInterface = new WinningsInterface();
	const dailyWinnings = await winningsInterface.getDailyWinnings(userId);

	res.send({
		result: {
			dailyWinnings,
		}
	})
});

app.post('/admin/seed', async (req, res) => {
	await seedPlatformAccounts();
	const platformAccounts = await Account.findAll();
	console.log("All platformAccounts:", JSON.stringify(platformAccounts, null, 2));
	
	res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});