import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyService } from '../../core/services/privacy.service';
import { MetaService } from '../../core/services/meta.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {
  privacyNotice: any;

  constructor(
    private privacyService: PrivacyService,
    private metaService: MetaService
  ) {}

  ngOnInit(): void {
    this.privacyNotice = this.privacyService.getPrivacyNotice();
    
    // Set page meta data
    this.metaService.setPageMeta({
      title: 'Privacy Policy - Ali Robotics Team',
      description: 'Privacy policy and data protection information for Ali Robotics Team website and activities.',
      keywords: ['privacy', 'data protection', 'GDPR', 'robotics team', 'school'],
      canonicalUrl: 'https://alirobotics.edu/privacy-policy'
    });
  }

  downloadPrivacyPolicy(): void {
    // Generate PDF version of privacy policy
    const content = this.generatePrintablePrivacyPolicy();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ali-robotics-privacy-policy.txt';
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  private generatePrintablePrivacyPolicy(): string {
    const notice = this.privacyNotice;
    
    return `
PRIVACY POLICY - ALI ROBOTICS TEAM
Last Updated: ${notice.lastUpdated}

DATA CONTROLLER
${notice.dataController.name}
${notice.dataController.address}
Email: ${notice.dataController.email}
Phone: ${notice.dataController.phone}

DATA PROCESSING PURPOSES
${notice.dataProcessingPurposes.map((purpose: any) => `
- ${purpose.purpose}
  Data Collected: ${purpose.data}
  Legal Basis: ${purpose.legalBasis}
`).join('')}

LEGAL BASIS FOR PROCESSING
${notice.legalBasis.map((basis: string) => `- ${basis}`).join('\n')}

DATA RETENTION PERIODS
- Active Students: ${notice.dataRetention.activeStudents}
- Alumni: ${notice.dataRetention.alumni}
- Consent Records: ${notice.dataRetention.consentRecords}
- Analytics Data: ${notice.dataRetention.analytics}

YOUR RIGHTS UNDER GDPR
${notice.userRights.map((right: string) => `- ${right}`).join('\n')}

For questions about this privacy policy or to exercise your rights, contact us at ${notice.dataController.email}.
    `.trim();
  }
}