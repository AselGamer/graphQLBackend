const { gql } = require('apollo-server');

const typeDefs = gql`
  type Student {
    id: ID!
    name: String!
    email: String!
    password: String!
    curso: String
  }

  type Teacher {
	  id: ID!
	  name: String!
      email: String!
	  password: String!
  }

  type Attendance {
    id: ID!
    studentId: ID!
    courseCode: String!
    entradaFecha: String!
    salidaFecha: String
    entradaUbicacion: String
    salidaUbicacion: String
    entradaIP: String
    salidaIP: String
    entradaMAC: String
    salidaMAC: String
    totalHoras: Float
  }

  type Absence {
   id: ID!
   studentid: ID!
   fecha: String!
  }

  type AuthPayload {
    token: String!
    student: Student!
  }

  type AuthPayloadTeacher {
    token: String!
    teacher: Teacher!
  }

  type Query {
    obtenerAlumno(id: ID!): Student
    comprobarSesion: Boolean
	obtenerAsistencias(studentId: ID!): [Attendance!]!
	obtenerHorasAsistencia(studentId: ID!): Float!
	obtenerFaltasPorEstudiante(studentId: ID!): [Absence!]!
    obtenerFalta(id: ID!): Absence
    obtenerFaltas: [Absence!]!
  }

type Mutation {
	registrarAlumno(
		nombre: String!
		email: String!
		password: String!
	): AuthPayload!
	registrarProfesor(
		nombre: String!
		email: String!
		password: String!
	): AuthPayloadTeacher!
	iniciarSesion(
		email: String!
		password: String!
	): AuthPayload!
	iniciarSesionProfesor(
		email: String!
		password: String!
	): AuthPayloadTeacher!
	cambiarContrasena(
		email: String!
		contrasenaActual: String!
		contrasenaNueva: String!
	): Boolean!
	registrarEntradaCurso(
		studentId: ID!
		courseCode: String!
		ubicacion: String!
		ip: String!
		mac: String!
	): Attendance!
	registrarSalidaCurso(
		attendanceId: ID!
		ubicacion: String!
		ip: String!
		mac: String!
	): Attendance!
	registrarFalta(
		studentId: ID!,
		fecha: String!
	): Absence!
    eliminarFalta(
		id: ID!
	): Boolean!
}
`;

module.exports = typeDefs;
