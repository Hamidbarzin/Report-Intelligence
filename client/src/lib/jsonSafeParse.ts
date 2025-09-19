export function jsonSafeParse(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Attempt to repair common JSON issues
    let repaired = jsonString.trim();
    
    // Remove potential markdown code block markers
    repaired = repaired.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    // Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing quotes around keys
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Try parsing again
    try {
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error("JSON parsing failed even after repair attempts:", secondError);
      console.error("Original string:", jsonString);
      console.error("Repaired string:", repaired);
      throw new Error("Failed to parse JSON response from AI");
    }
  }
}
