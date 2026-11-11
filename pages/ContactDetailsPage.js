// Page Object: detalle de un contacto ("/contactDetails").
export class ContactDetailsPage {
  constructor(page) {
    this.page = page;
    this.editButton = page.locator('#edit-contact');
    this.deleteButton = page.locator('#delete');
    this.returnButton = page.locator('#return');
  }

  // Cada dato del contacto se muestra en un elemento con el id del campo (#firstName, #email...)
  field(name) {
    return this.page.locator(`#${name}`);
  }

  async edit() {
    await this.editButton.click();
    await this.page.waitForURL(/editContact/);
  }

  // Al eliminar, el navegador muestra una ventana de confirmación: se acepta.
  async delete() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteButton.click();
    await this.page.waitForURL(/contactList/);
  }

  async backToList() {
    await this.returnButton.click();
    await this.page.waitForURL(/contactList/);
  }
}
