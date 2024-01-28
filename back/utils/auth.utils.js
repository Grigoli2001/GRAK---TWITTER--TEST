const makeUsername = (name) => {
    const username = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0,6)
        + 
        Math.floor(Math.random() * 10000);

    return username;
    }


const checkExisting = async (client,data,column) => {
    try {
        if(column){
        const { rows } = await client.query(
            "SELECT $1 FROM users WHERE $2 = $3;",
            [1,column,data]
        );
        return rows.length > 0;
        } else {
            const { rows } = await client.query(
                "SELECT $1 FROM users WHERE username = $2 OR email = $2;",
                [1,data]
            );
            return rows.length > 0;
        }
    } catch (error) {
        logger.error(`Error while checking existing ${column}:`, error);
        return true;
    }
}

module.exports = {
    makeUsername,
    checkExisting,
}