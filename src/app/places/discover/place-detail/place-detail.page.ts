import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../../app/shared/map-modal/map-modal.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  place: Place;
  isBookable = false;
  isLoading = false;
  private palceSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    if (!this.route.snapshot.paramMap.has('placeId')) {
      this.navCtrl.navigateBack('/places/tabs/discover');
      return;
    }
    this.isLoading = true;
    let fetchedUserId: string;
    this.authService.isUserId.pipe(switchMap(userId => {
      if (!userId) {
        throw new Error('Found no user!');
      }
      fetchedUserId = userId;
      return this.placesService.getPlace(this.route.snapshot.paramMap.get('placeId'));
    })).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error occured!',
          message: 'Place could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/places/tabs/discover']);
            }
          }]
        }).then(alertEl => {
          alertEl.present();
        });
      });
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // this.navCtrl.pop();
    this.actionSheetCtrl.create({
      header: 'Choose an action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      }).then(resultData => {
        if (resultData.role === 'confirm') {
          this.loadingCtrl.create({
            message: 'Booking place...'
          }).then(loadingEl => {
            loadingEl.present();
            const data = resultData.data.bookingData;
            this.bookingService.addBooking(
              this.place.id,
              this.place.title,
              this.place.imageUrl,
              data.firstName,
              data.lastName,
              data.guestNumber,
              data.startDate,
              data.endDate
            ).subscribe(() => {
              loadingEl.dismiss();
            });
          });
        }
      });
  }

  onShowFullMap() {
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {
        lat: this.place.location.lat,
        lng: this.place.location.lng,
      },
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location.adress
    }}).then(modalEl => {
      modalEl.present();
    });
  }

  ngOnDestroy() {
    if (this.palceSub) {
      this.palceSub.unsubscribe();
    }
  }
}
