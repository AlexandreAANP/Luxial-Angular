import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageInteractions } from '../page-interactions.directive';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  hostDirectives: [PageInteractions],
  templateUrl: './services.html',
})
export class ServicesPage {}
