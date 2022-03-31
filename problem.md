Dreamland is a meta verse company and has a concept of games, where every user can play these games and win DREAM tokens multiple times a day. A user can win upto 5 DREAM tokens on a single day.

DREAM tokens are a virtual currency and have a real monetary value. At the end of every hour, the DREAM tokens won by the user are converted to USD by calling a third-party API that provides the rate (for the assignment, we can hardcode to 15 cents per token). 

Every time a user is issued a token and a token gets converted to USD, there will be fees which we need to keep track of (the user will not bear the fees, the platform will)

In the backend, there are double-entry accounting ledgers that keep track of a user's tokens, the current USD value and the fees.

Imagine you are building APIs for Dreamland:

1. API that accepts that a user has won some amount of DREAM token at a particular time of a day (can be fractional tokens)
2. API that returns the history of DREAM tokens a user has won for the current day so far
3. API that returns the history of USD amounts a user has won till now (till the previous day)
4. API that returns the stats: sum of tokens won on the current day so far and the total value of USD a user has in his account

Let's focus on the below for the design side of things:

1. Database table design given the APIs above
2. Database needs to have a solid double-entry ledger to track the tokens and USD (might make sense to read up about ledgers - some great sources here and here). Lets design ledgers for both the tokens and USD
3. Data types we can use for the ledger amounts (it needs to support the smallest and largest unit of a crypto token)
4. Edge cases - list some edge cases both in APIs and database that you will handle
5. Any other APIs and tools you can think of (no need to implement)
6. Infrastructure - This is a global system with customers across the world. Let's discuss more about setting up the infra, how to share data across different regions, how to solve for region-specific data for issues like GDPR, how to replicate some tables out of a region to a central cluster for analytics, etc. This is just a textual answer with maybe some design diagrams