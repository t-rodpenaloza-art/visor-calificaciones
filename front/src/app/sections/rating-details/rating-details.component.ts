import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmbCardComponent, BmbCardContentComponent, BmbCardFooterComponent, BmbCardHeaderComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';

@Component({
  selector: 'app-rating-details',
  imports: [
    CommonModule,
    BmbCardContentComponent,
    BmbCardComponent,
    BmbCardFooterComponent,
    BmbCardHeaderComponent
  ],
  templateUrl: './rating-details.component.html',
  styleUrl: './rating-details.component.scss',
})
export class RatingDetailsComponent {

}
