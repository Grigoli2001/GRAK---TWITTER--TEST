## Neo4j Queries

#### Create Index for the user on name and username since these are often searched (not composite)
```bash
CREATE INDEX FOR (u:User) ON (u.name);
CREATE INDEX FOR (u:User) ON (u.username);
```

#### Get exlcuded users: creates a set of user that blocks the user or the user blocks without duplicates
```bash
MATCH (u:User {id: $userId})-[:BLOCKS]->(b:User) RETURN b.id as id
UNION
MATCH (u:User {id: $userId})<-[:BLOCKS]-(b:User) RETURN b.id as id
```

#### Get blocked users; get any users that the user has blocked
```bash
MATCH (u:User {id: $currentUser})-[r:BLOCKS]->(f:User {id: $blockedUser}) RETURN f
```

 #### Get all users to notify when the user makes a post
 ```bash
 MATCH (u:User {id: $userId})-[:NOTIFIES]->(f:User) RETURN f.id as id`
 ```

 #### Get basic user info (there are other examples of basic user queries in different services)
 ```bash
    MATCH (u:User {username: $username})
    RETURN {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        profile_pic: u.profile_pic,
        cover: u.cover,
        created_at: u.created_at,
        dob: u.dob,
        bio: u.bio,
        website: u.website,
        location: u.location
    }
```

#### Get Full details for user profile
<b> target user is the user whose profile will be visited or accessed </b>
- checks if the current user is blocked by the user whose profile is targeted
- optionally checks: 
    - if the current user blocks the targeted user; this provides the current user the opportunity to still unblock the user
    - gets all the users who follows the user and the user follows; used to get the number of followers and following in the return with `COUNT DISTINCT(...)`
    - checks if the current user follows the target user, used for state in the front
```bash
MATCH (u:User {${fetch_how}: $targetUser})
    WHERE NOT EXISTS((u)-[:BLOCKS]->({id: $currentUser}))
    OPTIONAL MATCH (u)<-[b:BLOCKS]-(User {id: $currentUser})
    OPTIONAL MATCH (u)-[f1:FOLLOWS]->(following:User)
    OPTIONAL MATCH (u)<-[f2:FOLLOWS]-(follower:User)
    OPTIONAL MATCH (u)<-[f:FOLLOWS]-(currentUser:User {id: $currentUser})
    RETURN u.id as id, 
    u.name as name, 
    u.username as username, 
    u.email as email,
     u.profile_pic as profile_pic, 
     u.cover as cover,
    u.bio as bio,
    u.location as location,
    u.website as website,
     u.created_at as created_at,
    COUNT(DISTINCT following) as following_count,
    COUNT(DISTINCT follower) as followers_count,
    CASE 
      WHEN f IS NOT NULL THEN 1
      ELSE 0
      END
      AS is_followed,
    CASE
        WHEN b IS NOT NULL THEN 1
        ELSE 0
    END as is_blocked
```

#### Get info for user from search bar (excludes blocked users)
```bash
    MATCH (u:User) 
    WHERE u.id <> $current_userid 
    AND NOT EXISTS((u)-[:BLOCKS]->({id: $current_userid}))
    AND  (u.username  CONTAINS $query_user OR u.name CONTAINS $query_user) 
    RETURN 
    {
        id: u.id, 
        name: u.name, 
        username: u.username, 
        email: u.email, 
        profile_pic: u.profile_pic, 
        created_at: u.created_at
    } as u
      ORDER BY u.username LIMIT 6
```

#### Get users that the current user does not follow or is not blocked , skip and limit for paginated data on infinite scroll
```bash
MATCH (u:User) WHERE u.id <> $userid AND NOT (u)<-[:FOLLOWS]-(:User {id: $userid})  AND NOT EXISTS((u)<-[:BLOCKS]->({id: $userid}))
OPTIONAL MATCH (u)-[:FOLLOWS]->(f:User)
OPTIONAL MATCH (u)<-[:FOLLOWS]-(f2:User)
RETURN 
    u.id as id,
    u.name as name,
    u.username as username,
    u.profile_pic as profile_pic,
    count(distinct f) as following_count, 
    count( distinct f2) as followers_count
    ORDER BY rand() SKIP $skip LIMIT $limit
```

#### Get who follows a user/who the user is following depeneding on request type
```bash
MATCH (u:User {id: $userId})<-[:FOLLOWS]-(f:User) # this will get the followers of the current user
# change direction to get who the current user is following i.e. -[:FOLLOWS]->
# WHERE u.verified = true : this is optional for getting verified followers
OPTIONAL MATCH (f)-[:FOLLOWS]->(following:User) 
WITH f, count(following) as followingCount
OPTIONAL MATCH (f)<-[:FOLLOWS]-(followers:User)
WITH f, followingCount, count(followers) as followersCount
OPTIONAL MATCH (f)<-[:FOLLOWS]-(is_followed_check:User {id: $userId})
RETURN f {.*, followingCount: followingCount, followersCount: followersCount, is_followed: CASE WHEN is_followed_check IS NOT NULL THEN 1 ELSE 0 END}
SKIP $toSkip
LIMIT $resolveLimit
```

#### Set the `FOLLOWS` relationship if it does not exist
```bash
MATCH (u:User {id: $userid}), (f:User {id: $otherUserId}) MERGE (u)-[:FOLLOWS]->(f)
```

#### Remove the `FOLLOWS` relationship if it exists
```bash
MATCH (u:User {id: $1})-[r:FOLLOWS]->(f:User {id: $2}) DELETE r
```

#### Set the `NOTIFIES` relationship if it does not exist
```bash
MATCH (u:User {id: $currentUser}), (f:User {id: $otherUser}) MERGE (f)-[:NOTIFIES]->(u)
```

#### Remove the `NOTIFIES` relationship if it exists
```bash
MATCH (u:User {id: $currentUser})<-[r:NOTIFIES]-(f:User {id: $otherUser}) DELETE r
```

#### Block a user: adds `BLOCKS` relationsip and Removes `NOTIFIES` and `FOLLOWS` if it exists in either direction
```bash
MATCH (u:User {id: $currentUser}), (f:User {id: $blockedUser}) MERGE (u)-[:BLOCKS]->(f)
with u, f
OPTIONAL MATCH (u)-[fbrel:FOLLOWS]-(f)
DELETE fbrel
with u, f
OPTIONAL MATCH (f)-[nbrel:NOTIFIES]-(u)
DELETE nbrel
```

#### Unblock a user: Removes `BLOCKS` relationsip
```bash
MATCH (u:User {id: $currentUser})-[r:BLOCKS]->(f:User {id: $blockedUser}) DELETE r
```

