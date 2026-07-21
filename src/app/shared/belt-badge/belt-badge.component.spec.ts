import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeltBadgeComponent } from './belt-badge.component';

describe('BeltBadgeComponent', () => {
  let fixture: ComponentFixture<BeltBadgeComponent>;

  afterEach(() => {
    document.documentElement.style.removeProperty('--judo-purple-tint');
  });

  it('legge lo sfondo dal token --judo-purple-tint invece di un colore hardcoded', () => {
    document.documentElement.style.setProperty('--judo-purple-tint', 'rgb(1, 2, 3)');
    fixture = TestBed.createComponent(BeltBadgeComponent);
    fixture.componentInstance.cintura = 'gialla';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(getComputedStyle(badge).backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
