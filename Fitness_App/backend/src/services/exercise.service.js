import axios from 'axios';

class ExerciseService {
  constructor() {
    this.baseURL = 'https://wger.de/api/v2';
    this.token = process.env.WGER_API_KEY || 'e6475225bae4c13a2b5435d5ff5e345a9905196e'; 
  }

  mapWgerExercise(item) {
    const translation = item.translations?.find(t => t.language === 2) || item.translations?.[0] || {};
    const name = translation.name || `Exercise ${item.id}`;
    const target = item.muscles?.[0]?.name_en || item.muscles?.[0]?.name || "general";
    let bodyPart = (item.category?.name || "full body").toLowerCase();
    
    // Convert Wger categories to exercisedb equivalents for frontend compatibility
    if (bodyPart === 'arms') bodyPart = 'lower arms';
    if (bodyPart === 'legs') bodyPart = 'upper legs';
    if (bodyPart === 'calves') bodyPart = 'lower legs';
    if (bodyPart === 'abs') bodyPart = 'waist';

    const equipment = item.equipment?.[0]?.name || "body weight";
    
    let gifUrl = null;
    if (item.images?.length > 0 && item.images[0].image) {
       gifUrl = item.images[0].image;
       if (!gifUrl.startsWith('http')) {
           gifUrl = 'https://wger.de' + gifUrl;
       }
    } else {
       gifUrl = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"; 
    }

    return {
      id: String(item.id),
      name: name.toLowerCase(),
      target: target.toLowerCase(),
      bodyPart: bodyPart,
      equipment: equipment.toLowerCase(),
      gifUrl
    };
  }

  async getAllExercises(limit = 300) {
    const headers = { 
      'Authorization': `Token ${this.token}`, 
      'Accept': 'application/json' 
    };
    try {
      const response = await axios.get(`${this.baseURL}/exerciseinfo/?language=2&limit=${limit}`, { headers });
      return response.data.results.map(this.mapWgerExercise);
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.message;
      console.error('[exercises] Wger API request failed:', status ?? '', detail);
      return this.getMockExercises('api_error');
    }
  }

  async getExercisesByBodyPart(bodyPart, limit = 50) {
    const headers = { 
      'Authorization': `Token ${this.token}`, 
      'Accept': 'application/json' 
    };
    try {
      const response = await axios.get(`${this.baseURL}/exerciseinfo/?language=2&limit=300`, { headers });
      const mapped = response.data.results.map(this.mapWgerExercise);
      return mapped.filter((e) => e.bodyPart.includes(bodyPart.toLowerCase())).slice(0, limit);
    } catch (error) {
      console.error('[exercises] Wger API bodyPart request failed:', error.message);
      return this.getMockExercises('api_error');
    }
  }

  getMockExercises(reason = 'missing_key') {
    const label = 'Mock Data (Wger Failed)';
    return [
      { id: "1", name: `barbell bench press (${label})`, bodyPart: "chest", equipment: "barbell", target: "pectorals", gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" },
      { id: "2", name: "squat (mock)", bodyPart: "upper legs", equipment: "barbell", target: "quads", gifUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
      { id: "3", name: "dumbbell curl (mock)", bodyPart: "lower arms", equipment: "dumbbell", target: "biceps", gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80" },
      { id: "4", name: "lat pulldown (mock)", bodyPart: "back", equipment: "cable", target: "lats", gifUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80" }
    ];
  }
}

export default new ExerciseService();
