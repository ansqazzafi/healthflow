import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  // Predefined questions and answers
  private questions = [
    {"question": "What is a common cold?", "answer": "A common cold is a viral infection that affects the upper respiratory tract, causing symptoms like a runny nose, sore throat, cough, and mild fever."},
    {"question": "What are the symptoms of the flu?", "answer": "The flu typically causes fever, chills, muscle aches, fatigue, sore throat, and cough."},
    {"question": "How do I prevent the flu?", "answer": "To prevent the flu, get vaccinated, wash hands frequently, cover coughs, avoid close contact with sick individuals, and maintain a healthy lifestyle."},
    {"question": "What should I do if I have a fever?", "answer": "Rest, drink fluids, and take over-the-counter medications like acetaminophen or ibuprofen to reduce fever. If the fever is high or lasts more than 3 days, consult a doctor."},
    {"question": "What are the symptoms of a headache?", "answer": "Headache symptoms may include pain, pressure, or a dull ache in the head. It can be accompanied by nausea, sensitivity to light or sound, or dizziness."},
    {"question": "How can I relieve a headache?", "answer": "Rest, drink plenty of water, and take over-the-counter pain relievers like ibuprofen or acetaminophen. Avoid bright lights and loud noises."},
    {"question": "When should I see a doctor for a headache?", "answer": "See a doctor if your headache is severe, lasts for more than a few days, or is accompanied by symptoms like nausea, vomiting, or vision problems."},
    {"question": "What is dehydration?", "answer": "Dehydration occurs when your body loses more fluids than it takes in, leading to a lack of sufficient water to carry out normal body functions."},
    {"question": "What are the symptoms of dehydration?", "answer": "Symptoms of dehydration include dry mouth, excessive thirst, dark yellow urine, dizziness, and fatigue."},
    {"question": "How can I treat dehydration?", "answer": "Drink plenty of fluids, especially water or oral rehydration solutions, and avoid alcohol or caffeine. If symptoms are severe, seek medical attention."},
    {"question": "What is high blood pressure?", "answer": "High blood pressure (hypertension) is when the force of blood against your artery walls is too high, which can lead to heart disease and other health problems."},
    {"question": "What causes high blood pressure?", "answer": "Common causes include genetics, poor diet, lack of physical activity, obesity, smoking, excessive alcohol consumption, and stress."},
    {"question": "How can I lower my blood pressure?", "answer": "To lower blood pressure, maintain a healthy weight, eat a balanced diet, reduce salt intake, exercise regularly, and manage stress."},
    {"question": "What is diabetes?", "answer": "Diabetes is a condition where the body cannot properly process glucose (sugar), leading to high blood sugar levels."},
    {"question": "What are the symptoms of diabetes?", "answer": "Symptoms of diabetes include increased thirst, frequent urination, extreme hunger, unexplained weight loss, and blurry vision."},
    {"question": "How can I manage diabetes?", "answer": "Diabetes management includes monitoring blood sugar levels, following a healthy diet, exercising regularly, and taking prescribed medications as directed."},
    {"question": "What is a heart attack?", "answer": "A heart attack occurs when the flow of oxygen-rich blood to a part of the heart muscle is blocked, causing damage to the heart tissue."},
    {"question": "What are the signs of a heart attack?", "answer": "Signs of a heart attack include chest pain, shortness of breath, dizziness, nausea, pain in the arm or jaw, and cold sweats."},
    {"question": "How can I prevent a heart attack?", "answer": "To prevent a heart attack, maintain a healthy weight, exercise regularly, eat a balanced diet, avoid smoking, and manage stress."},
    {"question": "What is asthma?", "answer": "Asthma is a chronic condition that causes the airways in the lungs to become inflamed and narrowed, making it difficult to breathe."},
    {"question": "What are the symptoms of asthma?", "answer": "Symptoms of asthma include wheezing, shortness of breath, chest tightness, and coughing, especially at night or early in the morning."},
    {"question": "How can I manage asthma?", "answer": "Asthma can be managed with medications like inhalers and by avoiding triggers such as allergens, smoke, and pollution."},
    {"question": "What is a stroke?", "answer": "A stroke occurs when there is a blockage or rupture in a blood vessel in the brain, leading to brain cell damage."},
    {"question": "What are the symptoms of a stroke?", "answer": "Symptoms of a stroke include sudden numbness or weakness, confusion, trouble speaking, difficulty seeing, and loss of balance or coordination."},
    {"question": "What should I do if I suspect someone is having a stroke?", "answer": "Call emergency services immediately. Time is critical, and prompt treatment can reduce the effects of a stroke."},
    {"question": "What is an allergy?", "answer": "An allergy is an immune system reaction to a substance (allergen) that is typically harmless, like pollen, pet dander, or certain foods."},
    {"question": "What are the symptoms of an allergy?", "answer": "Symptoms include sneezing, runny nose, itchy eyes, rashes, and difficulty breathing, depending on the type of allergy."},
    {"question": "How can I treat an allergy?", "answer": "Treatment includes avoiding allergens, using antihistamines, and, in severe cases, carrying an epinephrine auto-injector for emergencies."},
    {"question": "What is depression?", "answer": "Depression is a mood disorder characterized by persistent feelings of sadness, hopelessness, and loss of interest in activities."},
    {"question": "What are the symptoms of depression?", "answer": "Symptoms include feeling sad or empty, loss of interest in daily activities, fatigue, changes in appetite, and difficulty concentrating."},
    {"question": "How can I manage depression?", "answer": "Treatment for depression includes therapy, medications (antidepressants), and lifestyle changes like regular exercise and a balanced diet."},
    {"question": "What is anxiety?", "answer": "Anxiety is a feeling of worry, nervousness, or unease, often about something with an uncertain outcome."},
    {"question": "What are the symptoms of anxiety?", "answer": "Symptoms include excessive worry, restlessness, difficulty concentrating, muscle tension, and physical symptoms like rapid heart rate."},
    {"question": "How can I manage anxiety?", "answer": "Managing anxiety involves relaxation techniques, deep breathing exercises, physical activity, and professional counseling or medication if needed."},
    {"question": "What is sleep apnea?", "answer": "Sleep apnea is a sleep disorder where breathing repeatedly stops and starts during sleep, leading to poor-quality rest."},
    {"question": "What are the symptoms of sleep apnea?", "answer": "Symptoms include loud snoring, choking or gasping during sleep, excessive daytime fatigue, and difficulty staying awake during the day."},
    {"question": "How can I treat sleep apnea?", "answer": "Treatment options include lifestyle changes (such as weight loss), using a CPAP machine, or surgery in severe cases."},
    {"question": "What is a sprain?", "answer": "A sprain is an injury to a ligament caused by stretching or tearing, typically occurring in the ankle, knee, or wrist."},
    {"question": "What is a strain?", "answer": "A strain is an injury to a muscle or tendon caused by overuse, overstretching, or tearing."},
    {"question": "How can I treat a sprain or strain?", "answer": "Rest the injured area, apply ice to reduce swelling, compress with a bandage, and elevate the injured limb. Seek medical attention if severe."},
    {"question": "What is the flu vaccine?", "answer": "The flu vaccine is an annual vaccination that helps protect against the seasonal flu virus, reducing the risk of illness and complications."},
    {"question": "When should I get the flu shot?", "answer": "It is recommended to get the flu shot in the fall before the flu season begins, ideally by October."},
    {"question": "What is a healthy diet?", "answer": "A healthy diet includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats, while limiting processed foods and sugar."},
    {"question": "How much water should I drink each day?", "answer": "It is recommended to drink around 8 cups (64 ounces) of water a day, but individual needs can vary based on activity level and climate."},
    {"question": "What is a balanced exercise routine?", "answer": "A balanced exercise routine includes cardiovascular activities (like walking or swimming), strength training, flexibility exercises, and rest days."},
    {"question": "What should I do if I have an allergic reaction?", "answer": "If you have a mild allergic reaction, take antihistamines. For severe reactions with difficulty breathing, seek immediate medical help."},
    {"question": "How can I improve my sleep quality?", "answer": "Improving sleep quality involves maintaining a consistent sleep schedule, avoiding caffeine before bed, creating a restful environment, and limiting screen time."},
    {"question": "What are the signs of dehydration?", "answer": "Signs of dehydration include dark yellow urine, dry mouth, dizziness, and feeling thirsty."},
    {"question": "What should I do if I have a rash?", "answer": "If the rash is mild, use over-the-counter creams. If it's severe, spreading, or accompanied by other symptoms, consult a healthcare provider."},
    {"question": "What is cholesterol?", "answer": "Cholesterol is a fatty substance in the blood that can build up in the arteries, leading to heart disease if levels are too high."},
    {"question": "How can I lower my cholesterol?", "answer": "To lower cholesterol, eat a healthy diet, exercise regularly, avoid smoking, and take prescribed medications if necessary."},
    {"question": "What is hypertension?", "answer": "Hypertension, or high blood pressure, is a condition where the force of the blood against your artery walls is too high, leading to health risks."}
  ]

  // Get 5 random questions (no IDs assigned yet)
  getRandomQuestions(count: number) {
    const shuffledQuestions = [...this.questions];
    shuffledQuestions.sort(() => 0.5 - Math.random()); // Shuffle questions randomly
    return shuffledQuestions.slice(0, count);  // Return the selected questions without IDs
  }

  // Get the answer by the question text
  getAnswerByQuestion(questionText: string) {
    const question = this.questions.find(q => q.question === questionText);
    return question ? question.answer : 'No answer found for this question';
  }
}

