import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaComponent } from './media.component';

describe('MediaComponent', () => {
  let fixture: ComponentFixture<MediaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MediaComponent] });
    fixture = TestBed.createComponent(MediaComponent);
  });

  it('usa il primo elemento non-video come immagine principale', () => {
    fixture.componentInstance.items = [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }];
    fixture.detectChanges();
    expect(fixture.componentInstance.primary?.tipo).toBe('placeholder');
    expect(fixture.componentInstance.videoItem).toBeUndefined();
  });

  it('individua un elemento video separato nell\'array', () => {
    fixture.componentInstance.items = [
      { tipo: 'foto', src: 'assets/media/placeholder.svg' },
      { tipo: 'video', src: 'x.mp4' }
    ];
    fixture.detectChanges();
    expect(fixture.componentInstance.primary?.tipo).toBe('foto');
    expect(fixture.componentInstance.videoItem?.src).toBe('x.mp4');
  });

  it('onPlayClick con video disponibile lo mette in riproduzione', async () => {
    fixture.componentInstance.items = [
      { tipo: 'foto', src: 'assets/media/placeholder.svg' },
      { tipo: 'video', src: 'x.mp4' }
    ];
    fixture.detectChanges();
    await fixture.componentInstance.onPlayClick();
    expect(fixture.componentInstance.showingVideo()?.src).toBe('x.mp4');
  });

  it('onPlayClick senza video mostra un avviso e non entra in riproduzione', async () => {
    fixture.componentInstance.items = [{ tipo: 'foto', src: 'assets/media/placeholder.svg' }];
    fixture.detectChanges();
    await fixture.componentInstance.onPlayClick();
    expect(fixture.componentInstance.showingVideo()).toBeNull();
  });
});
