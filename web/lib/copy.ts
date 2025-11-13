// Centralized marketing copy for IntakeLegal
// Single source of truth for all user-facing strings
// v1.0 - Revised Copy Deck Implementation

export const COPY = {
  // Navigation
  nav: {
    tryDemo: 'Try Demo',
    myIntakes: 'My Intakes',
    pricing: 'Plans & Pricing',
    security: 'Data & Compliance',
    support: 'Help Centre',
    about: 'About Us',
    signIn: 'Sign In',
  },

  // CTAs (Standardized)
  cta: {
    primary: 'Try Demo',
    secondary: 'Start Free Trial',
    upload: 'Upload Your First Case',
    viewSample: 'View Sample Case',
  },

  // Home page
  home: {
    hero: {
      heading: 'AI-Powered Client Intake for Law Firms',
      subtext: 'Automate client intake, summaries, and limitation analysis with GDPR-compliant AI. Process emails, recordings, and documents in seconds.',
      primaryCta: 'Try Demo',
      secondaryCta: 'View Plans',
    },
    features: [
      {
        title: 'Automated Extraction',
        description: 'Extract client details, case facts, and law areas from emails, documents, and voice recordings automatically.',
      },
      {
        title: 'Limitation Analysis',
        description: 'Instant statute of limitations checks with color-coded urgency. Never miss a critical deadline.',
      },
      {
        title: 'Smart Follow-Ups',
        description: 'AI identifies missing information and generates targeted questions to complete your intake.',
      },
    ],
  },

  // Workspace (formerly Try It)
  workspace: {
    heading: 'Upload & Process Client Intake',
    subtext: 'Upload a client email, voice recording, or document to see AI extraction in action.',
    sampleButton: 'Try a sample file',
    pasteButton: 'Paste email text',
    privacyHint: 'Files auto-deleted after 7 days. We never train AI models on your data.',
    pasteModal: {
      title: 'Paste Client Email or Message',
      placeholder: 'Paste the full text of a client email, voicemail transcript, or intake message here...\n\nExample:\nHi, my name is John Smith. I was in a car accident on March 15th on the M50. The other driver ran a red light and hit me. I have neck and back pain. Do I have a case?',
      submit: 'Analyze',
      cancel: 'Cancel',
    },
    success: {
      stickyCta: 'Save this case — Create free account',
      tryAnother: 'Upload Another',
      signUp: 'Start Free Trial',
    },
  },

  // Security & Compliance page
  security: {
    heading: 'Data & Compliance',
    subtext: 'How IntakeLegal protects your client data and meets GDPR requirements.',
    sectionTitles: ['Overview', 'Data Handling', 'Retention', 'Encryption', 'Hosting', 'DPA', 'Contact'],
    sections: {
      overview: {
        title: 'Overview',
        content: 'IntakeLegal is designed for law firms that take data protection seriously. We are GDPR-compliant by default and provide transparency into how client information is processed, stored, and protected.',
      },
      dataHandling: {
        title: 'Data Handling',
        content: 'All uploads are encrypted in transit (TLS 1.3) and at rest (AES-256). We never train AI models on your client data. Files are processed once and stored securely until your retention period expires.',
      },
      retention: {
        title: 'Retention Policies',
        content: 'Free plan: 7 days. Professional plan: 30 or 90 days (configurable). Enterprise plan: Up to 365 days or custom retention. After expiration, files and extracted data are permanently deleted from all systems.',
      },
      encryption: {
        title: 'Encryption & Access Control',
        content: 'All data is encrypted at rest using AES-256. Access to client data is restricted to authenticated users within your firm. API keys and credentials are stored in secure vaults and rotated regularly.',
      },
      hosting: {
        title: 'Hosting & Sub-processors',
        content: 'We use trusted, GDPR-compliant sub-processors: OpenAI (AI analysis, US-based with DPA), Neon (database hosting, EU), Render (API hosting, EU). All sub-processors are covered by Data Processing Agreements.',
      },
      region: {
        title: 'Data Residency',
        content: 'Free and Professional plans use EU data centers by default. Enterprise plans can request specific region pinning (EU, US, UK) to meet local regulatory requirements.',
      },
      dpa: {
        title: 'Data Processing Agreement',
        content: 'Professional and Enterprise plans include a signed DPA covering GDPR Article 28 requirements. To request a DPA or submit a data subject access request:',
        email: 'dpa@intakelegal.com',
      },
      contact: {
        title: 'Contact',
        content: 'For security inquiries or to report a vulnerability, contact:',
        email: 'security@intakelegal.com',
      },
    },
  },

  // Pricing page
  pricing: {
    heading: 'Plans Built for Every Firm',
    subtext: 'Choose the plan that fits your practice. All plans include AI-powered intake analysis and limitation checking.',
    disclaimer: 'Human-in-the-loop review recommended. AI analysis assists but does not replace professional legal judgment.',
    talkToSales: 'Contact Sales',
    signUp: 'Start Free Trial',
    plans: {
      free: {
        name: 'Free',
        price: '€0',
        period: '/month',
        description: 'Try IntakeLegal risk-free',
        features: [
          '5 intakes per month',
          '1 seat',
          'Standard AI models',
          '7-day data retention',
          'Email support',
        ],
        cta: 'Try Demo',
        ctaLink: '/workspace',
        highlighted: false,
      },
      professional: {
        name: 'Professional',
        price: '€99',
        period: '/month',
        description: 'For solo practitioners and small teams',
        features: [
          '100 intakes per month',
          '3 seats',
          'Custom templates',
          'PDF & DOCX exports',
          'Priority email support',
          'Custom retention (30/90 days)',
          'Signed DPA included',
        ],
        cta: 'Start Free Trial',
        ctaLink: '/sign-up?plan=professional',
        highlighted: true,
      },
      enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For established firms with compliance needs',
        features: [
          '500+ intakes per month',
          '10+ seats',
          'SSO / SAML integration',
          'DPA countersigned',
          'Region pinning (EU/US/UK)',
          'Dedicated account manager',
          'Custom integrations',
          'SLA guarantee',
        ],
        cta: 'Contact Sales',
        ctaLink: 'mailto:sales@intakelegal.com',
        highlighted: false,
      },
    },
  },

  // About page
  about: {
    heading: 'About IntakeLegal',
    mission: {
      title: 'Our Mission',
      content: 'IntakeLegal transforms how law firms handle client intake by leveraging AI technology. We automate the extraction and analysis of client information from documents and recordings, saving lawyers time and ensuring no critical details are missed.',
    },
    whyChoose: {
      title: 'Why Choose IntakeLegal',
      points: [
        'GDPR-compliant by design — EU data centers, signed DPAs, transparent retention policies',
        'Multi-format processing — Handle emails, Word docs, PDFs, and voice recordings',
        'Irish limitation law built-in — Accurate SOL calculations for Personal Injury, Defamation, and more',
        'Zero lock-in — Export your data anytime in PDF or DOCX format',
        'Human-in-the-loop — AI assists your workflow; you remain in control',
      ],
    },
    howItWorks: {
      title: 'How It Works',
      steps: [
        {
          number: 1,
          title: 'Upload Files',
          description: 'Upload intake documents (.docx, .pdf), emails (.eml), or audio recordings (.wav, .mp3).',
        },
        {
          number: 2,
          title: 'AI Extraction',
          description: 'Our AI extracts client information, case details, and key facts automatically.',
        },
        {
          number: 3,
          title: 'Review Summary',
          description: 'Get a professional summary with clarification questions, next steps, and statute of limitations analysis.',
        },
      ],
    },
  },

  // Support page
  support: {
    heading: 'Help Centre',
    subtext: 'Find answers to common questions and get started quickly.',
    gettingStarted: {
      title: 'Getting Started',
      steps: [
        'Try the demo — Upload a sample file without signing up',
        'Review the AI summary — Check extracted details and follow-up questions',
        'Sign up for free — Save your results and access advanced features',
        '(Optional) Configure templates — Customize AI output for your practice areas',
      ],
    },
    faqs: [
      {
        question: 'What file types are supported?',
        answer: 'IntakeLegal accepts Word documents (.docx), PDFs (.pdf), email files (.eml), and audio recordings (.wav, .mp3).',
      },
      {
        question: 'How accurate is the AI extraction?',
        answer: 'Our AI achieves high accuracy on structured intake documents. We recommend reviewing the output before finalizing. AI is a tool to assist, not replace, professional judgment.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. All files are encrypted in transit (TLS 1.3) and at rest (AES-256). We never train on your data. See our Data & Compliance page for full details.',
      },
      {
        question: 'Can I customize the intake fields?',
        answer: 'Yes! Professional and Enterprise plans include a Template Builder where you can configure custom fields and output templates.',
      },
      {
        question: 'What happens to uploaded files?',
        answer: 'Files are processed immediately and stored securely according to your retention policy (7-365 days). After expiration, they are permanently deleted.',
      },
      {
        question: 'Do you support multiple practice areas?',
        answer: 'Yes. IntakeLegal supports Personal Injury, Employment Law, Family Law, Criminal Defense, Medical Malpractice, and more.',
      },
    ],
    contact: {
      title: 'Still Have Questions?',
      content: 'Contact our support team:',
      email: 'support@intakelegal.com',
    },
  },

  // Template Builder
  templateBuilder: {
    authGate: {
      heading: 'Template Builder',
      subtext: 'Customize how IntakeLegal processes and presents intake information for your firm.',
      requiresAuth: 'Templates are a protected feature. Sign in to continue.',
      signInButton: 'Sign in to access',
    },
  },

  // Footer
  footer: {
    tagline: 'AI-powered client intake for law firms',
    copyright: '© 2025 IntakeLegal. All rights reserved.',
  },

  // Telemetry events (for reference)
  events: {
    heroCta: {
      uploadClicked: 'hero_cta_upload_clicked',
      sampleViewClicked: 'hero_cta_sample_view_clicked',
    },
    workspace: {
      uploadSuccess: 'workspace_upload_success',
      sampleFileUsed: 'workspace_sample_file_used',
      pasteTextUsed: 'workspace_paste_text_used',
    },
    summary: {
      signupClicked: 'summary_view_signup_click',
    },
  },
} as const;
