import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm = {
    formName: '',
    formEmail: '',
    formPhone: '',
    formSubject: '',
    formMessage: '',
    formNewsletter: false
  };

  isSubmitting = false;
  submitMessage = '';
  submitMessageType: 'success' | 'error' | '' = '';

  constructor() {
    // Initialize EmailJS with your public key
    // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
    emailjs.init('YOUR_PUBLIC_KEY');
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.showMessage('Please fill in all required fields.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitMessageType = '';

    try {
      const templateParams = {
        from_name: this.contactForm.formName,
        from_email: this.contactForm.formEmail,
        phone: this.contactForm.formPhone || 'Not provided',
        subject: this.contactForm.formSubject,
        message: this.contactForm.formMessage,
        newsletter: this.contactForm.formNewsletter ? 'Yes' : 'No',
        to_email: 'ali.eliteprofast@gmail.com'
      };

      // Send email using EmailJS
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams
      );

      this.showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
      this.resetForm();

    } catch (error: any) {
      console.error('Email sending failed:', error);

      // Provide more specific error messages
      let errorMessage = 'Sorry, there was an error sending your message. ';

      if (error?.text?.includes('Invalid service id') || error?.text?.includes('service_id')) {
        errorMessage += 'Please check your EmailJS Service ID.';
      } else if (error?.text?.includes('Invalid template id') || error?.text?.includes('template_id')) {
        errorMessage += 'Please check your EmailJS Template ID.';
      } else if (error?.text?.includes('Invalid public key') || error?.text?.includes('public_key')) {
        errorMessage += 'Please check your EmailJS Public Key.';
      } else if (error?.text?.includes('rate limit') || error?.text?.includes('quota')) {
        errorMessage += 'EmailJS quota exceeded. Please try again later.';
      } else {
        errorMessage += 'Please try again later or contact support.';
      }

      this.showMessage(errorMessage, 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.contactForm.formName.trim() &&
      this.contactForm.formEmail.trim() &&
      this.contactForm.formSubject &&
      this.contactForm.formMessage.trim()
    );
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.submitMessage = message;
    this.submitMessageType = type;

    // Clear message after 5 seconds
    setTimeout(() => {
      this.submitMessage = '';
      this.submitMessageType = '';
    }, 5000);
  }

  private resetForm() {
    this.contactForm = {
      formName: '',
      formEmail: '',
      formPhone: '',
      formSubject: '',
      formMessage: '',
      formNewsletter: false
    };
  }
}
