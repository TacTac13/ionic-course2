import { Injectable } from '@angular/core';
import { CanLoad, UrlSegment, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router) { }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    //   if (!this.authService.IsAuthenticated) {
    //     this.router.navigateByUrl('/auth');
    //   }
    //   return this.authService.IsAuthenticated;
    // }
    return this.authService.IsAuthenticated.pipe(take(1), tap(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigateByUrl('/auth');
      }
    }));
  }
}
