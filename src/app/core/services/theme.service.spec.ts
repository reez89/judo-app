import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('non chiama la status bar nativa fuori da una piattaforma nativa (es. browser/dev)', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
    await expectAsync(service.init()).toBeResolved();
  });
});
