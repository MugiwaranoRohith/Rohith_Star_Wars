import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('CharacterDetail', () => {
  let component: CharacterData;
  let fixture: ComponentFixture<CharacterData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharacterData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
