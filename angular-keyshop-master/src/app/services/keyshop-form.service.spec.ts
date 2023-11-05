import { TestBed } from '@angular/core/testing';

import { KeyshopFormService } from './keyshop-form.service';

describe('KeyshopFormService', () => {
  let service: KeyshopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyshopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
