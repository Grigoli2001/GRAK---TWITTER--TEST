# GRAK Twitter Clone
Submitted 

----------
##  Project Overview
----------

The "Twitter/X" project is designed to create a social networking platform for users to share short posts . The following requirements outline the key features, technical specifications, and additional functionalities for successful project development.

**Functiona****lity:**
The main functional components include the User posts and the Real-time feed. Twitter stands out due to its large set of user interactions with comments, retweets, quotes, hashtags, and more. Hence we aimed to implement these core features to the best of our ability.

As mentioned, user engagement is our main priority and that will only be possible with a real time feed, allowing users to see new posts from other users  without having to reload the page.

**Versioning and Collaborative Tools:**

Not only is the application the main requirement, an important aspect of this project is the collaborative aspect. As a group of 4, our job is to tackle real-world problems when it comes to collaboration and create a systemic way to assign tasks and track progress.

By adhering to these requirements, this "Twitter/X Clone" project aims to deliver a fully functional social networking platform, providing a practical experience in full-stack software development.


    🗃️ GRAK-TWITTER
    ├─ 
    │  📃READ_ME.md (+ pdf)
    │   references.txt
    │
    ├───back
    │   │   server.js
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
            │   └───tweets --unused
            |───hooks/
            ├───pages/
            ├───routes/
            ├───store --unused
            ├───styles/ 
            └───utils/
## 🧰 **Requirements**
----------

Front End
As per the requirements, our front-end was build  in React, a powerful Javascript Library for building dynamic and “state” based web-applications. 

Back End
Our back-end will be setup in Nodejs, a javascript runtime which is a popular tool in server-side programming. Here we used express as our server to handle all of our API calls.

All you need to run this development application is the latest version of nodejs installed. Then head to the Quick Start to get up and running.
 
 
 

## 🟢 Quick Start
----------

Let’s get you started! 


1. **Clone the Git Repository:**
- Clone the repository from github to get started and cd into the application


    bash
    git clone https://github.com/Grigoli2001/GRAK-TWITTER.git
    cd GRAK-Twitter


2. **Front-end Setup:**
- From the main project directory, navigate to the front folder and run  `npm install` to download all the node module dependencies.
- Finally, run `npm start` to start the front-end react application


    cd front
    npm install
    npm start


3. **Back-end Setup:**
- Similarly as above, head to the back folder from the main directory.
- Start the nodejs backend application with `npm start` 
    cd back
    npm install
    npm start

