import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KataDetailPage } from './kata-detail.page';
import { ContentService } from '../../core/services/content.service';
import { MediaComponent } from '../../shared/media/media.component';
import { Kata } from '../../core/models/kata.model';

const kata: Kata = {
  id: 'nage-no-kata', nomeGiapponese: 'Nage-no-kata', nomeItaliano: 'Forma delle proiezioni',
  descrizione: 'desc', serie: [{ titolo: 'Te-waza', tecniche: ['Uki-otoshi'] }],
  media: [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }]
};

describe('KataDetailPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ContentService, useValue: { getKataById: () => of(kata) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'nage-no-kata' } } } }
      ]
    });
  });

  it('passa il nome giapponese come altFallback al componente media', () => {
    const fixture = TestBed.createComponent(KataDetailPage);
    fixture.detectChanges();
    const media = fixture.debugElement.query(By.directive(MediaComponent)).componentInstance as MediaComponent;
    expect(media.altFallback).toBe('Nage-no-kata');
  });
});
