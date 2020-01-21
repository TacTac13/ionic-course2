import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places: Place[] = [
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City',
      // tslint:disable-next-line: max-line-length
      'https://patch.com/img/cdn20/users/22965231/20190709/105521/styles/patch_image/public/midtown-manhattan-new-york-city-new-york-shutterstock-412523491-1___09105440812.jpg',
      149.99
      ),
      new Place(
        'p2',
        ' L\'Amour Toujours',
        'A romantique place in Paris',
        // tslint:disable-next-line: max-line-length
        'https://static.lexpress.fr/medias_11290/w_600,h_600,c_fill,g_north/v1484580707/france-paris-place-de-la-republique-square-renovated-in-2013-with-the-republic-monument-in-the-center_5780575.jpg',
        189.99
        ),
      new Place(
        'p3',
        'The Foggy Palace',
        'Not your average city trip!',
        'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
        99.99
        ),
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }
}
