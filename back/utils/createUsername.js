const makeUsername = (name) => {
    const username = name.slice(0,6)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        + 
        Math.floor(Math.random() * 10000);

    return username;
    }
