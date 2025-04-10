import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Thermometer, Lightbulb, Calendar, AlertCircle, ShieldCheck } from "lucide-react";

export default function HealthEducation() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Health Education</h1>
      
      <Tabs defaultValue="period" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="period">Period Health</TabsTrigger>
          <TabsTrigger value="periodDos">Period Do's & Don'ts</TabsTrigger>
          <TabsTrigger value="conditions">Common Conditions</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="period" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-lavender" />
                  Understanding Your Menstrual Cycle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The menstrual cycle is a natural process that occurs in women of reproductive age. 
                  It prepares the body for potential pregnancy each month. A typical cycle lasts 
                  about 28 days, but can range from 21 to 35 days.
                </p>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">The Four Phases of Your Cycle:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Menstrual Phase (Days 1-5):</span>{" "}
                      The uterine lining sheds through the vagina as menstrual blood. This is counted as the first day of your cycle.
                    </li>
                    <li>
                      <span className="font-medium">Follicular Phase (Days 1-13):</span>{" "}
                      Overlapping with menstruation, the pituitary gland releases FSH, causing follicles in the ovaries to develop.
                    </li>
                    <li>
                      <span className="font-medium">Ovulation (Day 14):</span>{" "}
                      A mature egg is released from the ovary and moves into the fallopian tube. This is when you're most fertile.
                    </li>
                    <li>
                      <span className="font-medium">Luteal Phase (Days 15-28):</span>{" "}
                      The follicle transforms into the corpus luteum, producing progesterone. If pregnancy doesn't occur, the corpus luteum breaks down, hormone levels decrease, and your next period begins.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-lavender" />
                  Period Health Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Stay hydrated to reduce bloating and cramps</li>
                  <li>Exercise regularly, even light activity can help alleviate symptoms</li>
                  <li>Maintain a balanced diet with adequate iron to prevent anemia</li>
                  <li>Practice stress management techniques like meditation</li>
                  <li>Use a heating pad to relieve cramps</li>
                  <li>Get plenty of rest and sleep</li>
                  <li>Consider using a period tracking app to predict symptoms</li>
                  <li>Try to limit caffeine and alcohol during your period</li>
                  <li>Wear comfortable clothing</li>
                  <li>Consider taking supplements like magnesium or vitamin B6 if recommended by your doctor</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="periodDos" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-lavender" />
                  Day-by-Day Period Guide
                </CardTitle>
                <CardDescription>
                  Recommendations for each phase of your menstrual cycle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Days 1-3 (Heavy Flow Days)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-green-600 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Recommended:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Rest when needed; listen to your body</li>
                        <li>Stay hydrated with warm drinks</li>
                        <li>Use a heating pad for cramps</li>
                        <li>Gentle stretching or yoga</li>
                        <li>Iron-rich foods (leafy greens, beans, lentils)</li>
                        <li>Keep warm, especially the lower abdomen</li>
                        <li>Frequent pad/tampon changes to prevent infections</li>
                      </ul>
                    </div>
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-red-500 mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Avoid:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Strenuous exercise or heavy lifting</li>
                        <li>Cold foods and beverages</li>
                        <li>Excessive caffeine and alcohol</li>
                        <li>Salty foods that increase bloating</li>
                        <li>Skipping meals</li>
                        <li>Stress and anxiety-inducing activities</li>
                        <li>Sexual intercourse (if uncomfortable or heavy bleeding)</li>
                        <li>Swimming (higher risk of infection)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Days 4-7 (Lighter Flow Days)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-green-600 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Recommended:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Gradual return to regular activities</li>
                        <li>Light exercise like walking or swimming</li>
                        <li>Continue iron-rich diet to replenish stores</li>
                        <li>Vitamin C foods to help iron absorption</li>
                        <li>Maintain good hygiene practices</li>
                        <li>Stay hydrated</li>
                        <li>Balanced diet with complex carbohydrates</li>
                      </ul>
                    </div>
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-red-500 mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Avoid:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Suddenly resuming intense workouts</li>
                        <li>Excessive junk food or sugar</li>
                        <li>Skipping regular hygiene routines</li>
                        <li>Dehydration</li>
                        <li>Using expired or improper menstrual products</li>
                        <li>Tight, restrictive clothing</li>
                        <li>Ignoring lingering symptoms</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Follicular Phase (Post-Period)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-green-600 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Recommended:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Increase physical activity - energy levels rise</li>
                        <li>Try new workouts or challenges</li>
                        <li>Focus on creative projects and learning</li>
                        <li>Schedule important meetings/presentations</li>
                        <li>Antioxidant-rich foods</li>
                        <li>Balanced diet with healthy fats</li>
                        <li>More social activities</li>
                      </ul>
                    </div>
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-red-500 mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Generally Fine, But Be Mindful Of:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Overcommitting due to increased energy</li>
                        <li>Pushing exercise to extremes</li>
                        <li>Overlooking adequate rest</li>
                        <li>Changes in libido (usually increases)</li>
                        <li>New contraceptive considerations if sexually active</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Luteal Phase (Pre-Period)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-green-600 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Recommended:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Mindfulness practices and stress management</li>
                        <li>Gentle, low-impact exercise</li>
                        <li>Extra calcium and magnesium in diet</li>
                        <li>Complex carbohydrates for mood stability</li>
                        <li>Limit salt to reduce bloating</li>
                        <li>Sufficient sleep (7-9 hours)</li>
                        <li>Self-care and relaxation activities</li>
                        <li>Prepare menstrual supplies for upcoming period</li>
                      </ul>
                    </div>
                    <div className="border p-4 rounded-md">
                      <p className="font-medium flex items-center text-red-500 mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Avoid:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>High sugar and processed foods</li>
                        <li>Excessive caffeine and alcohol</li>
                        <li>Staying up late</li>
                        <li>Scheduling stressful events if possible</li>
                        <li>Salty foods that increase water retention</li>
                        <li>Making major decisions when emotionally sensitive</li>
                        <li>Ignoring early PMS symptoms</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">About Sexual Activity During Periods</h3>
                  <Card className="p-4">
                    <p className="mb-2">
                      Sexual activity during menstruation is a personal choice. Here are some facts to consider:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>It's generally safe but may increase risk of certain infections</li>
                      <li>Can relieve cramps for some women due to endorphin release</li>
                      <li>Still need contraception - pregnancy is less likely but still possible</li>
                      <li>Use a towel to protect bedding and shower before for hygiene</li>
                      <li>Communication with your partner about comfort levels is essential</li>
                      <li>Consider using condoms to reduce mess and provide protection</li>
                      <li>Non-penetrative activities are alternatives if penetration is uncomfortable</li>
                      <li>Some women report increased arousal during menstruation due to hormonal changes</li>
                    </ul>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-lavender" />
                  Menstrual Nutrition Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border p-4 rounded-md">
                    <h4 className="font-medium mb-2">Foods to Embrace During Your Period</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="font-medium">Iron-rich foods:</span> Spinach, lentils, tofu, pumpkin seeds, fortified cereals</li>
                      <li><span className="font-medium">Anti-inflammatory foods:</span> Berries, fatty fish, nuts, olive oil, turmeric, ginger</li>
                      <li><span className="font-medium">Calcium-rich foods:</span> Yogurt, milk, fortified plant milks, kale, broccoli</li>
                      <li><span className="font-medium">Magnesium-rich foods:</span> Dark chocolate, avocados, bananas, almonds, black beans</li>
                      <li><span className="font-medium">Complex carbohydrates:</span> Whole grains, brown rice, oatmeal, sweet potatoes</li>
                      <li><span className="font-medium">Water-rich foods:</span> Cucumber, watermelon, strawberries, celery</li>
                      <li><span className="font-medium">Omega-3 fatty acids:</span> Salmon, flaxseeds, walnuts, chia seeds</li>
                    </ul>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h4 className="font-medium mb-2">Foods to Limit During Your Period</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="font-medium">Salty foods:</span> Chips, processed foods, canned soups (increase bloating)</li>
                      <li><span className="font-medium">Caffeine:</span> Coffee, energy drinks, some teas (can increase anxiety and tension)</li>
                      <li><span className="font-medium">Alcohol:</span> All types (can worsen dehydration and mood changes)</li>
                      <li><span className="font-medium">Added sugars:</span> Candies, pastries, sodas (cause energy crashes and mood swings)</li>
                      <li><span className="font-medium">Spicy foods:</span> May increase discomfort for those with digestive sensitivity</li>
                      <li><span className="font-medium">Fatty fried foods:</span> Fried chicken, french fries, etc. (may increase inflammation)</li>
                      <li><span className="font-medium">Refined carbohydrates:</span> White bread, pastries (cause blood sugar spikes)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conditions" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-lavender" />
                  Polycystic Ovary Syndrome (PCOS)
                </CardTitle>
                <CardDescription>
                  A common hormonal disorder affecting up to 1 in 10 women of reproductive age
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Common Symptoms:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Irregular periods or no periods</li>
                    <li>Heavy bleeding during periods</li>
                    <li>Excess hair growth on face, chest, back (hirsutism)</li>
                    <li>Acne, oily skin, or dandruff</li>
                    <li>Weight gain or difficulty losing weight</li>
                    <li>Thinning hair or hair loss</li>
                    <li>Dark patches of skin on neck, armpits, or under breasts</li>
                    <li>Multiple small cysts on the ovaries</li>
                  </ul>
                </div>
                
                <p>
                  If you suspect you have PCOS, consult with a healthcare provider for proper diagnosis and treatment options.
                  Early diagnosis and management can help prevent long-term complications like type 2 diabetes and heart disease.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-lavender" />
                  Endometriosis
                </CardTitle>
                <CardDescription>
                  A disorder where tissue similar to the uterine lining grows outside the uterus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Common Symptoms:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Extremely painful periods (dysmenorrhea)</li>
                    <li>Pain during or after sex</li>
                    <li>Pain with bowel movements or urination</li>
                    <li>Excessive bleeding during periods or between periods</li>
                    <li>Infertility or difficulty getting pregnant</li>
                    <li>Fatigue, diarrhea, constipation, bloating or nausea</li>
                  </ul>
                </div>
                
                <p>
                  Endometriosis can be difficult to diagnose. If you experience these symptoms, particularly severe
                  pelvic pain, consult with your healthcare provider. Treatment options include pain medication, 
                  hormone therapy, and in some cases, surgery.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-lavender" />
                  Thyroid Disorders
                </CardTitle>
                <CardDescription>
                  Can significantly impact menstrual cycles and overall reproductive health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Both hypothyroidism (underactive thyroid) and hyperthyroidism (overactive thyroid) can affect your 
                  menstrual cycle. Thyroid hormones interact with sex hormones and can cause irregular or missed periods.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Hypothyroidism Symptoms:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Heavy or longer periods</li>
                      <li>Fatigue</li>
                      <li>Weight gain</li>
                      <li>Cold intolerance</li>
                      <li>Dry skin and hair</li>
                      <li>Depression</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Hyperthyroidism Symptoms:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Light or short periods</li>
                      <li>Missed periods</li>
                      <li>Weight loss</li>
                      <li>Heat intolerance</li>
                      <li>Anxiety</li>
                      <li>Rapid heartbeat</li>
                    </ul>
                  </div>
                </div>
                
                <p>
                  If you notice changes in your menstrual cycle along with these symptoms, consider getting your 
                  thyroid function tested. Thyroid disorders are treatable with medication.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="symptoms" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-lavender" />
                  When to See a Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  While many menstrual symptoms are normal, some signs warrant medical attention. 
                  Contact your healthcare provider if you experience:
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Sudden changes in your cycle</span> - If your cycle suddenly becomes irregular when it's been regular
                  </li>
                  <li>
                    <span className="font-medium">Very heavy bleeding</span> - Soaking through a pad or tampon every hour for several consecutive hours
                  </li>
                  <li>
                    <span className="font-medium">Severe pain</span> - Pain that interferes with daily activities or isn't relieved by over-the-counter medication
                  </li>
                  <li>
                    <span className="font-medium">Bleeding between periods</span> - Spotting or bleeding outside your normal period
                  </li>
                  <li>
                    <span className="font-medium">Absence of periods</span> - No period for 90 days or more (if not pregnant, breastfeeding, or menopausal)
                  </li>
                  <li>
                    <span className="font-medium">Bleeding after menopause</span> - Any bleeding that occurs after you've gone through menopause
                  </li>
                  <li>
                    <span className="font-medium">Unusual discharge</span> - Especially if accompanied by itching, pain, or strong odor
                  </li>
                  <li>
                    <span className="font-medium">Fever with menstrual pain</span> - Could indicate infection
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-lavender" />
                  Understanding Period Blood Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  The color of your menstrual blood can provide insights into your health:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Bright Red</h4>
                    <p className="text-sm">Normal, fresh blood. Typically appears during heavy flow days.</p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Dark Red</h4>
                    <p className="text-sm">Normal, blood that has taken longer to leave the uterus.</p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Brown or Black</h4>
                    <p className="text-sm">Normal, older blood that's been in the uterus longer. Common at the beginning or end of your period.</p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Pink</h4>
                    <p className="text-sm">May indicate low estrogen levels, especially if you exercise intensely or have a low body fat percentage.</p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Orange</h4>
                    <p className="text-sm">Could indicate mixed with cervical fluid, but may also signal infection if accompanied by odor.</p>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h4 className="font-medium">Gray</h4>
                    <p className="text-sm">May indicate infection like bacterial vaginosis, especially with odor. Seek medical attention.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
