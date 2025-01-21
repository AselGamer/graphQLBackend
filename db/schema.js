const { gql } = require('apollo-server');

const typeDefs = gql`
  type Student {
    id: ID!
    nombre: String!
    email: String!
    password: String!
    curso: String
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

  type AuthPayload {
    token: String!
    student: Student!
  }

  type Query {
    obtenerAlumno(id: ID!): Student
    obtenerAsistencias(studentId: ID!): [Attendance!]!
    obtenerHorasAsistencia(studentId: ID!): Float!
    obtenerStudentId(token: String!): ID
  }

  type Mutation {
    registrarAlumno(
      nombre: String!
      email: String!
      password: String!
    ): AuthPayload!

    iniciarSesion(
      email: String!
      password: String!
    ): AuthPayload!

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
  }
`;

module.exports = typeDefs;