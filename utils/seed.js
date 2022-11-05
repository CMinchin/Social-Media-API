const connection = require('../config/connection');
const { User, Thought } = require('../models');
const { getRandomName, getRandomReactions, getRandomArrItem, emails, Thoughts: sampleThoughts, reactions } = require('./data');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');

  // Drop existing courses
  await User.deleteMany({});

  // Drop existing thoughts
  await Thought.deleteMany({});

  // Create empty array to hold the users
  const users = [];
  // Create empty array to hold the thoughts
  const thoughts = [];

  // Loop 20 times -- add users to the user array
  for (let i = 0; i < 20; i++) {

    const username = getRandomName();
    const email = `${username.split(" ")[0]}${Math.floor(Math.random() * (99 - 18 + 1) + 18)}@${getRandomArrItem(emails)}`;

    users.push({
      username,
      email,
    });
  }

  await User.collection.insertMany(users);

  // add thoughts
  for (let i = 0; i < 40; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data

    const thoughtText = getRandomArrItem(sampleThoughts);
    const username = getRandomArrItem(users).username;

    let Reactions = [];

    // add reactions
    for (let i = 0; i < Math.floor(Math.random() * 4); i++) {
      // Get some random assignment objects using a helper function that we imported from ./data
      const reaction = getRandomArrItem(reactions);
      const username = getRandomArrItem(users).username;

      Reactions.push({
        reactionBody: reaction,
        username
      });

    }

    thoughts.push({
      thoughtText,
      username,
      reactions: Reactions
    });
  }

  // Add thoughts to the collection and await the results
  await Thought.collection.insertMany(thoughts);

  for (let i = 0; i < 40; i++) {
    // console.log(thoughts)
    await User.collection.findOneAndUpdate(
      {username: thoughts[i].username},
      { 
        $addToSet: { 
          thoughts: thoughts[i]._id
        } 
      },
      { runValidators: true, new: true }
    )
      .then((User) =>
        !User
          ? console.log("well something went wrong")
          : {}
      )
      .catch((err) => console.log(err));
  }

  // // add reactions
  // for (let i = 0; i < 40; i++) {
  //   // Get some random assignment objects using a helper function that we imported from ./data
  //   const reaction = getRandomArrItem(reactions)
  //   const thought = getRandomArrItem(thoughts);
  //   const username = getRandomArrItem(users).username;

  //   Thought.collection.findOneAndUpdate(
  //     thought,
  //     { 
  //       $addToSet: { 
  //         reactions: {
  //           reactionBody: reaction,
  //           username
  //         } 
  //       } 
  //     },
  //     { runValidators: true, new: true }
  //   )
  //     .then((thought) =>
  //       !thought
  //         ? console.log("well something went wrong")
  //         : {}
  //     )
  //     .catch((err) => console.log(err));
  // }

  // Log out the seed data to indicate what should appear in the database
  console.table(users);
  console.table(thoughts);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
