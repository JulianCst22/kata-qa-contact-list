// Page Object: lista de contactos ("/contactList").
export class ContactListPage {
  constructor(page) {
    this.page = page;
    this.addContactButton = page.locator('#add-contact');
    this.logoutButton = page.locator('#logout');
    this.rows = page.locator('.contactTableBodyRow');
  }

  async open() {
    await this.page.goto('/contactList');
  }

  // Fila de la tabla que corresponde a un contacto (columna "Name" = nombre + apellido)
  rowFor(contact) {
    return this.rows.filter({ hasText: `${contact.firstName} ${contact.lastName}` });
  }

  async goToAddContact() {
    await this.addContactButton.click();
    await this.page.waitForURL(/addContact/);
  }

  async openContact(contact) {
    await this.rowFor(contact).first().click();
    await this.page.waitForURL(/contactDetails/);
  }

  async logout() {
    await this.logoutButton.click();
  }

  // Espera a que la tabla termine de cargar (la lista llega por una petición a la API)
  async waitUntilLoaded() {
    await this.page.waitForLoadState('networkidle');
  }
}
