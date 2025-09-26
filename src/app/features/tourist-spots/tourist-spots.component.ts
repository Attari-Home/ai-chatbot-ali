import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface TouristSpot {
  id: string;
  name: string;
  short_summary: string;
  long_description: string;
  emirate: string;
  address: string;
  latitude: number;
  longitude: number;
  website: string;
  opening_hours: string;
  entry_fee: string;
  tags: string[];
  best_time_to_visit: string;
  images: Array<{
    id: string;
    source_url: string;
    recommended_local_filename: string;
    width: number;
    height: number;
    license: string;
    photographer: string;
    attribution: string;
    alt_text: string;
    caption: string;
  }>;
  reviews?: {
    total_count: number;
    average_rating: number;
    rating_distribution: { [key: string]: number };
  };
  practical_info?: {
    estimated_visit_duration: string;
    difficulty_level: string;
    accessibility: string;
    parking: string;
    public_transport: string[];
    nearby_attractions: string[];
  };
  sources?: Array<{
    type: string;
    url: string;
    notes?: string;
  }>;
  scrape_timestamp?: string;
  notes?: string;
}

@Component({
  selector: 'app-tourist-spots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tourist-spots.component.html',
  styleUrl: './tourist-spots.component.css'
})
export class TouristSpotsComponent implements OnInit {
  touristSpots: TouristSpot[] = [];
  loading = true;
  error: string | null = null;
  selectedSpot: TouristSpot | null = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.loadTouristSpots();
  }

  loadTouristSpots() {
    this.http.get<TouristSpot[]>('/assets/data/tourist-spots/uae_tourist_spots.json')
      .subscribe({
        next: (spots) => {
          this.touristSpots = spots;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load tourist spots data';
          this.loading = false;
          console.error('Error loading tourist spots:', err);
        }
      });
  }

  selectSpot(spot: TouristSpot) {
    this.selectedSpot = spot;
  }

  closeModal() {
    this.selectedSpot = null;
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  openWebsite(url: string) {
    window.open(url, '_blank');
  }

  openInMaps(lat: number, lng: number, name: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  }

  trackBySpotId(index: number, spot: TouristSpot): string {
    return spot.id;
  }

  onImageError(event: any) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&crop=center';
  }
}
