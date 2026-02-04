import { TestBed } from '@angular/core/testing';

import { HtmlcanvasService } from './htmlcanvas.service';

describe('HtmlcanvasService', () => {
  let service: HtmlcanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlcanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
