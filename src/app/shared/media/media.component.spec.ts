import { MediaComponent } from './media.component';

describe('MediaComponent', () => {
  it('riconosce il tipo placeholder come immagine', () => {
    const c = new MediaComponent();
    c.item = { tipo: 'placeholder', src: 'assets/media/placeholder.svg' };
    expect(c.isImage).toBeTrue();
    expect(c.isVideo).toBeFalse();
  });
  it('riconosce il tipo video', () => {
    const c = new MediaComponent();
    c.item = { tipo: 'video', src: 'x.mp4' };
    expect(c.isVideo).toBeTrue();
  });
});
