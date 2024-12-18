/**
 * Interface representing the structure of user profile data
 */
export interface UserProfileData {
  /** Optional user name */
  name?: string;
  /** User preferences */
  preferences: {
    /** UI theme preference */
    theme?: string;
    /** Notification settings */
    [key: string]: any;
  };
  /** User interaction metadata */
  metadata: {
    /** First interaction timestamp */
    firstInteraction: Date;
    /** Last interaction timestamp */
    lastInteraction: Date;
    /** Total number of interactions */
    totalInteractions: number;
  };
  /** User expertise information */
  expertise: {
    /** Known programming languages */
    level?: string;
    /** Known frameworks */
    yearsOfExperience?: number;
    /** Known tools */
    [key: string]: any;
  };
  /** User location information */
  location: {
    /** Country */
    country?: string;
    /** City */
    city?: string;
    /** Additional location info */
    [key: string]: any;
  };
}

/**
 * Class representing a user profile with interaction history and preferences
 */
export class UserProfile {
  private data: UserProfileData;

  /**
   * Creates a new UserProfile instance
   * @param data Optional partial user profile data
   */
  constructor(data?: Partial<UserProfileData>) {
    this.data = {
      preferences: {},
      expertise: {},
      location: {},
      metadata: {
        firstInteraction: new Date(),
        lastInteraction: new Date(),
        totalInteractions: 0
      },
      ...data
    };
  }

  /**
   * Gets the user's name
   * @returns The user's name or undefined
   */
  public getName(): string | undefined {
    return this.data.name;
  }

  /**
   * Sets the user's name
   * @param name The name to set
   */
  public setName(name: string): void {
    this.data.name = name;
  }

  /**
   * Gets the user's preferences
   * @returns The user's preferences object
   */
  public getPreferences(): Record<string, any> {
    return this.data.preferences;
  }

  /**
   * Sets a user's preference
   * @param key The key of the preference to set
   * @param value The value of the preference to set
   */
  public setPreference(key: string, value: any): void {
    this.data.preferences[key] = value;
  }

  /**
   * Gets the user's expertise information
   * @returns The user's expertise object
   */
  public getExpertise(): Record<string, any> {
    return this.data.expertise;
  }

  /**
   * Sets a user's expertise
   * @param key The key of the expertise to set
   * @param value The value of the expertise to set
   */
  public setExpertise(key: string, value: any): void {
    this.data.expertise[key] = value;
  }

  /**
   * Gets the user's location information
   * @returns The user's location object
   */
  public getLocation(): Record<string, any> {
    return this.data.location;
  }

  /**
   * Sets a user's location information
   * @param key The key of the location info to set
   * @param value The value of the location info to set
   */
  public setLocation(key: string, value: any): void {
    this.data.location[key] = value;
  }

  /**
   * Helper method to ensure a value is a Date object
   * @param value The value to convert
   * @returns A Date object
   */
  private ensureDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
  }

  /**
   * Updates the interaction metadata
   */
  public updateInteraction(): void {
    this.data.metadata.lastInteraction = new Date();
    this.data.metadata.totalInteractions++;
  }

  /**
   * Gets the user's interaction statistics
   * @returns Object containing interaction stats
   */
  public getInteractionStats(): {
    totalInteractions: number;
    daysSinceFirstInteraction: number;
  } {
    const now = new Date();
    const firstInteraction = new Date(this.data.metadata.firstInteraction);
    const daysSinceFirstInteraction = Math.floor(
      (now.getTime() - firstInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalInteractions: this.data.metadata.totalInteractions,
      daysSinceFirstInteraction,
    };
  }

  /**
   * Gets a summary of the user's profile
   * @returns A string summarizing the user's profile
   */
  public getSummary(): string {
    const parts: string[] = [];
    
    if (this.data.name) {
      parts.push(`name: ${this.data.name}`);
    }
    
    if (this.data.expertise.level) {
      parts.push(`level: ${this.data.expertise.level}`);
    }
    
    if (this.data.expertise.yearsOfExperience) {
      parts.push(`${this.data.expertise.yearsOfExperience} years of experience`);
    }
    
    if (this.data.location.country) {
      parts.push(`from ${this.data.location.city ? this.data.location.city + ', ' : ''}${this.data.location.country}`);
    }
    
    return parts.join(', ');
  }

  /**
   * Converts the profile to a JSON-safe object
   * @returns JSON-safe representation of the profile
   */
  public toJSON(): UserProfileData {
    return {
      ...this.data,
    };
  }
} 