const Database = require('../config/db');
const { PutCommand, GetCommand, UpdateCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const { v4: uuidv4 } = require('uuid');
const database = new Database();

//Crear y firmas un JWT
const crearToken = (alumno, secreta, expiresIn) => {
	const { id, email, nombre } = alumno;
	return jwt.sign({ id, email, nombre }, secreta, { expiresIn });
}

const resolvers = {
	Query: {
		obtenerAlumno: async (_, { id }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			try {
				const student = await database.studentById(id);
				return student;
			} catch (error) {
				throw error;
			}
		},
		obtenerAsistencias: async (_, { studentId }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			try {
				const attendances = await database.attendanceByStudentId(studentId);
				return attendances;
			} catch (error) {
				throw error;
			}
		},

		obtenerHorasAsistencia: async (_, { studentId }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			try {
				const attendances = await database.getAllAtendancesByStudentId(studentId);
				const totalHoras = attendances.reduce((sum, asistencia) => sum + (asistencia.totalhoras || 0), 0);
				return totalHoras;
			} catch (error) {
				throw error;
			}
		},
	},
	Mutation: {
		registrarAlumno: async (_, { nombre, email, password }) => {
			const hashedPassword = await bcrypt.hash(password, 10);

			const params = {
				name: nombre,
				email: email,
				password: hashedPassword
			};

			try {
				database.insertStudent(params);
				const student = { nombre, email };
				const token = crearToken(student, process.env.SECRET, '4hr');
				return {
					token,
					student
				};
			} catch (error) {
				throw error;
			}
		},

		iniciarSesion: async (_, { email, password }) => {
			try {
				const student = await database.studentByEmail(email);

				const isValid = await bcrypt.compare(password, student.password);
				if (!isValid) {
					throw new Error('Credenciales inválidas');
				}

				const token = crearToken(student, process.env.SECRET, '4hr');
				return {
					token,
					student
				};
			} catch (error) {
				throw error;
			}
		},

		cambiarContrasena: async (_, { email, contrasenaActual, contrasenaNueva }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			try {
				const student = await database.studentByEmail(email);

				if (!student) {
					throw new Error('Estudiante no encontrado');
				}

				const isValid = await bcrypt.compare(contrasenaActual, student.password);
				if (!isValid) {
					throw new Error('Contraseña actual incorrecta');
				}

				const hashedNewPassword = await bcrypt.hash(contrasenaNueva, 10);

				await database.updatePassword(student.id, hashedNewPassword);
				return true;
			} catch (error) {
				throw error;
				// throw new Error('Error al cambiar contraseña');
			}
		},
		registrarEntradaCurso: async (_, { studentId, courseCode, ubicacion, ip, mac }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			const params = {
				studentid: studentId,
				coursecode: courseCode,
				entradafecha: new Date().toISOString(),
				entradaubicacion: ubicacion,
				entradaip: ip,
				entradamac: mac
			};

			const attendanceId = await database.insertAttendance(params);
			return {
				id: attendanceId,
				studentId,
				courseCode,
				entradaFecha: params.entradafecha,
				entradaUbicacion: ubicacion,
				entradaIP: ip,
				entradaMAC: mac
			};
		},
		registrarSalidaCurso: async (_, { attendanceId, ubicacion, ip, mac }, ctx) => {
			const token = ctx.token;
			if (!token) {
				throw new Error('No autorizado: El token es necesario');
			}

			try {
				const attendance = await database.getAttendanceById(attendanceId);

				if (!attendance) {
					throw new Error('Registro de entrada no encontrado');
				}

				const entradaFecha = new Date(attendance.entradafecha);
				const salidaFecha = new Date();
				const totalHoras = (salidaFecha - entradaFecha) / (1000 * 60 * 60);

				const updateParams = {
					salidafecha: salidaFecha.toISOString(),
					salidaubicacion: ubicacion,
					salidaip: ip,
					salidamac: mac,
					totalhoras: totalHoras
				};

				const updatedAttendance = await database.addExitToAttendance(attendanceId, updateParams);
				returnedAttendance = {
					id: updatedAttendance.id,
					studentId: updatedAttendance.studentid,
					courseCode: updatedAttendance.coursecode,
					entradaFecha: updatedAttendance.entradafecha,
					salidaFecha: updatedAttendance.salidafecha,
					entradaUbicacion: updatedAttendance.entradaubicacion,
					salidaubicacion: updatedAttendance.salidaubicacion,
					entradaIP: updatedAttendance.entradaip,
					salidaIP: updatedAttendance.salidaip,
					entradaMAC: updatedAttendance.entradamac,
					salidaMAC: updatedAttendance.salidamac,
					totalHoras: updatedAttendance.totalhoras
				};
				return returnedAttendance;
			} catch (error) {
				throw new Error('Error al registrar salida del curso');
			}
		}
	}
};

module.exports = resolvers;
