import { TreeNodeData } from './types';

export const SADRA_TREE_DATA: TreeNodeData = {
  id: "root",
  label: "الحكمة المتعالية (Al-Hikma al-Muta'aliyah)",
  description: "المدرسة الفلسفية التي أسسها صدر الدين الشيرازي، والتي تمثل ذروة الفلسفة الإسلامية.",
  children: [
    {
      id: "definition",
      label: "التعريف والمؤسس",
      description: "نظرة عامة على المدرسة ومؤسسها ومنهجها.",
      children: [
        { 
          id: "school_type", 
          label: "مدرسة فلسفية إسلامية",
          description: "نظام فكري شامل يجمع بين المشاء والإشراق والعرفان."
        },
        { 
          id: "founder", 
          label: "المؤسس: صدر الدين الشيرازي (ملا صدرا)",
          description: "فيلسوف إيراني من القرن السابع عشر (ت 1050 هـ)، مؤلف كتاب الأسفار الأربعة."
        },
        {
          id: "methodology",
          label: "المنهج التوفيقي الثلاثي (الدمج)",
          description: "طريقة تجمع بين ثلاثة مصادر للمعرفة.",
          children: [
            { id: "intellect", label: "العقل (المشائية/البرهان)" },
            { id: "intuition", label: "الحدس (العرفان/الشهود الوجداني)" },
            { id: "revelation", label: "الوحي (الشرع/النصوص الدينية)" }
          ]
        },
        {
          id: "name_origin",
          label: "منشأ الاسم: استعمله ابن سينا أولاً، ثم أطلقه ملا صدرا على كتابه «الأسفار»"
        }
      ]
    },
    {
      id: "pillars",
      label: "الأركان والمبادئ التأسيسية",
      description: "النظريات الأساسية التي تقوم عليها الحكمة المتعالية.",
      children: [
        {
          id: "asalat_wujud",
          label: "أصالة الوجود (Aṣālat al-Wujūd)",
          description: "القول بأن الوجود هو الحقيقة الأصيلة، وأن الماهية اعتبارية.",
          children: [
            { id: "wujud_real", label: "الوجود حقيقة أصيلة وفعالة في الخارج" },
            { id: "mahiya_mental", label: "الماهية اعتبارية ذهنية" },
            { id: "wujud_simple", label: "الوجود بسيط واحد، لا جزء له" },
            { id: "individuation", label: "الوجود يساوق التشخّص" },
            { id: "divine_making", label: "الجعل الإلهي (الخلق) جعل وجودي" }
          ]
        },
        {
          id: "tashkik",
          label: "تشكيك الوجود (Tashkīk al-Wujūd)",
          description: "الوجود حقيقة واحدة ذات مراتب متفاوتة في الشدة والضعف.",
          children: [
            { id: "graded_reality", label: "الوجود حقيقة واحدة ذات مراتب" },
            { id: "intensity", label: "تفاوت المراتب بالشدة والضعف/الكمال والنقص" },
            { id: "unity_multiplicity", label: "الوحدة في عين الكثرة (والعكس)" },
            { id: "solving_duality", label: "حل معضلة التباين بين الموجودات" }
          ]
        },
        {
          id: "haraka_jawhariya",
          label: "الحركة الجوهرية (Al-Harakah al-Jawhariyyah)",
          description: "الحركة لا تقتصر على الأعراض، بل تشمل جوهر الأشياء ذاتها.",
          children: [
            { id: "change_essence", label: "التغير والحركة في الجوهر نفسه (ليست مقتصرة على الأعراض)" },
            { id: "fluid_world", label: "الوجود في عالم المادة صيرورة سيالة مستمرة" },
            { id: "evolution", label: "تطور الجوهر نحو التجرّد والفعلية" },
            { id: "proofs_motion", label: "أدلة الإثبات" }
          ]
        },
        {
          id: "unity_knower",
          label: "وحدة العاقل والمعقول",
          description: "اتحاد النفس بالعلم الذي تدركه.",
          children: [
            { id: "union_intellect", label: "اتحاد الذات المدركة (النفس) بالصورة المدركة" },
            { id: "soul_perfection", label: "أساس لتكامل النفس والمعاد الجسماني والروحي" }
          ]
        },
        {
          id: "basit_haqiqa",
          label: "قاعدة بسيط الحقيقة كل الأشياء",
          description: "الواجب الوجود (الله) لا يحده حد، فهو يملك كمالات جميع الأشياء بنحو أعلى."
        }
      ]
    },
    {
      id: "results",
      label: "النتائج الفلسفية (المتفرعة على أصالة الوجود)",
      description: "التبعات التي تترتب على القول بأصالة الوجود والحركة الجوهرية.",
      children: [
        {
          id: "theology",
          label: "في الإلهيات بالمعنى الأخص",
          children: [
            { id: "proof_siddiqin", label: "تقرير جديد لبرهان الصديقين (بدون إبطال الدور والتسلسل)" },
            { id: "answer_ibn_kammuna", label: "الجواب عن شبهة ابن كمونة (باستحالة تباين الواجب بتمام الذات)" },
            { id: "negation_attributes", label: "نفي الثابتات الأزلية للمعتزلة" }
          ]
        },
        {
          id: "psychology",
          label: "في علم النفس والمعاد",
          children: [
            { id: "soul_origin", label: "النفس جسمانية الحدوث روحانية البقاء" },
            { id: "presential_knowledge", label: "علم العلة بنفسها وبمعلولها (بالعلم الحضوري)" },
            { id: "reincarnation", label: "نفي التناسخ" },
            { id: "bodily_resurrection", label: "المعاد الجسماني (إثباتات عقلية تؤيدها النصوص)" },
             { id: "uniting_haqiqa", label: "حمل الحقيقة والرقيقة (اتحاد المعلول بالعلة بالوجود مع اختلاف بالكمال والنقص)"}
          ]
        },
          {
            id: "related_concepts",
            label: "مفاهيم مرتبطة",
            children: [
                {id: "concept_wujud", label: "الوجود لا يُعرّف بحدّ ولا رسم (بسبب بساطته)"},
                {id: "attributes_wujud", label: "صفات الوجود (علم، قدرة، حياة) عين الوجود"},
                {id: "possibility", label: "الإمكان الفقري الوجودي (عين الربط والحاجة للعلة)"},
                 {id: "making", label: "تعلق الجعل بالوجود (لا بالماهية أو الصيرورة)"}
            ]
        }
      ]
    },
    {
      id: "journeys",
      label: "الأسفار العقلية الأربعة",
      description: "مراحل السير والسلوك العرفاني والعقلي التي هيكل عليها كتابه العظيم.",
      children: [
        { id: "main_work", label: "العمل الرئيسي للملا صدرا" },
        { id: "journey1", label: "السفر الأول: من الخلق إلى الحق" },
        { id: "journey2", label: "السفر الثاني: بالحق في الحق" },
        { id: "journey3", label: "السفر الثالث: من الحق إلى الخلق بالحق" },
        { id: "journey4", label: "السفر الرابع: بالحق في الخلق" }
      ]
    },
      {
      id: "political_impact",
      label: "الأثر على الفكر السياسي الإيراني",
       description: "كيف أثرت هذه الفلسفة على الحركات السياسية والاجتماعية."
    }
  ]
};
