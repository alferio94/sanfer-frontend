import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { QuillModule } from 'ngx-quill';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeService } from '@core/services/theme.service';
import { signal } from '@angular/core';

describe('RichTextEditorComponent', () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    mockThemeService = jasmine.createSpyObj('ThemeService', ['isDarkMode'], {
      isDarkMode: jasmine.createSpy().and.returnValue(signal(false))
    });

    await TestBed.configureTestingModule({
      imports: [
        RichTextEditorComponent,
        QuillModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default config', () => {
    expect(component.config).toBeDefined();
    expect(component.value()).toBe('');
    expect(component.textLength()).toBe(0);
  });

  it('should validate required field', () => {
    component.required = true;
    component.onContentChanged({ html: '', text: '' });
    
    expect(component.isValid()).toBeFalse();
  });

  it('should validate max length', () => {
    component.config = { maxLength: 10 };
    component.onContentChanged({ html: '<p>This is a very long text</p>', text: 'This is a very long text' });
    
    expect(component.isValid()).toBeFalse();
    expect(component.isOverLimit).toBeTrue();
  });

  it('should update value on content change', () => {
    const htmlContent = '<p>Test content</p>';
    const textContent = 'Test content';
    
    component.onContentChanged({ html: htmlContent, text: textContent });
    
    expect(component.value()).toBe(htmlContent);
    expect(component.textLength()).toBe(textContent.length);
  });
});