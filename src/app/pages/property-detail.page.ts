import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageInteractions } from '../page-interactions.directive';
import { AvailabilityCalendarComponent } from './availability-calendar.component';

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, AvailabilityCalendarComponent],
  hostDirectives: [PageInteractions],
  templateUrl: './property-detail.html',
})
export class PropertyDetailPage {}
