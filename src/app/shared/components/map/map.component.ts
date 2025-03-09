import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { LocationUpdate } from '@app/core/models/profile.model';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() editable: boolean = false;
  @Input() height: string = '400px';
  
  @Output() locationChanged = new EventEmitter<LocationUpdate>();
  
  private map!: L.Map;
  private marker: L.Marker | null = null;
  
  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['latitude'] && !changes['latitude'].firstChange) || 
      (changes['longitude'] && !changes['longitude'].firstChange)
    ) {
      // Update marker position if latitude or longitude changed
      this.updateMarkerPosition();
    }
  }
  
  private initMap(): void {
    // Create map
    this.map = L.map('map', {
      center: [
        this.latitude || 51.505, 
        this.longitude || -0.09
      ],
      zoom: 13
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Add marker for current location
    this.updateMarkerPosition();
    
    // Add click handler if map is editable
    if (this.editable) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.updateMarker(lat, lng);
        this.locationChanged.emit({ latitude: lat, longitude: lng });
      });
    }
  }
  
  private updateMarkerPosition(): void {
    if (this.latitude && this.longitude) {
      this.updateMarker(this.latitude, this.longitude);
      
      // Center map on marker
      this.map.setView([this.latitude, this.longitude], 13);
    }
  }
  
  private updateMarker(lat: number, lng: number): void {
    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    
    // Create new marker
    const icon = L.icon({
      iconUrl: '/images/leaflet/marker-icon.png',
      shadowUrl: '/images/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
    
    // Add popup with coordinates
    if (this.editable) {
      this.marker.bindPopup(`Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`).openPopup();
    }
  }
}