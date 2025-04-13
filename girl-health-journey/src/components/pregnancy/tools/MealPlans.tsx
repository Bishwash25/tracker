import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Utensils, Info, ChevronDown, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Meal {
  name: string;
  description: string;
  nutrients: string[];
  recipe?: string;
}

interface DailyMeal {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

interface NutritionTips {
  [key: string]: string;
}

type ViewMode = "tips" | "mealPlan";

export default function MealPlans({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("trimester1");
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [currentDays, setCurrentDays] = useState<number>(0);
  const [showRecipe, setShowRecipe] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tips");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Set up a timer to update the current time every minute
  useEffect(() => {
    // Update immediately
    setCurrentTime(new Date());
    setLastUpdate(new Date());
    
    // Then update every minute
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setLastUpdate(now);
    }, 60000); // 60000 ms = 1 minute
    
    // Clean up the interval when component unmounts
    return () => clearInterval(timer);
  }, []);

  // Calculate current pregnancy week and days based on last period date
  useEffect(() => {
    // Load pregnancy week data from localStorage
    const storedLastPeriodDate = localStorage.getItem("lastPeriodDate");
    
    if (storedLastPeriodDate) {
      const lastPeriod = new Date(storedLastPeriodDate);
      const diffTime = Math.abs(currentTime.getTime() - lastPeriod.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      
      setCurrentWeek(diffWeeks);
      setCurrentDays(remainingDays);
    }
  }, [currentTime]);

  // Manual refresh function
  const handleRefresh = () => {
    const now = new Date();
    setCurrentTime(now);
    setLastUpdate(now);
    toast.success("Nutrition tips updated!");
  };

  // Get nutrition tips based on current week
  const getNutritionTips = (): NutritionTips => {
    if (1 <= currentWeek && currentWeek <= 12) {  // First Trimester
      return {
        "Hydration": "Drink at least 8-10 glasses of water daily to stay hydrated and support amniotic fluid levels.",
        "Essential Nutrients": "Folic acid (leafy greens, fortified cereals), Vitamin B6 (bananas, nuts), Iron (lean meats, spinach).",
        "Small and Frequent Meals": "Eat small meals every 2-3 hours to manage nausea and morning sickness.",
        "Foods to Avoid": "Raw seafood, unpasteurized dairy, high-mercury fish (shark, swordfish), processed meats, excessive caffeine.",
        "Exercises": "Walking, prenatal yoga, deep breathing exercises, light stretching (avoid strenuous workouts)."
      };
    } else if (13 <= currentWeek && currentWeek <= 27) {  // Second Trimester
      return {
        "Hydration": "Increase fluid intake, include natural fruit juices and coconut water for electrolytes.",
        "Essential Nutrients": "Calcium (milk, yogurt), Vitamin D (sunlight, fortified foods), Omega-3s (salmon, walnuts), Protein (chicken, lentils).",
        "Small and Frequent Meals": "Maintain balanced meals to support baby's growth and prevent heartburn.",
        "Foods to Avoid": "Overly spicy foods, raw eggs, excessive sugar, artificial sweeteners.",
        "Exercises": "Swimming, stationary cycling, moderate strength training, prenatal pilates, pelvic floor exercises (Kegels)."
      };
    } else if (28 <= currentWeek && currentWeek <= 40) {  // Third Trimester
      return {
        "Hydration": "Stay hydrated to reduce swelling and constipation. Herbal teas (ginger, peppermint) can help digestion.",
        "Essential Nutrients": "Iron (red meat, legumes), Fiber (whole grains, fruits), Healthy Fats (avocado, nuts).",
        "Small and Frequent Meals": "Eat fiber-rich meals and avoid heavy, greasy foods to prevent bloating and reflux.",
        "Foods to Avoid": "Too much salt (causes water retention), fried foods, carbonated drinks, undercooked meats.",
        "Exercises": "Gentle stretching, prenatal yoga, deep squats, walking, cat-cow stretch for back relief."
      };
    } else {
      return {
        "Hydration": "Maintain 8–10 glasses of water daily. Hydration helps with uterine tone and reduces fatigue.",
        "Essential Nutrients": "• Magnesium: pumpkin seeds, almonds (supports muscle function)\n• Potassium: bananas, sweet potatoes (prevents cramps)\n• Iron & Vitamin C combo: beans + citrus fruits (boost energy, blood supply)",
        "Meal Strategy": "Light, frequent meals with emphasis on energy-boosting foods. Include smoothies, soups, and fiber to ease digestion.",
        "Foods to Avoid": "Greasy, fried, and overly processed foods that slow digestion. Avoid laxatives unless advised by doctor.",
        "Recommended Exercises": "Gentle walking to encourage natural labor onset, pelvic tilts, deep breathing. Avoid lying flat for long periods.",
        "Lifestyle Tips": "• Practice relaxation techniques: meditation, warm baths, gentle music\n• Stay mentally active with light reading or social interaction\n• Frequent fetal movement monitoring and regular prenatal check-ups",
        "Medical Advisory": "Discuss labor induction options with your healthcare provider. Weekly fetal monitoring and ultrasounds may be recommended."
      };
    }
  };

  // Sample meal plans by trimester - 7 days for each trimester
  const mealPlans: Record<string, DailyMeal[]> = {
    trimester1: [
      // Day 1
      {
        breakfast: {
          name: "Ginger Oatmeal with Berries",
          description: "Steel-cut oats topped with fresh berries, a drizzle of honey, and a sprinkle of ginger to help with morning sickness.",
          nutrients: ["Fiber", "Antioxidants", "Vitamin C", "Iron"],
          recipe: "Ingredients:\n- 1/2 cup steel-cut oats\n- 1 cup water\n- 1/2 cup milk of choice\n- 1/4 tsp ground ginger\n- 1 tbsp honey\n- 1/2 cup mixed berries\n\nInstructions:\n1. Combine oats, water, and milk in a pot. Bring to a boil, then reduce heat.\n2. Simmer for 15-20 minutes, stirring occasionally until creamy.\n3. Stir in ground ginger.\n4. Transfer to a bowl, drizzle with honey, and top with fresh berries."
        },
        lunch: {
          name: "Lentil Soup with Whole Grain Bread",
          description: "A hearty lentil soup packed with vegetables, served with a slice of whole grain bread.",
          nutrients: ["Protein", "Folate", "Iron", "Fiber"],
          recipe: "Ingredients:\n- 1 cup red lentils\n- 1 onion, diced\n- 2 carrots, diced\n- 2 celery stalks, diced\n- 2 garlic cloves, minced\n- 4 cups vegetable broth\n- 1 tsp cumin\n- 1/2 tsp turmeric\n- Salt and pepper to taste\n- 1 slice whole grain bread\n\nInstructions:\n1. Rinse lentils thoroughly.\n2. In a pot, sauté onion, carrots, celery, and garlic until softened.\n3. Add lentils, broth, and spices. Bring to a boil, then simmer for 25 minutes.\n4. Blend partially for creamier texture if desired.\n5. Serve with whole grain bread."
        },
        dinner: {
          name: "Baked Salmon with Quinoa and Steamed Broccoli",
          description: "Omega-3 rich salmon fillet baked with lemon and herbs, served with quinoa and steamed broccoli.",
          nutrients: ["Omega-3 Fatty Acids", "Protein", "Calcium", "Iron", "Vitamin B12"],
          recipe: "Ingredients:\n- 4 oz salmon fillet\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup broccoli florets\n- 1 lemon, sliced\n- 2 sprigs fresh dill\n- 1 tbsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Place salmon on a baking sheet, drizzle with olive oil, top with lemon slices and dill.\n3. Bake for 15-18 minutes until salmon flakes easily.\n4. Meanwhile, rinse quinoa and cook with water according to package instructions.\n5. Steam broccoli until tender-crisp, about 5 minutes.\n6. Serve salmon with quinoa and broccoli."
        },
        snacks: [
          {
            name: "Apple Slices with Almond Butter",
            description: "Fresh apple slices served with a tablespoon of almond butter for protein and healthy fats.",
            nutrients: ["Fiber", "Healthy Fats", "Vitamin E"]
          },
          {
            name: "Greek Yogurt with Honey",
            description: "Plain Greek yogurt drizzled with honey for a protein-rich snack to combat nausea.",
            nutrients: ["Protein", "Calcium", "Probiotics"]
          }
        ]
      },
      // Day 2
      {
        breakfast: {
          name: "Spinach and Cheese Omelette",
          description: "Two-egg omelette with spinach and a sprinkle of cheese, served with whole wheat toast.",
          nutrients: ["Protein", "Folate", "Calcium", "Iron"],
          recipe: "Ingredients:\n- 2 eggs\n- 1 cup fresh spinach\n- 2 tbsp grated cheese\n- 1 slice whole wheat toast\n- 1 tsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Whisk eggs in a bowl with salt and pepper.\n2. Heat olive oil in a non-stick pan over medium heat.\n3. Add spinach and sauté until wilted, about 1 minute.\n4. Pour egg mixture over spinach, cook until edges set.\n5. Sprinkle cheese on one half, fold over the other half.\n6. Cook until eggs are set and cheese melts.\n7. Serve with whole wheat toast."
        },
        lunch: {
          name: "Mediterranean Chickpea Salad",
          description: "Chickpeas, cucumber, tomatoes, feta cheese, and olives with a lemon-olive oil dressing.",
          nutrients: ["Protein", "Fiber", "Vitamin C", "Calcium"],
          recipe: "Ingredients:\n- 1 cup cooked chickpeas\n- 1 cucumber, diced\n- 1 cup cherry tomatoes, halved\n- 1/4 cup feta cheese, crumbled\n- 10 kalamata olives, pitted and halved\n- 2 tbsp olive oil\n- 1 tbsp lemon juice\n- 1 tsp dried oregano\n- Salt and pepper to taste\n\nInstructions:\n1. In a large bowl, combine chickpeas, cucumber, tomatoes, feta, and olives.\n2. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.\n3. Pour dressing over salad and toss gently to combine.\n4. Let sit for 10 minutes before serving to allow flavors to meld."
        },
        dinner: {
          name: "Herb-Roasted Chicken with Sweet Potatoes and Green Beans",
          description: "Herb-seasoned roasted chicken breast with baked sweet potatoes and steamed green beans.",
          nutrients: ["Protein", "Vitamin A", "Vitamin C", "Potassium"],
          recipe: "Ingredients:\n- 4 oz chicken breast\n- 1 medium sweet potato\n- 1 cup green beans, trimmed\n- 1 tbsp olive oil\n- 1 tsp dried rosemary\n- 1 tsp dried thyme\n- 1 garlic clove, minced\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. In a small bowl, mix olive oil, herbs, garlic, salt, and pepper.\n3. Rub half of herb mixture on chicken breast.\n4. Cut sweet potato into 1-inch cubes and toss with remaining herb mixture.\n5. Place chicken and sweet potatoes on a baking sheet.\n6. Bake for 20-25 minutes until chicken is cooked through and sweet potatoes are tender.\n7. Steam green beans for 5 minutes until tender-crisp.\n8. Serve chicken with sweet potatoes and green beans."
        },
        snacks: [
          {
            name: "Trail Mix",
            description: "A mix of almonds, walnuts, dried cranberries, and dark chocolate chips.",
            nutrients: ["Healthy Fats", "Protein", "Antioxidants"]
          },
          {
            name: "Whole Grain Crackers with Cheese",
            description: "Whole grain crackers with sliced cheese for a balanced snack.",
            nutrients: ["Protein", "Calcium", "Fiber"]
          }
        ]
      },
      // Day 3
      {
        breakfast: {
          name: "Banana Peanut Butter Smoothie Bowl",
          description: "Creamy smoothie bowl with banana, peanut butter, and milk, topped with granola and berries.",
          nutrients: ["Potassium", "Protein", "Healthy Fats", "Fiber"],
          recipe: "Ingredients:\n- 1 ripe banana\n- 1 tbsp natural peanut butter\n- 1/2 cup milk of choice\n- 1/4 cup Greek yogurt\n- 1/4 cup granola\n- 1/4 cup mixed berries\n- 1 tsp honey (optional)\n\nInstructions:\n1. Blend banana, peanut butter, milk, and yogurt until smooth.\n2. Pour into a bowl.\n3. Top with granola, berries, and a drizzle of honey if desired."
        },
        lunch: {
          name: "Baked Sweet Potato with Black Bean Salsa",
          description: "Baked sweet potato topped with black bean salsa, avocado, and a dollop of Greek yogurt.",
          nutrients: ["Fiber", "Protein", "Vitamin A", "Folate"],
          recipe: "Ingredients:\n- 1 medium sweet potato\n- 1/2 cup black beans, rinsed and drained\n- 1/4 cup corn kernels\n- 1/4 cup diced tomato\n- 2 tbsp diced red onion\n- 1/4 avocado, diced\n- 2 tbsp Greek yogurt\n- 1 tbsp lime juice\n- 1/4 tsp cumin\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Prick sweet potato with a fork and bake for 45-60 minutes until tender.\n3. Mix black beans, corn, tomato, red onion, lime juice, cumin, salt, and pepper.\n4. Cut open baked sweet potato, fluff the inside with a fork.\n5. Top with black bean salsa, diced avocado, and a dollop of Greek yogurt."
        },
        dinner: {
          name: "Lemon Garlic Shrimp with Brown Rice and Asparagus",
          description: "Succulent shrimp sautéed with lemon and garlic, served with brown rice and steamed asparagus.",
          nutrients: ["Protein", "Fiber", "Iron", "Vitamin B12"],
          recipe: "Ingredients:\n- 4 oz shrimp, peeled and deveined\n- 1/2 cup brown rice\n- 1 cup asparagus spears\n- 2 cloves garlic, minced\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1 tsp lemon zest\n- 1 tbsp fresh parsley, chopped\n- Salt and pepper to taste\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat olive oil in a pan over medium heat.\n3. Add garlic and sauté for 30 seconds.\n4. Add shrimp, salt, and pepper. Cook for 2-3 minutes per side until pink and opaque.\n5. Add lemon juice and zest, toss to coat, remove from heat.\n6. Steam asparagus for 4-5 minutes until tender-crisp.\n7. Serve shrimp over brown rice with asparagus on the side.\n8. Garnish with fresh parsley."
        },
        snacks: [
          {
            name: "Hummus with Carrot and Cucumber Sticks",
            description: "Protein-rich hummus with fresh vegetable sticks for dipping.",
            nutrients: ["Protein", "Fiber", "Vitamin A", "Vitamin K"]
          },
          {
            name: "Fresh Fruit Cup",
            description: "Mixed seasonal fruits for a refreshing vitamin-packed snack.",
            nutrients: ["Vitamin C", "Antioxidants", "Natural Sugars"]
          }
        ]
      },
      // Day 4
      {
        breakfast: {
          name: "Whole Grain Cereal with Berries and Milk",
          description: "Fortified whole grain cereal with fresh berries and calcium-rich milk.",
          nutrients: ["Fiber", "Iron", "Calcium", "Folate"],
          recipe: "Ingredients:\n- 1 cup whole grain fortified cereal\n- 1 cup milk of choice\n- 1/2 cup mixed berries\n- 1 tbsp chopped nuts (optional)\n\nInstructions:\n1. Pour cereal into a bowl.\n2. Top with fresh berries and nuts if using.\n3. Add milk and enjoy immediately."
        },
        lunch: {
          name: "Turkey and Avocado Wrap",
          description: "Whole grain wrap with lean turkey, avocado, lettuce, and tomato.",
          nutrients: ["Protein", "Healthy Fats", "Fiber", "Iron"],
          recipe: "Ingredients:\n- 1 whole grain wrap\n- 3 oz sliced turkey breast\n- 1/4 avocado, sliced\n- 1 leaf lettuce\n- 2 slices tomato\n- 1 tsp mustard (optional)\n\nInstructions:\n1. Lay wrap flat on a plate.\n2. Spread with mustard if using.\n3. Layer turkey, avocado, lettuce, and tomato.\n4. Fold in sides and roll up tightly.\n5. Cut in half and serve."
        },
        dinner: {
          name: "Vegetable and Bean Stew with Quinoa",
          description: "Hearty vegetable and bean stew served over protein-rich quinoa.",
          nutrients: ["Protein", "Fiber", "Iron", "Multiple Vitamins"],
          recipe: "Ingredients:\n- 1/2 cup mixed beans (kidney, black, etc.)\n- 1 carrot, diced\n- 1 celery stalk, diced\n- 1/2 onion, diced\n- 1 garlic clove, minced\n- 1/2 cup diced tomatoes\n- 2 cups vegetable broth\n- 1/2 tsp cumin\n- 1/2 tsp paprika\n- 1/2 cup quinoa\n- 1 cup water\n- Fresh herbs for garnish\n\nInstructions:\n1. Sauté onion, carrot, celery, and garlic until softened.\n2. Add beans, tomatoes, broth, and spices. Simmer for 20 minutes.\n3. Meanwhile, rinse quinoa and cook with water according to package instructions.\n4. Serve stew over quinoa and garnish with fresh herbs."
        },
        snacks: [
          {
            name: "Cottage Cheese with Peaches",
            description: "Protein-rich cottage cheese paired with sweet peach slices.",
            nutrients: ["Protein", "Calcium", "Vitamin C"]
          },
          {
            name: "Whole Grain Toast with Almond Butter",
            description: "Fiber-rich toast topped with nutrient-dense almond butter.",
            nutrients: ["Fiber", "Healthy Fats", "Protein", "Vitamin E"]
          }
        ]
      },
      // Day 5
      {
        breakfast: {
          name: "Peanut Butter Banana Smoothie",
          description: "Creamy smoothie with banana, peanut butter, and yogurt for sustained energy.",
          nutrients: ["Protein", "Potassium", "Healthy Fats", "Calcium"],
          recipe: "Ingredients:\n- 1 ripe banana\n- 1 tbsp natural peanut butter\n- 1/2 cup Greek yogurt\n- 1/2 cup milk of choice\n- 1/2 tsp honey (optional)\n- 4 ice cubes\n\nInstructions:\n1. Place all ingredients in a blender.\n2. Blend until smooth and creamy.\n3. Pour into a glass and serve immediately."
        },
        lunch: {
          name: "Quinoa Bowl with Roasted Vegetables",
          description: "Protein-rich quinoa topped with colorful roasted vegetables and a tahini dressing.",
          nutrients: ["Fiber", "Protein", "Iron", "Vitamin A"],
          recipe: "Ingredients:\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup mixed vegetables (sweet potato, bell pepper, zucchini)\n- 1 tbsp olive oil\n- 1/2 tsp mixed herbs\n- 1 tbsp tahini\n- 1 tbsp lemon juice\n- 1 tsp maple syrup\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Rinse quinoa and cook with water according to package instructions.\n3. Cut vegetables into small chunks, toss with olive oil, herbs, salt, and pepper.\n4. Roast vegetables for 20-25 minutes until tender.\n5. Mix tahini, lemon juice, maple syrup, and 1 tbsp water for dressing.\n6. Serve quinoa topped with roasted vegetables and drizzle with dressing."
        },
        dinner: {
          name: "Baked Cod with Herbed Quinoa and Steamed Broccoli",
          description: "Mild white fish baked with lemon and herbs, served with herbed quinoa and steamed broccoli.",
          nutrients: ["Lean Protein", "Omega-3 Fatty Acids", "Fiber", "Vitamin C"],
          recipe: "Ingredients:\n- 4 oz cod fillet\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup broccoli florets\n- 1 tbsp olive oil\n- 1 lemon, sliced\n- 1 tbsp fresh herbs (dill, parsley)\n- 1 garlic clove, minced\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Rinse quinoa and cook with water according to package instructions.\n3. Place cod on a baking sheet, drizzle with olive oil, and top with lemon slices.\n4. Season with salt, pepper, and half the herbs.\n5. Bake for 12-15 minutes until fish flakes easily.\n6. Steam broccoli for 5 minutes until tender-crisp.\n7. Mix cooked quinoa with remaining herbs and minced garlic.\n8. Serve fish with quinoa and broccoli."
        },
        snacks: [
          {
            name: "Apple Slices with Cheese",
            description: "Fresh apple slices paired with calcium-rich cheese.",
            nutrients: ["Fiber", "Calcium", "Protein", "Vitamin C"]
          },
          {
            name: "Trail Mix",
            description: "Mix of nuts, seeds, and dried fruits for energy and nutrients.",
            nutrients: ["Healthy Fats", "Protein", "Iron", "Fiber"]
          }
        ]
      },
      // Day 6
      {
        breakfast: {
          name: "Avocado Toast with Poached Egg",
          description: "Whole grain toast topped with mashed avocado and a perfectly poached egg.",
          nutrients: ["Healthy Fats", "Protein", "Fiber", "Folate"],
          recipe: "Ingredients:\n- 1 slice whole grain bread\n- 1/2 ripe avocado\n- 1 egg\n- 1 tsp lemon juice\n- Pinch of red pepper flakes (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Toast the bread until golden brown.\n2. Mash avocado with lemon juice, salt, and pepper.\n3. Spread avocado mixture on toast.\n4. Bring a pot of water to a gentle simmer. Add a splash of vinegar.\n5. Create a whirlpool in the water and crack the egg into the center.\n6. Poach for 3-4 minutes for a runny yolk.\n7. Remove with a slotted spoon and place on top of avocado toast.\n8. Season with salt, pepper, and red pepper flakes if desired."
        },
        lunch: {
          name: "Mediterranean Chickpea Salad",
          description: "Protein-rich chickpeas with cucumber, tomatoes, feta, and olives in a lemon vinaigrette.",
          nutrients: ["Protein", "Fiber", "Calcium", "Vitamin C"],
          recipe: "Ingredients:\n- 1/2 cup cooked chickpeas\n- 1/2 cucumber, diced\n- 1/2 cup cherry tomatoes, halved\n- 2 tbsp feta cheese, crumbled\n- 5 kalamata olives, pitted and sliced\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1/2 tsp dried oregano\n- Salt and pepper to taste\n\nInstructions:\n1. Combine chickpeas, cucumber, tomatoes, feta, and olives in a bowl.\n2. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.\n3. Pour dressing over salad and toss gently to combine.\n4. Let sit for 10 minutes before serving to allow flavors to meld."
        },
        dinner: {
          name: "Stuffed Bell Peppers with Ground Turkey",
          description: "Bell peppers stuffed with seasoned ground turkey, brown rice, and vegetables.",
          nutrients: ["Protein", "Vitamin C", "Fiber", "Iron"],
          recipe: "Ingredients:\n- 2 bell peppers, halved and seeds removed\n- 4 oz lean ground turkey\n- 1/4 cup cooked brown rice\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/4 cup diced tomatoes\n- 1/4 cup corn kernels\n- 1/2 tsp cumin\n- 1/2 tsp paprika\n- 2 tbsp shredded cheese\n- 1 tbsp olive oil\n- Fresh parsley for garnish\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Heat olive oil in a pan over medium heat.\n3. Add onion and sauté until translucent.\n4. Add garlic and ground turkey, cook until browned.\n5. Add tomatoes, corn, spices, salt, and pepper.\n6. Stir in cooked rice and mix well.\n7. Fill bell pepper halves with mixture and top with cheese.\n8. Bake for 25-30 minutes until peppers are tender.\n9. Garnish with fresh parsley before serving."
        },
        snacks: [
          {
            name: "Greek Yogurt with Honey and Walnuts",
            description: "Creamy Greek yogurt topped with a drizzle of honey and chopped walnuts.",
            nutrients: ["Protein", "Calcium", "Healthy Fats", "Probiotics"]
          },
          {
            name: "Vegetable Sticks with Hummus",
            description: "Fresh vegetable sticks served with protein-rich hummus.",
            nutrients: ["Fiber", "Protein", "Vitamin A", "Vitamin C"]
          }
        ]
      },
      // Day 7
      {
        breakfast: {
          name: "Berry and Spinach Smoothie Bowl",
          description: "Nutrient-packed smoothie bowl with berries, spinach, and banana topped with granola and seeds.",
          nutrients: ["Antioxidants", "Iron", "Fiber", "Vitamin C"],
          recipe: "Ingredients:\n- 1 cup mixed berries (fresh or frozen)\n- 1 small banana\n- 1 cup fresh spinach\n- 1/2 cup milk of choice\n- 1/4 cup Greek yogurt\n- 1 tbsp chia seeds\n- 2 tbsp granola\n- 1 tsp honey (optional)\n\nInstructions:\n1. Blend berries, banana, spinach, milk, and yogurt until smooth.\n2. Pour into a bowl.\n3. Top with chia seeds, granola, and a drizzle of honey if desired."
        },
        lunch: {
          name: "Lentil Soup with Whole Grain Bread",
          description: "Hearty lentil soup packed with vegetables and served with a slice of whole grain bread.",
          nutrients: ["Protein", "Fiber", "Iron", "Folate"],
          recipe: "Ingredients:\n- 1/2 cup dry lentils, rinsed\n- 2 cups vegetable broth\n- 1 carrot, diced\n- 1 celery stalk, diced\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp cumin\n- 1/4 tsp turmeric\n- 1 slice whole grain bread\n- 1 tbsp olive oil\n- Fresh parsley for garnish\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pot over medium heat.\n2. Add onion, carrot, and celery. Sauté for 5 minutes.\n3. Add garlic, cumin, and turmeric, cook for 30 seconds.\n4. Add lentils and broth. Bring to a boil, then simmer for 25-30 minutes until lentils are tender.\n5. Season with salt and pepper.\n6. Serve with whole grain bread and garnish with fresh parsley."
        },
        dinner: {
          name: "Grilled Salmon with Roasted Sweet Potato and Asparagus",
          description: "Omega-3 rich salmon with vitamin-packed sweet potato and broccoli.",
          nutrients: ["Omega-3 Fatty Acids", "Protein", "Vitamin A", "Folate"],
          recipe: "Ingredients:\n- 4 oz salmon fillet\n- 1 medium sweet potato\n- 8 asparagus spears, trimmed\n- 1 tbsp olive oil\n- 1 lemon\n- 1 garlic clove, minced\n- 1 tsp fresh dill, chopped\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Cut sweet potato into 1-inch cubes, toss with half the olive oil, salt, and pepper.\n3. Spread on a baking sheet and roast for 25-30 minutes until tender.\n4. Season salmon with salt, pepper, and dill.\n5. Heat remaining olive oil in a pan over medium-high heat.\n6. Place salmon skin-side down and cook for 4-5 minutes.\n7. Flip and cook for another 2-3 minutes until just cooked through.\n8. Steam asparagus for 3-5 minutes until tender-crisp.\n9. Serve salmon with roasted vegetables."
        },
        snacks: [
          {
            name: "Mixed Nuts and Dried Fruit",
            description: "A handful of mixed nuts and dried fruits for energy and nutrients.",
            nutrients: ["Healthy Fats", "Protein", "Iron", "Fiber"]
          },
          {
            name: "Whole Grain Crackers with Cheese",
            description: "Fiber-rich crackers with a slice of cheese for a balanced snack.",
            nutrients: ["Fiber", "Protein", "Calcium", "B Vitamins"]
          }
        ]
      }
    ],
    trimester2: [
      // Day 1
      {
        breakfast: {
          name: "Avocado Toast with Egg",
          description: "Whole grain toast topped with mashed avocado, a poached egg, and a sprinkle of hemp seeds.",
          nutrients: ["Healthy Fats", "Protein", "Fiber", "Vitamin E"],
          recipe: "Ingredients:\n- 1 slice whole grain bread\n- 1/2 ripe avocado\n- 1 egg\n- 1 tsp hemp seeds\n- Salt and pepper to taste\n- Red pepper flakes (optional)\n\nInstructions:\n1. Toast the bread until golden brown.\n2. Meanwhile, bring a small pot of water to a gentle simmer for poaching the egg.\n3. Add a splash of vinegar to the water, create a gentle whirlpool, and crack egg into the center.\n4. Poach for 3-4 minutes for a runny yolk.\n5. Mash avocado and spread on toast. Season with salt and pepper.\n6. Top with poached egg, sprinkle with hemp seeds and red pepper flakes if using."
        },
        lunch: {
          name: "Grilled Chicken and Vegetable Wrap",
          description: "Whole grain wrap filled with grilled chicken, mixed salad greens, bell peppers, and hummus.",
          nutrients: ["Protein", "Fiber", "Vitamin C", "Iron"],
          recipe: "Ingredients:\n- 1 whole grain wrap\n- 4 oz grilled chicken breast, sliced\n- 1 cup mixed salad greens\n- 1/4 bell pepper, sliced\n- 2 tbsp hummus\n- 1 tsp olive oil\n- 1 tsp lemon juice\n- Salt and pepper to taste\n\nInstructions:\n1. Warm wrap slightly to make it more pliable.\n2. Spread hummus over the center of the wrap.\n3. Top with chicken, greens, and bell pepper.\n4. Drizzle with olive oil and lemon juice, season with salt and pepper.\n5. Fold in sides and roll up tightly.\n6. Cut in half and serve."
        },
        dinner: {
          name: "Shrimp and Vegetable Stir-Fry with Brown Rice",
          description: "Shrimp stir-fried with a colorful mix of vegetables, served over brown rice.",
          nutrients: ["Protein", "Iron", "Zinc", "B Vitamins", "Fiber"],
          recipe: "Ingredients:\n- 4 oz shrimp, peeled and deveined\n- 1/2 cup brown rice\n- 1 cup mixed vegetables (broccoli, carrots, snap peas)\n- 1 garlic clove, minced\n- 1 tsp ginger, grated\n- 1 tbsp low-sodium soy sauce\n- 1 tsp sesame oil\n- 1 tbsp vegetable oil\n- 1 green onion, sliced (for garnish)\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat vegetable oil in a wok or large pan over high heat.\n3. Add garlic and ginger, stir-fry for 30 seconds.\n4. Add vegetables, stir-fry for 3-4 minutes until crisp-tender.\n5. Add shrimp, cook for 2-3 minutes until pink and opaque.\n6. Add soy sauce and sesame oil, toss to coat.\n7. Serve over brown rice, garnish with green onion."
        },
        snacks: [
          {
            name: "Hummus with Vegetable Sticks",
            description: "Homemade or store-bought hummus served with carrot, cucumber, and bell pepper sticks.",
            nutrients: ["Protein", "Fiber", "Vitamin A", "Vitamin C"]
          },
          {
            name: "Banana Smoothie",
            description: "A smoothie made with banana, milk, yogurt, and a tablespoon of nut butter.",
            nutrients: ["Potassium", "Calcium", "Protein", "Vitamin D"]
          }
        ]
      },
      // Day 2
      {
        breakfast: {
          name: "Greek Yogurt Parfait",
          description: "Layers of Greek yogurt, granola, mixed berries, and a drizzle of honey.",
          nutrients: ["Protein", "Calcium", "Antioxidants", "Probiotics"],
          recipe: "Ingredients:\n- 1 cup Greek yogurt\n- 1/4 cup granola\n- 1/2 cup mixed berries (strawberries, blueberries, raspberries)\n- 1 tbsp honey\n- 1 tbsp chopped nuts\n\nInstructions:\n1. In a glass or bowl, add a layer of Greek yogurt.\n2. Add a layer of berries.\n3. Sprinkle with some granola and nuts.\n4. Repeat layers, ending with berries on top.\n5. Drizzle with honey before serving."
        },
        lunch: {
          name: "Quinoa Bowl with Roasted Vegetables and Chickpeas",
          description: "Quinoa topped with roasted seasonal vegetables, chickpeas, and a tahini dressing.",
          nutrients: ["Protein", "Fiber", "Iron", "Folate"],
          recipe: "Ingredients:\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup mixed vegetables (sweet potato, zucchini, bell pepper), diced\n- 1/2 cup chickpeas, rinsed and drained\n- 1 tbsp olive oil\n- 1 tsp cumin\n- 1/2 tsp paprika\n- Salt and pepper to taste\n\nFor tahini dressing:\n- 1 tbsp tahini\n- 1 tbsp lemon juice\n- 1 tbsp water\n- 1 small garlic clove, minced\n- Salt to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss vegetables and chickpeas with olive oil, cumin, paprika, salt, and pepper.\n3. Spread on a baking sheet and roast for 20-25 minutes until tender.\n4. Meanwhile, rinse quinoa and cook with water until tender and water is absorbed.\n5. Whisk together all dressing ingredients until smooth.\n6. Serve quinoa topped with roasted vegetables and chickpeas.\n7. Drizzle with tahini dressing."
        },
        dinner: {
          name: "Baked Cod with Lemon-Herb Sauce, Brown Rice, and Asparagus",
          description: "Cod fillet baked with a light lemon-herb sauce, served with brown rice and steamed asparagus.",
          nutrients: ["Lean Protein", "Omega-3 Fatty Acids", "Fiber", "Folate"],
          recipe: "Ingredients:\n- 4 oz cod fillet\n- 1/2 cup brown rice\n- 8 asparagus spears, trimmed\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1 tsp lemon zest\n- 1 tbsp fresh herbs (parsley, dill, thyme), chopped\n- 1 garlic clove, minced\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Cook brown rice according to package instructions.\n3. In a small bowl, mix olive oil, lemon juice, zest, herbs, garlic, salt, and pepper.\n4. Place cod on a baking sheet, drizzle with herb mixture.\n5. Bake for 12-15 minutes until fish flakes easily.\n6. Steam asparagus for 4-5 minutes until tender-crisp.\n7. Serve cod with brown rice and asparagus."
        },
        snacks: [
          {
            name: "Cottage Cheese with Pineapple",
            description: "Cottage cheese topped with fresh pineapple chunks for a protein-rich snack.",
            nutrients: ["Protein", "Calcium", "Vitamin C"]
          },
          {
            name: "Whole Grain Toast with Almond Butter",
            description: "Whole grain toast spread with almond butter for sustained energy.",
            nutrients: ["Fiber", "Healthy Fats", "Protein", "Vitamin E"]
          }
        ]
      },
      // Day 3
      {
        breakfast: {
          name: "Spinach and Feta Breakfast Quesadilla",
          description: "Whole grain tortilla filled with eggs, spinach, and feta cheese for a protein-packed start.",
          nutrients: ["Protein", "Iron", "Calcium", "Folate"],
          recipe: "Ingredients:\n- 1 whole grain tortilla\n- 2 eggs, beaten\n- 1 cup fresh spinach\n- 2 tbsp feta cheese, crumbled\n- 1 tsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pan over medium heat.\n2. Add spinach and sauté until wilted, about 1 minute.\n3. Pour beaten eggs over spinach, season with salt and pepper.\n4. Cook until eggs are mostly set but still slightly runny on top.\n5. Sprinkle feta cheese over half of the egg mixture.\n6. Place tortilla on top, press down gently, then carefully flip everything.\n7. Cook for another minute until tortilla is golden and eggs are fully set.\n8. Fold in half and cut into wedges."
        },
        lunch: {
          name: "Mediterranean Tuna Salad",
          description: "Protein-rich tuna mixed with olives, cherry tomatoes, and whole grain pasta.",
          nutrients: ["Protein", "Omega-3 Fatty Acids", "Fiber", "Vitamin C"],
          recipe: "Ingredients:\n- 3 oz canned tuna in water, drained\n- 1/2 cup whole grain pasta, cooked and cooled\n- 1/2 cup cherry tomatoes, halved\n- 1/4 cucumber, diced\n- 10 kalamata olives, pitted and halved\n- 1 tbsp red onion, finely chopped\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1 tsp dried oregano\n- Salt and pepper to taste\n\nInstructions:\n1. In a large bowl, flake tuna with a fork.\n2. Add pasta, tomatoes, cucumber, olives, and red onion.\n3. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.\n4. Pour dressing over salad and toss gently to combine.\n5. Refrigerate for 15 minutes before serving to allow flavors to meld."
        },
        dinner: {
          name: "Slow-Cooked Chicken and Vegetable Curry with Brown Rice",
          description: "Tender chicken and vegetables in a mild curry sauce served over brown rice.",
          nutrients: ["Protein", "Fiber", "Iron", "Vitamin A"],
          recipe: "Ingredients:\n- 4 oz boneless chicken breast, cubed\n- 1/2 cup brown rice\n- 1 carrot, diced\n- 1/2 bell pepper, diced\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp ginger, grated\n- 1/2 cup coconut milk\n- 1/2 cup chicken broth\n- 1 tsp curry powder (mild)\n- 1/4 tsp turmeric\n- 1 tbsp olive oil\n- Fresh cilantro for garnish\n- Salt to taste\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat olive oil in a pot over medium heat.\n3. Add onion, carrot, and bell pepper. Sauté for 5 minutes.\n4. Add garlic and ginger, cook for 30 seconds.\n5. Add chicken, curry powder, and turmeric. Cook for 2 minutes.\n6. Add coconut milk and broth, bring to a simmer.\n7. Reduce heat, cover, and simmer for 15-20 minutes until chicken is cooked and vegetables are tender.\n8. Serve over brown rice, garnish with fresh cilantro."
        },
        snacks: [
          {
            name: "Apple with Peanut Butter",
            description: "Fresh apple slices with natural peanut butter for protein and healthy fats.",
            nutrients: ["Fiber", "Protein", "Healthy Fats", "Vitamin C"]
          },
          {
            name: "Greek Yogurt with Honey and Walnuts",
            description: "Calcium-rich yogurt with brain-boosting walnuts and natural sweetener.",
            nutrients: ["Protein", "Calcium", "Omega-3 Fatty Acids"]
          }
        ]
      },
      // Day 4
      {
        breakfast: {
          name: "Whole Grain Waffles with Yogurt and Berries",
          description: "Whole grain waffles topped with Greek yogurt and antioxidant-rich berries.",
          nutrients: ["Fiber", "Protein", "Calcium", "Antioxidants"],
          recipe: "Ingredients:\n- 2 small whole grain waffles (homemade or whole grain frozen)\n- 1/2 cup Greek yogurt\n- 1/2 cup mixed berries\n- 1 tbsp maple syrup or honey\n\nInstructions:\n1. Toast waffles until warm and crisp.\n2. Top with Greek yogurt and berries.\n3. Drizzle with a small amount of maple syrup or honey."
        },
        lunch: {
          name: "Lentil and Vegetable Soup with Whole Grain Bread",
          description: "Hearty lentil soup packed with vegetables and served with a slice of whole grain bread.",
          nutrients: ["Protein", "Fiber", "Iron", "Folate"],
          recipe: "Ingredients:\n- 1/2 cup dry lentils, rinsed\n- 2 cups vegetable broth\n- 1 carrot, diced\n- 1 celery stalk, diced\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp cumin\n- 1/4 tsp turmeric\n- 1 slice whole grain bread\n- 1 tbsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pot over medium heat.\n2. Add onion, carrot, and celery. Sauté for 5 minutes.\n3. Add garlic, cumin, and turmeric. Cook for 30 seconds.\n4. Add lentils and broth. Bring to a boil, then simmer for 20-25 minutes until lentils are tender.\n5. Season with salt and pepper.\n6. Serve with whole grain bread."
        },
        dinner: {
          name: "Grilled Salmon with Roasted Sweet Potato and Broccoli",
          description: "Omega-3 rich salmon with vitamin-packed sweet potato and broccoli.",
          nutrients: ["Omega-3 Fatty Acids", "Protein", "Vitamin A", "Fiber", "Calcium"],
          recipe: "Ingredients:\n- 4 oz salmon fillet\n- 1 medium sweet potato\n- 1 cup broccoli florets\n- 1 tbsp olive oil\n- 1 tsp dried herbs (rosemary, thyme, or oregano)\n- 1 lemon, sliced\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Cut sweet potato into 1-inch cubes, toss with half the oil, herbs, salt, and pepper.\n3. Spread on a baking sheet and roast for 15 minutes.\n4. Add broccoli to the sheet, toss with a bit more oil, salt, and pepper.\n5. Roast for another 15 minutes.\n6. Meanwhile, season salmon with salt, pepper, and remaining herbs.\n7. Place on a lined baking sheet with lemon slices.\n8. Bake for the last 12-15 minutes of vegetable roasting time until fish flakes easily.\n9. Serve salmon with roasted vegetables."
        },
        snacks: [
          {
            name: "Trail Mix with Nuts and Dried Fruit",
            description: "Mix of almonds, walnuts, pumpkin seeds, and dried cranberries.",
            nutrients: ["Healthy Fats", "Protein", "Iron", "Magnesium"]
          },
          {
            name: "Vegetable Soup with Whole Grain Crackers",
            description: "Light vegetable soup with fiber-rich whole grain crackers.",
            nutrients: ["Vitamins", "Minerals", "Fiber", "Hydration"]
          }
        ]
      },
      // Day 5
      {
        breakfast: {
          name: "Quinoa Breakfast Bowl",
          description: "Protein-rich quinoa cooked with milk and topped with fruits and nuts.",
          nutrients: ["Protein", "Fiber", "Healthy Fats", "Antioxidants"],
          recipe: "Ingredients:\n- 1/2 cup cooked quinoa\n- 1/2 cup milk of choice\n- 1/2 apple, diced\n- 1 tbsp chopped walnuts\n- 1 tsp honey\n- 1/4 tsp cinnamon\n\nInstructions:\n1. Mix cooked quinoa with milk in a small saucepan.\n2. Heat over medium-low until warm, about 3-5 minutes.\n3. Transfer to a bowl and top with diced apple, walnuts, honey, and cinnamon."
        },
        lunch: {
          name: "Mediterranean Veggie Sandwich",
          description: "Whole grain bread with hummus, roasted vegetables, and feta cheese.",
          nutrients: ["Fiber", "Protein", "Vitamin C", "Calcium"],
          recipe: "Ingredients:\n- 2 slices whole grain bread\n- 2 tbsp hummus\n- 1/4 cup roasted bell peppers\n- 1/4 cup roasted zucchini\n- 2 tbsp feta cheese, crumbled\n- Few leaves of spinach\n- 1 tsp olive oil\n- 1 tsp balsamic vinegar\n\nInstructions:\n1. Spread hummus on both slices of bread.\n2. Layer one slice with roasted vegetables, feta cheese, and spinach.\n3. Drizzle with olive oil and balsamic vinegar.\n4. Top with the second slice of bread and enjoy."
        },
        dinner: {
          name: "Baked Chicken with Quinoa and Roasted Brussels Sprouts",
          description: "Herb-seasoned chicken breast with fluffy quinoa and caramelized Brussels sprouts.",
          nutrients: ["Protein", "Fiber", "Vitamin K", "Iron"],
          recipe: "Ingredients:\n- 4 oz chicken breast\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup Brussels sprouts, halved\n- 1 tbsp olive oil\n- 1 tsp dried thyme\n- 1 garlic clove, minced\n- 1/2 lemon, juice and zest\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss Brussels sprouts with 1/2 tbsp olive oil, salt, and pepper.\n3. Spread on a baking sheet and roast for 20-25 minutes until caramelized.\n4. Season chicken with remaining oil, thyme, garlic, salt, and pepper.\n5. Bake chicken for 20-25 minutes until cooked through.\n6. Meanwhile, rinse quinoa and cook with water until tender.\n7. Drizzle everything with lemon juice and zest before serving."
        },
        snacks: [
          {
            name: "Yogurt Parfait",
            description: "Greek yogurt layered with granola and mixed berries.",
            nutrients: ["Protein", "Calcium", "Antioxidants", "Fiber"]
          },
          {
            name: "Avocado Toast",
            description: "Small slice of whole grain toast topped with mashed avocado and a sprinkle of seeds.",
            nutrients: ["Healthy Fats", "Fiber", "Vitamin E", "Folate"]
          }
        ]
      },
      // Day 6
      {
        breakfast: {
          name: "Whole Grain Breakfast Sandwich",
          description: "Whole grain English muffin with egg, cheese, and spinach for a filling breakfast.",
          nutrients: ["Protein", "Calcium", "Iron", "B Vitamins"],
          recipe: "Ingredients:\n- 1 whole grain English muffin\n- 1 egg\n- 1 slice cheese\n- 1/4 cup fresh spinach\n- 1 tsp olive oil or butter\n- Salt and pepper to taste\n\nInstructions:\n1. Toast English muffin until golden.\n2. Heat oil in a small pan over medium heat.\n3. Add spinach and sauté until wilted, about 1 minute.\n4. Remove spinach, crack egg into the same pan.\n5. Cook until whites are set but yolk is still runny (or to your preference).\n6. Layer bottom half of muffin with spinach, egg, and cheese.\n7. Top with other half of muffin and enjoy."
        },
        lunch: {
          name: "Loaded Sweet Potato",
          description: "Baked sweet potato topped with black beans, corn, avocado, and a dollop of Greek yogurt.",
          nutrients: ["Fiber", "Protein", "Vitamin A", "Healthy Fats"],
          recipe: "Ingredients:\n- 1 medium sweet potato\n- 1/3 cup black beans, rinsed and drained\n- 1/4 cup corn kernels\n- 1/4 avocado, diced\n- 2 tbsp Greek yogurt\n- 1 tbsp lime juice\n- 2 tbsp fresh cilantro, chopped (optional)\n- 1/4 tsp cumin\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Wash sweet potato and pierce several times with a fork.\n3. Bake for 45-60 minutes until tender.\n4. Mix black beans, corn, avocado, lime juice, cumin, salt, and pepper.\n5. Cut open sweet potato, fluff with a fork.\n6. Top with black bean mixture and a dollop of Greek yogurt.\n7. Sprinkle with cilantro if using."
        },
        dinner: {
          name: "Lentil and Vegetable Curry with Brown Rice",
          description: "Plant-based curry rich in protein, iron, and fiber, served with whole grain brown rice.",
          nutrients: ["Protein", "Iron", "Fiber", "Multiple Vitamins"],
          recipe: "Ingredients:\n- 1/2 cup dry lentils, rinsed\n- 1/2 cup brown rice\n- 1 cup mixed vegetables (cauliflower, carrots, peas)\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp ginger, grated\n- 1/2 tsp mild curry powder\n- 1/4 tsp turmeric\n- 1/2 cup vegetable broth\n- 1/4 cup coconut milk\n- 1 tsp olive oil\n- Salt to taste\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat olive oil in a pot over medium heat.\n3. Add onion and sauté until translucent.\n4. Add garlic and ginger, cook for 30 seconds.\n5. Add curry powder and turmeric, stir for 15 seconds.\n6. Add lentils, vegetables, and broth. Bring to a boil, then simmer for 20 minutes.\n7. Add coconut milk and simmer for another 5 minutes until lentils are tender.\n8. Season with salt to taste.\n9. Serve over brown rice."
        },
        snacks: [
          {
            name: "Fruit and Nut Bar",
            description: "Homemade or store-bought bar with dried fruits, nuts, and seeds.",
            nutrients: ["Healthy Fats", "Natural Sugars", "Protein", "Fiber"]
          },
          {
            name: "Hard-Boiled Egg with Whole Grain Crackers",
            description: "Protein-rich egg with fiber-filled crackers for a balanced snack.",
            nutrients: ["Protein", "Choline", "Fiber", "B Vitamins"]
          }
        ]
      },
      // Day 7
      {
        breakfast: {
          name: "Veggie Breakfast Hash",
          description: "Sweet potato hash with bell peppers, onions, and eggs for a hearty breakfast.",
          nutrients: ["Protein", "Vitamin A", "Vitamin C", "Fiber"],
          recipe: "Ingredients:\n- 1 small sweet potato, diced small\n- 1/4 bell pepper, diced\n- 1/4 onion, diced\n- 2 eggs\n- 1 tbsp olive oil\n- 1/2 tsp paprika\n- 1/4 tsp garlic powder\n- Fresh herbs (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pan over medium heat.\n2. Add sweet potato, cook for 5-7 minutes until starting to soften.\n3. Add bell pepper and onion, cook for another 3-5 minutes.\n4. Season with paprika, garlic powder, salt, and pepper.\n5. Create two wells in the vegetables, crack an egg into each.\n6. Cover and cook until eggs reach desired doneness.\n7. Garnish with fresh herbs if using."
        },
        lunch: {
          name: "Mediterranean Grain Bowl",
          description: "Farro or barley topped with vegetables, olives, feta, and a lemon-herb dressing.",
          nutrients: ["Fiber", "Protein", "Calcium", "Vitamin C"],
          recipe: "Ingredients:\n- 1/2 cup cooked farro or barley\n- 1/2 cup cucumber, diced\n- 1/2 cup cherry tomatoes, halved\n- 1/4 cup red bell pepper, diced\n- 2 tbsp kalamata olives, pitted and sliced\n- 2 tbsp feta cheese, crumbled\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1/2 tsp dried oregano\n- Fresh mint or parsley, chopped (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Place cooked grain in a bowl.\n2. Top with cucumber, tomatoes, bell pepper, olives, and feta.\n3. Mix olive oil, lemon juice, oregano, salt, and pepper for dressing.\n4. Drizzle dressing over bowl.\n5. Garnish with fresh herbs if using."
        },
        dinner: {
          name: "Herb-Roasted Chicken with Root Vegetables",
          description: "Tender chicken breast with colorful root vegetables for a comforting dinner.",
          nutrients: ["Protein", "Vitamin A", "Fiber", "Potassium"],
          recipe: "Ingredients:\n- 4 oz boneless chicken breast\n- 1 cup mixed root vegetables (carrots, parsnips, beets), diced\n- 1/4 onion, cut into wedges\n- 2 garlic cloves, whole\n- 1 tbsp olive oil\n- 1 tsp dried herbs (rosemary, thyme)\n- 1/2 lemon, juice and zest\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss vegetables with half the olive oil, salt, and pepper.\n3. Spread on a baking sheet and roast for 15 minutes.\n4. Rub chicken with remaining oil, herbs, salt, and pepper.\n5. Add chicken to the baking sheet with vegetables.\n6. Roast for another 20-25 minutes until chicken is cooked through and vegetables are tender.\n7. Drizzle with lemon juice and zest before serving."
        },
        snacks: [
          {
            name: "Smoothie",
            description: "Blended smoothie with fruits, leafy greens, and a splash of coconut water.",
            nutrients: ["Vitamin C", "Folate", "Potassium", "Antioxidants"]
          },
          {
            name: "Cheese and Whole Grain Crackers",
            description: "Calcium-rich cheese with fiber-packed crackers for a satisfying snack.",
            nutrients: ["Calcium", "Protein", "Fiber", "B Vitamins"]
          }
        ]
      }
    ],
    trimester3: [
      // Day 1
      {
        breakfast: {
          name: "Chia Seed Pudding with Berries",
          description: "Chia seeds soaked in almond milk overnight, topped with mixed berries and a sprinkle of granola.",
          nutrients: ["Omega-3 Fatty Acids", "Fiber", "Calcium", "Protein"],
          recipe: "Ingredients:\n- 2 tbsp chia seeds\n- 1/2 cup almond milk\n- 1/2 tsp vanilla extract\n- 1 tsp honey or maple syrup\n- 1/4 cup mixed berries\n- 1 tbsp granola\n\nInstructions:\n1. Mix chia seeds, almond milk, vanilla, and sweetener in a jar or container.\n2. Stir well, then refrigerate overnight or for at least 4 hours.\n3. When ready to eat, stir again and top with berries and granola."
        },
        lunch: {
          name: "Tuna Salad Sandwich with Vegetable Soup",
          description: "Whole grain bread with tuna salad made with Greek yogurt instead of mayo, served with a cup of vegetable soup.",
          nutrients: ["Protein", "Omega-3 Fatty Acids", "Fiber", "Antioxidants"],
          recipe: "Ingredients:\n- 3 oz canned tuna in water, drained\n- 2 tbsp Greek yogurt\n- 1 tbsp diced celery\n- 1 tbsp diced red onion\n- 1 tsp lemon juice\n- 2 slices whole grain bread\n- Lettuce leaf\n- 1 cup vegetable soup (homemade or low-sodium store-bought)\n- Salt and pepper to taste\n\nInstructions:\n1. In a bowl, mix tuna, Greek yogurt, celery, red onion, lemon juice, salt, and pepper.\n2. Toast bread if desired.\n3. Assemble sandwich with lettuce and tuna mixture.\n4. Serve with a cup of warmed vegetable soup."
        },
        dinner: {
          name: "Turkey Meatballs with Whole Wheat Pasta and Tomato Sauce",
          description: "Lean turkey meatballs served with whole wheat pasta and a vegetable-rich tomato sauce.",
          nutrients: ["Protein", "Iron", "Fiber", "Vitamin C"],
          recipe: "Ingredients:\n- 4 oz lean ground turkey\n- 1 tbsp breadcrumbs\n- 1 tbsp grated parmesan cheese\n- 1 small garlic clove, minced\n- 1 tbsp fresh parsley, chopped\n- 1/2 cup whole wheat pasta\n- 1/2 cup tomato sauce\n- 1/4 cup each diced carrot, zucchini, and bell pepper\n- 1 tsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Mix ground turkey, breadcrumbs, parmesan, garlic, parsley, salt, and pepper.\n2. Form into small meatballs.\n3. Heat olive oil in a pan over medium heat.\n4. Cook meatballs for 8-10 minutes, turning occasionally, until cooked through.\n5. In another pan, sauté diced vegetables until tender.\n6. Add tomato sauce to vegetables and simmer for 5 minutes.\n7. Meanwhile, cook pasta according to package instructions.\n8. Serve meatballs and sauce over pasta."
        },
        snacks: [
          {
            name: "Mixed Nuts and Dried Fruits",
            description: "A handful of mixed nuts and dried fruits for energy and nutrients.",
            nutrients: ["Healthy Fats", "Protein", "Iron", "Fiber"]
          },
          {
            name: "Smoothie Bowl",
            description: "A thick smoothie made with spinach, banana, almond milk, and topped with granola and seeds.",
            nutrients: ["Iron", "Potassium", "Fiber", "Antioxidants"]
          }
        ]
      },
      // Day 2
      {
        breakfast: {
          name: "Whole Grain Pancakes with Fruit",
          description: "Whole grain pancakes topped with fresh fruits and a dollop of Greek yogurt instead of syrup.",
          nutrients: ["Fiber", "Protein", "Vitamin C", "Calcium"],
          recipe: "Ingredients:\n- 1/2 cup whole grain pancake mix\n- 1/3 cup milk\n- 1 egg\n- 1 tsp olive oil or melted butter\n- 1/2 cup mixed fresh fruits (berries, banana slices)\n- 2 tbsp Greek yogurt\n- 1 tsp honey (optional)\n\nInstructions:\n1. Mix pancake mix, milk, and egg until just combined (some lumps are okay).\n2. Heat a non-stick pan over medium heat, add a small amount of oil.\n3. Pour small amounts of batter to form pancakes.\n4. Cook until bubbles form on surface, then flip and cook other side.\n5. Serve topped with fresh fruit, Greek yogurt, and a drizzle of honey if desired."
        },
        lunch: {
          name: "Lentil and Vegetable Curry with Brown Rice",
          description: "A mild curry made with lentils and mixed vegetables, served with brown rice.",
          nutrients: ["Protein", "Fiber", "Iron", "Folate"],
          recipe: "Ingredients:\n- 1/2 cup dry lentils, rinsed\n- 1/2 cup brown rice\n- 1 cup mixed vegetables (carrots, peas, cauliflower)\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp ginger, grated\n- 1/2 tsp mild curry powder\n- 1/4 tsp turmeric\n- 1/2 cup vegetable broth\n- 1/4 cup coconut milk\n- 1 tsp olive oil\n- Fresh cilantro for garnish\n- Salt to taste\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat olive oil in a pot over medium heat.\n3. Add onion and sauté until translucent.\n4. Add garlic and ginger, cook for 30 seconds.\n5. Add curry powder and turmeric, stir for 15 seconds.\n6. Add lentils, vegetables, and broth. Bring to a boil, then simmer for 20 minutes.\n7. Add coconut milk and simmer for another 5 minutes until lentils are tender.\n8. Season with salt to taste.\n9. Serve over brown rice, garnish with fresh cilantro."
        },
        dinner: {
          name: "Grilled Chicken with Quinoa Salad and Roasted Vegetables",
          description: "Grilled chicken breast served with a quinoa salad mixed with roasted vegetables and a light vinaigrette.",
          nutrients: ["Protein", "Fiber", "Iron", "Antioxidants"],
          recipe: "Ingredients:\n- 4 oz chicken breast\n- 1/2 cup quinoa\n- 1 cup water\n- 1 cup mixed vegetables (zucchini, bell pepper, red onion), chopped\n- 1 tbsp olive oil, divided\n- 1 tsp dried herbs (thyme, rosemary, or oregano)\n- 1 tbsp lemon juice\n- 1 tsp Dijon mustard\n- Fresh herbs for garnish\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss vegetables with 1/2 tbsp olive oil, dried herbs, salt, and pepper.\n3. Spread on a baking sheet and roast for 20-25 minutes until tender.\n4. Season chicken with salt, pepper, and a sprinkle of herbs.\n5. Grill chicken for 6-7 minutes per side until cooked through.\n6. Meanwhile, rinse quinoa and cook with water until tender and water is absorbed.\n7. In a small bowl, whisk together remaining olive oil, lemon juice, mustard, salt, and pepper.\n8. Mix cooked quinoa with roasted vegetables and dressing.\n9. Slice chicken and serve alongside quinoa salad."
        },
        snacks: [
          {
            name: "Hard-Boiled Eggs",
            description: "Hard-boiled eggs for a protein-rich snack to keep you satisfied.",
            nutrients: ["Protein", "Choline", "Vitamin D", "B Vitamins"]
          },
          {
            name: "Fresh Fruit with Yogurt Dip",
            description: "Sliced fresh fruits served with a honey-sweetened yogurt dip.",
            nutrients: ["Vitamin C", "Fiber", "Calcium", "Protein"]
          }
        ]
      },
      // Day 3
      {
        breakfast: {
          name: "Vegetable Frittata with Whole Grain Toast",
          description: "Egg frittata packed with vegetables and a side of whole grain toast.",
          nutrients: ["Protein", "Folate", "Vitamin A", "Fiber"],
          recipe: "Ingredients:\n- 2 eggs\n- 1 tbsp milk\n- 1/4 cup diced vegetables (spinach, bell pepper, onion)\n- 1 tbsp grated cheese\n- 1 slice whole grain toast\n- 1 tsp olive oil\n- Fresh herbs (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Whisk eggs and milk with salt and pepper.\n3. Heat olive oil in an oven-safe skillet over medium heat.\n4. Add vegetables and sauté until tender.\n5. Pour egg mixture over vegetables, sprinkle with cheese.\n6. Cook for 2 minutes, then transfer to oven.\n7. Bake for 8-10 minutes until set and lightly browned.\n8. Serve with whole grain toast."
        },
        lunch: {
          name: "Chickpea and Vegetable Salad with Quinoa",
          description: "Protein-rich chickpeas and fresh vegetables over quinoa with a light dressing.",
          nutrients: ["Protein", "Fiber", "Iron", "Vitamin C"],
          recipe: "Ingredients:\n- 1/2 cup cooked chickpeas\n- 1/2 cup cooked quinoa\n- 1 cup mixed vegetables (cucumber, tomato, bell pepper, red onion), diced\n- 2 cups mixed salad greens\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1/2 tsp dried oregano\n- 1 tbsp feta cheese, crumbled (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. In a large bowl, combine chickpeas, quinoa, vegetables, and salad greens.\n2. In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.\n3. Pour dressing over salad and toss gently.\n4. Top with crumbled feta if using."
        },
        dinner: {
          name: "Baked White Fish with Sweet Potato and Green Beans",
          description: "Mild white fish baked with herbs, served with sweet potato and steamed green beans.",
          nutrients: ["Lean Protein", "Omega-3 Fatty Acids", "Vitamin A", "Fiber"],
          recipe: "Ingredients:\n- 4 oz white fish fillet (tilapia, cod, or haddock)\n- 1 medium sweet potato\n- 1 cup green beans, trimmed\n- 1 tbsp olive oil\n- 1 lemon, sliced\n- 1 garlic clove, minced\n- 1 tbsp fresh herbs (parsley, dill), chopped\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Wash sweet potato and pierce with a fork. Bake for 45-60 minutes until tender.\n3. Place fish on a parchment-lined baking sheet.\n4. Mix olive oil, garlic, salt, and pepper. Brush over fish.\n5. Top with lemon slices and herbs.\n6. Bake for 12-15 minutes until fish flakes easily.\n7. Steam green beans for 5-7 minutes until tender-crisp.\n8. Serve fish with baked sweet potato and green beans."
        },
        snacks: [
          {
            name: "Whole Grain Crackers with Hummus",
            description: "Fiber-rich crackers with protein-packed hummus for sustained energy.",
            nutrients: ["Fiber", "Protein", "Healthy Fats", "B Vitamins"]
          },
          {
            name: "Berry Smoothie",
            description: "Antioxidant-rich berry smoothie with milk and a touch of honey.",
            nutrients: ["Vitamin C", "Antioxidants", "Calcium", "Hydration"]
          }
        ]
      },
      // Day 4
      {
        breakfast: {
          name: "Overnight Oats with Nuts and Fruit",
          description: "Fiber-rich oats soaked overnight with milk, topped with nuts and fresh fruit.",
          nutrients: ["Fiber", "Protein", "Calcium", "Healthy Fats"],
          recipe: "Ingredients:\n- 1/2 cup rolled oats\n- 1/2 cup milk of choice\n- 1 tbsp chia seeds\n- 1/2 tsp vanilla extract\n- 1 tsp honey or maple syrup\n- 1 tbsp chopped nuts\n- 1/4 cup fresh fruit\n\nInstructions:\n1. Mix oats, milk, chia seeds, vanilla, and sweetener in a jar.\n2. Refrigerate overnight or for at least 4 hours.\n3. When ready to eat, top with nuts and fresh fruit."
        },
        lunch: {
          name: "Bean and Vegetable Soup with Whole Grain Roll",
          description: "Hearty bean soup packed with vegetables and served with a whole grain roll.",
          nutrients: ["Protein", "Fiber", "Iron", "Multiple Vitamins"],
          recipe: "Ingredients:\n- 1/2 cup mixed beans (pre-cooked or canned)\n- 2 cups vegetable broth\n- 1 cup mixed vegetables (carrots, celery, onion, tomatoes), diced\n- 1 garlic clove, minced\n- 1 tsp herbs (thyme, bay leaf)\n- 1 whole grain roll\n- 1 tsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pot over medium heat.\n2. Add onion, carrot, and celery. Sauté for 5 minutes.\n3. Add garlic and herbs, cook for 30 seconds.\n4. Add beans, tomatoes, and broth. Bring to a boil, then simmer for 15-20 minutes.\n5. Season with salt and pepper.\n6. Serve with a whole grain roll."
        },
        dinner: {
          name: "Slow-Cooked Beef Stew with Root Vegetables",
          description: "Iron-rich beef stew with root vegetables and herbs for a comforting dinner.",
          nutrients: ["Iron", "Protein", "Vitamin A", "Zinc"],
          recipe: "Ingredients:\n- 4 oz lean beef stew meat, cubed\n- 1 cup root vegetables (carrots, parsnips, turnips), diced\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1 cup beef broth (low-sodium)\n- 1 tbsp tomato paste\n- 1 tsp herbs (rosemary, thyme)\n- 1 bay leaf\n- 1 tbsp olive oil\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pot over medium-high heat.\n2. Brown beef cubes on all sides, about 5 minutes.\n3. Add onion and garlic, sauté for 2 minutes.\n4. Add root vegetables, stir to combine.\n5. Add broth, tomato paste, herbs, bay leaf, salt, and pepper.\n6. Bring to a boil, then reduce heat to low.\n7. Cover and simmer for 1.5-2 hours until meat is tender.\n8. Remove bay leaf before serving."
        },
        snacks: [
          {
            name: "Avocado on Whole Grain Toast",
            description: "Heart-healthy avocado on fiber-rich toast with a sprinkle of seeds.",
            nutrients: ["Healthy Fats", "Fiber", "Vitamin E", "Folate"]
          },
          {
            name: "Yogurt with Fruit and Granola",
            description: "Protein-rich yogurt with fresh fruit and crunchy granola.",
            nutrients: ["Protein", "Calcium", "Vitamin C", "Fiber"]
          }
        ]
      },
      // Day 5
      {
        breakfast: {
          name: "Protein Smoothie Bowl",
          description: "Thick smoothie with Greek yogurt, fruit, and protein powder, topped with granola and seeds.",
          nutrients: ["Protein", "Calcium", "Vitamin C", "Healthy Fats"],
          recipe: "Ingredients:\n- 1/2 cup Greek yogurt\n- 1/2 banana\n- 1/2 cup mixed berries\n- 1 tbsp protein powder (optional)\n- 1/4 cup milk of choice\n- 1 tbsp granola\n- 1 tsp chia seeds\n- 1 tsp honey\n\nInstructions:\n1. Blend yogurt, banana, berries, protein powder, and milk until thick and smooth.\n2. Pour into a bowl.\n3. Top with granola, chia seeds, and a drizzle of honey."
        },
        lunch: {
          name: "Quinoa and Chickpea Buddha Bowl",
          description: "Nutritious bowl with quinoa, chickpeas, roasted vegetables, and tahini dressing.",
          nutrients: ["Protein", "Fiber", "Iron", "B Vitamins"],
          recipe: "Ingredients:\n- 1/2 cup cooked quinoa\n- 1/2 cup chickpeas, rinsed and drained\n- 1 cup mixed roasted vegetables (sweet potato, broccoli, bell pepper)\n- 1/4 avocado, sliced\n- 1 tbsp tahini\n- 1 tbsp lemon juice\n- 1 tsp maple syrup\n- 1 tbsp water\n- Salt and pepper to taste\n\nInstructions:\n1. Arrange quinoa, chickpeas, and roasted vegetables in a bowl.\n2. Top with avocado slices.\n3. Mix tahini, lemon juice, maple syrup, water, salt, and pepper for dressing.\n4. Drizzle dressing over bowl before serving."
        },
        dinner: {
          name: "Baked Fish Packets with Vegetables",
          description: "White fish baked in parchment with vegetables, herbs, and lemon for an easy one-packet meal.",
          nutrients: ["Lean Protein", "Omega-3 Fatty Acids", "Vitamin C", "Potassium"],
          recipe: "Ingredients:\n- 4 oz white fish fillet (cod, tilapia, or haddock)\n- 1/2 cup sliced zucchini\n- 1/2 cup cherry tomatoes, halved\n- 1/4 cup sliced bell pepper\n- 1 small shallot, thinly sliced\n- 1 tbsp olive oil\n- 1 lemon, sliced\n- 1 tbsp fresh herbs (dill, parsley)\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 375°F (190°C).\n2. Cut a large piece of parchment paper or foil.\n3. Place fish in the center, top with vegetables.\n4. Drizzle with olive oil, season with salt and pepper.\n5. Top with lemon slices and herbs.\n6. Fold parchment to seal packet tightly.\n7. Bake for 15-20 minutes until fish flakes easily.\n8. Serve packet on a plate, opening carefully to avoid steam."
        },
        snacks: [
          {
            name: "Energy Balls",
            description: "No-bake balls made with dates, nuts, and oats for sustained energy.",
            nutrients: ["Healthy Fats", "Fiber", "Natural Sugars", "Protein"]
          },
          {
            name: "Veggie Sticks with Guacamole",
            description: "Fresh vegetable sticks with homemade guacamole for healthy fats.",
            nutrients: ["Healthy Fats", "Fiber", "Vitamin A", "Vitamin C"]
          }
        ]
      },
      // Day 6
      {
        breakfast: {
          name: "Whole Grain Breakfast Sandwich",
          description: "Whole grain English muffin with egg, cheese, and spinach for a filling breakfast.",
          nutrients: ["Protein", "Calcium", "Iron", "B Vitamins"],
          recipe: "Ingredients:\n- 1 whole grain English muffin\n- 1 egg\n- 1 slice cheese\n- 1/4 cup fresh spinach\n- 1 tsp olive oil or butter\n- Salt and pepper to taste\n\nInstructions:\n1. Toast English muffin until golden.\n2. Heat oil in a small pan over medium heat.\n3. Add spinach and sauté until wilted, about 1 minute.\n4. Remove spinach, crack egg into the same pan.\n5. Cook until whites are set but yolk is still runny (or to your preference).\n6. Layer bottom half of muffin with spinach, egg, and cheese.\n7. Top with other half of muffin and enjoy."
        },
        lunch: {
          name: "Loaded Sweet Potato",
          description: "Baked sweet potato topped with black beans, corn, avocado, and a dollop of Greek yogurt.",
          nutrients: ["Fiber", "Protein", "Vitamin A", "Healthy Fats"],
          recipe: "Ingredients:\n- 1 medium sweet potato\n- 1/3 cup black beans, rinsed and drained\n- 1/4 cup corn kernels\n- 1/4 avocado, diced\n- 2 tbsp Greek yogurt\n- 1 tbsp lime juice\n- 2 tbsp fresh cilantro, chopped (optional)\n- 1/4 tsp cumin\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Wash sweet potato and pierce several times with a fork.\n3. Bake for 45-60 minutes until tender.\n4. Mix black beans, corn, avocado, lime juice, cumin, salt, and pepper.\n5. Cut open sweet potato, fluff with a fork.\n6. Top with black bean mixture and a dollop of Greek yogurt.\n7. Sprinkle with cilantro if using."
        },
        dinner: {
          name: "Lentil and Vegetable Curry with Brown Rice",
          description: "Plant-based curry rich in protein, iron, and fiber, served with whole grain brown rice.",
          nutrients: ["Protein", "Iron", "Fiber", "Multiple Vitamins"],
          recipe: "Ingredients:\n- 1/2 cup dry lentils, rinsed\n- 1/2 cup brown rice\n- 1 cup mixed vegetables (cauliflower, carrots, peas)\n- 1/4 onion, diced\n- 1 garlic clove, minced\n- 1/2 tsp ginger, grated\n- 1/2 tsp mild curry powder\n- 1/4 tsp turmeric\n- 1/2 cup vegetable broth\n- 1/4 cup coconut milk\n- 1 tsp olive oil\n- Salt to taste\n\nInstructions:\n1. Cook brown rice according to package instructions.\n2. Heat olive oil in a pot over medium heat.\n3. Add onion and sauté until translucent.\n4. Add garlic and ginger, cook for 30 seconds.\n5. Add curry powder and turmeric, stir for 15 seconds.\n6. Add lentils, vegetables, and broth. Bring to a boil, then simmer for 20 minutes.\n7. Add coconut milk and simmer for another 5 minutes until lentils are tender.\n8. Season with salt to taste.\n9. Serve over brown rice."
        },
        snacks: [
          {
            name: "Fruit and Nut Bar",
            description: "Homemade or store-bought bar with dried fruits, nuts, and seeds.",
            nutrients: ["Healthy Fats", "Natural Sugars", "Protein", "Fiber"]
          },
          {
            name: "Hard-Boiled Egg with Whole Grain Crackers",
            description: "Protein-rich egg with fiber-filled crackers for a balanced snack.",
            nutrients: ["Protein", "Choline", "Fiber", "B Vitamins"]
          }
        ]
      },
      // Day 7
      {
        breakfast: {
          name: "Veggie Breakfast Hash",
          description: "Sweet potato hash with bell peppers, onions, and eggs for a hearty breakfast.",
          nutrients: ["Protein", "Vitamin A", "Vitamin C", "Fiber"],
          recipe: "Ingredients:\n- 1 small sweet potato, diced small\n- 1/4 bell pepper, diced\n- 1/4 onion, diced\n- 2 eggs\n- 1 tbsp olive oil\n- 1/2 tsp paprika\n- 1/4 tsp garlic powder\n- Fresh herbs (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Heat olive oil in a pan over medium heat.\n2. Add sweet potato, cook for 5-7 minutes until starting to soften.\n3. Add bell pepper and onion, cook for another 3-5 minutes.\n4. Season with paprika, garlic powder, salt, and pepper.\n5. Create two wells in the vegetables, crack an egg into each.\n6. Cover and cook until eggs reach desired doneness.\n7. Garnish with fresh herbs if using."
        },
        lunch: {
          name: "Mediterranean Grain Bowl",
          description: "Farro or barley topped with vegetables, olives, feta, and a lemon-herb dressing.",
          nutrients: ["Fiber", "Protein", "Calcium", "Vitamin C"],
          recipe: "Ingredients:\n- 1/2 cup cooked farro or barley\n- 1/2 cup cucumber, diced\n- 1/2 cup cherry tomatoes, halved\n- 1/4 cup red bell pepper, diced\n- 2 tbsp kalamata olives, pitted and sliced\n- 2 tbsp feta cheese, crumbled\n- 1 tbsp olive oil\n- 1 tbsp lemon juice\n- 1/2 tsp dried oregano\n- Fresh mint or parsley, chopped (optional)\n- Salt and pepper to taste\n\nInstructions:\n1. Place cooked grain in a bowl.\n2. Top with cucumber, tomatoes, bell pepper, olives, and feta.\n3. Mix olive oil, lemon juice, oregano, salt, and pepper for dressing.\n4. Drizzle dressing over bowl.\n5. Garnish with fresh herbs if using."
        },
        dinner: {
          name: "Herb-Roasted Chicken with Root Vegetables",
          description: "Tender chicken breast with colorful root vegetables for a comforting dinner.",
          nutrients: ["Protein", "Vitamin A", "Fiber", "Potassium"],
          recipe: "Ingredients:\n- 4 oz boneless chicken breast\n- 1 cup mixed root vegetables (carrots, parsnips, beets), diced\n- 1/4 onion, cut into wedges\n- 2 garlic cloves, whole\n- 1 tbsp olive oil\n- 1 tsp dried herbs (rosemary, thyme)\n- 1/2 lemon, juice and zest\n- Salt and pepper to taste\n\nInstructions:\n1. Preheat oven to 400°F (200°C).\n2. Toss vegetables with half the olive oil, salt, and pepper.\n3. Spread on a baking sheet and roast for 15 minutes.\n4. Rub chicken with remaining oil, herbs, salt, and pepper.\n5. Add chicken to the baking sheet with vegetables.\n6. Roast for another 20-25 minutes until chicken is cooked through and vegetables are tender.\n7. Drizzle with lemon juice and zest before serving."
        },
        snacks: [
          {
            name: "Smoothie",
            description: "Blended smoothie with fruits, leafy greens, and a splash of coconut water.",
            nutrients: ["Vitamin C", "Folate", "Potassium", "Antioxidants"]
          },
          {
            name: "Cheese and Whole Grain Crackers",
            description: "Calcium-rich cheese with fiber-packed crackers for a satisfying snack.",
            nutrients: ["Calcium", "Protein", "Fiber", "B Vitamins"]
          }
        ]
      }
    ]
  };

  const renderMeal = (meal: Meal, title: string) => (
    <div className="mb-4">
      <h3 className="text-md font-semibold text-softpink flex items-center justify-between">
        <span>{title}: {meal.name}</span>
        {meal.recipe && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setShowRecipe(showRecipe === `${title}-${meal.name}` ? null : `${title}-${meal.name}`)}
          >
            {showRecipe === `${title}-${meal.name}` ? "Hide Recipe" : "View Recipe"}
          </Button>
        )}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
      {showRecipe === `${title}-${meal.name}` && meal.recipe && (
        <div className="mt-2 bg-slate-50 p-3 rounded-md text-sm whitespace-pre-line">
          {meal.recipe}
        </div>
      )}
      <div className="flex flex-wrap gap-1 mt-2">
        {meal.nutrients.map((nutrient, index) => (
          <Badge key={index} variant="outline" className="text-xs bg-softpink/10 text-softpink border-softpink/20">
            {nutrient}
          </Badge>
        ))}
      </div>
    </div>
  );

  const Badge = ({ children, className, variant }: { children: React.ReactNode; className?: string; variant: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs ${className}`}>
      {children}
    </span>
  );

  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "tips": return `Nutrition Tips for Week ${currentWeek} + ${currentDays} days`;
      case "mealPlan": return "Weekly Meal Plan";
      default: return "Pregnancy Meal Plans";
    }
  };

  // Set active tab based on current week
  useEffect(() => {
    if (1 <= currentWeek && currentWeek <= 12) {
      setActiveTab("trimester1");
    } else if (13 <= currentWeek && currentWeek <= 27) {
      setActiveTab("trimester2");
    } else if (currentWeek >= 28) {
      setActiveTab("trimester3");
    }
  }, [currentWeek]);

  const nutritionTips = getNutritionTips();

  // Format the last update time
  const formatLastUpdate = () => {
    const hours = lastUpdate.getHours().toString().padStart(2, '0');
    const minutes = lastUpdate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Pregnancy Meal Plans</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last updated: {formatLastUpdate()}</span>
            <Button variant="outline" size="icon" onClick={handleRefresh} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px]">
              <DropdownMenuItem onClick={() => setViewMode("tips")}>
                Nutrition Tips for Week {currentWeek} + {currentDays} days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("mealPlan")}>
                Weekly Meal Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "tips" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutrition Tips for Week {currentWeek} + {currentDays} days</CardTitle>
              <CardDescription>
                Personalized nutrition guidance based on your current pregnancy stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(nutritionTips).map(([category, tip]) => (
                  <div key={category} className="border-b pb-3 last:border-0">
                    <h3 className="font-medium text-softpink flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4" /> {category}
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutrition Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">First Trimester</h3>
                  <p className="text-sm text-muted-foreground">
                    Focus on foods that help combat nausea and provide folate, iron, and B vitamins. Small, frequent meals may help with morning sickness.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Second Trimester</h3>
                  <p className="text-sm text-muted-foreground">
                    Increase calcium and vitamin D for baby's bone development. Add more protein and iron as the baby grows.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Third Trimester</h3>
                  <p className="text-sm text-muted-foreground">
                    Continue with nutrient-dense foods while adding omega-3 fatty acids for brain development. Smaller, more frequent meals may help with reduced stomach capacity.
                  </p>
                </div>
                
                <div className="bg-calmteal/10 p-4 rounded-md mt-4">
                  <h3 className="font-medium mb-1 text-calmteal">Important Note</h3>
                  <p className="text-sm">
                    These meal plans are suggestions only. Always consult with your healthcare provider about your specific nutritional needs during pregnancy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "mealPlan" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Meal Plan</CardTitle>
            <CardDescription>
              Balanced nutrition is crucial during pregnancy. These meal plans are designed to provide essential nutrients for each trimester.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {activeTab === "trimester1" ? "First Trimester" : 
                     activeTab === "trimester2" ? "Second Trimester" : "Third Trimester"} 
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[160px]">
                  <DropdownMenuItem onClick={() => setActiveTab("trimester1")}>
                    First Trimester
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("trimester2")}>
                    Second Trimester
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("trimester3")}>
                    Third Trimester
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {Object.keys(mealPlans).map((trimester) => (
              trimester === activeTab && (
                <div key={trimester} className="space-y-8">
                  {mealPlans[trimester].map((dailyMeal, dayIndex) => (
                    <Card key={dayIndex} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center">
                          <Utensils className="h-4 w-4 mr-2 text-lavender" /> 
                          Day {dayIndex + 1} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex % 7]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {renderMeal(dailyMeal.breakfast, "Breakfast")}
                          {renderMeal(dailyMeal.lunch, "Lunch")}
                          {renderMeal(dailyMeal.dinner, "Dinner")}
                          
                          <h3 className="text-md font-semibold text-softpink mt-4">Snacks</h3>
                          {dailyMeal.snacks.map((snack, index) => (
                            <div key={index} className="ml-4 mt-2">
                              <p className="text-sm font-medium">{snack.name}</p>
                              <p className="text-xs text-muted-foreground">{snack.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {snack.nutrients.map((nutrient, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-softpink/10 text-softpink border-softpink/20">
                                    {nutrient}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
