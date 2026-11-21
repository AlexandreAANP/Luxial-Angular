import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageInteractions } from '../page-interactions.directive';

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  hostDirectives: [PageInteractions],
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicyPage {}
