class Database {
	constructor() {
		const postgres = require('postgres');
		const dotenv = require('dotenv');
		dotenv.config();
		this.sql = postgres({
			host: process.env.POSTGRES_URL,
			port: 5432,
			database: process.env.DB_NAME,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
		});
	}

	async studentById(id) {
		const resp = await this.sql`
			select
				id,
				name,
				email
			from students
			where
				id = ${id}
		`;
		console.log(resp[0]);
		return resp[0];
	}

	async insertStudent(student) {
		await this.sql`insert into students ${this.sql(student, 'name', 'email', 'password')
			}`;
	}
}

module.exports = Database;
