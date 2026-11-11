// Page Object: formulario de contacto.
// La app usa el mismo formulario para crear ("/addContact") y editar ("/editContact").
import { expect } from '@playwright/test';

export class ContactFormPage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.submitButton = page.locator('#submit');
    this.cancelButton = page.locator('#cancel');
    this.errorMessage = page.locator('#error');
  }

  // Llena los campos que vengan en el objeto. Las claves son los id de los campos:
  // firstName, lastName, birthdate, email, phone, street1, street2,
  // city, stateProvince, postalCode, country
  async fillForm(contact) {
    for (const [field, value] of Object.entries(contact)) {
      if (value !== undefined && value !== null) {
        await this.page.locator(`#${field}`).fill(String(value));
      }
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  // En edición, los datos actuales llegan unos instantes después de abrir la página.
  // Si se escribe antes, la app los sobrescribe, así que primero se espera a que carguen.
  async waitUntilLoaded() {
    await expect(this.firstNameInput).not.toHaveValue('');
  }

  async changeLastName(lastName) {
    await this.lastNameInput.fill(lastName);
  }
}
