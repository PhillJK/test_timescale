const postgres = require("postgres");

module.exports = postgres(process.env.PG_DATABASE_URL, {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
});
