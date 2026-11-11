# language: es
@api @login
Característica: Login y logout (API)
  Como consumidor de la API
  Quiero autenticarme
  Para obtener un token que me permita usar los demás servicios

  Antecedentes:
    Dado que existe un usuario registrado

  @API-04 @smoke
  Escenario: Login con credenciales válidas
    Cuando inicio sesión por API con mis credenciales
    Entonces la respuesta tiene código 200
    Y la respuesta incluye un token

  @API-05
  Escenario: Login con contraseña incorrecta
    Cuando inicio sesión por API con la contraseña "clave-mala"
    Entonces la respuesta tiene código 401

  @API-09
  Escenario: Cerrar sesión invalida el token
    Cuando cierro sesión por API
    Entonces la respuesta tiene código 200
    Y mi token ya no sirve
