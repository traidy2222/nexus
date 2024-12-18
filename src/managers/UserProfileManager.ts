import { UserProfile } from '../types/UserProfile';

interface ProfileChange {
  field: string;
  value: any;
  confidence: number;
}

export class UserProfileManager {
  private profile: UserProfile;
  private llm: any;
  private settings: any;
  private addTerminalLog: (log: string) => void;

  constructor(profile: UserProfile, llm: any, settings: any, addTerminalLog: (log: string) => void) {
    this.profile = profile;
    this.llm = llm;
    this.settings = settings;
    this.addTerminalLog = addTerminalLog;
  }

  private async logToTerminal(message: string) {
    try {
      this.addTerminalLog(`[UserProfile] ${message}`);
    } catch (error) {
      console.error('Error logging to terminal:', error);
    }
  }

  async detectProfileChanges(input: string): Promise<ProfileChange[]> {
    const systemPrompt = `You are Cursor, detecting changes to your understanding of the user.
Look for information they share about themselves.

DETECTION RULES:
- ONLY detect explicit statements about personal information
- DO NOT make assumptions or infer information
- DO NOT detect implied updates
- Only match exact, clear statements
- Be extremely conservative - only highest confidence matches
- Ignore contextual hints or implications

Fields to detect:
- name: User's name (only when explicitly stated)
- preferences.theme: UI theme preference (only when explicitly stated)
- expertise.level: Developer level (only when explicitly stated)
- expertise.yearsOfExperience: Years of coding experience (only when explicitly stated)
- expertise.languages: Programming languages they know (only when explicitly stated)
- expertise.frameworks: Frameworks they're familiar with (only when explicitly stated)
- location.country: User's country (only when explicitly stated)
- location.city: User's city (only when explicitly stated)

Return a JSON array of changes, each with:
- field: The profile field being updated
- value: The new value
- confidence: Number between 0-1 indicating certainty

Example inputs and outputs:
Input: "my name is John"
[{ "field": "name", "value": "John", "confidence": 0.95 }]

Input: "I prefer dark mode"
[{ "field": "preferences.theme", "value": "dark", "confidence": 0.8 }]

Input: "I'm a senior developer"
[{ "field": "expertise.level", "value": "senior", "confidence": 0.9 }]

Input: "I'm from the Netherlands"
[{ "field": "location.country", "value": "Netherlands", "confidence": 0.95 }]

Input: "my name is john and i have 14 years experience coding im from netherlands"
[
  { "field": "name", "value": "john", "confidence": 0.95 },
  { "field": "expertise.yearsOfExperience", "value": 14, "confidence": 0.9 },
  { "field": "location.country", "value": "Netherlands", "confidence": 0.9 }
]

Only return valid JSON. If no explicit statements detected, return empty array []`;

    try {
      const response = await this.llm(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        this.settings
      );

      const changes = JSON.parse(response);
      return Array.isArray(changes) ? changes : [];
    } catch (error) {
      console.error('Error detecting profile changes:', error);
      return [];
    }
  }

  async processChanges(changes: ProfileChange[]): Promise<string[]> {
    const updates: string[] = [];

    for (const change of changes) {
      if (change.confidence >= 0.8) {
        try {
          const oldValue = this.getOldValue(change.field);
          switch (change.field) {
            case 'name':
              this.profile.setName(change.value);
              updates.push(`name to ${change.value}`);
              await this.logToTerminal(`Updated name: ${oldValue} -> ${change.value}`);
              break;
            case 'preferences.theme':
              this.profile.setPreference('theme', change.value);
              updates.push(`theme preference to ${change.value}`);
              await this.logToTerminal(`Updated theme: ${oldValue} -> ${change.value}`);
              break;
            case 'expertise.level':
              this.profile.setExpertise('level', change.value);
              updates.push(`experience level to ${change.value}`);
              await this.logToTerminal(`Updated expertise level: ${oldValue} -> ${change.value}`);
              break;
            case 'expertise.yearsOfExperience':
              this.profile.setExpertise('yearsOfExperience', change.value);
              updates.push(`years of experience to ${change.value}`);
              await this.logToTerminal(`Updated years of experience: ${oldValue} -> ${change.value}`);
              break;
            case 'expertise.languages':
              this.profile.setExpertise('languages', change.value);
              const oldLangs = Array.isArray(oldValue) ? oldValue.join(', ') : 'none';
              const newLangs = change.value.join(', ');
              updates.push(`programming languages: ${newLangs}`);
              await this.logToTerminal(`Updated languages: ${oldLangs} -> ${newLangs}`);
              break;
            case 'expertise.frameworks':
              this.profile.setExpertise('frameworks', change.value);
              const oldFrameworks = Array.isArray(oldValue) ? oldValue.join(', ') : 'none';
              const newFrameworks = change.value.join(', ');
              updates.push(`frameworks: ${newFrameworks}`);
              await this.logToTerminal(`Updated frameworks: ${oldFrameworks} -> ${newFrameworks}`);
              break;
            case 'location.country':
              this.profile.setLocation('country', change.value);
              updates.push(`country to ${change.value}`);
              await this.logToTerminal(`Updated country: ${oldValue} -> ${change.value}`);
              break;
            case 'location.city':
              this.profile.setLocation('city', change.value);
              updates.push(`city to ${change.value}`);
              await this.logToTerminal(`Updated city: ${oldValue} -> ${change.value}`);
              break;
          }
        } catch (error) {
          console.error(`Error updating ${change.field}:`, error);
          await this.logToTerminal(`Error updating ${change.field}: ${error.message}`);
        }
      }
    }

    return updates;
  }

  private getOldValue(field: string): any {
    const parts = field.split('.');
    if (parts[0] === 'name') {
      return this.profile.getName() || 'none';
    } else if (parts[0] === 'preferences') {
      return this.profile.getPreferences()[parts[1]] || 'none';
    } else if (parts[0] === 'expertise') {
      return this.profile.getExpertise()[parts[1]] || 'none';
    }
    return 'none';
  }

  async handleInput(input: string): Promise<string | null> {
    const changes = await this.detectProfileChanges(input);
    if (changes.length === 0) {
      return null;
    }

    const updates = await this.processChanges(changes);
    if (updates.length === 0) {
      return null;
    }

    const systemPrompt = `You are Cursor, acknowledging updates to your understanding of the user.
You should respond naturally and warmly about what you've learned.

RESPONSE STYLE:
- Be friendly and natural
- Only acknowledge the specific information shared
- Don't make assumptions about other traits or characteristics
- Keep responses simple and focused
- Show appreciation for learning the information

Updates made: ${updates.join(', ')}

Example responses:
"Nice to meet you, [name]! I'll remember that."
"Got it, I'll use [name] from now on."
"Thanks for letting me know you prefer dark mode!"

Remember: Only acknowledge the specific information shared, don't make assumptions or inferences.`;

    try {
      const response = await this.llm(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a natural response about these updates:' }
        ],
        this.settings
      );

      return response;
    } catch (error) {
      console.error('Error generating update response:', error);
      return null;
    }
  }

  getProfile(): UserProfile {
    return this.profile;
  }
} 