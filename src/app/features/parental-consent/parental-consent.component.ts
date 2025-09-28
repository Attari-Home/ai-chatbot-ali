import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrivacyService, ConsentData } from '../../core/services/privacy.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-parental-consent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parental-consent.component.html',
  styleUrl: './parental-consent.component.css'
})
export class ParentalConsentComponent implements OnInit {
  consentForm!: FormGroup;
  consentFormData: any;
  isSubmitting = false;
  submissionSuccess = false;
  submissionError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly privacyService: PrivacyService,
    private readonly metaService: MetaService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.generateConsentFormData();
    this.setPageMeta();
  }

  private initializeForm(): void {
    this.consentForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      studentGrade: ['', Validators.required],
      parentName: ['', [Validators.required, Validators.minLength(2)]],
      parentEmail: ['', [Validators.required, Validators.email]],
      parentPhone: ['', Validators.required],
      emergencyContact: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
      consents: this.fb.array([]),
      acknowledgment: [false, Validators.requiredTrue],
      signature: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  private generateConsentFormData(): void {
    const studentName = 'Student Name'; // This would come from route params or user input
    this.consentFormData = this.privacyService.generateConsentForm(studentName);
    this.buildConsentArray();
  }

  private buildConsentArray(): void {
    const consentsArray = this.consentForm.get('consents') as FormArray;
    
    this.consentFormData.requiredConsents.forEach((consent: any, index: number) => {
      consentsArray.push(this.fb.group({
        type: [consent.type],
        description: [consent.description],
        required: [consent.required],
        granted: [consent.required] // Pre-check required consents
      }));
    });
  }

  get consentsArray(): FormArray {
    return this.consentForm.get('consents') as FormArray;
  }

  onSubmit(): void {
    if (this.consentForm.valid) {
      this.isSubmitting = true;
      this.submissionError = '';

      try {
        this.processConsentSubmission();
        this.submissionSuccess = true;
        this.isSubmitting = false;
      } catch (error) {
        console.error('Consent submission error:', error);
        this.submissionError = 'Failed to submit consent form. Please try again.';
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private processConsentSubmission(): void {
    const formData = this.consentForm.value;
    
    // Process each consent
    formData.consents.forEach((consent: any) => {
      const consentData: Omit<ConsentData, 'timestamp' | 'ipAddress' | 'userAgent'> = {
        studentName: formData.studentName,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        consentType: consent.type,
        granted: consent.granted
      };

      this.privacyService.recordConsent(consentData);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.consentForm.controls).forEach(key => {
      const control = this.consentForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(group => {
          Object.keys((group as FormGroup).controls).forEach(groupKey => {
            (group as FormGroup).get(groupKey)?.markAsTouched();
          });
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  downloadConsentForm(): void {
    const formData = this.consentForm.value;
    const content = this.generatePrintableConsentForm(formData);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `parental-consent-${formData.studentName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  private generatePrintableConsentForm(formData: any): string {
    return `
PARENTAL CONSENT FORM - ALI ROBOTICS TEAM
Form ID: ${this.consentFormData.formId}
Date: ${formData.date}

STUDENT INFORMATION
Name: ${formData.studentName}
Grade: ${formData.studentGrade}

PARENT/GUARDIAN INFORMATION
Name: ${formData.parentName}
Email: ${formData.parentEmail}
Phone: ${formData.parentPhone}

EMERGENCY CONTACT
Name: ${formData.emergencyContact}
Phone: ${formData.emergencyPhone}

CONSENT PERMISSIONS
${formData.consents.map((consent: any) => `
[${consent.granted ? 'X' : ' '}] ${consent.description}
    Type: ${consent.type}
    Required: ${consent.required ? 'Yes' : 'No'}
`).join('')}

ACKNOWLEDGMENT
${formData.acknowledgment ? '[X]' : '[ ]'} I acknowledge that I have read and understood the privacy policy and consent to the processing of data as indicated above.

DIGITAL SIGNATURE
Parent/Guardian Signature: ${formData.signature}
Date: ${formData.date}

DATA RETENTION
Your data will be retained according to our privacy policy: ${this.consentFormData.dataRetentionPeriod}

For questions about this form or our privacy practices, contact us at privacy@alirobotics.edu.
    `.trim();
  }

  private setPageMeta(): void {
    this.metaService.setPageMeta({
      title: 'Parental Consent Form - Ali Robotics Team',
      description: 'Secure parental consent form for Ali Robotics Team activities and data processing.',
      keywords: ['parental consent', 'privacy', 'robotics team', 'GDPR', 'data protection'],
      canonicalUrl: 'https://alirobotics.edu/parental-consent'
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.consentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.consentForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    
    return '';
  }
}