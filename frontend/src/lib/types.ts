export interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  tags: string[];
  active_users_nearby: number;
  thumbnail: string;
  emotional_description: string;
}

// Represents the full API response for recommendations
export interface RecommendationResponse {
  mood_input: {
    primary_mood: string;
    intensity: number;
    context?: string;
  };
  location: string;
  recommendations: Place[];
  mood_insights: string;
}

// Represents the data sent to the backend to get recommendations
export interface MoodData {
  primary_mood: string;
  intensity: number;
  context?: string;
}
