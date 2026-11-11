# language: es
@api @usuarios
Característica: Usuarios (API)
  Como consumidor de la API
  Quiero gestionar usuarios
  Para que las personas puedan tener su propia cuenta

  @API-01 @smoke
  Escenario: Crear un usuario nuevo
    Cuando creo un usuario nuevo por API
    Entonces la respuesta tiene código 201
    Y la respuesta incluye un token
    Y la respuesta incluye el email del usuario

  @API-02
  Escenario: Crear usuario con email ya registrado
    Dado que existe un usuario registrado
    Cuando creo otro usuario con el mismo email por API
    Entonces la respuesta tiene código 400
    Y el mensaje de la respuesta contiene "Email address is already in use"

  @API-03
  Escenario: Crear usuario sin campos obligatorios
    Cuando creo un usuario sin datos por API
    Entonces la respuesta tiene código 400
    Y el mensaje de la respuesta contiene "User validation failed"

  @API-06
  Escenario: Consultar el perfil del usuario
    Dado que existe un usuario registrado
    Cuando consulto mi perfil por API
    Entonces la respuesta tiene código 200
    Y la respuesta incluye el email del usuario
    Y la respuesta no incluye la contraseña

  @API-07
  Escenario: Consultar el perfil sin token
    Cuando consulto mi perfil por API sin token
    Entonces la respuesta tiene código 401

  @API-08
  Escenario: Actualizar datos del usuario
    Dado que existe un usuario registrado
    Cuando actualizo mi nombre a "NombreNuevo" por API
    Entonces la respuesta tiene código 200
    Y el campo "firstName" de la respuesta es "NombreNuevo"

  @API-20
  Escenario: Eliminar el usuario
    Dado que existe un usuario registrado
    Cuando elimino mi usuario por API
    Entonces la respuesta tiene código 200
    Y ya no puedo iniciar sesión con ese usuario
