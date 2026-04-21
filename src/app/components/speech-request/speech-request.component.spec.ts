import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechRequestComponent } from './speech-request.component';

describe('SpeechRequestComponent', () => {
  let component: SpeechRequestComponent;
  let fixture: ComponentFixture<SpeechRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
