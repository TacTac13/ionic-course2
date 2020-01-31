import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userIsAuthenticated = true;
  private userId = 'abc';

  get IsAuthenticated() {
    return this.userIsAuthenticated;
  }

  get isUserId() {
    return this.userId;
  }

  constructor() { }

  login() {
    this.userIsAuthenticated = true;
  }

  logout() {
    this.userIsAuthenticated = false;
  }
}
