import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetaService } from '../../core/services/meta.service';
import { WebSearchService } from '../../core/services/web-search.service';
import { ThemeService } from '../../core/services/theme.service';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'tourist' | 'transport' | 'events' | 'emergency' | 'general';
}

interface QuickReply {
  text: string;
  category: string;
  query: string;
}

interface Suggestion {
  question: string;
  answer: string;
}

interface SuggestionResponse {
  suggestions: Suggestion[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  private readonly metaService = inject(MetaService);
  private readonly fb = inject(FormBuilder);
  private readonly webSearchService = inject(WebSearchService);
  private readonly themeService = inject(ThemeService);

  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  isTyping = false;
  isSearchingWeb = false;
  currentLanguage = 'en';

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  constructor() {
    // Initialize form in constructor
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }
  suggestions: Suggestion[] = [];

  private async loadSuggestions() {
    try {
      const response = await fetch('assets/data/question_answer.json');
      const data: SuggestionResponse = await response.json();
      this.suggestions = data.suggestions;
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }

  private findSuggestion(query: string): Suggestion | undefined {
    if (!this.suggestions.length) return undefined;
    
    // Convert query to lowercase and remove punctuation for better matching
    const normalizedQuery = query.toLowerCase().replace(/[.,?!]/g, '').trim();
    
    // Split into words for better matching
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);
    
    // Find the best matching suggestion by scoring each one
    let bestMatch: {suggestion: Suggestion, score: number} | undefined;
    
    this.suggestions.forEach(suggestion => {
      const normalizedQuestion = suggestion.question.toLowerCase().replace(/[.,?!]/g, '').trim();
      const questionWords = normalizedQuestion.split(' ').filter(word => word.length > 2);
      
      // Calculate match score based on word overlap
      let score = 0;
      queryWords.forEach(queryWord => {
        if (questionWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
          score++;
        }
      });
      
      // Bonus points for exact matches
      if (normalizedQuery === normalizedQuestion) {
        score += 10;
      }
      
      // Update best match if this score is higher
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {suggestion, score};
      }
    });
    
    // Return the suggestion if it has a minimum score (at least 2 matching words)
    return bestMatch && bestMatch.score >= 2 ? bestMatch.suggestion : undefined;
  }

  // Quick reply suggestions
  quickReplies: QuickReply[] = [
    { text: '🏖️ Tourist Spots', category: 'tourist', query: 'Show me popular tourist attractions in Dubai' },
    { text: '🚗 Transport Info', category: 'transport', query: 'How can I get around Dubai using public transport?' },
    { text: '🎉 Cultural Events', category: 'events', query: 'What cultural events are happening in UAE this month?' },
    { text: '🚨 Emergency Help', category: 'emergency', query: 'I need emergency contact numbers in UAE' },
    { text: '🌤️ Weather Info', category: 'general', query: 'What\'s the weather like in Dubai today?' },
    { text: '🍽️ Local Food', category: 'events', query: 'Recommend traditional UAE restaurants' }
  ];

  ngOnInit() {
    this.metaService.updateMeta({
      title: 'UAE Information AI Chatbot - Ali Robotics Team',
      description: 'Get real-time information about UAE tourist spots, transport, events, culture, and emergency services using our AI-powered chatbot.',
      keywords: 'UAE, Dubai, chatbot, AI, tourist information, transport, emergency services, cultural events'
    });

    // Load suggestions asynchronously
    this.loadSuggestions().catch(error => {
      console.error('Error loading suggestions:', error);
    });

    this.addWelcomeMessage();
  }

