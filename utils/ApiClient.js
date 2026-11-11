// Cliente de la API de Contact List.
// Reúne en un solo lugar todas las peticiones que usan las pruebas,
// así los steps quedan cortos y, si cambia una ruta, se arregla solo aquí.
// Además registra lo que responde el servidor en cada petición (serverLog),
// para poder diagnosticar si una falla fue del ambiente o de la app.
// Documentación: https://documenter.getpostman.com/view/4012288/TzK2bEa8

export const BASE_URL = process.env.APP_URL || 'https://thinking-tester-contact-list.herokuapp.com';

export class ApiClient {
  constructor(request, serverLog) {
    this.request = request;
    this.serverLog = serverLog;
  }

  // Arma el header de autenticación. Sin token, no se manda header.
  auth(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Envía la petición y anota el resultado (código o error de conexión) en el registro
  async send(method, path, options = {}) {
    const label = `${method.toUpperCase()} ${path}`;
    try {
      const response = await this.request[method](`${BASE_URL}${path}`, options);
      this.serverLog?.record(label, response.status());
      return response;
    } catch (error) {
      this.serverLog?.recordError(label, error);
      throw error;
    }
  }

  // ---------- Usuarios ----------
  createUser(user) {
    return this.send('post', '/users', { data: user });
  }

  login(email, password) {
    return this.send('post', '/users/login', { data: { email, password } });
  }

  getProfile(token) {
    return this.send('get', '/users/me', { headers: this.auth(token) });
  }

  updateProfile(token, data) {
    return this.send('patch', '/users/me', { headers: this.auth(token), data });
  }

  logout(token) {
    return this.send('post', '/users/logout', { headers: this.auth(token) });
  }

  deleteUser(token) {
    return this.send('delete', '/users/me', { headers: this.auth(token) });
  }

  // ---------- Contactos ----------
  createContact(token, contact) {
    return this.send('post', '/contacts', { headers: this.auth(token), data: contact });
  }

  listContacts(token) {
    return this.send('get', '/contacts', { headers: this.auth(token) });
  }

  getContact(token, id) {
    return this.send('get', `/contacts/${id}`, { headers: this.auth(token) });
  }

  replaceContact(token, id, contact) {
    return this.send('put', `/contacts/${id}`, { headers: this.auth(token), data: contact });
  }

  updateContact(token, id, data) {
    return this.send('patch', `/contacts/${id}`, { headers: this.auth(token), data });
  }

  deleteContact(token, id) {
    return this.send('delete', `/contacts/${id}`, { headers: this.auth(token) });
  }
}
