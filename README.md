# Twitter Clone

----------
##  Project Overview
----------

The "Twitter/X" project is designed to create a social networking platform for users to share short posts. The following requirements outline the key features, technical specifications, and additional functionalities for successful project development.

**Functiona****lity:**
The main functional components include the User posts and the Real-time feed. Twitter stands out due to its user interactions with comments, retweets, quotes, hashtags, and more. Hence we aimed to implement these core features to the best of our ability.

As mentioned, user engagement is our main priority, facilitated with a real-time feed, allowing users to see new posts from other users without reloading the page.

Below it the project structure

    🗃️ TWITTER-CLONE
    ├─ 
    │  📃READ_ME.md (+ pdf)
    │   references.txt
    │   docker-compose.yml
    │
    ├───back
    │   │   server.js
    │   │   DockerFile
    │   │   query.examples/
    │   ├───boot/
    │   ├───constants/
    │   ├───database/
    │   ├───middleware/
    │   ├───models/
    │   ├───routes/
    │   ├───services/
    │   ├───sockets/
    │   └───utils/│
    └───front
        └───src
            │   App.js
            │   DockerFile
            ├───components
            │   │
            │   ├───authComponents/
            │   ├───home/
            │   ├───layouts/
            │   ├───messages/
            │   ├───profile/
            │   └───tweet/
            ├───constants/
            ├───context/
            ├───features
            │   └───tweets
            |───hooks/
            ├───pages/
            ├───routes/
            ├───store
            ├───styles/ 
            └───utils/


## 🧰 **Requirements**
----------

**Front End**
Our front end was built with React, a powerful Javascript Library for building dynamic state based web applications. 

**Back End**
Our back-end will be set up in Nodejs, a javascript runtime which is a popular tool in server-side programming. Here we used Express as our server to handle all our API calls.

We also used SocketIO to handle real-time features such as chat, notifications, and feeds.

