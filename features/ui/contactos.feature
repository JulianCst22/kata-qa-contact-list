# language: es
@ui @contactos
Característica: Gestión de contactos (UI)
  Como usuario con sesión iniciada
  Quiero crear, ver, editar y eliminar contactos
  Para mantener mi lista de contactos al día

  Antecedentes:
    Dado que inicié sesión en la app

  @UI-08 @smoke
  Escenario: Crear contacto con todos los campos
    Cuando creo un contacto con todos los campos
    Entonces el contacto aparece en la lista

  @UI-09
  Escenario: Crear contacto solo con campos obligatorios
    Cuando creo un contacto con nombre "Juan" y apellido "Pérez"
    Entonces el contacto aparece en la lista

  @UI-10
  Escenario: Crear contacto sin nombre
    Cuando intento crear un contacto con estos datos:
      | lastName | Pérez |
    Entonces veo un mensaje de error que contiene "firstName"

  @UI-11
  Escenario: Crear contacto con email inválido
    Cuando intento crear un contacto con estos datos:
      | firstName | Juan              |
      | lastName  | Pérez             |
      | email     | correo-sin-arroba |
    Entonces veo un mensaje de error que contiene "Email is invalid"

  @UI-12
  Escenario: Crear contacto con fecha de nacimiento inválida
    Cuando intento crear un contacto con estos datos:
      | firstName | Juan       |
      | lastName  | Pérez      |
      | birthdate | 20/05/1990 |
    Entonces veo un mensaje de error que contiene "Birthdate is invalid"

  @UI-13
  Escenario: Crear contacto con teléfono inválido
    Cuando intento crear un contacto con estos datos:
      | firstName | Juan   |
      | lastName  | Pérez  |
      | phone     | abc123 |
    Entonces veo un mensaje de error que contiene "Phone number is invalid"

  @UI-14
  Escenario: Ver el detalle de un contacto
    Dado que tengo un contacto creado
    Cuando abro el detalle del contacto
    Entonces veo los datos del contacto

  @UI-15 @smoke
  Escenario: Editar un contacto
    Dado que tengo un contacto creado
    Cuando edito el apellido del contacto a "Gomez"
    Entonces el detalle muestra el apellido "Gomez"
    Y al regresar a la lista el contacto aparece actualizado

  @UI-16 @smoke
  Escenario: Eliminar un contacto
    Dado que tengo un contacto creado
    Cuando elimino el contacto
    Entonces el contacto ya no aparece en la lista

  @UI-17
  Escenario: Cancelar la creación de un contacto
    Cuando empiezo a crear un contacto con nombre "Temporal" y cancelo
    Entonces vuelvo a la lista de contactos
    Y no aparece ningún contacto con nombre "Temporal"
