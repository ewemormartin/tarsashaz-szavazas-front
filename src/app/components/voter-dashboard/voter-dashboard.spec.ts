import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoterDashboard } from './voter-dashboard';

describe('VoterDashboard', () => {
  let component: VoterDashboard;
  let fixture: ComponentFixture<VoterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoterDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoterDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
