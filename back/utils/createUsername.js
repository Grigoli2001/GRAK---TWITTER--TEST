const makeUsername = (name) => {
    const username = name.slice(0,6)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        + 
        Math.floor(Math.random() * 10000);

    return username;
    }

const checkExistingUsername = async (username) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "SELECT * FROM users WHERE username = $1;",
            [username]
        );
        return rows.length > 0;
    } catch (error) {
        logger.error("Error while checking existing username:", error);
        return true;
    } finally {
        client.release();
    }
}