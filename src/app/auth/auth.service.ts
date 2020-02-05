import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient) { }

  get IsAuthenticated() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.myToken;
      } else {
        return false;
      }
    }));
  }

  get isUserId() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>
      (`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`, {
        email,
        password,
        returnSecureToken: true
      }).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>
      (`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`, {
        email,
        password
      }).pipe(tap(this.setUserData.bind(this)));
  }

  private setUserData(userData: AuthResponseData) {
      const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
      this.user.next(
        new User(
          userData.localId,
          userData.email,
          userData.idToken,
          expirationTime
        )
      );
  }

  logout() {
    this.user.next(null);
  }
}
