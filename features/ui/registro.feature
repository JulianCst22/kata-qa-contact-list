# language: es
@ui @registro
Característica: Registro de usuarios (UI)
  Como visitante
  Quiero crear una cuenta
  Para poder guardar mis contactos

  Antecedentes:
    Dado que estoy en la página de login
    Y voy a la página de registro

  @UI-01 @smoke
  Escenario: Registro exitoso de usuario nuevo
    Cuando me registro con datos válidos
    Entonces veo la lista de contactos

  @UI-02
  Escenario: Registro con un email que ya existe
    Dado que existe un usuario registrado
    Cuando me registro con el email de ese usuario
    Entonces veo un mensaje de error que contiene "Email address is already in use"

  @UI-03
  Escenario: Registro con campos obligatorios vacíos
    Cuando envío el formulario de registro vacío
    Entonces veo un mensaje de error que contiene "User validation failed"
