Getting Started
===
So, you've just found out about Que and want to get it up and running - cool!

Setup
---
1. Download Que: `git clone https://github.com/queapp/core && cd core`
2. Create a MongoDB server instance:
  - Install one [locally](http://docs.mongodb.org/manual/installation/)
  - Use a service like [Mongolab](http://mongolab.com)

Start Que
---
`node index.js --db [MONGO URI HERE]`

for example: `node index.js --db mongo://user:pass@example.com/quedatabase`

And with any luck, you should be able to go to `127.0.0.1:8000` and follow
the setup instructions.

Setup Instructions
---
The setup will ask you to:
  - pick a superadmin password
  - create a user account

Then, you can log in using your created user account and start setting up each
thing!

What to read next
---
- [Create a new thing](/docs/newthing)
- [Que's permissions system](/docs/permissions)
- [Other command line flags / environment variables](/docs/variables)
