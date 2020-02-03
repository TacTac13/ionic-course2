export interface Coordinates {
    lat: number;
    lng: number;
}

export interface PlaceLocation extends Coordinates {
    adress: string;
    staticMapImageUrl: string;
}
