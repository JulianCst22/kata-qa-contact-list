# language: es
@ui @login
Característica: Inicio y cierre de sesión (UI)
  Como usuario registrado
  Quiero iniciar y cerrar sesión
  Para acceder a mis contactos de forma segura

  Antecedentes:
    Dado que existe un usuario registrado
    Y que estoy en la página de login

  @UI-04 @smoke
  Escenario: Inicio de sesión con credenciales válidas
    Cuando inicio sesión con mis credenciales
    Entonces veo la lista de contactos

  @UI-05
  Escenario: Inicio de sesión con contraseña incorrecta
    Cuando inicio sesión con la contraseña "clave-mala"
    Entonces veo un mensaje de error que contiene "Incorrect username or password"

  @UI-06
  Escenario: Inicio de sesión con campos vacíos
    Cuando inicio sesión con los campos vacíos
    Entonces veo un mensaje de error que contiene "Incorrect username or password"

  @UI-07 @smoke
  Escenario: Cerrar sesión
    Cuando inicio sesión con mis credenciales
    Y cierro sesión
    Entonces vuelvo a la página de login
    Cuando intento entrar directamente a la lista de contactos
    Entonces vuelvo a la página de login
