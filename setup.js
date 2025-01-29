const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config();

const sql = postgres({
	host: process.env.POSTGRES_URL,
	port: 5432,
	database: process.env.DB_NAME,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
});

try {
	sql`
	CREATE TABLE students (
			id int4 GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
			"name" varchar NOT NULL,
			email varchar NOT NULL,
			"password" varchar NOT NULL,
			CONSTRAINT email_unique UNIQUE (email),
			CONSTRAINT students_pk PRIMARY KEY (id)
	);`;
	console.log("Se ha creado la tabla students");
} catch (error) {
	console.log("La tabla students ya existe o no ha podido ser creada.")
}

try {
	sql`
	CREATE TABLE attendances (
				id int4 GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
				studentid int4 NOT NULL,
				coursecode varchar NOT NULL,
				entradafecha timestamp NOT NULL,
				salidafecha timestamp NULL,
				entradaubicacion varchar NOT NULL,
				salidaubicacion varchar NULL,
				entradaip varchar NOT NULL,
				salidaip varchar NULL,
				entradamac varchar NOT NULL,
				salidamac varchar NULL,
				totalhoras int4 NULL,
				CONSTRAINT attendance_pk PRIMARY KEY (id),
				CONSTRAINT attendance_students_fk FOREIGN KEY (studentid) REFERENCES public.students(id)
	);`;
	console.log("Se ha creado la tabla attendances");
} catch (error) {
	console.log("La tabla attendances ya existe o no ha podido ser creada.")
}

try {
	sql`
	CREATE TABLE absences (
			id int GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
			studentid int NOT NULL,
			fecha timestamp NOT NULL,
			CONSTRAINT absences_pk PRIMARY KEY (id),
			CONSTRAINT absences_students_fk FOREIGN KEY (studentid) REFERENCES public.students(id)
	);`;
	console.log("Se ha creado la tabla absences");
} catch (error) {
	console.log("La tabla absences ya existe o no ha podido ser creada.")
}

try {
	sql`
	CREATE TABLE teachers (
		id int4 GENERATED BY DEFAULT AS IDENTITY NOT NULL,
		name varchar NOT NULL,
		email varchar NOT NULL,
		"password" varchar NOT NULL,
		CONSTRAINT email_unique UNIQUE (email),
		CONSTRAINT teachers_pk PRIMARY KEY (id)
	);`;
	console.log("Se ha creado la tabla teachers");
} catch (error) {
	console.log("La tabla teachers ya existe o no ha podido ser creada.")
}

process.exit();
