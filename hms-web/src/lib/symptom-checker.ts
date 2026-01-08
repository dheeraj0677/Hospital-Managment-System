
export function analyzeSymptoms(text: string): string {
    const lowerText = text.toLowerCase();

    // Keyword mapping
    const mappings: Record<string, string[]> = {
        "Cardiologist": ["heart", "chest pain", "palpitations", "blood pressure", "hypertension"],
        "Neurologist": ["headache", "migraine", "dizzy", "seizure", "numbness", "stroke"],
        "Dermatologist": ["skin", "rash", "itch", "acne", "hair", "nail"],
        "Orthopedist": ["bone", "fracture", "joint", "back pain", "knee", "spine"],
        "Pediatrician": ["child", "baby", "infant", "growth", "vaccine"],
        "Cardiothoracic Surgeon": ["surgery", "bypass", "valve", "chest surgery"],
        "Infectious Disease Specialist": ["infection", "virus", "bacteria", "contagious", "fever"],
        "Breast Cancer Surgeon": ["breast", "lump", "mammogram", "cancer", "tumor"],
        "Neurosurgeon": ["brain surgery", "spine surgery", "neural"],
        "General Physician": ["fever", "cold", "flu", "cough", "weakness", "checkup", "consult"]
    };

    for (const [specialization, keywords] of Object.entries(mappings)) {
        if (keywords.some(k => lowerText.includes(k))) {
            return specialization;
        }
    }

    // Default
    return "General Physician";
}
