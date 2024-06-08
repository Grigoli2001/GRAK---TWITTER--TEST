const makeUsername = (name) => {
    const username = name.slice(0,6)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        + 
        Math.floor(Math.random() * 10000);

    return username;
}

const checkExistingUsername = async (username) => {
    try {
        const result = await session.run(
            "MATCH (u:User) WHERE u.username = $username RETURN u",
            { username: username }
        );
        return result.records.length > 0;
    } catch (error) {
        logger.error("Error while checking existing username:", error);
        return true;
    }
}
