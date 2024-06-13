## Redis Queries

## RateLimit
#### Set ip key with count value, increment,and expire

```lua
INCR rate-limit:<path>:<ip>
EXPIRE  rate-limit:<path>:<ip> <time_in_seconds>
```

#### Get ip and number of times request was sent

```lua
GET rate-limit:<path>:<ip>
```


## OTP
#### Set otp for a given email and expire

```lua
SET otp:<email> value
EXPIRE  otp:<email> 600 # -- expire otp in 10 minutes
```

#### Rmove otp once validated
```lua
DELETE otp:<email>
```

## Messages
#### Get Messages in a Room

```

```

#### Get Spcecific message from a room using score

````
````

#### delete message using score
````
````