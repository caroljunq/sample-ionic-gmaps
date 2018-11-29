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
  // query: string = '';
  places: any  = {
    searchPosition: [],
    originPosition:  [],
    destinationPosition: []
  };
  searchDisabled: boolean;
  // saveDisabled: boolean;
  location: any;

  directionsService: any;
  directionsDisplay: any;
  // originPosition: string = '';
  // destinationPosition: string = '';
  currentPosition: any;
  currentMarker: any;
  traceRoute: boolean = false;

  queries: any = {
    searchPosition: '',
    originPosition: '',
    destinationPosition: ''
  };

  constructor(public navCtrl: NavController, public zone: NgZone, public maps: GoogleMapsProvider, public platform: Platform, public geolocation: Geolocation, public viewCtrl: ViewController) {
    this.searchDisabled = true;
    // this.saveDisabled = true;
  }

  ionViewDidLoad() {

    let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {

      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(this.maps.map);
      this.searchDisabled = false;

      this.currentMarker = new google.maps.Marker({ map: this.maps.map });

      this.showCurrentLocation();

      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      this.directionsDisplay.setMap(this.maps.map);
      // this.displayDirection(this.directionsService, this.directionsDisplay);
    });
  }

  searchPlace(option) {
    // this.saveDisabled = true;

    if (this.queries[option].length > 0 && !this.searchDisabled) {

      let config = {
        types: ['geocode'],
        input: this.queries[option]
      }

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

          this.places[option] = [];

          predictions.forEach((prediction) => {
            this.places[option].push(prediction);
          });
        }

      });

    } else {
      this.places[option] = [];
    }

  }

  selectPlace(place, option){
    this.places[option] = [];

    let location = {
      lat: null,
      lng: null,
      name: place.name
    };

    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      this.zone.run(() => {
        this.traceRoute = true;
        this.queries[option] = details.formatted_address;
        location.name = details.name;
        location.lat = details.geometry.location.lat();
        location.lng = details.geometry.location.lng();
        // this.saveDisabled = false;

        let position = new google.maps.LatLng(location.lat, location.lng);

        if(option == 'searchPosition'){
          this.maps.map.setCenter({
            lat: location.lat,
            lng: location.lng
          });

          this.currentMarker.setPosition(position);
        }

        this.location = location;
      });
    });
  }



  // save() {
  //   this.viewCtrl.dismiss(this.location);
  // }
  //
  // close() {
  //   this.viewCtrl.dismiss();
  // }

  getCurrentPosition(){
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition()
        .then((resp) => {
          this.currentPosition = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          resolve(resp);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  showCurrentLocation(){
    this.getCurrentPosition()
      .then((resp) =>{

        let position = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

        this.maps.map.setCenter(position);
        this.maps.map.setZoom(17);
      })
      .catch((err) =>{
        console.log(err);
      })
  }

  clearSearchBar(option){
    this.traceRoute = false;
    this.queries[option] = '';
  }

}

  // calculateRoute() {
  //
  //   this.originPosition = new google.maps.LatLng(-21.630483, -48.794094);
  //   this.destinationPosition = new google.maps.LatLng(-21.615422, -48.812365);
  //
  //   if (this.destinationPosition && this.originPosition) {
  //     const request = {
  //       // Pode ser uma coordenada (LatLng), uma string ou um lugar
  //       origin: this.originPosition,
  //       destination: this.destinationPosition,
  //       travelMode: 'WALKING'
  //     };
  //
  //     this.traceRoute(this.directionsService, this.directionsDisplay, request);
  //   }
  // }
  //
  // traceRoute(service: any, display: any, request: any) {
  //   service.route(request, function(result, status) {
  //     if (status == 'OK') {
  //       display.setDirections(result);
  //     }
  //   });
  // }


  // displayDirection(directionsService, directionsDisplay) {
  //   directionsService.route({
  //     origin: new google.maps.LatLng(-21.630483, -48.794094),
  //     destination: new google.maps.LatLng(-21.615422, -48.812365),
  //     travelMode: 'WALKING'
  //   }, (response, status) => {
  //     if (status === 'OK') {
  //       directionsDisplay.setDirections(response);
  //     }
  //   });
  // }
