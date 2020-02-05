import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New York City',
//     // tslint:disable-next-line: max-line-length
// tslint:disable-next-line: max-line-length
//     'https://patch.com/img/cdn20/users/22965231/20190709/105521/styles/patch_image/public/midtown-manhattan-new-york-city-new-york-shutterstock-412523491-1___09105440812.jpg',
//     149.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     ' L\'Amour Toujours',
//     'A romantique place in Paris',
//     // tslint:disable-next-line: max-line-length
// tslint:disable-next-line: max-line-length
//     'https://static.lexpress.fr/medias_11290/w_600,h_600,c_fill,g_north/v1484580707/france-paris-place-de-la-republique-square-renovated-in-2013-with-the-republic-monument-in-the-center_5780575.jpg',
//     189.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The Foggy Palace',
//     'Not your average city trip!',
//     'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
//     99.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
// ]


interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  fetchPlace() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: PlaceData }>(`https://ionic-angular-course-f120c.firebaseio.com/offered-places.json?auth=${token}`);
      }), map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId,
              resData[key].location,
            ));
          }
        }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    // return this.places.pipe(take(1), map(places => {
    //   return {
    //     ...places.find(
    //       p => p.id === id
    //     )
    //   };
    // }));
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
      return this.http.get<PlaceData>(`https://ionic-angular-course-f120c.firebaseio.com/offered-places/${id}.json?auth=${token}`);
    }), map(placeData => {
      return new Place(
        id,
        placeData.title,
        placeData.description,
        placeData.imageUrl,
        placeData.price,
        new Date(placeData.availableFrom),
        new Date(placeData.availableTo),
        placeData.userId,
        placeData.location
      );
    })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserId: string;
    return this.authService.isUserId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchedUserId,
          location
        );
        return this.http.post<{ name: string }>(
          `https://ionic-angular-course-f120c.firebaseio.com/offered-places.json?auth=${token}`,
          {
            ...newPlace,
            id: null
          }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // tslint:disable-next-line: align
    // return this.places.pipe(take(1), delay(1000), tap(places => {
    //   this._places.next(places.concat(newPlace));
    // }));
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
      return this.http
        .post<{ imageUrl: string, imagePath: string }>('https://us-central1-ionic-angular-course-f120c.cloudfunctions.net/storeImage',
        uploadData,
        {headers: {
          Authorization: 'Bearer ' + token
        }});
    }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
    }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlace();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://ionic-angular-course-f120c.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
