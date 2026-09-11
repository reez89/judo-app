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

  it('usa altFallback come alt quando manca la didascalia', () => {
    fixture.componentInstance.items = [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }];
    fixture.componentInstance.altFallback = 'Osoto-gari';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('Osoto-gari');
  });

  it('mostra un link YouTube senza usare il player MP4', () => {
    fixture.componentInstance.items = [{ tipo: 'youtube', src: 'https://www.youtube.com/watch?v=c-A_nP7mKAc' }];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('video')).toBeNull();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('a').href).toContain('c-A_nP7mKAc');
  });

  it('mantiene la fonte disponibile in caso di errore del video locale', async () => {
    fixture.componentInstance.items = [{ tipo: 'video', src: 'missing.mp4', sourceUrl: 'https://www.youtube.com/watch?v=c-A_nP7mKAc' }];
    await fixture.componentInstance.onPlayClick();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('video').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a').href).toContain('c-A_nP7mKAc');
  });

  it('azzera la riproduzione quando cambia la tecnica', async () => {
    fixture.componentInstance.items = [{ tipo: 'video', src: 'first.mp4' }];
    await fixture.componentInstance.onPlayClick();
    fixture.componentInstance.ngOnChanges();
    expect(fixture.componentInstance.showingVideo()).toBeNull();
  });

  it('usa la didascalia quando presente, ignorando altFallback', () => {
    fixture.componentInstance.items = [
      { tipo: 'placeholder', src: 'assets/media/placeholder.svg', didascalia: 'Presa iniziale' }
    ];
    fixture.componentInstance.altFallback = 'Osoto-gari';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('Presa iniziale');
  });

  it('l\'icona play è decorativa e non annunciata dallo screen reader', () => {
    fixture.componentInstance.items = [{ tipo: 'placeholder', src: 'assets/media/placeholder.svg' }];
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.play-btn ion-icon') as HTMLElement;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
