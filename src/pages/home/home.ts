import { NavController, Platform, ViewController } from 'ionic-angular';
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';


declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


      @ViewChild('map') mapElement: ElementRef;
      @ViewChild('pleaseConnect') pleaseConnect: ElementRef;

      latitude: number;
      longitude: number;
      autocompleteService: any;
      placesService: any;
      query: string = '';
      places: any = [];
      searchDisabled: boolean;
      saveDisabled: boolean;
      location: any;
      directionsService: any;
      directionsDisplay: any;
      map: any;
      startPosition: any;
      originPosition: string;
      destinationPosition: string;

      constructor(public navCtrl: NavController, public zone: NgZone, public maps: GoogleMapsProvider, public platform: Platform, public geolocation: Geolocation, public viewCtrl: ViewController) {
          this.searchDisabled = true;
          this.saveDisabled = true;
      }

      ionViewDidLoad(){

        // this.showCurrentLocation();

          let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {

              this.autocompleteService = new google.maps.places.AutocompleteService();
              this.placesService = new google.maps.places.PlacesService(this.maps.map);
              this.searchDisabled = false;

              this.directionsService = new google.maps.DirectionsService();
              this.directionsDisplay = new google.maps.DirectionsRenderer();

          });



      }
//
//       showCurrentLocation(){
//   this.geolocation.getCurrentPosition()
//     .then((resp) => {
//       const position = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
//
//       const mapOptions = {
//         zoom: 17,
//         center: position
//       }
//
//       this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
//
//       const marker = new google.maps.Marker({
//         position: position,
//         map: this.map
//       });
//
//     }).catch((error) => {
//       console.log('Erro ao recuperar sua posição', error);
//     });
// }


      selectPlace(place){

          this.places = [];

          let location = {
              lat: null,
              lng: null,
              name: place.name
          };

          this.placesService.getDetails({placeId: place.place_id}, (details) => {

              this.zone.run(() => {

                  location.name = details.name;
                  location.lat = details.geometry.location.lat();
                  location.lng = details.geometry.location.lng();
                  this.saveDisabled = false;

                  this.maps.map.setCenter({lat: location.lat, lng: location.lng});

                  this.location = location;

              });

          });

      }

      searchPlace(){

          this.saveDisabled = true;

          if(this.query.length > 0 && !this.searchDisabled) {

              let config = {
                  types: ['geocode'],
                  input: this.query
              }

              this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

                  if(status == google.maps.places.PlacesServiceStatus.OK && predictions){

                      this.places = [];

                      predictions.forEach((prediction) => {
                          this.places.push(prediction);
                      });
                  }

              });

          } else {
              this.places = [];
          }

      }

      save(){
          this.viewCtrl.dismiss(this.location);
      }

      close(){
          this.viewCtrl.dismiss();
      }

      // initializeMap() {
//   this.startPosition = new google.maps.LatLng(-21.763409, -43.349034);
//
//   const mapOptions = {
//     zoom: 18,
//     center: this.startPosition,
//     disableDefaultUI: true
//   }
//
//   this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
//   this.directionsDisplay.setMap(this.map);
//
//   const marker = new google.maps.Marker({
//     position: this.startPosition,
//     map: this.map,
//   });
// }

calculateRoute() {
  if (this.destinationPosition && this.originPosition) {
    const request = {
      // Pode ser uma coordenada (LatLng), uma string ou um lugar
      origin: this.originPosition,
      destination: this.destinationPosition,
      travelMode: 'WALKING'
    };

    this.traceRoute(this.directionsService, this.directionsDisplay, request);
  }
}

traceRoute(service: any, display: any, request: any) {
  service.route(request, function (result, status) {
    if (status == 'OK') {
      display.setDirections(result);
    }
  });
}

  }
