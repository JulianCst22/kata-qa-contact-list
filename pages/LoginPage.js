// Page Object: página de login (pantalla inicial "/").
// Guarda dónde están los elementos y las acciones que se pueden hacer.
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#submit');
    this.signupButton = page.locator('#signup');
    this.errorMessage = page.locator('#error');
  }

  async open() {
    await this.page.goto('/');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goToSignup() {
    await this.signupButton.click();
  }
}
