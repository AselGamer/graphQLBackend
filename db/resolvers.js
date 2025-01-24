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
			/* console.log(ctx.token);
			const token = ctx.token; 
			if (!token) {
			  throw new Error('No autorizado: El token es necesario');
			} */

			try {
				const student = await database.studentById(id);
				return student;
			} catch (error) {
				throw error;
			}
		},
		/*
			obtenerAsistencias: async (_, { studentId }, ctx) => {
			  const token = ctx.token;
			  if (!token) {
				throw new Error('No autorizado: El token es necesario');
			  }
			  const params = {
				TableName: 'Asistencias',
				FilterExpression: 'studentId = :studentId',
				ExpressionAttributeValues: {
				  ':studentId': studentId
				}
			  };
		
			  try {
				const { Items } = await docClient.send(new ScanCommand(params));
				return Items;
			  } catch (error) {
				throw error;
			  }
			},
		
			obtenerHorasAsistencia: async (_, { studentId }, ctx) => {
			  const token = ctx.token;  
			  if (!token) {
				throw new Error('No autorizado: El token es necesario');
			  }
			  const params = {
				TableName: 'Asistencias',
				FilterExpression: 'studentId = :studentId',
				ExpressionAttributeValues: {
				  ':studentId': studentId
				}
			  };
		
			  try {
				const { Items } = await docClient.send(new ScanCommand(params));
				const totalHoras = Items.reduce((sum, asistencia) => sum + (asistencia.totalHoras || 0), 0);
				return totalHoras;
			  } catch (error) {
				throw error;
			  }
			},
		
			obtenerStudentId: async (_, { token }) => {
			  try {
				const tokenSesion = jwt.verify(token, process.env.SECRETA);  
				return tokenSesion.id;  
			  } catch (error) {
				console.error('Token inválido o expirado:', error);
				return null; 
			  }
			} */
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

		/*
			iniciarSesion: async (_, { email, password }) => {
			  const params = {
				TableName: 'Estudiantes',
				FilterExpression: 'email = :email',
				ExpressionAttributeValues: {
				  ':email': email
				}
			  };
		
			  try {
				const { Items } = await docClient.send(new ScanCommand(params));
				const student = Items[0];
		
				if (!student) {
				  throw new Error('Credenciales inválidas');
				}
		
				const isValid = await bcrypt.compare(password, student.password);
				if (!isValid) {
				  throw new Error('Credenciales inválidas');
				}
		
				const token = crearToken(student,process.env.SECRETA,'4hr');
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
			  const params = {
				TableName: 'Estudiantes',
				FilterExpression: 'email = :email',
				ExpressionAttributeValues: {
				  ':email': email
				}
			  };
		
			  try {
				const { Items } = await docClient.send(new ScanCommand(params));
				const student = Items[0];
		
				if (!student) {
				  throw new Error('Estudiante no encontrado');
				}
		
				const isValid = await bcrypt.compare(contrasenaActual, student.password);
				if (!isValid) {
				  throw new Error('Contraseña actual incorrecta');
				}
		
				const hashedNewPassword = await bcrypt.hash(contrasenaNueva, 10);
		
				const updateParams = {
				  TableName: 'Estudiantes',
				  Key: { id: student.id },
				  UpdateExpression: 'SET password = :newPassword',
				  ExpressionAttributeValues: {
					':newPassword': hashedNewPassword
				  }
				};
		
				await docClient.send(new UpdateCommand(updateParams));
				return true;
			  } catch (error) {
				throw new Error('Error al cambiar contraseña');
			  }
			},
		
			registrarEntradaCurso: async (_, { studentId, courseCode, ubicacion, ip, mac },ctx) => {
			  const token = ctx.token; 
			  if (!token) {
				throw new Error('No autorizado: El token es necesario');
			  }
			  const attendanceId = uuidv4();
		
			  const params = {
				TableName: 'Asistencias',
				Item: {
				  id: attendanceId,
				  studentId,
				  courseCode,
				  entradaFecha: new Date().toISOString(),
				  entradaUbicacion: ubicacion,
				  entradaIP: ip,
				  entradaMAC: mac
				}
			  };
		
			  try {
				await docClient.send(new PutCommand(params));
				return {
				  id: attendanceId,
				  studentId,
				  courseCode,
				  entradaFecha: params.Item.entradaFecha,
				  entradaUbicacion: ubicacion,
				  entradaIP: ip,
				  entradaMAC: mac
				};
			  } catch (error) {
				throw new Error('Error al registrar entrada del curso');
			  }
			},
		
			registrarSalidaCurso: async (_, { attendanceId, ubicacion, ip, mac }, ctx) => {
			  const token = ctx.token;  
			  if (!token) {
				throw new Error('No autorizado: El token es necesario');
			  }
			  const entradaQuery = {
				TableName: 'Asistencias',
				Key: { id: attendanceId }
			  };
		
			  try {
				const { Item: attendance } = await docClient.send(new GetCommand(entradaQuery));
		
				if (!attendance) {
				  throw new Error('Registro de entrada no encontrado');
				}
		
				const entradaFecha = new Date(attendance.entradaFecha);
				const salidaFecha = new Date();
				const totalHoras = (salidaFecha - entradaFecha) / (1000 * 60 * 60);
		
				const updateParams = {
				  TableName: 'Asistencias',
				  Key: { id: attendanceId },
				  UpdateExpression: 'SET salidaFecha = :salidaFecha, salidaUbicacion = :salidaUbicacion, salidaIP = :salidaIP, salidaMAC = :salidaMAC, totalHoras = :totalHoras',
				  ExpressionAttributeValues: {
					':salidaFecha': salidaFecha.toISOString(),
					':salidaUbicacion': ubicacion,
					':salidaIP': ip,
					':salidaMAC': mac,
					':totalHoras': totalHoras
				  },
				  ReturnValues: 'ALL_NEW'
				};
		
				const { Attributes: updatedAttendance } = await docClient.send(new UpdateCommand(updateParams));
				return updatedAttendance;
			  } catch (error) {
				throw new Error('Error al registrar salida del curso');
			  }
			} 
			  */
	}
};

module.exports = resolvers;
