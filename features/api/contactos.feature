# language: es
@api @contactos
Característica: Contactos (API)
  Como consumidor de la API
  Quiero crear, consultar, actualizar y eliminar contactos
  Para gestionar la lista de contactos de un usuario

  Antecedentes:
    Dado que existe un usuario registrado

  @API-10 @smoke
  Escenario: Crear un contacto válido
    Cuando creo un contacto válido por API
    Entonces la respuesta tiene código 201
    Y la respuesta incluye el id del contacto

  @API-11
  Escenario: Crear contacto sin firstName
    Cuando creo un contacto por API con estos datos:
      | lastName | Perez |
    Entonces la respuesta tiene código 400
    Y el mensaje de la respuesta contiene "firstName"

  @API-12
  Escenario: Crear contacto con email inválido
    Cuando creo un contacto por API con estos datos:
      | firstName | Juan              |
      | lastName  | Perez             |
      | email     | correo-sin-arroba |
    Entonces la respuesta tiene código 400
    Y el mensaje de la respuesta contiene "Email is invalid"

  @API-13
  Escenario: Crear contacto con fecha inválida
    Cuando creo un contacto por API con estos datos:
      | firstName | Juan       |
      | lastName  | Perez      |
      | birthdate | 20/05/1990 |
    Entonces la respuesta tiene código 400
    Y el mensaje de la respuesta contiene "Birthdate is invalid"

  @API-14
  Escenario: Crear contacto sin token
    Cuando creo un contacto válido por API sin token
    Entonces la respuesta tiene código 401

  @API-15 @smoke
  Escenario: Listar los contactos
    Dado que tengo un contacto creado por API
    Cuando consulto la lista de contactos por API
    Entonces la respuesta tiene código 200
    Y la lista incluye el contacto creado

  @API-16
  Escenario: Consultar un contacto por id
    Dado que tengo un contacto creado por API
    Cuando consulto el contacto por API
    Entonces la respuesta tiene código 200
    Y la respuesta tiene los datos del contacto creado

  @API-17 @smoke
  Escenario: Actualizar un contacto completo (PUT)
    Dado que tengo un contacto creado por API
    Cuando reemplazo el contacto por API con nombre "Ana" y apellido "Gomez"
    Entonces la respuesta tiene código 200
    Y el campo "firstName" de la respuesta es "Ana"
    Y el campo "lastName" de la respuesta es "Gomez"

  @API-18
  Escenario: Actualizar un solo campo del contacto (PATCH)
    Dado que tengo un contacto creado por API
    Cuando actualizo solo el nombre del contacto a "Nuevo" por API
    Entonces la respuesta tiene código 200
    Y el campo "firstName" de la respuesta es "Nuevo"
    Y los demás datos del contacto no cambiaron

  @API-19 @smoke
  Escenario: Eliminar un contacto
    Dado que tengo un contacto creado por API
    Cuando elimino el contacto por API
    Entonces la respuesta tiene código 200
    Y el contacto ya no existe
