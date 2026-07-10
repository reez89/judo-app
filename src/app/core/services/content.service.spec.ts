import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ContentService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('carica le tecniche dal JSON', () => {
    service.getTechniques().subscribe(list => expect(list.length).toBe(1));
    httpMock.expectOne('assets/data/techniques.json')
      .flush([{ id: 'osoto-gari' }]);
  });

  it('getTechnique ritorna quella con id corrispondente', () => {
    service.getTechnique('osoto-gari').subscribe(t => expect(t?.id).toBe('osoto-gari'));
    httpMock.expectOne('assets/data/techniques.json')
      .flush([{ id: 'osoto-gari' }, { id: 'o-goshi' }]);
  });
});
