import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Safely initialize the AI client only if the key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock database for demo mode/fallback when no API key is present
const MOCK_EXPLANATIONS: Record<string, string> = {
  "الحكمة المتعالية (Al-Hikma al-Muta'aliyah)": `**الحكمة المتعالية** هي مدرسة فلسفية شيدها صدر الدين الشيرازي (ملا صدرا).
  
تتميز هذه المدرسة بالجمع الفريد بين:
1. **البرهان العقلي** (طريقة المشائين).
2. **الشهود العرفاني** (طريقة الإشراقيين والمتصوفة).
3. **الوحي القرآني** (النصوص الدينية).

محورها الأساسي هو القول بـ "أصالة الوجود"، وهي تمثل نقطة تحول كبرى في الفلسفة الإسلامية.`,

  "أصالة الوجود (Aṣālat al-Wujūd)": `**أصالة الوجود** هي حجر الزاوية في فلسفة ملا صدرا.
  
وتعني أن الوجود هو الحقيقة العينية الخارجية التي تملأ الأعيان وتترتب عليها الآثار، أما "الماهية" فهي مجرد قالب ذهني أو حدّ للوجود لا واقعية له بذاته.

بمعنى آخر: "ما هو موجود حقاً هو الوجود، والماهية هي انعكاس له في الذهن".`,

  "تشكيك الوجود (Tashkīk al-Wujūd)": `**تشكيك الوجود** يعني أن الوجود حقيقة واحدة (سنخ واحد) لكنها ذات مراتب متفاوتة.
  
تماماً كالنور: نور الشمس ونور الشمعة كلاهما "نور"، لكنهما يختلفان في الشدة والضعف. كذلك الوجود، يمتد من الواجب الوجود (أعلى المراتب) إلى الهيولى (أدنى المراتب). هذا المبدأ يفسر كيف يتوحد الكون في حقيقته رغم كثرة مظاهره.`,

  "الحركة الجوهرية (Al-Harakah al-Jawhariyyah)": `**الحركة الجوهرية** تعني أن التغير لا يطال فقط صفات الشيء (لونه، مكانه)، بل يضرب في عمق ذاته وجوهره.
  
العالم المادي عند صدرا ليس ساكناً، بل هو في حالة "سيلان" وتجدد مستمر في كل لحظة. هذه الحركة هي طريق تكامل الموجودات، فالنفس البشرية مثلاً تنشأ جسمانية وتتكامل عبر الحركة الجوهرية لتصبح روحانية.`,
  
  "وحدة العاقل والمعقول": `نظرية **وحدة العاقل والمعقول** تؤكد أن النفس حين تدرك شيئاً، فإنها لا تلتقط "صورة" له وتخزنها كالخزانة، بل **تتحد** النفس مع تلك المعلومة وجودياً.
  
كلما اكتسب الإنسان علماً، اشتدت درجة وجود نفسه وتكاملت. فالعلم هو نمو وجودي للنفس وليس مجرد إضافة خارجية.`
};

export const explainConcept = async (conceptLabel: string, context?: string): Promise<string> => {
  // If no API key is available, use Mock Mode (Demo)
  if (!ai) {
    console.warn("Gemini API Key missing. Using Mock Mode.");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate thinking delay
    
    // Check if we have a canned response
    if (MOCK_EXPLANATIONS[conceptLabel]) {
      return MOCK_EXPLANATIONS[conceptLabel] + "\n\n*(تم توليد هذا الشرح من الأرشيف لعدم توفر مفتاح API)*";
    }
    
    // Generic fallback
    return `**شرح تجريبي (محاكاة):**
    
مفهوم **"${conceptLabel}"** هو جزء أساسي من منظومة الحكمة المتعالية.
    
بما أن مفتاح الذكاء الاصطناعي (API Key) غير متوفر حالياً، لا يمكنني توليد شرح مخصص حي. بشكل عام، يعتمد فهم هذا المفهوم على استيعاب مبادئ "أصالة الوجود" و"التشكيك" التي تربط جميع أجزاء هذه الفلسفة ببعضها.
    
*(يرجى إضافة مفتاح API للحصول على شروح ذكية كاملة)*`;
  }

  const prompt = `
    You are an expert in Islamic Philosophy, specifically Transcendental Theosophy (Al-Hikma al-Muta'aliyah) by Mulla Sadra.
    
    Please explain the concept of "${conceptLabel}" clearly and concisely.
    ${context ? `Context: This is related to ${context}.` : ''}
    
    The explanation should be in Arabic, suitable for a philosophy student. 
    Keep it under 150 words.
    Format the response nicely with Markdown if needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "لم أتمكن من استرجاع شرح في الوقت الحالي.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to mock if the API call fails (e.g. quota exceeded or invalid key)
    if (MOCK_EXPLANATIONS[conceptLabel]) {
       return MOCK_EXPLANATIONS[conceptLabel] + "\n\n*(حدث خطأ في الاتصال، تم عرض نسخة أرشيفية)*";
    }
    return "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة لاحقاً.";
  }
};