**Databases:**
As per the project requirements, we used Neo4j, MongoDB, and Redis to store data for our application. This is discussed in more detail in the [Understanding the Project](https://www.dropbox.com/scl/fi/fat0ge5xivts2j0gh76cm/Untitled-1.paper?rlkey=eme8kh6muuik7u2weqm9qp4vz&dl=0#:uid=652611581505672398590945&h2=%E2%9A%9B%EF%B8%8F-Understanding-the-Project) section.

All you need to run this development application is the latest version of node js installed. Ensure that if you want to run locally, you have also installed the relevant database engines. Then head to the Quick Start to get up and running.
 

## 🟢 Quick Start
----------

Let’s get you started! 
There are two ways you can set up this project:

1. **Using Docker**
- To set up with docker, navigate to the main project directory and run 
- Ensure that the react app proxy is set in the package.json to "proxy": "http://backend:8080", 
    docker-compose up

This should create a docker container that exposes both port 3000 for the front end and port 5000 for the back end (if you want to test the API only). 


2. **Local Setup**
    
    **Front-end Setup:**
- From the main project directory, navigate to the front folder and run `npm install` to download all the node module dependencies.
- Ensure that the react app proxy is set in the package.json to "proxy": "http://localhost:8080", 
- Finally, run `npm start` to start the front-end react application


    cd front
    npm install
    npm start


    **Back-end Setup:**
- Similarly as above, head to the back folder from the main directory.
- Start the nodejs backend application with `npm start` 
    cd back
    npm install
    npm start

**NB:** 
**To use the database and queries in the backend, a MongoDB replica set is required. The guide to set this up can be found in the** [**References**](/scl/fi/37owriwioao418gbl557k/GRAK-Twitter-Clone.paper?rlkey=hcyvuujrfzl6aqr82bygm8cpd&dl=0#:h2=Replica-sets-for-MongoDB-trans) **section.**



    


## ⚛️ Understanding the Project
----------

To begin our project, we first decided to have a flowchart and discuss the base of our project. This includes choosing the type of database to go with, the structure of our project files, and so on. Our goal was to create an application that not only meets all the requirements for the project but also uses good coding principles and a future-proof design that can be managed and scaled easily.

These are the specifications of our project and why we chose them.

**Neo4j**

- We opted to utilize Neo4j database to store comprehensive user information, encompassing personal details, settings, preferences, as well as relations between users due to the powerful Neo4j graphical structure. This made queries for relations, such as finding the followers of users, blocking users, and setting post notifications effective for our application


    - The blocking users relationship is defined by `BLOCKS`. Here the user `testing15name` has blocked the other two users. This means that they cannot view `testing15name``'``s` account, posts, messages. When the `BLOCKS` relationship is applied, `FOLLOWS` and `NOTIFIES` are removed in both directions.
    
![](https://paper-attachments.dropboxusercontent.com/s_73219C6513A2BBC6F32AB8788D5E8EF42572632FAE456FF294BD0A4546376D30_1718205831206_image.png)

    


        
    - The follower relationship is denied by `FOLLOWS`. Here we can see the relations between users who follow each other. 
        
![](https://paper-attachments.dropboxusercontent.com/s_73219C6513A2BBC6F32AB8788D5E8EF42572632FAE456FF294BD0A4546376D30_1718205046168_image.png)

    - The post notification relationship is defined by `NOTIFIES` and is directed from one user who notifies another when the initial user has posted. In the following case, when the user `testing6name` posts, `testing15name` will be notified
    
![](https://paper-attachments.dropboxusercontent.com/s_73219C6513A2BBC6F32AB8788D5E8EF42572632FAE456FF294BD0A4546376D30_1718204807974_image.png)

    

**MongoDB**

- In handling tweet-related data, which includes replies, likes, bookmarks, and more, we chose Mongo DB. MongoDB provides a scalable solution for managing dynamic data associated with tweets, facilitating quick and efficient retrieval of information and accommodating the evolving nature of user interactions on the platform. This choice aligns with the need for adaptability and scalability in handling diverse and evolving tweet-related data within the social networking environment.


- Initially, we thought of storing all the quantifiable tweet information like likes, bookmarks, and poll votes with the tweet itself, but soon we saw a problem
    The fact that MongoDB has a 4mb - 16mb limit on array sizes means that scalability for the future may prove to be difficult, causing an entire shift in the schema of these entities. That is why we decided to split the tweets from user interactions such as likes, bookmarks, and polls. This allows us to have a separate collection for interactions and link these interactions back to the tweets using the tweet’s id. Despite the previously mentioned pros above we did factor in the cons. Using such a structure could result in more complex queries and less readability. 
    Ultimately we concluded that a more flexible and scalable approach has more priority.
        
- Another decision to make was where we were going to store our media. Given that Twitter is a heavy media-sharing application, we needed to pick a fast efficient option, and at the same time secure. We went through several options, including storing the images as a Buffer directly in the database or using multers to store the images on the server for easy access. Eventually, we decided to go for a cloud service, Firebase to manage our application media, right from the profile picture of the user to all the tweet images and videos.
    
- Another idea we discussed was using replica sets in MongoDB. While having a single node instance of MongoDB seems intuitive in a development environment, the same doesn't hold good for production. Due to any circumstances, if this single node fails, all the data is either non-accessible or compromised. Replication provides redundancy and increases data availability. With multiple copies of data on different database servers, replication provides fault tolerance against losing a single database server. This adds further redundancy to our data and encourages a scalable implementation for any future releases or increased traffic.
        
    In addition, handling complex queries (as mentioned before) is made possible with transactions to ensure data consistency in the event of failures that would otherwise make our data unreliable. Transactions allow you to run a certain set of queries, where either all run or none, meaning that if any error happens during the execution, all changes are reverted to before the transaction starts. These are powerful tools in database management to mitigate data unreliability and inconsistency. This required a bit more configuration for our docker container. Transactions can only be used in replica sets, giving another beneficial reason to use the latter.
    
    

**Redis**

- Redis is used throughout the project to store data that expires over time. Firstly, we used Redis to store one-time passwords (OTPs) for user registration and forgot password features, to ensure that the user has confirmed their email address. If you do not want to use a real email address, check out https://temp-mail.org/ and use a temporary email address. If running locally, you can check the Redis key located at `otp:<your-email>`. If running locally, the OTP is also console-logged for simplicity when using the project.
- Another use of Redis is storing messages for a window of time in a sorted set. Each message between two users is initially stored in Redis to provide quick message entry and retrieval when fetching messages. The score for each message is the date it was sent, so messages are automatically sorted when entered into the Redis store. A background worker then uses the date (score) to check if any messages are older than a predefined period, in our case, 30 minutes. Once a message is considered stale in Redis, it is then persisted in MongoDB and clears the message from the sorted set in Redis. This feature enabled us to implement a `delete for you or delete for everyone` feature too. All messages can be removed for a given user, but only messages less than 15 minutes (to be safe when persisting messages) can be deleted for everyone. 
- In addition, Redis is also used to store session data using express sessions enabling us to use our refresh tokens. For our application, we use JWT tokens to authenticate our user which expires after 3h while the session expires in Redis after 24h.
- Finally, we used Redis to implement a rate-limiting feature on our authentication routes. When a user sends a request to some of our auth routes that use the `rateLimit` middleware, a new key is created in the Redis store if it does not exist and increments its count by 1. The first argument sets the TTL for the Redis key, and the second argument sets the maximum number of requests from a given IP before the key expires. If it exceeds the maximum, a response with error code 429 is returned.
![](https://paper-attachments.dropboxusercontent.com/s_73219C6513A2BBC6F32AB8788D5E8EF42572632FAE456FF294BD0A4546376D30_1718203574505_image.png)


**Example queries:**
Examples of queries used for each database can be found `queries.examples` directory for the relevant database. Otherwise, this document may be too long.

**Notable Features**

- Live Feed 
- Retweeting, Replying, Bookmarking, Quoting
- Live Poll Data
- Hashtag on tweets (created by writing #<your_tag> and double clicking on the pop up) as shown below
![](https://paper-attachments.dropboxusercontent.com/s_73219C6513A2BBC6F32AB8788D5E8EF42572632FAE456FF294BD0A4546376D30_1718212018710_image.png)

- Infinite scrolling tweet pages
- Trending tags and explore page
- Searching for users and tags
- Live notifications
- Live Messaging with deleting messages and conversations
- Google authentication sign in/up
- Refresh tokens
- Sharing posts via URL
- Editing and deleting tweets
- Updating user settings and profile
- User feedback with toasts
- Blocking users
- Setting post notifications for users
- Rate Limiting
## 🐛 Known bugs and future implementations
----------
- Currently, there is a known issue with viewing a reply of a comment in full view. The state of the comment and its parent post remains the same due to a state issue. As a team, we were not able to come up a with a working solution as we didn't really understand what was causing the issue in the first place. We suspected it could be the fact that the variable used to display the post information had been a state of a state. Somehow due to this, the comment being rendered had the same information as its parent.
## 📝 Project References
----------

**Replica sets for MongoDB transactions**

https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/


