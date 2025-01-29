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

	async teacherByEmail(email) {
		const resp = await this.sql`
			select
				id,
				name,
				email,
				password
			from teachers
			where
				email = ${email}
		`;
		return resp[0];
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

	async getAbsenceById(id) {
		const resp = await this.sql`
        select
            id,
            studentid,
            fecha
        from absences
        where
            id = ${id}
    `;
		return resp[0];
	}

	async getAbsences() {
		const resp = await this.sql`
        select
            a.id,
            s.name,
            a.fecha
        from absences a
		inner join students s on s.id = a.studentid
    `;
		return resp;
	}

	async getAbsencesByStudentId(studentId) {
		const resp = await this.sql`
        select
            id,
            studentid,
            fecha
        from absences
        where
            studentid = ${studentId}
    `;
		return resp;
	}

	async insertStudent(student) {
		await this.sql`insert into students ${this.sql(student, 'name', 'email', 'password')
			}`;
	}

	async insertTeacher(teacher) {
		const resp = await this.sql`insert into teachers ${this.sql(teacher, 'name', 'email', 'password')
			} returning id, name, email, password`;
		return resp[0];

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
	async createAbsence(studentId, fecha) {
		const resp = await this.sql`
        insert into absences (
            studentid,
            fecha
        ) values (
            ${studentId},
            ${fecha}
        )
        returning id, studentid, fecha
    `;
		return resp[0];
	}

	async updateAbsence(id, studentId, fecha) {
		const resp = await this.sql`
        update absences
        set
            studentid = ${studentId},
            fecha = ${fecha}
        where
            id = ${id}
        returning id, studentid, fecha
    `;
		return resp[0];
	}

	async deleteAbsence(id) {
		const resp = await this.sql`
        delete from absences
        where
            id = ${id}
        returning id
    `;
		return resp[0];
	}

	async isTeacher(email) {
		const resp = await this.sql`
		select 
			id 
		from teachers 
			where email = ${email}
		`;
		return !!resp;
	}

	async allStudents() {
		const resp = await this.sql`
			select
				id,
				name,
				email,
				password
			from students
		`;
		return resp;
	}
}

module.exports = Database;
