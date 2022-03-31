# arda

- Database design has been layed out in the `docs` folder

# Instructions
1. yarn global add nodemon
2. yarn
3. yarn start
4. Import the collection `arda.postman_collection.json` to postman
5. Run the `Users/create` API to create a few users
6. Run the `Users/winnings/add` API to post winnings for specified user. User is 
		specified through the path variable `userId`. Winnings are specfied in the body
		with the key `winnings`.
7. A periodic task will showcase conversion of winnings to USD

# Data flow
## Accounting tables
### User
- User Winnings
- User USD
- User Dream tokens
### Platform
- Platform USD Cash
- Platform Dream tokens
- Platform Fees
- Platform Dream To USD