  private addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      text: this.getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      category: 'general'
    };
    this.messages.push(welcomeMessage);
  }

  private getWelcomeMessage(): string {
    const messages = {
      en: `🇦🇪 Welcome to UAE Information AI Chatbot!

I'm here to help you discover the best of the United Arab Emirates. I can provide real-time information about:

🏖️ Tourist attractions and hidden gems
🚗 Transportation and routes  
🎉 Cultural events and festivals
🚨 Emergency services and contacts
🌤️ Weather and activity suggestions
🔍 **Web search for UAE topics** - Ask me anything about UAE!

What would you like to know about the UAE today?`,
      ar: `🇦🇪 أهلاً بك في روبوت الذكي لمعلومات الإمارات العربية المتحدة!

أنا هنا لمساعدتك في اكتشاف أفضل ما في دولة الإمارات العربية المتحدة. يمكنني تقديم معلومات فورية حول:

🏖️ المعالم السياحية والأماكن المخفية
🚗 النقل والطرق
🎉 الأحداث الثقافية والمهرجانات  
🚨 الخدمات الطارئة وأرقام الاتصال
🌤️ الطقس والتوصيات المحلية
🔍 **البحث على الويب لمواضيع الإمارات** - اسألني عن أي شيء يتعلق بالإمارات!

ماذا تريد أن تعرف عن الإمارات اليوم؟`,
      pa: `🇦🇪 UAE معلومات AI چیٹ بوٹ وچ خوش آمدید!

میں تہانوں متحدہ عرب امارات دا بہترین دکھاؤن لئی ایتھے آں۔ میں فوری معلومات دے سکدا آں:

🏖️ سیاحی مقامات تے چھپے ہوئے موتی
🚗 ٹرانسپورٹ تے راستے
🎉 ثقافتی واقعات تے تہوار
🚨 ایمرجنسی سروسز تے رابطے
🌤️ موسم تے مقامی سفارشات
🔍 **UAE موضوعات لئی ویب سرچ** - UAE بارے کی جاننا چاہندے او؟

اج تسیں UAE بارے کی جاننا چاہندے او؟`
    };
    return messages[this.currentLanguage as keyof typeof messages] || messages.en;
  }

  onSendMessage() {
    const messageControl = this.chatForm.get('message');

    if (this.chatForm.valid) {
      const messageText = messageControl?.value;

      if (messageText?.trim()) {
        try {
          this.addUserMessage(messageText.trim());
          this.processUserQuery(messageText.trim());
          this.chatForm.reset();
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    }
  }

  onQuickReply(reply: QuickReply) {
    this.addUserMessage(reply.text);
    this.processUserQuery(reply.query, reply.category);
  }

  private addUserMessage(text: string) {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
  }

  private addBotMessage(text: string, category: string = 'general') {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: false,
      timestamp: new Date(),
      category: category as any
    };
    this.messages.push(botMessage);
  }

  private async processUserQuery(query: string, category?: string) {
    this.isTyping = true;

    // First check if we have a matching suggestion
    const suggestion = this.findSuggestion(query);
    if (suggestion) {
      // Short delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 500));
      this.addBotMessage(suggestion.answer, category || 'general');
      this.isTyping = false;
      return;
    }

    // Check if query is UAE-related and should trigger web search
    // Skip web search for very short queries, greetings, or single words
    const trimmedQuery = query.trim();
    const isShortQuery = trimmedQuery.split(/\s+/).length < 2;
    const isGreeting = /^(hi|hello|hey|howdy|greetings?|good\s+(morning|afternoon|evening)|thanks?|thank you|bye|goodbye|see you)/i.test(trimmedQuery);

    if (!isShortQuery && !isGreeting) {
      this.isSearchingWeb = true;
      this.isTyping = false; // Turn off typing indicator while showing search indicator

      try {
        // Use UAE-specific search for UAE queries, general search for others
        const searchResponse = this.webSearchService.isUAERelated(query)
          ? await this.webSearchService.searchWeb(query)
          : await this.webSearchService.searchWebGeneral(query);

        const formattedResults = this.webSearchService.formatSearchResults(searchResponse);
        this.addBotMessage(formattedResults, 'general');
      } catch (error) {
        console.error('Web search failed:', error);
        this.addBotMessage('I apologize, but I\'m having trouble searching the web right now. Let me provide you with some general information instead.\n\n' + this.getGeneralResponse(), 'general');
      } finally {
        this.isSearchingWeb = false;
      }
      return;
    }

    this.isTyping = true;

    // Simulate AI processing delay for non-UAE queries
    setTimeout(() => {
      const response = this.generateAIResponse(query, category);
      const botMessage: ChatMessage = {
        id: this.generateId(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        category: category as any
      };
      this.messages.push(botMessage);
      this.isTyping = false;
    }, 1500);
  }

  private generateAIResponse(query: string, category?: string): string {
    // This will be replaced with actual PictoBlox AI integration
    const lowerQuery = query.toLowerCase();
    
    if (category === 'tourist' || lowerQuery.includes('tourist') || lowerQuery.includes('attraction') || lowerQuery.includes('dubai')) {
      return this.getTouristResponse();
    } else if (category === 'transport' || lowerQuery.includes('transport') || lowerQuery.includes('metro') || lowerQuery.includes('bus')) {
      return this.getTransportResponse();
    } else if (category === 'events' || lowerQuery.includes('event') || lowerQuery.includes('culture') || lowerQuery.includes('food')) {
      return this.getEventsResponse();
    } else if (category === 'emergency' || lowerQuery.includes('emergency') || lowerQuery.includes('help') || lowerQuery.includes('police')) {
      return this.getEmergencyResponse();
    } else if (lowerQuery.includes('weather')) {
      return this.getWeatherResponse();
    } else {
      return this.getGeneralResponse();
    }
  }

  private getTouristResponse(): string {
    return `🏖️ **Top UAE Tourist Attractions**

**Dubai:**
• Burj Khalifa - World's tallest building (Opens 8:30 AM - 11 PM)
• Dubai Mall - Shopping paradise with aquarium
• Palm Jumeirah - Artificial island with luxury resorts
• Dubai Fountain - Musical fountain show every 30 mins

**Abu Dhabi:**
• Louvre Abu Dhabi - Art and culture museum  
• Sheikh Zayed Grand Mosque - Stunning architecture
• Ferrari World - Theme park for car enthusiasts

**Current Weather:** Perfect for sightseeing! ☀️

Would you like specific information about any of these attractions?`;
  }

  private getTransportResponse(): string {
    return `🚗 **UAE Transportation Guide**

**Dubai Metro:**
• Red Line: Dubai Airport ↔ UAE Exchange (6 AM - 12 AM)
• Green Line: Etisalat ↔ Creek (5:30 AM - 12 AM)
• Cost: AED 3-8.5 per journey

**Dubai Bus:**
• 119 routes across the city
• Cost: AED 3-10 per journey
• Real-time tracking via Wojhati app

**Taxis:**
• Starting fare: AED 5 (day) / AED 5.5 (night)
• Uber & Careem also available

**Abu Dhabi:**
• Department of Transport buses
• Darb card for easy payment

Need specific route planning? Just ask!`;
  }

  private getEventsResponse(): string {
    return `🎉 **Current UAE Cultural Events**

**This Month:**
• Dubai Shopping Festival (Jan-Feb) - Discounts & entertainment
• Al Dhafra Festival - Traditional camel beauty contest
• Dubai Food Festival - Culinary celebrations

**Traditional Culture:**
• Friday Mosque visits (respectful dress required)
• Traditional souks: Gold, Spice, Textile
• Heritage villages in each emirate

**Dining Recommendations:**
• Al Hadheerah - Desert dining experience
• Pierchic - Seafood over water
• Arabian Tea House - Traditional Emirati cuisine

What type of cultural experience interests you most?`;
  }

  private getEmergencyResponse(): string {
    return `🚨 **UAE Emergency Services**

**Universal Emergency:** 999
**Police:** 999
**Fire Department:** 997  
**Ambulance:** 998

**Dubai Specific:**
• Dubai Police: +971 4 609 6999
• Dubai Municipality: 800 900
• Dubai Electricity: 991

**Abu Dhabi:**
• Abu Dhabi Police: +971 2 512 3456
• ADNOC: 800 300

**Tourist Police:**
• Dubai: +971 800 4438
• Available 24/7 in multiple languages

**Hospitals:**
• Dubai Hospital: +971 4 219 5000
• Cleveland Clinic Abu Dhabi: +971 2 501 9999

Are you currently experiencing an emergency? If yes, please call 999 immediately!`;
  }

  private getWeatherResponse(): string {
    return `🌤️ **UAE Weather Update**

**Current Conditions:**
• Dubai: 28°C, Sunny ☀️
• Abu Dhabi: 26°C, Partly Cloudy ⛅
• Sharjah: 27°C, Clear skies

**Today's Forecast:**
• High: 32°C / Low: 22°C
• Humidity: 45%
• UV Index: 8 (High) - Use sunscreen!

**Perfect Activities:**
• Morning: Beach visits, outdoor sightseeing
• Afternoon: Indoor malls, museums  
• Evening: Desert safari, outdoor dining

**Clothing Recommendation:**
Light, breathable fabrics. Carry a light jacket for air-conditioned spaces.

Need weather for specific dates or activities?`;
  }

  private getGeneralResponse(): string {
    return `Thank you for your question! I'm here to help with information about the UAE. 

I can assist you with:
🏖️ Tourist attractions and recommendations
🚗 Transportation and getting around
🎉 Cultural events and local customs
🚨 Emergency services and safety
🌤️ Weather and activity suggestions

Could you please be more specific about what you'd like to know? For example:
• "Show me Dubai tourist spots"
• "How do I use Dubai Metro?"  
• "What cultural events are happening?"
• "I need emergency contacts"

I'm designed to provide the most helpful UAE information possible!`;
  }

  switchLanguage(lang: string) {
    this.currentLanguage = lang;
    // In a real implementation, this would trigger translation of existing messages
    let languageName: string;
    if (lang === 'en') {
      languageName = 'English';
    } else if (lang === 'ar') {
      languageName = 'العربية';
    } else {
      languageName = 'ਪੰਜਾਬੀ';
    }
    this.addSystemMessage(`Language switched to ${languageName}`);
  }

  private addSystemMessage(text: string) {
    const systemMessage: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: false,
      timestamp: new Date(),
      category: 'general'
    };
    this.messages.push(systemMessage);
  }

  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }

  onEnterKeyPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey && keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      if (this.chatForm.valid && !this.isTyping) {
        this.onSendMessage();
      }
    }
  }

  private generateId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}