**NB: To use the database and queries in the backend, a MongoDB replica set is required. The guide to set this up can be found in the** [**References**](/scl/fi/37owriwioao418gbl557k/GRAK-Twitter-Clone.paper?rlkey=hcyvuujrfzl6aqr82bygm8cpd&dl=0#:h2=Replica-sets-for-MongoDB-trans) **section.**



We have used MySQL to store the user and follower data. The queries to create the tables can be found here:


    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(140) UNIQUE,
        bio VARCHAR(255),
        location VARCHAR(255),
        website VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        dob DATE,
        profile_pic VARCHAR(255),
        cover VARCHAR(255),
        isGetmoreMarked BOOLEAN,
        isConnectMarked BOOLEAN,
        isPersonalizedMarked BOOLEAN,
        selectedTopics VARCHAR(255),
        selectedCategories VARCHAR(255),
        selectedLanguages VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE follows (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        following INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX username_idx on Users(username);


## ⚛️ Understanding the Project
----------

To begin our project, we first decided to have a flowchart and discuss the base of our project. This includes choosing the type of database to go with, the structure of our project files, and so on. Our goal was to create an application that not only meets all the requirements for the project but also uses good coding principles and a future-proof design that can be managed and scaled easily.

These are the specifications of our project and why we chose them.


1. Database
    - We opted to utilize PostgreSQL as our SQL database to store comprehensive user information, encompassing personal details, settings, preferences, as well as follower and following information. This decision was driven by the relational nature of SQL databases, offering structured data storage and efficient query processing. PostgreSQL, known for its reliability and scalability, ensures a robust foundation for managing user-related data and interactions within the "Twitter/X" platform.
    
    - In handling tweet-related data, which includes replies, likes, bookmarks, and more, we chose a NoSQL database. This decision was motivated by the flexible and schema-less nature of NoSQL databases, which is particularly beneficial for handling varied and evolving tweet structures. NoSQL databases, like MongoDB, provide a scalable solution for managing dynamic data associated with tweets, facilitating quick and efficient retrieval of information and accommodating the evolving nature of user interactions on the platform. This choice aligns with the need for adaptability and scalability in handling diverse and evolving tweet-related data within the social networking environment.


        - Initially, we thought of storing all the quantifiable tweet information like likes, bookmarks, and poll votes with the tweet itself, but soon we saw a problem
            The fact that MongoDB has a 4mb - 16mb limit on array sizes means that scalability for the future may prove to be difficult, causing an entire shift in the schema of these entities. That is why we decided to split the tweets from user interactions such as likes, bookmarks, and polls.  This allows us to have a separate collection for interactions and link these interactions back to the tweets using the tweet id. The pros to this are mentioned above but it's also important to discuss the cons. Using such a structure could result in more complex queries and less readability. Ultimately we concluded that a more flexible and scalable approach has more priority.
        
        - Another decision to make was where we were going to store our media. Given that Twitter is a heavy media-sharing application, we needed to pick a fast efficient option, and at the same time secure. We went through several options, including storing the images as a Buffer directly in the database or using multers to store the images on the server for easy access. Eventually, we decided to go for a cloud service, namely Firebase to manage our application media, right from the profile picture of the user to all the tweet images and videos. Firebase is a **Backend-as-a-Service (BaaS) app development platform** that provides hosted backend services such as a real-time database, cloud storage, authentication, crash reporting, machine learning, remote configuration, and hosting for your static files. It seemed like a perfect match to host our static media on it.
        
        - Another idea we discussed was using replica sets in MongoDB. While having a single node instance of MongoDB seems intuitive in a development environment, the same doesn't hold good for production. Due to any circumstances, if this single node fails, all the data is either non-accessible or compromised. This is where the idea of replication comes in. Replication provides redundancy and increases data availability. With multiple copies of data on different database servers, replication provides a level of fault tolerance against the loss of a single database server. Now this might seem a bit unnecessary for a small-scale project, but again our goal is to build something sustainable and scalable. 
    
        - As mentioned before, having multiple models for tweet information could cause some complex queries, especially the fact that these queries would take place over different collections. The issue with this is there is always a chance of database inconsistency caused by failures, making our data unreliable. Here comes the concept of transactions. Transactions allow you to run a certain set of queries, where either all run or none, meaning that if any error happens during the execution, all changes are reverted to before the transaction starts. These are powerful tools in database management to mitigate data unreliability and inconsistency. In SQL, these transactions are pretty straightforward forward but in NoSQL, particularly MongoDB, it requires a bit of configuration. Transactions can only be used in replica sets, giving another beneficial reason to use the latter.


2. Redux vs React-Query


    Twitter has a lot of different types of tweets. You have the For you section on the homepage where you can see recommended tweets, the following section where you can see tweets of your followers, my tweets, liked tweets, bookmarked tweets, and so on.
    
    As we expand our application, this modular approach proves crucial in accommodating new tweet categories seamlessly.
    
    The efficiency of CRUD operations is a standout advantage. Whether a user is creating a new tweet, deleting an existing one, or removing a bookmark (or like), these operations were initially abstracted through Redux actions and managed uniformly across all categories. The intention was that our tweet data remain synchronized and avoid inconsistencies that may arise from dealing with separate local states.
    
    Performance optimization is another noteworthy benefit of our initial implementation. Redux's ability to handle state changes efficiently becomes particularly valuable when multiple tweet categories require simultaneous updates. 


    However, we did manage to overlook the complexity of nested states i.e. Having a global state manager for the collection of types of tweets (for you, following, replies, etc.) caused unresolved bugs when managing a single Tweet’s state. For example, liking a tweet would update its state, but not the state of the redux store, unless through more complex loops find and update a single Tweet or re-fetching the data from scratch which would defeat the purpose of redux. Another caveat that we discovered later in the project included our initial approach did not allow the current user to view other users’ tweets as the stale (previous user profile) state would need to be re-fetched each time, again defeating the purpose of our redux store.


    
    Our final solution (as of Jan 18 2024) was to use another package from tanstack called react query.  This package allowed us to have the benefit of live data when for different actions such as posting, replying etc. This is because react query stores the data retrieved from a request in the cached, and allows us to have full control over when to invalidate queries setting the current data stored in the cache to be stale, forcing the query to be run when necessary. Another benefit that came with this package was the built-in useInfiniteQueryHook which simplified the process for creating infinite scroll components without the use of other external components, much easier.  Admittedly, since this switch came later into the project, it could have been better implemented with more configuration.


    


3. Context API


-  We used the context API to manage the state of the current user. Some user information is needed almost everywhere and prop drilling would have been a hassle. To solve this, we decided to manage the user in a UserContext. On login, we get the required information from a token and on the client side, we decide it and save it in the state. Now we have access to the necessary information for anywhere in the application.


-  Sockets also were integrated in their own context for the same reason. Sockets provided a way to manage the real-time feed and messaging. Having to initialize this socket on every page that needed it would have been very inefficient. With the help of the socket context, the socket is now available in every component to use.


- Similarly, since many of the routes are navigatable from the Browser, the RequireValidUser component helps to simplify the process of checking if a user is found or not for many of these routes. If a user is found, its data is pushed through the context for ease of use instead of having to check.


4. Postman

 
 To view the available API for the user, message, tweet and other services, please use the collections provided in postman.  
 
 Most of the collections (excluding token and Auth services) are token protected. To use these routes, please complete the sign-up and login services. After completing the login/signups service, a token and refresh token will be set into your collection variables. Any protected route can then be used using the `Bearer Authentication` in the Authentication Tab, with the {{token}} variable. 
 
 Any JSON data needed to be added for the request ( in the case of POST) can be added in the Body section of the Postman Request view. All the tests for a request are available in the Test section.
 
NB: If your token expires, the new token will be auto replaced, allowing for a seamless use of the postman APIs.


**Notable Features**

- Live Feed 
- Retweeting, Replying, Bookmarking, Quoting
- Live Poll Data
- Infinite scrolling tweet pages
- Trending tags and explore 
- Searching for users and tags
- Live notifications
- Live Messaging with deleting messages and conversations
- Google authentication sign in/up
- Refresh tokens
- Sharing posts via url
- Editing and deleting tweets
- Updating user settings and profile
- User feedback with toasts


## ❌ Issues Faced
----------

The concept of redux, while simple to use, can be a little complicated to set up and implement. We were unsure of our reducer implementation and how the fetching should be done. We were unsure if each tweet category should have been fetched in the beginning or if each category has a component that fetches only when necessary. Small things like this would cause a drastic difference in performance and usage, but we were unclear which would be the best option which took us a long time to decide as were not sure of best practices.

The collaboration aspects of using git and managing branches on a project this big and with many collaborators posed a huge obstacle. The number of times we were trying to help each other with git-related issues was beyond measure and took away time potentially spent on the project itself.

In addition to the daily tasks we undertook, unfortunately, one of our team members had a few technical difficulties that resulted in a backlog of work causing the project to be delayed.

All in all, it was a major learning experience on how projects are managed in a real work setting and the difficulties in collaboration. We will take a lot from this project and will most definitely improve on our next ones.



## 🐛 Known bugs and future implementations
----------
- Currently there is a known issue with viewing a reply of a comment in full view. The state of the comment and its parent post remains the same due to a state issue. As a team, we were not able to come up a with a working solution as we didn't really understand what was causing the issue in the first place. We suspected it could be the fact that the variable used to display the post information had been a state of a state. Somehow due to this, the comment being rendered had the same information as its parent.



## 📝 Project References
----------

**Navigatable Modals**
https://medium.com/@stephen.ligtenberg/programmatically-controlled-modal-with-react-router-v6-2853a3d9a976

https://github.com/mui/material-ui/issues/18811


[mui/material-ui#18811](https://github.com/mui/material-ui/issues/18811)

**Es module with common js**

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import


**Replica sets for MongoDB transactions**

https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/


https://stackoverflow.com/questions/69727243/react-search-using-debounce

