import { Injectable } from '@angular/core';

export interface ConsentData {
  studentName: string;
  parentName: string;
  parentEmail: string;
  consentType: 'photography' | 'video' | 'website' | 'newsletter' | 'data-collection';
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface PrivacySettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private readonly CONSENT_STORAGE_KEY = 'ali-robotics-consent';
  private readonly PRIVACY_SETTINGS_KEY = 'ali-robotics-privacy';
  private readonly GDPR_COMPLIANCE_VERSION = '1.0';

  constructor() { }

  /**
   * Check if user has provided consent for specific data processing
   */
  hasConsent(consentType: ConsentData['consentType']): boolean {
    const storedConsents = this.getStoredConsents();
    const consent = storedConsents.find(c => c.consentType === consentType);
    return consent?.granted || false;
  }

  /**
   * Record user consent
   */
  recordConsent(consentData: Omit<ConsentData, 'timestamp' | 'ipAddress' | 'userAgent'>): void {
    const completeConsentData: ConsentData = {
      ...consentData,
      timestamp: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    const existingConsents = this.getStoredConsents();
    const updatedConsents = existingConsents.filter(c => 
      c.consentType !== consentData.consentType || 
      c.studentName !== consentData.studentName
    );
    
    updatedConsents.push(completeConsentData);
    
    localStorage.setItem(this.CONSENT_STORAGE_KEY, JSON.stringify(updatedConsents));
  }

  /**
   * Revoke user consent
   */
  revokeConsent(studentName: string, consentType: ConsentData['consentType']): void {
    const existingConsents = this.getStoredConsents();
    const updatedConsents = existingConsents.map(consent => {
      if (consent.studentName === studentName && consent.consentType === consentType) {
        return { ...consent, granted: false, timestamp: new Date() };
      }
      return consent;
    });

    localStorage.setItem(this.CONSENT_STORAGE_KEY, JSON.stringify(updatedConsents));
  }

  /**
   * Get all stored consents
   */
  private getStoredConsents(): ConsentData[] {
    try {
      const stored = localStorage.getItem(this.CONSENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored consents:', error);
      return [];
    }
  }

  /**
   * Get privacy settings
   */
  getPrivacySettings(): PrivacySettings {
    try {
      const stored = localStorage.getItem(this.PRIVACY_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        analytics: false,
        marketing: false,
        functional: true,
        necessary: true
      };
    } catch (error) {
      console.error('Error reading privacy settings:', error);
      return {
        analytics: false,
        marketing: false,
        functional: true,
        necessary: true
      };
    }
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: PrivacySettings): void {
    localStorage.setItem(this.PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
    
    // Apply settings immediately
    this.applyPrivacySettings(settings);
  }

  /**
   * Apply privacy settings to page
   */
  private applyPrivacySettings(settings: PrivacySettings): void {
    // Disable analytics if not consented
    if (!settings.analytics && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    // Handle marketing cookies
    if (!settings.marketing) {
      this.clearMarketingCookies();
    }

    // Functional cookies handling
    if (!settings.functional) {
      this.clearFunctionalCookies();
    }
  }

  /**
   * Clear marketing cookies
   */
  private clearMarketingCookies(): void {
    const marketingCookies = ['_ga', '_gid', '_fbp', '_fbc'];
    marketingCookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }

  /**
   * Clear functional cookies (preserve necessary ones)
   */
  private clearFunctionalCookies(): void {
    const functionalCookies = ['user-preferences', 'session-data'];
    functionalCookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }

  /**
   * Generate parental consent form data
   */
  generateConsentForm(studentName: string): {
    formId: string;
    studentName: string;
    requiredConsents: Array<{
      type: ConsentData['consentType'];
      description: string;
      required: boolean;
    }>;
    privacyNoticeUrl: string;
    dataRetentionPeriod: string;
  } {
    return {
      formId: `consent-${Date.now()}`,
      studentName,
      requiredConsents: [
        {
          type: 'photography',
          description: 'Permission to photograph your child during robotics activities',
          required: false
        },
        {
          type: 'video',
          description: 'Permission to record your child in videos showcasing team activities',
          required: false
        },
        {
          type: 'website',
          description: 'Permission to feature your child\'s achievements on our website',
          required: false
        },
        {
          type: 'newsletter',
          description: 'Permission to send team updates and newsletters',
          required: false
        },
        {
          type: 'data-collection',
          description: 'Basic data collection for team management and communication',
          required: true
        }
      ],
      privacyNoticeUrl: '/privacy-policy',
      dataRetentionPeriod: '2 years after graduation or team departure'
    };
  }

  /**
   * Get client IP (in production this would be handled server-side)
   */
  private getClientIP(): string {
    // This is a placeholder - IP should be collected server-side for privacy
    return 'client-side-unavailable';
  }

  /**
   * Check if user is under 16 (GDPR requirement)
   */
  isMinorUser(birthDate: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 16;
    }
    
    return age < 16;
  }

  /**
   * Generate GDPR-compliant privacy notice
   */
  getPrivacyNotice(): {
    lastUpdated: string;
    dataController: any;
    dataProcessingPurposes: any[];
    legalBasis: any[];
    dataRetention: any;
    userRights: any[];
  } {
    return {
      lastUpdated: '2024-01-15',
      dataController: {
        name: 'Ali Secondary School Robotics Team',
        address: '456 School Lane, Educational District, ED 67890',
        email: 'privacy@alirobotics.edu',
        phone: '+1-555-0123'
      },
      dataProcessingPurposes: [
        {
          purpose: 'Team Management',
          data: 'Name, grade, contact information',
          legalBasis: 'Legitimate interest for educational activities'
        },
        {
          purpose: 'Marketing & Communications',
          data: 'Photos, videos, achievements',
          legalBasis: 'Consent'
        },
        {
          purpose: 'Website Analytics',
          data: 'Usage statistics, session data',
          legalBasis: 'Consent'
        }
      ],
      legalBasis: [
        'Consent (GDPR Article 6(1)(a))',
        'Legitimate interest (GDPR Article 6(1)(f))',
        'Performance of contract (GDPR Article 6(1)(b))'
      ],
      dataRetention: {
        activeStudents: 'Duration of team membership',
        alumni: '2 years after graduation',
        consentRecords: '3 years for audit purposes',
        analytics: '26 months'
      },
      userRights: [
        'Right to access your data',
        'Right to rectify incorrect data',
        'Right to erase your data',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent'
      ]
    };
  }
}