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
				email,
				password
			from students
			where
				id = ${id}
		`;
		return resp[0];
	}

	async studentByEmail(email) {
		const resp = await this.sql`
			select
				id,
				name,
				email,
				password
			from students
			where
				email = ${email}
		`;
		return resp[0];
	}

	async addAbsences(date) {
		console.log(date);
	}

	async attendanceByStudentId(studentid) {
		const resp = await this.sql`
			select
				id,
				studentid,
				coursecode,
				entradafecha,
				salidafecha,
				entradaubicacion,
				salidaubicacion,
				entradaip,
				salidaip,
				entradamac,
				salidamac,
				totalhoras
			from attendances
			where
				studentid = ${studentid}
		`;
		return resp;
	}

	async getAttendanceById(id) {
		const resp = await this.sql`
			select
				id,
				studentid,
				coursecode,
				entradafecha,
				salidafecha,
				entradaubicacion,
				salidaubicacion,
				entradaip,
				salidaip,
				entradamac,
				salidamac,
				totalhoras
			from attendances
			where
				id = ${id}
		`;
		return resp[0];
	}

	async getAllAtendancesByStudentId(studentId) {
		const resp = await this.sql`
			select
				id,
				studentid,
				coursecode,
				entradafecha,
				salidafecha,
				entradaubicacion,
				salidaubicacion,
				entradaip,
				salidaip,
				entradamac,
				salidamac,
				totalhoras
			from attendances
			where
				studentid = ${studentId}
		`;
		return resp;
	}

	async insertStudent(student) {
		await this.sql`insert into students ${this.sql(student, 'name', 'email', 'password')
			}`;
	}

	async insertAttendance(attendance) {
		const resp = await this.sql`insert into attendances ${this.sql(attendance, 'studentid', 'coursecode', 'entradafecha', 'entradaubicacion', 'entradaip', 'entradamac')} returning id`;
		return resp[0]['id'];
	}

	async addExitToAttendance(attendanceId, params) {
		const resp = await this.sql`update attendances set ${this.sql(params, 'salidafecha', 'salidaubicacion', 'salidaip', 'salidamac', 'totalhoras')} where id = ${attendanceId} returning attendances.*`;
		return resp[0];
	}

	async updatePassword(id, newPassword) {
		await this.sql`update students set password = ${newPassword} where id = ${id}`;
	}
}

module.exports = Database;
